import { notificationService } from './notification-service';
import { contentGenerator } from './notification-content';
import { notificationAnalytics } from './notification-analytics';

interface NotificationTrigger {
  id: string;
  type: 'daily-challenge' | 'weekly-reflection' | 'scenario-reminder' | 'habit-nudge' | 'course-reminder' | 'streak-protection' | 're-engagement' | 'weekly-reflection-nudge';
  title: string;
  body: string;
  tag: string;
  url: string;
}

class NotificationScheduler {
  private static instance: NotificationScheduler;
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();
  private notificationHistory: Map<string, Date[]> = new Map();
  private quietHours = { start: 22, end: 9 }; // 10 PM to 9 AM local time

  private constructor() {
    this.loadNotificationHistory();
  }

  // Get timezone offset in minutes using proper Intl API (handles DST automatically)
  private getTimezoneOffset(timezone: string): number {
    try {
      const now = new Date();
      
      // Use Intl.DateTimeFormat to get proper timezone offset
      const userTimeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'longOffset'
      });
      
      const utcFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        timeZoneName: 'longOffset'
      });
      
      // Get the actual offset by comparing the same moment in different timezones
      const userOffset = this.extractOffsetFromFormatter(userTimeFormatter, now);
      const utcOffset = this.extractOffsetFromFormatter(utcFormatter, now);
      
      // Return difference in minutes
      return utcOffset - userOffset;
    } catch (error) {
      console.error('Timezone offset calculation failed:', error);
      // Fallback to a simpler but less accurate method
      return new Date().getTimezoneOffset();
    }
  }

  // Extract numeric offset from Intl.DateTimeFormat result
  private extractOffsetFromFormatter(formatter: Intl.DateTimeFormat, date: Date): number {
    try {
      const parts = formatter.formatToParts(date);
      const offsetPart = parts.find(part => part.type === 'timeZoneName');
      
      if (offsetPart && offsetPart.value) {
        // Parse offset like "GMT-8" or "GMT+5:30"
        const match = offsetPart.value.match(/GMT([+-])(\d{1,2}):?(\d{0,2})/);
        if (match) {
          const sign = match[1] === '+' ? 1 : -1;
          const hours = parseInt(match[2], 10);
          const minutes = match[3] ? parseInt(match[3], 10) : 0;
          return sign * (hours * 60 + minutes);
        }
      }
      
      return 0;
    } catch {
      return 0;
    }
  }

  // Convert user timezone time to UTC for proper scheduling
  private convertUserTimeToUTC(userTime: Date, timezone: string): Date {
    try {
      // Get the timezone offset using Intl API
      const offsetMinutes = this.getTimezoneOffset(timezone);
      
      // Apply the offset to get UTC time
      const utcTime = new Date(userTime.getTime() + (offsetMinutes * 60 * 1000));
      
      return utcTime;
    } catch (error) {
      console.error('Failed to convert user time to UTC:', error);
      // Fallback: assume user time is already correct
      return userTime;
    }
  }

  // Load notification history from localStorage
  private loadNotificationHistory(): void {
    try {
      const stored = localStorage.getItem('notificationHistory');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.notificationHistory = new Map(
          Object.entries(parsed).map(([key, dates]) => [
            key,
            (dates as string[]).map(d => new Date(d))
          ])
        );
      }
    } catch (error) {
      console.error('Failed to load notification history:', error);
    }
  }

  // Save notification history to localStorage
  private saveNotificationHistory(): void {
    try {
      const toSave = Object.fromEntries(
        Array.from(this.notificationHistory.entries()).map(([key, dates]) => [
          key,
          dates.map(d => d.toISOString())
        ])
      );
      localStorage.setItem('notificationHistory', JSON.stringify(toSave));
    } catch (error) {
      console.error('Failed to save notification history:', error);
    }
  }

  // Check if notification frequency limit is exceeded
  private isRateLimited(type: string): boolean {
    const history = this.notificationHistory.get(type) || [];
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentNotifications = history.filter(date => date > oneDayAgo);

    // Rate limits by notification type
    const limits = {
      'daily-challenge': 2,      // Max 2 per day
      'habit-nudge': 3,          // Max 3 per day
      'streak-protection': 1,     // Max 1 per day (urgent)
      'scenario-reminder': 2,     // Max 2 per day
      'course-reminder': 1,       // Max 1 per day
      'weekly-reflection': 1,     // Max 1 per day
      're-engagement': 1          // Max 1 per day
    };

    const limit = limits[type as keyof typeof limits] || 1;
    return recentNotifications.length >= limit;
  }

  // Check if current time is within quiet hours using proper timezone handling
  private isQuietHours(timezone: string): boolean {
    try {
      const now = new Date();
      
      // Use Intl.DateTimeFormat for accurate timezone conversion
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false
      });
      
      const userHour = parseInt(formatter.format(now), 10);
      
      console.log(`Quiet hours check: ${userHour}:00 in ${timezone} (quiet hours: ${this.quietHours.start}:00-${this.quietHours.end}:00)`);
      
      return userHour >= this.quietHours.start || userHour < this.quietHours.end;
    } catch (error) {
      console.error('Quiet hours check failed:', error);
      return false; // Default to allowing notifications if timezone parsing fails
    }
  }

  // Record notification in history
  private recordNotification(type: string): void {
    const history = this.notificationHistory.get(type) || [];
    history.push(new Date());
    
    // Keep only last 30 days of history
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const filtered = history.filter(date => date > thirtyDaysAgo);
    
    this.notificationHistory.set(type, filtered);
    this.saveNotificationHistory();
  }

  // Trigger notification with proper template, rate limiting, and quiet hours
  private async triggerNotification(type: string, data?: any): Promise<void> {
    const template = this.getNotificationTemplates()[type];
    if (!template) {
      console.error(`No template found for notification type: ${type}`);
      return;
    }

    // Check rate limiting
    if (this.isRateLimited(type)) {
      console.log(`Notification ${type} rate limited - skipping`);
      return;
    }

    // Check quiet hours (except for urgent notifications)
    const isUrgent = type === 'streak-protection';
    const timezone = data?.timezone || 'America/New_York';
    if (!isUrgent && this.isQuietHours(timezone)) {
      console.log(`Notification ${type} blocked by quiet hours - will retry later`);
      // Schedule for next morning (9 AM)
      this.scheduleForMorning(type, data, timezone);
      return;
    }

    // Generate dynamic, personalized content using A/B testing
    const userContext = {
      currentStreak: data?.streakCount || data?.currentStreak,
      daysSinceLastActivity: data?.daysSinceLastActivity,
      progressPercentage: data?.progressPercentage,
      courseName: data?.courseName,
      timeOfDay: new Date().getHours(),
      isNewUser: data?.isNewUser,
      hasActiveStreak: data?.hasActiveStreak
    };

    const personalizedContent = contentGenerator.generateContent(type, userContext);
    let title = personalizedContent.title;
    let body = personalizedContent.body;

    // Override with specific content if provided
    if (data?.challengeText) {
      body = `Today's focus: ${data.challengeText}`;
    }

    try {
      await notificationService.showNotification({
        title,
        body,
        tag: template.tag,
        requireInteraction: type === 'streak-protection', // Only urgent notifications require interaction
        data: {
          type: template.type,
          url: template.url,
          ...data
        }
      });
      
      console.log(`Notification triggered: ${type}`, { title, body });
      this.recordNotification(type);
      this.scheduledNotifications.delete(type);
    } catch (error) {
      console.error(`Failed to trigger notification ${type}:`, error);
    }
  }

  // Schedule notification for next morning if blocked by quiet hours
  private scheduleForMorning(type: string, data: any, timezone: string): void {
    try {
      const now = new Date();
      const userTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
      
      // Schedule for 9 AM next day in user's timezone
      const nextMorning = new Date(userTime);
      nextMorning.setHours(9, 0, 0, 0);
      
      // If it's already past 9 AM today, schedule for tomorrow
      if (nextMorning <= userTime) {
        nextMorning.setDate(nextMorning.getDate() + 1);
      }
      
      // Convert to UTC properly
      const nextMorningUTC = this.convertUserTimeToUTC(nextMorning, timezone);
      const delay = nextMorningUTC.getTime() - Date.now();
      
      if (delay > 0) {
        console.log(`Scheduling ${type} for next morning: ${nextMorning.toLocaleString()} (${timezone}) -> UTC: ${nextMorningUTC.toISOString()}`);
        const timeoutId = setTimeout(() => {
          this.triggerNotification(type, { ...data, timezone });
        }, delay);
        this.scheduledNotifications.set(`${type}-morning`, timeoutId as any);
      }
    } catch (error) {
      console.error('Failed to schedule morning notification:', error);
    }
  }

  static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  // Predefined notification templates
  private getNotificationTemplates(): Record<string, NotificationTrigger> {
    return {
      'daily-challenge': {
        id: 'daily-challenge',
        type: 'daily-challenge',
        title: "Today's challenge is ready.",
        body: "Show up. Push forward. This is how we build.",
        tag: 'daily-challenge',
        url: '/challenges'
      },
      'weekly-reflection': {
        id: 'weekly-reflection', 
        type: 'weekly-reflection',
        title: "Reflection unlocks growth.",
        body: "Take 5 minutes. Look back. Learn. The next week starts here.",
        tag: 'weekly-reflection',
        url: '/weekly-reflections'
      },
      'scenario-reminder': {
        id: 'scenario-reminder',
        type: 'scenario-reminder', 
        title: "You're in it now. What would you do?",
        body: "Real-world pressure. One decision. Step into the scenario and choose your path.",
        tag: 'scenario-reminder',
        url: '/learning'
      },
      'habit-nudge': {
        id: 'habit-nudge',
        type: 'habit-nudge',
        title: "Don't lose your streak.",
        body: "You've been consistent. Stay that way. Today still counts.",
        tag: 'habit-nudge',
        url: '/challenges'
      },
      'course-reminder': {
        id: 'course-reminder',
        type: 'course-reminder',
        title: "Let's get you back on track.",
        body: "You paused. That's fine. But your course is waiting. Let's finish it.",
        tag: 'course-reminder',
        url: '/learning'
      },
      'streak-protection': {
        id: 'streak-protection',
        type: 'streak-protection',
        title: "You're about to lose your streak.",
        body: "One small action keeps it alive. You've worked too hard to let it go now.",
        tag: 'streak-protection',
        url: '/challenges'
      },
      're-engagement': {
        id: 're-engagement',
        type: 're-engagement',
        title: "Let's pick this back up.",
        body: "Whatever knocked you off course—it's behind you. Start fresh. Right now.",
        tag: 're-engagement',
        url: '/dashboard'
      },
      'weekly-reflection-nudge': {
        id: 'weekly-reflection-nudge',
        type: 'weekly-reflection-nudge',
        title: "Still time to reflect.",
        body: "Before the week ends, give yourself a moment to reset.",
        tag: 'weekly-reflection-nudge',
        url: '/weekly-reflections'
      }
    };
  }

  // Schedule a notification at a specific time
  scheduleNotification(
    notificationType: string, 
    scheduledTime: Date,
    customData?: { challengeText?: string; courseName?: string }
  ): void {
    const template = this.getNotificationTemplates()[notificationType];
    if (!template) return;

    const now = new Date().getTime();
    const targetTime = scheduledTime.getTime();
    const delay = Math.max(0, targetTime - now);

    // Cancel existing notification of same type
    this.cancelNotification(notificationType);

    const timeoutId = window.setTimeout(async () => {
      // Customize notification based on type and data
      let title = template.title;
      let body = template.body;

      if (notificationType === 'daily-challenge' && customData?.challengeText) {
        body = customData.challengeText;
      }
      
      if (notificationType === 'course-reminder' && customData?.courseName) {
        body = `Your "${customData.courseName}" course is waiting. Let's finish it.`;
      }

      await notificationService.showNotification({
        title,
        body,
        tag: template.tag,
        requireInteraction: true,
        data: {
          type: template.type,
          url: template.url
        }
      });

      // Clean up scheduled notification
      this.scheduledNotifications.delete(notificationType);
    }, delay);

    this.scheduledNotifications.set(notificationType, timeoutId as any);
  }

  // Schedule daily challenge notification using improved timezone handling
  scheduleDailyChallengeNotification(notificationTime: string, timezone: string, challengeText?: string): void {
    try {
      const [hours, minutes] = notificationTime.split(':').map(Number);
      
      // Get current time in user's timezone using proper Intl API
      const now = new Date();
      const userNow = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
      
      // Create target time for today in user's timezone
      const targetTime = new Date(userNow);
      targetTime.setHours(hours, minutes, 0, 0);
      
      // If time has passed today, schedule for tomorrow
      if (targetTime <= userNow) {
        targetTime.setDate(targetTime.getDate() + 1);
      }
      
      // Convert target time to UTC properly
      const targetUTC = this.convertUserTimeToUTC(targetTime, timezone);
      const delay = targetUTC.getTime() - Date.now();
      

      
      if (delay > 0) {
        console.log(`🕐 Scheduling daily challenge for: ${targetTime.toLocaleString()} (${timezone}) -> UTC: ${targetUTC.toISOString()}`);
        console.log(`⏱️  Delay: ${Math.round(delay / (60 * 1000))} minutes from now`);
        console.log(`📍 Timezone debug:`, {
          userNow: userNow.toISOString(),
          targetTime: targetTime.toISOString(),
          targetUTC: targetUTC.toISOString(),
          delayMs: delay
        });
        
        const timeoutId = setTimeout(() => {
          this.triggerNotification('daily-challenge', { challengeText, timezone });
        }, delay);
        
        this.scheduledNotifications.set('daily-challenge', timeoutId as any);
      } else {
        console.log('⚠️  Daily challenge time has already passed, scheduling for tomorrow');
      }
    } catch (error) {
      console.error('Failed to schedule daily challenge notification:', error);
    }
  }

  // Schedule weekly reflection notification (Sundays at notification time)
  scheduleWeeklyReflectionNotification(notificationTime: string, timezone: string): void {
    try {
      const [hours, minutes] = notificationTime.split(':').map(Number);
      
      // Get current time in user's timezone
      const now = new Date();
      const userNow = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
      
      // Find next Sunday (0 = Sunday)
      const currentDay = userNow.getDay();
      let daysToAdd = currentDay === 0 ? 0 : 7 - currentDay;
      
      const targetTime = new Date(userNow);
      targetTime.setDate(userNow.getDate() + daysToAdd);
      targetTime.setHours(hours, minutes, 0, 0);
      
      // If it's Sunday and time has passed, schedule for next Sunday
      if (currentDay === 0 && targetTime <= userNow) {
        targetTime.setDate(targetTime.getDate() + 7);
      }
      
      // Convert to UTC properly
      const targetUTC = this.convertUserTimeToUTC(targetTime, timezone);
      const delay = targetUTC.getTime() - Date.now();
      
      if (delay > 0) {
        console.log(`Scheduling weekly reflection for: ${targetTime.toLocaleString()} (${timezone}) -> UTC: ${targetUTC.toISOString()}`);
        
        const timeoutId = setTimeout(() => {
          this.triggerNotification('weekly-reflection', { timezone });
        }, delay);
        
        this.scheduledNotifications.set('weekly-reflection', timeoutId as any);
      }
    } catch (error) {
      console.error('Failed to schedule weekly reflection notification:', error);
    }
  }

  // Schedule optional Sunday 6 PM nudge if weekly reflection not completed
  scheduleWeeklyReflectionNudge(timezone: string): void {
    try {
      // Get current time in user's timezone
      const now = new Date();
      const userNow = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
      
      // Find next Sunday 6 PM
      const currentDay = userNow.getDay();
      let daysToAdd = currentDay === 0 ? 0 : 7 - currentDay;
      
      const targetTime = new Date(userNow);
      targetTime.setDate(userNow.getDate() + daysToAdd);
      targetTime.setHours(18, 0, 0, 0); // 6 PM
      
      // If it's Sunday and 6 PM has passed, schedule for next Sunday
      if (currentDay === 0 && targetTime <= userNow) {
        targetTime.setDate(targetTime.getDate() + 7);
      }
      
      // Convert to UTC properly
      const targetUTC = this.convertUserTimeToUTC(targetTime, timezone);
      const delay = targetUTC.getTime() - Date.now();
      
      if (delay > 0) {
        console.log(`Scheduling weekly reflection nudge for: ${targetTime.toLocaleString()} (${timezone})`);
        
        const timeoutId = setTimeout(() => {
          // Check if weekly reflection was completed before sending nudge
          this.checkAndTriggerWeeklyReflectionNudge(timezone);
        }, delay);
        
        this.scheduledNotifications.set('weekly-reflection-nudge', timeoutId as any);
      }
    } catch (error) {
      console.error('Failed to schedule weekly reflection nudge:', error);
    }
  }

  // Check if weekly reflection completed and send nudge if needed
  private async checkAndTriggerWeeklyReflectionNudge(timezone: string): Promise<void> {
    try {
      // In a real implementation, this would check current completion status
      // For now, we'll trigger the nudge (this should be connected to your weekly reflection completion API)
      console.log('Checking weekly reflection completion status at 6 PM Sunday...');
      
      this.triggerNotification('weekly-reflection-nudge', { timezone });
      
      console.log('Weekly reflection nudge sent');
    } catch (error) {
      console.error('Failed to send weekly reflection nudge:', error);
    }
  }

  // Schedule scenario reminder for daily delivery at user's notification time
  scheduleScenarioReminder(notificationTime: string = "09:00", timezone: string = 'America/New_York'): void {
    try {
      const [hours, minutes] = notificationTime.split(':').map(Number);
      
      // Get current time in user's timezone
      const now = new Date();
      const userNow = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
      
      // Create target time for today in user's timezone
      const targetTime = new Date(userNow);
      targetTime.setHours(hours, minutes, 0, 0);
      
      // If time has passed today, schedule for tomorrow
      if (targetTime <= userNow) {
        targetTime.setDate(targetTime.getDate() + 1);
      }
      
      // Convert target time to UTC properly
      const targetUTC = this.convertUserTimeToUTC(targetTime, timezone);
      const delay = targetUTC.getTime() - Date.now();
      
      if (delay > 0) {
        console.log(`🎯 Scheduling scenario reminder for: ${targetTime.toLocaleString()} (${timezone}) -> UTC: ${targetUTC.toISOString()}`);
        console.log(`⏱️  Delay: ${Math.round(delay / (60 * 1000))} minutes from now`);
        
        const timeoutId = setTimeout(() => {
          this.triggerNotification('scenario-reminder', { timezone });
        }, delay);
        
        this.scheduledNotifications.set('scenario-reminder', timeoutId as any);
      } else {
        console.log('⚠️  Scenario reminder time has already passed, scheduling for tomorrow');
      }
    } catch (error) {
      console.error('Failed to schedule scenario reminder notification:', error);
    }
  }

  // Schedule habit streak nudge with completion check at 10:30 AM
  scheduleHabitStreakNudge(notificationTime: string = "09:00", timezone: string = 'America/New_York'): void {
    try {
      const [hours, minutes] = notificationTime.split(':').map(Number);
      
      // Get current time in user's timezone
      const now = new Date();
      const userNow = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
      
      // Schedule for 10:30 AM to check if habit still not completed
      const checkTime = new Date(userNow);
      checkTime.setHours(10, 30, 0, 0);
      
      // If 10:30 AM has passed today, schedule for tomorrow
      if (checkTime <= userNow) {
        checkTime.setDate(checkTime.getDate() + 1);
      }
      
      // Convert target time to UTC properly
      const targetUTC = this.convertUserTimeToUTC(checkTime, timezone);
      const delay = targetUTC.getTime() - Date.now();
      
      if (delay > 0) {
        console.log(`Scheduling habit nudge check for: ${checkTime.toLocaleString()} (${timezone}) -> UTC: ${targetUTC.toISOString()}`);
        console.log(`Delay: ${Math.round(delay / (60 * 1000))} minutes from now`);
        
        const timeoutId = setTimeout(() => {
          // Re-check completion status before sending
          this.checkAndTriggerHabitNudge(timezone);
        }, delay);
        
        this.scheduledNotifications.set('habit-nudge', timeoutId as any);
      } else {
        console.log('Habit nudge check time has already passed, scheduling for tomorrow');
      }
    } catch (error) {
      console.error('Failed to schedule habit nudge notification:', error);
    }
  }

  // Check completion status and trigger habit nudge if still needed
  private async checkAndTriggerHabitNudge(timezone: string): Promise<void> {
    try {
      // In a real implementation, this would check current completion status
      // For now, we'll trigger the notification (this should be connected to your challenge completion API)
      console.log('Checking habit completion status at 10:30 AM...');
      this.triggerNotification('habit-nudge', { timezone });
    } catch (error) {
      console.error('Failed to check habit completion:', error);
    }
  }

  // Schedule urgent streak protection notification (max once per 72 hours, bypasses quiet hours)
  scheduleUrgentStreakProtection(streakCount: number, timezone: string = 'America/New_York'): void {
    // Check if we've sent a streak protection notification in the last 72 hours
    const streakHistory = this.notificationHistory.get('streak-protection') || [];
    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
    const recentStreakNotifications = streakHistory.filter(date => date > seventyTwoHoursAgo);
    
    if (recentStreakNotifications.length > 0) {
      console.log('Streak protection notification rate limited (max once per 72 hours)');
      return;
    }
    
    const delay = 2 * 60 * 1000; // 2 minutes - urgent but not immediate to avoid spam
    console.log(`Scheduling URGENT streak protection in 2 minutes for ${streakCount}-day streak`);
    const timeoutId = setTimeout(() => {
      this.triggerNotification('streak-protection', { streakCount, timezone });
    }, delay);
    this.scheduledNotifications.set('streak-protection', timeoutId as any);
  }



  // Schedule course stalled reminder (Monday morning) using improved timezone handling
  scheduleCourseReminder(notificationTime: string, timezone: string, courseName?: string, progressPercentage?: number): void {
    try {
      const [hours, minutes] = notificationTime.split(':').map(Number);
      
      // Get current time in user's timezone
      const now = new Date();
      const userNow = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
      
      // Find next Monday (1 = Monday)
      const currentDay = userNow.getDay();
      let daysToAdd = currentDay === 0 ? 1 : currentDay === 1 ? 0 : 8 - currentDay;
      
      const targetTime = new Date(userNow);
      targetTime.setDate(userNow.getDate() + daysToAdd);
      targetTime.setHours(hours, minutes, 0, 0);
      
      // If it's Monday and time has passed, schedule for next Monday
      if (currentDay === 1 && targetTime <= userNow) {
        targetTime.setDate(targetTime.getDate() + 7);
      }
      
      // Convert to UTC properly
      const targetUTC = this.convertUserTimeToUTC(targetTime, timezone);
      const delay = targetUTC.getTime() - Date.now();
      
      if (delay > 0) {
        console.log(`Scheduling course reminder for: ${targetTime.toLocaleString()} (${timezone}) -> UTC: ${targetUTC.toISOString()}`);
        const timeoutId = setTimeout(() => {
          this.triggerNotification('course-reminder', { courseName, progressPercentage, timezone });
        }, delay);
        this.scheduledNotifications.set('course-reminder', timeoutId as any);
      }
    } catch (error) {
      console.error('Failed to schedule course reminder notification:', error);
    }
  }

  // Cancel all scheduled notifications
  cancelAllNotifications(): void {
    this.scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
    console.log('All notifications canceled');
  }

  // Get detailed status of scheduled notifications for debugging
  getNotificationStatus(): { 
    scheduled: string[], 
    count: number, 
    nextScheduled: string | null,
    diagnostics: any 
  } {
    const scheduled = Array.from(this.scheduledNotifications.keys());
    return {
      scheduled,
      count: this.scheduledNotifications.size,
      nextScheduled: scheduled.length > 0 ? scheduled[0] : null,
      diagnostics: {
        permission: typeof Notification !== 'undefined' ? Notification.permission : 'unavailable',
        serviceWorkerReady: 'serviceWorker' in navigator,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currentTime: new Date().toISOString()
      }
    };
  }

  // Force trigger a test notification bypassing all checks
  async forceTestNotification(type: string = 'daily-challenge'): Promise<boolean> {
    try {
      await notificationService.showNotification({
        title: `[FORCE TEST] ${type}`,
        body: 'This is a forced test notification to verify delivery works',
        tag: `force-test-${type}`,
        requireInteraction: false
      });
      console.log('Force test notification sent successfully');
      return true;
    } catch (error) {
      console.error('Force test notification failed:', error);
      return false;
    }
  }

  // Cancel specific notification
  cancelNotification(notificationType: string): void {
    const timeoutId = this.scheduledNotifications.get(notificationType);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(notificationType);
      console.log(`Canceled notification: ${notificationType}`);
    }
  }

  // Get comprehensive notification statistics
  getNotificationStats(): {
    scheduled: number;
    history: Record<string, number>;
    recentActivity: string[];
    systemHealth: {
      permissionStatus: NotificationPermission;
      serviceWorkerReady: boolean;
      lastError?: string;
    };
    performance: {
      totalSent: number;
      successRate: number;
      averageDelay: number;
    };
  } {
    const history: Record<string, number> = {};
    const recentActivity: string[] = [];
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    this.notificationHistory.forEach((dates, type) => {
      history[type] = dates.length;
      const recent = dates.filter(date => date > oneDayAgo);
      if (recent.length > 0) {
        recentActivity.push(`${type}: ${recent.length} in last 24h`);
      }
    });

    // Calculate performance metrics
    const totalSent = Object.values(history).reduce((sum, count) => sum + count, 0);
    const successRate = this.calculateSuccessRate();
    const averageDelay = this.calculateAverageDelay();

    // System health check
    const systemHealth = {
      permissionStatus: Notification.permission,
      serviceWorkerReady: 'serviceWorker' in navigator && !!navigator.serviceWorker.controller,
      lastError: this.getLastError()
    };

    return {
      scheduled: this.scheduledNotifications.size,
      history,
      recentActivity,
      systemHealth,
      performance: {
        totalSent,
        successRate,
        averageDelay
      }
    };
  }

  // Performance tracking methods
  private calculateSuccessRate(): number {
    const successCount = parseInt(localStorage.getItem('notification_success_count') || '0');
    const totalAttempts = parseInt(localStorage.getItem('notification_total_attempts') || '0');
    return totalAttempts > 0 ? (successCount / totalAttempts) * 100 : 100;
  }

  private calculateAverageDelay(): number {
    const delays = localStorage.getItem('notification_delays');
    if (!delays) return 0;
    
    try {
      const delayArray: number[] = JSON.parse(delays);
      return delayArray.length > 0 ? delayArray.reduce((a, b) => a + b) / delayArray.length : 0;
    } catch {
      return 0;
    }
  }

  private getLastError(): string | undefined {
    return localStorage.getItem('notification_last_error') || undefined;
  }

  // Track performance metrics
  private trackSuccess(): void {
    const current = parseInt(localStorage.getItem('notification_success_count') || '0');
    localStorage.setItem('notification_success_count', (current + 1).toString());
    this.incrementTotalAttempts();
  }

  private trackFailure(error: string): void {
    localStorage.setItem('notification_last_error', error);
    this.incrementTotalAttempts();
  }

  private incrementTotalAttempts(): void {
    const current = parseInt(localStorage.getItem('notification_total_attempts') || '0');
    localStorage.setItem('notification_total_attempts', (current + 1).toString());
  }

  // Handle notification failures with retry logic
  private handleNotificationFailure(type: string, data?: any): void {
    const retryKey = `${type}_retry`;
    const retryCount = this.getRetryCount(retryKey);
    
    if (retryCount < 3) {
      // Exponential backoff: 5min, 15min, 45min
      const retryDelay = Math.pow(3, retryCount) * 5 * 60 * 1000;
      
      console.log(`⏰ Retrying notification ${type} in ${retryDelay/60000} minutes (attempt ${retryCount + 1}/3)`);
      
      setTimeout(() => {
        this.incrementRetryCount(retryKey);
        this.triggerNotification(type, data);
      }, retryDelay);
    } else {
      console.error(`❌ Max retries exceeded for notification: ${type}`);
      this.clearRetryCount(retryKey);
    }
  }

  // Retry count management
  private getRetryCount(key: string): number {
    const stored = localStorage.getItem(`notification_retry_${key}`);
    return stored ? parseInt(stored, 10) : 0;
  }

  private incrementRetryCount(key: string): void {
    const current = this.getRetryCount(key);
    localStorage.setItem(`notification_retry_${key}`, (current + 1).toString());
  }

  private clearRetryCount(key: string): void {
    localStorage.removeItem(`notification_retry_${key}`);
  }

  // Check if notifications are enabled and schedule based on user activity
  async initializeNotificationsForUser(
    notificationSettings: any,
    userActivity: any = {}
  ): Promise<void> {
    console.log('=== NOTIFICATION SCHEDULER INITIALIZATION ===');
    console.log('Settings:', notificationSettings);
    console.log('User Activity:', userActivity);

    // Respect user's timezone settings from their notification preferences
    const { 
      notificationTime = "09:00", 
      timezone = "America/New_York",
      enableBrowserNotifications = true,
      enableDailyChallengeNotifications = true,
      enableWeeklyReflectionReminders = true
    } = notificationSettings || {};

    // Only skip if explicitly disabled (not just undefined/null)
    if (enableBrowserNotifications === false) {
      console.log('Browser notifications explicitly disabled in user settings');
      return;
    }
    console.log(`Using notification time: ${notificationTime}, timezone: ${timezone}`);

    // Cancel all existing notifications first
    this.cancelAllNotifications();

    // Schedule daily challenge notifications with completion suppression
    if (enableDailyChallengeNotifications) {
      // Only schedule if not completed today or new user
      const hasCompletedToday = userActivity?.hasCompletedTodaysChallenge;
      if (!hasCompletedToday) {
        console.log(`Scheduling daily challenge notifications for ${notificationTime} ${timezone}`);
        this.scheduleDailyChallengeNotification(notificationTime, timezone);
      } else {
        console.log('Daily challenge already completed - notification suppressed');
      }
    } else {
      console.log('Daily challenge notifications disabled in user settings');
    }

    // Schedule weekly reflection notifications using user's time preferences
    if (enableWeeklyReflectionReminders) {
      console.log(`Scheduling weekly reflection notifications for ${notificationTime} ${timezone}`);
      this.scheduleWeeklyReflectionNotification(notificationTime, timezone);
      this.scheduleWeeklyReflectionNudge(timezone); // Optional 6 PM Sunday nudge
    } else {
      console.log('Weekly reflection notifications disabled in user settings');
    }

    // Scenario reminder logic - conditional based on activity
    const isNewUser = !userActivity || Object.keys(userActivity).length === 0 || userActivity.isNewUser;
    
    if (isNewUser) {
      console.log('New user detected - scheduling welcome scenario reminder');
      this.scheduleScenarioReminder(notificationTime, timezone);
    } else if (userActivity.daysSinceLastScenario && userActivity.daysSinceLastScenario >= 3) {
      // Check if we've already sent 2 scenario reminders this week
      const scenarioHistory = this.notificationHistory.get('scenario-reminder') || [];
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const thisWeekCount = scenarioHistory.filter(date => date > oneWeekAgo).length;
      
      if (thisWeekCount < 2) {
        console.log(`Scheduling scenario reminder (${userActivity.daysSinceLastScenario} days inactive, ${thisWeekCount}/2 this week)`);
        this.scheduleScenarioReminder(notificationTime, timezone);
      } else {
        console.log('Scenario reminder limit reached (2/week)');
      }
    } else {
      console.log('Scenario reminder not needed - recent activity');
    }

    // Smart challenge notifications based on actual completion status
    const hasCompletedToday = userActivity.hasCompletedTodaysChallenge;
    const streakAtRisk = userActivity.streakAtRisk;
    const currentStreak = userActivity.currentStreak || 0;
    const daysSinceLastChallenge = userActivity.daysSinceLastChallenge;

    // Habit nudge logic - only for active streaks, only if not completed by 10:30 AM
    if (currentStreak > 0 && !hasCompletedToday) {
      console.log(`Scheduling habit nudge for active streak (${currentStreak} days) - will check completion at 10:30 AM`);
      this.scheduleHabitStreakNudge(notificationTime, timezone);
    } else if (!hasCompletedToday && streakAtRisk && currentStreak > 2) {
      console.log(`URGENT: Streak at risk! Current streak: ${currentStreak} - scheduling immediate protection`);
      this.scheduleUrgentStreakProtection(currentStreak, timezone);
    } else if (isNewUser) {
      console.log('New user detected - scheduling welcome habit nudge');
      this.scheduleHabitStreakNudge(notificationTime, timezone);
    } else {
      console.log('Habit nudge not needed - no active streak or already completed');
    }

    // Course reminders for stalled courses (3+ days no progress, <80% complete)
    if (userActivity.stalledCourses && userActivity.stalledCourses.length > 0) {
      const stalledCourse = userActivity.stalledCourses[0];
      if (stalledCourse && typeof stalledCourse === 'object' && stalledCourse.title) {
        // Only send if less than 80% complete and 3+ days idle
        if (stalledCourse.progressPercentage < 80 && stalledCourse.daysSinceLastProgress >= 3) {
          console.log(`Scheduling course reminder for stalled course: ${stalledCourse.title} (${stalledCourse.progressPercentage}% complete, ${stalledCourse.daysSinceLastProgress} days idle)`);
          this.scheduleCourseReminder(notificationTime, timezone, stalledCourse.title, stalledCourse.progressPercentage);
        } else {
          console.log(`Course reminder suppressed: ${stalledCourse.title} (${stalledCourse.progressPercentage}% complete, ${stalledCourse.daysSinceLastProgress} days idle)`);
        }
      } else if (typeof stalledCourse === 'string') {
        // Legacy support for string array
        console.log(`Scheduling course reminder for stalled course: ${stalledCourse}`);
        this.scheduleCourseReminder(notificationTime, timezone, stalledCourse);
      }
    }

    // Re-engagement campaign for 5+ days total inactivity
    if (daysSinceLastChallenge && daysSinceLastChallenge >= 5) {
      // Check if we've already sent a re-engagement notification recently
      const reengageHistory = this.notificationHistory.get('re-engagement') || [];
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentReengageNotifications = reengageHistory.filter(date => date > oneWeekAgo);
      
      if (recentReengageNotifications.length === 0) {
        console.log(`Scheduling re-engagement campaign (${daysSinceLastChallenge} days inactive)`);
        // Schedule for next available day at user's preferred time
        try {
          const [hours, minutes] = notificationTime.split(':').map(Number);
          const now = new Date();
          const userTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
          
          // Schedule for tomorrow at notification time
          const targetTime = new Date(userTime);
          targetTime.setDate(targetTime.getDate() + 1);
          targetTime.setHours(hours, minutes, 0, 0);
          
          const targetUTC = this.convertUserTimeToUTC(targetTime, timezone);
          const delay = targetUTC.getTime() - Date.now();
          
          if (delay > 0) {
            console.log(`Scheduling re-engagement campaign for: ${targetTime.toLocaleString()} (${timezone})`);
            const timeoutId = setTimeout(() => {
              this.triggerNotification('re-engagement', { timezone });
            }, delay);
            this.scheduledNotifications.set('re-engagement', timeoutId as any);
          }
        } catch (error) {
          console.error('Failed to schedule re-engagement campaign:', error);
        }
      } else {
        console.log('Re-engagement notification already sent this week');
      }
    }

    console.log(`Active notifications scheduled: ${this.scheduledNotifications.size}`);
    console.log('Scheduled notification types:', Array.from(this.scheduledNotifications.keys()));
    console.log('=== NOTIFICATION SCHEDULER INITIALIZATION COMPLETE ===');
  }
}

export const notificationScheduler = NotificationScheduler.getInstance();