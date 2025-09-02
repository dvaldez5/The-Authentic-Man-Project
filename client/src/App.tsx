// Testing simplified AuthProvider (without useToast)
import React, { createContext, ReactNode, useContext, useState } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Simplified AuthProvider for testing
const AuthContext = createContext<any>(null);

function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [token] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  });

  // Simplified context value without useToast
  const value = {
    user: null,
    isLoading: false,
    error: null,
    token,
    loginMutation: null,
    logoutMutation: null,
    registerMutation: null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default function App() {
  console.log('🔍 TESTING SIMPLIFIED AUTHPROVIDER (NO USETOAST)');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SimpleAuthProvider>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#673AB7', 
            color: 'white',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <h1>🟣 SIMPLIFIED AUTHPROVIDER TEST</h1>
            <p>If you see this purple message, the issue is with useToast or mutations in AuthProvider.</p>
            <p>Testing AuthProvider without useToast dependency...</p>
            <div style={{ marginTop: '20px', fontSize: '14px', opacity: '0.8' }}>
              <p>✅ React: Working</p>
              <p>✅ ErrorBoundary: Working</p>
              <p>✅ QueryClient: FIXED and working!</p>
              <p>🔍 Simplified AuthProvider: Testing...</p>
              <p>❓ useToast: Suspected issue</p>
            </div>
          </div>
        </SimpleAuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}