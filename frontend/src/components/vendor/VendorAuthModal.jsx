import { useState } from 'react';
import { useVendorAuth } from '../../contexts/VendorAuthContext';
import { useCMS } from '../../hooks/useCMS';
import PasswordInput from '../PasswordInput';

const VendorAuthModal = ({ isOpen }) => {
    const { get: getGlobal } = useCMS('global');
    const { login, register } = useVendorAuth();
    
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    
    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);

    // Inline validation errors
    const [fieldErrors, setFieldErrors] = useState({});
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    const isStrongPassword = (p) => p.length >= 8 && /\d/.test(p);

    const validateField = (name, value) => {
        let msg = '';
        if (name === 'email' && value && !isValidEmail(value)) msg = 'Enter a valid email address.';
        if (name === 'password' && value && !isStrongPassword(value)) msg = 'Min 8 characters with at least 1 number.';
        if (name === 'confirmPassword' && value && value !== password) msg = 'Passwords do not match.';
        setFieldErrors(prev => ({ ...prev, [name]: msg }));
    };

    const switchToLogin = () => { setMode('login'); setError(''); setFieldErrors({}); };

    if (!isOpen) return null;

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password);
        if (!result.success) {
            setError(result.error || 'Invalid credentials.');
            setLoading(false);
        }
        // If success, the Context updates and the modal will unmount automatically because isOpen becomes false
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        // Client-side validation
        if (!isValidEmail(email)) {
            setFieldErrors(prev => ({ ...prev, email: 'Enter a valid email address.' }));
            return;
        }
        if (!isStrongPassword(password)) {
            setFieldErrors(prev => ({ ...prev, password: 'Min 8 characters with at least 1 number.' }));
            return;
        }
        if (password !== confirmPassword) {
            setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
            return;
        }
        if (!agreeTerms) {
            setError('You must agree to the Terms and Conditions.');
            return;
        }

        setLoading(true);
        try {
            const completeData = {
                first_name: firstName,
                last_name: lastName,
                username: email.split('@')[0] + Math.floor(Math.random() * 1000),
                email: email,
                password: password,
                password2: confirmPassword,
                phone: ''
            };
            const result = await register(completeData);
            if (!result.success) {
                const errMsg = result.error || 'Failed to create account.';
                // If email already exists, nudge the user to sign in instead
                if (errMsg.toLowerCase().includes('already exists') || errMsg.toLowerCase().includes('email')) {
                    setError('');
                    setFieldErrors(prev => ({ ...prev, email: 'This email is already registered. Sign in instead.' }));
                } else {
                    setError(errMsg);
                }
                setLoading(false);
            } else {
                setSuccessMessage('Registration successful! Welcome to JYNM Vendor Network.');
                setTimeout(() => {
                    // Context updates automatically, unmounting modal
                }, 1500);
            }
        } catch (err) {
            setError('An error occurred during registration.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in font-inter">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col md:flex-row border border-slate-200/50" onClick={(e) => e.stopPropagation()}>
                
                {/* Left Panel - Blue Visual (Using similar design to Screenshot 2) */}
                <div className="hidden md:flex md:w-[42%] bg-gradient-to-br from-blue-700 to-indigo-800 p-10 flex-col justify-center items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
                    
                    <div className="text-center relative z-10 w-full max-w-[280px]">
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] px-6 py-5 mb-8 mx-auto inline-flex items-center justify-center border border-white/20">
                            <img
                                src={getGlobal('brand', 'logo') || '/logo.png'}
                                alt="JYNM"
                                className="h-16 w-auto object-contain"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Join Vendor Network</h2>
                        <p className="text-blue-100 text-[14px] leading-relaxed">
                            List your junkyard, manage inventory, and connect with thousands of serious buyers nationwide.
                        </p>

                        <div className="mt-10 space-y-4 text-left">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-600/50 flex items-center justify-center border border-blue-400/30">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span className="text-blue-50 text-sm font-semibold">Free directory listing</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-600/50 flex items-center justify-center border border-blue-400/30">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span className="text-blue-50 text-sm font-semibold">Real-time buyer leads</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-600/50 flex items-center justify-center border border-blue-400/30">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span className="text-blue-50 text-sm font-semibold">Business dashboard</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form (Matches the layout from Screenshot 2 exactly) */}
                <div className="w-full md:w-[58%] p-6 sm:p-10 md:p-12 overflow-y-auto max-h-[90vh] bg-white relative">
                    
                    {/* Header showing Mode */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-[26px] font-black tracking-tight text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {mode === 'login' ? 'Vendor Sign In' : 'Vendor Registration'}
                            </h2>
                            {/* Instead of a close button, since this intercepts required login, we don't allow closing it unless they click a link to go home. */}
                            <a href="/" className="text-slate-400 hover:text-slate-600 transition p-2 rounded-full hover:bg-slate-100" title="Go Home">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </a>
                        </div>
                        <p className="text-slate-500 text-[14px] font-medium">
                            {mode === 'login' ? 'Sign in to access your yard listing tools.' : 'Step 1 of 1 — Create your partner account'}
                        </p>
                    </div>

                    {/* Notification Alerts (Copied exactly from Screen 2 style) */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[14px] font-bold flex items-center gap-3">
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="mb-6 px-5 py-4 rounded-xl bg-slate-800 text-white shadow-xl shadow-slate-900/20 flex flex-col items-center justify-center text-center gap-2 transform -translate-y-2 animate-fade-in-up">
                            <div className="text-[15px] font-bold">{successMessage}</div>
                            <div className="text-[12px] text-slate-300">Processing...</div>
                        </div>
                    )}

                    {/* The Forms */}
                    {mode === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-[12px] font-bold text-slate-700 mb-1.5 ml-1">Email Address</label>
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm"
                                    placeholder="vendor@example.com" />
                            </div>
                            <div>
                                <label className="block text-[12px] font-bold text-slate-700 mb-1.5 ml-1">Password</label>
                                <PasswordInput required value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm"
                                    placeholder="Enter your password" />
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full mt-4 py-3.5 bg-blue-600 text-white font-bold text-[15px] rounded-xl hover:bg-blue-700 transition shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.35)] disabled:opacity-60 flex items-center justify-center gap-2">
                                {loading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5 ml-1">First Name</label>
                                    <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm"
                                        placeholder="John" />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5 ml-1">Last Name</label>
                                    <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm"
                                        placeholder="Doe" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[12px] font-bold text-slate-700 mb-1.5 ml-1">Email Address</label>
                                <input type="email" required value={email}
                                    onChange={e => { setEmail(e.target.value); validateField('email', e.target.value); }}
                                    onBlur={e => validateField('email', e.target.value)}
                                    className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-[15px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm ${fieldErrors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'}`}
                                    placeholder="you@company.com" />
                                {fieldErrors.email && (
                                    <p className="text-red-500 text-[11px] font-bold mt-1 ml-1 flex items-center gap-1">
                                        <span>⚠</span> {fieldErrors.email}
                                        {fieldErrors.email.includes('already registered') && (
                                            <button type="button" onClick={switchToLogin} className="underline text-blue-600 ml-1">Sign in →</button>
                                        )}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5 ml-1">Password</label>
                                    <PasswordInput required value={password}
                                        onChange={e => { setPassword(e.target.value); validateField('password', e.target.value); }}
                                        onBlur={e => validateField('password', e.target.value)}
                                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-[15px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm ${fieldErrors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'}`}
                                        placeholder="Min 8 chars + 1 number" />
                                    {fieldErrors.password && <p className="text-red-500 text-[11px] font-bold mt-1 ml-1">⚠ {fieldErrors.password}</p>}
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5 ml-1">Confirm Password</label>
                                    <PasswordInput required value={confirmPassword}
                                        onChange={e => { setConfirmPassword(e.target.value); validateField('confirmPassword', e.target.value); }}
                                        onBlur={e => validateField('confirmPassword', e.target.value)}
                                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-[15px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm ${fieldErrors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'}`}
                                        placeholder="Type it again" />
                                    {fieldErrors.confirmPassword && <p className="text-red-500 text-[11px] font-bold mt-1 ml-1">⚠ {fieldErrors.confirmPassword}</p>}
                                </div>
                            </div>

                            <div className="pt-2 pb-1 ml-1">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                                        <input type="checkbox" required checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} className="peer sr-only" />
                                        <div className="w-5 h-5 bg-white border-2 border-slate-300 rounded shadow-sm peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors" />
                                        <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className="text-[13px] text-slate-600 font-medium leading-snug pt-[1px]">
                                        I agree to Junkyards Near Me{' '}
                                        <a href="/terms" className="text-blue-600 hover:underline font-bold" target="_blank" rel="noreferrer">Terms</a> &{' '}
                                        <a href="/privacy" className="text-blue-600 hover:underline font-bold" target="_blank" rel="noreferrer">Privacy Policy</a>
                                    </span>
                                </label>
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full mt-4 py-3.5 bg-blue-600 text-white font-bold text-[15px] rounded-xl hover:bg-blue-700 transition shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.35)] disabled:opacity-60 flex items-center justify-center gap-2">
                                {loading ? 'Creating Account...' : 'Complete Registration'}
                            </button>
                        </form>
                    )}

                    {/* Mode Toggle */}
                    <div className="mt-8 text-center text-[14px] font-semibold text-slate-500">
                        {mode === 'login' ? (
                            <>
                                Don't have an account?{' '}
                                <button type="button" onClick={() => { setMode('signup'); setError(''); }} className="text-blue-600 hover:text-blue-700 hover:underline transition">
                                    Create Free Vendor Account
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button type="button" onClick={() => { setMode('login'); setError(''); }} className="text-blue-600 hover:text-blue-700 hover:underline transition">
                                    Sign In Instead
                                </button>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default VendorAuthModal;
