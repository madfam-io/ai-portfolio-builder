/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * Base Service Class
 *
 * Provides common patterns and utilities for all service classes.
 * Implements error handling, logging, and common CRUD operations.
 *
 * @module lib/services/base
 */

import { logger } from '@/lib/utils/logger';

/**
 * Base repository interface that all repositories should implement
 */
export interface BaseRepository<T> {
  findAll(options?: QueryOptions): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

/**
 * Common query options
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

/**
 * Service error class for consistent error handling
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

/**
 * Abstract base service class
 *
 * @template T The entity type this service manages
 */
export abstract class BaseService<T extends { id: string }> {
  protected abstract serviceName: string;

  /**
   * Get the repository instance for this service
   */
  protected abstract getRepository(): BaseRepository<T>;

  /**
   * Find all entities with optional filtering
   */
  async findAll(options?: QueryOptions): Promise<T[]> {
    try {
      logger.info(`${this.serviceName}.findAll`, { options });

      const items = await this.getRepository().findAll(options);

      logger.info(`${this.serviceName}.findAll completed`, {
        count: items.length,
      });

      return items;
    } catch (error) {
      throw this.handleError('findAll', error);
    }
  }

  /**
   * Find entity by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      logger.info(`${this.serviceName}.findById`, { id });

      if (!this.isValidId(id)) {
        throw new ServiceError('Invalid ID format', 'INVALID_ID', 400, { id });
      }

      const item = await this.getRepository().findById(id);

      if (!item) {
        logger.warn(`${this.serviceName}.findById: Not found`, { id });
      }

      return item;
    } catch (error) {
      throw this.handleError('findById', error);
    }
  }

  /**
   * Create new entity
   */
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      logger.info(`${this.serviceName}.create`, { data });

      // Validate data before creation
      await this.validateCreate(data);

      const created = await this.getRepository().create(data);

      logger.info(`${this.serviceName}.create completed`, {
        id: created.id,
      });

      return created;
    } catch (error) {
      throw this.handleError('create', error);
    }
  }

  /**
   * Update existing entity
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      logger.info(`${this.serviceName}.update`, { id, data });

      if (!this.isValidId(id)) {
        throw new ServiceError('Invalid ID format', 'INVALID_ID', 400, { id });
      }

      // Validate data before update
      await this.validateUpdate(id, data);

      const updated = await this.getRepository().update(id, data);

      if (!updated) {
        logger.warn(`${this.serviceName}.update: Not found`, { id });
      }

      return updated;
    } catch (error) {
      throw this.handleError('update', error);
    }
  }

  /**
   * Delete entity
   */
  async delete(id: string): Promise<boolean> {
    try {
      logger.info(`${this.serviceName}.delete`, { id });

      if (!this.isValidId(id)) {
        throw new ServiceError('Invalid ID format', 'INVALID_ID', 400, { id });
      }

      // Check if deletion is allowed
      await this.validateDelete(id);

      const deleted = await this.getRepository().delete(id);

      logger.info(`${this.serviceName}.delete completed`, {
        id,
        success: deleted,
      });

      return deleted;
    } catch (error) {
      throw this.handleError('delete', error);
    }
  }

  /**
   * Validate ID format
   * Override for custom ID validation
   */
  protected isValidId(id: string): boolean {
    // UUID v4 validation by default
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  /**
   * Validate data before creation
   * Override for custom validation
   */
  protected async validateCreate(
    _data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    // Override in subclasses for custom validation
  }

  /**
   * Validate data before update
   * Override for custom validation
   */
  protected async validateUpdate(
    _id: string,
    _data: Partial<T>
  ): Promise<void> {
    // Override in subclasses for custom validation
  }

  /**
   * Validate before deletion
   * Override for custom validation
   */
  protected async validateDelete(_id: string): Promise<void> {
    // Override in subclasses for custom validation
  }

  /**
   * Handle errors consistently
   */
  protected handleError(operation: string, error: unknown): ServiceError {
    const context = {
      service: this.serviceName,
      operation,
    };

    // If already a ServiceError, just log and rethrow
    if (error instanceof ServiceError) {
      logger.error('Service error', { ...context, error });
      return error;
    }

    // Log the error
    logger.error('Unexpected service error', { ...context, error });

    // Convert to ServiceError
    if (error instanceof Error) {
      return new ServiceError(
        `${this.serviceName} ${operation} failed: ${error.message}`,
        'SERVICE_ERROR',
        500,
        { originalError: error.message }
      );
    }

    return new ServiceError(
      `${this.serviceName} ${operation} failed`,
      'UNKNOWN_ERROR',
      500,
      { error }
    );
  }

  /**
   * Batch operations for performance
   */
  async findByIds(ids: string[]): Promise<Map<string, T>> {
    try {
      logger.info(`${this.serviceName}.findByIds`, {
        count: ids.length,
      });

      // Remove duplicates and validate IDs
      const uniqueIds = [...new Set(ids)].filter(id => this.isValidId(id));

      if (uniqueIds.length === 0) {
        return new Map();
      }

      // Batch fetch from repository
      const items = await this.batchFetch(uniqueIds);

      // Convert to Map for O(1) lookup
      const itemMap = new Map(items.map(item => [item.id, item]));

      logger.info(`${this.serviceName}.findByIds completed`, {
        requested: ids.length,
        found: itemMap.size,
      });

      return itemMap;
    } catch (error) {
      throw this.handleError('findByIds', error);
    }
  }

  /**
   * Override for custom batch fetching
   */
  protected async batchFetch(ids: string[]): Promise<T[]> {
    // Default implementation: fetch one by one
    // Override for optimized batch fetching
    const items: T[] = [];

    for (const id of ids) {
      const item = await this.getRepository().findById(id);
      if (item) {
        items.push(item);
      }
    }

    return items;
  }
}
