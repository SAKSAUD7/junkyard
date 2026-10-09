import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import PasswordInput from '../components/PasswordInput';

// Automotive background — premium vehicle/salvage yard dusk scene (Unsplash free)
const BG = 'https://images.unsplash.com/photo-1567515004624-219c11d31f2e?auto=format&fit=crop&w=1400&q=75';

export default function SignIn() {
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/';
    const navigate = useNavigate();
    const { login, isAuthenticated, user } = useContext(AuthContext);

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [failCount, setFailCount] = useState(0);

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.is_superuser || user.user_type === 'admin') navigate('/admin-portal/dashboard');
            else if (user.user_type === 'vendor') navigate('/vendor/dashboard');
            else navigate(returnUrl);
        }
    }, [isAuthenticated, user, navigate, returnUrl]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (failCount >= 5) { setError('Too many failed attempts. Please wait before trying again.'); return; }
        setError(''); setLoading(true);
        try {
            await login(formData.email, formData.password);
        } catch {
            setFailCount(c => c + 1);
            setError('Invalid credentials. Please check your email and password.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col relative font-inter overflow-hidden">
            <SEO title="Sign In – JYNM" description="Sign in to your JYNM account." noindex={true} />

            {/* Automotive Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src={BG}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628]/85 via-[#0d1f3c]/75 to-[#1a3a6b]/65" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 min-h-screen">

                {/* Back Home */}
                <div className="w-full max-w-md mb-4">
                    <Link to="/" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm font-semibold">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back Home
                    </Link>
                </div>

                {/* Auth Card */}
                <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.35)] overflow-hidden">

                    {/* Card Header */}
                    <div className="px-6 pt-8 pb-6 text-center border-b border-slate-100">
                        <Link to="/" className="inline-block mb-4">
                            <img src="/logo.png" alt="JYNM" className="h-10 w-auto mx-auto" onError={e => e.currentTarget.style.display='none'} />
                        </Link>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Welcome Back
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Sign in to continue finding the right auto parts.</p>
                    </div>

                    {/* Form */}
                    <div className="px-6 py-6">
                        {error && (
                            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="signin-email" className="block text-[13px] font-bold text-slate-700 mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </span>
                                    <input
                                        id="signin-email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label htmlFor="signin-password" className="text-[13px] font-bold text-slate-700">Password</label>
                                    <Link to="/forgot-password" className="text-[12px] text-blue-600 font-semibold hover:underline">Forgot Password?</Link>
                                </div>
                                <PasswordInput
                                    id="signin-password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                    placeholder="••••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || failCount >= 5}
                                className="w-full mt-2 py-3.5 bg-[#1a56ff] hover:bg-[#1648d0] text-white font-bold rounded-xl transition-all shadow-[0_6px_20px_rgba(26,86,255,0.35)] disabled:opacity-60 flex items-center justify-center gap-2 text-[15px] active:scale-[0.98]"
                            >
                                {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                {loading ? 'Signing in…' : 'Sign In →'}
                            </button>
                        </form>
                    </div>

                    {/* Feature Strip */}
                    <div className="flex items-center justify-around px-4 py-3 bg-slate-50 border-t border-slate-100">
                        {[
                            { icon: '🔍', label: 'Find Parts' },
                            { icon: '💾', label: 'Save Listings' },
                            { icon: '📞', label: 'Contact Yards' },
                        ].map(f => (
                            <div key={f.label} className="flex flex-col items-center gap-1 text-center flex-1">
                                <span className="text-lg">{f.icon}</span>
                                <span className="text-[10px] font-bold text-slate-500">{f.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sign Up Link */}
                <p className="mt-5 text-center text-sm text-white/70">
                    Don't have an account?{' '}
                    <Link to={`/signup?returnUrl=${encodeURIComponent(returnUrl)}`} className="font-bold text-white hover:underline">
                        Sign Up Free
                    </Link>
                </p>
            </div>
        </div>
    );
}
