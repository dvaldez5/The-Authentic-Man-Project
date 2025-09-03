import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { detectSimplePWAMode } from '@/lib/simple-pwa';
import { getTopPadding } from "@/utils/responsive-styles";
import { useToast } from "@/hooks/use-toast";
import { notificationService } from "@/lib/notification-service";
import { useNotificationManager } from "@/hooks/use-notification-manager";
import { notificationPriorityManager } from "@/lib/notification-priority";
import { VersionInfo } from "@/components/VersionInfo";

import {
  Settings as SettingsIcon,
  Bell,
  BellRing,
  BellOff,
  Clock,
  Globe,
  Shield,
  Smartphone,
  Monitor,
  CheckCircle,
  AlertCircle,
  Info,
  Target,
  Calendar,
  BookOpen,

  CreditCard,
  XCircle,
  ArrowRight
} from "lucide-react";
import { useLocation } from "wouter";
import type { UserNotificationSettings } from "@shared/schema";

interface NotificationPermissionStatus {
  supported: boolean;
  permission: NotificationPermission;
  enabled: boolean;
}

export default function Settings() {
  const { user } = useAuth();
  const isPWA = detectSimplePWAMode();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { testNotification, scheduleImmediate, initializeNotifications } = useNotificationManager();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>({
    supported: false,
    permission: 'default',
    enabled: false
  });

  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [detectedTimezone, setDetectedTimezone] = useState<string>('');
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  const paddingClass = getTopPadding(isPWA, false, 'main');

  // Load user notification settings
  const { data: settings, isLoading } = useQuery<UserNotificationSettings>({
    queryKey: ['/api/notification-settings'],
    retry: false
  });

  // Load subscription status
  const { data: subscriptionStatus } = useQuery({
    queryKey: ['/api/subscription-status'],
    retry: false
  });

  // Load subscription details if user has subscription
  const { data: subscriptionDetails } = useQuery({
    queryKey: ['/api/subscription-details'],
    enabled: !!subscriptionStatus?.hasActiveSubscription,
    retry: false
  });

  // Update notification settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<UserNotificationSettings>) => {
      console.log('Updating settings with:', updates);

      const response = await fetch('/api/notification-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(updates),
      });

      console.log('Settings update response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Update failed' }));
        console.error('Settings update error response:', errorData);
        throw new Error(errorData.error || 'Failed to update settings');
      }

      const result = await response.json();
      console.log('Settings update success:', result);
      return result;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/notification-settings'], data);
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error: Error) => {
      console.error('Settings update error:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Check notification permission status
  useEffect(() => {
    const checkPermissions = async () => {
      const supported = notificationService.isNotificationSupported();
      const permission = notificationService.getPermission();
      const enabled = await notificationService.areNotificationsEnabled();

      setPermissionStatus({
        supported,
        permission,
        enabled
      });
    };

    checkPermissions();

    // Auto-detect user's timezone with validation
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log('Detected user timezone:', userTimezone);
      
      // Validate the timezone by testing it
      const testDate = new Date();
      const testFormat = new Intl.DateTimeFormat('en-US', {
        timeZone: userTimezone,
        timeZoneName: 'long'
      });
      const formattedTest = testFormat.format(testDate);
      console.log('Timezone validation test:', formattedTest);
      
      setDetectedTimezone(userTimezone);
    } catch (error) {
      console.error('Timezone detection failed:', error);
      setDetectedTimezone('America/New_York'); // Fallback
    }

    // Load debug info
    const loadDebugInfo = () => {
      const priorityStatus = notificationPriorityManager.getStatus();
      setDebugInfo(priorityStatus);
    };

    loadDebugInfo();
    const interval = setInterval(loadDebugInfo, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-set timezone if user hasn't selected one yet OR if detected timezone differs from stored
  useEffect(() => {
    if (settings && detectedTimezone) {
      // If no timezone is set, or if detected timezone is different from stored timezone, update it
      if (!settings.timezone || settings.timezone !== detectedTimezone) {
        console.log('Auto-updating timezone:', { 
          stored: settings.timezone, 
          detected: detectedTimezone 
        });
        updateSettingsMutation.mutate({ timezone: detectedTimezone });
      }
    }
  }, [settings, detectedTimezone]);

  const handlePermissionRequest = async () => {
    console.log('Permission request triggered by user click');

    try {
      // Use notification service to handle permission request properly
      const permission = await notificationService.requestPermission();
      console.log('Permission response:', permission);

      // Update local state
      setPermissionStatus(prev => ({
        ...prev,
        permission,
        enabled: permission === 'granted'
      }));

      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled!",
          description: "You'll now receive notifications from this app."
        });

        // Auto-enable browser notifications in settings
        updateSettingsMutation.mutate({
          enableBrowserNotifications: true
        });
      } else if (permission === 'denied') {
        toast({
          title: "Permission Denied",
          description: "You denied notification permissions. You can change this in Chrome settings.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Permission Dismissed",
          description: "You can try again or manually enable in Chrome settings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      toast({
        title: "Request Failed",
        description: "Unable to request notification permission. Try refreshing the page.",
        variant: "destructive"
      });
    }
  };

  const handleTestNotification = async () => {
    const success = await notificationService.showNotification({
      title: "Test Notification",
      body: "Notifications are working correctly!"
    });

    if (success) {
      toast({
        title: "Test Sent",
        description: "Check for the notification from your browser."
      });
    } else {
      toast({
        title: "Test Failed",
        description: "Unable to send test notification. Check your browser permissions.",
        variant: "destructive"
      });
    }
  };

  const getPermissionIcon = () => {
    switch (permissionStatus.permission) {
      case 'granted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'denied':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPermissionText = () => {
    const isWebView = /wv|WebView/i.test(navigator.userAgent);
    
    switch (permissionStatus.permission) {
      case 'granted':
        return isWebView ? 'Limited (WebView)' : 'Granted';
      case 'denied':
        return isWebView ? 'Not Available (WebView)' : 'Denied';
      default:
        return 'Not Requested';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className={`container mx-auto px-4 ${paddingClass} pb-8 space-y-8`}>
          <div className="text-center space-y-4">
            <h1 className="challenge-header text-4xl md:text-6xl">Settings</h1>
            <p className="challenge-body text-lg text-muted-foreground">
              Loading your preferences...
            </p>
          </div>

          <Card className="challenge-card w-full max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className={`container mx-auto px-4 ${paddingClass} pb-8 space-y-8`}>
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <SettingsIcon className="h-12 w-12 text-primary" />
            <h1 className="challenge-header text-4xl md:text-6xl">Settings</h1>
          </div>
          <p className="challenge-body text-lg text-muted-foreground">
            Customize how The AM Project supports your growth journey
          </p>
        </div>

        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Browser Notification Setup */}
          <Card className="challenge-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Browser Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Permission Status with Help */}
              {permissionStatus.permission === 'denied' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <div className="flex items-start space-x-3">
                    <BellOff className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800">Chrome Has Blocked Notifications</h4>
                      <p className="text-sm text-red-600 mt-1 mb-3">
                        To enable notifications, you need to allow them in Chrome first:
                      </p>
                      <div className="text-xs text-red-700 space-y-1 bg-red-100 p-3 rounded">
                        <p><strong>Site-Specific Chrome Settings:</strong></p>
                        <p>1. Tap the lock icon (🔒) next to the URL above</p>
                        <p>2. Tap "Permissions" or "Site Settings"</p>
                        <p>3. Find "Notifications" and change to "Allow"</p>
                        <p>4. Refresh this page</p>
                        <br/>
                        <p><strong>Alternative Method:</strong></p>
                        <p>Chrome Menu → Settings → Site Settings → Notifications → Find this domain → Allow</p>
                        <br/>
                        <p><strong>Direct Chrome URL:</strong></p>
                        <p>Go to: <code>chrome://settings/content/notifications</code></p>
                        <p>Find this domain in "Blocked" list and change to "Allow"</p>
                        <br/>
                        <p><strong>Note:</strong> Global Chrome notifications are enabled, but this specific site is blocked</p>
                      </div>
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.hostname);
                            toast({
                              title: "Domain Copied",
                              description: "Use this to find the site in Chrome settings"
                            });
                          }}
                        >
                          Copy Domain Name
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Try to open Chrome notification settings directly
                            try {
                              window.open('chrome://settings/content/notifications', '_blank');
                            } catch (error) {
                              toast({
                                title: "Manual Navigation Required",
                                description: "Copy the URL: chrome://settings/content/notifications",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          Open Chrome Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  {permissionStatus.supported ? (
                    <>
                      {getPermissionIcon()}
                      <div>
                        <p className="font-medium">Permission Status: {getPermissionText()}</p>
                        <p className="text-sm text-muted-foreground">
                          {permissionStatus.permission === 'denied' 
                            ? "Blocked by Chrome - follow instructions above"
                            : permissionStatus.supported 
                              ? "Your browser supports notifications" 
                              : "Your browser doesn't support notifications"
                          }
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p className="font-medium">Not Supported</p>
                        <p className="text-sm text-muted-foreground">
                          Your browser doesn't support notifications
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {permissionStatus.supported && (
                  <div className="flex space-x-2">
                    {permissionStatus.permission !== 'granted' && (
                      <Button 
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('🔔 BUTTON CLICKED - Enable Notifications');
                          console.log('🔔 Notification API available:', 'Notification' in window);
                          console.log('🔔 Current permission:', Notification.permission);
                          console.log('🔔 Service Worker available:', 'serviceWorker' in navigator);
                          console.log('🔔 Service Worker controller:', navigator.serviceWorker?.controller);

                          if (!('Notification' in window)) {
                            console.log('❌ Notification API not supported');
                            toast({
                              title: "Not Supported",
                              description: "This browser doesn't support notifications.",
                              variant: "destructive"
                            });
                            return;
                          }

                          // Try direct permission request first (simpler approach)
                          console.log('🔔 Requesting permission directly...');
                          Notification.requestPermission().then((result) => {
                            console.log('🔔 Direct permission result:', result);

                            setPermissionStatus(prev => ({
                              ...prev,
                              permission: result,
                              enabled: result === 'granted'
                            }));

                            if (result === 'granted') {
                              console.log('✅ Permission granted - testing notification');

                              // Test with a simple notification
                              try {
                                new Notification('Test Notification', {
                                  body: 'Notifications are now working!',
                                  icon: '/favicon.ico'
                                });

                                toast({
                                  title: "Notifications Enabled!",
                                  description: "You should see a test notification."
                                });

                                updateSettingsMutation.mutate({
                                  enableBrowserNotifications: true
                                });
                              } catch (error) {
                                console.error('❌ Failed to show test notification:', error);
                                toast({
                                  title: "Notification Error",
                                  description: "Permission granted but notification failed: " + (error instanceof Error ? error.message : String(error)),
                                  variant: "destructive"
                                });
                              }
                            } else if (result === 'denied') {
                              console.log('❌ Permission denied');
                              toast({
                                title: "Permission Denied",
                                description: "You denied notification permissions.",
                                variant: "destructive"
                              });
                            } else {
                              console.log('⚠️ Permission default/dismissed');
                              toast({
                                title: "No Response",
                                description: "Permission dialog was dismissed.",
                                variant: "destructive"
                              });
                            }
                          }).catch((error) => {
                            console.error('❌ Permission request error:', error);
                            toast({
                              title: "Request Failed",
                              description: "Error requesting permission: " + (error instanceof Error ? error.message : String(error)),
                              variant: "destructive"
                            });
                          });
                        }}
                        size="sm"
                      >
                        Enable Notifications
                      </Button>
                    )}
                    {permissionStatus.permission === 'granted' && (
                      <Button onClick={handleTestNotification} variant="outline" size="sm">
                        Test Notification
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Global notification toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="browser-notifications" className="text-base font-medium">
                    Enable Browser Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications in your browser when the app is not open
                  </p>
                </div>
                <Switch
                  id="browser-notifications"
                  checked={settings?.enableBrowserNotifications || false}
                  disabled={!permissionStatus.enabled || updateSettingsMutation.isPending}
                  onCheckedChange={(checked) => 
                    updateSettingsMutation.mutate({ enableBrowserNotifications: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="challenge-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BellRing className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Weekly Reflection Reminders */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="weekly-reflections" className="text-base font-medium">
                    Weekly Growth Check-ins
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Stay on track with weekly progress reviews and goal setting
                  </p>
                </div>
                <Switch
                  id="weekly-reflections"
                  checked={settings?.enableWeeklyReflectionReminders || false}
                  disabled={updateSettingsMutation.isPending}
                  onCheckedChange={(checked) => 
                    updateSettingsMutation.mutate({ enableWeeklyReflectionReminders: checked })
                  }
                />
              </div>

              <Separator />

              {/* Daily Challenge Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="daily-challenges" className="text-base font-medium">
                    Daily Growth Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Never miss your daily action that builds momentum
                  </p>
                </div>
                <Switch
                  id="daily-challenges"
                  checked={settings?.enableDailyChallengeNotifications || false}
                  disabled={updateSettingsMutation.isPending}
                  onCheckedChange={(checked) => 
                    updateSettingsMutation.mutate({ enableDailyChallengeNotifications: checked })
                  }
                />
              </div>

              <Separator />

              {/* Journal Reminders */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="journal-reminders" className="text-base font-medium">
                    Reflection Prompts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Process your thoughts and track your inner development
                  </p>
                </div>
                <Switch
                  id="journal-reminders"
                  checked={settings?.enableJournalReminders || false}
                  disabled={updateSettingsMutation.isPending}
                  onCheckedChange={(checked) => 
                    updateSettingsMutation.mutate({ enableJournalReminders: checked })
                  }
                />
              </div>

              <Separator />

              {/* Community Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="community-notifications" className="text-base font-medium">
                    Community Updates
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Stay connected with your accountability group
                  </p>
                </div>
                <Switch
                  id="community-notifications"
                  checked={settings?.enableCommunityNotifications || false}
                  disabled={updateSettingsMutation.isPending}
                  onCheckedChange={(checked) => 
                    updateSettingsMutation.mutate({ enableCommunityNotifications: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Timing */}
          <Card className="challenge-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Notification Timing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preferred notification time */}
              <div className="space-y-3">
                <Label htmlFor="notification-time" className="text-base font-medium">
                  Preferred Notification Time
                </Label>
                <p className="text-sm text-muted-foreground">
                  Choose when you'd like to receive daily reminders
                </p>
                <Input
                  id="notification-time"
                  type="time"
                  value={settings?.notificationTime || "09:00"}
                  disabled={updateSettingsMutation.isPending}
                  onChange={(e) => 
                    updateSettingsMutation.mutate({ notificationTime: e.target.value })
                  }
                  className="w-40"
                />
              </div>

              <Separator />

              {/* Timezone */}
              <div className="space-y-3">
                <Label htmlFor="timezone" className="text-base font-medium">
                  Timezone
                </Label>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Automatically detected: <span className="font-medium">{detectedTimezone}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Current time: <span className="font-mono">
                      {detectedTimezone ? new Date().toLocaleString('en-US', { 
                        timeZone: detectedTimezone, 
                        hour12: true,
                        weekday: 'short',
                        hour: 'numeric',
                        minute: '2-digit'
                      }) : 'Loading...'}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Selected: <span className="font-medium">
                      {settings?.timezone ? new Date().toLocaleString('en-US', { 
                        timeZone: settings.timezone, 
                        hour12: true,
                        weekday: 'short',
                        hour: 'numeric',
                        minute: '2-digit'
                      }) : 'Not set'}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You can change this if needed
                  </p>
                </div>
                <Select
                  value={settings?.timezone || detectedTimezone || "America/New_York"}
                  disabled={updateSettingsMutation.isPending}
                  onValueChange={(value) => 
                    updateSettingsMutation.mutate({ timezone: value })
                  }
                >
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="America/Phoenix">Arizona Time</SelectItem>
                    <SelectItem value="America/Anchorage">Alaska Time</SelectItem>
                    <SelectItem value="Pacific/Honolulu">Hawaii Time</SelectItem>
                    <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                    <SelectItem value="Europe/Paris">Central Europe (CET)</SelectItem>
                    <SelectItem value="Europe/Berlin">Berlin (CET)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    <SelectItem value="Asia/Shanghai">Beijing (CST)</SelectItem>
                    <SelectItem value="Asia/Mumbai">Mumbai (IST)</SelectItem>
                    <SelectItem value="Australia/Sydney">Sydney (AEST)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>



          {/* Device Information */}
          <Card className="challenge-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>Device Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  {isPWA ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                  <div>
                    <p className="font-medium">App Mode</p>
                    <p className="text-sm text-muted-foreground">
                      {isPWA ? "PWA (Installed)" : "Browser"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Globe className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Browser Support</p>
                    <p className="text-sm text-muted-foreground">
                      {permissionStatus.supported ? "Supported" : "Limited"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing & Subscription Management */}
          <Card className="challenge-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Billing & Subscription</span>
                </div>
                {subscriptionStatus?.hasActiveSubscription && (
                  <Badge variant="default" className="bg-green-600">
                    {subscriptionStatus.isDevAccount ? 'Dev Account' : 'Active'}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptionStatus?.hasActiveSubscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Current Plan</p>
                      <p className="text-sm text-muted-foreground">
                        {subscriptionStatus.isDevAccount 
                          ? 'Developer Account - Full Access'
                          : subscriptionDetails?.subscription 
                            ? `$${(subscriptionDetails.subscription.plan.amount / 100).toFixed(2)}/${subscriptionDetails.subscription.plan.interval}`
                            : 'AM Project Monthly - $9.99/month'
                        }
                      </p>
                      {subscriptionDetails?.subscription?.status === 'trialing' && (
                        <p className="text-xs text-blue-400 mt-1">
                          Free trial active until {new Date((subscriptionDetails.subscription.trial_end || 0) * 1000).toLocaleDateString()}
                        </p>
                      )}
                      {subscriptionDetails?.subscription?.cancel_at_period_end && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Canceling at period end
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/subscription')}
                      className="flex items-center gap-1"
                    >
                      Manage
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/subscription')}
                      className="text-muted-foreground"
                    >
                      View Details
                    </Button>
                    {!subscriptionStatus.isDevAccount && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/subscription')}
                        className="text-red-400 border-red-400 hover:bg-red-400/10"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-3">
                    No active subscription. Start your journey with The AM Project.
                  </p>
                  <Button onClick={() => navigate('/payment')} className="bg-primary hover:bg-primary/90">
                    Start Free Trial
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>



          {/* Version Information */}
          <VersionInfo />
        </div>
      </div>
    </div>
  );
}