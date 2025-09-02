// Testing QueryClient without ErrorBoundary
import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

export default function App() {
  console.log('🔍 TESTING QUERYCLIENT IMPORT');

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#2196F3', 
        color: 'white',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h1>🔵 QUERYCLIENT TEST</h1>
        <p>If you see this blue message, QueryClientProvider works correctly.</p>
        <p>Testing React Query integration...</p>
        <div style={{ marginTop: '20px', fontSize: '14px', opacity: '0.8' }}>
          <p>✅ React: Working</p>
          <p>✅ QueryClient: Testing...</p>
          <p>❓ ErrorBoundary: Skipped (might be the issue)</p>
        </div>
      </div>
    </QueryClientProvider>
  );
}