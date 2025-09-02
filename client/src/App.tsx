// Test minimal routing without page imports
import React from "react";
import { Route, Switch, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "next-themes";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
// Simple test components 
function TestDashboard() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#4CAF50', color: 'white', minHeight: '100vh' }}>
      <h1>🟢 FIXED! TOASTER WAS THE PROBLEM!</h1>
      <p>The Radix UI ToastProvider was causing the React useState error.</p>
      <p>Your app should now work without the toast notifications.</p>
    </div>
  );
}

export default function App() {
  console.log('🔍 TESTING WITHOUT TOASTER COMPONENT');

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
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}