// ABSOLUTE MINIMAL TEST - No custom imports
import React from "react";

export default function App() {
  console.log('🔍 ABSOLUTE MINIMAL APP - No custom imports');

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#FF5722', 
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1>🟠 ABSOLUTE MINIMAL TEST</h1>
      <p>If you see this orange message, React rendering works completely.</p>
      <p>This would mean the issue is with ErrorBoundary or other custom imports.</p>
      <div style={{ marginTop: '20px', fontSize: '14px', opacity: '0.8' }}>
        <p>✅ React: Working</p>
        <p>❓ Custom imports: Testing...</p>
      </div>
    </div>
  );
}