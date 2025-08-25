import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { usePWADetection } from "@/hooks/use-pwa-detection";
import { useMobileDetection } from "@/hooks/use-mobile-detection";
import { getTopPadding } from "@/utils/responsive-styles";
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useExitIntent } from '@/hooks/use-exit-intent';
import ExitIntentModal from '@/components/ExitIntentModal';
import { 
  Loader2, 
  Shield, 
  Check, 
  CreditCard,
  Zap,
  Users,
  BookOpen,
  Target
} from "lucide-react";
import { useMarketingAnalytics } from "@/hooks/use-marketing-analytics";
import { useGoogleAdsConversions } from "@/hooks/use-google-ads-conversions";

// Initialize Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentForm = ({ isTrialPeriod }: { isTrialPeriod?: boolean }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      if (isTrialPeriod) {
        // For trial periods, use setup intent to save payment method
        const { error, setupIntent } = await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: window.location.origin + "/payment?success=true"
          },
          redirect: "if_required",
        });

        if (error) {
          toast({
            title: "Setup Failed",
            description: error.message,
            variant: "destructive",
          });
          setIsProcessing(false);
        } else if (setupIntent && setupIntent.status === "succeeded") {
          // Call backend to complete subscription setup and create account
          try {
            const registrationKey = localStorage.getItem('registrationKey');
            console.log('PaymentForm: Setup intent succeeded, completing setup', { 
              setupIntentId: setupIntent.id, 
              hasRegistrationKey: !!registrationKey 
            });
            
            const response = await apiRequest("POST", "/api/setup-complete", {
              setupIntentId: setupIntent.id,
              registrationKey
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('PaymentForm: Setup completion response', data);
              
              // If this is a new registration, set up the auth
              if (data.token) {
                localStorage.setItem('auth_token', data.token);
                localStorage.removeItem('registrationKey');
                localStorage.removeItem('pendingEmail');
                console.log('PaymentForm: Auth token stored, registration keys cleared');
                
                // Track trial start conversion
                trackTrialStartConversion();
              }
              
              toast({
                title: "Account Created Successfully!",
                description: "Welcome to The AM Project! Your 7-day free trial begins now.",
              });
              
              // Force page reload to update auth state
              window.location.href = "/onboarding";
            } else {
              const errorData = await response.json();
              console.error('PaymentForm: Setup completion failed', errorData);
              throw new Error(errorData.error || "Failed to complete subscription setup");
            }
          } catch (error) {
            console.error('PaymentForm: Setup completion error', error);
            toast({
              title: "Setup Error",
              description: "Failed to complete trial setup. Please try again.",
              variant: "destructive",
            });
            setIsProcessing(false);
          }
        } else {
          setIsProcessing(false);
        }
      } else {
        // For immediate payments, use payment intent
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: "if_required",
        });

        if (error) {
          toast({
            title: "Payment Failed",
            description: error.message,
            variant: "destructive",
          });
          setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
          toast({
            title: "Payment Successful",
            description: "Welcome to The AM Project! Your transformation begins now.",
          });
          navigate("/onboarding");
        } else {
          setIsProcessing(false);
        }
      }
    } catch (error: any) {
      console.error("Payment processing error:", error);
      toast({
        title: "Processing Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-6 bg-card border border-gray-700 rounded-lg">
        <PaymentElement 
          options={{
            layout: "tabs",
            fields: {
              billingDetails: "auto"
            },
            terms: {
              card: "never"
            }
          }}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-lg"
        disabled={!stripe || !elements || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Starting Free Trial...
          </>
        ) : (
          <>
            <Shield className="mr-2 h-5 w-5" />
            Start 7-Day Free Trial
          </>
        )}
      </Button>
    </form>
  );
};

