/**
 * @madfam/logger
 *
 * Core logger implementation
 */

import type {
  Logger as ILogger,
  LoggerConfig,
  LogEntry,
  LogLevel,
  Timer,
  Transport,
  TransportConfig,
  LogLevelValue,
} from '../types';
import { ConsoleTransport } from '../transports/console';
import { createTransport } from '../transports/factory';
import { redactData } from '../utils/redact';
// import { getTimestamp } from '../utils/time';

const LOG_LEVELS: LogLevelValue = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5,
};

export class Logger<TEvents extends Record<string, any> = Record<string, any>>
  implements ILogger<TEvents>
{
  private config: LoggerConfig;
  private transports: Transport[] = [];
  private context: Record<string, any> = {};
  private levelValue: number;

  constructor(config: LoggerConfig) {
    this.config = config;
    this.levelValue = LOG_LEVELS[config.level || 'info'];

    // Initialize context with default fields
    if (config.defaultFields) {
      this.context = { ...config.defaultFields };
    }

    // Add system info if requested
    if (config.processInfo && typeof process !== 'undefined') {
      this.context.pid = process.pid;
      this.context.hostname = process.env.HOSTNAME;
    }

    // Initialize transports
    if (config.transports && config.transports.length > 0) {
      config.transports.forEach(transport => {
        if ('log' in transport) {
          this.transports.push(transport as Transport);
        } else {
          this.transports.push(createTransport(transport as TransportConfig));
        }
      });
    } else {
      // Default to console transport
      this.transports.push(
        new ConsoleTransport({
          type: 'console',
          pretty: config.pretty,
        })
      );
    }
  }

  // Basic logging methods
  trace(message: string, data?: any): void {
    this.log('trace', message, data);
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void;
  info<K extends keyof TEvents>(event: K, data: TEvents[K]): void;
  info(messageOrEvent: string | keyof TEvents, data?: any): void {
    this.log('info', messageOrEvent as string, data);
  }

  warn(message: string, data?: any): void;
  warn<K extends keyof TEvents>(event: K, data: TEvents[K]): void;
  warn(messageOrEvent: string | keyof TEvents, data?: any): void {
    this.log('warn', messageOrEvent as string, data);
  }

  error(message: string, error?: Error | any, data?: any): void;
  error<K extends keyof TEvents>(
    event: K,
    error: Error,
    data: TEvents[K]
  ): void;
  error(
    messageOrEvent: string | keyof TEvents,
    errorOrData?: Error | any,
    additionalData?: any
  ): void {
    let message = messageOrEvent as string;
    let error: Error | undefined;
    let data: any;

    // Handle overloaded parameters
    if (errorOrData instanceof Error) {
      error = errorOrData;
      data = additionalData;
    } else {
      data = errorOrData;
    }

    this.log('error', message, data, error);
  }

  fatal(message: string, error?: Error | any, data?: any): void {
    let actualError: Error | undefined;
    let actualData: any;

    if (error instanceof Error) {
      actualError = error;
      actualData = data;
    } else {
      actualData = error;
    }

    this.log('fatal', message, actualData, actualError);
  }

  // Create child logger with additional context
  child(context: Record<string, any>): Logger<TEvents> {
    const childConfig = {
      ...this.config,
      defaultFields: {
        ...this.context,
        ...context,
      },
    };

    const childLogger = new Logger<TEvents>(childConfig);
    childLogger.transports = this.transports; // Share transports

    return childLogger;
  }

  // Start a timer
  startTimer(): Timer {
    const start = Date.now();

    return {
      done: (message: string, data?: any) => {
        const duration = Date.now() - start;
        this.info(message, { ...data, duration });
      },
      elapsed: () => Date.now() - start,
    };
  }

  // Transport management
  addTransport(transport: Transport | TransportConfig): void {
    if ('log' in transport) {
      this.transports.push(transport as Transport);
    } else {
      this.transports.push(createTransport(transport as TransportConfig));
    }
  }

  removeTransport(name: string): void {
    this.transports = this.transports.filter(t => t.name !== name);
  }

  // Flush all transports
  async flush(): Promise<void> {
    await Promise.all(
      this.transports.map(transport =>
        transport.flush ? transport.flush() : Promise.resolve()
      )
    );
  }

  // Close logger
  async close(): Promise<void> {
    await this.flush();
    await Promise.all(
      this.transports.map(transport =>
        transport.close ? transport.close() : Promise.resolve()
      )
    );
  }

  // Main logging method
  private log(
    level: LogLevel,
    message: string,
    data?: any,
    error?: Error
  ): void {
    // Check if level is enabled
    if (LOG_LEVELS[level] < this.levelValue) {
      return;
    }

    // Create log entry
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      service: this.config.service,
      message,
      context: this.context,
    };

    // Add data if provided
    if (data) {
      // Apply redaction if configured
      if (this.config.redact || this.config.redactPaths) {
        entry.data = redactData(
          data,
          this.config.redact,
          this.config.redactPaths
        );
      } else {
        entry.data = data;
      }
    }

    // Add error if provided
    if (error) {
      entry.error = error;

      // Extract error details
      if (!entry.data) {
        entry.data = {};
      }
      entry.data.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...(error as any), // Include any custom error properties
      };
    }

    // Send to all transports
    this.transports.forEach(transport => {
      try {
        // Check transport level
        const transportLevel = transport.level || this.config.level || 'info';
        if (LOG_LEVELS[level] >= LOG_LEVELS[transportLevel]) {
          transport.log(entry);
        }
      } catch (err) {
        // Avoid infinite loop - log transport errors to console
        // eslint-disable-next-line no-console
        console.error('Logger transport error:', err);
      }
    });
  }
}
