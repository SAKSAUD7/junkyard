import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('access_token'));
    const [user, setUser] = useState(null);
    const [vendorProfile, setVendorProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is logged in on mount
        const initAuth = async () => {
            try {
                const storedToken = localStorage.getItem('access_token');
                setToken(storedToken);

                if (authService.isAuthenticated()) {
                    const storedUser = authService.getStoredUser();
                    const storedVendorProfile = authService.getStoredVendorProfile();

                    setUser(storedUser);
                    setVendorProfile(storedVendorProfile);
                    setIsAuthenticated(true);

                    // Refresh user data from server
                    try {
                        const currentUser = await authService.getCurrentUser();
                        setUser(currentUser);
                    } catch (error) {
                        console.error('Failed to refresh user data:', error);
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);

                // If it's a 401, clear local storage to prevent infinite loop
                if (error.response?.status === 401 || error.message.includes('401')) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                    setVendorProfile(null);
                }
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const register = async (userData) => {
        try {
            const response = await authService.register(userData);
            setUser(response.user);
            setToken(response.tokens.access);
            setIsAuthenticated(true);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);
            setUser(response.user);
            setToken(response.tokens.access);
            setVendorProfile(response.vendor_profile || null);
            setIsAuthenticated(true);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } finally {
            setUser(null);
            setToken(null);
            setVendorProfile(null);
            setIsAuthenticated(false);
        }
    };

    const updateProfile = async (userData) => {
        try {
            const updatedUser = await authService.updateProfile(userData);
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            throw error;
        }
    };

    const value = {
        token,
        user,
        vendorProfile,
        loading,
        isAuthenticated,
        register,
        login,
        logout,
        updateProfile,
        isVendor: user?.user_type === 'vendor',
        isAdmin: user?.user_type === 'admin',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
