import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { Loader2, Lock } from "lucide-react";
import { Route, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading: authLoading } = useAuth();
  const { hasActiveSubscription, isDevAccount, isLoading: subscriptionLoading } = useSubscription();
  const [, navigate] = useLocation();

  const isLoading = authLoading || subscriptionLoading;

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-foreground">Loading...</p>
          </div>
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        {() => {
          window.location.href = "/auth";
          return <div>Redirecting...</div>;
        }}
      </Route>
    );
  }

  // Check if user has completed onboarding first
  if (!user.onboardingComplete && path !== "/onboarding") {
    return (
      <Route path={path}>
        {() => {
          window.location.href = "/onboarding";
          return <div>Redirecting...</div>;
        }}
      </Route>
    );
  }

  // Check subscription status for member pages
  if (!hasActiveSubscription && !isDevAccount && path !== "/payment") {
    return (
      <Route path={path}>
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card border-gray-700">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-foreground">Paid Membership Required</CardTitle>
              <CardDescription className="text-muted-foreground">
                This feature requires an active paid subscription to The AM Project. Start your 7-day free trial to unlock all features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => navigate("/payment")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Start Free Trial ($9.99/month after trial)
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="w-full border-gray-600 text-foreground hover:bg-gray-800"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}