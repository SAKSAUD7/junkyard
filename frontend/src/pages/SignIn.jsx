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
        <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
            <SEO title="Sign In – JYNM" description="Sign in to your JYNM account." noindex={true} />

            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-md flex flex-col gap-6">
                    <div className="text-center">
                        <Link to="/" className="inline-block mb-4">
                            <img src="/logo.png" alt="JYNM" className="h-8 w-auto mx-auto" onError={e => e.currentTarget.style.display='none'} />
                        </Link>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Welcome back</h1>
                    </div>

                    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                        {/* Tabs */}
                        <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
                            {['login', 'signup'].map(t => (
                                <button key={t} onClick={() => { setTab(t); setError(''); }}
                                    className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${tab === t ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}>
                                    {t === 'login' ? 'Login' : 'Signup'}
                                </button>
                            ))}
                        </div>

                        {error && (
                            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                {error}
                            </div>
                        )}

                        {tab === 'login' ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Email address</label>
                                    <input name="email" type="text" required value={formData.email} onChange={handleChange}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                                        placeholder="john.doe@example.com" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="text-[13px] font-bold text-slate-700">Password</label>
                                        <Link to="/forgot-password" className="text-[12px] text-slate-500 hover:text-slate-900 font-semibold">Forgot?</Link>
                                    </div>
                                    <PasswordInput name="password" required value={formData.password} onChange={handleChange}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                                        placeholder="••••••••••••" />
                                </div>
                                <button type="submit" disabled={loading || failCount >= 5}
                                    className="w-full mt-2 py-2.5 bg-[#111827] text-white font-bold rounded-lg hover:bg-black transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                                    {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                    {loading ? 'Signing in…' : 'Sign in'}
                                </button>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-400">or sign in with</span></div>
                                </div>

                                <div className="space-y-3">
                                    <button type="button" className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                        Google
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-slate-500 text-sm mb-4">Create a free account to save parts and get quotes.</p>
                                <Link to={`/signup?returnUrl=${encodeURIComponent(returnUrl)}`}
                                    className="inline-block px-8 py-2.5 w-full bg-[#111827] text-white text-sm font-bold rounded-lg hover:bg-black transition-colors">
                                    Get Started Free
                                </Link>
                            </div>
                        )}
                    </div>
                    
                    <p className="text-center text-sm text-slate-500">
                        Don't have an account? <Link to={`/signup?returnUrl=${encodeURIComponent(returnUrl)}`} className="font-semibold text-slate-900 hover:underline">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
