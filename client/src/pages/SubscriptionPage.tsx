import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePWADetection } from "@/hooks/use-pwa-detection";
import { useMobileDetection } from "@/hooks/use-mobile-detection";
import { getTopPadding } from "@/utils/responsive-styles";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { useLocation } from "wouter";

interface SubscriptionDetails {
  id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_start: number;
  current_period_end: number;
  trial_end?: number;
  plan: {
    amount: number;
    currency: string;
    interval: string;
  };
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { isPWA } = usePWADetection();
  const { isMobile } = useMobileDetection();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await apiRequest("GET", "/api/subscription-details");
      const data = await response.json();
      setSubscription(data.subscription);
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const response = await apiRequest("POST", "/api/cancel-subscription");
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'Subscription is already cancelled') {
          toast({
            title: "Already Cancelled",
            description: "This subscription has already been cancelled.",
            variant: "destructive",
          });
          await fetchSubscriptionDetails(); // Refresh to show correct state
          return;
        }
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }
      
      const data = await response.json();
      
      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been canceled. You'll retain access until the end of your current period.",
      });
      
      // Refresh subscription details
      await fetchSubscriptionDetails();
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCanceling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsReactivating(true);
    try {
      const response = await apiRequest("POST", "/api/reactivate-subscription");
      const data = await response.json();
      
      toast({
        title: "Subscription Reactivated",
        description: "Your subscription has been reactivated successfully.",
      });
      
      // Refresh subscription details
      await fetchSubscriptionDetails();
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      toast({
        title: "Error",
        description: "Failed to reactivate subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsReactivating(false);
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp || timestamp <= 0) {
      return 'Invalid Date';
    }
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Canceling
      </Badge>;
    }

    switch (status) {
      case 'trialing':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Free Trial
        </Badge>;
      case 'active':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </Badge>;
      case 'canceled':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Canceled
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className={`container mx-auto px-4 ${getTopPadding(isPWA, isMobile, 'main')} pb-8`}>
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading subscription details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className={`container mx-auto px-4 ${getTopPadding(isPWA, isMobile, 'main')} pb-8`}>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="text-center space-y-2">
            <h1 className="challenge-header text-3xl md:text-4xl">Subscription Management</h1>
            <p className="challenge-body text-muted-foreground">
              Manage your AM Project subscription and billing settings
            </p>
          </div>

          {!subscription ? (
            <Card className="challenge-card border-gray-700">
              <CardContent className="pt-6 text-center">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="challenge-header text-lg mb-2">No Active Subscription</h3>
                <p className="challenge-body text-muted-foreground mb-4">
                  You don't have an active subscription. Start your journey with The AM Project.
                </p>
                <Button onClick={() => navigate("/payment")} className="bg-primary hover:bg-primary/90">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Current Subscription */}
              <Card className="challenge-card border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="challenge-header text-xl flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Current Subscription
                    </CardTitle>
                    {getStatusBadge(subscription.status, subscription.cancel_at_period_end)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Plan Details</h4>
                      <p className="challenge-body text-2xl font-bold text-primary">
                        {formatAmount(subscription.plan.amount, subscription.plan.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        per {subscription.plan.interval}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Status</h4>
                      <p className="challenge-body capitalize">
                        {subscription.cancel_at_period_end ? 'Canceling at period end' : subscription.status}
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-gray-700" />

                  <div className="space-y-3">
                    {subscription.trial_end && subscription.status === 'trialing' && (
                      <div className="flex items-center gap-3 p-3 bg-blue-950/30 border border-blue-800 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="font-medium text-blue-300">Free Trial Active</p>
                          <p className="text-sm text-blue-400">
                            Trial ends on {formatDate(subscription.trial_end)}
                          </p>
                        </div>
                      </div>
                    )}

                    {subscription.current_period_start && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Current period starts</span>
                        <span className="challenge-body">
                          {formatDate(subscription.current_period_start)}
                        </span>
                      </div>
                    )}
                    
                    {subscription.current_period_end && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Current period ends</span>
                        <span className="challenge-body">
                          {formatDate(subscription.current_period_end)}
                        </span>
                      </div>
                    )}

                    {subscription.cancel_at_period_end && (
                      <div className="flex items-center gap-3 p-3 bg-red-950/30 border border-red-800 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <div>
                          <p className="font-medium text-red-300">Subscription Ending</p>
                          <p className="text-sm text-red-400">
                            Access will end on {formatDate(subscription.trial_end || subscription.current_period_end)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="challenge-card border-gray-700">
                <CardHeader>
                  <CardTitle className="challenge-header text-lg">Subscription Actions</CardTitle>
                  <CardDescription className="challenge-body">
                    Manage your subscription settings and billing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!subscription.cancel_at_period_end && subscription.status !== 'canceled' ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Cancel your subscription anytime. You'll retain access until the end of your current billing period.
                      </p>
                      <Button
                        variant="destructive"
                        onClick={handleCancelSubscription}
                        disabled={isCanceling}
                        className="w-full"
                      >
                        {isCanceling ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Canceling...
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Subscription
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Changed your mind? You can reactivate your subscription and continue your journey.
                      </p>
                      <Button
                        onClick={handleReactivateSubscription}
                        disabled={isReactivating}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {isReactivating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Reactivating...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Reactivate Subscription
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Help */}
              <Card className="challenge-card border-gray-700">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <h4 className="font-semibold text-foreground">Need Help?</h4>
                    <p className="text-sm text-muted-foreground">
                      Have questions about your subscription or billing? We're here to help.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => navigate("/contact")}>
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}