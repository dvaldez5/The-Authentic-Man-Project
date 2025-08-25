import { notificationPriorityManager } from './notification-priority';

interface NotificationServiceOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: any;
}

class NotificationService {
  private static instance: NotificationService;
  private isSupported: boolean;
  private permission: NotificationPermission = 'default';

  private constructor() {
    const hasNotification = 'Notification' in window;
    const hasServiceWorker = 'serviceWorker' in navigator;
    
    console.log('Notification support check:', {
      hasNotification,
      hasServiceWorker,
      userAgent: navigator.userAgent.substring(0, 100)
    });
    
    this.isSupported = hasNotification && hasServiceWorker;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.initializeServiceWorker();
  }

  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        // Ensure ServiceWorker is registered and ready
        await navigator.serviceWorker.ready;
        console.log('ServiceWorker initialized and ready for notifications');
      } catch (error) {
        console.log('ServiceWorker initialization failed:', error);
      }
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Alternative permission request for WebView environments
  private async requestPermissionViaServiceWorker(): Promise<NotificationPermission> {
    try {
      console.log('Attempting WebView notification permission via ServiceWorker');
      console.log('ServiceWorker registration state:', {
        hasServiceWorker: 'serviceWorker' in navigator,
        controller: !!navigator.serviceWorker.controller
      });
      
      const registration = await navigator.serviceWorker.ready;
      console.log('ServiceWorker ready:', {
        scope: registration.scope,
        active: !!registration.active,
        installing: !!registration.installing,
        waiting: !!registration.waiting,
        activeState: registration.active?.state
      });
      
      // Check if ServiceWorker has notification capabilities
      console.log('Testing ServiceWorker notification capabilities...');
      
      // Try to show a test notification to check permission
      await registration.showNotification('AM Project - Notifications Enabled', {
        body: 'You will now receive daily challenges and reminders',
        tag: 'permission-test',
        icon: '/am-logo-notification.png',
        silent: true,
        requireInteraction: false,
        actions: []
      });
      
      console.log('WebView notification permission granted via ServiceWorker');
      this.isSupported = true;
      this.permission = 'granted';
      return 'granted';
      
    } catch (error) {
      console.log('WebView notification permission failed:', error);
      console.log('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack?.substring(0, 200) : undefined
      });
      this.permission = 'denied';
      return 'denied';
    }
  }

  // Show notification via ServiceWorker for WebView environments
  private async showNotificationViaServiceWorker(options: NotificationServiceOptions): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/am-logo-notification.png',
        badge: options.badge || '/app-icon-96.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        data: options.data,
        silent: false,
        vibrate: [200, 100, 200],
        timestamp: Date.now()
      });
      
      console.log('ServiceWorker notification shown successfully');
      return true;
      
    } catch (error) {
      console.error('ServiceWorker notification failed:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    console.log('Notification permission request started:', {
      hasNotification: 'Notification' in window,
      hasServiceWorker: 'serviceWorker' in navigator,
      permission: 'Notification' in window ? Notification.permission : 'N/A',
      userAgent: navigator.userAgent.substring(0, 100)
    });

    // Try WebView-specific approach first if in WebView environment
    if ('serviceWorker' in navigator && /wv|WebView/i.test(navigator.userAgent)) {
      console.log('WebView detected - attempting ServiceWorker notifications');
      return this.requestPermissionViaServiceWorker();
    }

    if (!this.isSupported) {
      console.log('Standard notifications not supported, no WebView fallback available');
      return 'denied';
    }

    // Check if already granted
    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      console.log('Current permission:', Notification.permission);
      console.log('Requesting notification permission...');
      
      // Request permission - this must be called directly from user interaction
      let permission: NotificationPermission;
      
      if (typeof Notification.requestPermission === 'function') {
        permission = await Notification.requestPermission();
      } else {
        // Fallback for older browsers
        permission = await new Promise((resolve) => {
          const result = Notification.requestPermission(resolve);
          if (result) resolve(result);
        });
      }
      
      this.permission = permission;
      console.log('Permission result:', permission);
      
      return permission;
    } catch (error) {
      console.error('Permission request failed:', error);
      this.permission = 'denied';
      return 'denied';
    }
  }

  getPermission(): NotificationPermission {
    // For WebView environments, check if ServiceWorker notifications actually work
    const isWebView = /wv|WebView/i.test(navigator.userAgent);
    
    if (isWebView && 'serviceWorker' in navigator) {
      // If we're in WebView and have confirmed ServiceWorker notifications don't work
      if (this.permission === 'denied') {
        return 'denied';
      }
      // If we haven't tested yet, return the cached permission
      return this.permission;
    }
    
    // For standard browsers, always return current permission
    if ('Notification' in window) {
      this.permission = Notification.permission;
      return this.permission;
    }
    return 'denied';
  }

  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  async showNotification(options: NotificationServiceOptions): Promise<boolean> {
    console.log('=== NOTIFICATION DEBUG START ===');
    console.log('Options:', options);
    
    // For WebView environments, check if we've enabled ServiceWorker notifications
    const isWebView = /wv|WebView/i.test(navigator.userAgent);
    const currentPermission = 'Notification' in window ? Notification.permission : (this.permission === 'granted' ? 'granted' : 'denied');
    
    console.log('Service state:', {
      isSupported: this.isSupported,
      isWebView,
      cachedPermission: this.permission,
      currentPermission: currentPermission,
      userAgent: navigator.userAgent.substring(0, 100)
    });

    // Use ServiceWorker for WebView or when standard notifications are not supported but we have permission
    if (isWebView && 'serviceWorker' in navigator && this.permission === 'granted') {
      console.log('Using ServiceWorker for WebView notification');
      return this.showNotificationViaServiceWorker(options);
    }

    if (!this.isSupported) {
      console.log('❌ Notifications not supported');
      return false;
    }

    if (currentPermission !== 'granted') {
      console.log('❌ Permission not granted:', currentPermission);
      return false;
    }

    // Check if this instance should handle notifications
    const shouldHandle = notificationPriorityManager.shouldHandleNotifications();
    console.log('Priority manager check:', shouldHandle);
    
    if (!shouldHandle) {
      console.log('⚠️  Notification deferred to PWA instance');
      return false;
    }

    // Update activity timestamp for PWA instances
    notificationPriorityManager.updateActivity();

    try {
      const notificationOptions = {
        body: options.body,
        icon: options.icon || '/am-logo-notification.png',
        badge: options.badge || '/app-icon-96.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        data: options.data,
        silent: false,
        vibrate: [200, 100, 200],
        timestamp: Date.now()
      };

      // Check if we're in a PWA environment (WebView with wv in user agent)
      const isPwa = /wv|WebView/i.test(navigator.userAgent);
      
      // Try ServiceWorker API first (required for PWAs, preferred for all)
      if ('serviceWorker' in navigator) {
        try {
          console.log('🔄 Attempting ServiceWorker notification...');
          
          // Get current registration or wait for ready state
          let registration = await navigator.serviceWorker.getRegistration();
          if (!registration) {
            console.log('No registration found, waiting for ready...');
            registration = await Promise.race([
              navigator.serviceWorker.ready,
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('ServiceWorker timeout')), 3000)
              )
            ]) as ServiceWorkerRegistration;
          }
          
          console.log('ServiceWorker registration:', {
            exists: !!registration,
            active: !!registration?.active,
            installing: !!registration?.installing,
            waiting: !!registration?.waiting,
            scope: registration?.scope,
            state: registration?.active?.state
          });
          
          // Ensure ServiceWorker is in the right state
          if (registration && (registration.active || registration.waiting)) {
            console.log('✅ Using ServiceWorker notification API');
            
            // Try to send notification regardless of worker state
            try {
              await registration.showNotification(options.title, notificationOptions);
              console.log('✅ ServiceWorker notification sent successfully');
              console.log('=== NOTIFICATION DEBUG END (SUCCESS) ===');
              return true;
            } catch (regError) {
              console.log('❌ registration.showNotification failed:', regError);
              // Worker state check for debugging
              const worker = registration.active || registration.waiting;
              console.log('Worker state:', worker?.state);
              // Continue to fallback logic below
            }
          } else {
            console.log('❌ ServiceWorker not ready or active');
          }
        } catch (swError) {
          console.log('❌ ServiceWorker notification failed:', swError);
          // For PWAs, try a different approach instead of failing immediately
          if (isPwa) {
            console.log('🔄 PWA fallback: attempting direct notification with error handling');
            try {
              // Try direct API even in PWA as last resort
              const notification = new Notification(options.title, notificationOptions);
              notification.onclick = () => {
                window.focus();
                notification.close();
              };
              console.log('✅ PWA direct notification fallback successful');
              return true;
            } catch (directError) {
              console.error('❌ PWA direct notification also failed:', directError);
              return false;
            }
          }
        }
      }

      // Only use direct Notification API for non-PWA environments
      if (!isPwa && 'Notification' in window) {
        try {
          console.log('🌐 Using direct Notification API as fallback');
          const notification = new Notification(options.title, notificationOptions);

          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          console.log('✅ Direct notification sent successfully');
          console.log('=== NOTIFICATION DEBUG END (SUCCESS) ===');
          return true;
        } catch (directError) {
          console.error('❌ Direct Notification API failed:', directError);
          console.log('=== NOTIFICATION DEBUG END (FAILED) ===');
          return false;
        }
      }

      // If we reach here, notification is not supported
      console.error('❌ Notifications not supported in this environment');
      console.log('=== NOTIFICATION DEBUG END (NOT SUPPORTED) ===');
      return false;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return false;
    }
  }

  // Predefined notification types for the app
  async showWeeklyReflectionReminder(): Promise<boolean> {
    return this.showNotification({
      title: 'Weekly Reflection Ready',
      body: 'Take a moment to reflect on your growth this week',
      tag: 'weekly-reflection',
      requireInteraction: true,
      data: { type: 'weekly-reflection', url: '/weekly-reflections' }
    });
  }

  async showDailyChallengeNotification(challengeText: string): Promise<boolean> {
    return this.showNotification({
      title: 'Daily Challenge',
      body: challengeText,
      tag: 'daily-challenge',
      data: { type: 'daily-challenge', url: '/challenges' }
    });
  }

  async showJournalReminder(): Promise<boolean> {
    return this.showNotification({
      title: 'Journal Time',
      body: 'Ready to capture your thoughts and insights?',
      tag: 'journal-reminder',
      data: { type: 'journal', url: '/journal' }
    });
  }

  async showCommunityNotification(message: string): Promise<boolean> {
    return this.showNotification({
      title: 'Community Update',
      body: message,
      tag: 'community',
      data: { type: 'community', url: '/community' }
    });
  }

  // Schedule notifications (basic implementation)
  scheduleNotification(options: NotificationServiceOptions & { delay: number }): number {
    return window.setTimeout(() => {
      this.showNotification(options);
    }, options.delay);
  }

  cancelScheduledNotification(id: number): void {
    clearTimeout(id);
  }

  // Check if notifications are enabled for this app
  async areNotificationsEnabled(): Promise<boolean> {
    if (!this.isSupported) return false;
    
    const permission = await this.requestPermission();
    return permission === 'granted';
  }
}

export const notificationService = NotificationService.getInstance();