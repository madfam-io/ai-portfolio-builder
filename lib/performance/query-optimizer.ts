import { logger } from '@/lib/utils/logger';

/**
 * Database Query Optimizer
 * Provides utilities for optimizing database queries and preventing N+1 problems
 */

export interface QueryOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  include?: string[];
  select?: string[];
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Default query limits to prevent unbounded queries
 */
export const QUERY_LIMITS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

/**
 * Build pagination parameters for database queries
 */
export function buildPaginationParams(options: QueryOptions = {}) {
  const page = Math.max(1, options.page || QUERY_LIMITS.DEFAULT_PAGE);
  const limit = Math.min(
    options.limit || QUERY_LIMITS.DEFAULT_PAGE_SIZE,
    QUERY_LIMITS.MAX_PAGE_SIZE
  );
  
  const offset = (page - 1) * limit;
  
  return {
    page,
    limit,
    offset,
    from: offset,
    to: offset + limit - 1,
  };
}

/**
 * Create pagination response metadata
 */
export function createPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationResult<any>['pagination'] {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Optimize SELECT fields to reduce data transfer
 */
export function optimizeSelectFields(
  requestedFields?: string[],
  allowedFields?: string[]
): string {
  if (!requestedFields || requestedFields.length === 0) {
    return '*';
  }
  
  // If allowed fields are specified, filter requested fields
  if (allowedFields) {
    const validFields = requestedFields.filter(field => 
      allowedFields.includes(field)
    );
    
    if (validFields.length === 0) {
      logger.warn('No valid fields requested, returning default set', {
        requested: requestedFields,
        allowed: allowedFields,
      });
      return allowedFields.join(',');
    }
    
    return validFields.join(',');
  }
  
  return requestedFields.join(',');
}

/**
 * Build optimized query with relations to avoid N+1 queries
 */
export function buildOptimizedQuery(
  baseTable: string,
  options: QueryOptions & { 
    joins?: Array<{ table: string; on: string; type?: 'inner' | 'left' }> 
  } = {}
): {
  select: string;
  from: string;
  orderBy: string;
  limit: string;
  joins: string;
} {
  const { limit, offset } = buildPaginationParams(options);
  
  // Build SELECT clause
  const selectClause = options.select 
    ? `SELECT ${optimizeSelectFields(options.select)}`
    : 'SELECT *';
    
  // Build FROM clause
  const fromClause = `FROM ${baseTable}`;
  
  // Build JOIN clauses
  const joinClauses = options.joins
    ? options.joins
        .map(join => `${join.type?.toUpperCase() || 'LEFT'} JOIN ${join.table} ON ${join.on}`)
        .join(' ')
    : '';
    
  // Build ORDER BY clause
  const orderByClause = options.orderBy
    ? `ORDER BY ${options.orderBy} ${options.orderDirection || 'asc'}`
    : '';
    
  // Build LIMIT clause
  const limitClause = `LIMIT ${limit} OFFSET ${offset}`;
  
  return {
    select: selectClause,
    from: fromClause,
    joins: joinClauses,
    orderBy: orderByClause,
    limit: limitClause,
  };
}

/**
 * Cache key generator for query results
 */
export function generateQueryCacheKey(
  table: string,
  options: QueryOptions,
  userId?: string
): string {
  const parts = [
    'query',
    table,
    userId || 'public',
    `p${options.page || 1}`,
    `l${options.limit || QUERY_LIMITS.DEFAULT_PAGE_SIZE}`,
  ];
  
  if (options.orderBy) {
    parts.push(`o${options.orderBy}_${options.orderDirection || 'asc'}`);
  }
  
  if (options.select) {
    parts.push(`s${options.select.sort().join('_')}`);
  }
  
  return parts.join(':');
}

/**
 * Batch loader to prevent N+1 queries
 */
export class BatchLoader<K, V> {
  private batch: Map<K, Array<(value: V | null) => void>> = new Map();
  private scheduled = false;
  
  constructor(
    private loader: (keys: K[]) => Promise<Map<K, V>>,
    private options: { maxBatchSize?: number; delay?: number } = {}
  ) {}
  
  async load(key: K): Promise<V | null> {
    return new Promise((resolve) => {
      // Add to batch
      const callbacks = this.batch.get(key) || [];
      callbacks.push(resolve);
      this.batch.set(key, callbacks);
      
      // Schedule batch execution
      if (!this.scheduled) {
        this.scheduled = true;
        setTimeout(() => this.executeBatch(), this.options.delay || 0);
      }
    });
  }
  
  private async executeBatch() {
    const currentBatch = this.batch;
    this.batch = new Map();
    this.scheduled = false;
    
    if (currentBatch.size === 0) return;
    
    try {
      const keys = Array.from(currentBatch.keys());
      const results = await this.loader(keys);
      
      // Resolve all callbacks
      currentBatch.forEach((callbacks, key) => {
        const value = results.get(key) || null;
        callbacks.forEach(callback => callback(value));
      });
    } catch (error) {
      // Reject all callbacks
      currentBatch.forEach((callbacks) => {
        callbacks.forEach(callback => callback(null));
      });
      
      logger.error('Batch loader error', error as Error);
    }
  }
}