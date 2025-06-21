/**
 * Mock IORedis for testing
 */

class MockRedis {
  constructor(_options?: Record<string, unknown>) {
    // Mock constructor
  }

  get = jest.fn().mockResolvedValue(null);
  set = jest.fn().mockResolvedValue('OK');
  del = jest.fn().mockResolvedValue(1);
  exists = jest.fn().mockResolvedValue(0);
  expire = jest.fn().mockResolvedValue(1);
  incr = jest.fn().mockResolvedValue(1);
  decr = jest.fn().mockResolvedValue(0);
  hget = jest.fn().mockResolvedValue(null);
  hset = jest.fn().mockResolvedValue(1);
  hdel = jest.fn().mockResolvedValue(1);
  keys = jest.fn().mockResolvedValue([]);
  flushdb = jest.fn().mockResolvedValue('OK');
  ping = jest.fn().mockResolvedValue('PONG');
  quit = jest.fn().mockResolvedValue('OK');
  disconnect = jest.fn().mockResolvedValue(undefined);
  on = jest.fn();
  once = jest.fn();
  emit = jest.fn();
  removeListener = jest.fn();
  status = 'ready';
}

export default MockRedis;
export { MockRedis as Redis };
