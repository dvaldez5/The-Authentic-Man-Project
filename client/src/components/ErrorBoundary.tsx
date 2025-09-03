import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
          <div className="text-center p-8 max-w-2xl">
            <div className="mb-6">
              <img src="/app-icon-192.png" alt="AM Project" className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
              <p className="text-gray-600 mb-4">The app encountered an error. Please try refreshing the page.</p>
              
              {/* Always show error details for debugging */}
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                {this.state.error ? (
                  <pre className="text-sm text-red-700 whitespace-pre-wrap overflow-auto max-h-60">
                    <strong>Error Name:</strong> {this.state.error.name || 'Unknown'}
                    {'\n'}<strong>Error Message:</strong> {this.state.error.message || 'No message available'}
                    {this.state.error.stack && (
                      <>
                        {'\n\n'}<strong>Stack Trace:</strong>
                        {'\n'}{this.state.error.stack}
                      </>
                    )}
                  </pre>
                ) : (
                  <p className="text-sm text-red-700">No error object available - this might indicate a rendering issue.</p>
                )}
                
                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="text-xs text-red-600"><strong>Debug Info:</strong></p>
                  <p className="text-xs text-red-600">Error State: {this.state.hasError ? 'true' : 'false'}</p>
                  <p className="text-xs text-red-600">Error Object: {this.state.error ? 'present' : 'missing'}</p>
                  <p className="text-xs text-red-600">Timestamp: {new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;