/**
 * Push Notifications utility for PWA
 * Handles push notification subscriptions and messaging
 */

export class PushNotifications {
  /**
   * Request notification permission from user
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  /**
   * Subscribe to push notifications
   */
  static async subscribe(): Promise<PushSubscription | null> {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push messaging is not supported');
        return null;
      }

      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.log('Push notification permission denied');
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        return existingSubscription;
      }

      // Subscribe with VAPID keys (you'll need to set these)
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // You'll need to add your VAPID public key here for production
        // applicationServerKey: urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY')
      });

      console.log('Push notification subscription successful');
      
      // Send subscription to server
      try {
        await fetch('/api/push-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
      } catch (error) {
        console.log('Failed to send subscription to server:', error);
      }

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  static async unsubscribe(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator)) {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const success = await subscription.unsubscribe();
        if (success) {
          // Notify server
          try {
            await fetch('/api/push-subscription', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(subscription)
            });
          } catch (error) {
            console.log('Failed to notify server of unsubscription:', error);
          }
        }
        return success;
      }

      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  /**
   * Get current subscription status
   */
  static async getSubscription(): Promise<PushSubscription | null> {
    try {
      if (!('serviceWorker' in navigator)) {
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Failed to get push subscription:', error);
      return null;
    }
  }

  /**
   * Register for periodic background sync
   */
  static async registerPeriodicSync(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator)) {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Check if periodic sync is supported
      if ('periodicSync' in registration) {
        await (registration as any).periodicSync.register('periodic-sync', {
          minInterval: 24 * 60 * 60 * 1000, // 24 hours
        });
        console.log('Periodic background sync registered');
        return true;
      }

      console.log('Periodic background sync not supported');
      return false;
    } catch (error) {
      console.error('Failed to register periodic sync:', error);
      return false;
    }
  }

  /**
   * Show a local notification (fallback when push isn't available)
   */
  static async showLocalNotification(title: string, options: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
    requireInteraction?: boolean;
  } = {}) {
    try {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return null;
      }

      const notification = new Notification(title, {
        body: options.body,
        icon: options.icon || '/app-icon-192.png',
        badge: options.badge || '/notification-icon-192.png',
        tag: options.tag || 'local',
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        ...options
      });

      return notification;
    } catch (error) {
      console.error('Failed to show local notification:', error);
      return null;
    }
  }
}

/**
 * React hook for push notifications
 */
export function usePushNotifications() {
  const subscribe = () => PushNotifications.subscribe();
  const unsubscribe = () => PushNotifications.unsubscribe();
  const getSubscription = () => PushNotifications.getSubscription();
  const requestPermission = () => PushNotifications.requestPermission();
  const registerPeriodicSync = () => PushNotifications.registerPeriodicSync();
  const showLocalNotification = (title: string, options?: any) => 
    PushNotifications.showLocalNotification(title, options);

  return {
    subscribe,
    unsubscribe,
    getSubscription,
    requestPermission,
    registerPeriodicSync,
    showLocalNotification
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}