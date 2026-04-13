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

            <div className="min-h-screen flex items-center justify-center py-20" style={{ background: '#0a0b0d' }}>
                <div className="w-full max-w-md px-4">
                    <div className="rounded-2xl border border-white/[8%] p-8" style={{ background: '#111318' }}>
                        {submitted ? (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                                    style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                                    <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>

                                <h2 className="text-2xl font-black text-white mb-2">
                                    Check Your Email
                                </h2>

                                <p className="text-white/40 text-sm mb-8">
                                    We've sent password reset instructions to <strong className="text-white/70">{email}</strong>
                                </p>

                                <Link
                                    to="/vendor/login"
                                    className="block w-full py-3 px-4 font-bold text-black rounded-xl transition-all hover:-translate-y-0.5 text-center"
                                    style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', boxShadow: '0 4px 20px rgba(245,158,11,0.25)' }}
                                >
                                    Back to Login
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 mb-4"
                                        style={{ background: 'rgba(245,158,11,0.08)' }}>
                                        <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Password Reset</span>
                                    </div>
                                    <h1 className="text-3xl font-black text-white mb-2">
                                        Forgot Password
                                    </h1>
                                    <p className="text-white/40 text-sm">
                                        Enter your email to reset your password
                                    </p>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center gap-3">
                                        <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <p className="text-sm text-red-400">{error}</p>
                                    </div>
                                )}

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label htmlFor="email" className="block text-xs uppercase tracking-widest text-white/40 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm"
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
                                        className="w-full py-3 px-4 font-bold text-black rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                                        style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', boxShadow: '0 4px 20px rgba(245,158,11,0.25)' }}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Reset Instructions'
                                        )}
                                    </button>

                                    <Link
                                        to="/vendor/login"
                                        className="block w-full py-3 px-4 text-white/50 font-bold rounded-xl border border-white/10 hover:border-white/20 hover:text-white/70 transition-all text-center text-sm"
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
