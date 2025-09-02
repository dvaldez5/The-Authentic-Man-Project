import React from "react";
import ErrorBoundary from "@/components/ErrorBoundary";

// Ultra-simple test component
function UltraSimpleApp() {
  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#FF5722', 
      color: 'white', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>🔴 ULTRA SIMPLE TEST</h1>
      <p>If you see this, React is working. If not, there's a deeper issue.</p>
    </div>
  );
}

export default function App() {
  console.log('🔍 ULTRA SIMPLE APP TEST');
  
  return (
    <ErrorBoundary>
      <UltraSimpleApp />
    </ErrorBoundary>
  );
}