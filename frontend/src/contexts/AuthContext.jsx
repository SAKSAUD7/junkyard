import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [vendorProfile, setVendorProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is logged in on mount
        const initAuth = async () => {
            try {
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
