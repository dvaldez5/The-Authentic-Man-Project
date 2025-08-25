import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { notificationScheduler } from '@/lib/notification-scheduler';
import { notificationService } from '@/lib/notification-service';
import type { UserNotificationSettings } from '@shared/schema';

interface UserActivity {
  // Basic tracking
  lastChallengeDate?: Date;
  lastScenarioDate?: Date;
  lastLearningActivity?: Date;
  
  // Challenge-specific data
  hasCompletedTodaysChallenge?: boolean;
  currentStreak?: number;
  streakAtRisk?: boolean;
  daysSinceLastChallenge?: number;
  
  // Scenario data
  daysSinceLastScenario?: number;
  
  // Learning data
  daysSinceLastLearning?: number;
  
  // Course data
  stalledCourses?: Array<{
    title: string;
    progressPercentage: number;
    daysSinceLastProgress: number;
    completedLessons: number;
    totalLessons: number;
  }>;
  activeCourses?: Array<{
    title: string;
    progressPercentage: number;
    daysSinceLastProgress: number;
    completedLessons: number;
    totalLessons: number;
  }>;
  
  // User patterns
  isNewUser?: boolean;
  isChurningUser?: boolean;
  isActiveUser?: boolean;
  
  // Legacy compatibility
  hasActiveStreak?: boolean;
}

export function useNotificationManager() {
  const { user } = useAuth();

  // Load notification settings
  const { data: notificationSettings } = useQuery<UserNotificationSettings>({
    queryKey: ['/api/notification-settings'],
    enabled: !!user,
    retry: false
  });

  // Load user activity data
  const { data: userActivity } = useQuery<UserActivity>({
    queryKey: ['/api/user-activity'],
    enabled: !!user,
    retry: false
  });

  useEffect(() => {
    console.log('useNotificationManager useEffect triggered');
    console.log('- user:', !!user);
    console.log('- notificationSettings:', !!notificationSettings);
    console.log('- userActivity:', !!userActivity);
    
    if (!user) {
      console.log('No user - skipping notification initialization');
      return;
    }
    
    if (!notificationSettings || !userActivity) {
      console.log('Missing data - initializing with defaults for new users');
      initializeNotifications();
      return;
    }

    // Initialize notifications based on user settings and activity
    console.log('All conditions met - initializing notifications');
    initializeNotifications();
  }, [user, notificationSettings, userActivity]);

  const initializeNotifications = async () => {
    console.log('=== NOTIFICATION MANAGER INITIALIZATION ===');
    console.log('Settings available:', !!notificationSettings);
    console.log('User activity available:', !!userActivity);
    console.log('Browser notifications enabled:', notificationSettings?.enableBrowserNotifications);

    // Check if browser notifications are supported and enabled
    const permission = await notificationService.requestPermission();
    console.log('Permission status:', permission);
    
    if (permission !== 'granted') {
      console.log('❌ Notification permission not granted, skipping initialization');
      return;
    }

    // If user has explicitly disabled browser notifications in settings, respect that
    if (notificationSettings?.enableBrowserNotifications === false) {
      console.log('❌ Browser notifications explicitly disabled in user settings, skipping initialization');
      return;
    }

    // Cancel existing notifications and set up new ones
    notificationScheduler.cancelAllNotifications();

    // Initialize all notification types based on user activity
    try {
      await notificationScheduler.initializeNotificationsForUser(
        notificationSettings,
        userActivity as any
      );
      console.log('✅ Notification initialization completed successfully');
    } catch (error) {
      console.error('❌ Notification initialization failed:', error);
    }
  };

  const testNotification = async (type: string) => {
    const templates = {
      'daily-challenge': {
        title: "Today's challenge is ready.",
        body: "Show up. Push forward. This is how we build."
      },
      'weekly-reflection': {
        title: "Reflection unlocks growth.",
        body: "Take 5 minutes. Look back. Learn. The next week starts here."
      },
      'scenario-reminder': {
        title: "You're in it now. What would you do?",
        body: "Real-world pressure. One decision. Step into the scenario and choose your path."
      },
      'habit-nudge': {
        title: "Don't lose your streak.",
        body: "You've been consistent. Stay that way. Today still counts."
      },
      'course-reminder': {
        title: "Let's get you back on track.",
        body: "You paused. All good. But your course is waiting. Let's finish it."
      }
    };

    const template = templates[type as keyof typeof templates];
    if (template) {
      return await notificationService.showNotification({
        title: `[TEST] ${template.title}`,
        body: template.body,
        tag: `test-${type}`
      });
    }
    return false;
  };

  const scheduleImmediate = (type: string) => {
    switch (type) {
      case 'scenario-reminder':
        if (notificationSettings) {
          notificationScheduler.scheduleScenarioReminder(notificationSettings.notificationTime, notificationSettings.timezone);
        }
        break;
      case 'habit-nudge':
        if (notificationSettings) {
          notificationScheduler.scheduleHabitStreakNudge(notificationSettings.notificationTime, notificationSettings.timezone);
        }
        break;
      case 'daily-challenge':
        if (notificationSettings) {
          notificationScheduler.scheduleDailyChallengeNotification(
            notificationSettings.notificationTime,
            notificationSettings.timezone
          );
        }
        break;
      case 'weekly-reflection':
        if (notificationSettings) {
          notificationScheduler.scheduleWeeklyReflectionNotification(
            notificationSettings.notificationTime,
            notificationSettings.timezone
          );
        }
        break;
      case 'course-reminder':
        if (notificationSettings && userActivity?.stalledCourses?.[0]) {
          notificationScheduler.scheduleCourseReminder(
            notificationSettings.notificationTime,
            notificationSettings.timezone,
            userActivity.stalledCourses[0]?.title,
            userActivity.stalledCourses[0]?.progressPercentage
          );
        }
        break;
    }
  };

  return {
    notificationSettings,
    userActivity,
    initializeNotifications,
    testNotification,
    scheduleImmediate
  };
}