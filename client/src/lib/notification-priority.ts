interface NotificationEnvironment {
  isPWA: boolean;
  isStandalone: boolean;
  hasServiceWorker: boolean;
  browserSupportsNotifications: boolean;
}

class NotificationPriorityManager {
  private static instance: NotificationPriorityManager;

  private constructor() {}

  static getInstance(): NotificationPriorityManager {
    if (!NotificationPriorityManager.instance) {
      NotificationPriorityManager.instance = new NotificationPriorityManager();
    }
    return NotificationPriorityManager.instance;
  }

  // Detect the current notification environment
  detectEnvironment(): NotificationEnvironment {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isPWA = isStandalone || 
                  (window.navigator as any).standalone === true ||
                  document.referrer.includes('android-app://') ||
                  /wv|WebView/i.test(navigator.userAgent);
    
    const hasServiceWorker = 'serviceWorker' in navigator;
    const browserSupportsNotifications = 'Notification' in window;

    return {
      isPWA,
      isStandalone,
      hasServiceWorker,
      browserSupportsNotifications
    };
  }

  // Determine if this instance should handle notifications
  shouldHandleNotifications(): boolean {
    const env = this.detectEnvironment();
    
    console.log('Priority manager environment:', env);
    console.log('PWA handler check:', this.isPWAHandlingNotifications());
    
    // PWA always takes priority
    if (env.isPWA || env.isStandalone) {
      console.log('✅ PWA/Standalone detected - taking priority');
      this.markAsPrimaryNotificationHandler();
      return true;
    }

    // Check if PWA is installed and handling notifications
    if (this.isPWAHandlingNotifications()) {
      console.log('⚠️  Deferring to active PWA instance');
      return false; // Defer to PWA
    }

    // Browser can handle if no PWA is active
    const canHandle = env.browserSupportsNotifications;
    console.log('🌐 Browser handling notifications:', canHandle);
    return canHandle;
  }

  // Mark this instance as the primary notification handler
  private markAsPrimaryNotificationHandler(): void {
    localStorage.setItem('notificationHandler', 'pwa');
    localStorage.setItem('notificationHandlerTimestamp', Date.now().toString());
  }

  // Check if PWA is currently handling notifications
  private isPWAHandlingNotifications(): boolean {
    const handler = localStorage.getItem('notificationHandler');
    const timestamp = localStorage.getItem('notificationHandlerTimestamp');
    
    console.log('Checking PWA handler status:', { handler, timestamp });
    
    if (handler === 'pwa' && timestamp) {
      // Consider PWA active if marked within last 5 minutes
      const lastActive = parseInt(timestamp);
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      const isActive = lastActive > fiveMinutesAgo;
      console.log('PWA handler timestamp check:', { lastActive, fiveMinutesAgo, isActive });
      
      // For debugging: if we're in a non-PWA environment but localStorage says PWA is active,
      // clear the stale data
      const currentEnv = this.detectEnvironment();
      if (!currentEnv.isPWA && !currentEnv.isStandalone && isActive) {
        console.log('Clearing stale PWA handler data from non-PWA environment');
        localStorage.removeItem('notificationHandler');
        localStorage.removeItem('notificationHandlerTimestamp');
        return false;
      }
      
      return isActive;
    }
    
    return false;
  }

  // Clear notification handler (called when app closes or becomes inactive)
  clearNotificationHandler(): void {
    const env = this.detectEnvironment();
    if (env.isPWA || env.isStandalone) {
      localStorage.removeItem('notificationHandler');
      localStorage.removeItem('notificationHandlerTimestamp');
    }
  }

  // Update last activity timestamp
  updateActivity(): void {
    const env = this.detectEnvironment();
    if (env.isPWA || env.isStandalone) {
      localStorage.setItem('notificationHandlerTimestamp', Date.now().toString());
    }
  }

  // Get notification priority status for debugging
  getStatus(): {
    environment: NotificationEnvironment;
    shouldHandle: boolean;
    handlerType: string;
    lastActivity: number | null;
  } {
    const environment = this.detectEnvironment();
    const shouldHandle = this.shouldHandleNotifications();
    const handlerType = localStorage.getItem('notificationHandler') || 'none';
    const lastActivity = localStorage.getItem('notificationHandlerTimestamp');
    
    return {
      environment,
      shouldHandle,
      handlerType,
      lastActivity: lastActivity ? parseInt(lastActivity) : null
    };
  }
}

export const notificationPriorityManager = NotificationPriorityManager.getInstance();