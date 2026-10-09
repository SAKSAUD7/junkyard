import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import PasswordInput from '../PasswordInput';
import { useCMS } from '../../hooks/useCMS';

const LoginModal = ({ isOpen, onClose, onSwitchToSignup, onSwitchToForgotPassword }) => {
    const { get: getGlobal } = useCMS('global');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const { login } = useContext(AuthContext);

    const validateEmail = (v) => (!v ? 'Required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Invalid email' : '');
    const validatePassword = (v) => (!v ? 'Required' : '');

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
        setErrors({ ...errors, [field]: field === 'email' ? validateEmail(email) : validatePassword(password) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const emailErr = validateEmail(email);
        const pwErr = validatePassword(password);
        if (emailErr || pwErr) {
            setErrors({ email: emailErr, password: pwErr });
            setTouched({ email: true, password: true });
            return;
        }
        setLoading(true);
        setServerError('');
        try {
            await login(email, password);
            handleClose();
        } catch (error) {
            const d = error.response?.data;
            setServerError(d?.detail || d?.error || (d?.non_field_errors?.[0]) || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail(''); setPassword(''); setErrors({}); setTouched({}); setServerError('');
        onClose();
    };

    const isValid = !validateEmail(email) && !validatePassword(password);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
            onClick={handleClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal Card */}
            <div
                className="relative w-full max-w-[400px] mx-auto rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                style={{ maxHeight: '96vh' }}
            >
                {/* Background Image with dark overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop"
                        alt="Junkyard background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/90" />
                </div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <div className="relative z-10 px-6 pt-8 pb-6 overflow-y-auto" style={{ maxHeight: '96vh' }}>

                    {/* Logo + Title */}
                    <div className="flex flex-col items-center mb-6">
                        <img src="/logo.png" alt="JYNM" className="h-14 w-auto object-contain mb-3 drop-shadow-lg" onError={e => e.currentTarget.style.display = 'none'} />
                        <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Welcome <span className="text-blue-400">Back</span>
                        </h1>
                        <p className="text-slate-300 text-[13px] mt-1 font-medium text-center">Sign in to your account and continue<br />finding the best auto parts.</p>
                    </div>

                    {serverError && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-400/40 rounded-xl text-red-300 text-[13px] font-semibold text-center">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onBlur={() => handleBlur('email')}
                                    placeholder="your.email@example.com"
                                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/50 transition-all"
                                />
                            </div>
                            {touched.email && errors.email && <p className="mt-1 text-[12px] text-red-400">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">Password</label>
                                <button type="button" onClick={() => { handleClose(); onSwitchToForgotPassword(); }} className="text-[12px] text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                                    Forgot Password?
                                </button>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </span>
                                <PasswordInput
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onBlur={() => handleBlur('password')}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/50 transition-all"
                                />
                            </div>
                            {touched.password && errors.password && <p className="mt-1 text-[12px] text-red-400">{errors.password}</p>}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center gap-2.5">
                            <input
                                id="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={e => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-400/50 focus:ring-offset-0"
                            />
                            <label htmlFor="remember-me" className="text-[13px] text-slate-300 font-medium cursor-pointer">Remember me</label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!isValid || loading}
                            className={`w-full py-3.5 rounded-xl font-black text-[15px] transition-all flex items-center justify-center gap-2 ${isValid && !loading ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_8px_20px_rgba(37,99,235,0.4)] active:scale-[0.98]' : 'bg-white/20 text-white/50 cursor-not-allowed'}`}
                        >
                            {loading ? (
                                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Signing In...</>
                            ) : (
                                <>Sign In <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
                            )}
                        </button>

                        {/* Switch to Signup */}
                        <p className="text-center text-[13px] text-slate-400 font-medium">
                            Don't have an account?{' '}
                            <button type="button" onClick={() => { handleClose(); onSwitchToSignup(); }} className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                                Sign Up
                            </button>
                        </p>
                    </form>

                    {/* Feature icons footer */}
                    <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10">
                        {[
                            { icon: '⚙️', label: 'Access Millions of Used Parts' },
                            { icon: '📍', label: 'Find Trusted Junkyards Near You' },
                            { icon: '⭐', label: 'Get the Best Deals' },
                        ].map((f, i) => (
                            <div key={i} className="flex flex-col items-center gap-1.5 text-center">
                                <span className="text-xl">{f.icon}</span>
                                <span className="text-[10px] text-slate-400 font-semibold leading-tight">{f.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
