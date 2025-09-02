// Testing ErrorBoundary + QueryClient + AuthProvider
import React from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";

export default function App() {
  console.log('🔍 TESTING ERRORBOUNDARY + QUERYCLIENT + AUTHPROVIDER');

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
            <h1>🟣 AUTH PROVIDER TEST</h1>
            <p>If you see this purple message, ErrorBoundary + QueryClient + AuthProvider work together.</p>
            <p>Testing authentication context...</p>
            <div style={{ marginTop: '20px', fontSize: '14px', opacity: '0.8' }}>
              <p>✅ React: Working</p>
              <p>✅ ErrorBoundary: Working</p>
              <p>✅ QueryClient: Working</p>
              <p>🔍 AuthProvider: Testing...</p>
            </div>
          </div>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}