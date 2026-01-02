import mixpanel from 'mixpanel-browser';

// Constants
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN || '9f1bd8bc639749f3598b5209c3f3f519';
const APP_NAME = "Hilton Estimator";

// Initialization
// We use 'debug: true' in dev to see logs in console
mixpanel.init(MIXPANEL_TOKEN, {
    debug: import.meta.env.DEV,
    track_pageview: true,
    persistence: 'localStorage' // Maintains identity across sessions
});

// Register "Super Properties" - these are sent with EVERY event
// This allows you to filter by 'App Name' in your Mixpanel dashboard
// to see data just for this app, even if you track multiple apps in one project.
mixpanel.register({
    'App Name': APP_NAME,
    'Platform': 'Web'
});

export type EventName =
    | 'scenario_calculated'
    | 'file_download'
    | 'share_estimate'
    | 'assistant_interaction';

interface AnalyticsParams {
    [key: string]: any;
}

export const trackEvent = (eventName: EventName, params?: AnalyticsParams) => {
    // Mixpanel handles device/location info automatically
    mixpanel.track(eventName, params);
};

// Optional: Identify user if you ever add login later
export const identifyUser = (userId: string) => {
    mixpanel.identify(userId);
};
