import { useState } from 'react';

const ForgotPasswordModal = ({ isOpen, onClose, onBackToLogin }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [touched, setTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const validateEmail = (value) => {
        if (!value) {
            return 'Please enter your email address';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'Please enter a valid email address';
        }
        return '';
    };

    const handleBlur = () => {
        setTouched(true);
        setError(validateEmail(email));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailError = validateEmail(email);
        if (emailError) {
            setError(emailError);
            setTouched(true);
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Simulate API call for password reset
            await new Promise(resolve => setTimeout(resolve, 1500));

            // For now, just show success message
            // In production, this would call the backend API
            setSubmitted(true);

        } catch (err) {
            setError('Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setError('');
        setTouched(false);
        setSubmitted(false);
        onClose();
    };

    const handleBackToLogin = () => {
        handleClose();
        onBackToLogin();
    };

    const isValid = !validateEmail(email);

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
                            <p className="text-lg font-medium mb-2">Forgot Password?</p>
                            <p className="text-blue-100 text-sm">No worries! We'll send you reset instructions.</p>
                        </div>
                    </div>

                    {/* Right Panel - Form */}
                    <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
                        {!submitted ? (
                            <>
                                <div className="text-center mb-8">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                        Reset Your <span className="text-blue-600">Password</span>
                                    </h1>
                                    <p className="text-sm text-gray-600">
                                        Enter your email address and we'll send you instructions to reset your password.
                                    </p>
                                </div>

                                {error && !touched && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Email Input */}
                                    <div>
                                        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            id="reset-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onBlur={handleBlur}
                                            placeholder="your.email@example.com"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${touched && error ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {touched && error && (
                                            <p className="mt-1 text-sm text-red-600">{error}</p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={!isValid || loading}
                                        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${isValid && !loading
                                                ? 'bg-blue-700 hover:bg-blue-800 shadow-md hover:shadow-lg'
                                                : 'bg-gray-300 cursor-not-allowed'
                                            }`}
                                    >
                                        {loading ? 'Sending...' : 'Send Reset Instructions'}
                                    </button>

                                    {/* Back to Login */}
                                    <div className="mt-6 text-center">
                                        <p className="text-sm text-gray-600">
                                            Remember your password?{' '}
                                            <button
                                                type="button"
                                                onClick={handleBackToLogin}
                                                className="text-blue-600 hover:text-blue-700 font-semibold"
                                            >
                                                Back to Sign In
                                            </button>
                                        </p>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                {/* Success Icon */}
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>

                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email!</h2>
                                <p className="text-gray-600 mb-6">
                                    We've sent password reset instructions to<br />
                                    <span className="font-semibold text-gray-900">{email}</span>
                                </p>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> Password reset functionality is currently in development.
                                        For immediate assistance, please contact support.
                                    </p>
                                </div>

                                <button
                                    onClick={handleBackToLogin}
                                    className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-blue-700 hover:bg-blue-800 shadow-md hover:shadow-lg transition-all"
                                >
                                    Back to Sign In
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
