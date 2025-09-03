import { Switch, Route, useLocation, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useCrossInstanceSync } from "@/hooks/use-cross-instance-sync";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { useEffect } from "react";
import { initUnifiedTracking } from "./lib/unified-tracking";
import { initializeSEO } from "./lib/seo-utils";
import { initializeProgrammaticSEO } from "./lib/programmatic-seo";
import { useAnalytics } from "./hooks/use-analytics";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import About from "@/pages/About";
import AMStandard from "@/pages/AMStandard";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Join from "@/pages/Join";
import Contact from "@/pages/Contact";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import ResetDiscipline from "@/pages/ResetDiscipline";
import DynamicLandingPage from "@/pages/DynamicLandingPage";
import TestLandingPage from "@/pages/TestLandingPage";
import TestForm from "@/pages/TestForm";
import AuthPage from "@/pages/AuthPage";
import PaymentPage from "@/pages/PaymentPage";
import Dashboard from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
import Splash from "@/pages/Splash";

import Journal from "@/pages/Journal";
import JournalPinned from "@/pages/JournalPinned";
import Community from "@/pages/CommunityNew";
import Pod from "@/pages/Pod";
import LearningCourses from "@/pages/learning/LearningCourses";
import LearningCourseDetail from "@/pages/learning/LearningCourseDetail";
import LearningLessonDetail from "@/pages/learning/LearningLessonDetail";
import Challenges from "@/pages/Challenges";
import WeeklyReflections from "@/pages/weekly/WeeklyReflections";
import Settings from "@/pages/Settings";
import SubscriptionPage from "@/pages/SubscriptionPage";
import PWADiagnostic from "@/pages/PWADiagnostic";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { PWAProvider } from "@/hooks/use-pwa";
import { usePWADetection, detectPWAMode } from "@/hooks/use-pwa-detection";
import { PWANavigationProvider } from "@/contexts/PWANavigationContext";
import { OnboardingTourProvider } from "@/contexts/OnboardingTourContext";
import { useNotificationManager } from "@/hooks/use-notification-manager";
import { ProtectedRoute } from "@/lib/protected-route";
import UnifiedAMChat from "@/components/UnifiedAMChat";
import { AMChatProvider } from "@/contexts/UnifiedAMChatContext";

import PWANavigation from "@/components/PWANavigation";
import { TourTooltip } from "@/components/tour/TourTooltip";
import { TourManager } from "@/components/tour/TourManager";
import { TourOverlay } from "@/components/tour/TourOverlay";

import { isAppSubdomain, isMarketingDomain } from "@/lib/subdomain";

// UnifiedAMChat already imported correctly on line 55

