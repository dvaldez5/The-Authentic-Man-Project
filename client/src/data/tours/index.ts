import { TourConfig } from '@/contexts/OnboardingTourContext';
import { dashboardTour } from './dashboard-tour';
import { learningTour } from './learning-tour';
import { journalTour } from './journal-tour';
import { weeklyReflectionsTour } from './weekly-reflections-tour';

const tours: Record<string, TourConfig> = {
  'dashboard-intro': dashboardTour,
  'learning-intro': learningTour,
  'journal-intro': journalTour,
  'weekly-reflection-intro': weeklyReflectionsTour,
};

export function getTourById(tourId: string): TourConfig | null {
  return tours[tourId] || null;
}

export function getAllTours(): TourConfig[] {
  return Object.values(tours);
}

export { dashboardTour, learningTour, journalTour, weeklyReflectionsTour };