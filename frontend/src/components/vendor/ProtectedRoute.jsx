import { Navigate } from 'react-router-dom';
import { useVendorAuth } from '../../contexts/VendorAuthContext';

const ProtectedVendorRoute = ({ children }) => {
    const { isAuthenticated, loading } = useVendorAuth();

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
        return <Navigate to="/vendor/login" replace />;
    }

    return children;
};

export default ProtectedVendorRoute;
