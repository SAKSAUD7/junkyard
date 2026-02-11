import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

/**
 * ProtectedRoute wrapper component
 * Redirects unauthenticated users to sign-in page with return URL
 */
export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useContext(AuthContext);
    const location = useLocation();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to sign-in if not authenticated
    if (!isAuthenticated) {
        const returnUrl = location.pathname + location.search;
        return <Navigate to={`/signin?returnUrl=${encodeURIComponent(returnUrl)}`} replace />;
    }

    // User is authenticated, render the protected content
    return children;
}
