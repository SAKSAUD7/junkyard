import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import PasswordInput from '../components/PasswordInput';
import TurnstileCaptcha from '../components/TurnstileCaptcha';

// Automotive background — bright junkyard rows at golden hour (Unsplash free)
const BG = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1400&q=75';

export default function SignUp() {
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/';
    const navigate = useNavigate();
    const { register, isAuthenticated } = useContext(AuthContext);

    const [role, setRole] = useState('buyer');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreed: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState('');

    useEffect(() => {
        if (isAuthenticated) { navigate(returnUrl); }
    }, [isAuthenticated, navigate, returnUrl]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData(prev => ({ ...prev, [e.target.name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
            setError('Please fill in all fields.'); return;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters.'); return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.'); return;
        }
        if (!formData.agreed) {
            setError('You must agree to the Terms & Conditions.'); return;
        }
        if (!turnstileToken) {
            setError('Challenge verification failed. Please try again.'); return;
        }

        setLoading(true);
        const completeData = {
            name: formData.name,
            first_name: formData.name.split(' ')[0] || formData.name,
            last_name: formData.name.split(' ').slice(1).join(' ') || '',
            username: formData.email.split('@')[0],
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            password2: formData.password,
            countryCode: '+1',
            user_type: role,
            cf_turnstile_response: turnstileToken || 'mock_fallback'
        };

        try {
            await register(completeData);
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.email?.[0] || err.message || 'Failed to create account. Please try again.');
            setLoading(false);
        }
    };

    const pwOk = formData.password.length >= 8;
    const pwMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

    return (
        <div className="min-h-screen flex flex-col relative font-inter overflow-hidden">
            <SEO title="Sign Up – Create Your JYNM Account" description="Create a free account to find auto parts and connect with trusted junkyards." noindex={true} />

            {/* Automotive Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src={BG}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628]/80 via-[#1a3a6b]/65 to-[#1e4da0]/55" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 py-8">

                {/* Back Home */}
                <div className="w-full max-w-md mb-4">
                    <Link to="/" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm font-semibold">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back Home
                    </Link>
                </div>

                {/* Auth Card */}
                <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.35)] overflow-hidden">

                    {/* Card Header */}
                    <div className="px-6 pt-8 pb-5 text-center border-b border-slate-100">
                        <Link to="/" className="inline-block mb-3">
                            <img src="/logo.png" alt="JYNM" className="h-10 w-auto mx-auto" onError={e => e.currentTarget.style.display='none'} />
                        </Link>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Welcome to <span className="text-[#1a56ff]">JYNM!</span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Create your account and start exploring auto parts and trusted junkyards.</p>
                    </div>

                    {/* Role Tabs */}
                    <div className="flex px-6 pt-5 gap-2">
                        {[
                            { id: 'buyer', label: 'Buyer' },
                            { id: 'vendor', label: 'Vendor' },
                        ].map(r => (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => setRole(r.id)}
                                className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all ${role === r.id ? 'bg-[#1a56ff] text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>

                    <div className="px-6 py-5">
                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="su-name" className="block text-[12px] font-bold text-slate-700 mb-1">Name</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </span>
                                        <input
                                            id="su-name"
                                            type="text" name="name" value={formData.name} onChange={handleChange} required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-[13px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                            placeholder="e.g. Arun"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="su-phone" className="block text-[12px] font-bold text-slate-700 mb-1">Phone Number</label>
                                    <div className="flex gap-1">
                                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-[13px] font-medium text-slate-700 gap-1 shrink-0">
                                            <span>🇺🇸</span>
                                            <span className="text-[12px]">+1</span>
                                        </div>
                                        <input
                                            id="su-phone"
                                            type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                                            className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                            placeholder="9999999999"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="su-email" className="block text-[12px] font-bold text-slate-700 mb-1">Email Address</label>
                                <input
                                    id="su-email"
                                    type="email" name="email" value={formData.email} onChange={handleChange} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="su-pw" className="block text-[12px] font-bold text-slate-700 mb-1">Password</label>
                                    <PasswordInput
                                        id="su-pw"
                                        name="password" required value={formData.password} onChange={handleChange}
                                        className={`w-full bg-slate-50 border ${formData.password && !pwOk ? 'border-red-400' : 'border-slate-200'} rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all`}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="su-pw2" className="block text-[12px] font-bold text-slate-700 mb-1">Confirm Password</label>
                                    <PasswordInput
                                        id="su-pw2"
                                        name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}
                                        className={`w-full bg-slate-50 border ${formData.confirmPassword && !pwMatch ? 'border-red-400' : 'border-slate-200'} rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all`}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Password validators */}
                            <div className="flex gap-4 px-0.5">
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-3 h-3 rounded-full flex items-center justify-center ${pwOk ? 'bg-blue-500' : 'bg-slate-200'}`}>
                                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className={`text-[11px] font-medium ${pwOk ? 'text-blue-600' : 'text-slate-400'}`}>8+ characters</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-3 h-3 rounded-full flex items-center justify-center ${pwMatch ? 'bg-blue-500' : 'bg-slate-200'}`}>
                                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className={`text-[11px] font-medium ${pwMatch ? 'text-blue-600' : 'text-slate-400'}`}>Passwords match</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <input
                                    type="checkbox"
                                    name="agreed"
                                    id="su-terms"
                                    checked={formData.agreed}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="su-terms" className="text-[12px] text-slate-600 font-medium">
                                    I agree to the <Link to="/terms" className="text-blue-600 hover:underline">Terms & Conditions</Link>
                                </label>
                            </div>

                            <TurnstileCaptcha
                                onVerify={(token) => setTurnstileToken(token)}
                                onError={(err) => setError(err)}
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-[#1a56ff] hover:bg-[#1648d0] text-white font-bold rounded-xl transition-all shadow-[0_6px_20px_rgba(26,86,255,0.35)] disabled:opacity-70 flex items-center justify-center gap-2 text-[15px] active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                        Creating…
                                    </>
                                ) : (role === 'buyer' ? 'Next →' : 'Register Vendor')}
                            </button>
                        </form>
                    </div>

                    {/* Feature Strip */}
                    <div className="flex items-center justify-around px-4 py-3 bg-slate-50 border-t border-slate-100">
                        {[
                            { icon: '🔍', label: 'Find Quality Parts' },
                            { icon: '🤝', label: 'Trusted Junkyards' },
                            { icon: '💰', label: 'Save Time & Money' },
                        ].map(f => (
                            <div key={f.label} className="flex flex-col items-center gap-1 text-center flex-1">
                                <span className="text-lg">{f.icon}</span>
                                <span className="text-[10px] font-bold text-slate-500 leading-tight">{f.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sign In Link */}
                <p className="mt-5 text-center text-sm text-white/70">
                    Already have an account?{' '}
                    <Link to={`/signin?returnUrl=${encodeURIComponent(returnUrl)}`} className="font-bold text-white hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
