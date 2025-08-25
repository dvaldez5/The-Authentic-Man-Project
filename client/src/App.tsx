import { Switch, Route, useLocation, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Blog from "@/pages/Blog";
import Join from "@/pages/Join";
import Contact from "@/pages/Contact";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { PWAProvider } from "@/hooks/use-pwa";
import { AMChatProvider } from "@/contexts/UnifiedAMChatContext";

function AppRouter(): React.JSX.Element {
  const { user } = useAuth();
  
  // Enable scroll to top for all page navigations
  useScrollToTop();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/blog" component={Blog} />
      <Route path="/join" component={Join} />
      <Route path="/contact" component={Contact} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/dashboard">{() => user ? <Dashboard /> : <AuthPage />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  
  return (
    <TooltipProvider>
      <Header />
      <main>
        <AppRouter />
      </main>
      <Footer />
      <Toaster />
    </TooltipProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <PWAProvider>
          <AuthProvider>
            <AMChatProvider>
              <Router>
                <AppContent />
              </Router>
            </AMChatProvider>
          </AuthProvider>
        </PWAProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}