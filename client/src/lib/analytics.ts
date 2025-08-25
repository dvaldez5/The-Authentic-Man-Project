// Declare gtag function type
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    return;
  }

  // Production domain check (optional - can track in development too)
  const isProduction = window.location.hostname === 'theamproject.com' || 
                       window.location.hostname.includes('theamproject.com');

  // Add Google Analytics script to the head
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement('script');
  script2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', {
      debug_mode: ${!isProduction},
      send_page_view: true
    });
  `;
  document.head.appendChild(script2);
  
  console.log('🎯 Google Analytics initialized:', {
    measurementId,
    environment: isProduction ? 'production' : 'development',
    domain: window.location.hostname
  });
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url
  });
};

// Track events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Enhanced bounce rate tracking for marketing pages
export const trackEngagement = (engagementType: 'scroll' | 'time' | 'click', details?: any) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'engagement', {
    event_category: 'user_engagement',
    event_label: engagementType,
    engagement_time_msec: details?.timeSpent || 0,
    scroll_depth: details?.scrollDepth || 0,
    custom_parameters: details
  });
};

// Track scroll depth for bounce analysis
export const trackScrollDepth = (percentage: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  // Track meaningful scroll milestones
  if ([25, 50, 75, 90].includes(percentage)) {
    window.gtag('event', 'scroll', {
      event_category: 'engagement',
      event_label: `scroll_${percentage}`,
      value: percentage
    });
  }
};

// Track time on page for bounce rate analysis
export const trackTimeOnPage = (seconds: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  // Track time milestones
  const milestones = [10, 30, 60, 120, 300]; // 10s, 30s, 1min, 2min, 5min
  
  milestones.forEach(milestone => {
    if (seconds >= milestone && window.gtag) {
      window.gtag('event', 'time_engagement', {
        event_category: 'engagement',
        event_label: `time_${milestone}s`,
        value: milestone
      });
    }
  });
};

// Track marketing page interactions
export const trackMarketingInteraction = (interaction: string, section?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'marketing_interaction', {
    event_category: 'marketing_engagement',
    event_label: interaction,
    section: section || 'unknown',
    page_location: window.location.pathname
  });
};