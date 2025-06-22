/**
 * @madfam/experiments
 *
 * Simple event emitter for internal use
 */

type EventHandler = (...args: any[]) => void | Promise<void>;

export class EventEmitter {
  private events: Map<string, EventHandler[]> = new Map();

  on(event: string, handler: EventHandler): void {
    const handlers = this.events.get(event) || [];
    handlers.push(handler);
    this.events.set(event, handlers);
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.events.get(event);
    if (!handlers) return;

    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }

    if (handlers.length === 0) {
      this.events.delete(event);
    }
  }

  once(event: string, handler: EventHandler): void {
    const wrappedHandler = async (...args: any[]) => {
      await handler(...args);
      this.off(event, wrappedHandler);
    };
    this.on(event, wrappedHandler);
  }

  async emit(event: string, ...args: any[]): Promise<void> {
    const handlers = this.events.get(event);
    if (!handlers) return;

    await Promise.all(
      handlers.map(async handler => {
        try {
          await handler(...args);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Error in event handler for ${event}:`, error);
        }
      })
    );
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  listenerCount(event: string): number {
    const handlers = this.events.get(event);
    return handlers ? handlers.length : 0;
  }

  eventNames(): string[] {
    return Array.from(this.events.keys());
  }
}
