// Test minimal routing without page imports
import React from "react";
import { Route, Switch, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "next-themes";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
// Simple test components 
function TestDashboard() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#FF5722', color: 'white', minHeight: '100vh' }}>
      <h1>🔴 TESTING WITHOUT AMCHATPROVIDER</h1>
      <p>If you see this red message, AMChatProvider was the problem!</p>
    </div>
  );
}

export default function App() {
  console.log('🔍 TESTING WITHOUT AMCHATPROVIDER');

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router>
              <Switch>
                <Route path="/" component={TestDashboard} />
              </Switch>
            </Router>
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}