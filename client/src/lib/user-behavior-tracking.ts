// User Behavior Tracking for Bounce Rate Analysis
// Comprehensive tracking to identify where users drop off in the conversion funnel

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Track user journey through conversion funnel
export const trackFunnelStep = (step: string, page: string, additionalData?: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'funnel_step', {
    event_category: 'conversion_funnel',
    event_label: step,
    page_location: window.location.href,
    page_name: page,
    timestamp: Date.now(),
    ...additionalData
  });
  
  console.log(`Funnel Step: ${step} on ${page}`);
};

// Track button clicks with detailed context
export const trackButtonClick = (buttonText: string, buttonType: 'cta' | 'navigation' | 'secondary', section: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'button_click', {
    event_category: 'user_interaction',
    event_label: buttonText,
    button_type: buttonType,
    page_section: section,
    page_location: window.location.href,
    timestamp: Date.now()
  });
  
  console.log(`Button Click: "${buttonText}" (${buttonType}) in ${section}`);
};

// Track form interactions and abandonment
export const trackFormInteraction = (action: 'start' | 'focus' | 'complete' | 'abandon', formName: string, fieldName?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'form_interaction', {
    event_category: 'form_engagement',
    event_label: action,
    form_name: formName,
    field_name: fieldName || 'unknown',
    page_location: window.location.href,
    timestamp: Date.now()
  });
  
  console.log(`Form ${action}: ${formName}${fieldName ? ` - ${fieldName}` : ''}`);
};

// Track scroll behavior and engagement depth
export const trackScrollBehavior = (scrollDepth: number, timeOnPage: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  // Track specific scroll milestones for bounce analysis
  const milestones = [25, 50, 75, 90, 100];
  const milestone = milestones.find(m => scrollDepth >= m && scrollDepth < (milestones[milestones.indexOf(m) + 1] || 101));
  
  if (milestone) {
    window.gtag('event', 'scroll_depth', {
      event_category: 'engagement',
      event_label: `${milestone}%`,
      scroll_depth: scrollDepth,
      time_on_page: timeOnPage,
      page_location: window.location.href,
      engagement_level: milestone >= 75 ? 'high' : milestone >= 50 ? 'medium' : 'low'
    });
    
    console.log(`Scroll Depth: ${milestone}% (${timeOnPage}s on page)`);
  }
};

// Track section visibility and engagement
export const trackSectionView = (sectionName: string, viewDuration?: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'section_view', {
    event_category: 'content_engagement',
    event_label: sectionName,
    view_duration: viewDuration || 0,
    page_location: window.location.href,
    timestamp: Date.now()
  });
  
  console.log(`Section View: ${sectionName}${viewDuration ? ` (${viewDuration}s)` : ''}`);
};

// Track user intent signals (exit intent, fast scroll, etc.)
export const trackUserIntent = (intent: 'exit_intent' | 'fast_scroll' | 'quick_return' | 'deep_engagement', context?: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'user_intent', {
    event_category: 'behavioral_signal',
    event_label: intent,
    page_location: window.location.href,
    timestamp: Date.now(),
    ...context
  });
  
  console.log(`User Intent: ${intent}`, context);
};

// Track pricing interaction behavior
export const trackPricingInteraction = (action: 'view' | 'hover' | 'click', element: string, duration?: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'pricing_interaction', {
    event_category: 'conversion_signals',
    event_label: action,
    pricing_element: element,
    interaction_duration: duration || 0,
    page_location: window.location.href,
    timestamp: Date.now()
  });
  
  console.log(`Pricing ${action}: ${element}${duration ? ` (${duration}s)` : ''}`);
};

// Track navigation patterns
export const trackNavigation = (from: string, to: string, method: 'click' | 'scroll' | 'back_button' | 'direct') => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'navigation', {
    event_category: 'user_flow',
    event_label: method,
    from_page: from,
    to_page: to,
    timestamp: Date.now()
  });
  
  console.log(`Navigation: ${from} → ${to} (${method})`);
};

// Track content engagement patterns
export const trackContentEngagement = (contentType: 'testimonial' | 'feature' | 'benefit' | 'statistics' | 'cta', action: 'view' | 'click' | 'hover', duration?: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'content_engagement', {
    event_category: 'content_interaction',
    event_label: contentType,
    interaction_type: action,
    engagement_duration: duration || 0,
    page_location: window.location.href,
    timestamp: Date.now()
  });
  
  console.log(`Content ${action}: ${contentType}${duration ? ` (${duration}s)` : ''}`);
};

// Track bounce indicators
export const trackBounceIndicator = (indicator: 'quick_exit' | 'no_scroll' | 'no_interaction' | 'fast_scroll', severity: 'low' | 'medium' | 'high', timeOnPage: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'bounce_indicator', {
    event_category: 'bounce_analysis',
    event_label: indicator,
    severity_level: severity,
    time_on_page: timeOnPage,
    page_location: window.location.href,
    timestamp: Date.now()
  });
  
  console.log(`Bounce Indicator: ${indicator} (${severity} severity, ${timeOnPage}s on page)`);
};

// Track conversion barriers
export const trackConversionBarrier = (barrier: 'form_error' | 'payment_issue' | 'trust_concern' | 'price_hesitation' | 'feature_confusion', context?: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'conversion_barrier', {
    event_category: 'conversion_optimization',
    event_label: barrier,
    page_location: window.location.href,
    timestamp: Date.now(),
    ...context
  });
  
  console.log(`Conversion Barrier: ${barrier}`, context);
};

// Enhanced page view tracking with session context
export const trackEnhancedPageView = (pageName: string, referrer?: string, sessionData?: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'enhanced_page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_name: pageName,
    page_referrer: referrer || document.referrer,
    session_id: sessionData?.sessionId || 'unknown',
    user_type: sessionData?.userType || 'anonymous',
    timestamp: Date.now(),
    ...sessionData
  });
  
  console.log(`Enhanced Page View: ${pageName}`);
};

// Track time-based engagement milestones
export const trackTimeEngagement = (seconds: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  // Track specific time milestones that indicate real engagement
  const milestones = [5, 15, 30, 60, 120, 300]; // 5s, 15s, 30s, 1min, 2min, 5min
  
  milestones.forEach(milestone => {
    if (seconds === milestone) {
      window.gtag('event', 'time_engagement', {
        event_category: 'engagement_depth',
        event_label: `${milestone}s`,
        time_threshold: milestone,
        page_location: window.location.href,
        engagement_level: milestone >= 120 ? 'high' : milestone >= 30 ? 'medium' : 'low',
        timestamp: Date.now()
      });
      
      console.log(`Time Engagement: ${milestone}s milestone reached`);
    }
  });
};

// Comprehensive session tracking
export const trackSessionBehavior = (sessionData: {
  sessionId: string;
  pageCount: number;
  totalTime: number;
  interactions: number;
  conversions: number;
  bounceRisk: 'low' | 'medium' | 'high';
}) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'session_behavior', {
    event_category: 'session_analysis',
    event_label: 'session_summary',
    session_id: sessionData.sessionId,
    page_count: sessionData.pageCount,
    total_session_time: sessionData.totalTime,
    total_interactions: sessionData.interactions,
    conversion_count: sessionData.conversions,
    bounce_risk_level: sessionData.bounceRisk,
    timestamp: Date.now()
  });
  
  console.log('Session Behavior Summary:', sessionData);
};