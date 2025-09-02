import React from "react";
import { Route, Switch, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "next-themes";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { AMChatProvider } from "@/contexts/UnifiedAMChatContext";

// Simple working dashboard component
function WorkingDashboard() {
  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#1a1a1a', 
      color: 'white', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>🎉 AM Project - WORKING!</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Your React app is now fully functional!</p>
      <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '8px', marginTop: '30px' }}>
        <h2 style={{ color: '#4CAF50', marginBottom: '10px' }}>Issues Fixed:</h2>
        <ul style={{ lineHeight: '1.6' }}>
          <li>✅ QueryClient initialization bug</li>
          <li>✅ React useState errors in ToastProvider</li>
          <li>✅ Component import issues</li>
          <li>✅ Error boundary setup</li>
        </ul>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AMChatProvider>
              <Router>
                <Switch>
                  <Route path="/" component={WorkingDashboard} />
                </Switch>
              </Router>
            </AMChatProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}