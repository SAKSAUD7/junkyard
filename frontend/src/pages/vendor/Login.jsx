import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVendorAuth } from '../../contexts/VendorAuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PasswordInput from '../../components/PasswordInput';
import '../../styles/vendor.css';

const VendorLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useVendorAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/vendor/dashboard');
        } else {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <div className="min-h-screen flex items-center justify-center py-20" style={{ background: '#0a0b0d' }}>
                <div className="w-full max-w-md px-4">
                    <div className="rounded-2xl border border-white/[8%] p-8" style={{ background: '#111318' }}>
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 mb-4"
                                style={{ background: 'rgba(245,158,11,0.08)' }}>
                                <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Vendor Portal</span>
                            </div>
                            <h1 className="text-3xl font-black text-white mb-2">
                                Vendor Login
                            </h1>
                            <p className="text-white/40 text-sm">
                                Sign in to manage your listings and leads
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Demo Credentials Info */}
                        <div className="mb-6 p-4 rounded-xl border border-amber-500/20" style={{ background: 'rgba(245,158,11,0.05)' }}>
                            <div className="font-semibold text-amber-400 mb-2 text-sm">
                                🔑 Demo Credentials
                            </div>
                            <div className="text-sm text-white/50 font-mono">
                                <div><strong className="text-white/70">Email:</strong> vendor@test.com</div>
                                <div><strong className="text-white/70">Password:</strong> vendor123</div>
                            </div>
                        </div>

                        {/* Login Form */}
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

                            <div>
                                <label htmlFor="password" className="block text-xs uppercase tracking-widest text-white/40 mb-2">
                                    Password
                                </label>
                                <PasswordInput
                                    id="password"
                                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <Link
                                    to="/vendor/forgot-password"
                                    className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 font-bold text-black rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', boxShadow: '0 4px 20px rgba(245,158,11,0.25)' }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-white/[8%] text-center">
                            <p className="text-sm text-white/30">
                                Need help? Contact support at{' '}
                                <a
                                    href="mailto:info@jynm.com"
                                    className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                                >
                                    info@jynm.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default VendorLogin;
