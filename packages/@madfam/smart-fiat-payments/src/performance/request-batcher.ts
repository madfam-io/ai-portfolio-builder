/**
 * @madfam/smart-fiat-payments
 *
 * World-class payment gateway detection and routing system with AI-powered optimization
 *
 * @version 1.0.0
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 *
 * This software is licensed under the MADFAM Code Available License (MCAL) v1.0.
 * You may use this software for personal, educational, and internal business purposes.
 * Commercial use, redistribution, and modification require explicit permission.
 *
 * For commercial licensing inquiries: licensing@madfam.io
 * For the full license text: https://madfam.com/licenses/mcal-1.0
 */

/**
 * Request batching system for optimal API calls
 * Reduces network overhead by combining multiple requests
 */

interface BatchRequest<T> {
  key: string;
  request: T;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

interface BatcherConfig {
  maxBatchSize: number;
  maxWaitTime: number; // milliseconds
  batchProcessor: (requests: any[]) => Promise<any[]>;
  keyExtractor?: (request: any) => string;
  enableDeduplication?: boolean;
}

export class RequestBatcher<TRequest = any, TResponse = any> {
  private queue: BatchRequest<TRequest>[] = [];
  private timer: NodeJS.Timeout | null = null;
  private processing = false;
  private duplicateMap = new Map<string, BatchRequest<TRequest>[]>();

  constructor(private config: BatcherConfig) {}

  /**
   * Add request to batch
   */
  async add(request: TRequest): Promise<TResponse> {
    return new Promise((resolve, reject) => {
      const key = this.config.keyExtractor
        ? this.config.keyExtractor(request)
        : JSON.stringify(request);

      const batchRequest: BatchRequest<TRequest> = {
        key,
        request,
        resolve,
        reject,
        timestamp: Date.now(),
      };

      // Handle deduplication
      if (this.config.enableDeduplication) {
        const existing = this.duplicateMap.get(key);
        if (existing) {
          existing.push(batchRequest);
          return;
        }
        this.duplicateMap.set(key, [batchRequest]);
      }

      this.queue.push(batchRequest);

      // Start timer if not already running
      if (!this.timer && !this.processing) {
        this.timer = setTimeout(
          () => this.processBatch(),
          this.config.maxWaitTime
        );
      }

      // Process immediately if batch is full
      if (this.queue.length >= this.config.maxBatchSize && !this.processing) {
        this.processBatch();
      }
    });
  }

  /**
   * Process current batch
   */
  private async processBatch(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    // Clear timer
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.processing = true;

    // Extract batch
    const batch = this.queue.splice(0, this.config.maxBatchSize);
    const uniqueBatch = this.config.enableDeduplication
      ? this.deduplicateBatch(batch)
      : batch;

    try {
      // Process batch
      const requests = uniqueBatch.map(item => item.request);
      const responses = await this.config.batchProcessor(requests);

      // Resolve promises
      uniqueBatch.forEach((item, index) => {
        const response = responses?.[index];

        if (this.config.enableDeduplication) {
          const duplicates = this.duplicateMap.get(item.key) || [];
          duplicates.forEach(dup => dup.resolve(response));
          this.duplicateMap.delete(item.key);
        } else {
          item.resolve(response);
        }
      });
    } catch (error) {
      // Reject all promises in batch
      batch.forEach(item => {
        if (this.config.enableDeduplication) {
          const duplicates = this.duplicateMap.get(item.key) || [];
          duplicates.forEach(dup => dup.reject(error));
          this.duplicateMap.delete(item.key);
        } else {
          item.reject(error);
        }
      });
    } finally {
      this.processing = false;

      // Schedule next batch if queue not empty
      if (this.queue.length > 0) {
        this.timer = setTimeout(
          () => this.processBatch(),
          this.config.maxWaitTime
        );
      }
    }
  }

  /**
   * Remove duplicate requests from batch
   */
  private deduplicateBatch(
    batch: BatchRequest<TRequest>[]
  ): BatchRequest<TRequest>[] {
    const seen = new Set<string>();
    return batch.filter(item => {
      if (seen.has(item.key)) {
        return false;
      }
      seen.add(item.key);
      return true;
    });
  }

  /**
   * Flush all pending requests
   */
  async flush(): Promise<void> {
    while (this.queue.length > 0 || this.processing) {
      if (!this.processing) {
        await this.processBatch();
      } else {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.queue.forEach(item => {
      item.reject(new Error('Batcher cleared'));
    });

    this.queue = [];
    this.duplicateMap.clear();
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }
}

/**
 * Create specialized batchers for different use cases
 */
export class BatcherFactory {
  /**
   * Create BIN lookup batcher
   */
  static createBINBatcher(
    lookupFn: (bins: string[]) => Promise<any[]>
  ): RequestBatcher<string, any> {
    return new RequestBatcher({
      maxBatchSize: 100,
      maxWaitTime: 50,
      batchProcessor: lookupFn,
      keyExtractor: (bin: string) => bin,
      enableDeduplication: true,
    });
  }

  /**
   * Create geo lookup batcher
   */
  static createGeoBatcher(
    lookupFn: (ips: string[]) => Promise<any[]>
  ): RequestBatcher<string, any> {
    return new RequestBatcher({
      maxBatchSize: 50,
      maxWaitTime: 100,
      batchProcessor: lookupFn,
      keyExtractor: (ip: string) => ip,
      enableDeduplication: true,
    });
  }

  /**
   * Create generic API batcher
   */
  static createAPIBatcher<T, R>(config: {
    endpoint: string;
    maxBatchSize?: number;
    maxWaitTime?: number;
    headers?: Record<string, string>;
  }): RequestBatcher<T, R> {
    return new RequestBatcher({
      maxBatchSize: config.maxBatchSize || 25,
      maxWaitTime: config.maxWaitTime || 100,
      batchProcessor: async (requests: T[]) => {
        const response = await fetch(config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...config.headers,
          },
          body: JSON.stringify({ batch: requests }),
        });

        if (!response.ok) {
          throw new Error(`Batch API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.results;
      },
    });
  }
}
