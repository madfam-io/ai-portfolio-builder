/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { Pool, type PoolClient } from 'pg';

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
  idleTimeoutMs: number;
  connectionTimeoutMs: number;
}

class RailwayDatabase {
  private pool: Pool;

  constructor() {
    // Parse Railway DATABASE_URL or use individual env vars
    const databaseUrl =
      process.env.RAILWAY_DATABASE_URL || process.env.DATABASE_URL;

    if (databaseUrl) {
      this.pool = new Pool({
        connectionString: databaseUrl,
        ssl:
          process.env.NODE_ENV === 'production'
            ? { rejectUnauthorized: false }
            : false,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // 30 seconds
        connectionTimeoutMillis: 10000, // 10 seconds
      });
    } else {
      const config = {
        host:
          process.env.RAILWAY_DATABASE_HOST ||
          process.env.POSTGRES_HOST ||
          'localhost',
        port: parseInt(
          process.env.RAILWAY_DATABASE_PORT ||
            process.env.POSTGRES_PORT ||
            '5432'
        ),
        database:
          process.env.RAILWAY_DATABASE_NAME ||
          process.env.POSTGRES_DATABASE ||
          'portfolio_builder',
        user:
          process.env.RAILWAY_DATABASE_USER ||
          process.env.POSTGRES_USER ||
          'postgres',
        password:
          process.env.RAILWAY_DATABASE_PASSWORD ||
          process.env.POSTGRES_PASSWORD ||
          '',
        ssl: process.env.NODE_ENV === 'production',
        maxConnections: 20,
        idleTimeoutMs: 30000,
        connectionTimeoutMs: 10000,
      };

      this.pool = new Pool({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password,
        ssl: config.ssl ? { rejectUnauthorized: false } : false,
        max: config.maxConnections,
        idleTimeoutMillis: config.idleTimeoutMs,
        connectionTimeoutMillis: config.connectionTimeoutMs,
      });
    }

    // Handle pool events
    this.pool.on('error', err => {
      console.error('Unexpected error on idle client', err);
    });

    this.pool.on('connect', client => {
      console.log('New client connected to Railway database');
    });

    this.pool.on('remove', client => {
      console.log('Client removed from pool');
    });
  }

  /**
   * Execute a query with automatic connection management
   */
  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const client = await this.pool.connect();

    try {
      const start = Date.now();
      const result = await client.query(text, params);
      const duration = Date.now() - start;

      console.log('Executed query', {
        text: text.substring(0, 100),
        duration,
        rows: result.rowCount,
      });

      return result.rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute a query and return the first row
   */
  async queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows[0] || null;
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get a client for manual connection management
   */
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Check database connection health
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    latency: number;
    connections: number;
  }> {
    try {
      const start = Date.now();
      await this.query('SELECT 1');
      const latency = Date.now() - start;

      const stats = await this.query(`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `);

      return {
        healthy: true,
        latency,
        connections: stats[0]?.total_connections || 0,
      };
    } catch (error) {
      console.error('Database health check failed:', error);
      return {
        healthy: false,
        latency: -1,
        connections: 0,
      };
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    totalSize: string;
    activeConnections: number;
    maxConnections: number;
    version: string;
  }> {
    try {
      const [sizeResult, connectionsResult, versionResult] = await Promise.all([
        this.queryOne(`
          SELECT pg_size_pretty(pg_database_size(current_database())) as size
        `),
        this.queryOne(`
          SELECT 
            count(*) as active,
            setting::int as max_connections
          FROM pg_stat_activity 
          CROSS JOIN pg_settings 
          WHERE pg_settings.name = 'max_connections'
          AND datname = current_database()
        `),
        this.queryOne('SELECT version()'),
      ]);

      return {
        totalSize: sizeResult?.size || '0 bytes',
        activeConnections: connectionsResult?.active || 0,
        maxConnections: connectionsResult?.max_connections || 0,
        version: versionResult?.version || 'Unknown',
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }

  /**
   * Run database migrations (simple version)
   */
  async migrate(): Promise<void> {
    try {
      console.log('Running database migrations...');

      // Create migrations table if it doesn't exist
      await this.query(`
        CREATE TABLE IF NOT EXISTS _migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT NOW()
        )
      `);

      console.log('Migration tracking table ready');

      // Add your migration logic here
      // This is a simplified version - in production, you'd want a proper migration system
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Portfolio-specific database methods
   */

  async getPortfolio(id: string) {
    return this.queryOne(
      `
      SELECT p.*, u.name as user_name, u.email as user_email
      FROM portfolios p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1 AND p.deleted_at IS NULL
    `,
      [id]
    );
  }

  async getUserPortfolios(userId: string) {
    return this.query(
      `
      SELECT id, title, status, subdomain, created_at, updated_at
      FROM portfolios
      WHERE user_id = $1 AND deleted_at IS NULL
      ORDER BY updated_at DESC
    `,
      [userId]
    );
  }

  async createPortfolio(data: {
    userId: string;
    title: string;
    status: string;
    subdomain?: string;
  }) {
    return this.queryOne(
      `
      INSERT INTO portfolios (user_id, title, status, subdomain, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `,
      [data.userId, data.title, data.status, data.subdomain]
    );
  }

  async updatePortfolio(
    id: string,
    data: Partial<{
      title: string;
      status: string;
      subdomain: string;
      content: any;
    }>
  ) {
    const fields = Object.keys(data)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const values = [id, ...Object.values(data)];

    return this.queryOne(
      `
      UPDATE portfolios 
      SET ${fields}, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `,
      values
    );
  }

  async deletePortfolio(id: string) {
    return this.queryOne(
      `
      UPDATE portfolios 
      SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id
    `,
      [id]
    );
  }
}

// Export singleton instance
export const railwayDb = new RailwayDatabase();

// Export class for testing
export { RailwayDatabase };
