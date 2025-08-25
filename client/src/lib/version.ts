/**
 * Version information for The AM Project
 * This file is automatically updated during releases
 */

export const VERSION = {
  number: '2.9.4',
  name: 'UI Consistency Enhancement',
  releaseDate: '2025-07-07',
  buildNumber: 294,
  features: {
    userBenefits: {
      smartReminders: 'Never miss your daily growth',
      privateJournal: 'Secure reflection space',
      progressTracking: 'See your transformation',
      flexiblePacing: 'Work at your own speed',
      expertContent: 'Professionally designed challenges'
    },
    subscription: {
      monthlyPrice: '$9.99',
      freeTrial: '7 days',
      value: 'Less than a coffee per week'
    }
  },
  status: 'production-ready'
} as const;

export const getVersionInfo = () => {
  return {
    version: VERSION.number,
    name: VERSION.name,
    releaseDate: VERSION.releaseDate,
    buildNumber: VERSION.buildNumber,
    status: VERSION.status
  };
};

export const getFeatureStatus = () => {
  return VERSION.features;
};

// Export VERSION_INFO for compatibility (deprecated, use VERSION instead)
export const VERSION_INFO = VERSION;

// Version history for reference
export const VERSION_HISTORY = [
  {
    version: '2.9.4',
    date: '2025-07-07',
    type: 'minor',
    description: 'UI consistency enhancement - updated AM Standard accordion borders to match Join page cards'
  },
  {
    version: '2.9.3',
    date: '2025-07-07',
    type: 'major',
    description: 'Complete ResetDiscipline landing page optimization with alarming crisis statistics and benefit-focused content'
  },
  {
    version: '2.8.8',
    date: '2025-06-28',
    type: 'critical',
    description: 'Challenge completion synchronization fix with enhanced React Query cache strategy'
  },
  {
    version: '2.3.0',
    date: '2025-06-20',
    type: 'minor',
    description: 'Unified journal styling & scenario reflection improvements'
  },
  {
    version: '2.2.0',
    date: '2025-06-19',
    type: 'minor',
    description: 'Database expansion - 30 new scenarios'
  },
  {
    version: '2.1.0',
    date: '2024-12-19',
    type: 'minor',
    description: 'Advanced notification system with 9 AM quiet hours & enhanced Stripe features'
  },
  {
    version: '2.0.0', 
    date: '2025-06-18',
    type: 'major',
    description: 'Complete Stripe payment integration with subscription management'
  },
  {
    version: '1.0.0',
    date: 'Initial Release',
    type: 'major', 
    description: 'PWA foundation with core user system and basic features'
  }
] as const;