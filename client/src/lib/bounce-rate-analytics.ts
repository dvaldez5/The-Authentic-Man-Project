// Dedicated bounce rate and engagement tracking for marketing pages
// This provides comprehensive data to analyze user behavior and reduce bounce rates

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export interface EngagementMetrics {
  timeOnPage: number;
  scrollDepth: number;
  interactions: string[];
  formEngagement: boolean;
  exitIntent: boolean;
}

class BounceRateAnalytics {
  private static instance: BounceRateAnalytics;
  private sessionStartTime: number = Date.now();
  private maxScrollDepth: number = 0;
  private interactions: string[] = [];
  private formEngaged: boolean = false;
  private exitIntentDetected: boolean = false;
  private isActive: boolean = true;

  private constructor() {
    this.initializeTracking();
  }

  static getInstance(): BounceRateAnalytics {
    if (!BounceRateAnalytics.instance) {
      BounceRateAnalytics.instance = new BounceRateAnalytics();
    }
    return BounceRateAnalytics.instance;
  }

  private initializeTracking() {
    // Track exit intent (mouse leaving viewport at top)
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0 && !this.exitIntentDetected) {
        this.exitIntentDetected = true;
        this.trackEngagementEvent('exit_intent_detected');
      }
    });

    // Track visibility changes (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackSessionEnd();
      } else {
        this.sessionStartTime = Date.now(); // Reset timer when returning
      }
    });

    // Track form field interactions
    document.addEventListener('focus', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (!this.formEngaged) {
          this.formEngaged = true;
          this.trackEngagementEvent('form_engagement_started');
        }
      }
    }, true);

    // Track clicks on interactive elements
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
        const elementText = target.textContent?.trim().substring(0, 50) || 'unknown';
        this.addInteraction(`click_${elementText.toLowerCase().replace(/\s+/g, '_')}`);
      }
    });

    // Track beforeunload for session summary
    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd();
    });
  }

  trackScrollDepth(percentage: number) {
    if (percentage > this.maxScrollDepth) {
      this.maxScrollDepth = percentage;
      
      // Track significant scroll milestones
      if ([25, 50, 75, 90].includes(percentage)) {
        this.trackEngagementEvent(`scroll_depth_${percentage}`);
      }
    }
  }

  addInteraction(interaction: string) {
    this.interactions.push(interaction);
    this.trackEngagementEvent(`interaction_${interaction}`);
  }

  trackFormEngagement(fieldName: string) {
    if (!this.formEngaged) {
      this.formEngaged = true;
      this.trackEngagementEvent('form_engagement_started');
    }
    this.trackEngagementEvent(`form_field_${fieldName}_engaged`);
  }

  private trackEngagementEvent(eventName: string) {
    if (!window.gtag || !this.isActive) return;

    window.gtag('event', eventName, {
      event_category: 'bounce_analysis',
      event_label: eventName,
      custom_parameters: {
        time_on_page: this.getTimeOnPage(),
        max_scroll_depth: this.maxScrollDepth,
        total_interactions: this.interactions.length,
        form_engaged: this.formEngaged,
        page_path: window.location.pathname
      }
    });
  }

  private getTimeOnPage(): number {
    return Math.floor((Date.now() - this.sessionStartTime) / 1000);
  }

  getEngagementMetrics(): EngagementMetrics {
    return {
      timeOnPage: this.getTimeOnPage(),
      scrollDepth: this.maxScrollDepth,
      interactions: [...this.interactions],
      formEngagement: this.formEngaged,
      exitIntent: this.exitIntentDetected
    };
  }

  trackSessionEnd() {
    if (!this.isActive) return;

    const metrics = this.getEngagementMetrics();
    
    // Determine engagement level
    let engagementLevel = 'low';
    if (metrics.timeOnPage >= 30 || metrics.scrollDepth >= 50 || metrics.interactions.length >= 2) {
      engagementLevel = 'medium';
    }
    if (metrics.timeOnPage >= 60 || metrics.scrollDepth >= 75 || metrics.formEngagement || metrics.interactions.length >= 5) {
      engagementLevel = 'high';
    }

    // Send comprehensive session summary
    if (window.gtag) {
      window.gtag('event', 'session_end', {
        event_category: 'engagement_analysis',
        event_label: engagementLevel,
        custom_parameters: {
          session_duration: metrics.timeOnPage,
          max_scroll_depth: metrics.scrollDepth,
          total_interactions: metrics.interactions.length,
          form_engaged: metrics.formEngagement,
          exit_intent: metrics.exitIntent,
          page_path: window.location.pathname,
          engagement_score: this.calculateEngagementScore(metrics)
        }
      });
    }

    this.isActive = false;
  }

  private calculateEngagementScore(metrics: EngagementMetrics): number {
    let score = 0;
    
    // Time-based scoring
    if (metrics.timeOnPage >= 10) score += 20;
    if (metrics.timeOnPage >= 30) score += 30;
    if (metrics.timeOnPage >= 60) score += 50;
    
    // Scroll-based scoring
    if (metrics.scrollDepth >= 25) score += 10;
    if (metrics.scrollDepth >= 50) score += 20;
    if (metrics.scrollDepth >= 75) score += 30;
    
    // Interaction-based scoring
    score += Math.min(metrics.interactions.length * 10, 50);
    
    // Form engagement bonus
    if (metrics.formEngagement) score += 40;
    
    // Exit intent penalty
    if (metrics.exitIntent) score -= 20;
    
    return Math.max(0, Math.min(100, score));
  }

  // Reset for new page navigation
  reset() {
    this.sessionStartTime = Date.now();
    this.maxScrollDepth = 0;
    this.interactions = [];
    this.formEngaged = false;
    this.exitIntentDetected = false;
    this.isActive = true;
  }
}

// Export singleton instance
export const bounceRateAnalytics = BounceRateAnalytics.getInstance();

// Export helper functions for easy use in components
export const trackMarketingPageScroll = (percentage: number) => {
  bounceRateAnalytics.trackScrollDepth(percentage);
};

export const trackMarketingPageInteraction = (interaction: string) => {
  bounceRateAnalytics.addInteraction(interaction);
};

export const trackMarketingFormEngagement = (fieldName: string) => {
  bounceRateAnalytics.trackFormEngagement(fieldName);
};

export const getMarketingEngagementMetrics = () => {
  return bounceRateAnalytics.getEngagementMetrics();
};

export const resetMarketingAnalytics = () => {
  bounceRateAnalytics.reset();
};