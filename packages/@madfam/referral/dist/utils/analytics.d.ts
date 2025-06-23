/**
 * Analytics utility
 */
interface AnalyticsEvent {
    userId: string;
    event: string;
    properties?: Record<string, unknown>;
    timestamp?: string;
}
declare class Analytics {
    private endpoint?;
    constructor(endpoint?: string);
    track(userId: string, event: string, properties?: Record<string, unknown>): Promise<void>;
}

export { Analytics };
export type { AnalyticsEvent };
