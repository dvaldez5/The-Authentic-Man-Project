// Test minimal routing without page imports
import React from "react";
import { Route, Switch, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "next-themes";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import { AMChatProvider } from "@/contexts/UnifiedAMChatContext";

// Simple test components instead of importing pages
function TestDashboard() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#4CAF50', color: 'white', minHeight: '100vh' }}>
      <h1>🟢 DASHBOARD TEST</h1>
      <p>Dashboard component working!</p>
    </div>
  );
}

function TestAuth() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#2196F3', color: 'white', minHeight: '100vh' }}>
      <h1>🔵 AUTH TEST</h1>
      <p>Auth page working!</p>
    </div>
  );
}

export default function App() {
  console.log('🔍 TESTING MINIMAL ROUTING');

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AMChatProvider>
              <Router>
                <Switch>
                  <Route path="/" component={TestDashboard} />
                  <Route path="/login" component={TestAuth} />
                  <Route path="/register" component={TestAuth} />
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