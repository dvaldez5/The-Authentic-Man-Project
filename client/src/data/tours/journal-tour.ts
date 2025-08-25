import { TourConfig } from '@/contexts/OnboardingTourContext';

export const journalTour: TourConfig = {
  id: 'journal-intro',
  name: 'Journal Introduction',
  autoStart: true,
  allowSkip: true,
  showProgress: true,
  steps: [
    {
      id: 'welcome',
      target: 'journal-title',
      title: 'Your Daily Journal',
      content: 'Welcome to your daily journal space. This is where you capture insights from lessons, challenges, and scenarios as they happen throughout your development journey.',
      placement: 'bottom',
      showNext: true,
      showPrev: false,
      showSkip: true
    },
    {
      id: 'entries',
      target: 'journal-entries',
      title: 'Daily Entry Collection',
      content: 'Your daily journal entries are stored here - lesson insights, challenge responses, scenario decisions, and personal thoughts. This is different from your weekly reflections which have their own dedicated space.',
      placement: 'top',
      showNext: true,
      showPrev: true,
      showSkip: true
    },
    {
      id: 'types',
      target: 'entry-types',
      title: 'Daily Entry Types',
      content: 'See your daily entries organized by type: lesson insights (from completed courses), challenge logs (daily wins and lessons), and scenario responses (decision-making practice). Note: Weekly reflections are separate and handled on the dedicated reflections page.',
      placement: 'top',
      showNext: true,
      showPrev: true,
      showSkip: true
    },
    {
      id: 'navigate-weekly',
      target: 'journal-title',
      title: 'Next: Weekly Reflections',
      content: 'Perfect! You now understand daily journaling. Next, let\'s explore the separate weekly reflection system where you conduct deeper analysis and set weekly goals with AI guidance.',
      placement: 'bottom',
      showNext: true,
      showPrev: true,
      showSkip: true
    }
  ]
};