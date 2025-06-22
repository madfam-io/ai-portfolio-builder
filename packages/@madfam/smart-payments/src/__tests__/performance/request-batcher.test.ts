/**
 * @madfam/smart-payments - Test Suite
 *
 * Test suite for world-class payment gateway detection and routing system
 *
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 */

/**
 * Tests for request batching optimization
 */

import {
  RequestBatcher,
  BatcherFactory,
} from '../../performance/request-batcher';

describe('RequestBatcher', () => {
  let batcher: RequestBatcher<string, string>;
  let processorMock: jest.Mock;

  beforeEach(() => {
    processorMock = jest
      .fn()
      .mockImplementation((requests: string[]) =>
        Promise.resolve(requests.map(r => `processed-${r}`))
      );

    batcher = new RequestBatcher({
      maxBatchSize: 3,
      maxWaitTime: 50,
      batchProcessor: processorMock,
    });
  });

  afterEach(() => {
    batcher.clear();
  });

  describe('Basic batching', () => {
    it('should batch requests up to maxBatchSize', async () => {
      const promises = [
        batcher.add('request1'),
        batcher.add('request2'),
        batcher.add('request3'),
      ];

      const results = await Promise.all(promises);

      expect(processorMock).toHaveBeenCalledTimes(1);
      expect(processorMock).toHaveBeenCalledWith([
        'request1',
        'request2',
        'request3',
      ]);
      expect(results).toEqual([
        'processed-request1',
        'processed-request2',
        'processed-request3',
      ]);
    });

    it('should process immediately when batch is full', async () => {
      const promise1 = batcher.add('request1');
      const promise2 = batcher.add('request2');
      const promise3 = batcher.add('request3');

      // This should trigger immediate processing
      const startTime = Date.now();
      await Promise.all([promise1, promise2, promise3]);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(40); // Should not wait for maxWaitTime
      expect(processorMock).toHaveBeenCalledTimes(1);
    });

    it('should wait for maxWaitTime if batch not full', async () => {
      const startTime = Date.now();

      const promises = [batcher.add('request1'), batcher.add('request2')];

      await Promise.all(promises);
      const duration = Date.now() - startTime;

      expect(duration).toBeGreaterThanOrEqual(50);
      expect(processorMock).toHaveBeenCalledTimes(1);
      expect(processorMock).toHaveBeenCalledWith(['request1', 'request2']);
    });

    it('should handle multiple batches', async () => {
      // First batch (full)
      const batch1 = [
        batcher.add('request1'),
        batcher.add('request2'),
        batcher.add('request3'),
      ];

      await Promise.all(batch1);

      // Second batch (partial)
      const batch2 = [batcher.add('request4'), batcher.add('request5')];

      await Promise.all(batch2);

      expect(processorMock).toHaveBeenCalledTimes(2);
      expect(processorMock).toHaveBeenNthCalledWith(1, [
        'request1',
        'request2',
        'request3',
      ]);
      expect(processorMock).toHaveBeenNthCalledWith(2, [
        'request4',
        'request5',
      ]);
    });
  });

  describe('Deduplication', () => {
    it('should deduplicate requests when enabled', async () => {
      const deduplicatingBatcher = new RequestBatcher({
        maxBatchSize: 5,
        maxWaitTime: 50,
        batchProcessor: processorMock,
        keyExtractor: (r: string) => r,
        enableDeduplication: true,
      });

      const promises = [
        deduplicatingBatcher.add('request1'),
        deduplicatingBatcher.add('request1'), // Duplicate
        deduplicatingBatcher.add('request2'),
        deduplicatingBatcher.add('request1'), // Another duplicate
        deduplicatingBatcher.add('request3'),
      ];

      const results = await Promise.all(promises);

      expect(processorMock).toHaveBeenCalledTimes(1);
      expect(processorMock).toHaveBeenCalledWith([
        'request1',
        'request2',
        'request3',
      ]);

      // All duplicates should get the same result
      expect(results[0]).toBe('processed-request1');
      expect(results[1]).toBe('processed-request1');
      expect(results[3]).toBe('processed-request1');
    });

    it('should use custom key extractor', async () => {
      interface ComplexRequest {
        id: string;
        data: any;
      }

      const complexProcessor = jest
        .fn()
        .mockImplementation((requests: ComplexRequest[]) =>
          Promise.resolve(
            requests.map(r => ({ id: r.id, result: 'processed' }))
          )
        );

      const complexBatcher = new RequestBatcher<ComplexRequest, any>({
        maxBatchSize: 3,
        maxWaitTime: 50,
        batchProcessor: complexProcessor,
        keyExtractor: (r: ComplexRequest) => r.id,
        enableDeduplication: true,
      });

      const promises = [
        complexBatcher.add({ id: '1', data: 'a' }),
        complexBatcher.add({ id: '1', data: 'b' }), // Same ID, different data
        complexBatcher.add({ id: '2', data: 'c' }),
      ];

      await Promise.all(promises);

      expect(complexProcessor).toHaveBeenCalledWith([
        { id: '1', data: 'a' },
        { id: '2', data: 'c' },
      ]);
    });
  });

  describe('Error handling', () => {
    it('should reject all promises in batch on error', async () => {
      const errorBatcher = new RequestBatcher({
        maxBatchSize: 3,
        maxWaitTime: 50,
        batchProcessor: jest.fn().mockRejectedValue(new Error('Batch failed')),
      });

      const promises = [
        errorBatcher.add('request1'),
        errorBatcher.add('request2'),
        errorBatcher.add('request3'),
      ];

      await expect(Promise.all(promises)).rejects.toThrow('Batch failed');
    });

    it('should handle partial batch errors independently', async () => {
      let callCount = 0;
      const partialErrorProcessor = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('First batch failed'));
        }
        return Promise.resolve(['success']);
      });

      const errorBatcher = new RequestBatcher({
        maxBatchSize: 1,
        maxWaitTime: 10,
        batchProcessor: partialErrorProcessor,
      });

      const promise1 = errorBatcher.add('request1');
      const promise2 = errorBatcher.add('request2');

      await expect(promise1).rejects.toThrow('First batch failed');
      await expect(promise2).resolves.toBe('success');
    });
  });

  describe('Flush and clear', () => {
    it('should flush all pending requests', async () => {
      const promises = [];

      // Add requests without waiting
      for (let i = 0; i < 7; i++) {
        promises.push(batcher.add(`request${i}`));
      }

      // Flush immediately
      await batcher.flush();

      const results = await Promise.all(promises);
      expect(results).toHaveLength(7);
      expect(processorMock).toHaveBeenCalledTimes(3); // 3 + 3 + 1
    });

    it('should clear pending requests with error', async () => {
      const promise1 = batcher.add('request1');
      const promise2 = batcher.add('request2');

      batcher.clear();

      await expect(promise1).rejects.toThrow('Batcher cleared');
      await expect(promise2).rejects.toThrow('Batcher cleared');
      expect(processorMock).not.toHaveBeenCalled();
    });

    it('should report queue size', () => {
      expect(batcher.getQueueSize()).toBe(0);

      batcher.add('request1');
      batcher.add('request2');

      expect(batcher.getQueueSize()).toBe(2);
    });
  });
});

