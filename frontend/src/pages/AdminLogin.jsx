import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import PasswordInput from '../components/PasswordInput';

const FEATURES = [
    { icon: '📊', title: 'Platform Overview', desc: 'Monitor all activities and key metrics.' },
    { icon: '👥', title: 'User Management', desc: 'Manage users, vendors and permissions.' },
    { icon: '⚙️', title: 'System Control', desc: 'Configure settings and maintain the platform.' },
];

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 15 * 60; // 15 minutes

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login, isAuthenticated, user } = useContext(AuthContext);

    const [formData, setFormData] = useState({ email: '', password: '', remember: false });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [failCount, setFailCount] = useState(() => parseInt(sessionStorage.getItem('admin_fail_count') || '0'));
    const [lockoutEnd, setLockoutEnd] = useState(() => parseInt(sessionStorage.getItem('admin_lockout_end') || '0'));
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.is_superuser || user.user_type === 'admin') navigate('/admin-portal/dashboard');
        }
    }, [isAuthenticated, user, navigate]);

    // Lockout countdown
    useEffect(() => {
        const tick = () => {
            const remaining = Math.max(0, Math.ceil((lockoutEnd - Date.now()) / 1000));
            setCountdown(remaining);
            if (remaining === 0) clearInterval(timerRef.current);
        };
        if (lockoutEnd > Date.now()) {
            tick();
            timerRef.current = setInterval(tick, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [lockoutEnd]);

    const isLocked = countdown > 0;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLocked) { setError(`Too many attempts. Try again in ${Math.ceil(countdown / 60)} min.`); return; }

        setError(''); setLoading(true);
        try {
            await login(formData.email, formData.password);
        } catch (err) {
            const newCount = failCount + 1;
            setFailCount(newCount);
            sessionStorage.setItem('admin_fail_count', newCount);
            if (newCount >= MAX_ATTEMPTS) {
                const end = Date.now() + LOCKOUT_SECONDS * 1000;
                setLockoutEnd(end);
                sessionStorage.setItem('admin_lockout_end', end);
                setError(`Too many failed attempts. Access locked for 15 minutes.`);
            } else {
                const errMessage = err.response?.data?.error || err.response?.data?.detail || err.message || 'Invalid credentials.';
                setError(`${errMessage}. ${MAX_ATTEMPTS - newCount} attempt(s) remaining.`);
            }
            setLoading(false);
        }
    };

    const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    return (
        <div className="min-h-screen bg-[#f5f3ff] flex flex-col font-inter">
            <SEO title="Admin Login – JYNM" description="Admin access portal." noindex={true} />

            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-[900px] flex flex-col gap-4">
                    <div className="w-full bg-white rounded-3xl shadow-[0_20px_60px_rgba(124,58,237,0.12)] overflow-hidden flex flex-col md:flex-row min-h-[auto]">

                    {/* Left panel — Purple */}
                    <div className="md:w-[380px] shrink-0 relative bg-gradient-to-br from-[#5b21b6] to-[#8b5cf6] flex flex-col items-center justify-center p-10 text-white overflow-hidden hidden md:flex">
                        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/10" />
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-white/10" />
                        <div className="relative z-10 w-36 h-36 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-8 border border-white/30">
                            <span className="text-5xl">🛡️</span>
                        </div>
                        <h2 className="relative z-10 text-2xl font-black mb-2 text-center" style={{ fontFamily: "'Outfit', sans-serif" }}>Admin Access</h2>
                        <p className="relative z-10 text-purple-200 text-sm text-center font-medium max-w-[200px]">Login to access the admin dashboard and manage the platform.</p>
                        <div className="relative z-10 mt-10 w-full space-y-2">
                            {FEATURES.map(f => (
                                <div key={f.title} className="flex items-start gap-3">
                                    <span className="text-lg">{f.icon}</span>
                                    <div>
                                        <p className="text-white text-[12px] font-bold">{f.title}</p>
                                        <p className="text-purple-200 text-[11px]">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right panel — Form */}
                    <div className="flex-1 flex flex-col justify-center p-8 sm:p-12">
                        <div className="flex items-center justify-between mb-8">
                            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-slate-500 hover:text-violet-600 transition-colors text-sm font-semibold">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                Back
                            </button>
                            <Link to="/" className="flex items-center gap-2">
                                <img src="/logo.png" alt="JYNM" className="h-8 w-auto" onError={e => e.currentTarget.style.display='none'} />
                                <span className="font-black text-slate-900 text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>JYNM</span>
                            </Link>
                            <span className="px-2.5 py-1 bg-purple-50 border border-purple-100 text-purple-700 text-[11px] font-black uppercase tracking-widest rounded-lg">Admin Portal</span>
                        </div>

                        <h1 className="text-2xl font-black text-slate-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Administrator Login</h1>
                        <p className="text-slate-500 text-sm mb-6">Restricted access — authorized personnel only.</p>

                        {/* Lockout timer */}
                        {isLocked && (
                            <div className="mb-4 p-4 rounded-xl bg-orange-50 border border-orange-100 text-orange-700 text-sm font-semibold text-center">
                                🔒 Too many attempts. Retry in <span className="font-black">{fmt(countdown)}</span>
                            </div>
                        )}

                        {error && !isLocked && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div>
                                <label className="block text-[12px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email</label>
                                <input name="email" type="email" required value={formData.email} onChange={handleChange} disabled={isLocked}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all disabled:opacity-50"
                                    placeholder="admin@jynm.com" />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Password</label>
                                    <Link to="/forgot-password" className="text-[12px] text-purple-600 font-semibold hover:underline">Forgot password?</Link>
                                </div>
                                <PasswordInput name="password" required value={formData.password} onChange={handleChange} disabled={isLocked}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all disabled:opacity-50"
                                    placeholder="••••••••" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="aremember" name="remember" checked={formData.remember} onChange={handleChange} className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500" />
                                <label htmlFor="aremember" className="text-[13px] text-slate-600 font-medium">Remember me</label>
                            </div>
                            <button type="submit" disabled={loading || isLocked}
                                className="w-full py-3.5 bg-violet-700 text-white font-bold rounded-xl hover:bg-violet-800 transition shadow-[0_4px_12px_rgba(124,58,237,0.3)] disabled:opacity-60 flex items-center justify-center gap-2">
                                {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                {loading ? 'Verifying…' : 'Login'}
                            </button>
                        </form>

                        <p className="text-center text-[11px] text-slate-400 mt-6">
                            Not an admin? <Link to="/signin" className="text-purple-600 font-semibold hover:underline">User Login</Link> · <Link to="/vendor/login" className="text-purple-600 font-semibold hover:underline">Vendor Login</Link>
                        </p>
                    </div>
                    </div>

                    {/* Feature Strip */}
                    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 px-3 py-1 w-full sm:w-auto">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            </div>
                            <div className="text-[11px] font-bold text-slate-700 leading-tight">Platform<br/>Overview</div>
                        </div>
                        <div className="flex items-center gap-3 px-3 py-1 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div className="text-[11px] font-bold text-slate-700 leading-tight">User<br/>Management</div>
                        </div>
                        <div className="flex items-center gap-3 px-3 py-1 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div className="text-[11px] font-bold text-slate-700 leading-tight">System<br/>Control</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
