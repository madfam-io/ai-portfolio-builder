/**
 * Simple logger utility
 */
declare class Logger {
    private context;
    constructor(context: string);
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
}

export { Logger };
