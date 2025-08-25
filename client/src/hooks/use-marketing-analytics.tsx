import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { trackScrollDepth, trackTimeOnPage, trackMarketingInteraction } from '../lib/analytics';
import { 
  bounceRateAnalytics, 
  resetMarketingAnalytics,
  trackMarketingPageScroll,
  trackMarketingPageInteraction 
} from '../lib/bounce-rate-analytics';

// Marketing pages that should have bounce rate tracking
// Includes conversion funnel pages: auth, payment, onboarding
const MARKETING_PAGES = ['/', '/about', '/join', '/contact', '/reset-discipline', '/blog', '/terms', '/privacy', '/auth', '/payment', '/onboarding'];

export const useMarketingAnalytics = () => {
  const [location] = useLocation();
  const startTimeRef = useRef<number>(Date.now());
  const scrollTrackingRef = useRef<Set<number>>(new Set());
  const timeTrackingRef = useRef<Set<number>>(new Set());
  
  // Only track on marketing pages, not PWA/member areas
  const isMarketingPage = MARKETING_PAGES.includes(location) || location.startsWith('/blog/');
  
  useEffect(() => {
    if (!isMarketingPage) return;
    
    // Reset tracking for new page
    startTimeRef.current = Date.now();
    scrollTrackingRef.current.clear();
    timeTrackingRef.current.clear();
    
    // Reset advanced bounce rate analytics for new page
    resetMarketingAnalytics();
    
    // Track scroll depth
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      // Track scroll milestones once per page visit
      [25, 50, 75, 90].forEach(milestone => {
        if (scrollPercent >= milestone && !scrollTrackingRef.current.has(milestone)) {
          scrollTrackingRef.current.add(milestone);
          trackScrollDepth(milestone);
          trackMarketingPageScroll(milestone); // Advanced bounce analytics
        }
      });
    };
    
    // Track time milestones
    const timeInterval = setInterval(() => {
      const timeOnPage = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      [10, 30, 60, 120, 300].forEach(milestone => {
        if (timeOnPage >= milestone && !timeTrackingRef.current.has(milestone)) {
          timeTrackingRef.current.add(milestone);
          trackTimeOnPage(timeOnPage);
        }
      });
    }, 1000);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timeInterval);
    };
  }, [location, isMarketingPage]);
  
  // Track marketing interactions
  const trackInteraction = (interaction: string, section?: string) => {
    if (!isMarketingPage) return;
    trackMarketingInteraction(interaction, section);
    trackMarketingPageInteraction(`${section}_${interaction}`); // Advanced bounce analytics
  };
  
  return { trackInteraction, isMarketingPage };
};