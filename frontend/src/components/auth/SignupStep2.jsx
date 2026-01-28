import { useState } from 'react';
import axios from 'axios';
import PasswordInput from '../PasswordInput';

const SignupStep2 = ({ formData, onBack, onClose, onSwitchToLogin }) => {
    const [email, setEmail] = useState(formData.email || '');
    const [password, setPassword] = useState(formData.password || '');
    const [confirmPassword, setConfirmPassword] = useState(formData.confirmPassword || '');
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const validateEmail = (value) => {
        if (!value) {
            return 'Please fill in this field';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'Please enter a valid email';
        }
        return '';
    };

    const validatePassword = (value) => {
        if (!value) {
            return 'Please fill in this field';
        }
        if (value.length < 8) {
            return 'Password must be at least 8 characters';
        }
        return '';
    };

    const validateConfirmPassword = (value) => {
        if (!value) {
            return 'Please fill in this field';
        }
        if (value !== password) {
            return 'Passwords do not match';
        }
        return '';
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });

        const newErrors = { ...errors };
        if (field === 'email') {
            newErrors.email = validateEmail(email);
        } else if (field === 'password') {
            newErrors.password = validatePassword(password);
        } else if (field === 'confirmPassword') {
            newErrors.confirmPassword = validateConfirmPassword(confirmPassword);
        }
        setErrors(newErrors);
    };

    const handleSubmit = async () => {
        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);
        const confirmError = validateConfirmPassword(confirmPassword);

        if (emailError || passwordError || confirmError) {
            setErrors({
                email: emailError,
                password: passwordError,
                confirmPassword: confirmError
            });
            setTouched({ email: true, password: true, confirmPassword: true });
            return;
        }

        setLoading(true);
        setServerError('');

        try {
            // Prepare registration data
            const nameParts = formData.name.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || '';

            // Generate username from email (before @ symbol)
            const username = email.split('@')[0];

            const registrationData = {
                username: username,  // REQUIRED by backend
                email: email,
                password: password,
                password2: confirmPassword,  // REQUIRED by backend
                first_name: firstName,
                last_name: lastName,
                phone: formData.countryCode + formData.phone,
                user_type: 'customer' // Default user type
            };

            console.log('Submitting registration:', { ...registrationData, password: '***', password2: '***' });

            // Call registration API
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';
            const response = await axios.post(`${API_URL}/auth/register/`, registrationData);

            console.log('Registration successful:', response.data);

            // Store tokens and user data
            const { user: userData, tokens } = response.data;
            localStorage.setItem('access_token', tokens.access);
            localStorage.setItem('refresh_token', tokens.refresh);
            localStorage.setItem('user_data', JSON.stringify(userData));

            // Success message
            alert('Registration successful! Welcome to JYNM!');
            onClose();

            // Reload to update auth state
            window.location.reload();

        } catch (error) {
            console.error('Registration error:', error);

            if (error.response?.data) {
                const errorData = error.response.data;

                // Handle specific field errors
                if (errorData.email) {
                    setServerError(Array.isArray(errorData.email) ? errorData.email[0] : errorData.email);
                } else if (errorData.username) {
                    setServerError(Array.isArray(errorData.username) ? errorData.username[0] : errorData.username);
                } else if (errorData.password) {
                    setServerError(Array.isArray(errorData.password) ? errorData.password[0] : errorData.password);
                } else if (errorData.password2) {
                    setServerError(Array.isArray(errorData.password2) ? errorData.password2[0] : errorData.password2);
                } else if (errorData.error) {
                    setServerError(errorData.error);
                } else {
                    // Show all errors
                    const allErrors = Object.entries(errorData)
                        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                        .join('; ');
                    setServerError(allErrors || 'Registration failed. Please check your information.');
                }
            } else {
                setServerError('Network error. Please check your connection and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const isValid = !validateEmail(email) && !validatePassword(password) && !validateConfirmPassword(confirmPassword);

    return (
        <div>
            <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Complete Your <span className="text-blue-600">Registration</span>
                </h1>
                <p className="text-sm text-gray-600">
                    Step 2 of 2 - Enter your email and password
                </p>
            </div>

            {serverError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{serverError}</p>
                </div>
            )}

            <div className="space-y-5">
                {/* Email Input */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => handleBlur('email')}
                        placeholder="your.email@example.com"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                    {touched.email && errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                </div>

                {/* Password Input */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <PasswordInput
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                    {touched.password && errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                </div>

                {/* Confirm Password Input */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                    </label>
                    <PasswordInput
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onBack}
                        className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid || loading}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-all ${isValid && !loading
                            ? 'bg-blue-700 hover:bg-blue-800 shadow-md hover:shadow-lg'
                            : 'bg-gray-300 cursor-not-allowed'
                            }`}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </div>

                {/* Summary of Step 1 Data */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Registration Details:</p>
                    <div className="space-y-1">
                        <p className="text-sm text-gray-700">
                            <span className="font-medium">Name:</span> {formData.name}
                        </p>
                        <p className="text-sm text-gray-700">
                            <span className="font-medium">Phone:</span> {formData.countryCode} {formData.phone}
                        </p>
                    </div>
                </div>

                {/* Sign In Link */}
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                            Sign In
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupStep2;
