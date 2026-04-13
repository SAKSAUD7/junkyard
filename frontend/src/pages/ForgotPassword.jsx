import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function ForgotPassword() {
    const navigate = useNavigate();
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

    const isValid = !validateEmail(email);

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50 flex flex-col">
            <SEO
                title="Forgot Password - Reset Your Account"
                description="Reset your JunkYardsNearMe account password. Enter your email to receive password reset instructions."
            />

            <Navbar />

            <div className="flex-grow flex items-center justify-center px-4 py-12">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                    <div className="p-8">
                        {!submitted ? (
                            <>
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        Forgot Password?
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
                                                ? 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
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
                                                onClick={() => navigate('/signin')}
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
                                    onClick={() => navigate('/signin')}
                                    className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                                >
                                    Back to Sign In
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
