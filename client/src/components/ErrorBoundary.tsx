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
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
          <div className="text-center p-8 max-w-4xl">
            <div className="mb-6">
              <img src="/app-icon-192.png" alt="AM Project" className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
              <p className="text-gray-600 mb-4">The app encountered an error. Please try refreshing the page.</p>
              
              {/* Display actual error details */}
              {this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left mb-6">
                  <h2 className="text-lg font-semibold text-red-800 mb-2">Error Details:</h2>
                  <div className="text-sm text-red-700 mb-2">
                    <strong>Message:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div className="text-sm text-red-700">
                      <strong>Stack Trace:</strong>
                      <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
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