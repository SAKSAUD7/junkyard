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
            const hasToken = vendorAuth.isAuthenticated()
                || !!localStorage.getItem('access_token');

            if (hasToken && currentUser) {
                // 1. Trust the stored user/session immediately — don't wait for the network.
                //    This prevents the login modal from flashing on every page load.
                setUser(currentUser);
                setVendorProfile(currentProfile || {});

                // 2. Optionally refresh the vendor profile from the backend in the background.
                //    A 403 here means "no linked vendor profile yet" (new user) — NOT "not authenticated".
                //    A 401 means the token is genuinely expired; interceptor will handle refresh or logout.
                try {
                    const res = await vendorProfileApi.get();
                    const freshProfile = res.data || {};
                    setVendorProfile(freshProfile);
                    // Keep localStorage in sync
                    localStorage.setItem('vendor_profile', JSON.stringify(freshProfile));
                } catch (error) {
                    const httpStatus = error.response?.status;
                    if (httpStatus === 403 || httpStatus === 404) {
                        // No linked vendor profile yet — session is still valid.
                        // Keep the state as-is (user is authenticated, just no profile record).
                        console.info('[VendorAuth] No vendor profile linked yet. Session preserved.');
                    } else if (httpStatus === 401) {
                        // Genuinely expired / bad token. The Axios interceptor already attempted
                        // a token refresh. If we're here the refresh also failed — clear state.
                        setUser(null);
                        setVendorProfile(null);
                    }
                    // For network errors (offline etc.), keep the session alive.
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
        // Accept either vendor-specific token OR the general auth token.
        // This covers users who logged in via VendorAuthModal AND users who
        // authenticated via the general login flow (authService.js).
        return (vendorAuth.isAuthenticated() || !!localStorage.getItem('access_token')) && !!user;
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
