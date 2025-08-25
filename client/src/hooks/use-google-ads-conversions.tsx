// Hook for tracking Google Ads conversions across the app
import { useCallback } from 'react';
import { 
  trackGoogleAdsConversion,
  trackLeadGeneration,
  trackPurchase,
  CONVERSION_EVENTS
} from '@/lib/unified-tracking';

export const useGoogleAdsConversions = () => {
  // Track signup conversion
  const trackSignupConversion = useCallback((email?: string) => {
    trackGoogleAdsConversion('signup_conversion', 1.0); // Replace with actual conversion label
    trackLeadGeneration('signup', 1);
    console.log('🎯 Signup conversion tracked');
  }, []);

  // Track payment conversion
  const trackPaymentConversion = useCallback((
    transactionId: string, 
    amount: number,
    plan: string
  ) => {
    trackPurchase(transactionId, amount, [{
      item_id: plan,
      item_name: `AM Project ${plan}`,
      category: 'subscription',
      price: amount
    }]);
    console.log('🎯 Payment conversion tracked:', { transactionId, amount, plan });
  }, []);

  // Track trial start
  const trackTrialStartConversion = useCallback(() => {
    trackGoogleAdsConversion('trial_start', 0.5); // Replace with actual conversion label
    console.log('🎯 Trial start conversion tracked');
  }, []);

  // Track contact form submission
  const trackContactConversion = useCallback((formType: string) => {
    trackLeadGeneration('contact_form', 0.5);
    console.log('🎯 Contact conversion tracked:', formType);
  }, []);

  // Track newsletter signup
  const trackNewsletterConversion = useCallback(() => {
    trackLeadGeneration('newsletter', 0.3);
    console.log('🎯 Newsletter conversion tracked');
  }, []);

  // Track high-value page views (pricing, about, etc.)
  const trackHighValuePageView = useCallback((pageName: string) => {
    trackGoogleAdsConversion('page_view', 0.1); // Micro-conversion
    console.log('🎯 High-value page view tracked:', pageName);
  }, []);

  return {
    trackSignupConversion,
    trackPaymentConversion,
    trackTrialStartConversion,
    trackContactConversion,
    trackNewsletterConversion,
    trackHighValuePageView
  };
};