import React from "react";
import { Route, Switch, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "next-themes";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import { AMChatProvider } from "@/contexts/UnifiedAMChatContext";

// Pages
import Dashboard from "@/pages/Dashboard";
import AuthPage from "@/pages/AuthPage";
import Onboarding from "@/pages/Onboarding";
import Challenges from "@/pages/Challenges";
import Journal from "@/pages/Journal";
import Settings from "@/pages/Settings";
import SubscriptionPage from "@/pages/SubscriptionPage";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AMChatProvider>
              <Router>
                <Switch>
                  <Route path="/" component={Dashboard} />
                  <Route path="/login" component={AuthPage} />
                  <Route path="/register" component={AuthPage} />
                  <Route path="/onboarding" component={Onboarding} />
                  <Route path="/challenges" component={Challenges} />
                  <Route path="/journal" component={Journal} />
                  <Route path="/settings" component={Settings} />
                  <Route path="/subscription" component={SubscriptionPage} />
                </Switch>
              </Router>
              <Toaster />
            </AMChatProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}