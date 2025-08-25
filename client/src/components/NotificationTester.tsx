import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notificationScheduler } from '@/lib/notification-scheduler';
import { notificationService } from '@/lib/notification-service';
import { notificationAnalytics } from '@/lib/notification-analytics';
import { useNotificationManager } from '@/hooks/use-notification-manager';

export function NotificationTester() {
  const [testResult, setTestResult] = useState<string>('');
  const { testNotification, scheduleImmediate } = useNotificationManager();

  const handleTestNotification = async () => {
    try {
      setTestResult('Testing notification...');
      
      // Request permission first
      const permission = await notificationService.requestPermission();
      if (permission !== 'granted') {
        setTestResult('Permission denied - cannot test notifications');
        return;
      }

      // Test immediate notification with explicit icon
      await notificationService.showNotification({
        title: 'AM Project Test',
        body: 'Testing PNG logo - you should see the mountain/star logo now',
        tag: 'icon-test',
        icon: '/am-logo-notification.png',
        requireInteraction: true,
        data: { type: 'test', url: '/dashboard' }
      });

      setTestResult('Test notification sent successfully!');
    } catch (error) {
      setTestResult(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleScheduleTest = (type: string) => {
    try {
      scheduleImmediate(type);
      setTestResult(`Scheduled ${type} notification`);
    } catch (error) {
      setTestResult(`Failed to schedule ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStats = () => {
    try {
      return notificationScheduler.getNotificationStats();
    } catch {
      return { 
        scheduled: 0, 
        history: {}, 
        recentActivity: [],
        systemHealth: {
          permissionStatus: 'default' as NotificationPermission,
          serviceWorkerReady: false
        },
        performance: {
          totalSent: 0,
          successRate: 0,
          averageDelay: 0
        }
      };
    }
  };

  const getAnalytics = () => {
    try {
      return notificationAnalytics.getAnalyticsDashboard();
    } catch {
      return {
        totalEvents: 0,
        typeBreakdown: {},
        recentEvents: [],
        contentTests: {},
        engagementRate: 0
      };
    }
  };

  const stats = getStats();
  const analytics = getAnalytics();

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Notification System Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleTestNotification} variant="outline">
            Test Direct Notification
          </Button>
          
          <Button onClick={() => handleScheduleTest('daily-challenge')} variant="outline">
            Test Challenge Reminder
          </Button>
          
          <Button onClick={() => handleScheduleTest('scenario-reminder')} variant="outline">
            Test Scenario Reminder
          </Button>
          
          <Button onClick={() => handleScheduleTest('habit-nudge')} variant="outline">
            Test Habit Nudge
          </Button>
        </div>

        {testResult && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">{testResult}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">System Status</h4>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">Scheduled: {stats.scheduled}</Badge>
              <Badge variant={stats.systemHealth.permissionStatus === 'granted' ? 'default' : 'destructive'}>
                Permission: {stats.systemHealth.permissionStatus}
              </Badge>
              <Badge variant={stats.systemHealth.serviceWorkerReady ? 'default' : 'secondary'}>
                SW: {stats.systemHealth.serviceWorkerReady ? 'Ready' : 'Not Ready'}
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Performance</h4>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">Success Rate: {stats.performance.successRate.toFixed(1)}%</Badge>
              <Badge variant="secondary">Total Sent: {stats.performance.totalSent}</Badge>
              <Badge variant="secondary">Engagement: {analytics.engagementRate.toFixed(1)}%</Badge>
            </div>
          </div>
          
          {stats.recentActivity.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Recent Activity (24h)</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index}>• {activity}</div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(analytics.typeBreakdown).length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Type Breakdown</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {Object.entries(analytics.typeBreakdown).map(([type, metrics]) => (
                  <div key={type} className="text-muted-foreground">
                    {type}: {metrics.sent}s/{metrics.clicked}c
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}