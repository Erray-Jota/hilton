
// Type extension for gtag
declare global {
    interface Window {
        gtag: (
            command: 'event' | 'config' | 'js',
            targetId: string | Date,
            config?: Record<string, any>
        ) => void;
    }
}

export type EventName =
    | 'scenario_calculated'
    | 'file_download'
    | 'share_estimate'
    | 'assistant_interaction';

interface AnalyticsParams {
    // Common
    brand?: string;
    location?: string;
    rooms?: number;
    floors?: number;

    // File/Share
    file_type?: 'pdf' | 'csv';
    method?: 'email' | 'download';

    // Assistant
    interaction_type?: 'voice' | 'text';

    [key: string]: any;
}

export const trackEvent = (eventName: EventName, params?: AnalyticsParams) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, params);

        // Dev log for verification
        if (import.meta.env.DEV) {
            console.log(`[Analytics] ${eventName}:`, params);
        }
    }
};
