// Testing with AuthProvider added back
import React from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";

export default function App() {
  console.log('🔍 TESTING WITH AUTHPROVIDER ADDED');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#9C27B0', 
            color: 'white',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <h1>🟣 AUTHPROVIDER RESTORED!</h1>
            <p>If you see this purple message, all core providers work with the QueryClient fix!</p>
            <p>AuthProvider is working correctly now.</p>
            <div style={{ marginTop: '20px', fontSize: '14px', opacity: '0.8' }}>
              <p>✅ React: Working</p>
              <p>✅ ErrorBoundary: Working</p>
              <p>✅ QueryClient: FIXED and working!</p>
              <p>✅ AuthProvider: Working!</p>
              <p>🔄 Next: Restore full app with routing</p>
            </div>
          </div>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}