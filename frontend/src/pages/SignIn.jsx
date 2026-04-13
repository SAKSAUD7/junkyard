import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import PasswordInput from '../components/PasswordInput';

export default function SignIn() {
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/';
    const navigate = useNavigate();
    const { login, isAuthenticated, user } = useContext(AuthContext);

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user) {
            let redirectPath = returnUrl;
            if (user.is_superuser || user.user_type === 'admin') redirectPath = '/admin-portal/dashboard';
            else if (user.user_type === 'vendor') redirectPath = '/vendor/dashboard';
            navigate(redirectPath);
        }
    }, [isAuthenticated, user, navigate, returnUrl]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(formData.email, formData.password);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to sign in. Please check your credentials.');
            setLoading(false);
        }
    };

    return (
        <>
            <SEO title="Sign In - JYNM Auto Parts Hub" description="Sign in to your JYNM account." noindex={true} />

            <div className="min-h-screen flex" style={{ background: '#080909' }}>
                {/* Left — Cinematic Image Panel */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-start justify-end p-12">
                    <img
                        src="/images/static/hero-garage.jpg"
                        alt="Premium Auto Garage"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ opacity: 0.55 }}
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #080909 0%, rgba(8,9,9,0.4) 60%, transparent 100%)' }} />
                    {/* Amber accent line */}
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ background: 'linear-gradient(to bottom, transparent, #f59e0b, transparent)' }} />

                    <div className="relative z-10">
                        <Link to="/" className="inline-flex items-center gap-3 mb-12">
                            <div className="rounded-xl p-2" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
                                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3.375 7.125a1.125 1.125 0 0 1 1.125-1.125h15a1.125 1.125 0 0 1 1.125 1.125v6.5a1.125 1.125 0 0 1-1.125 1.125h-.52a2.875 2.875 0 0 0-5.59 0h-2.78a2.875 2.875 0 0 0-5.59 0h-.52a1.125 1.125 0 0 1-1.125-1.125v-6.5Z" />
                                    <path d="M7.5 18a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM19.5 18a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                                </svg>
                            </div>
                            <span className="text-white font-black text-xl tracking-wider">JYNM</span>
                        </Link>
                        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                            Find the <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Right Part</span><br />
                            at the Right Price
                        </h2>
                        <p className="text-white/50 text-base max-w-sm leading-relaxed">
                            Access 6,000+ verified junkyards across 55+ states. The nation's largest auto salvage network.
                        </p>
                        <div className="flex gap-8 mt-8">
                            {[['6,000+', 'Junkyards'], ['55+', 'States'], ['80%', 'Avg Savings']].map(([v, l]) => (
                                <div key={l}>
                                    <p className="text-2xl font-black text-amber-400">{v}</p>
                                    <p className="text-white/40 text-xs uppercase tracking-widest">{l}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right — Form Panel */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 relative">
                    {/* Mobile logo */}
                    <div className="lg:hidden mb-10 text-center">
                        <Link to="/" className="inline-flex items-center gap-2">
                            <span className="text-white font-black text-2xl tracking-wider">JYNM</span>
                        </Link>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-md"
                    >
                        <div className="mb-8">
                            <h1 className="text-4xl font-black text-white mb-2">Welcome Back</h1>
                            <p className="text-white/40">Sign in to your JYNM account</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-xs uppercase tracking-widest text-white/40 mb-2">Email Address</label>
                                <input
                                    id="email" name="email" type="email" required
                                    value={formData.email} onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-xs uppercase tracking-widest text-white/40 mb-2">Password</label>
                                <PasswordInput
                                    id="password" name="password" required
                                    value={formData.password} onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="flex justify-end">
                                <Link to="/forgot-password" className="text-xs text-amber-500 hover:text-amber-400 font-semibold transition-colors">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full py-4 rounded-xl font-black text-sm text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', boxShadow: '0 4px 24px rgba(245,158,11,0.25)' }}
                            >
                                {loading ? 'Signing in...' : 'Sign In →'}
                            </button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/[8%]"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest">
                                <span className="px-4 text-white/30" style={{ background: '#080909' }}>New to JYNM?</span>
                            </div>
                        </div>

                        <Link
                            to="/signup?returnUrl=/add-a-yard"
                            className="block w-full text-center py-4 rounded-xl font-bold text-sm text-white/70 border border-white/10 hover:border-amber-500/30 hover:text-white transition-all duration-300"
                        >
                            Create an account
                        </Link>

                        <p className="text-center text-white/20 text-xs mt-8">
                            <Link to="/" className="hover:text-white/40 transition-colors">← Back to homepage</Link>
                        </p>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
