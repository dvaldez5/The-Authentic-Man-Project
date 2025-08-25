import { useEffect } from 'react';
import { useOnboardingTour } from '@/contexts/OnboardingTourContext';

export function TourOverlay() {
  const { isActive } = useOnboardingTour();

  useEffect(() => {
    if (isActive) {
      // Disable scroll when tour is active
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="tour-overlay fixed inset-0 bg-black/50 z-40 pointer-events-none" />
  );
}