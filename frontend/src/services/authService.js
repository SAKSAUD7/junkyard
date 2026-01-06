import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
                    refresh: refreshToken,
                });

                const { access } = response.data;
                localStorage.setItem('access_token', access);

                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout user
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

const authService = {
    // Register new user
    register: async (userData) => {
        const response = await api.post('/auth/register/', userData);
        if (response.data.tokens) {
            localStorage.setItem('access_token', response.data.tokens.access);
            localStorage.setItem('refresh_token', response.data.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Login user
    login: async (email, password) => {
        const response = await api.post('/auth/login/', { email, password });
        if (response.data.tokens) {
            localStorage.setItem('access_token', response.data.tokens.access);
            localStorage.setItem('refresh_token', response.data.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            if (response.data.vendor_profile) {
                localStorage.setItem('vendor_profile', JSON.stringify(response.data.vendor_profile));
            }
        }
        return response.data;
    },

    // Logout user
    logout: async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            await api.post('/auth/logout/', { refresh_token: refreshToken });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('vendor_profile');
        }
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await api.get('/auth/me/');
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
    },

    // Update user profile
    updateProfile: async (userData) => {
        const response = await api.put('/auth/me/', userData);
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
    },

    // Change password
    changePassword: async (oldPassword, newPassword) => {
        const response = await api.post('/auth/change-password/', {
            old_password: oldPassword,
            new_password: newPassword,
            new_password2: newPassword,
        });
        return response.data;
    },

    // Get vendor profile
    getVendorProfile: async () => {
        const response = await api.get('/auth/vendor-profile/');
        if (response.data) {
            localStorage.setItem('vendor_profile', JSON.stringify(response.data));
        }
        return response.data;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('access_token');
    },

    // Get stored user
    getStoredUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Get stored vendor profile
    getStoredVendorProfile: () => {
        const profile = localStorage.getItem('vendor_profile');
        return profile ? JSON.parse(profile) : null;
    },
};

export default authService;
