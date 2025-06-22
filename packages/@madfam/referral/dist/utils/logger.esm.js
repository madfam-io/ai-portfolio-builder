class Logger {
  constructor(context) {
    this.context = context;
  }
  info(message, meta) {
    console.log(`[${this.context}] ${message}`, meta || "");
  }
  warn(message, meta) {
    console.warn(`[${this.context}] ${message}`, meta || "");
  }
  error(message, meta) {
    console.error(`[${this.context}] ${message}`, meta || "");
  }
  debug(message, meta) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[${this.context}] DEBUG: ${message}`, meta || "");
    }
  }
}

export { Logger };
