// Comprehensive notification lifecycle management hook

import { useEffect, useCallback, useRef } from 'react';
import { notificationScheduler } from '@/lib/notification-scheduler';
import { notificationAnalytics } from '@/lib/notification-analytics';
import { notificationService } from '@/lib/notification-service';

interface NotificationLifecycleOptions {
  enableAutoCleanup?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableAnalytics?: boolean;
  cleanupInterval?: number; // in milliseconds
}

export function useNotificationLifecycle(options: NotificationLifecycleOptions = {}) {
  const {
    enableAutoCleanup = true,
    enablePerformanceMonitoring = true,
    enableAnalytics = true,
    cleanupInterval = 24 * 60 * 60 * 1000 // 24 hours
  } = options;

  const cleanupTimeoutRef = useRef<NodeJS.Timeout>();
  const performanceIntervalRef = useRef<NodeJS.Timeout>();

  // Setup notification click handlers
  const setupNotificationHandlers = useCallback(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        const { notificationType, url } = event.data;
        
        if (enableAnalytics) {
          notificationAnalytics.trackEvent(notificationType, 'clicked', { url });
        }
        
        // Navigate to the appropriate page
        if (url && typeof window !== 'undefined') {
          window.location.href = url;
        }
        
        console.log(`🔔 Notification clicked: ${notificationType} -> ${url}`);
      }
    });
  }, [enableAnalytics]);

  // Performance monitoring
  const startPerformanceMonitoring = useCallback(() => {
    if (!enablePerformanceMonitoring) return;

    performanceIntervalRef.current = setInterval(() => {
      try {
        const stats = notificationScheduler.getNotificationStats();
        
        // Log performance warnings
        if (stats.performance.successRate < 90) {
          console.warn(`⚠️ Notification success rate low: ${stats.performance.successRate.toFixed(1)}%`);
        }
        
        if (stats.scheduled > 10) {
          console.warn(`⚠️ High number of scheduled notifications: ${stats.scheduled}`);
        }
        
        // Check for permission changes
        if (stats.systemHealth.permissionStatus !== 'granted') {
          console.warn('⚠️ Notification permission not granted');
        }
        
      } catch (error) {
        console.error('Performance monitoring error:', error);
      }
    }, 60000); // Check every minute
  }, [enablePerformanceMonitoring]);

  // Auto cleanup old data
  const scheduleCleanup = useCallback(() => {
    if (!enableAutoCleanup) return;

    const performCleanup = () => {
      try {
        if (enableAnalytics) {
          notificationAnalytics.cleanupOldData();
        }
        
        // Clean up localStorage notification data
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('notification_') && key.includes('retry')) {
            localStorage.removeItem(key);
          }
        });
        
        console.log('🧹 Notification system cleanup completed');
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    };

    // Initial cleanup
    performCleanup();
    
    // Schedule recurring cleanup
    cleanupTimeoutRef.current = setInterval(performCleanup, cleanupInterval);
  }, [enableAutoCleanup, enableAnalytics, cleanupInterval]);

  // Initialize notification system
  const initializeNotificationSystem = useCallback(async () => {
    try {
      // Request permission if not already granted
      if (Notification.permission === 'default') {
        const permission = await notificationService.requestPermission();
        console.log(`🔔 Notification permission: ${permission}`);
      }
      
      // Setup service worker for notification handling
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        console.log('🔔 Service Worker ready for notifications');
        
        // Add message listener for notification interactions
        setupNotificationHandlers();
      }
      
      // Start monitoring and cleanup
      startPerformanceMonitoring();
      scheduleCleanup();
      
      console.log('✅ Notification lifecycle system initialized');
      
    } catch (error) {
      console.error('Failed to initialize notification system:', error);
    }
  }, [setupNotificationHandlers, startPerformanceMonitoring, scheduleCleanup]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (cleanupTimeoutRef.current) {
      clearInterval(cleanupTimeoutRef.current);
    }
    
    if (performanceIntervalRef.current) {
      clearInterval(performanceIntervalRef.current);
    }
    
    console.log('🧹 Notification lifecycle cleanup completed');
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeNotificationSystem();
    
    return cleanup;
  }, [initializeNotificationSystem, cleanup]);

  // Visibility change handler to optimize performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause performance monitoring when tab is hidden
        if (performanceIntervalRef.current) {
          clearInterval(performanceIntervalRef.current);
        }
      } else {
        // Resume performance monitoring when tab is visible
        if (enablePerformanceMonitoring) {
          startPerformanceMonitoring();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enablePerformanceMonitoring, startPerformanceMonitoring]);

  return {
    initializeNotificationSystem,
    cleanup,
    isSystemReady: Notification.permission === 'granted' && 'serviceWorker' in navigator
  };
}