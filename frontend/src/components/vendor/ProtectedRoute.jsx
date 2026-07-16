import { Navigate, useLocation } from 'react-router-dom';
import { useVendorAuth } from '../../contexts/VendorAuthContext';

const ProtectedVendorRoute = ({ children }) => {
    const { isAuthenticated, loading } = useVendorAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div>Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated()) {
        const redirectTo = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/vendor/login?redirect=${redirectTo}`} replace />;
    }

    return children;
};

export default ProtectedVendorRoute;
