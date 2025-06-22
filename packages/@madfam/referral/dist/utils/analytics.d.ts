/**
 * Analytics utility
 */
interface AnalyticsEvent {
    userId: string;
    event: string;
    properties?: Record<string, any>;
    timestamp?: string;
}
declare class Analytics {
    private endpoint?;
    constructor(endpoint?: string);
    track(userId: string, event: string, properties?: Record<string, any>): Promise<void>;
}

export { Analytics };
export type { AnalyticsEvent };
