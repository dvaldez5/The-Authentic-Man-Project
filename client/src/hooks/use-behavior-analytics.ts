// Comprehensive behavior analytics hook for bounce rate analysis
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import {
  trackEnhancedPageView,
  trackScrollBehavior,
  trackTimeEngagement,
  trackBounceIndicator,
  trackUserIntent,
  trackFunnelStep,
  trackSessionBehavior
} from '@/lib/user-behavior-tracking';

interface BehaviorData {
  startTime: number;
  scrollDepth: number;
  interactions: number;
  timeOnPage: number;
  hasScrolled: boolean;
  hasInteracted: boolean;
  bounceRisk: 'low' | 'medium' | 'high';
}

export const useBehaviorAnalytics = (pageName: string) => {
  const [location] = useLocation();
  const [behaviorData, setBehaviorData] = useState<BehaviorData>({
    startTime: Date.now(),
    scrollDepth: 0,
    interactions: 0,
    timeOnPage: 0,
    hasScrolled: false,
    hasInteracted: false,
    bounceRisk: 'high'
  });

  const timeEngagementRef = useRef<Set<number>>(new Set());
  const scrollMilestonesRef = useRef<Set<number>>(new Set());
  const sessionIdRef = useRef<string>(
    localStorage.getItem('am_session_id') || 
    `session_${Date.now()}_${Math.random().toString(36).substring(2)}`
  );

  // Track page view on mount
  useEffect(() => {
    // Store session ID
    localStorage.setItem('am_session_id', sessionIdRef.current);
    
    // Enhanced page view tracking
    trackEnhancedPageView(pageName, document.referrer, {
      sessionId: sessionIdRef.current,
      userType: 'anonymous',
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      userAgent: navigator.userAgent
    });

    // Track funnel entry
    trackFunnelStep('page_entry', pageName, {
      referrer: document.referrer,
      sessionId: sessionIdRef.current
    });

    console.log(`Analytics initialized for: ${pageName}`);
  }, [pageName]);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      setBehaviorData(prev => {
        const newTimeOnPage = Math.round((Date.now() - prev.startTime) / 1000);
        const newBehaviorData = {
          ...prev,
          scrollDepth: Math.max(prev.scrollDepth, scrollPercent),
          timeOnPage: newTimeOnPage,
          hasScrolled: scrollPercent > 10,
          bounceRisk: calculateBounceRisk(scrollPercent, newTimeOnPage, prev.interactions)
        };

        // Track scroll milestones
        const milestones = [25, 50, 75, 90];
        milestones.forEach(milestone => {
          if (scrollPercent >= milestone && !scrollMilestonesRef.current.has(milestone)) {
            scrollMilestonesRef.current.add(milestone);
            trackScrollBehavior(scrollPercent, newTimeOnPage);
          }
        });

        return newBehaviorData;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Time engagement tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setBehaviorData(prev => {
        const newTimeOnPage = Math.round((Date.now() - prev.startTime) / 1000);
        
        // Track time milestones
        const milestones = [5, 15, 30, 60, 120, 300];
        milestones.forEach(milestone => {
          if (newTimeOnPage >= milestone && !timeEngagementRef.current.has(milestone)) {
            timeEngagementRef.current.add(milestone);
            trackTimeEngagement(milestone);
          }
        });

        return {
          ...prev,
          timeOnPage: newTimeOnPage,
          bounceRisk: calculateBounceRisk(prev.scrollDepth, newTimeOnPage, prev.interactions)
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Bounce indicators tracking
  useEffect(() => {
    const { timeOnPage, scrollDepth, interactions, hasScrolled, hasInteracted } = behaviorData;

    // Quick exit detection (less than 5 seconds)
    if (timeOnPage >= 5 && timeOnPage <= 10 && !hasScrolled && !hasInteracted) {
      trackBounceIndicator('quick_exit', 'high', timeOnPage);
    }

    // No scroll detection (30+ seconds without scrolling)
    if (timeOnPage >= 30 && scrollDepth < 10) {
      trackBounceIndicator('no_scroll', 'medium', timeOnPage);
    }

    // No interaction detection (60+ seconds without interaction)
    if (timeOnPage >= 60 && interactions === 0) {
      trackBounceIndicator('no_interaction', 'medium', timeOnPage);
    }

    // Fast scroll detection (scrolled 75%+ in under 10 seconds)
    if (scrollDepth >= 75 && timeOnPage <= 10 && interactions === 0) {
      trackBounceIndicator('fast_scroll', 'high', timeOnPage);
    }
  }, [behaviorData]);

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && behaviorData.timeOnPage >= 3) {
        trackUserIntent('exit_intent', {
          timeOnPage: behaviorData.timeOnPage,
          scrollDepth: behaviorData.scrollDepth,
          interactions: behaviorData.interactions,
          sessionId: sessionIdRef.current
        });
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [behaviorData]);

  // Track session behavior on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionData = {
        sessionId: sessionIdRef.current,
        pageCount: 1, // This would need to be tracked across pages
        totalTime: behaviorData.timeOnPage,
        interactions: behaviorData.interactions,
        conversions: 0, // This would need to be tracked
        bounceRisk: behaviorData.bounceRisk
      };
      
      trackSessionBehavior(sessionData);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [behaviorData]);

  // Helper function to calculate bounce risk
  const calculateBounceRisk = (scrollDepth: number, timeOnPage: number, interactions: number): 'low' | 'medium' | 'high' => {
    // High engagement indicators
    if (timeOnPage >= 60 && scrollDepth >= 50 && interactions >= 2) return 'low';
    if (timeOnPage >= 30 && scrollDepth >= 75) return 'low';
    if (interactions >= 3) return 'low';

    // Medium engagement indicators
    if (timeOnPage >= 30 && scrollDepth >= 25) return 'medium';
    if (timeOnPage >= 15 && interactions >= 1) return 'medium';
    if (scrollDepth >= 50) return 'medium';

    // Low engagement indicators (high bounce risk)
    return 'high';
  };

  // Functions to track interactions
  const trackInteraction = (type: string, details?: Record<string, any>) => {
    setBehaviorData(prev => ({
      ...prev,
      interactions: prev.interactions + 1,
      hasInteracted: true,
      bounceRisk: calculateBounceRisk(prev.scrollDepth, prev.timeOnPage, prev.interactions + 1)
    }));

    console.log(`User interaction: ${type}`, details);
  };

  return {
    behaviorData,
    trackInteraction,
    sessionId: sessionIdRef.current
  };
};

// Additional hook for tracking specific marketing page interactions
export const useMarketingPageAnalytics = (pageName: string) => {
  const { behaviorData, trackInteraction, sessionId } = useBehaviorAnalytics(pageName);

  const trackCTAClick = (ctaText: string, section: string) => {
    trackInteraction('cta_click', { ctaText, section });
    trackFunnelStep('cta_click', pageName, { ctaText, section, sessionId });
  };

  const trackFormStart = (formName: string) => {
    trackInteraction('form_start', { formName });
    trackFunnelStep('form_start', pageName, { formName, sessionId });
  };

  const trackPricingView = (pricingElement: string) => {
    trackInteraction('pricing_view', { pricingElement });
    trackFunnelStep('pricing_view', pageName, { pricingElement, sessionId });
  };

  const trackTestimonialView = (testimonialId: string) => {
    trackInteraction('testimonial_view', { testimonialId });
    trackFunnelStep('testimonial_view', pageName, { testimonialId, sessionId });
  };

  return {
    behaviorData,
    sessionId,
    trackCTAClick,
    trackFormStart,
    trackPricingView,
    trackTestimonialView,
    trackInteraction
  };
};