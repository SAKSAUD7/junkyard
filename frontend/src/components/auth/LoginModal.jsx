import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import PasswordInput from '../PasswordInput';

const LoginModal = ({ isOpen, onClose, onSwitchToSignup, onSwitchToForgotPassword }) => {
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

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={handleClose}
        >
            <div
                className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
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

                <div className="flex flex-col md:flex-row">
                    {/* Left Panel - Blue Visual */}
                    <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-blue-700 to-blue-500 p-12 flex-col justify-center items-center text-white">
                        <div className="text-center">
                            <div className="mb-6">
                                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-black mb-2">JYNM</h2>
                                <p className="text-blue-100 text-sm">JunkYardsNearMe.com</p>
                            </div>
                            <p className="text-lg font-medium mb-2">Welcome Back!</p>
                            <p className="text-blue-100 text-sm">Sign in to access your account</p>
                        </div>
                    </div>

                    {/* Right Panel - Login Form */}
                    <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
                        <div className="text-center mb-8">
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
                                    style={{
                                        padding: '1.5rem 1.75rem',
                                        fontSize: '1.125rem',
                                        minHeight: '4rem',
                                        borderRadius: '0.875rem',
                                        lineHeight: '1.5'
                                    }}
                                    className={`w-full border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
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
                                    style={{
                                        padding: '1.5rem 1.75rem',
                                        fontSize: '1.125rem',
                                        minHeight: '4rem',
                                        borderRadius: '0.875rem',
                                        lineHeight: '1.5'
                                    }}
                                    className={`w-full border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched.password && errors.password ? 'border-red-500' : 'border-gray-300'
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
                                style={{
                                    padding: '1.25rem 2.25rem',
                                    fontSize: '1.125rem',
                                    minHeight: '3.5rem',
                                    borderRadius: '0.75rem'
                                }}
                                className={`w-full font-semibold text-white transition-all ${isValid && !loading
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
