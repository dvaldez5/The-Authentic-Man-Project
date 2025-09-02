// Testing ErrorBoundary + QueryClient (the fixed version)
import React from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

export default function App() {
  console.log('🔍 TESTING ERRORBOUNDARY + QUERYCLIENT (FIXED)');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#4CAF50', 
          color: 'white',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h1>🟢 ERRORBOUNDARY + QUERYCLIENT FIXED!</h1>
          <p>If you see this green message, ErrorBoundary + QueryClient work together perfectly!</p>
          <p>The QueryClient initialization bug has been fixed.</p>
          <div style={{ marginTop: '20px', fontSize: '14px', opacity: '0.8' }}>
            <p>✅ React: Working</p>
            <p>✅ ErrorBoundary: Working</p>
            <p>✅ QueryClient: FIXED and working!</p>
            <p>🔄 Next: Add back AuthProvider and other components</p>
          </div>
        </div>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}