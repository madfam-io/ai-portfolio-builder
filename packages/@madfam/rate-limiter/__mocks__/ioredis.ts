/**
 * MIT License
 *
 * Copyright (c) 2024 MADFAM LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
