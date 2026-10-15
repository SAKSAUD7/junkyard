import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVendorAuth } from '../../contexts/VendorAuthContext';
import { AuthContext } from '../../contexts/AuthContext';
import PasswordInput from '../PasswordInput';

export default function AddYardModal({ isOpen, onClose, initialMode = 'signup', onForgotPassword, successPath = '/add-a-yard/form', authenticatedPath = '/add-a-yard/form' }) {
    const navigate = useNavigate();
    const { isAuthenticated: isVendorAuthenticated, loading: vendorLoading, register, login } = useVendorAuth();
    const { isAuthenticated: isCustomerAuthenticated, user: customerUser } = useContext(AuthContext);

    // Mode: 'signup' | 'login'
    const [mode, setMode] = useState(initialMode);


    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);

    // Validation & Status
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

    const isVendor = isVendorAuthenticated();
    const isCustomer = isCustomerAuthenticated && !isVendor;

    // Direct routing if already logged in as vendor
    useEffect(() => {
        if (isOpen && !vendorLoading && isVendor) {
            onClose?.();
            navigate(authenticatedPath);
        }
    }, [isOpen, isVendor, vendorLoading, navigate, onClose, authenticatedPath]);

    const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    const isStrongPassword = (p) => p.length >= 8 && /\d/.test(p);

    const handleClose = () => {
        setError('');
        setFieldErrors({});
        onClose?.();
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitLoading(true);
        const result = await login(email, password);
        if (!result.success) {
            setError(result.error || 'Invalid vendor credentials.');
            setSubmitLoading(false);
        } else {
            setSubmitLoading(false);
            onClose?.();
            navigate(successPath);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        if (!isValidEmail(email)) {
            setFieldErrors(p => ({ ...p, email: 'Enter a valid email address.' }));
            return;
        }
        if (!isStrongPassword(password)) {
            setFieldErrors(p => ({ ...p, password: 'Min 8 characters with at least 1 number.' }));
            return;
        }
        if (password !== confirmPassword) {
            setFieldErrors(p => ({ ...p, confirmPassword: 'Passwords do not match.' }));
            return;
        }
        if (!agreeTerms) {
            setError('Please accept the Terms and Conditions.');
            return;
        }

        setSubmitLoading(true);
        try {
            const completeData = {
                first_name: firstName,
                last_name: lastName,
                username: email.split('@')[0] + Math.floor(Math.random() * 1000),
                email,
                password,
                password2: confirmPassword,
                phone: ''
            };
            const result = await register(completeData);
            if (!result.success) {
                const errMsg = result.error || 'Failed to create partner account.';
                if (errMsg.toLowerCase().includes('already exists') || errMsg.toLowerCase().includes('email')) {
                    setFieldErrors(p => ({ ...p, email: 'This email is already registered. Please sign in.' }));
                } else {
                    setError(errMsg);
                }
                setSubmitLoading(false);
            } else {
                setSubmitLoading(false);
                onClose?.();
                navigate('/add-a-yard/form');
            }
        } catch {
            setError('An error occurred during partner registration.');
            setSubmitLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center font-inter" onClick={handleClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity" />

            {/* Modal Dialog */}
            <div
                className="relative w-full max-w-[440px] mx-4 rounded-3xl overflow-hidden shadow-2xl z-10 my-6 bg-slate-900 border border-white/10"
                style={{ maxHeight: '92vh', overflowY: 'auto' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background Image / Gradient */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/heroes/parts-warehouse.png"
                        alt=""
                        className="w-full h-full object-cover opacity-35"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/95 to-slate-950" />
                </div>

                {/* Close Button */}
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <div className="relative z-10 flex flex-col p-6 sm:p-7">
                    {/* Brand Header */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <img
                            src="/logo.png"
                            alt="JYNM"
                            className="h-12 w-auto object-contain mb-3 drop-shadow-md"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
                            <span>Vendor & Recycler Network</span>
                        </div>
                        <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {mode === 'signup' ? 'List Your ' : 'Partner '}<span className="text-yellow-400">{mode === 'signup' ? 'Junkyard' : 'Sign In'}</span>
                        </h2>
                        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xs font-medium">
                            {mode === 'signup'
                                ? 'Create your partner account to connect with active buyers looking for parts.'
                                : 'Welcome back! Sign in to manage your inventory and respond to customer quotes.'}
                        </p>
                    </div>

                    {/* Customer Account Switch Notice */}
                    {isCustomer && (
                        <div className="mb-4 p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-200 text-xs">
                            <div className="font-bold mb-1 flex items-center gap-1.5 text-amber-300">
                                <span>Notice: Customer Account Detected</span>
                            </div>
                            You are signed in as <strong>{customerUser?.first_name || 'Customer'}</strong>. Listing a junkyard requires a separate Vendor Partner account.
                        </div>
                    )}

                    {/* White Container Form */}
                    <div className="bg-white rounded-2xl p-5 shadow-2xl text-slate-900">
                        {error && (
                            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {mode === 'signup' ? (
                            <form onSubmit={handleSignup} className="space-y-3">
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="John"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Smith"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">Business Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="partner@youryard.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {fieldErrors.email && (
                                        <p className="text-rose-500 text-[10px] font-bold mt-1">⚠ {fieldErrors.email}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">Password</label>
                                        <PasswordInput
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Min 8 chars"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">Confirm</label>
                                        <PasswordInput
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Re-type"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                {fieldErrors.password && (
                                    <p className="text-rose-500 text-[10px] font-bold">⚠ {fieldErrors.password}</p>
                                )}
                                {fieldErrors.confirmPassword && (
                                    <p className="text-rose-500 text-[10px] font-bold">⚠ {fieldErrors.confirmPassword}</p>
                                )}

                                <div className="pt-1">
                                    <label className="flex items-start gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            required
                                            checked={agreeTerms}
                                            onChange={(e) => setAgreeTerms(e.target.checked)}
                                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5"
                                        />
                                        <span className="text-[11px] text-slate-500 font-medium leading-tight">
                                            I agree to the <a href="/terms" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Terms of Service</a> & <a href="/privacy" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Privacy Policy</a>
                                        </span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitLoading}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-60 mt-2"
                                >
                                    {submitLoading ? 'Registering Yard...' : 'Get Started & List Yard →'}
                                </button>

                                <div className="text-center pt-1 text-xs text-slate-500 font-semibold">
                                    Already have a partner account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => { setMode('login'); setError(''); }}
                                        className="text-blue-600 hover:underline font-bold"
                                    >
                                        Sign In
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleLogin} className="space-y-3.5">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">Business Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="partner@youryard.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700">Password</label>
                                        <button
                                            type="button"
                                            onClick={onForgotPassword}
                                            className="text-[10px] font-bold text-blue-600 hover:underline"
                                        >
                                            Forgot?
                                        </button>
                                    </div>
                                    <PasswordInput
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitLoading}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-60 mt-2"
                                >
                                    {submitLoading ? 'Verifying...' : 'Sign In & Access Yard →'}
                                </button>

                                <div className="text-center pt-1 text-xs text-slate-500 font-semibold">
                                    New Junkyard Partner?{' '}
                                    <button
                                        type="button"
                                        onClick={() => { setMode('signup'); setError(''); }}
                                        className="text-blue-600 hover:underline font-bold"
                                    >
                                        Create Account
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
