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
        <div style={{ background: 'var(--bg-void, var(--bg-base))', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <SEO
                title="Forgot Password - Reset Your Account"
                description="Reset your JunkYardsNearMe account password. Enter your email to receive password reset instructions."
            />

            <Navbar />

            <div className="flex-grow flex items-center justify-center px-4 py-12 relative">
                {/* Background glows */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div style={{ position: 'absolute', top: '25%', right: '20%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', bottom: '20%', left: '15%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(234,88,12,0.04) 0%, transparent 70%)', borderRadius: '50%' }} />
                    <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(37,99,235,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>

                <div className="relative w-full max-w-md" style={{ zIndex: 1 }}>
                    <div
                        className="rounded-2xl overflow-hidden"
                        style={{
                            background: 'rgba(240,245,250,0.85)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(37,99,235,0.15)',
                            boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 40px rgba(37,99,235,0.05)'
                        }}
                    >
                        <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, var(--neon-blue), var(--neon-orange), transparent)' }} />

                        <div className="p-8 sm:p-10">
                            {!submitted ? (
                                <>
                                    <div className="text-center mb-8">
                                        <div
                                            className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4"
                                            style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)' }}
                                        >
                                            <svg className="w-7 h-7" style={{ color: 'var(--neon-blue)' }} fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                            </svg>
                                        </div>
                                        <h1 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                                            Forgot Password?
                                        </h1>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                            Enter your email and we'll send you reset instructions.
                                        </p>
                                    </div>

                                    {error && !touched && (
                                        <div className="mb-4 p-4 rounded-lg" style={{ background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.25)' }}>
                                            <p style={{ color: '#ff6666', fontSize: '0.875rem' }}>⚠ {error}</p>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div>
                                            <label
                                                htmlFor="reset-email"
                                                style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: "'JetBrains Mono', monospace" }}
                                            >
                                                Email Address
                                            </label>
                                            <input
                                                id="reset-email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onBlur={handleBlur}
                                                placeholder="your.email@example.com"
                                                className="w-full rounded-xl px-4 py-3 outline-none transition-all"
                                                style={{
                                                    background: 'rgba(255,255,255,0.6)',
                                                    border: `1px solid ${touched && error ? 'rgba(239,68,68,0.5)' : 'rgba(37,99,235,0.15)'}`,
                                                    color: 'var(--text-primary)',
                                                    fontFamily: "'Inter', sans-serif"
                                                }}
                                                onFocus={e => e.target.style.borderColor = 'var(--neon-blue)'}
                                                onBlur2={e => e.target.style.borderColor = touched && error ? 'rgba(239,68,68,0.5)' : 'rgba(37,99,235,0.15)'}
                                            />
                                            {touched && error && (
                                                <p style={{ color: '#ff6666', fontSize: '0.8rem', marginTop: '0.4rem', fontFamily: "'JetBrains Mono', monospace" }}>{error}</p>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!isValid || loading}
                                            className="w-full py-3.5 px-4 rounded-xl font-bold uppercase tracking-wide text-sm transition-all"
                                            style={{
                                                background: isValid && !loading ? 'var(--neon-blue)' : 'rgba(255,255,255,0.05)',
                                                color: isValid && !loading ? 'var(--bg-base)' : 'var(--text-muted)',
                                                cursor: isValid && !loading ? 'pointer' : 'not-allowed',
                                                border: isValid && !loading ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                                boxShadow: isValid && !loading ? '0 0 20px rgba(37,99,235,0.3)' : 'none'
                                            }}
                                        >
                                            {loading ? 'Sending...' : 'Send Reset Instructions'}
                                        </button>

                                        <div className="mt-6 text-center">
                                            <p style={{ color: '#667788', fontSize: '0.875rem' }}>
                                                Remember your password?{' '}
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/signin')}
                                                    style={{ color: 'var(--neon-blue)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.875rem' }}
                                                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                                                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                                                >
                                                    Back to Sign In
                                                </button>
                                            </p>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div
                                        className="inline-flex w-16 h-16 rounded-full items-center justify-center mb-6"
                                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}
                                    >
                                        <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>

                                    <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", marginBottom: '0.75rem' }}>Check Your Email!</h2>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                                        We've sent reset instructions to<br />
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{email}</span>
                                    </p>

                                    <div className="p-4 rounded-xl mb-6" style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)' }}>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                                            <strong style={{ color: 'var(--neon-blue)' }}>Note:</strong> Password reset functionality is currently in development.
                                            For immediate assistance, please contact support.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => navigate('/signin')}
                                        className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wide text-sm"
                                        style={{ background: 'var(--neon-blue)', color: 'var(--bg-base)', boxShadow: '0 0 20px rgba(37,99,235,0.3)' }}
                                    >
                                        Back to Sign In
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
