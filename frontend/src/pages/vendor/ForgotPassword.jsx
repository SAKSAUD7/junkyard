import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { vendorAuth } from '../../services/vendorApi';

const VendorForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await vendorAuth.requestPasswordReset(email);
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset instructions');
            console.error('Password reset error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 pt-24 pb-20 flex items-center justify-center">
                <div className="w-full max-w-md px-4">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        {submitted ? (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>

                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Check Your Email
                                </h2>

                                <p className="text-gray-600 mb-8">
                                    We've sent password reset instructions to <strong className="text-gray-900">{email}</strong>
                                </p>

                                <Link
                                    to="/vendor/login"
                                    className="block w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md text-center"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-black text-gray-900 mb-2">
                                        Forgot Password?
                                    </h1>
                                    <p className="text-gray-600">
                                        Enter your email address and we'll send you instructions to reset your password.
                                    </p>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                                        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-gray-900 placeholder-gray-400"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="vendor@example.com"
                                            autoComplete="email"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Reset Instructions'
                                        )}
                                    </button>

                                    <Link
                                        to="/vendor/login"
                                        className="block w-full py-3 px-4 bg-white text-gray-700 font-bold rounded-lg border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all text-center"
                                    >
                                        Back to Login
                                    </Link>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default VendorForgotPassword;
