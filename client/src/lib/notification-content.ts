// Dynamic notification content generator with A/B testing capabilities

interface ContentVariation {
  title: string;
  body: string;
  weight: number; // For A/B testing - higher weight = more likely to be selected
}

interface UserContext {
  currentStreak?: number;
  daysSinceLastActivity?: number;
  progressPercentage?: number;
  courseName?: string;
  timeOfDay?: number;
  isNewUser?: boolean;
  hasActiveStreak?: boolean;
}

class NotificationContentGenerator {
  private static instance: NotificationContentGenerator;
  
  private constructor() {}
  
  static getInstance(): NotificationContentGenerator {
    if (!NotificationContentGenerator.instance) {
      NotificationContentGenerator.instance = new NotificationContentGenerator();
    }
    return NotificationContentGenerator.instance;
  }

  // A/B test variations for different notification types
  private getContentVariations(): Record<string, ContentVariation[]> {
    return {
      'daily-challenge': [
        {
          title: "Today's challenge is ready.",
          body: "Show up. Push forward. This is how we build.",
          weight: 30
        },
        {
          title: "Ready to build today?",
          body: "Your daily challenge is waiting. Small actions, big impact.",
          weight: 25
        },
        {
          title: "Challenge accepted?",
          body: "Today's growth opportunity is here. Let's do this.",
          weight: 25
        },
        {
          title: "Time to level up.",
          body: "Every challenge completed makes you stronger. Start now.",
          weight: 20
        }
      ],
      'habit-nudge': [
        {
          title: "Keep the momentum.",
          body: "Consistency builds character. Today matters.",
          weight: 30
        },
        {
          title: "Stay on track.",
          body: "You've been building something great. Don't stop now.",
          weight: 25
        },
        {
          title: "Progress waits for no one.",
          body: "Small daily actions create lasting change. Your turn.",
          weight: 25
        },
        {
          title: "Build the habit.",
          body: "Champions are made through consistency. Show up today.",
          weight: 20
        }
      ],
      'streak-protection': [
        {
          title: "Protect your progress.",
          body: "You've built something valuable. Don't let it slip away today.",
          weight: 40
        },
        {
          title: "Your streak is at risk.",
          body: "All that momentum shouldn't go to waste. Take action now.",
          weight: 35
        },
        {
          title: "Don't break the chain.",
          body: "Every day counts. Keep your winning streak alive.",
          weight: 25
        }
      ],
      're-engagement': [
        {
          title: "Your growth continues here.",
          body: "Every expert was once a beginner. Ready to take the next step?",
          weight: 30
        },
        {
          title: "Ready to restart?",
          body: "Your journey is waiting. Pick up where you left off.",
          weight: 25
        },
        {
          title: "Time to get back in.",
          body: "Growth happens when you show up. Welcome back.",
          weight: 25
        },
        {
          title: "Your potential is calling.",
          body: "The path forward is still there. Ready to walk it?",
          weight: 20
        }
      ],
      'course-reminder': [
        {
          title: "Ready to continue learning?",
          body: "Your progress is saved. Pick up where you left off and keep building.",
          weight: 35
        },
        {
          title: "Learning never stops.",
          body: "You were making great progress. Time to continue the journey.",
          weight: 30
        },
        {
          title: "Knowledge is waiting.",
          body: "Every lesson brings you closer to mastery. Let's continue.",
          weight: 35
        }
      ],
      'scenario-reminder': [
        {
          title: "Decision time.",
          body: "Real situations need real decisions. Step in and choose your path.",
          weight: 30
        },
        {
          title: "What would you do?",
          body: "Life doesn't give you a script. Practice making the right call.",
          weight: 25
        },
        {
          title: "Test your judgment.",
          body: "Pressure reveals character. How will you respond?",
          weight: 25
        },
        {
          title: "Real-world practice.",
          body: "Every scenario prepares you for life. Take on the challenge.",
          weight: 20
        }
      ]
    };
  }

  // Select content based on weighted random selection for A/B testing
  private selectVariation(variations: ContentVariation[]): ContentVariation {
    const totalWeight = variations.reduce((sum, variation) => sum + variation.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const variation of variations) {
      random -= variation.weight;
      if (random <= 0) {
        return variation;
      }
    }
    
    return variations[0]; // Fallback
  }

  // Generate personalized notification content
  generateContent(type: string, context: UserContext = {}): { title: string; body: string } {
    const variations = this.getContentVariations()[type];
    if (!variations) {
      return {
        title: "The AM Project",
        body: "Time to continue building yourself."
      };
    }

    const baseContent = this.selectVariation(variations);
    
    // Personalize based on context
    return this.personalizeContent(type, baseContent, context);
  }

  // Personalize content based on user context
  private personalizeContent(
    type: string, 
    content: ContentVariation, 
    context: UserContext
  ): { title: string; body: string } {
    let { title, body } = content;
    const { currentStreak, daysSinceLastActivity, progressPercentage, courseName, timeOfDay } = context;

    // Personalization based on notification type and context
    switch (type) {
      case 'daily-challenge':
        if (currentStreak && currentStreak > 0) {
          body = `Day ${currentStreak + 1} starts now. Keep the momentum rolling.`;
        } else if (timeOfDay && timeOfDay < 12) {
          body = "Start strong. Today's challenge sets the tone for everything else.";
        } else if (timeOfDay && timeOfDay >= 18) {
          body = "End the day right. Complete today's challenge before tomorrow begins.";
        }
        break;

      case 'streak-protection':
        if (currentStreak && currentStreak > 7) {
          title = `Don't break your ${currentStreak}-day streak!`;
          body = `${currentStreak} days of consistency. That's real momentum. Keep it going.`;
        } else if (currentStreak && currentStreak > 2) {
          body = `${currentStreak} days in a row. You're building something special.`;
        }
        break;

      case 'course-reminder':
        if (courseName && progressPercentage) {
          title = `${courseName} is waiting for you.`;
          body = `You're ${progressPercentage}% done. Let's finish what you started.`;
        } else if (progressPercentage && progressPercentage > 50) {
          body = `You're more than halfway there. Time to push through to the finish.`;
        }
        break;

      case 're-engagement':
        if (daysSinceLastActivity) {
          if (daysSinceLastActivity <= 3) {
            body = "Just a few days off. Ready to jump back in?";
          } else if (daysSinceLastActivity <= 14) {
            body = "Two weeks can feel like forever. Your growth is still waiting.";
          } else {
            body = "It's been a while, but the path forward is still clear. Ready to restart?";
          }
        }
        break;

      case 'habit-nudge':
        if (currentStreak && currentStreak > 0) {
          body = `${currentStreak} days and counting. Don't let today be the exception.`;
        } else if (context.isNewUser) {
          body = "Every journey starts with a single step. Make today count.";
        }
        break;
    }

    return { title, body };
  }

  // Track content performance for A/B testing
  trackContentPerformance(type: string, variation: string, action: 'sent' | 'clicked' | 'dismissed'): void {
    // Import analytics here to avoid circular dependencies
    import('./notification-analytics').then(({ notificationAnalytics }) => {
      notificationAnalytics.trackContentTest(type, variation, action);
    }).catch(error => {
      console.warn('Failed to track content performance:', error);
    });
  }
}

export const contentGenerator = NotificationContentGenerator.getInstance();