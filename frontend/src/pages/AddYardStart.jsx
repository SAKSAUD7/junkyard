import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVendorAuth } from '../contexts/VendorAuthContext';
import { AuthContext } from '../contexts/AuthContext';
import PasswordInput from '../components/PasswordInput';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';

export default function AddYardStart() {
    const navigate = useNavigate();
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
    const isGuest = !isCustomerAuthenticated && !isVendor;

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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

    // Split Screen Add-A-Yard Start
    return (
        <div className="min-h-screen w-full flex font-inter overflow-hidden bg-slate-900">
            <SEO title="Add Your Junkyard – JYNM" description="List your salvage yard on JYNM and connect with thousands of buyers looking for used auto parts." />
            
            {/* Left Panel: Hero Graphics */}
            <div className="hidden lg:flex flex-col justify-between flex-1 relative overflow-hidden p-10 lg:p-16">
                <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1620892019318-7b243ebd7f7e?q=80&w=2000&auto=format&fit=crop" alt="Auto Salvage Yard" className="w-full h-full object-cover object-center opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/80" />
                </div>
                
                <div className="relative z-10 max-w-lg mt-8">
                    <Link to="/" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-[13px] font-semibold mb-12 group bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
                        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back Home
                    </Link>
                    
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-400/30 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase text-blue-300 mb-6">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                        JYNM Vendor Network
                    </div>
                    
                    <h1 className="text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Turn your inventory into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">revenue</span>.
                    </h1>
                    
                    <p className="text-slate-300 text-lg leading-relaxed font-medium mb-12 max-w-[400px]">
                        List your junkyard on JYNM to connect instantly with thousands of buyers searching for used auto parts nationwide.
                    </p>
                    
                    <div className="space-y-6">
                        {[
                            { title: 'Zero Setup Fees', desc: 'Create your listing for free and start receiving leads.' },
                            { title: 'Verified Buyers', desc: 'Get direct access to customers ready to purchase.' },
                            { title: 'Easy Management', desc: 'Update inventory, business hours, and photos in clicks.' }
                        ].map((feature, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="w-6 h-6 mt-1 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                                    <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-[15px]">{feature.title}</h4>
                                    <p className="text-slate-400 text-sm mt-0.5">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel: Form */}
            <div className="w-full lg:w-[500px] shrink-0 bg-white min-h-screen relative flex flex-col justify-center px-6 sm:px-12 py-12 lg:py-0 overflow-y-auto shadow-[-20px_0_40px_rgba(0,0,0,0.3)] z-50">
                {/* Mobile BG Image Overlay */}
                <div className="absolute inset-0 z-0 lg:hidden block">
                    <img src="https://images.unsplash.com/photo-1620892019318-7b243ebd7f7e?q=80&w=1400" alt="Vendor Mobile BG" className="w-full h-full object-cover opacity-10" />
                    <div className="absolute inset-0 bg-white/95" />
                </div>
                
                {/* Mobile Back Link */}
                <div className="absolute top-6 left-6 lg:hidden z-20">
                    <Link to="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-[13px] font-semibold bg-slate-100 border border-slate-200 px-3 py-2 rounded-full shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back Home
                    </Link>
                </div>

                <div className="relative z-10 w-full max-w-md mx-auto my-auto pt-16 lg:pt-0">
                    <div className="mb-8">
                        <div className="bg-slate-50 p-3 rounded-2xl shadow-sm border border-slate-200 inline-block mb-6">
                            <img src="/logo.png" alt="JYNM" className="h-8 sm:h-10 w-auto" onError={e => e.currentTarget.style.display = 'none'} />
                        </div>
                        <h2 className="text-[26px] font-black tracking-tight text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {mode === 'signup' ? 'List Your Junkyard' : 'Vendor Sign In'}
                        </h2>
                        <p className="text-slate-500 text-[14px] font-medium leading-relaxed">
                            {mode === 'signup' ? "Create your free partner account to start receiving parts requests today." : "Welcome back. Sign in to manage your yard and leads."}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-bold flex items-center gap-3">
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {mode === 'signup' ? (
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">First Name</label>
                                    <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        placeholder="John" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Last Name</label>
                                    <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        placeholder="Smith" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Business Email</label>
                                <input type="email" required value={email} onChange={e => { setEmail(e.target.value); validateField('email', e.target.value); }} onBlur={e => validateField('email', e.target.value)}
                                    className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all ${fieldErrors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'}`}
                                    placeholder="contact@youryard.com" />
                                {fieldErrors.email && <p className="text-red-500 text-[11px] font-bold mt-1.5 flex items-center gap-1">⚠ {fieldErrors.email}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Password</label>
                                    <PasswordInput required value={password} onChange={e => { setPassword(e.target.value); validateField('password', e.target.value); }} onBlur={e => validateField('password', e.target.value)}
                                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all ${fieldErrors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'}`}
                                        placeholder="Min 8 chars" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Confirm</label>
                                    <PasswordInput required value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); validateField('confirmPassword', e.target.value); }} onBlur={e => validateField('confirmPassword', e.target.value)}
                                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3.5 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all ${fieldErrors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'}`}
                                        placeholder="Type again" />
                                </div>
                            </div>
                            
                            <div className="pt-2 pb-1">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                                        <input type="checkbox" required checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} className="peer sr-only" />
                                        <div className="w-5 h-5 bg-white border-2 border-slate-300 rounded shadow-sm peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors" />
                                        <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className="text-[13px] text-slate-500 font-medium leading-snug">
                                        I accept the <a href="/terms" className="text-blue-600 hover:underline font-bold" target="_blank" rel="noreferrer">Terms & Conditions</a> and <a href="/privacy" className="text-blue-600 hover:underline font-bold" target="_blank" rel="noreferrer">Privacy Policy</a>
                                    </span>
                                </label>
                            </div>

                            <button type="submit" disabled={submitLoading}
                                className="w-full mt-4 py-4 bg-blue-600 text-white font-black text-[15px] rounded-xl hover:bg-blue-700 transition shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] disabled:opacity-60 flex items-center justify-center gap-2">
                                {submitLoading ? 'Setting up...' : 'Get Started →'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Business Email</label>
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="contact@youryard.com" />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Password</label>
                                    <Link to="/vendor/forgot-password" className="text-[12px] text-blue-600 font-bold hover:text-blue-700 transition">Forgot?</Link>
                                </div>
                                <PasswordInput required value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="••••••••" />
                            </div>
                            <button type="submit" disabled={submitLoading}
                                className="w-full mt-4 py-4 bg-blue-600 text-white font-black text-[15px] rounded-xl hover:bg-blue-700 transition shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] disabled:opacity-60 flex items-center justify-center gap-2">
                                {submitLoading ? 'Verifying...' : 'Sign In →'}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center text-[14px] font-medium text-slate-500">
                        {mode === 'signup' ? (
                            <>Already a partner? <button onClick={() => {setMode('login'); setError('');}} className="font-bold text-blue-600 hover:text-blue-700 transition">Sign In</button></>
                        ) : (
                            <>New to JYNM? <button onClick={() => {setMode('signup'); setError('');}} className="font-bold text-blue-600 hover:text-blue-700 transition">List Your Yard</button></>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
