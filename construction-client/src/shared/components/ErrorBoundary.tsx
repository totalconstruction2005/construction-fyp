import React from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

/**
 * Global Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs error information, and displays a fallback UI.
 * 
 * @component
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Generate unique error ID for tracking
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Log error details
    console.error('=== ERROR BOUNDARY CAUGHT ===');
    console.error('Error ID:', errorId);
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Timestamp:', new Date().toISOString());
    console.error('============================');

    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorId,
    });

    // Send to error tracking service (e.g., Sentry, LogRocket)
    // this.logErrorToService(error, errorInfo, errorId);
  }

  /**
   * Log error to external tracking service
   * Uncomment and configure when backend is ready
   */
  // logErrorToService = (_error: Error, _errorInfo: ErrorInfo, _errorId: string) => {
  //   // try {
  //   //   // Example: Send to Sentry
  //   //   // Sentry.captureException(error, { contexts: { react: errorInfo } });
  //   //
  //   //   // Example: Send to custom backend
  //   //   // fetch('/api/logs/errors', {
  //   //   //   method: 'POST',
  //   //   //   headers: { 'Content-Type': 'application/json' },
  //   //   //   body: JSON.stringify({
  //   //   //     errorId,
  //   //   //     message: error.message,
  //   //   //     stack: error.stack,
  //   //   //     componentStack: errorInfo.componentStack,
  //   //   //     timestamp: new Date().toISOString(),
  //   //   //     userAgent: navigator.userAgent,
  //   //   //     url: window.location.href,
  //   //   //   }),
  //   //   // }).catch(err => console.error('Failed to log error:', err));
  //   // } catch (e) {
  //   //   console.error('Error logging failed:', e);
  //   // }
  // };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Error Container */}
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Oops! Something Went Wrong
              </h1>

              {/* Error Description */}
              <p className="text-gray-600 text-center mb-6">
                We encountered an unexpected error. Our team has been notified automatically.
              </p>

              {/* Error ID Display */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                <p className="text-xs text-gray-600 font-mono mb-2">Error ID:</p>
                <p className="text-sm font-semibold text-gray-900 font-mono break-all">
                  {this.state.errorId}
                </p>
              </div>

              {/* Error Details (Dev Only) */}
              {this.state.error && (
                <details className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
                    Error Details (Technical)
                  </summary>
                  <div className="mt-3 text-xs text-gray-600 font-mono space-y-2">
                    <p>
                      <span className="font-semibold text-gray-800">Message:</span>{' '}
                      {this.state.error.message}
                    </p>
                    {this.state.error.stack && (
                      <p className="whitespace-pre-wrap overflow-auto max-h-32">
                        <span className="font-semibold text-gray-800">Stack:</span>
                        {'\n'}
                        {this.state.error.stack}
                      </p>
                    )}
                    {this.state.errorInfo && (
                      <p className="whitespace-pre-wrap overflow-auto max-h-32">
                        <span className="font-semibold text-gray-800">Component Stack:</span>
                        {'\n'}
                        {this.state.errorInfo.componentStack}
                      </p>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
              </div>

              {/* Support Info */}
              <p className="text-xs text-gray-500 text-center mt-6">
                If this problem persists, please contact our{' '}
                <a href="/contact-us" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                  support team
                </a>
                {' '}and reference the error ID above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
