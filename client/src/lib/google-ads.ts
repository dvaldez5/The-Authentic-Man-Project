// Google Ads conversion tracking utilities
// Only tracks conversions in production environment

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const GOOGLE_ADS_ID = 'AW-835937139';

// Conversion labels for different actions
export const CONVERSION_LABELS = {
  NEWSLETTER_SIGNUP: 'newsletter_signup',
  SUBSCRIPTION_START: 'subscription_start',
  ACCOUNT_CREATED: 'account_created',
  COURSE_COMPLETED: 'course_completed',
  CONTACT_FORM: 'contact_form',
  PDF_DOWNLOAD: 'pdf_download'
} as const;

export type ConversionType = keyof typeof CONVERSION_LABELS;

interface ConversionData {
  email?: string;
  firstName?: string;
  lastName?: string;
  value?: number;
  currency?: string;
  transactionId?: string;
}

// Track newsletter signup conversion
export const trackNewsletterSignup = (data: ConversionData = {}) => {
  if (!window.gtag) return;
  
  window.gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${CONVERSION_LABELS.NEWSLETTER_SIGNUP}`,
    event_category: 'engagement',
    event_label: 'newsletter_signup',
    email_address: data.email,
    first_name: data.firstName,
    last_name: data.lastName
  });
  
  // Also track as a custom event for enhanced tracking
  window.gtag('event', 'generate_lead', {
    currency: 'USD',
    value: 1.0,
    method: 'newsletter'
  });
  
  console.log('Google Ads: Newsletter signup conversion tracked');
};

// Track subscription conversion
export const trackSubscription = (data: ConversionData = {}) => {
  if (!window.gtag) return;
  
  window.gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${CONVERSION_LABELS.SUBSCRIPTION_START}`,
    event_category: 'ecommerce',
    event_label: 'subscription_start',
    value: data.value || 9.99,
    currency: data.currency || 'USD',
    transaction_id: data.transactionId,
    email_address: data.email
  });
  
  // Also track as purchase event
  window.gtag('event', 'purchase', {
    transaction_id: data.transactionId,
    value: data.value || 9.99,
    currency: data.currency || 'USD',
    items: [{
      item_id: 'am_subscription',
      item_name: 'AM Project Monthly Subscription',
      category: 'subscription',
      quantity: 1,
      price: data.value || 9.99
    }]
  });
  
  console.log('Google Ads: Subscription conversion tracked');
};

// Track account creation
export const trackAccountCreated = (data: ConversionData = {}) => {
  if (!window.gtag) return;
  
  window.gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${CONVERSION_LABELS.ACCOUNT_CREATED}`,
    event_category: 'engagement',
    event_label: 'account_created',
    email_address: data.email,
    first_name: data.firstName,
    last_name: data.lastName
  });
  
  // Also track as sign_up event
  window.gtag('event', 'sign_up', {
    method: 'email'
  });
  
  console.log('Google Ads: Account creation conversion tracked');
};

// Track contact form submission
export const trackContactForm = (data: ConversionData = {}) => {
  if (!window.gtag) return;
  
  window.gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${CONVERSION_LABELS.CONTACT_FORM}`,
    event_category: 'engagement',
    event_label: 'contact_form',
    email_address: data.email
  });
  
  console.log('Google Ads: Contact form conversion tracked');
};

// Track PDF download
export const trackPDFDownload = (data: ConversionData = {}) => {
  if (!window.gtag) return;
  
  window.gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${CONVERSION_LABELS.PDF_DOWNLOAD}`,
    event_category: 'engagement',
    event_label: 'pdf_download',
    email_address: data.email
  });
  
  console.log('Google Ads: PDF download conversion tracked');
};

// Track course completion
export const trackCourseCompleted = (data: ConversionData & { courseName?: string } = {}) => {
  if (!window.gtag) return;
  
  window.gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${CONVERSION_LABELS.COURSE_COMPLETED}`,
    event_category: 'engagement',
    event_label: 'course_completed',
    email_address: data.email,
    custom_parameters: {
      course_name: data.courseName || 'unknown'
    }
  });
  
  console.log('Google Ads: Course completion conversion tracked');
};

// Generic conversion tracking function
export const trackConversion = (conversionType: ConversionType, data: ConversionData = {}) => {
  switch (conversionType) {
    case 'NEWSLETTER_SIGNUP':
      trackNewsletterSignup(data);
      break;
    case 'SUBSCRIPTION_START':
      trackSubscription(data);
      break;
    case 'ACCOUNT_CREATED':
      trackAccountCreated(data);
      break;
    case 'CONTACT_FORM':
      trackContactForm(data);
      break;
    case 'PDF_DOWNLOAD':
      trackPDFDownload(data);
      break;
    case 'COURSE_COMPLETED':
      trackCourseCompleted(data);
      break;
    default:
      console.warn('Unknown conversion type:', conversionType);
  }
};

// Track page views with enhanced data
export const trackPageView = (pageName: string, additionalData: Record<string, any> = {}) => {
  if (!window.gtag) return;
  
  window.gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_name: pageName,
    ...additionalData
  });
  
  console.log(`Google Ads: Page view tracked - ${pageName}`);
};

// Track custom events for enhanced conversion data
export const trackCustomEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (!window.gtag) return;
  
  window.gtag('event', eventName, {
    ...parameters,
    event_category: 'custom',
    event_label: eventName
  });
  
  console.log(`Google Ads: Custom event tracked - ${eventName}`);
};