import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const vendorApi = axios.create({
    baseURL: `${API_BASE_URL}/vendor`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
vendorApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('vendor_access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
vendorApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('vendor_refresh_token');
                const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                    refresh: refreshToken,
                });

                const { access } = response.data;
                localStorage.setItem('vendor_access_token', access);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return vendorApi(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout user
                localStorage.removeItem('vendor_access_token');
                localStorage.removeItem('vendor_refresh_token');
                localStorage.removeItem('vendor_user');
                window.location.href = '/vendor/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// ============================================
// AUTHENTICATION
// ============================================

export const vendorAuth = {
    login: async (email, password) => {
        const response = await axios.post(`${API_BASE_URL}/auth/login/`, {
            email,
            password,
        });

        // Check if user is a vendor
        if (response.data.user.user_type !== 'vendor') {
            throw new Error('Access denied. Vendor account required.');
        }

        // Check if vendor is active
        if (response.data.vendor_profile?.vendor?.is_active === false) {
            throw new Error('Your account is inactive. Please contact support.');
        }

        // Store tokens and user data
        localStorage.setItem('vendor_access_token', response.data.tokens.access);
        localStorage.setItem('vendor_refresh_token', response.data.tokens.refresh);
        localStorage.setItem('vendor_user', JSON.stringify(response.data.user));
        localStorage.setItem('vendor_profile', JSON.stringify(response.data.vendor_profile));

        return response.data;
    },

    logout: async () => {
        try {
            const refreshToken = localStorage.getItem('vendor_refresh_token');
            await axios.post(`${API_BASE_URL}/auth/logout/`, {
                refresh_token: refreshToken,
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('vendor_access_token');
            localStorage.removeItem('vendor_refresh_token');
            localStorage.removeItem('vendor_user');
            localStorage.removeItem('vendor_profile');
        }
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('vendor_user');
        return user ? JSON.parse(user) : null;
    },

    getVendorProfile: () => {
        const profile = localStorage.getItem('vendor_profile');
        return profile ? JSON.parse(profile) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('vendor_access_token');
    },
};

// ============================================
// DASHBOARD
// ============================================

export const vendorDashboard = {
    getOverview: () => vendorApi.get('/dashboard/'),
    getStats: () => vendorApi.get('/stats/'),
};

// ============================================
// PROFILE
// ============================================

export const vendorProfile = {
    get: () => vendorApi.get('/profile/'),
    update: (data) => vendorApi.patch('/profile/', data),
    getBusinessHours: () => vendorApi.get('/business-hours/'),
    updateBusinessHours: (hours) => vendorApi.post('/business-hours/', { hours }),
};

// ============================================
// INVENTORY
// ============================================

export const vendorInventory = {
    list: (params) => vendorApi.get('/inventory/', { params }),
    create: (data) => vendorApi.post('/inventory/', data),
    get: (id) => vendorApi.get(`/inventory/${id}/`),
    update: (id, data) => vendorApi.patch(`/inventory/${id}/`, data),
    delete: (id) => vendorApi.delete(`/inventory/${id}/`),
};

// ============================================
// LEADS
// ============================================

export const vendorLeads = {
    list: (params) => vendorApi.get('/leads/', { params }),
    get: (id) => vendorApi.get(`/leads/${id}/`),
    updateStatus: (id, status) => vendorApi.patch(`/leads/${id}/`, { status }),
};

// ============================================
// NOTIFICATIONS
// ============================================

export const vendorNotifications = {
    list: () => vendorApi.get('/notifications/'),
    markAsRead: (id) => vendorApi.post(`/notifications/${id}/read/`),
};

export default vendorApi;
