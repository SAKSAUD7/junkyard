import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import PasswordInput from '../PasswordInput';

const LoginModal = ({ isOpen, onClose, onSwitchToSignup, onSwitchToForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return;
        setLoading(true);
        setServerError('');
        try {
            await login(email, password);
            handleClose();
        } catch (error) {
            const d = error.response?.data;
            setServerError(d?.detail || d?.error || d?.non_field_errors?.[0] || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail(''); setPassword(''); setServerError(''); setRememberMe(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={handleClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-[380px] mx-4 rounded-3xl overflow-hidden shadow-2xl"
                style={{ maxHeight: '95vh', overflowY: 'auto' }}
                onClick={e => e.stopPropagation()}
            >
                {/* === BACKGROUND IMAGE fills entire modal === */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop"
                        alt=""
                        className="w-full h-full object-cover"
                    />
                    {/* Top strong dark overlay for logo/title area */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/80" />
                </div>

                {/* Close X */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <div className="relative z-10 flex flex-col">

                    {/* Top section — Logo + Title */}
                    <div className="flex flex-col items-center pt-8 pb-6 px-6 text-center">
                        <img
                            src="/logo.png"
                            alt="JYNM"
                            className="h-16 w-auto object-contain mb-4 drop-shadow-2xl"
                            onError={e => e.currentTarget.style.display = 'none'}
                        />
                        <h1 className="text-2xl font-black text-white leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Welcome <span className="text-yellow-400">Back</span>
                        </h1>
                        <p className="text-white/70 text-[13px] mt-1.5 font-medium leading-snug">
                            Sign in to your account and continue<br />finding the best auto parts.
                        </p>
                    </div>

                    {/* White Form Card */}
                    <div className="bg-white mx-3 mb-3 rounded-2xl px-5 py-5 shadow-2xl">
                        {serverError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[12px] font-semibold text-center">
                                {serverError}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="your.email@example.com"
                                        required
                                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Password</label>
                                    <button type="button" onClick={() => { handleClose(); onSwitchToForgotPassword(); }} className="text-[12px] text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                                        Forgot Password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </span>
                                    <PasswordInput
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-9 py-2.5 border border-slate-200 rounded-xl text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50"
                                    />
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center gap-2">
                                <input
                                    id="lm-remember"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={e => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="lm-remember" className="text-[13px] text-slate-600 font-medium cursor-pointer">Remember me</label>
                            </div>

                            {/* Sign In Button */}
                            <button
                                type="submit"
                                disabled={!email || !password || loading}
                                className="w-full py-3 rounded-xl font-black text-[15px] bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
                                Sign In <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>

                            {/* Switch to signup */}
                            <p className="text-center text-[13px] text-slate-500 font-medium">
                                Don't have an account?{' '}
                                <button type="button" onClick={() => { handleClose(); onSwitchToSignup(); }} className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                                    Sign Up
                                </button>
                            </p>
                        </form>
                    </div>

                    {/* Feature icons — on dark bg */}
                    <div className="grid grid-cols-3 gap-2 px-4 pb-6 pt-2">
                        {[
                            { emoji: '⚙️', label: 'Access Millions of Used Parts' },
                            { emoji: '📍', label: 'Find Trusted Junkyards Near You' },
                            { emoji: '⭐', label: 'Get the Best Deals' },
                        ].map((f, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 text-center">
                                <span className="text-2xl">{f.emoji}</span>
                                <span className="text-[10px] text-white/70 font-semibold leading-tight">{f.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
