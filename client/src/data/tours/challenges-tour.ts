import { TourConfig } from '@/contexts/OnboardingTourContext';

export const challengesTour: TourConfig = {
  id: 'challenges-intro',
  name: 'Daily Challenges Introduction',
  autoStart: true,
  allowSkip: true,
  showProgress: true,
  steps: [
    {
      id: 'welcome',
      target: 'challenges-title',
      title: 'Daily Challenge Center',
      content: 'Welcome to your daily challenge hub. This is where discipline meets character development through consistent daily actions.',
      placement: 'bottom',
      showNext: true,
      showPrev: false,
      showSkip: true
    },
    {
      id: 'daily-practice',
      target: 'current-challenge',
      title: 'Today\'s Challenge',
      content: 'Each day brings a new character-building challenge. Complete them to earn XP, maintain your streak, and develop lasting positive habits.',
      placement: 'bottom',
      showNext: true,
      showPrev: true,
      showSkip: true,
      beforeShow: () => {
        const element = document.querySelector('[data-tour="current-challenge"]');
        return element !== null;
      }
    },
    {
      id: 'progress-tracking',
      target: 'challenge-streak',
      title: 'Streak & Progress',
      content: 'Track your consistency and build momentum. Your challenge streak is a powerful indicator of character development and discipline.',
      placement: 'bottom',
      showNext: true,
      showPrev: true,
      showSkip: true,
      beforeShow: () => {
        const element = document.querySelector('[data-tour="challenge-streak"]');
        return element !== null;
      }
    },
    {
      id: 'finish',
      target: 'challenge-action-button',
      title: 'Start Building Character',
      content: 'Perfect! Daily challenges are the foundation of authentic masculine development. Take on today\'s challenge and begin building your character.',
      placement: 'top',
      showNext: true,
      showPrev: true,
      showSkip: true,
      action: () => {
        console.log('Challenges tour completed');
      },
      beforeShow: () => {
        const element = document.querySelector('[data-tour="challenge-action-button"]');
        return element !== null;
      }
    }
  ]
};