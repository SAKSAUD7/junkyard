import { createContext, useContext, useState, useEffect } from 'react';
import { vendorAuth } from '../services/vendorApi';
import { useNavigate } from 'react-router-dom';

const VendorAuthContext = createContext(null);

export const useVendorAuth = () => {
    const context = useContext(VendorAuthContext);
    if (!context) {
        throw new Error('useVendorAuth must be used within VendorAuthProvider');
    }
    return context;
};

export const VendorAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [vendorProfile, setVendorProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is already logged in
        const currentUser = vendorAuth.getCurrentUser();
        const currentProfile = vendorAuth.getVendorProfile();

        if (currentUser && currentProfile) {
            setUser(currentUser);
            setVendorProfile(currentProfile);
        }

        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const data = await vendorAuth.login(email, password);
            setUser(data.user);
            setVendorProfile(data.vendor_profile);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Login failed',
            };
        }
    };

    const logout = async () => {
        try {
            await vendorAuth.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setVendorProfile(null);
            navigate('/vendor/login');
        }
    };

    const isAuthenticated = () => {
        return vendorAuth.isAuthenticated() && user && vendorProfile;
    };

    const value = {
        user,
        vendorProfile,
        loading,
        login,
        logout,
        isAuthenticated,
    };

    return (
        <VendorAuthContext.Provider value={value}>
            {children}
        </VendorAuthContext.Provider>
    );
};

export default VendorAuthContext;
