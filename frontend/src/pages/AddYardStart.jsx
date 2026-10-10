import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVendorAuth } from '../contexts/VendorAuthContext';
import { AuthContext } from '../contexts/AuthContext';
import { useCMS } from '../hooks/useCMS';
import PasswordInput from '../components/PasswordInput';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';

export default function AddYardStart() {
    const navigate = useNavigate();
    const { get } = useCMS('add_a_yard');
    const { isAuthenticated: isVendorAuthenticated, loading, register, login } = useVendorAuth();
    const { isAuthenticated: isCustomerAuthenticated, user } = useContext(AuthContext);

    // Form mode
    const [mode, setMode] = useState('signup'); // 'signup' or 'login'

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);

    // Validation & State
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

    // Helpers
    const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    const isStrongPassword = (p) => p.length >= 8 && /\d/.test(p);
    const validateField = (name, value) => {
        let msg = '';
        if (name === 'email' && value && !isValidEmail(value)) msg = 'Enter a valid email address.';
        if (name === 'password' && value && !isStrongPassword(value)) msg = 'Min 8 characters with at least 1 number.';
        if (name === 'confirmPassword' && value && value !== password) msg = 'Passwords do not match.';
        setFieldErrors(prev => ({ ...prev, [name]: msg }));
    };

    // Scenarios
    const isVendor = isVendorAuthenticated();
    const isCustomer = isCustomerAuthenticated && !isVendor;

    // Direct routing if already logged in as vendor
    useEffect(() => {
        if (!loading && isVendor) {
            navigate('/add-a-yard/form', { replace: true });
        }
    }, [isVendor, loading, navigate]);

    // Handle Auth Submission
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitLoading(true);
        const result = await login(email, password);
        if (!result.success) {
            setError(result.error || 'Invalid credentials.');
            setSubmitLoading(false);
        } else {
            navigate('/add-a-yard/form');
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (!isValidEmail(email)) { setFieldErrors(p => ({ ...p, email: 'Enter a valid email address.' })); return; }
        if (!isStrongPassword(password)) { setFieldErrors(p => ({ ...p, password: 'Min 8 characters with at least 1 number.' })); return; }
        if (password !== confirmPassword) { setFieldErrors(p => ({ ...p, confirmPassword: 'Passwords do not match.' })); return; }
        if (!agreeTerms) { setError('You must agree to the Terms and Conditions.'); return; }

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
                const errMsg = result.error || 'Failed to create account.';
                if (errMsg.toLowerCase().includes('already exists') || errMsg.toLowerCase().includes('email')) {
                    setError('');
                    setFieldErrors(p => ({ ...p, email: 'This email is already registered. Sign in instead.' }));
                } else {
                    setError(errMsg);
                }
                setSubmitLoading(false);
            } else {
                navigate('/add-a-yard/form');
            }
        } catch (err) {
            setError('An error occurred during registration.');
            setSubmitLoading(false);
        }
    };

    // Customer fallback
    if (!loading && isCustomer) {
        return (
            <div className="min-h-screen bg-[#f8fafc]">
                <Navbar />
                <div className="max-w-2xl mx-auto px-4 py-32 flex flex-col items-center text-center">
                    <div className="mb-6 w-16 h-16 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center p-2">
                        <img src="/logo.png" alt="JYNM Logo" className="w-full h-full object-contain" onError={e => { e.target.style.display = 'none'; }} />
                    </div>
                    <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-6 shadow-sm">
                        <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Vendor Account Required
                    </h1>
                    <p className="text-[16px] text-slate-500 font-medium max-w-md mb-2 leading-relaxed">
                        You're currently signed in as a <span className="font-bold text-slate-700">{user?.first_name || 'customer'}</span>.
                    </p>
                    <p className="text-[15px] text-slate-400 max-w-md mb-10 leading-relaxed">
                        To add and manage a junkyard listing on JYNM, you'll need a dedicated vendor account.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <button onClick={() => navigate('/vendor/signup')} className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-[0_4px_12px_rgba(37,99,235,0.3)] text-[15px] text-center">
                            Create Vendor Account
                        </button>
                        <button onClick={() => navigate('/')} className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition text-[15px]">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading || isVendor) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>;
    }

    // Modal Style
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center font-inter bg-slate-900">
            <SEO title="Add Your Junkyard – JYNM" description="List your salvage yard on JYNM and connect with thousands of buyers looking for used auto parts." />
            
            {/* Backdrop Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={get('hero', 'background_image') || "https://images.unsplash.com/photo-1620892019318-7b243ebd7f7e?q=80&w=2000&auto=format&fit=crop"}
                    alt=""
                    className="w-full h-full object-cover opacity-60 backdrop-blur-sm"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
            </div>

            {/* Back to Home Button at Top */}
            <Link to="/" className="absolute top-5 left-5 z-20 inline-flex items-center gap-1.5 text-white/90 hover:text-white text-[13px] font-semibold bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-full shadow-sm hover:bg-white/20 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back Home
            </Link>

            {/* Modal Card */}
            <div className="relative z-10 w-full max-w-[420px] mx-4 rounded-3xl overflow-hidden shadow-2xl bg-transparent mt-6 mb-6" style={{ maxHeight: '92vh', overflowY: 'auto' }}>
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop"
                        alt=""
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/80" />
                </div>

                <div className="relative z-10 flex flex-col">
                    {/* Top section — Logo + Title */}
                    <div className="flex flex-col items-center pt-8 pb-4 px-6 text-center">
                        <img
                            src="/logo.png"
                            alt="JYNM"
                            className="h-14 w-auto object-contain mb-3 drop-shadow-2xl"
                            onError={e => e.currentTarget.style.display = 'none'}
                        />
                        <h1 className="text-[22px] font-black text-white leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {mode === 'signup' ? 'List Your ' : 'Vendor '}<span className="text-yellow-400">{mode === 'signup' ? 'Junkyard' : 'Sign In'}</span>
                        </h1>
                        <p className="text-white/70 text-[12px] mt-1.5 font-medium leading-snug">
                            {mode === 'signup' ? "Create your partner account to start receiving parts requests." : "Welcome back. Sign in to manage your yard and leads."}
                        </p>
                    </div>

                    {/* White Form Card */}
                    <div className="bg-white mx-3 mb-3 rounded-2xl px-5 py-5 shadow-2xl">
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[12px] font-semibold text-center flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                {error}
                            </div>
                        )}
                        {mode === 'signup' ? (
                            <form onSubmit={handleSignup} className="space-y-3.5">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wide">First Name</label>
                                        <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="John" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wide">Last Name</label>
                                        <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="Smith" />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wide">Business Email</label>
                                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="contact@youryard.com" />
                                    {fieldErrors.email && <p className="text-red-500 text-[10px] font-bold mt-1">⚠ {fieldErrors.email}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wide">Password</label>
                                        <PasswordInput required value={password} onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2"
                                            placeholder="Min 8 chars" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wide">Confirm</label>
                                        <PasswordInput required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2"
                                            placeholder="Type again" />
                                    </div>
                                </div>

                                <div className="pt-1">
                                    <label className="flex items-start gap-2.5 cursor-pointer">
                                        <div className="relative mt-0.5">
                                            <input type="checkbox" required checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} className="peer sr-only" />
                                            <div className="w-4 h-4 border-2 border-slate-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600" />
                                            <svg className="absolute inset-0 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <span className="text-[11px] text-slate-500 font-medium">
                                            I accept the <a href="/terms" className="text-blue-600 hover:underline">Terms</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                                        </span>
                                    </label>
                                </div>

                                <button type="submit" disabled={submitLoading} className="w-full py-3 bg-blue-600 text-white font-black text-[14px] rounded-xl hover:bg-blue-700 transition shadow-lg disabled:opacity-60 mt-1">
                                    {submitLoading ? 'Setting up...' : 'Get Started →'}
                                </button>
                                
                                <p className="text-center text-[12px] text-slate-500 font-medium pt-1">
                                    Already a partner?{' '}
                                    <button type="button" onClick={() => {setMode('login'); setError('');}} className="text-blue-600 hover:text-blue-700 font-bold">Sign In</button>
                                </p>
                            </form>
                        ) : (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Business Email</label>
                                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2"
                                        placeholder="contact@youryard.com" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Password</label>
                                        <Link to="/vendor/forgot-password" className="text-[11px] text-blue-600 font-bold hover:text-blue-700">Forgot?</Link>
                                    </div>
                                    <PasswordInput required value={password} onChange={e => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2"
                                        placeholder="••••••••" />
                                </div>
                                <button type="submit" disabled={submitLoading} className="w-full py-3 bg-blue-600 text-white font-black text-[14px] rounded-xl hover:bg-blue-700 transition shadow-lg disabled:opacity-60 mt-2">
                                    {submitLoading ? 'Verifying...' : 'Sign In →'}
                                </button>
                                
                                <p className="text-center text-[12px] text-slate-500 font-medium pt-2">
                                    New to JYNM?{' '}
                                    <button type="button" onClick={() => {setMode('signup'); setError('');}} className="text-blue-600 hover:text-blue-700 font-bold">List Your Yard</button>
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
