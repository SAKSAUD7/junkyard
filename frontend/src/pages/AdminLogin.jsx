import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import PasswordInput from '../components/PasswordInput';

const ROLES = [
    { id: 'super_admin', label: 'Super Admin', desc: 'Full system access', icon: '👑' },
    { id: 'staff', label: 'Staff / Moderator', desc: 'Content and user management', icon: '🛡️' },
    { id: 'vendor', label: 'Vendor / Junkyard', desc: 'Yard dashboard access', icon: '🏪' },
    { id: 'user', label: 'Standard User', desc: 'Buyer account', icon: '👤' },
    { id: 'none', label: 'No Authorized Role', desc: 'Return to homepage', icon: '⬅️' },
];

// Provide an automotive background from Unsplash for Admin Access
const BG_IMAGE_URL = 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=2000&auto=format&fit=crop';

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
        <div className="min-h-screen w-full relative flex font-inter items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 overflow-hidden">
            <SEO title="Admin Login – JYNM" description="Restricted area." noindex={true} />

            {/* Background Image - Bright Luxury Car */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1620892019318-7b243ebd7f7e?q=80&w=2000&auto=format&fit=crop"
                    alt="Luxury Auto Background"
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-slate-50/90 to-white/95"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-[440px] flex flex-col gap-6 items-center">
                
                {/* Header elements: Logo & Title */}
                <div className="text-center w-full">
                    <Link to="/" className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors text-[13px] font-semibold mb-6 group bg-white/80 px-4 py-2 rounded-full backdrop-blur-md border border-slate-200 shadow-sm">
                        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back Home
                    </Link>
                    
                    <div className="bg-white p-4 rounded-3xl backdrop-blur-md border border-slate-200 inline-block mb-6 shadow-xl">
                        <img src="/logo.png" alt="JYNM" className="h-10 sm:h-12 w-auto drop-shadow-sm" onError={e => e.currentTarget.style.display='none'} />
                    </div>
                </div>

                {/* Main Card */}
                <div className="w-full bg-white rounded-[24px] shadow-2xl p-6 sm:p-8 overflow-hidden transform transition-all relative">
                    {/* Inner subtle top highlight */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
                    
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight font-outfit">
                            Admin Access
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Restricted access — authorized personnel only.</p>
                    </div>

                    {step === 'questionnaire' ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <h2 className="text-center text-[15px] font-bold text-slate-700 mb-5 border-b border-slate-100 pb-3">Choose your workspace</h2>
                            <div className="grid gap-3">
                                {ROLES.map((role) => (
                                    <button 
                                        key={role.id}
                                        onClick={() => handleRoleSelect(role.id)}
                                        className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md hover:bg-blue-50/50 transition-all text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-white flex items-center justify-center text-xl shadow-sm border border-slate-100 group-hover:border-blue-100 transition-colors">
                                            {role.icon}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{role.label}</div>
                                            <div className="text-[12px] text-slate-500 font-medium">{role.desc}</div>
                                        </div>
                                        <svg className="w-5 h-5 ml-auto text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            {error && (
                                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold flex items-start gap-2.5">
                                    <svg className="w-[18px] h-[18px] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4.5">
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email</label>
                                    <input name="email" type="email" required value={formData.email} onChange={handleChange} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-[15px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        placeholder="admin@jynm.com" />
                                </div>
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Password</label>
                                        <Link to="/forgot-password" className="text-[12px] text-blue-600 font-bold hover:text-blue-700 hover:underline transition-all">Forgot password?</Link>
                                    </div>
                                    <PasswordInput name="password" required value={formData.password} onChange={handleChange} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-[15px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        placeholder="••••••••" />
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <input type="checkbox" id="aremember" name="remember" checked={formData.remember} onChange={handleChange} className="w-[18px] h-[18px] text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                                    <label htmlFor="aremember" className="text-[14px] text-slate-600 font-medium select-none cursor-pointer">Remember me</label>
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full mt-2 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98] transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] disabled:opacity-60 flex items-center justify-center gap-2 text-[15px]">
                                    {loading && <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                    {loading ? 'Authenticating…' : 'Sign In'}
                                </button>
                            </form>
                            
                            <button onClick={() => setStep('questionnaire')} className="w-full flex items-center justify-center gap-1.5 mt-6 text-[13px] font-bold text-slate-500 hover:text-slate-800 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Workspace Selection
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Links */}
                <div className="flex items-center justify-center gap-3 text-[13px] font-medium text-white/60">
                    <Link to="/signin" className="hover:text-white transition-colors">User Login</Link>
                    <span className="w-1 h-1 rounded-full bg-white/30"></span>
                    <Link to="/vendor/login" className="hover:text-white transition-colors">Vendor Login</Link>
                </div>
            </div>
        </div>
    );
}
