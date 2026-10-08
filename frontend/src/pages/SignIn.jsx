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
                    <div className="text-center relative">
                        <Link to="/" className="absolute left-0 top-0 mt-1 flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            Back Home
                        </Link>
                        <Link to="/" className="inline-block mb-4">
                            <img src="/logo.png" alt="JYNM" className="h-8 w-auto mx-auto inline-block" onError={e => e.currentTarget.style.display='none'} />
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
