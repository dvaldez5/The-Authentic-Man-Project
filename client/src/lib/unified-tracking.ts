// Unified Google Analytics + Google Ads Tracking System
// Handles both GA4 and Google Ads conversion tracking seamlessly

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Configuration for unified tracking
const TRACKING_CONFIG = {
  GA4_ID: import.meta.env.VITE_GA_MEASUREMENT_ID, // Your NEW GA4 property (create new one)
  GOOGLE_ADS_ID: 'AW-835937139', // Your Google Ads conversion ID (found in system)
  PRODUCTION_DOMAIN: 'theamproject.com'
};

// Initialize unified tracking system (GA4 + Google Ads)
export const initUnifiedTracking = () => {
  const { GA4_ID, GOOGLE_ADS_ID, PRODUCTION_DOMAIN } = TRACKING_CONFIG;
  
  if (!GA4_ID) {
    console.warn('Missing GA4 measurement ID: VITE_GA_MEASUREMENT_ID');
    return;
  }

  const isProduction = window.location.hostname === PRODUCTION_DOMAIN || 
                       window.location.hostname.includes(PRODUCTION_DOMAIN);

  // Load gtag script (shared for both GA4 and Google Ads)
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script1);

  // Initialize both GA4 and Google Ads
  const script2 = document.createElement('script');
  script2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    
    // Configure GA4 for analytics
    gtag('config', '${GA4_ID}', {
      debug_mode: ${!isProduction},
      send_page_view: true,
      enhanced_measurement: {
        scroll_events: true,
        outbound_clicks: true,
        site_search: true,
        form_interactions: true,
        file_downloads: true
      }
    });
    
    // Configure Google Ads for conversions
    gtag('config', '${GOOGLE_ADS_ID}', {
      allow_enhanced_conversions: true
    });
  `;
  document.head.appendChild(script2);

  console.log('🎯 Unified Tracking Initialized:', {
    ga4: GA4_ID,
    googleAds: GOOGLE_ADS_ID,
    environment: isProduction ? 'production' : 'development',
    domain: window.location.hostname,
    note: GA4_ID && GA4_ID.startsWith('G-') ? 'GA4 ID FORMAT CORRECT ✅' : 'GA4 ID MISSING OR INVALID ❌'
  });
};

// Enhanced page view tracking (for GA4)
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('config', TRACKING_CONFIG.GA4_ID!, {
    page_path: url
  });
};

// Track custom events (GA4)
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

// Google Ads Conversion Tracking Functions
export const trackGoogleAdsConversion = (
  conversionLabel: string, 
  conversionValue?: number,
  transactionId?: string
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'conversion', {
    send_to: `${TRACKING_CONFIG.GOOGLE_ADS_ID}/${conversionLabel}`,
    value: conversionValue || 1.0,
    currency: 'USD',
    transaction_id: transactionId
  });

  console.log('🎯 Google Ads Conversion Tracked:', {
    label: conversionLabel,
    value: conversionValue,
    transactionId
  });
};

// Specific conversion events for your funnel
export const CONVERSION_EVENTS = {
  // Lead generation conversions
  SIGNUP_START: 'signup_start',
  SIGNUP_COMPLETE: 'signup_complete',
  
  // Payment conversions  
  PAYMENT_INITIATED: 'begin_checkout',
  PURCHASE_COMPLETE: 'purchase',
  
  // Engagement conversions
  TRIAL_START: 'trial_start',
  CONTENT_ENGAGEMENT: 'engagement',
  
  // Marketing conversions
  NEWSLETTER_SIGNUP: 'generate_lead',
  CONTACT_FORM: 'submit_lead_form'
} as const;

// Track lead generation (Google Ads + GA4)
export const trackLeadGeneration = (leadType: string, leadValue?: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  // GA4 event
  window.gtag('event', 'generate_lead', {
    event_category: 'conversion',
    event_label: leadType,
    value: leadValue || 1
  });

  // Google Ads conversion (you'll need to configure conversion labels in Google Ads)
  window.gtag('event', 'conversion', {
    send_to: `${TRACKING_CONFIG.GOOGLE_ADS_ID}/lead_conversion`, // Replace with actual label
    value: leadValue || 1.0,
    currency: 'USD'
  });
};

// Track purchase conversion (Google Ads + GA4)
export const trackPurchase = (
  transactionId: string,
  value: number,
  items?: Array<{
    item_id: string;
    item_name: string;
    category: string;
    price: number;
  }>
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  // GA4 purchase event
  window.gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: value,
    currency: 'USD',
    items: items || []
  });

  // Google Ads purchase conversion
  window.gtag('event', 'conversion', {
    send_to: `${TRACKING_CONFIG.GOOGLE_ADS_ID}/purchase_conversion`, // Replace with actual label
    value: value,
    currency: 'USD',
    transaction_id: transactionId
  });

  console.log('🎯 Purchase Tracked:', { transactionId, value, items });
};

// Enhanced engagement tracking for bounce analysis
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

// Track marketing interactions for Google Ads optimization
export const trackMarketingInteraction = (interaction: string, section?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  // GA4 event
  window.gtag('event', 'marketing_interaction', {
    event_category: 'marketing_engagement',
    event_label: interaction,
    section: section || 'unknown',
    page_location: window.location.pathname
  });

  // If it's a high-value interaction, track as micro-conversion for Google Ads
  const highValueInteractions = ['cta_click', 'pricing_view', 'demo_request', 'contact_click'];
  if (highValueInteractions.includes(interaction)) {
    window.gtag('event', 'conversion', {
      send_to: `${TRACKING_CONFIG.GOOGLE_ADS_ID}/micro_conversion`, // Replace with actual label
      value: 0.1, // Small value for micro-conversions
      currency: 'USD'
    });
  }
};