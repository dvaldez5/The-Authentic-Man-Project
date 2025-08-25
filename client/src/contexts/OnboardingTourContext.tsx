import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  showNext?: boolean;
  showPrev?: boolean;
  showSkip?: boolean;
  isLastStep?: boolean;
  action?: () => void;
  beforeShow?: () => boolean;
}

export interface TourConfig {
  id: string;
  name: string;
  steps: TourStep[];
  autoStart?: boolean;
  allowSkip?: boolean;
  showProgress?: boolean;
}

interface OnboardingTourContextType {
  activeTour: TourConfig | null;
  currentStep: number;
  isActive: boolean;
  startTour: (tour: TourConfig) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  endTour: () => void;
  completedTours: string[];
  isTourCompleted: (tourId: string) => boolean;
  markTourCompleted: (tourId: string) => void;
}

const OnboardingTourContext = createContext<OnboardingTourContextType | undefined>(undefined);

const STORAGE_KEY = 'am-project-completed-tours';

export function OnboardingTourProvider({ children }: { children: ReactNode }) {
  const [activeTour, setActiveTour] = useState<TourConfig | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completedTours, setCompletedTours] = useState<string[]>([]);

  // Load completed tours from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCompletedTours(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load completed tours:', error);
    }
  }, []);

  // Save completed tours to localStorage
  const saveCompletedTours = (tours: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tours));
      setCompletedTours(tours);
    } catch (error) {
      console.warn('Failed to save completed tours:', error);
    }
  };

  const startTour = (tour: TourConfig) => {
    console.log('OnboardingTourContext: Starting tour', { 
      tourName: tour.name, 
      tourId: tour.id,
      stepCount: tour.steps.length,
      isCompleted: completedTours.includes(tour.id)
    });
    
    setActiveTour(tour);
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (!activeTour) return;
    
    const nextStepIndex = currentStep + 1;

    if (nextStepIndex >= activeTour.steps.length) {
      // Handle tour transitions using URL parameters
      markTourCompleted(activeTour.id);
      
      if (activeTour.id === 'dashboard-intro') {
        window.location.href = '/learning?tour=learning-intro';
      } else if (activeTour.id === 'learning-intro') {
        window.location.href = '/journal?tour=journal-intro';
      } else if (activeTour.id === 'journal-intro') {
        window.location.href = '/weekly-reflections?tour=weekly-reflection-intro';
      } else if (activeTour.id === 'weekly-reflection-intro') {
        markTourCompleted('app-tour-complete');
        endTour();
      } else {
        endTour();
      }
    } else {
      setCurrentStep(nextStepIndex);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    markTourCompleted('app-tour-complete');
    endTour();
  };

  const endTour = () => {
    if (activeTour && currentStep === activeTour.steps.length - 1 && activeTour.steps[currentStep].isLastStep) {
      markTourCompleted('app-tour-complete');
    }
    
    setActiveTour(null);
    setCurrentStep(0);
    setIsActive(false);
  };

  const isTourCompleted = (tourId: string) => {
    return completedTours.includes(tourId);
  };

  const markTourCompleted = (tourId: string) => {
    if (!completedTours.includes(tourId)) {
      const newCompletedTours = [...completedTours, tourId];
      saveCompletedTours(newCompletedTours);
    }
  };

  return (
    <OnboardingTourContext.Provider value={{
      activeTour,
      currentStep,
      isActive,
      startTour,
      nextStep,
      prevStep,
      skipTour,
      endTour,
      completedTours,
      isTourCompleted,
      markTourCompleted
    }}>
      {children}
    </OnboardingTourContext.Provider>
  );
}

export function useOnboardingTour() {
  const context = useContext(OnboardingTourContext);
  if (context === undefined) {
    throw new Error('useOnboardingTour must be used within an OnboardingTourProvider');
  }
  return context;
}