function AppRouter(): React.JSX.Element {
  const { user } = useAuth();
  
  // Track page views when routes change
  useAnalytics();
  
  // Enable scroll to top for all page navigations except journal sections
  useScrollToTop();
  
  // USE CENTRALIZED PWA DETECTION - DO NOT MODIFY
  const shouldUsePWA = detectPWAMode();
  
  // Subdomain detection for routing separation
  const onAppSubdomain = isAppSubdomain();
  const onMarketingDomain = isMarketingDomain();
  
  // Environment check - Vite safe
  const isProd = import.meta.env.MODE === 'production';

  console.log('FORCED ROUTING DECISION:', {
    shouldUsePWA,
    component: shouldUsePWA ? 'Splash' : 'Home',
    urlSearch: window.location.search,
    userAgent: navigator.userAgent.substring(0, 80)
  });

  // CRITICAL DEBUG: Log every route decision
  console.log('ROUTE RENDER:', {
    path: '/',
    shouldUsePWA,
    componentChoice: shouldUsePWA ? 'Splash' : 'Home',
    timestamp: Date.now()
  });

  // DIRECT COMPONENT OVERRIDE: Force component rendering regardless of router state
  const ForceCorrectComponent = (): React.JSX.Element => {
    if (shouldUsePWA) {
      console.log('FORCE OVERRIDE: Rendering Splash for PWA');
      return <Splash />;
    }
    console.log('FORCE OVERRIDE: Rendering Home for non-PWA');
    return <Home />;
  };

  // Subdomain-based routing separation
  // Marketing domain shows marketing pages
  // App subdomain shows app pages
  // PWA mode overrides everything (unchanged)
  
  // If we're on the app subdomain, show app routes
  if (onAppSubdomain && !shouldUsePWA) {
    return (
      <Switch>
        <Route path="/">{() => user ? <Dashboard /> : <AuthPage />}</Route>
        <Route path="/auth" component={AuthPage} />
        <Route path="/payment" component={PaymentPage} />
        <Route path="/onboarding" component={Onboarding} />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        
        {/* Unified Learning System */}
        <Route path="/learning" component={LearningCourses} />
        <Route path="/learning/courses" component={LearningCourses} />
        <Route path="/learning/courses/:courseId" component={LearningCourseDetail} />
        <Route path="/learning/lessons/:lessonId" component={LearningLessonDetail} />
        
        <ProtectedRoute path="/challenges" component={Challenges} />
        <ProtectedRoute path="/journal" component={Journal} />
        <ProtectedRoute path="/journal/pinned" component={JournalPinned} />
        <ProtectedRoute path="/community" component={Community} />
        <ProtectedRoute path="/pod" component={Pod} />
        <ProtectedRoute path="/weekly-reflections" component={WeeklyReflections} />
        <ProtectedRoute path="/settings" component={Settings} />
        <ProtectedRoute path="/subscription" component={() => <SubscriptionPage />} />
        
        {/* PWA Diagnostic page (for debugging) */}
        <Route path="/pwa-diagnostic" component={PWADiagnostic} />
        
        {/* Catch-all: 404 */}
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Default routing for marketing domain and PWA mode
  return (
    <Switch>
      <Route path="/">{() => <ForceCorrectComponent />}</Route>
      <Route path="/splash" component={Splash} />
      <Route path="/about" component={About} />
      <Route path="/standard" component={AMStandard} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/join" component={Join} />
      <Route path="/contact" component={Contact} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/reset-discipline" component={ResetDiscipline} />
      <Route path="/landing/:slug" component={DynamicLandingPage} />
      <Route path="/test-landing/:slug" component={TestLandingPage} />
      <Route path="/test-form" component={TestForm} />
      
      {/* Auth pages redirect to app subdomain in production */}
      <Route path="/auth">{() => {
        if (isProd && !onAppSubdomain && !shouldUsePWA) {
          window.location.href = 'https://app.theamproject.com/auth';
          return <div>Redirecting...</div>;
        }
        return <AuthPage />;
      }}</Route>
      
      <Route path="/payment">{() => {
        if (isProd && !onAppSubdomain && !shouldUsePWA) {
          window.location.href = 'https://app.theamproject.com/payment';
          return <div>Redirecting...</div>;
        }
        return <PaymentPage />;
      }}</Route>
      
      <Route path="/onboarding">{() => {
        if (isProd && !onAppSubdomain && !shouldUsePWA) {
          window.location.href = 'https://app.theamproject.com/onboarding';
          return <div>Redirecting...</div>;
        }
        return <Onboarding />;
      }}</Route>
      
      {/* Protected pages redirect to app subdomain */}
      <Route path="/dashboard">{() => {
        if (isProd && !onAppSubdomain && !shouldUsePWA) {
          window.location.href = 'https://app.theamproject.com/dashboard';
          return <div>Redirecting...</div>;
        }
        return <Dashboard />;
      }}</Route>
      
      {/* All other protected routes redirect to app subdomain */}
      <Route path="/learning">{() => {
        if (isProd && !onAppSubdomain && !shouldUsePWA) {
          window.location.href = 'https://app.theamproject.com/learning';
          return <div>Redirecting...</div>;
        }
        return <LearningCourses />;
      }}</Route>
      
      <Route path="/challenges">{() => {
        if (isProd && !onAppSubdomain && !shouldUsePWA) {
          window.location.href = 'https://app.theamproject.com/challenges';
          return <div>Redirecting...</div>;
        }
        return <Challenges />;
      }}</Route>
      
      <Route path="/journal">{() => {
        if (isProd && !onAppSubdomain && !shouldUsePWA) {
          window.location.href = 'https://app.theamproject.com/journal';
          return <div>Redirecting...</div>;
        }
        return <Journal />;
      }}</Route>
      
      <Route path="/community">{() => {
        if (isProd && !onAppSubdomain && !shouldUsePWA) {
          window.location.href = 'https://app.theamproject.com/community';
          return <div>Redirecting...</div>;
        }
        return <Community />;
      }}</Route>
      
      <Route path="/weekly-reflections">{() => {
        if (isProd && !onAppSubdomain && !shouldUsePWA) {
          window.location.href = 'https://app.theamproject.com/weekly-reflections';
          return <div>Redirecting...</div>;
        }
        return <WeeklyReflections />;
      }}</Route>
      
      <Route path="/settings">{() => {
        if (isProd && !onAppSubdomain && !shouldUsePWA) {
          window.location.href = 'https://app.theamproject.com/settings';
          return <div>Redirecting...</div>;
        }
        return <Settings />;
      }}</Route>
      
      <Route path="/subscription">{() => {
        if (isProd && !onAppSubdomain && !shouldUsePWA) {
          window.location.href = 'https://app.theamproject.com/subscription';
          return <div>Redirecting...</div>;
        }
        return <SubscriptionPage />;
      }}</Route>
      
      {/* PWA Diagnostic page (for debugging) */}
      <Route path="/pwa-diagnostic" component={PWADiagnostic} />
      
      {/* Catch-all: 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Enable cross-instance sync for real-time data updates
  useCrossInstanceSync();
  
  // Initialize notification manager for authenticated users
  useNotificationManager();
  
  // USE CENTRALIZED PWA DETECTION
  const shouldUsePWA = detectPWAMode();
  
  // Check if we're on a marketing page (landing pages should ALWAYS show header)
  const isMarketingPage = location.startsWith('/landing/') || location.startsWith('/test-landing/');
  
  // Show PWA navigation when in PWA mode and user is authenticated (not on splash/auth pages)
  const showPWANav = shouldUsePWA && user && location !== "/" && location !== "/splash" && location !== "/auth";
  
  // Marketing pages ALWAYS show header/footer. App pages hide them in PWA mode.
  const showHeaderFooter = isMarketingPage || !shouldUsePWA;
  
  // AM Chat bubble logic - direct unified approach
  const showAMChat = location !== "/" && location !== "/splash";
  
  // Apply PWA padding when in PWA mode and authenticated (not on splash/auth pages)
  const pwaMainClass = showPWANav ? "pb-20" : "";
  
  return (
    <TooltipProvider>
      {showHeaderFooter && <Header />}
      {showPWANav && <PWANavigation />}
      <main className={pwaMainClass}>
        <AppRouter />
      </main>
      {showHeaderFooter && <Footer />}
      <Toaster />
      <TourOverlay />
      <TourTooltip />
      <TourManager />
      {/* Global AM Chat Bubble - only show when not on homepage/splash */}
      {showAMChat && <UnifiedAMChat type="bubble" />}
    </TooltipProvider>
  );
}

export default function App() {
  // Initialize unified tracking (GA4 + Google Ads) when app loads
  useEffect(() => {
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initUnifiedTracking();
      
      // Initialize SEO systems
      initializeSEO();
      initializeProgrammaticSEO();
      
      // Initialize advanced GA4 features after basic setup
      setTimeout(() => {
        import('./lib/ga4-bounce-analysis').then(({ initGA4BounceAnalysis }) => {
          initGA4BounceAnalysis();
        });
      }, 1000);
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AMChatProvider>
              <PWANavigationProvider>
                <OnboardingTourProvider>
                  <Router>
                    <AppContent />
                  </Router>
                </OnboardingTourProvider>
              </PWANavigationProvider>
            </AMChatProvider>
          </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}