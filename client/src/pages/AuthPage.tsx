import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { usePWA } from "@/hooks/use-pwa";
import { Loader2, Shield, Users, Trophy, Target } from "lucide-react";
import PWAInstallationGuide from "@/components/PWAInstallationGuide";
import { useMarketingAnalytics } from "@/hooks/use-marketing-analytics";
import { useGoogleAdsConversions } from "@/hooks/use-google-ads-conversions";
import { useExitIntent } from '@/hooks/use-exit-intent';
import ExitIntentModal from '@/components/ExitIntentModal';


export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const { isInstallable, installApp } = usePWA();
  const [, navigate] = useLocation();
  const [showExitModal, setShowExitModal] = useState(false);
  
  // Initialize marketing analytics for conversion funnel tracking
  const { trackInteraction } = useMarketingAnalytics();
  
  // Exit intent detection with MUCH better settings for auth page
  const { getTimeOnPage, getScrollDepth } = useExitIntent(
    (data) => {
      if (!showExitModal) {
        setShowExitModal(true);
      }
    },
    { 
      delay: 30000, // 30 seconds minimum - much more reasonable for auth page
      debounce: 5000 // 5 second debounce to prevent spam
    }
  );
  
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ 
    email: "", 
    password: "", 
    fullName: "",
    confirmPassword: ""
  });

  // Check URL parameter for signup mode
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const defaultTab = mode === 'signup' ? 'register' : 'login';

  // Watch for successful registration and navigate to payment
  useEffect(() => {
    if (registerMutation.isSuccess && !registerMutation.isPending) {
      const registrationKey = localStorage.getItem('registrationKey');
      console.log('AuthPage: Registration success, navigating to payment', { registrationKey: !!registrationKey });
      if (registrationKey) {
        navigate("/payment", { replace: true });
      }
    }
  }, [registerMutation.isSuccess, registerMutation.isPending, navigate]);

  // If we have authenticated user, redirect appropriately
  if (user) {
    if (user.onboardingComplete) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/onboarding", { replace: true });
    }
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track login form submission
    trackInteraction('login_form_submit', 'auth_section');
    
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(loginForm);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track registration form submission
    trackInteraction('register_form_submit', 'auth_section');
    
    if (!registerForm.email || !registerForm.password || !registerForm.fullName) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (registerForm.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    
    const { confirmPassword, ...data } = registerForm;
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left side - Authentication Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to The AM Project</h1>
            <p className="text-gray-300">Your journey to authentic leadership starts here</p>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted border-border">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Sign In</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Access your learning dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-foreground">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-input border-border text-foreground placeholder-muted-foreground"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-foreground">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        className="bg-input border-border text-foreground placeholder-muted-foreground"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Create Account</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Start your transformation journey today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name" className="text-foreground">Full Name</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Your full name"
                        value={registerForm.fullName}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, fullName: e.target.value }))}
                        className="bg-input border-border text-foreground placeholder-muted-foreground"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-foreground">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your@email.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-input border-border text-foreground placeholder-muted-foreground"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-foreground">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Create a password (min 6 characters)"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                        className="bg-input border-border text-foreground placeholder-muted-foreground"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm" className="text-foreground">Confirm Password</Label>
                      <Input
                        id="register-confirm"
                        type="password"
                        placeholder="Confirm your password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="bg-input border-border text-foreground placeholder-muted-foreground"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* PWA Installation Guide */}
          <PWAInstallationGuide showDismiss={false} />
        </div>
      </div>

      {/* Right side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 p-12">
        <div className="max-w-lg text-primary-foreground flex flex-col justify-start py-12">
          <h2 className="text-4xl font-bold mb-6">Transform Your Life</h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join men who are committed to building unshakeable discipline, authentic leadership, and purposeful lives through our comprehensive membership platform.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <Shield className="h-8 w-8 mt-1 text-accent flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Personal Development Tools</h3>
                <p className="text-sm text-primary-foreground/80">Access proven frameworks for building mental resilience, emotional intelligence, and leadership skills</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Users className="h-8 w-8 mt-1 text-accent flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Brotherhood & Community</h3>
                <p className="text-sm text-primary-foreground/80">Connect with like-minded men committed to growth, accountability, and authentic living</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Trophy className="h-8 w-8 mt-1 text-accent flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Structured Learning Paths</h3>
                <p className="text-sm text-primary-foreground/80">Follow curated courses on leadership, discipline, relationships, and personal mastery</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Target className="h-8 w-8 mt-1 text-accent flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Purpose-Driven Action</h3>
                <p className="text-sm text-primary-foreground/80">Transform insights into real-world results with actionable challenges and accountability systems</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-black/20 rounded-lg border border-accent/20">
            <p className="text-sm font-medium text-accent mb-2">What you get as a member:</p>
            <ul className="text-sm text-primary-foreground/80 space-y-1">
              <li>• Complete AM Standard framework & courses</li>
              <li>• Weekly group challenges & accountability</li>
              <li>• Private community access & mentorship</li>
              <li>• Exclusive content & member-only resources</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Exit Intent Modal - Only after 30 seconds and when user isn't actively engaged */}
      {showExitModal && (
        <ExitIntentModal 
          isOpen={showExitModal}
          onClose={() => setShowExitModal(false)}
          currentPage="auth"
          timeOnPage={getTimeOnPage()}
          scrollDepth={getScrollDepth()}
        />
      )}
    </div>
  );
}