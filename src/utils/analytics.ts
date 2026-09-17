export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  } else if (import.meta.env.DEV) {
    console.log(`[GA4 Event - 개발모드] ${eventName}`, params);
  }
};
