import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { notificationScheduler } from '@/lib/notification-scheduler';
import { useNotificationManager } from '@/hooks/use-notification-manager';

export function NotificationDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const { notificationSettings, userActivity } = useNotificationManager();

  const runDiagnostics = () => {
    const status = notificationScheduler.getNotificationStatus();
    setDiagnostics(status);
  };

  const runTest = async (type: string) => {
    const result = await notificationScheduler.forceTestNotification(type);
    setTestResults(prev => ({ ...prev, [type]: result }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'granted': return 'bg-green-500';
      case 'denied': return 'bg-red-500';
      case 'default': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification System Diagnostics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runDiagnostics} className="w-full">
            Run System Diagnostics
          </Button>
          
          {diagnostics && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Permission Status</h4>
                <Badge className={getStatusColor(diagnostics.diagnostics.permission)}>
                  {diagnostics.diagnostics.permission}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Service Worker</h4>
                <Badge variant={diagnostics.diagnostics.serviceWorkerReady ? 'default' : 'destructive'}>
                  {diagnostics.diagnostics.serviceWorkerReady ? 'Ready' : 'Not Available'}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Scheduled Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Count: {diagnostics.count}
                </p>
                {diagnostics.scheduled.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {diagnostics.scheduled.map((type: string) => (
                      <Badge key={type} variant="outline">{type}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-yellow-600">No notifications scheduled</p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">System Info</h4>
                <div className="text-sm space-y-1">
                  <p>Timezone: {diagnostics.diagnostics.timezone}</p>
                  <p>Current Time: {new Date(diagnostics.diagnostics.currentTime).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {notificationSettings ? (
            <div className="space-y-2 text-sm">
              <p>Browser Notifications: <Badge variant={notificationSettings.enableBrowserNotifications ? 'default' : 'destructive'}>
                {notificationSettings.enableBrowserNotifications ? 'Enabled' : 'Disabled'}
              </Badge></p>
              <p>Daily Challenges: <Badge variant={notificationSettings.enableDailyChallengeNotifications ? 'default' : 'destructive'}>
                {notificationSettings.enableDailyChallengeNotifications ? 'Enabled' : 'Disabled'}
              </Badge></p>
              <p>Notification Time: {notificationSettings.notificationTime}</p>
              <p>Timezone: {notificationSettings.timezone}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">Loading settings...</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {userActivity ? (
            <div className="space-y-2 text-sm">
              <p>New User: <Badge variant={userActivity.isNewUser ? 'default' : 'outline'}>
                {userActivity.isNewUser ? 'Yes' : 'No'}
              </Badge></p>
              <p>Current Streak: {userActivity.currentStreak || 0}</p>
              <p>Days Since Last Challenge: {userActivity.daysSinceLastChallenge || 'Never'}</p>
              <p>Days Since Last Scenario: {userActivity.daysSinceLastScenario || 'Never'}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">Loading activity...</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Force Test Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {['daily-challenge', 'scenario-reminder', 'habit-nudge', 'weekly-reflection'].map(type => (
            <div key={type} className="flex items-center justify-between">
              <span className="text-sm">{type}</span>
              <div className="flex items-center gap-2">
                {testResults[type] !== undefined && (
                  <Badge variant={testResults[type] ? 'default' : 'destructive'}>
                    {testResults[type] ? 'Success' : 'Failed'}
                  </Badge>
                )}
                <Button size="sm" onClick={() => runTest(type)}>
                  Test
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}