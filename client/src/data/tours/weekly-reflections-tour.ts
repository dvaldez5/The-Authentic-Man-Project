import { TourConfig } from '@/contexts/OnboardingTourContext';

export const weeklyReflectionsTour: TourConfig = {
  id: 'weekly-reflection-intro',
  name: 'Weekly Reflections Introduction',
  autoStart: true,
  allowSkip: true,
  showProgress: true,
  steps: [
    {
      id: 'welcome',
      target: 'weekly-reflections-title',
      title: 'Weekly Reflection Space',
      content: 'Welcome to your weekly reflection center. This is where you conduct deeper analysis of your progress, set goals, and gain AI-powered insights.',
      placement: 'bottom',
      showNext: true,
      showPrev: false,
      showSkip: true
    },
    {
      id: 'ai-insights',
      target: 'reflection-prompt',
      title: 'AI-Powered Analysis',
      content: 'Get personalized weekly summaries and goal-setting prompts powered by AI, based on your completed lessons and challenges.',
      placement: 'bottom',
      showNext: true,
      showPrev: true,
      showSkip: true,
      beforeShow: () => {
        const element = document.querySelector('[data-tour="reflection-prompt"]');
        return element !== null;
      }
    },
    {
      id: 'goal-setting',
      target: 'weekly-goals',
      title: 'Weekly Goal Setting',
      content: 'Set specific, actionable goals for the upcoming week. Track your commitments and visualize your progress toward authentic character development.',
      placement: 'bottom',
      showNext: true,
      showPrev: true,
      showSkip: true,
      beforeShow: () => {
        const element = document.querySelector('[data-tour="weekly-goals"]');
        return element !== null;
      }
    },
    {
      id: 'finish',
      target: 'start-reflection-button',
      title: 'Tour Complete!',
      content: 'Perfect! You\'ve explored all the key areas of The AM Project. You\'re now ready to begin your authentic masculine development journey.',
      placement: 'top',
      showNext: false,
      showPrev: true,
      showSkip: false,
      isLastStep: true,
      beforeShow: () => {
        const element = document.querySelector('[data-tour="start-reflection-button"]');
        return element !== null;
      }
    }
  ]
};