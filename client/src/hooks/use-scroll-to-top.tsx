import { useEffect } from 'react';
import { useLocation } from 'wouter';

export function useScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Don't scroll to top if navigating to journal with query parameters
    // This allows journal section navigation to work properly
    if (location === '/journal' && window.location.search) {
      return;
    }

    // Scroll to top for all other page navigations
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [location]);
}