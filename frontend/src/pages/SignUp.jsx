import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import PasswordInput from '../components/PasswordInput';
import TurnstileCaptcha from '../components/TurnstileCaptcha';

export default function SignUp() {
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/';
    const navigate = useNavigate();
    const { register, isAuthenticated } = useContext(AuthContext);

    const [role, setRole] = useState('buyer'); // 'buyer' or 'vendor'
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
        setFormData(prev => ({
            ...prev,
            [e.target.name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
            setError('Please fill in all fields.');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (!formData.agreed) {
            setError('You must agree to the Terms & Conditions.');
            return;
        }

        if (!turnstileToken) {
            setError('Challenge verification failed. Please try again.');
            return;
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
            // Registration automatically logs in or navigates in AuthContext
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.error || err.response?.data?.email?.[0] || err.message || 'Failed to create account. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-inter">
            <SEO title="Sign Up - Create Your JYNM Account" description="Create a free account to list your junkyard, manage leads, and connect with customers." noindex={true} />
            <Navbar />

            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-[1000px] flex flex-col gap-4">
                    <div className="w-full flex rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 bg-white min-h-[auto]">
                    
                    {/* Left Panel (Blue) */}
                    <div className="hidden lg:flex flex-col justify-center w-[400px] bg-[#2563eb] shrink-0 p-12 text-center relative overflow-hidden">
                        <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-70"></div>
                        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
                        
                        <div className="relative z-10 w-48 h-20 bg-white mx-auto mb-10 flex items-center justify-center rounded-sm shadow-xl">
                             <h2 className="text-3xl font-black text-blue-600 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>JYNM</h2>
                        </div>
                        <h2 className="relative z-10 text-[26px] font-black text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Join JYNM Today!</h2>
                        <p className="relative z-10 text-white/90 font-medium text-sm leading-relaxed">
                            Create your free account to access nationwide parts, manage leads, and connect directly with trusted vendors.
                        </p>
                    </div>

                    {/* Right Panel (Form) */}
                    <div className="flex-1 p-5 sm:p-8 lg:p-12 xl:px-16 flex flex-col justify-center">
                        <div className="lg:hidden text-center mb-6">
                            <h2 className="text-[28px] font-black tracking-tight text-slate-800 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Join <span className="text-blue-600">JYNM</span>
                            </h2>
                            <p className="text-slate-500 text-[13px] font-medium">Create your free account</p>
                        </div>

                        <div className="hidden lg:block mb-8 text-center">
                            <h2 className="text-[28px] font-black tracking-tight text-slate-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Create <span className="text-blue-600">Account</span>
                            </h2>
                            <p className="text-slate-500 text-[13px] font-medium mt-1">Fill in the details below to get started</p>
                        </div>

                        {/* Role Tabs */}
                        <div className="flex w-full mb-6 border-b border-slate-200">
                            <button 
                                onClick={() => setRole('buyer')}
                                className={`flex-1 pb-3 text-[14px] font-bold text-center transition-colors relative ${role === 'buyer' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                I'm a Buyer
                                {role === 'buyer' && <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-blue-600 rounded-t-full" />}
                            </button>
                            <button 
                                onClick={() => setRole('vendor')}
                                className={`flex-1 pb-3 text-[14px] font-bold text-center transition-colors relative ${role === 'vendor' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                I'm a Vendor
                                {role === 'vendor' && <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-blue-600 rounded-t-full" />}
                            </button>
                        </div>

                        {error && (
                            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[13px] flex items-center gap-2">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                <span className="font-semibold">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Full Name</label>
                                    <input
                                        type="text" name="name" value={formData.name} onChange={handleChange} required
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 placeholder-[#94a3b8] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[14px] font-medium transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Phone Number</label>
                                    <input
                                        type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 placeholder-[#94a3b8] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[14px] font-medium transition-colors"
                                        placeholder="(555) 000-0000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Email Address</label>
                                <input
                                    type="email" name="email" value={formData.email} onChange={handleChange} required
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 placeholder-[#94a3b8] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[14px] font-medium transition-colors"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Password</label>
                                <PasswordInput
                                    name="password" required
                                    value={formData.password} onChange={handleChange}
                                    className={`w-full bg-white border ${formData.password && formData.password.length < 8 ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'} rounded-lg px-4 py-3 placeholder-[#94a3b8] focus:outline-none focus:ring-1 text-[14px] font-medium transition-colors`}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Retype Password</label>
                                <PasswordInput
                                    name="confirmPassword" required
                                    value={formData.confirmPassword} onChange={handleChange}
                                    className={`w-full bg-white border ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'} rounded-lg px-4 py-3 placeholder-[#94a3b8] focus:outline-none focus:ring-1 text-[14px] font-medium transition-colors`}
                                    placeholder="••••••••"
                                />
                            </div>

                            {/* Real-time Password Validation */}
                            <div className="mt-2 space-y-1.5 px-0.5">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${formData.password.length >= 8 ? 'bg-blue-500' : 'bg-slate-200'}`}>
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className={`text-[11px] font-medium transition-colors ${formData.password.length >= 8 ? 'text-blue-600' : 'text-slate-500'}`}>At least 8 characters</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${formData.password && formData.confirmPassword && formData.password === formData.confirmPassword ? 'bg-blue-500' : 'bg-slate-200'}`}>
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className={`text-[11px] font-medium transition-colors ${formData.password && formData.confirmPassword && formData.password === formData.confirmPassword ? 'text-blue-600' : 'text-slate-500'}`}>Passwords match</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <input 
                                    type="checkbox" 
                                    name="agreed"
                                    checked={formData.agreed}
                                    onChange={handleChange}
                                    id="agree-terms"
                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" 
                                />
                                <label htmlFor="agree-terms" className="text-[13px] text-slate-600 font-medium">
                                    I agree to the <Link to="/terms" className="text-blue-600 hover:underline hover:text-blue-700">Terms & Conditions</Link>
                                </label>
                            </div>

                            <div className="pt-2">
                                <TurnstileCaptcha 
                                    onVerify={(token) => setTurnstileToken(token)}
                                    onError={(err) => setError(err)}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-[#cbd5e1] hover:bg-[#94a3b8] text-slate-800 font-bold rounded-xl px-4 py-4 transition-colors disabled:opacity-50 mt-4 shadow-sm text-[15px] flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                                        Creating...
                                    </>
                                ) : 'Create Account'}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-[13px] font-medium text-slate-500">
                            Already have an account? <Link to="/signin" className="text-blue-600 font-bold hover:underline">Sign In</Link>
                        </div>
                    </div>
                </div>

                {/* Mobile & Desktop Feature Strip */}
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 px-3 py-1 w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <div className="text-[11px] font-bold text-slate-700 leading-tight">Search Millions<br/>of Parts</div>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-1 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                        </div>
                        <div className="text-[11px] font-bold text-slate-700 leading-tight">Save Listings<br/>Easily</div>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-1 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <div className="text-[11px] font-bold text-slate-700 leading-tight">Contact Yards<br/>Directly</div>
                    </div>
                </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
