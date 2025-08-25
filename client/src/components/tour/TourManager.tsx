import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useOnboardingTour } from '@/contexts/OnboardingTourContext';
import { getTourById } from '@/data/tours';

export function TourManager() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const { startTour, isTourCompleted, isActive } = useOnboardingTour();

  useEffect(() => {
    if (!user || !user.onboardingComplete || isActive) return;
    
    const isAppTourComplete = isTourCompleted('app-tour-complete');
    if (isAppTourComplete) return;
    
    // Check for tour parameter in URL for transitions
    const urlParams = new URLSearchParams(window.location.search);
    const tourParam = urlParams.get('tour');
    
    if (tourParam) {
      const tour = getTourById(tourParam);
      if (tour) {
        window.history.replaceState({}, '', window.location.pathname);
        startTour(tour);
        return;
      }
    }
    
    if (location === '/dashboard') {
      const tour = getTourById('dashboard-intro');
      if (tour) {
        startTour(tour);
      }
    }
  }, [user, location, isActive, startTour, isTourCompleted]);

  return null;
}