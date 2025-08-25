// GA4 Bounce Rate Analysis Configuration
// Comprehensive tracking setup to identify bounce points and user behavior patterns

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Enhanced GA4 configuration for bounce rate analysis
export const initGA4BounceAnalysis = () => {
  if (typeof window === 'undefined' || !window.gtag) {
    console.warn('GA4 bounce analysis: gtag not available');
    return;
  }

  // Configure enhanced measurement for bounce analysis
  window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
    // Enhanced bounce rate measurement
    engagement_time_msec: 10000, // Consider engaged after 10 seconds
    
    // Enable enhanced measurement events
    enhanced_measurement: {
      scroll_events: true,
      outbound_clicks: true,
      site_search: true,
      form_interactions: true,
      file_downloads: true,
      video_engagement: true
    },
    
    // Custom parameters for detailed analysis
    custom_map: {
      'custom_parameter_1': 'user_journey_stage',
      'custom_parameter_2': 'conversion_funnel_step',
      'custom_parameter_3': 'bounce_risk_level',
      'custom_parameter_4': 'engagement_depth',
      'custom_parameter_5': 'session_quality'
    },
    
    // Cookie settings for user journey tracking
    cookie_expires: 365 * 24 * 60 * 60, // 1 year
    cookie_update: true,
    
    // Advanced attribution settings
    attribution_timeout: 86400, // 24 hours
    send_page_view: false // We'll send manually with enhanced data
  });

  console.log('GA4 Bounce Analysis initialized');
};

// Conversion funnel tracking for bounce analysis
export const CONVERSION_FUNNEL = {
  AWARENESS: {
    PAGE_LOAD: 'funnel_page_load',
    HERO_VIEW: 'funnel_hero_view',
    VALUE_PROP_VIEW: 'funnel_value_prop_view'
  },
  INTEREST: {
    SCROLL_25: 'funnel_scroll_25',
    SCROLL_50: 'funnel_scroll_50',
    FEATURE_VIEW: 'funnel_feature_view',
    TESTIMONIAL_VIEW: 'funnel_testimonial_view'
  },
  CONSIDERATION: {
    PRICING_VIEW: 'funnel_pricing_view',
    FAQ_VIEW: 'funnel_faq_view',
    DEMO_REQUEST: 'funnel_demo_request',
    CHAT_OPEN: 'funnel_chat_open'
  },
  INTENT: {
    CTA_CLICK: 'funnel_cta_click',
    FORM_START: 'funnel_form_start',
    FORM_PROGRESS: 'funnel_form_progress'
  },
  ACTION: {
    FORM_COMPLETE: 'funnel_form_complete',
    SIGNUP_START: 'funnel_signup_start',
    PAYMENT_START: 'funnel_payment_start'
  }
} as const;

// Bounce risk indicators for GA4
export const BOUNCE_INDICATORS = {
  HIGH_RISK: {
    QUICK_EXIT: 'bounce_quick_exit', // < 5 seconds
    NO_SCROLL: 'bounce_no_scroll', // No scrolling in 30+ seconds
    FAST_SCROLL: 'bounce_fast_scroll', // 75%+ scroll in < 10 seconds
    NO_INTERACTION: 'bounce_no_interaction' // No clicks/forms in 60+ seconds
  },
  MEDIUM_RISK: {
    SHALLOW_SCROLL: 'bounce_shallow_scroll', // < 25% scroll in 30+ seconds
    SINGLE_INTERACTION: 'bounce_single_interaction', // Only 1 interaction
    SHORT_SESSION: 'bounce_short_session' // 10-30 seconds
  },
  ENGAGEMENT_SIGNALS: {
    DEEP_SCROLL: 'engagement_deep_scroll', // 75%+ scroll with time
    MULTIPLE_INTERACTIONS: 'engagement_multi_interact', // 3+ interactions
    CONTENT_FOCUS: 'engagement_content_focus', // Staying on sections
    RETURN_VISITOR: 'engagement_return_visit'
  }
} as const;

// Track conversion funnel progression
export const trackFunnelProgression = (stage: string, step: string, additionalData: Record<string, any> = {}) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', step, {
    event_category: 'conversion_funnel',
    event_label: stage,
    funnel_stage: stage,
    funnel_step: step,
    user_journey_stage: stage,
    conversion_funnel_step: step,
    page_location: window.location.href,
    page_title: document.title,
    timestamp: Date.now(),
    ...additionalData
  });

  console.log(`Funnel Progression: ${stage} → ${step}`, additionalData);
};

// Enhanced bounce tracking with detailed context
export const trackBounceRisk = (
  riskLevel: 'high' | 'medium' | 'low',
  indicator: string,
  context: {
    timeOnPage: number;
    scrollDepth: number;
    interactions: number;
    pageSection?: string;
    userAgent?: string;
    referrer?: string;
  }
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'bounce_risk_assessment', {
    event_category: 'bounce_analysis',
    event_label: indicator,
    bounce_risk_level: riskLevel,
    engagement_depth: context.scrollDepth >= 50 && context.timeOnPage >= 30 ? 'high' : 
                     context.scrollDepth >= 25 || context.timeOnPage >= 15 ? 'medium' : 'low',
    session_quality: context.interactions >= 2 && context.timeOnPage >= 30 ? 'high' :
                    context.interactions >= 1 || context.timeOnPage >= 15 ? 'medium' : 'low',
    time_on_page: context.timeOnPage,
    scroll_depth_percent: context.scrollDepth,
    interaction_count: context.interactions,
    page_section: context.pageSection || 'unknown',
    page_location: window.location.href,
    page_referrer: context.referrer || document.referrer,
    user_agent_info: context.userAgent || navigator.userAgent,
    timestamp: Date.now()
  });

  console.log(`Bounce Risk: ${riskLevel} - ${indicator}`, context);
};

