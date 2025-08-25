import { useEffect, useCallback, useRef } from 'react';

interface ExitIntentHookOptions {
  sensitivity?: number; // How close to the edge before triggering (px)
  delay?: number; // Minimum time on page before exit intent can trigger (ms)
  debounce?: number; // Delay before checking again (ms)
}

interface ExitIntentData {
  timeOnPage: number;
  scrollDepth: number;
}

export const useExitIntent = (
  onExitIntent: (data: ExitIntentData) => void,
  options: ExitIntentHookOptions = {}
) => {
  const {
    sensitivity = 20,
    delay = 15000, // 15 seconds minimum - much more reasonable
    debounce = 3000 // 3 second debounce to prevent spam
  } = options;

  const startTimeRef = useRef<number>(Date.now());
  const lastTriggeredRef = useRef<number>(0);
  const maxScrollRef = useRef<number>(0);
  const hasShownModal = useRef<boolean>(false);
  const userEngagementRef = useRef<number>(0); // Track user engagement signals

  // Check if modal has already been shown this session
  const checkModalShown = useCallback(() => {
    if (hasShownModal.current) return true;
    
    const modalShown = sessionStorage.getItem('exitIntentModalShown');
    if (modalShown) {
      hasShownModal.current = true;
      return true;
    }
    return false;
  }, []);

  // Check if user is actively engaged (typing, clicking, etc.)
  const checkUserEngagement = useCallback(() => {
    const now = Date.now();
    const timeSinceLastEngagement = now - userEngagementRef.current;
    
    // If user has been actively engaging in last 10 seconds, don't show modal
    return timeSinceLastEngagement < 10000;
  }, []);

  // Track user engagement signals
  const handleUserEngagement = useCallback(() => {
    userEngagementRef.current = Date.now();
  }, []);

  const calculateScrollDepth = useCallback(() => {
    const scrollTop = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const scrollDepth = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
    
    // Update max scroll depth
    maxScrollRef.current = Math.max(maxScrollRef.current, scrollDepth);
    
    return maxScrollRef.current;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = Date.now();
    
    // Check if modal has already been shown
    if (checkModalShown()) {
      return;
    }
    
    // Check if user is actively engaged (typing, clicking, etc.)
    if (checkUserEngagement()) {
      return;
    }
    
    // Check if enough time has passed since page load
    if (now - startTimeRef.current < delay) {
      return;
    }
    
    // Check if enough time has passed since last trigger
    if (now - lastTriggeredRef.current < debounce) {
      return;
    }
    
    // Check if mouse is near the top of the page (exit intent)
    if (e.clientY <= sensitivity) {
      lastTriggeredRef.current = now;
      hasShownModal.current = true; // Mark as shown
      
      // IMMEDIATELY mark as shown in session storage to prevent multiple triggers
      sessionStorage.setItem('exitIntentModalShown', 'true');
      
      const timeOnPage = now - startTimeRef.current;
      const scrollDepth = calculateScrollDepth();
      
      onExitIntent({
        timeOnPage,
        scrollDepth
      });
    }
  }, [onExitIntent, sensitivity, delay, debounce, calculateScrollDepth, checkModalShown, checkUserEngagement]);

  const handleScroll = useCallback(() => {
    calculateScrollDepth();
  }, [calculateScrollDepth]);

  // Mobile exit intent detection
  const handleTouchMove = useCallback((e: TouchEvent) => {
    const now = Date.now();
    
    // Check if modal has already been shown
    if (checkModalShown()) {
      return;
    }
    
    // Check if user is actively engaged (typing, clicking, etc.)
    if (checkUserEngagement()) {
      return;
    }
    
    // Check if enough time has passed since page load
    if (now - startTimeRef.current < delay) {
      return;
    }
    
    // Check if enough time has passed since last trigger
    if (now - lastTriggeredRef.current < debounce) {
      return;
    }
    
    // For mobile, trigger only on deliberate swipe near very top (less sensitive)
    const touch = e.touches[0];
    if (touch && touch.clientY <= sensitivity) { // Less sensitive for mobile
      lastTriggeredRef.current = now;
      hasShownModal.current = true;
      
      // IMMEDIATELY mark as shown in session storage to prevent multiple triggers
      sessionStorage.setItem('exitIntentModalShown', 'true');
      
      const timeOnPage = now - startTimeRef.current;
      const scrollDepth = calculateScrollDepth();
      
      onExitIntent({
        timeOnPage,
        scrollDepth
      });
    }
  }, [onExitIntent, sensitivity, delay, debounce, calculateScrollDepth, checkModalShown, checkUserEngagement]);

  // Mobile specific: scroll-based exit intent (when user scrolls up significantly)
  const handleMobileScroll = useCallback(() => {
    const now = Date.now();
    
    // Check if modal has already been shown
    if (checkModalShown()) {
      return;
    }
    
    // Check if user is actively engaged (typing, clicking, etc.)
    if (checkUserEngagement()) {
      return;
    }
    
    // Check if enough time has passed since page load
    if (now - startTimeRef.current < delay) {
      return;
    }
    
    // Check if enough time has passed since last trigger
    if (now - lastTriggeredRef.current < debounce) {
      return;
    }
    
    // Check if user is scrolling up and near top of page (more restrictive)
    if (window.scrollY <= 50) { // Very near top of page
      lastTriggeredRef.current = now;
      hasShownModal.current = true;
      
      // IMMEDIATELY mark as shown in session storage to prevent multiple triggers
      sessionStorage.setItem('exitIntentModalShown', 'true');
      
      const timeOnPage = now - startTimeRef.current;
      const scrollDepth = calculateScrollDepth();
      
      onExitIntent({
        timeOnPage,
        scrollDepth
      });
    }
  }, [onExitIntent, delay, debounce, calculateScrollDepth, checkModalShown, checkUserEngagement]);

  useEffect(() => {
    // Track scroll depth
    window.addEventListener('scroll', handleScroll);
    
    // Desktop: Track mouse movement for exit intent
    document.addEventListener('mousemove', handleMouseMove);
    
    // Mobile: Track touch movement for exit intent
    document.addEventListener('touchmove', handleTouchMove);
    
    // Track user engagement signals to prevent annoying active users
    document.addEventListener('click', handleUserEngagement);
    document.addEventListener('keydown', handleUserEngagement);
    document.addEventListener('input', handleUserEngagement);
    document.addEventListener('focus', handleUserEngagement, true);
    
    // Mobile: Add alternative scroll-based exit intent
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      // Add a secondary scroll-based trigger for mobile
      let scrollTimeout: NodeJS.Timeout;
      const throttledMobileScroll = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(handleMobileScroll, 150);
      };
      window.addEventListener('scroll', throttledMobileScroll);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('click', handleUserEngagement);
        document.removeEventListener('keydown', handleUserEngagement);
        document.removeEventListener('input', handleUserEngagement);
        document.removeEventListener('focus', handleUserEngagement, true);
        window.removeEventListener('scroll', throttledMobileScroll);
      };
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('click', handleUserEngagement);
      document.removeEventListener('keydown', handleUserEngagement);
      document.removeEventListener('input', handleUserEngagement);
      document.removeEventListener('focus', handleUserEngagement, true);
    };
  }, [handleMouseMove, handleScroll, handleTouchMove, handleMobileScroll, handleUserEngagement]);

  // Reset start time when component mounts and check session storage
  useEffect(() => {
    startTimeRef.current = Date.now();
    maxScrollRef.current = 0;
    
    // Immediately check if modal was already shown this session
    const modalShown = sessionStorage.getItem('exitIntentModalShown');
    if (modalShown) {
      hasShownModal.current = true;
    }
  }, []);

  return {
    getTimeOnPage: () => Date.now() - startTimeRef.current,
    getScrollDepth: () => maxScrollRef.current
  };
};