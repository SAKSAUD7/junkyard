import { createContext, useContext, useState, useEffect } from 'react';
import { vendorAuth, vendorProfile as vendorProfileApi } from '../services/vendorApi';
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
        const initAuth = async () => {
            const currentUser = vendorAuth.getCurrentUser();
            const currentProfile = vendorAuth.getVendorProfile();

            if (currentUser && currentProfile && vendorAuth.isAuthenticated()) {
                try {
                    // Force a fast backend check. If token is dead, interceptor logs out and cleans up.
                    await vendorProfileApi.get();
                    setUser(currentUser);
                    setVendorProfile(currentProfile);
                } catch (error) {
                    // Axios interceptor already handles token removal and redirect if 401
                    console.log('Stale token detected and removed.');
                }
            }
            setLoading(false);
        };
        
        initAuth();
    }, []);

    const register = async (userData) => {
        try {
            const data = await vendorAuth.register(userData);
            setUser(data.user);
            if (data.vendor_profile) setVendorProfile(data.vendor_profile);
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            
            let errorMessage = 'Registration failed';
            if (error.response?.data) {
                const data = error.response.data;
                if (data.error) errorMessage = data.error;
                else if (typeof data === 'string') errorMessage = data;
                else if (data.email?.[0]) errorMessage = data.email[0];
                else if (data.username?.[0]) errorMessage = data.username[0];
                else errorMessage = Object.values(data).flat()[0] || 'Registration failed';
            }

            return {
                success: false,
                error: errorMessage,
            };
        }
    };

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
        return vendorAuth.isAuthenticated() && user;
    };

    const value = {
        user,
        vendorProfile,
        loading,
        register,
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
