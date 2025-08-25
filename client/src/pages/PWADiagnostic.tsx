import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface DiagnosticData {
  isStandalone: boolean;
  isIOSStandalone: boolean;
  isPWAParam: boolean;
  storedPWAMode: boolean;
  isAndroidWebView: boolean;
  isReplitApp: boolean;
  isAndroidPWA: boolean;
  detected: boolean;
  userAgent: string;
  displayMode: boolean;
  url: string;
  origin: string;
  pathname: string;
  search: string;
  isSecureContext: boolean;
  hasServiceWorker: boolean;
  localStorageKeys: string[];
  pwaStorageValue: string;
  innerWidth: number;
  innerHeight: number;
  outerWidth: number;
  outerHeight: number;
  manifestSupport: boolean;
  webkitStandalone: boolean;
  chromeStandalone: boolean;
  timestamp: string;
  serverTimestamp?: string;
  clientIP?: string;
}

export default function PWADiagnostic() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDiagnostics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pwa-diagnostic');
      if (response.ok) {
        const data = await response.json();
        setDiagnostics(data);
      }
    } catch (error) {
      console.error('Failed to fetch diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const getDeviceType = (userAgent: string) => {
    if (/Replit-Bonsai/.test(userAgent)) return 'Replit App';
    if (/wv\)/.test(userAgent) && !/Replit-Bonsai/.test(userAgent)) return 'Downloaded PWA';
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) return 'Mobile Browser';
    return 'Desktop Browser';
  };

  const getDetectionSummary = (data: DiagnosticData) => {
    const reasons = [];
    if (data.isStandalone) reasons.push('Standalone mode');
    if (data.isIOSStandalone) reasons.push('iOS standalone');
    if (data.isPWAParam) reasons.push('PWA URL parameter');
    if (data.storedPWAMode) reasons.push('Stored PWA mode');
    if (data.isAndroidPWA) reasons.push('Android PWA detection');
    
    return reasons.length > 0 ? reasons.join(', ') : 'No PWA detection';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">PWA Diagnostic Data</h1>
        <Button onClick={fetchDiagnostics} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {diagnostics.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              No diagnostic data available. Open the app on your phone to collect data.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {diagnostics.reverse().map((data, index) => (
            <Card key={index} className={`${data.detected ? 'border-green-500' : 'border-red-500'}`}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className={`${data.detected ? 'text-green-600' : 'text-red-600'}`}>
                    {data.detected ? '✓ PWA Detected' : '✗ PWA Not Detected'}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {getDeviceType(data.userAgent)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Detection Flags</h3>
                    <div className="space-y-1 text-sm">
                      <div className={`${data.isStandalone ? 'text-green-600' : 'text-red-600'}`}>
                        Standalone Mode: {data.isStandalone ? 'Yes' : 'No'}
                      </div>
                      <div className={`${data.isIOSStandalone ? 'text-green-600' : 'text-red-600'}`}>
                        iOS Standalone: {data.isIOSStandalone ? 'Yes' : 'No'}
                      </div>
                      <div className={`${data.isPWAParam ? 'text-green-600' : 'text-red-600'}`}>
                        PWA URL Parameter: {data.isPWAParam ? 'Yes' : 'No'}
                      </div>
                      <div className={`${data.storedPWAMode ? 'text-green-600' : 'text-red-600'}`}>
                        Stored PWA Mode: {data.storedPWAMode ? 'Yes' : 'No'}
                      </div>
                      <div className={`${data.isAndroidPWA ? 'text-green-600' : 'text-red-600'}`}>
                        Android PWA: {data.isAndroidPWA ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Environment</h3>
                    <div className="space-y-1 text-sm">
                      <div>URL: {data.url}</div>
                      <div>Viewport: {data.innerWidth}×{data.innerHeight}</div>
                      <div>Secure Context: {data.isSecureContext ? 'Yes' : 'No'}</div>
                      <div>Service Worker: {data.hasServiceWorker ? 'Yes' : 'No'}</div>
                      <div>LocalStorage Keys: {data.localStorageKeys.length}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Detection Summary</h3>
                  <p className="text-sm">{getDetectionSummary(data)}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">User Agent</h3>
                  <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                    {data.userAgent}
                  </p>
                </div>

                <div className="text-xs text-muted-foreground">
                  Client: {data.timestamp} | Server: {data.serverTimestamp}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Instructions for Phone Testing</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Open your downloaded PWA app on your phone</li>
          <li>Navigate to any page (the diagnostic data will be automatically sent)</li>
          <li>Return to this page and click "Refresh" to see the data</li>
          <li>Look for entries marked as "Downloaded PWA" to see the actual phone app behavior</li>
        </ol>
      </div>
    </div>
  );
}