import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import PasswordInput from '../components/PasswordInput';

const BG_IMAGE_URL = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2000&auto=format&fit=crop';

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
        <div className="min-h-screen w-full relative flex font-inter items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 overflow-hidden">
            <SEO title="Sign In – JYNM" description="Sign in to your JYNM account." noindex={true} />

            {/* Background Image - Bright Luxury Car */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1620892019318-7b243ebd7f7e?q=80&w=2000&auto=format&fit=crop"
                    alt="Luxury Auto Background"
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-slate-50/90 to-white/95"></div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8 min-h-screen w-full max-w-7xl mx-auto">
                
                {/* Back to Home Link */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-10 md:left-10 z-20">
                    <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold text-sm transition-colors group bg-white/50 backdrop-blur px-4 py-2 rounded-full shadow-sm hover:shadow-md border border-slate-200">
                        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back Home
                    </Link>
                </div>
                {/* Main Card */}
                <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden transform transition-all relative mt-20 sm:mt-10 md:mt-0">
                    {/* Inner subtle top highlight */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                    {/* Card Header */}
                    <div className="px-6 pt-8 pb-5 text-center border-b border-slate-100 bg-slate-50/50">
                        <Link to="/" className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 inline-block mb-4">
                            <img src="/logo.png" alt="JYNM" className="h-8 w-auto" onError={e => e.currentTarget.style.display='none'} />
                        </Link>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight font-outfit">
                            Welcome Back
                        </h1>
                        <p className="text-slate-500 text-[13px] mt-1 font-medium">Sign in to continue finding the right auto parts.</p>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold flex items-start gap-2.5">
                                <svg className="w-[18px] h-[18px] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="signin-email" className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </span>
                                    <input
                                        id="signin-email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label htmlFor="signin-password" className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Password</label>
                                    <Link to="/forgot-password" className="text-[12px] text-blue-600 font-bold hover:text-blue-700 hover:underline transition-all">Forgot Password?</Link>
                                </div>
                                <PasswordInput
                                    id="signin-password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="••••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || failCount >= 5}
                                className="w-full mt-2 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98] transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] disabled:opacity-60 flex items-center justify-center gap-2 text-[15px]"
                            >
                                {loading && <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
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
                                <span className="text-[10px] font-bold text-slate-500 leading-tight">{f.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sign Up Link */}
                <p className="mt-2 text-center text-[13px] font-medium text-white/70">
                    Don't have an account?{' '}
                    <Link to={`/signup?returnUrl=${encodeURIComponent(returnUrl)}`} className="font-bold text-white hover:underline transition-colors">
                        Sign Up Free
                    </Link>
                </p>
                <div className="flex items-center justify-center gap-3 text-[12px] font-medium text-white/50">
                    <Link to="/vendor/login" className="hover:text-white transition-colors">Vendor Portal</Link>
                </div>
            </div>
        </div>
    );
}
