import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
        if (!value) return 'Please enter your email address';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return '';
    };

    const handleBlur = () => {
        setTouched(true);
        setError(validateEmail(email));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const emailError = validateEmail(email);
        if (emailError) { setError(emailError); setTouched(true); return; }
        setLoading(true);
        setError('');
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSubmitted(true);
        } catch (err) {
            setError('Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isValid = !validateEmail(email);

    return (
        <div className="min-h-screen flex flex-col" style={{ background: '#0a0b0d' }}>
            <SEO
                title="Forgot Password - Reset Your Account"
                description="Reset your JunkYardsNearMe account password. Enter your email to receive password reset instructions."
                canonical="/forgot-password"
                noindex={true}
            />
            <Navbar />

            <div className="flex-grow flex items-center justify-center px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="rounded-2xl border border-white/[8%] overflow-hidden" style={{ background: '#111318' }}>
                        <div className="p-8">
                            {!submitted ? (
                                <>
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                                            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
                                            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h1 className="text-3xl font-black text-white mb-2">Forgot Password?</h1>
                                        <p className="text-white/40 text-sm">
                                            Enter your email to reset your password
                                        </p>
                                    </div>

                                    {error && !touched && (
                                        <div className="mb-5 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
                                            <p className="text-sm text-red-400">{error}</p>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div>
                                            <label htmlFor="reset-email" className="block text-xs uppercase tracking-widest text-white/40 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                id="reset-email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onBlur={handleBlur}
                                                placeholder="your.email@example.com"
                                                className={`w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-white/20 outline-none transition-all text-sm border ${
                                                    touched && error
                                                        ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                                        : 'border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                                                }`}
                                            />
                                            {touched && error && (
                                                <p className="mt-1.5 text-xs text-red-400">{error}</p>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!isValid || loading}
                                            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-black transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                                            style={ isValid && !loading
                                                ? { background: 'linear-gradient(135deg, #f59e0b, #ea580c)', boxShadow: '0 4px 20px rgba(245,158,11,0.25)' }
                                                : { background: 'rgba(255,255,255,0.08)' }
                                            }
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                                    Sending...
                                                </span>
                                            ) : 'Send Reset Instructions'}
                                        </button>

                                        <div className="text-center pt-1">
                                            <p className="text-sm text-white/30">
                                                Remember your password?{' '}
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/signin')}
                                                    className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                                                >
                                                    Back to Sign In
                                                </button>
                                            </p>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                                        style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
                                        <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>

                                    <h2 className="text-2xl font-black text-white mb-2">Check Your Email!</h2>
                                    <p className="text-white/40 text-sm mb-6">
                                        We've sent password reset instructions to<br />
                                        <span className="font-bold text-white/70">{email}</span>
                                    </p>

                                    <div className="rounded-xl border border-amber-500/20 p-4 mb-6 text-left"
                                        style={{ background: 'rgba(245,158,11,0.05)' }}>
                                        <p className="text-sm text-amber-400/70">
                                            <strong className="text-amber-400">Note:</strong> Password reset functionality is currently in development.
                                            For immediate assistance, contact us at <a href="mailto:info@jynm.com" className="underline hover:text-amber-300">info@jynm.com</a>.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => navigate('/signin')}
                                        className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-black transition-all hover:-translate-y-0.5"
                                        style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', boxShadow: '0 4px 20px rgba(245,158,11,0.25)' }}
                                    >
                                        Back to Sign In
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="text-center text-white/20 text-xs mt-6">
                        <Link to="/" className="hover:text-white/40 transition-colors">← Back to homepage</Link>
                    </p>
                </motion.div>
            </div>

            <Footer />
        </div>
    );
}
