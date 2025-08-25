import { TourConfig } from '@/contexts/OnboardingTourContext';

export const learningTour: TourConfig = {
  id: 'learning-intro',
  name: 'Learning Introduction',
  autoStart: true,
  allowSkip: true,
  showProgress: true,
  steps: [
    {
      id: 'welcome',
      target: 'learning-title',
      title: 'Your Learning Center',
      content: 'Welcome to your core development space. Here you\'ll find structured courses covering essential topics like leadership, relationships, and personal growth.',
      placement: 'bottom',
      showNext: true,
      showPrev: false,
      showSkip: true
    },
    {
      id: 'courses',
      target: 'course-list',
      title: 'Browse Courses',
      content: 'Each course contains multiple lessons with practical insights and actionable strategies. Choose courses that align with your current development goals.',
      placement: 'top',
      showNext: true,
      showPrev: true,
      showSkip: true,
      beforeShow: () => {
        const element = document.querySelector('[data-tour="course-list"]');
        return element !== null;
      }
    },
    {
      id: 'lessons',
      target: 'lesson-content',
      title: 'Lesson Structure',
      content: 'Each lesson includes key takeaways and reflection prompts. Complete lessons to earn 100 XP and track your learning progress.',
      placement: 'top',
      showNext: true,
      showPrev: true,
      showSkip: true,

      beforeShow: () => {
        const element = document.querySelector('[data-tour="lesson-content"]');
        return element !== null;
      }
    }
  ]
};