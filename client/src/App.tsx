// Testing ErrorBoundary import
import React from "react";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function App() {
  console.log('🔍 TESTING ERRORBOUNDARY IMPORT');

  return (
    <ErrorBoundary>
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
        <h1>🟢 ERRORBOUNDARY TEST</h1>
        <p>If you see this green message, ErrorBoundary import works correctly.</p>
        <p>Next: Test other imports one by one.</p>
        <div style={{ marginTop: '20px', fontSize: '14px', opacity: '0.8' }}>
          <p>✅ React: Working</p>
          <p>✅ ErrorBoundary: Testing...</p>
        </div>
      </div>
    </ErrorBoundary>
  );
}