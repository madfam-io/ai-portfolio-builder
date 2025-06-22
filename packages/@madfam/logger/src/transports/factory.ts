/**
 * @madfam/logger
 * 
 * Transport factory
 */

import type { Transport, TransportConfig } from '../types';
import { ConsoleTransport } from './console';
import { FileTransport } from './file';
import { HttpTransport } from './http';

export function createTransport(config: TransportConfig): Transport {
  switch (config.type) {
    case 'console':
      return new ConsoleTransport(config);
    case 'file':
      return new FileTransport(config as any);
    case 'http':
      return new HttpTransport(config as any);
    default:
      throw new Error(`Unknown transport type: ${config.type}`);
  }
}