export default function PaymentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { isPWA } = usePWADetection();
  const { isMobile } = useMobileDetection();
  const [showExitModal, setShowExitModal] = useState(false);
  
  // Initialize marketing analytics for conversion funnel tracking
  const { trackInteraction } = useMarketingAnalytics();
  
  // Exit intent detection
  const { getTimeOnPage, getScrollDepth } = useExitIntent(
    (data) => {
      if (!showExitModal) {
        setShowExitModal(true);
      }
    },
    { delay: 3000 }
  );
  const [clientSecret, setClientSecret] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountValidation, setDiscountValidation] = useState<{
    valid: boolean;
    message: string;
    description?: string;
  } | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [isTrialPeriod, setIsTrialPeriod] = useState(false);

  // Check authentication state and redirect logic
  useEffect(() => {
    const registrationKey = localStorage.getItem('registrationKey');
    
    console.log('PaymentPage: Authentication check', { user: !!user, registrationKey: !!registrationKey });
    
    // If no user and no registration key, redirect to auth
    if (!user && !registrationKey) {
      console.log('PaymentPage: No user or registration key, redirecting to auth');
      navigate("/auth");
      return;
    }

    // If user exists, check subscription status
    if (user) {
      const checkSubscription = async () => {
        try {
          const response = await apiRequest("GET", "/api/subscription-status");
          const data = await response.json();
          
          console.log('PaymentPage: Subscription status', data);
          
          if (data.hasActiveSubscription || data.isDevAccount) {
            // User already has access, redirect to appropriate destination
            // Always check onboarding status from fresh user data
            const destination = user.onboardingComplete ? "/dashboard" : "/onboarding";
            console.log('PaymentPage: Redirecting to', destination, 'onboardingComplete:', user.onboardingComplete);
            navigate(destination);
            return;
          }
        } catch (error) {
          console.error("Error checking subscription:", error);
        }
      };

      checkSubscription();
    }
  }, [navigate, user]);

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountValidation(null);
      return;
    }

    // Track discount code validation attempt
    trackInteraction('discount_code_validate', 'payment_section');

    setIsValidatingDiscount(true);
    try {
      const response = await apiRequest("POST", "/api/validate-discount", { code: discountCode.trim() });
      const data = await response.json();
      setDiscountValidation(data);
      
      if (data.valid) {
        trackInteraction('discount_code_valid', 'payment_section');
      }
    } catch (error) {
      console.error("Error validating discount:", error);
      setDiscountValidation({ 
        valid: false, 
        message: "Error validating discount code" 
      });
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const applyDiscountCode = async () => {
    // Track discount code application attempt
    trackInteraction('discount_code_apply', 'payment_section');
    
    try {
      // Check if user needs to be created first
      const registrationKey = localStorage.getItem('registrationKey');
      
      if (registrationKey) {
        // For new registrations, complete registration with discount
        const response = await apiRequest("POST", "/api/complete-registration", { 
          registrationKey,
          discountCode: discountCode.trim() 
        });
        const data = await response.json();
        
        if (data.token && data.discountApplied) {
          localStorage.setItem('auth_token', data.token);
          localStorage.removeItem('registrationKey');
          localStorage.removeItem('pendingEmail');
          
          // Set user data in cache to ensure auth state sync
          queryClient.setQueryData(['/api/auth/me'], data.user);
          queryClient.invalidateQueries({ queryKey: ['/api/subscription-status'] });
          
          // Track successful discount application
          trackInteraction('discount_code_success', 'payment_section');
          
          toast({
            title: "Discount Applied!",
            description: "Welcome to The AM Project! Your transformation begins now.",
          });
          
          // Redirect with proper auth state
          setTimeout(() => {
            window.location.href = "/onboarding";
          }, 500);
        } else {
          throw new Error('Discount code application failed');
        }
      } else {
        // For existing users, apply discount to existing account
        const response = await apiRequest("POST", "/api/create-subscription", { 
          discountCode: discountCode.trim() 
        });
        const data = await response.json();
        
        if (data.discountApplied) {
          // Invalidate subscription cache to reflect new active status
          queryClient.invalidateQueries({ queryKey: ['/api/subscription-status'] });
          
          toast({
            title: "Discount Applied!",
            description: "Welcome to The AM Project! Your transformation begins now.",
          });
          // For existing users with completed onboarding, go directly to dashboard
          // For new users, redirect based on server response
          const destination = data.shouldRedirectToOnboarding ? "/onboarding" : "/dashboard";
          window.location.href = destination;
        }
      }
    } catch (error) {
      console.error("Error applying discount:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to apply discount code";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const createSubscription = async () => {
    try {
      const registrationKey = localStorage.getItem('registrationKey');
      const endpoint = registrationKey ? "/api/create-setup-intent" : "/api/create-subscription";
      
      console.log('PaymentPage: Creating subscription', { endpoint, hasRegistrationKey: !!registrationKey });
      
      const response = await apiRequest("POST", endpoint, registrationKey ? { registrationKey } : {});
      const data = await response.json();
      
      console.log('PaymentPage: Subscription creation response', data);
      
      setClientSecret(data.clientSecret);
      setIsTrialPeriod(data.isTrialPeriod || false);
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!discountApplied) {
      createSubscription();
    }
  }, [discountApplied]);

  return (
    <div className="min-h-screen bg-black">
      <div className={`container mx-auto px-4 ${getTopPadding(isPWA, isMobile, 'main')} pb-8`}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <h1 className="challenge-header text-4xl md:text-6xl">Join The AM Project</h1>
            <p className="challenge-body text-lg text-muted-foreground max-w-2xl mx-auto">
              Your transformation journey starts here. Unlock the full potential of authentic masculine leadership.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* What's Included */}
            <Card className="challenge-card border-gray-700">
              <CardHeader>
                <CardTitle className="challenge-header text-2xl">What's Included</CardTitle>
                <CardDescription className="challenge-body">
                  Everything you need for authentic personal development
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Unlimited AM Chat</h3>
                    <p className="challenge-body text-sm">24/7 AI-powered guidance and support</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Complete Curriculum</h3>
                    <p className="challenge-body text-sm">Structured courses on leadership, resilience, and growth</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Daily Challenges</h3>
                    <p className="challenge-body text-sm">Actionable tasks to build consistency and momentum</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Brotherhood Community</h3>
                    <p className="challenge-body text-sm">Accountability pods and peer support</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">$9.99</div>
                    <div className="challenge-body text-sm text-muted-foreground">per month</div>
                    <div className="text-xs text-green-400 mt-1">7-day free trial</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card className="challenge-card border-gray-700">
              <CardHeader>
                <CardTitle className="challenge-header text-2xl flex items-center gap-2">
                  <CreditCard className="h-6 w-6" />
                  Start Your 7-Day Free Trial
                </CardTitle>
                <CardDescription className="challenge-body">
                  Start your free trial today. You'll be charged $9.99/month starting on day 8. Cancel anytime before then to avoid charges.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Discount Code Section */}
                <div className="space-y-3">
                  <Label htmlFor="discount-code" className="text-foreground">
                    Have a discount code?
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="discount-code"
                      type="text"
                      placeholder="Enter code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={validateDiscountCode}
                      disabled={isValidatingDiscount || !discountCode.trim()}
                      className="border-primary text-primary hover:bg-primary/10"
                    >
                      {isValidatingDiscount ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Validate"
                      )}
                    </Button>
                  </div>
                  
                  {discountValidation && (
                    <div className={`text-sm ${discountValidation.valid ? 'text-green-400' : 'text-red-400'}`}>
                      {discountValidation.message}
                      {discountValidation.valid && discountValidation.description && (
                        <div className="text-muted-foreground mt-1">
                          {discountValidation.description}
                        </div>
                      )}
                    </div>
                  )}

                  {discountValidation?.valid && (
                    <Button
                      type="button"
                      onClick={applyDiscountCode}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Apply Discount Code
                    </Button>
                  )}
                </div>

                {/* Payment Form */}
                {!discountValidation?.valid && clientSecret && (
                  <Elements 
                    stripe={stripePromise} 
                    options={{ 
                      clientSecret,
                      appearance: {
                        theme: 'night',
                        variables: {
                          colorPrimary: '#D4AF37',
                          colorBackground: '#000000',
                          colorText: '#ffffff',
                          colorDanger: '#df1b41',
                          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                          spacingUnit: '4px',
                          borderRadius: '8px'
                        }
                      }
                    }}
                  >
                    <PaymentForm isTrialPeriod={isTrialPeriod} />
                  </Elements>
                )}

                {!clientSecret && !discountValidation?.valid && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="challenge-body text-muted-foreground">
                      Initializing secure payment...
                    </p>
                  </div>
                )}

                {/* Trial Terms */}
                <div className="bg-card p-4 rounded-lg border border-gray-700 space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Trial Terms</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• 7-day free trial starts immediately</li>
                    <li>• Payment method required to begin trial</li>
                    <li>• First charge occurs on day 8 ($9.99)</li>
                    <li>• Cancel anytime before day 8 to avoid charges</li>
                    <li>• Monthly billing cycle after trial ends</li>
                  </ul>
                </div>

                {/* Security Notice */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card p-3 rounded-lg border border-gray-700">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {showExitModal && (
        <ExitIntentModal 
          isOpen={showExitModal}
          onClose={() => setShowExitModal(false)}
          currentPage="payment"
          timeOnPage={getTimeOnPage()}
          scrollDepth={getScrollDepth()}
        />
      )}
    </div>
  );
}