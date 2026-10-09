import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center relative overflow-hidden">
             {/* Decorative element */}
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 to-rose-600" />
             
             <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
             </div>
             
             <h2 className="text-2xl font-black text-slate-900 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Oops! Something went wrong.</h2>
             <p className="text-slate-500 font-medium mb-8">
               We hit a snag loading this page. Our team has been notified. 
               Please try refreshing the page or head back home.
             </p>
             
             <div className="flex flex-col gap-3">
               <button 
                 onClick={() => window.location.reload()}
                 className="w-full py-3.5 bg-rose-50 border border-rose-100 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors"
               >
                 Refresh Page
               </button>
               <button 
                 onClick={() => window.location.href = '/'}
                 className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
               >
                 Back to Home
               </button>
             </div>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