// Track detailed user engagement patterns
export const trackEngagementPattern = (
  pattern: 'power_user' | 'browser' | 'scanner' | 'bouncer',
  metrics: {
    sessionDuration: number;
    pageViews: number;
    scrollVelocity: number;
    interactionRate: number;
    contentConsumption: number;
  }
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'engagement_pattern', {
    event_category: 'user_behavior',
    event_label: pattern,
    user_type: pattern,
    session_duration: metrics.sessionDuration,
    page_view_count: metrics.pageViews,
    scroll_velocity: metrics.scrollVelocity,
    interaction_rate: metrics.interactionRate,
    content_consumption_rate: metrics.contentConsumption,
    engagement_score: calculateEngagementScore(metrics),
    page_location: window.location.href,
    timestamp: Date.now()
  });

  console.log(`Engagement Pattern: ${pattern}`, metrics);
};

// Calculate engagement score for GA4
const calculateEngagementScore = (metrics: {
  sessionDuration: number;
  pageViews: number;
  scrollVelocity: number;
  interactionRate: number;
  contentConsumption: number;
}): number => {
  const weights = {
    duration: 0.3,
    pageViews: 0.2,
    scrollVelocity: 0.1,
    interactionRate: 0.3,
    contentConsumption: 0.1
  };

  const normalizedDuration = Math.min(metrics.sessionDuration / 300, 1); // Max 5 minutes
  const normalizedPageViews = Math.min(metrics.pageViews / 5, 1); // Max 5 pages
  const normalizedScrollVelocity = Math.max(0, 1 - metrics.scrollVelocity / 100); // Slower is better
  const normalizedInteractionRate = Math.min(metrics.interactionRate, 1);
  const normalizedContentConsumption = Math.min(metrics.contentConsumption, 1);

  const score = (
    normalizedDuration * weights.duration +
    normalizedPageViews * weights.pageViews +
    normalizedScrollVelocity * weights.scrollVelocity +
    normalizedInteractionRate * weights.interactionRate +
    normalizedContentConsumption * weights.contentConsumption
  ) * 100;

  return Math.round(score);
};

// Track page-specific conversion barriers
export const trackConversionBarriers = (
  page: string,
  barriers: {
    formErrors?: string[];
    loadingIssues?: string[];
    contentConcerns?: string[];
    trustSignals?: string[];
    pricingHesitations?: string[];
  }
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  Object.entries(barriers).forEach(([category, issues]) => {
    if (issues && issues.length > 0) {
      issues.forEach((issue, index) => {
        window.gtag!('event', 'conversion_barrier', {
          event_category: 'conversion_optimization',
          event_label: issue,
          barrier_category: category,
          barrier_severity: issues.length > 3 ? 'high' : issues.length > 1 ? 'medium' : 'low',
          page_name: page,
          page_location: window.location.href,
          barrier_position: index + 1,
          total_barriers: issues.length,
          timestamp: Date.now()
        });
      });
    }
  });

  console.log(`Conversion Barriers on ${page}:`, barriers);
};

// Enhanced page view tracking with bounce prediction
export const trackEnhancedPageView = (
  pageName: string,
  pageData: {
    category?: string;
    userType?: string;
    referralSource?: string;
    campaignData?: Record<string, any>;
    deviceInfo?: Record<string, any>;
  } = {}
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_name: pageName,
    page_category: pageData.category || 'general',
    user_type: pageData.userType || 'anonymous',
    traffic_source: pageData.referralSource || document.referrer,
    device_category: pageData.deviceInfo?.type || 'unknown',
    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    timestamp: Date.now(),
    ...pageData.campaignData
  });

  // Track funnel entry
  trackFunnelProgression('awareness', CONVERSION_FUNNEL.AWARENESS.PAGE_LOAD, {
    page_name: pageName,
    ...pageData
  });

  console.log(`Enhanced Page View: ${pageName}`, pageData);
};

// Session summary for bounce analysis
export const trackSessionSummary = (sessionData: {
  sessionId: string;
  duration: number;
  pageCount: number;
  interactionCount: number;
  conversionEvents: number;
  bounceRisk: 'low' | 'medium' | 'high';
  engagementScore: number;
  primaryPage: string;
}) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'session_summary', {
    event_category: 'session_analysis',
    event_label: 'session_complete',
    session_id: sessionData.sessionId,
    session_duration: sessionData.duration,
    page_count: sessionData.pageCount,
    interaction_count: sessionData.interactionCount,
    conversion_events: sessionData.conversionEvents,
    bounce_risk_level: sessionData.bounceRisk,
    engagement_score: sessionData.engagementScore,
    primary_page: sessionData.primaryPage,
    session_value: sessionData.conversionEvents > 0 ? 'high' : 
                   sessionData.engagementScore > 70 ? 'medium' : 'low',
    timestamp: Date.now()
  });

  console.log('Session Summary:', sessionData);
};