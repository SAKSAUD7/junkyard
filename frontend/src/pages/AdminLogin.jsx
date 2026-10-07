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

const ROLES = [
    { id: 'super_admin', label: 'Super Admin', desc: 'Full system access', icon: '👑' },
    { id: 'staff', label: 'Staff / Moderator', desc: 'Content and user management', icon: '🛡️' },
    { id: 'vendor', label: 'Vendor / Junkyard', desc: 'Yard dashboard access', icon: '🏪' },
    { id: 'user', label: 'Standard User', desc: 'Buyer account', icon: '👤' },
    { id: 'none', label: 'No Authorized Role', desc: 'Return to homepage', icon: '⬅️' },
];

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login, isAuthenticated, user } = useContext(AuthContext);

    const [step, setStep] = useState('questionnaire');
    const [formData, setFormData] = useState({ email: '', password: '', remember: false });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.is_superuser || user.user_type === 'admin') navigate('/admin-portal/dashboard');
        }
    }, [isAuthenticated, user, navigate]);

    const handleRoleSelect = (roleId) => {
        if (roleId === 'super_admin' || roleId === 'staff') {
            setStep('login');
        } else if (roleId === 'vendor') {
            navigate('/vendor/login');
        } else if (roleId === 'user') {
            navigate('/signin');
        } else {
            navigate('/');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); 
        setLoading(true);
        try {
            await login(formData.email, formData.password);
        } catch (err) {
            const errMessage = err.response?.data?.error || err.response?.data?.detail || err.message || 'Invalid credentials.';
            setError(errMessage);
            setLoading(false);
        }
    };

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
                        {step === 'questionnaire' ? (
                            <div className="space-y-4">
                                <h2 className="text-center text-lg font-bold text-slate-800 mb-4">Select Your Authorization Role</h2>
                                <div className="grid gap-3">
                                    {ROLES.map((role) => (
                                        <button 
                                            key={role.id}
                                            onClick={() => handleRoleSelect(role.id)}
                                            className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
                                        >
                                            <span className="text-2xl">{role.icon}</span>
                                            <div>
                                                <div className="font-bold text-slate-900 group-hover:text-purple-700">{role.label}</div>
                                                <div className="text-[12px] text-slate-500">{role.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold flex items-center gap-2">
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email</label>
                                        <input name="email" type="email" required value={formData.email} onChange={handleChange} 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all"
                                            placeholder="admin@jynm.com" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Password</label>
                                            <Link to="/forgot-password" className="text-[12px] text-purple-600 font-semibold hover:underline">Forgot password?</Link>
                                        </div>
                                        <PasswordInput name="password" required value={formData.password} onChange={handleChange} 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all"
                                            placeholder="••••••••" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="aremember" name="remember" checked={formData.remember} onChange={handleChange} className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500" />
                                        <label htmlFor="aremember" className="text-[13px] text-slate-600 font-medium">Remember me</label>
                                    </div>
                                    <button type="submit" disabled={loading}
                                        className="w-full py-3.5 bg-violet-700 text-white font-bold rounded-xl hover:bg-violet-800 transition shadow-[0_4px_12px_rgba(124,58,237,0.3)] disabled:opacity-60 flex items-center justify-center gap-2">
                                        {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                        {loading ? 'Verifying…' : 'Login'}
                                    </button>
                                </form>
                                <button onClick={() => setStep('questionnaire')} className="w-full text-center mt-4 text-sm font-semibold text-slate-500 hover:text-purple-700 transition">
                                    ← Back to Role Select
                                </button>
                            </>
                        )}
                        <p className="text-center text-[11px] text-slate-400 mt-6">
                            Not an admin? <Link to="/signin" className="text-purple-600 font-semibold hover:underline">User Login</Link> · <Link to="/vendor/login" className="text-purple-600 font-semibold hover:underline">Vendor Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
