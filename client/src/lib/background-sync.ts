/**
 * Background Sync utilities for offline data persistence
 * Queues API calls when offline and syncs when connection returns
 */

interface PendingSyncItem {
  id: string;
  url: string;
  method: string;
  headers?: Record<string, string>;
  data?: any;
  timestamp: number;
}

export class BackgroundSync {
  private static readonly STORAGE_KEY = 'am-pending-sync';

  /**
   * Queue an API call for background sync
   */
  static async queue(url: string, options: {
    method?: string;
    headers?: Record<string, string>;
    data?: any;
  } = {}) {
    try {
      const item: PendingSyncItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url,
        method: options.method || 'POST',
        headers: options.headers || { 'Content-Type': 'application/json' },
        data: options.data,
        timestamp: Date.now()
      };

      const pending = this.getPending();
      pending.push(item);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pending));

      // Try to register background sync
      if ('serviceWorker' in navigator && 'ServiceWorkerRegistration' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if ('sync' in registration) {
            await (registration as any).sync.register('background-sync');
          }
        } catch (error) {
          console.log('Background sync not supported:', error);
        }
      }

      console.log('Queued for background sync:', url);
      return item.id;
    } catch (error) {
      console.error('Failed to queue background sync:', error);
      throw error;
    }
  }

  /**
   * Try to sync immediately (for when connection is restored)
   */
  static async syncNow() {
    try {
      const pending = this.getPending();
      const successful: string[] = [];

      for (const item of pending) {
        try {
          const response = await fetch(item.url, {
            method: item.method,
            headers: item.headers || {},
            body: item.data ? JSON.stringify(item.data) : undefined
          });

          if (response.ok) {
            successful.push(item.id);
            console.log('Background sync successful:', item.url);
          } else {
            console.log('Background sync failed (will retry):', item.url, response.status);
          }
        } catch (error) {
          console.log('Background sync failed (will retry):', item.url, error);
        }
      }

      // Remove successful items
      if (successful.length > 0) {
        const remaining = pending.filter(item => !successful.includes(item.id));
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(remaining));
      }

      return { synced: successful.length, remaining: pending.length - successful.length };
    } catch (error) {
      console.error('Background sync failed:', error);
      return { synced: 0, remaining: this.getPending().length };
    }
  }

  /**
   * Get pending sync items
   */
  static getPending(): PendingSyncItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear all pending sync items
   */
  static clearPending() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Remove old pending items (older than 24 hours)
   */
  static cleanup() {
    const pending = this.getPending();
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    const recent = pending.filter(item => item.timestamp > cutoff);
    
    if (recent.length < pending.length) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recent));
    }
  }
}

/**
 * Hook for using background sync in React components
 */
export function useBackgroundSync() {
  const queueRequest = async (url: string, options?: {
    method?: string;
    headers?: Record<string, string>;
    data?: any;
  }) => {
    try {
      // Try immediate sync first
      const response = await fetch(url, {
        method: options?.method || 'POST',
        headers: options?.headers || { 'Content-Type': 'application/json' },
        body: options?.data ? JSON.stringify(options.data) : undefined
      });

      if (response.ok) {
        return response;
      }

      // If failed, queue for background sync
      await BackgroundSync.queue(url, options);
      return null;
    } catch (error) {
      // Network error, queue for background sync
      await BackgroundSync.queue(url, options);
      return null;
    }
  };

  return {
    queueRequest,
    syncNow: BackgroundSync.syncNow,
    getPending: BackgroundSync.getPending,
    clearPending: BackgroundSync.clearPending
  };
}

// Auto-cleanup on page load
if (typeof window !== 'undefined') {
  BackgroundSync.cleanup();
}