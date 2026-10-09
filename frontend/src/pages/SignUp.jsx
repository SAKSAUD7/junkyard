import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import PasswordInput from '../components/PasswordInput';
import TurnstileCaptcha from '../components/TurnstileCaptcha';

const BG_IMAGE_URL = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000&auto=format&fit=crop';

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
        <div className="min-h-screen w-full relative flex font-inter items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 overflow-hidden">
            <SEO title="Create Account – JYNM" description="Create a new JYNM account." noindex={true} />

            {/* Background Image - Bright Luxury Car */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1620892019318-7b243ebd7f7e?q=80&w=2000&auto=format&fit=crop"
                    alt="Luxury Auto Background"
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-slate-50/90 to-white/95"></div>
            </div>

            <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8 min-h-screen w-full max-w-7xl mx-auto">
                
                {/* Back to Home Link */}
                <div className="absolute top-6 left-6 md:top-10 md:left-10 z-20">
                    <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold text-sm transition-colors group bg-white/50 backdrop-blur px-4 py-2 rounded-full shadow-sm hover:shadow-md border border-slate-200">
                        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back Home
                    </Link>
                </div>

                {/* Main Card */}
                <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden transform transition-all relative mt-10">
                    {/* Inner subtle top highlight */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                    {/* Card Header */}
                    <div className="px-6 pt-8 pb-5 text-center border-b border-slate-100 bg-slate-50/50">
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 inline-block mb-4">
                            <img src="/logo.png" alt="JYNM" className="h-8 w-auto" onError={e => e.currentTarget.style.display='none'} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight font-outfit">
                            Create Account
                        </h1>
                        <p className="text-slate-500 text-[13px] mt-1 font-medium">Join JYNM to find parts and connect with top junkyards.</p>
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
                                className={`flex-1 py-2.5 rounded-xl text-[13.5px] font-bold transition-all ${role === r.id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold flex items-start gap-2.5">
                                <svg className="w-[18px] h-[18px] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="su-name" className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Name</label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </span>
                                        <input
                                            id="su-name"
                                            type="text" name="name" value={formData.name} onChange={handleChange} required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="su-phone" className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Phone Number</label>
                                    <div className="flex gap-1.5">
                                        <div className="flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-3 text-[13px] font-medium text-slate-700 shrink-0">
                                            <span className="mr-1">🇺🇸</span>
                                            <span>+1</span>
                                        </div>
                                        <input
                                            id="su-phone"
                                            type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                                            className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                            placeholder="999-999-9999"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="su-email" className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email</label>
                                <input
                                    id="su-email"
                                    type="email" name="email" value={formData.email} onChange={handleChange} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="su-pw" className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Password</label>
                                    <PasswordInput
                                        id="su-pw"
                                        name="password" required value={formData.password} onChange={handleChange}
                                        className={`w-full bg-slate-50 border ${formData.password && !pwOk ? 'border-red-400 focus:border-red-500' : 'border-slate-200'} rounded-xl px-3 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all`}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="su-pw2" className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Confirm</label>
                                    <PasswordInput
                                        id="su-pw2"
                                        name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}
                                        className={`w-full bg-slate-50 border ${formData.confirmPassword && !pwMatch ? 'border-red-400 focus:border-red-500' : 'border-slate-200'} rounded-xl px-3 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all`}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Password validators */}
                            <div className="flex gap-4 pt-1">
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-[14px] h-[14px] rounded-full flex items-center justify-center ${pwOk ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className={`text-[11.5px] font-bold ${pwOk ? 'text-emerald-700' : 'text-slate-400'}`}>8+ characters</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-[14px] h-[14px] rounded-full flex items-center justify-center ${pwMatch ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className={`text-[11.5px] font-bold ${pwMatch ? 'text-emerald-700' : 'text-slate-400'}`}>Passwords match</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 mt-4">
                                <input
                                    type="checkbox"
                                    name="agreed"
                                    id="su-terms"
                                    checked={formData.agreed}
                                    onChange={handleChange}
                                    className="w-4 h-4 mt-0.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <label htmlFor="su-terms" className="text-[13px] text-slate-600 font-medium cursor-pointer select-none">
                                    I agree to the <Link to="/terms" className="text-blue-600 font-bold hover:underline">Terms & Conditions</Link> & <Link to="/privacy" className="text-blue-600 font-bold hover:underline">Privacy Policy</Link>
                                </label>
                            </div>

                            <div className="mt-4">
                                <TurnstileCaptcha
                                    onVerify={(token) => setTurnstileToken(token)}
                                    onError={(err) => setError(err)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98] transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] disabled:opacity-70 flex items-center justify-center gap-2 text-[15px]"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                        Creating Account…
                                    </>
                                ) : (
                                    <>
                                        {role === 'buyer' ? 'Complete Registration' : 'Register as Vendor'}
                                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Sign In Link */}
                    <div className="text-center py-5 bg-slate-50 border-t border-slate-100">
                        <p className="text-[13px] text-slate-500 font-medium">
                            Already have an account?{' '}
                            <Link to={`/signin?returnUrl=${encodeURIComponent(returnUrl)}`} className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
