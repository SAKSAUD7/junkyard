import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import PasswordInput from '../components/PasswordInput';

const FEATURES = [
    { icon: '🔍', title: 'Search Parts', desc: 'Millions of used parts from trusted junkyards.' },
    { icon: '💾', title: 'Save & Compare', desc: 'Save listings and compare prices easily.' },
    { icon: '💬', title: 'Easy Communication', desc: 'Chat or call junkyards directly.' },
];

export default function SignIn() {
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/';
    const navigate = useNavigate();
    const { login, isAuthenticated, user } = useContext(AuthContext);

    const [tab, setTab] = useState('login');
    const [formData, setFormData] = useState({ email: '', password: '', remember: false });
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
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
        <div className="min-h-screen bg-[#f0f4ff] flex flex-col font-inter">
            <SEO title="Sign In – JYNM" description="Sign in to your JYNM account." noindex={true} />

            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-[900px] flex flex-col gap-4">
                    <div className="w-full bg-white rounded-3xl shadow-[0_20px_60px_rgba(37,99,235,0.12)] overflow-hidden flex flex-col md:flex-row min-h-[auto]">

                    {/* Left panel — Blue */}
                    <div className="md:w-[380px] shrink-0 relative bg-gradient-to-br from-[#1d4ed8] to-[#3b82f6] flex flex-col items-center justify-center p-10 text-white overflow-hidden hidden md:flex">
                        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/10" />
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-white/10" />
                        {/* Car illustration placeholder */}
                        <div className="relative z-10 w-36 h-36 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-8 border border-white/30">
                            <span className="text-5xl">🚗</span>
                        </div>
                        <h2 className="relative z-10 text-2xl font-black mb-2 text-center" style={{ fontFamily: "'Outfit', sans-serif" }}>Welcome Back!</h2>
                        <p className="relative z-10 text-blue-100 text-sm text-center font-medium max-w-[200px]">Login to search parts, save listings and connect with junkyards near you.</p>

                        <div className="relative z-10 mt-10 w-full space-y-2">
                            {FEATURES.map(f => (
                                <div key={f.title} className="flex items-start gap-3">
                                    <span className="text-lg">{f.icon}</span>
                                    <div>
                                        <p className="text-white text-[12px] font-bold">{f.title}</p>
                                        <p className="text-blue-200 text-[11px]">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right panel — Form */}
                    <div className="flex-1 flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                        {/* Logo + Close */}
                        <div className="flex items-center justify-between mb-8">
                            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors text-sm font-semibold">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                Back
                            </button>
                            <Link to="/" className="flex items-center gap-2">
                                <img src="/logo.png" alt="JYNM" className="h-8 w-auto" onError={e => e.currentTarget.style.display='none'} />
                                <span className="font-black text-slate-900 text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>JYNM</span>
                            </Link>
                            <div className="w-12" />{/* spacer to center logo */}
                        </div>

                        {/* Tabs */}
                        <div className="flex rounded-xl border border-slate-200 p-1 mb-7">
                            {['login', 'signup'].map(t => (
                                <button key={t} onClick={() => { setTab(t); setError(''); }}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === t ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    {t === 'login' ? 'Login' : 'Create Account'}
                                </button>
                            ))}
                        </div>

                        <h1 className="text-2xl font-black text-slate-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {tab === 'login' ? 'Sign In' : 'Create Account'}
                        </h1>
                        <p className="text-slate-500 text-sm mb-6">{tab === 'login' ? 'Enter your credentials to continue.' : 'Join thousands of JYNM users.'}</p>

                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                {error}
                            </div>
                        )}

                        {tab === 'login' ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email or Phone</label>
                                    <input name="email" type="text" required value={formData.email} onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                        placeholder="you@example.com" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Password</label>
                                        <Link to="/forgot-password" className="text-[12px] text-blue-600 font-semibold hover:underline">Forgot password?</Link>
                                    </div>
                                    <PasswordInput name="password" required value={formData.password} onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                        placeholder="••••••••" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="remember" name="remember" checked={formData.remember} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                                    <label htmlFor="remember" className="text-[13px] text-slate-600 font-medium">Remember me</label>
                                </div>
                                <button type="submit" disabled={loading || failCount >= 5}
                                    className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-[0_4px_12px_rgba(37,99,235,0.3)] disabled:opacity-60 flex items-center justify-center gap-2">
                                    {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                    {loading ? 'Signing in…' : 'Login'}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-slate-500 text-sm mb-4">Create a free account to save parts and get quotes.</p>
                                <Link to={`/signup?returnUrl=${encodeURIComponent(returnUrl)}`}
                                    className="inline-block px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
                                    Get Started Free
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile & Desktop Feature Strip */}
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 px-3 py-1 w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <div className="text-[11px] font-bold text-slate-700 leading-tight">Search Millions<br/>of Parts</div>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-1 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                        </div>
                        <div className="text-[11px] font-bold text-slate-700 leading-tight">Save Listings<br/>Easily</div>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-1 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <div className="text-[11px] font-bold text-slate-700 leading-tight">Contact Yards<br/>Directly</div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}
