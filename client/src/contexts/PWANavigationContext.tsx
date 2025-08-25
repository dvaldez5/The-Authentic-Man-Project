import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePWADetection } from '@/hooks/use-pwa-detection';

interface PWANavigationContextType {
  isVisible: boolean;
  showMore: boolean;
  setShowMore: (show: boolean) => void;
}

const PWANavigationContext = createContext<PWANavigationContextType | undefined>(undefined);

export function PWANavigationProvider({ children }: { children: ReactNode }) {
  const { isPWA } = usePWADetection();
  const [isVisible, setIsVisible] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Scroll detection to auto-hide navigation
  useEffect(() => {
    if (!isPWA) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);
      
      // Only process if scroll difference is significant enough
      if (scrollDifference < 5) return;
      
      if (currentScrollY < lastScrollY || currentScrollY < 30) {
        // Scrolling up or near top - show nav
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 60) {
        // Scrolling down and past threshold - hide nav
        setIsVisible(false);
        setShowMore(false); // Close more menu when hiding
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isPWA]);

  return (
    <PWANavigationContext.Provider value={{ isVisible, showMore, setShowMore }}>
      {children}
    </PWANavigationContext.Provider>
  );
}

export function usePWANavigation() {
  const context = useContext(PWANavigationContext);
  if (context === undefined) {
    throw new Error('usePWANavigation must be used within a PWANavigationProvider');
  }
  return context;
}