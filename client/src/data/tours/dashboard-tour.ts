import { TourConfig } from '@/contexts/OnboardingTourContext';

export const dashboardTour: TourConfig = {
  id: 'dashboard-intro',
  name: 'Dashboard Introduction',
  autoStart: true,
  allowSkip: true,
  showProgress: true,
  steps: [
    {
      id: 'welcome',
      target: 'dashboard-title',
      title: 'Welcome to Your Dashboard',
      content: 'This is your command center. Here you can track your progress, engage with content, and stay on top of your personal development journey.',
      placement: 'bottom',
      showNext: true,
      showPrev: false,
      showSkip: true
    },
    {
      id: 'learning',
      target: 'main-navigation',
      title: 'Learning Section',
      content: 'Access structured courses covering leadership, relationships, and personal growth. Complete lessons to earn XP and build knowledge.',
      placement: 'bottom',
      showNext: true,
      showPrev: true,
      showSkip: true,
      beforeShow: () => {
        const element = document.querySelector('[data-tour="main-navigation"]');
        return element !== null;
      }
    },
    {
      id: 'challenges',
      target: 'daily-challenge',
      title: 'Daily Challenges',
      content: 'Build discipline and character through daily challenges. Complete them to earn XP, maintain your streak, and develop consistent positive habits.',
      placement: 'top',
      showNext: true,
      showPrev: true,
      showSkip: true,

      beforeShow: () => {
        const element = document.querySelector('[data-tour="daily-challenge"]');
        return element !== null;
      }
    }
  ]
};