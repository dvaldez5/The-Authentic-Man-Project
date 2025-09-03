import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Monitor, CheckCircle, ArrowRight, X, Loader2, Shield } from "lucide-react";
import { getSimplePWAState } from '@/lib/simple-pwa';
import { useToast } from "@/hooks/use-toast";

interface PWAInstallationGuideProps {
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export default function PWAInstallationGuide({ onDismiss, showDismiss = true }: PWAInstallationGuideProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const { isInstallable, installApp, isInstalled } = getSimplePWAState();
  const { toast } = useToast();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  const benefits = [
    "Instant access from your home screen",
    "Works offline for uninterrupted growth",
    "Push notifications for daily challenges",
    "Faster, native app performance",
    "Private, secure experience"
  ];

  const iOSSteps = [
    { icon: "📱", text: "Open Safari on your iPhone/iPad" },
    { icon: "🔗", text: "Navigate to The AM Project website" },
    { icon: "📤", text: "Tap the Share button (square with arrow up)" },
    { icon: "🏠", text: "Scroll down and tap 'Add to Home Screen'" },
    { icon: "✅", text: "Tap 'Add' to complete installation" }
  ];

  const androidSteps = [
    { icon: "📱", text: "Open Chrome on your Android device" },
    { icon: "🔗", text: "Navigate to The AM Project website" },
    { icon: "⋮", text: "Tap the three dots menu (⋮) in Chrome" },
    { icon: "📲", text: "Tap 'Install app' or 'Add to Home screen'" },
    { icon: "✅", text: "Tap 'Install' to add to home screen and app drawer" }
  ];

  const steps = isIOS ? iOSSteps : androidSteps;
  const platform = isIOS ? "iOS" : isAndroid ? "Android" : "Mobile";

  return (
    <Card className="w-full border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-foreground">
                Get The AM Project App
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Transform your personal development journey with our native app experience
                <span className="inline-block ml-2 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full border border-primary/20">
                  Beta
                </span>
              </CardDescription>
            </div>
          </div>
          {showDismiss && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Value Proposition */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            Why Install The AM Project App?
          </h3>
          <div className="grid gap-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Primary Install Button */}
        <div className="flex flex-col gap-3">
          {isInstalled ? (
            <div className="flex items-center justify-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-500 font-medium">App Already Installed</span>
            </div>
          ) : (
            <Button 
              size="lg"
              disabled={isInstalling}
              onClick={async () => {
                if (isInstallable) {
                  setIsInstalling(true);
                  try {
                    await installApp();
                    toast({
                      title: "App installed successfully!",
                      description: "The AM Project app has been added to your device.",
                    });
                  } catch (error) {
                    console.error('Install failed:', error);
                    toast({
                      title: "Installation failed",
                      description: "Please try using your browser's install option from the menu.",
                      variant: "destructive"
                    });
                    // Auto-expand steps as fallback
                    setIsExpanded(true);
                  } finally {
                    setIsInstalling(false);
                  }
                } else {
                  // Auto-expand steps when install isn't available
                  setIsExpanded(true);
                  if (isIOS) {
                    toast({
                      title: "iOS Installation Steps",
                      description: "1. Tap the Share button (square with arrow up) 2. Scroll down and tap 'Add to Home Screen' 3. Tap 'Add' to confirm",
                      duration: 8000,
                    });
                  } else {
                    toast({
                      title: "Android Installation Steps", 
                      description: "1. Tap the three dots menu in Chrome 2. Tap 'Add to Home screen' or 'Install app' 3. Tap 'Add' to confirm",
                      duration: 8000,
                    });
                  }
                }
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg disabled:opacity-70"
            >
              {isInstalling ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Install App
                </>
              )}
            </Button>
          )}
          
          {/* Show Steps Toggle */}
          {!isInstalled && (
            <div className="flex flex-col items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="bg-background/50 text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? "Hide" : "Show"} Step-by-Step Guide
                <ArrowRight className={`ml-2 h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
              </Button>
              
              {/* Installation Status Indicator */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {isInstallable ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Ready to install</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span>Manual installation required</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Installation Steps */}
        {isExpanded && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div className="border-l-2 border-primary/30 pl-4">
              <h3 className="font-semibold text-foreground mb-3">
                {platform} Installation Steps
              </h3>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 group">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-lg border border-primary/20 group-hover:bg-primary/20 transition-colors">
                      {step.icon}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-sm text-foreground font-medium">
                        Step {index + 1}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Message */}
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">You're All Set!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Once installed, The AM Project will appear on your home screen like any other app. 
                Tap to open and experience the full power of personal development at your fingertips.
              </p>
            </div>
          </div>
        )}

        {/* Brand Footer */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full" />
            </div>
            <span>Building the next generation of strong, purposeful men</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}