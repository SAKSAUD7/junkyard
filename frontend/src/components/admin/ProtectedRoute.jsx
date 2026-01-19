import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const AdminProtectedRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    // Check if authenticated
    if (!isAuthenticated) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    // Check if admin (staff or superuser)
    // Note: 'is_staff' or 'is_superuser' should be present in the user object
    if (!user?.is_staff && !user?.is_superuser) {
        // Redirect non-admins to home or normal dashboard
        return <Navigate to="/profile" replace />;
    }

    return children;
};

export default AdminProtectedRoute;