describe('BatcherFactory', () => {
  describe('BIN batcher', () => {
    it('should create BIN batcher with proper config', async () => {
      const binLookup = jest
        .fn()
        .mockImplementation((bins: string[]) =>
          Promise.resolve(bins.map(bin => ({ bin, country: 'US' })))
        );

      const binBatcher = BatcherFactory.createBINBatcher(binLookup);

      const results = await Promise.all([
        binBatcher.add('411111'),
        binBatcher.add('411111'), // Duplicate
        binBatcher.add('555555'),
      ]);

      expect(binLookup).toHaveBeenCalledTimes(1);
      expect(binLookup).toHaveBeenCalledWith(['411111', '555555']);
      expect(results[0]).toEqual({ bin: '411111', country: 'US' });
      expect(results[1]).toEqual({ bin: '411111', country: 'US' }); // Same result
    });
  });

  describe('Geo batcher', () => {
    it('should create geo batcher with proper config', async () => {
      const geoLookup = jest
        .fn()
        .mockImplementation((ips: string[]) =>
          Promise.resolve(ips.map(ip => ({ ip, country: 'US' })))
        );

      const geoBatcher = BatcherFactory.createGeoBatcher(geoLookup);

      const results = await Promise.all([
        geoBatcher.add('8.8.8.8'),
        geoBatcher.add('1.1.1.1'),
        geoBatcher.add('8.8.8.8'), // Duplicate
      ]);

      expect(geoLookup).toHaveBeenCalledTimes(1);
      expect(geoLookup).toHaveBeenCalledWith(['8.8.8.8', '1.1.1.1']);
      expect(results).toHaveLength(3);
    });
  });

  describe('API batcher', () => {
    it('should create API batcher with fetch', async () => {
      // Mock fetch
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            { id: 1, processed: true },
            { id: 2, processed: true },
          ],
        }),
      });

      const apiBatcher = BatcherFactory.createAPIBatcher<any, any>({
        endpoint: 'https://api.example.com/batch',
        maxBatchSize: 10,
        maxWaitTime: 100,
        headers: { 'X-API-Key': 'test' },
      });

      const results = await Promise.all([
        apiBatcher.add({ id: 1 }),
        apiBatcher.add({ id: 2 }),
      ]);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/batch',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-Key': 'test',
          }),
          body: JSON.stringify({
            batch: [{ id: 1 }, { id: 2 }],
          }),
        })
      );

      expect(results).toEqual([
        { id: 1, processed: true },
        { id: 2, processed: true },
      ]);
    });

    it('should handle API errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      const apiBatcher = BatcherFactory.createAPIBatcher({
        endpoint: 'https://api.example.com/batch',
      });

      await expect(apiBatcher.add({ test: 'data' })).rejects.toThrow(
        'Batch API error: Internal Server Error'
      );
    });
  });
});
