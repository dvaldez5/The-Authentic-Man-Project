import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Hide offline message after initial display
    if (!navigator.onLine) {
      setShowOfflineMessage(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  if (isOnline && !showOfflineMessage) {
    return null;
  }

  return (
    <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-yellow-600" />
            )}
            <div>
              <p className="font-medium text-sm">
                {isOnline ? "Back Online" : "You're Offline"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isOnline 
                  ? "Your connection has been restored"
                  : "Some features may be limited. Your progress is saved locally."
                }
              </p>
            </div>
          </div>
          {isOnline && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Sync</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}