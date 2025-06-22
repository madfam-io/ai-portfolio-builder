class Analytics {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }
  async track(userId, event, properties) {
    const analyticsEvent = {
      userId,
      event,
      properties,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (this.endpoint) {
      try {
        await fetch(this.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(analyticsEvent)
        });
      } catch (error) {
        console.error("Failed to send analytics event", error);
      }
    }
    if (process.env.NODE_ENV === "development") {
      console.log("Analytics Event:", analyticsEvent);
    }
  }
}

export { Analytics };
