// Testing QueryClient ONLY (no ErrorBoundary)
import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

export default function App() {
  console.log('🔍 TESTING QUERYCLIENT ONLY (NO ERRORBOUNDARY)');

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
        <h1>🔵 QUERYCLIENT ONLY TEST</h1>
        <p>If you see this blue message, QueryClient works by itself (without ErrorBoundary).</p>
        <p>Testing React Query in isolation...</p>
        <div style={{ marginTop: '20px', fontSize: '14px', opacity: '0.8' }}>
          <p>✅ React: Working</p>
          <p>🔍 QueryClient: Testing alone...</p>
          <p>❓ ErrorBoundary: Removed to isolate issue</p>
          <p>❌ AuthProvider: Previously removed</p>
        </div>
      </div>
    </QueryClientProvider>
  );
}