import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000')}/api`;

// Create axios instance with default config
export const api = axios.create({
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

// Handle token refresh on 401 + silence 500 flood
api.interceptors.response.use(
    (response) => {
        // Clear the "API down" flag on any successful response
        if (sessionStorage.getItem('__api_down')) {
            sessionStorage.removeItem('__api_down');
            console.info('[API] Backend is responding again.');
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        // ── 401: Token refresh ──────────────────────────────────────────
        if (status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/token/refresh')) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) throw new Error('No refresh token');
                const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
                    refresh: refreshToken,
                });

                const { access } = response.data;
                localStorage.setItem('access_token', access);

                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed — clear auth and redirect to appropriate login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                localStorage.removeItem('vendor_profile');
                // Redirect admin users to admin login, others to signin
                const isAdminRoute = window.location.pathname.startsWith('/admin');
                window.location.href = isAdminRoute ? '/admin/login' : '/signin';
                return Promise.reject(refreshError);
            }
        }

        // ── 500 / Network errors: Circuit breaker ────────────────────
        // Log only ONCE per unique endpoint per session, not every call.
        if (status === 500 || status === 502 || status === 503 || !error.response) {
            const endpoint = originalRequest?.url || 'unknown';
            const seenKey = `__api_err_${endpoint}`;

            if (!sessionStorage.getItem(seenKey)) {
                sessionStorage.setItem(seenKey, '1');
                // Single quiet warning instead of full AxiosError dump
                console.warn(`[API] Backend unavailable (${status ?? 'no response'}) — ${endpoint}. Showing fallback UI.`);
            }

            // Mark API as globally down so components can skip calls
            sessionStorage.setItem('__api_down', '1');
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
