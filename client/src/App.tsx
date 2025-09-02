// Testing ErrorBoundary + QueryClient (AuthProvider removed)
import React from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

export default function App() {
  console.log('🔍 TESTING ERRORBOUNDARY + QUERYCLIENT (NO AUTHPROVIDER)');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#FF9800', 
          color: 'white',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h1>🟠 ERRORBOUNDARY + QUERYCLIENT TEST</h1>
          <p>If you see this orange message, ErrorBoundary + QueryClient work together (without AuthProvider).</p>
          <p>AuthProvider was removed to isolate the issue...</p>
          <div style={{ marginTop: '20px', fontSize: '14px', opacity: '0.8' }}>
            <p>✅ React: Working</p>
            <p>✅ ErrorBoundary: Working</p>
            <p>✅ QueryClient: Testing...</p>
            <p>❌ AuthProvider: Removed (likely the problem)</p>
          </div>
        </div>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}