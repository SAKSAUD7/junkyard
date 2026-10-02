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
                <div className="w-full max-w-md flex flex-col gap-6">
                    <div className="text-center relative">
                        <Link to="/" className="absolute left-0 top-0 mt-1 flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-semibold">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            Back Home
                        </Link>
                        <Link to="/" className="inline-block mb-4">
                            <img src="/logo.png" alt="JYNM" className="h-8 w-auto mx-auto inline-block" onError={e => e.currentTarget.style.display='none'} />
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Admin Access</h1>
                        <p className="text-slate-500 text-sm font-medium mt-2">Restricted access — authorized personnel only.</p>
                    </div>

                    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">

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
            </div>
        </div>
    );
}
