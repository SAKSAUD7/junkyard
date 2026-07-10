import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVendorAuth } from '../../contexts/VendorAuthContext';
import { useCMS } from '../../hooks/useCMS';
import PasswordInput from '../../components/PasswordInput';
import SEO from '../../components/SEO';

const FEATURES = [
    { icon: '🚀', title: 'Start Fast', desc: 'Create your account in seconds.' },
    { icon: '🏪', title: 'Claim Your Yard', desc: 'Take control of your junkyard listing.' },
    { icon: '💰', title: 'Grow Revenue', desc: 'Connect with serious parts buyers today.' },
];

const VendorSignUp = () => {
    const { get } = useCMS('vendor_portal');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Assuming we have a register method, otherwise we use signup logic from auth context
    const { register, login } = useVendorAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (!agreeTerms) {
            setError('You must agree to the Terms and Conditions.');
            return;
        }

        setLoading(true);
        // Assuming signup endpoint or logic exists. If register is not in context, we fallback to login for now (error out in UI nicely)
        try {
            if (register) {
                const completeData = {
                    first_name: firstName,
                    last_name: lastName,
                    username: email.split('@')[0] + Math.floor(Math.random() * 1000), // Ensure unique username
                    email: email,
                    password: password,
                    password2: confirmPassword,
                    phone: '' // Providing empty phone as it might be required by model but not UI yet
                };
                const result = await register(completeData);
                if (result.success) {
                    navigate('/vendor/dashboard');
                } else {
                    setError(result.error || 'Failed to create account.');
                }
            } else {
                // If vendor register isn't fully implemented on backend yet
                setError('Registration Endpoint Not Found in Context Mode (Dev).');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f0fff4] flex flex-col font-inter">
            <SEO title="Register Vendor – JYNM" description="Create your JYNM Vendor account." noindex={true} />

            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-[900px] flex flex-col gap-4">
                    <div className="w-full bg-white rounded-3xl shadow-[0_20px_60px_rgba(22,163,74,0.12)] overflow-hidden flex flex-col md:flex-row min-h-[auto]">

                    {/* Left panel — Green */}
                    <div className="md:w-[380px] shrink-0 relative bg-gradient-to-br from-[#15803d] to-[#22c55e] flex flex-col items-center justify-center p-8 text-white overflow-hidden hidden md:flex">
                        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/10" />
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-white/10" />
                        <div className="relative z-10 w-28 h-28 rounded-2xl bg-white/95 backdrop-blur flex items-center justify-center mb-6 shadow-xl border border-white/50 p-4">
                            <img src="/logo.png" alt="JYNM Logo" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="relative z-10 text-2xl font-black mb-2 text-center" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Join Vendor Network
                        </h2>
                        <p className="relative z-10 text-green-100 text-sm text-center font-medium max-w-[200px]">
                            Create your account to claim and manage junkyard listings.
                        </p>
                    </div>

                    {/* Right panel — Form */}
                    <div className="flex-1 flex flex-col justify-center p-5 sm:p-8">
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-slate-500 hover:text-green-600 transition-colors text-sm font-semibold">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                Back
                            </button>
                            <Link to="/" className="flex items-center gap-2">
                                <img src="/logo.png" alt="JYNM" className="h-7 w-auto" onError={e => e.currentTarget.style.display='none'} />
                                <span className="font-black text-slate-900 text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>JYNM</span>
                            </Link>
                            <div className="w-12" /> {/* Spacer */}
                        </div>

                        <div className="text-center mb-5">
                            <h1 className="text-[22px] font-black text-slate-900 mb-0.5 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Create Login
                            </h1>
                            <p className="text-slate-500 text-[13px] font-medium">Sign up with your email to start managing.</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold flex items-center gap-3">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wide">First Name</label>
                                    <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-all"
                                        placeholder="John" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wide">Last Name</label>
                                    <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-all"
                                        placeholder="Doe" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wide">Email Address</label>
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-all"
                                    placeholder="your.email@example.com" />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wide">Password</label>
                                <PasswordInput required value={password} onChange={e => setPassword(e.target.value)}
                                    className={`w-full bg-slate-50 border ${password && password.length < 8 ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-green-500'} rounded-lg px-3 py-2.5 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-green-500/10 transition-all`}
                                    placeholder="Create a strong password" />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wide">Retype Password</label>
                                <PasswordInput required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                    className={`w-full bg-slate-50 border ${confirmPassword && password !== confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-green-500'} rounded-lg px-3 py-2.5 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-green-500/10 transition-all`}
                                    placeholder="Confirm your password" />
                            </div>

                            {/* Real-time Password Validation */}
                            <div className="mt-2 space-y-1.5 px-0.5">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${password.length >= 8 ? 'bg-green-500' : 'bg-slate-200'}`}>
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className={`text-[11px] font-medium transition-colors ${password.length >= 8 ? 'text-green-600' : 'text-slate-500'}`}>At least 8 characters</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${password && confirmPassword && password === confirmPassword ? 'bg-green-500' : 'bg-slate-200'}`}>
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className={`text-[11px] font-medium transition-colors ${password && confirmPassword && password === confirmPassword ? 'text-green-600' : 'text-slate-500'}`}>Passwords match</span>
                                </div>
                            </div>

                            <div className="pt-1">
                                <label className="flex items-start gap-2.5 cursor-pointer group">
                                    <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                                        <input type="checkbox" required checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} className="peer sr-only" />
                                        <div className="w-4 h-4 border-2 border-slate-300 rounded overflow-hidden peer-checked:bg-green-600 peer-checked:border-green-600 transition-colors" />
                                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className="text-[11.5px] text-slate-500 font-medium leading-snug">
                                        I agree to Junkyards Near Me{' '}
                                        <Link to="/terms" className="text-green-600 hover:underline">Terms</Link> &{' '}
                                        <Link to="/privacy" className="text-green-600 hover:underline">Privacy</Link>.
                                    </span>
                                </label>
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full mt-1.5 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-[0_4px_12px_rgba(22,163,74,0.3)] disabled:opacity-60 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                        Creating Account…
                                    </>
                                ) : 'Sign Up'}
                            </button>
                        </form>

                        <div className="mt-5 text-center text-[12px] font-medium text-slate-500 border-t border-slate-100 pt-4">
                            Already have an account?{' '}
                            <Link to="/vendor/login" className="text-green-600 font-bold hover:underline">Click here to login.</Link>
                        </div>
                    </div>
                </div>

                {/* Mobile & Desktop Feature Strip */}
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 px-3 py-1 w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <div className="text-[11px] font-bold text-slate-700 leading-tight">Manage Your<br/>Inventory</div>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-1 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <div className="text-[11px] font-bold text-slate-700 leading-tight">Receive More<br/>Leads</div>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-1 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v8l9-11h-7z" /></svg>
                        </div>
                        <div className="text-[11px] font-bold text-slate-700 leading-tight">Grow Your<br/>Business</div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};

export default VendorSignUp;
