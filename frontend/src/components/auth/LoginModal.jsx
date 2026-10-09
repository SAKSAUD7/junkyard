import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import PasswordInput from '../PasswordInput';
import { useCMS } from '../../hooks/useCMS';

const LoginModal = ({ isOpen, onClose, onSwitchToSignup, onSwitchToForgotPassword }) => {
    const { get: getGlobal } = useCMS('global');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const { login } = useContext(AuthContext);

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
        return '';
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });

        const newErrors = { ...errors };
        if (field === 'email') {
            newErrors.email = validateEmail(email);
        } else if (field === 'password') {
            newErrors.password = validatePassword(password);
        }
        setErrors(newErrors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);

        if (emailError || passwordError) {
            setErrors({
                email: emailError,
                password: passwordError
            });
            setTouched({ email: true, password: true });
            return;
        }

        setLoading(true);
        setServerError('');

        try {
            await login(email, password);

            // Success - close modal
            handleClose();

            // Optional: Show success message
            // alert('Login successful! Welcome back!');

        } catch (error) {
            console.error('Login error:', error);

            if (error.response?.data) {
                const errorData = error.response.data;

                if (errorData.detail) {
                    setServerError(errorData.detail);
                } else if (errorData.error) {
                    setServerError(errorData.error);
                } else if (errorData.non_field_errors) {
                    setServerError(Array.isArray(errorData.non_field_errors)
                        ? errorData.non_field_errors[0]
                        : errorData.non_field_errors);
                } else {
                    setServerError('Invalid credentials. Please check your email and password.');
                }
            } else {
                setServerError('Network error. Please check your connection and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setPassword('');
        setErrors({});
        setTouched({});
        setServerError('');
        onClose();
    };

    const handleSwitchToSignup = () => {
        handleClose();
        onSwitchToSignup();
    };

    const isValid = !validateEmail(email) && !validatePassword(password);

    if (!isOpen) return null;

    // Redirect to the beautifully styled full page instead of showing a modal
    window.location.href = '/signin';
    return null;
    
    // The rest of the modal is skipped...
    const logoUrl = getGlobal('brand', 'logo');

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={handleClose}
        >
            <div
                className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex flex-col">
                    {/* Right Panel - Login Form */}
                    <div className="w-full p-8 md:p-10 overflow-y-auto max-h-[90vh]">
                        <div className="text-center mb-8 flex flex-col items-center">
                            <picture>
                                <source srcSet="/logo.webp" type="image/webp" />
                                <img src="/logo.png" alt="JYNM Logo" className="h-12 sm:h-14 w-auto object-contain mb-4" />
                            </picture>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                Welcome <span className="text-blue-600">Back</span>
                            </h1>
                            <p className="text-sm text-gray-600">
                                Sign in to your account
                            </p>
                        </div>

                        {serverError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{serverError}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Input */}
                            <div>
                                <label htmlFor="login-email" className="block text-base font-medium text-gray-700 mb-2.5">
                                    Email Address
                                </label>
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={() => handleBlur('email')}
                                    placeholder="your.email@example.com"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {touched.email && errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Password Input */}
                            <div>
                                <label htmlFor="login-password" className="block text-base font-medium text-gray-700 mb-2.5">
                                    Password
                                </label>
                                <PasswordInput
                                    id="login-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {touched.password && errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>


                            {/* Forgot Password Link */}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleClose();
                                        onSwitchToForgotPassword();
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={!isValid || loading}
                                className={`w-full py-3 px-4 rounded-lg font-semibold text-slate-800 transition-all ${isValid && !loading
                                    ? 'bg-blue-700 hover:bg-blue-800 shadow-md hover:shadow-lg'
                                    : 'bg-gray-300 cursor-not-allowed'
                                    }`}
                            >
                                {loading ? 'Signing In...' : 'Sign In'}
                            </button>

                            {/* Switch to Signup */}
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={handleSwitchToSignup}
                                        className="text-blue-600 hover:text-blue-700 font-semibold"
                                    >
                                        Sign Up
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
