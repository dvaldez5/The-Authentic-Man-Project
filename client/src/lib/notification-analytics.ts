// Analytics and performance tracking for notification system

interface NotificationMetrics {
  sent: number;
  clicked: number;
  dismissed: number;
  failed: number;
}

interface ContentTestResult {
  variation: string;
  metrics: NotificationMetrics;
  timestamp: number;
}

class NotificationAnalytics {
  private static instance: NotificationAnalytics;
  
  private constructor() {}
  
  static getInstance(): NotificationAnalytics {
    if (!NotificationAnalytics.instance) {
      NotificationAnalytics.instance = new NotificationAnalytics();
    }
    return NotificationAnalytics.instance;
  }

  // Track notification events
  trackEvent(type: string, action: 'sent' | 'clicked' | 'dismissed' | 'failed', metadata?: any): void {
    const timestamp = Date.now();
    const event = {
      type,
      action,
      timestamp,
      metadata: metadata || {}
    };

    // Store in localStorage for persistence
    this.appendToHistory('notification_events', event);
    
    // Update real-time metrics
    this.updateMetrics(type, action);
    
    console.log(`📊 Notification Analytics: ${type} - ${action}`, event);
  }

  // Track A/B test results
  trackContentTest(type: string, variation: string, action: 'sent' | 'clicked' | 'dismissed'): void {
    const testKey = `content_test_${type}_${variation}`;
    const currentResults = this.getContentTestResults(testKey);
    
    currentResults.metrics[action]++;
    currentResults.timestamp = Date.now();
    
    localStorage.setItem(testKey, JSON.stringify(currentResults));
    
    console.log(`🧪 A/B Test: ${type} - ${variation} - ${action}`, currentResults);
  }

  // Get content test results
  private getContentTestResults(key: string): ContentTestResult {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to parse content test results:', e);
      }
    }
    
    return {
      variation: key.split('_').pop() || 'unknown',
      metrics: { sent: 0, clicked: 0, dismissed: 0, failed: 0 },
      timestamp: Date.now()
    };
  }

  // Update real-time metrics
  private updateMetrics(type: string, action: string): void {
    const metricsKey = `metrics_${type}`;
    const current = this.getMetrics(metricsKey);
    
    if (action in current) {
      (current as any)[action]++;
      localStorage.setItem(metricsKey, JSON.stringify(current));
    }
  }

  // Get metrics for a notification type
  private getMetrics(key: string): NotificationMetrics {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to parse metrics:', e);
      }
    }
    
    return { sent: 0, clicked: 0, dismissed: 0, failed: 0 };
  }

  // Append event to history with size limit
  private appendToHistory(key: string, event: any): void {
    const stored = localStorage.getItem(key);
    let history: any[] = [];
    
    if (stored) {
      try {
        history = JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to parse notification history:', e);
      }
    }
    
    history.push(event);
    
    // Keep only last 1000 events to manage storage
    if (history.length > 1000) {
      history = history.slice(-1000);
    }
    
    localStorage.setItem(key, JSON.stringify(history));
  }

  // Get analytics dashboard data
  getAnalyticsDashboard(): {
    totalEvents: number;
    typeBreakdown: Record<string, NotificationMetrics>;
    recentEvents: any[];
    contentTests: Record<string, ContentTestResult>;
    engagementRate: number;
  } {
    const events = this.getEventHistory();
    const typeBreakdown: Record<string, NotificationMetrics> = {};
    
    // Calculate type breakdown
    const notificationTypes = ['daily-challenge', 'streak-protection', 'course-reminder', 'habit-nudge', 'scenario-reminder', 're-engagement'];
    notificationTypes.forEach(type => {
      typeBreakdown[type] = this.getMetrics(`metrics_${type}`);
    });
    
    // Get recent events (last 24 hours)
    const recentEvents = events.filter(event => 
      Date.now() - event.timestamp < 24 * 60 * 60 * 1000
    ).slice(-50);
    
    // Get content test results
    const contentTests: Record<string, ContentTestResult> = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('content_test_')) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            contentTests[key] = JSON.parse(stored);
          } catch (e) {
            console.warn('Failed to parse content test:', e);
          }
        }
      }
    });
    
    // Calculate engagement rate
    const totalSent = Object.values(typeBreakdown).reduce((sum, metrics) => sum + metrics.sent, 0);
    const totalClicked = Object.values(typeBreakdown).reduce((sum, metrics) => sum + metrics.clicked, 0);
    const engagementRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
    
    return {
      totalEvents: events.length,
      typeBreakdown,
      recentEvents,
      contentTests,
      engagementRate
    };
  }

  // Get event history
  private getEventHistory(): any[] {
    const stored = localStorage.getItem('notification_events');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to parse event history:', e);
      }
    }
    return [];
  }

  // Clean up old data
  cleanupOldData(): void {
    const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
    
    // Clean event history
    const events = this.getEventHistory().filter(event => event.timestamp > cutoff);
    localStorage.setItem('notification_events', JSON.stringify(events));
    
    // Clean content test results
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('content_test_')) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const data = JSON.parse(stored);
            if (data.timestamp < cutoff) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            // Remove corrupted data
            localStorage.removeItem(key);
          }
        }
      }
    });
    
    console.log('🧹 Cleaned up old notification analytics data');
  }

  // Export analytics data for external analysis
  exportData(): string {
    const dashboard = this.getAnalyticsDashboard();
    return JSON.stringify(dashboard, null, 2);
  }
}

export const notificationAnalytics = NotificationAnalytics.getInstance();