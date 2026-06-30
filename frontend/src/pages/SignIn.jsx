import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import PasswordInput from '../components/PasswordInput';

export default function SignIn() {
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/';
    const navigate = useNavigate();
    const { login, isAuthenticated, user } = useContext(AuthContext);

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user) {
            let redirectPath = returnUrl;
            if (user.is_superuser || user.user_type === 'admin') redirectPath = '/admin-portal/dashboard';
            else if (user.user_type === 'vendor') redirectPath = '/vendor/dashboard';
            navigate(redirectPath);
        }
    }, [isAuthenticated, user, navigate, returnUrl]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(formData.email, formData.password);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to sign in. Please check your credentials.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-inter">
            <SEO title="Sign In - JYNM Auto Parts Hub" description="Sign in to your JYNM account to list your junkyard or manage your profile." noindex={true} />
            <Navbar />

            <div className="flex-1 flex items-center justify-center p-4 py-12">
                <div className="w-full max-w-[900px] flex rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 bg-white min-h-[500px]">
                    
                    {/* Left Panel (Blue) */}
                    <div className="hidden md:flex flex-col justify-center w-[400px] bg-[#2563eb] shrink-0 p-12 text-center relative overflow-hidden">
                        <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-70"></div>
                        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
                        
                        <div className="relative z-10 w-48 h-20 bg-white mx-auto mb-10 flex items-center justify-center rounded-sm">
                            <h2 className="text-3xl font-black text-blue-600 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>JYNM</h2>
                        </div>
                        <h2 className="relative z-10 text-[26px] font-black text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Welcome Back!</h2>
                        <p className="relative z-10 text-white/90 font-medium text-sm">Sign in to access your account</p>
                    </div>

                    {/* Right Panel (Form) */}
                    <div className="flex-1 p-8 md:p-12 lg:px-16 flex flex-col justify-center">
                        <div className="md:hidden text-center mb-8">
                            <h2 className="text-[28px] font-black tracking-tight text-slate-800 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Welcome <span className="text-blue-600">Back</span>
                            </h2>
                            <p className="text-slate-500 text-[13px] font-medium">Sign in to your account</p>
                        </div>

                        <div className="hidden md:block mb-8 text-center">
                            <h2 className="text-[28px] font-black tracking-tight text-slate-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Welcome <span className="text-blue-600">Back</span>
                            </h2>
                            <p className="text-slate-500 text-[13px] font-medium mt-1">Sign in to your account</p>
                        </div>

                        {error && (
                            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[13px] flex items-center gap-2">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                <span className="font-semibold">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="signin-email" className="block text-[13px] font-bold text-slate-700 mb-2">Email Address</label>
                                <input
                                    id="signin-email" name="email" type="email" required
                                    value={formData.email} onChange={handleChange}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-[14px] placeholder-[#94a3b8] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="signin-password" className="block text-[13px] font-bold text-slate-700 mb-2">Password</label>
                                <PasswordInput
                                    id="signin-password" name="password" required
                                    value={formData.password} onChange={handleChange}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-[14px] placeholder-[#94a3b8] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="flex justify-end mt-1">
                                <Link to="/forgot-password" className="text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot Password?</Link>
                            </div>

                            <button
                                id="signin-submit" type="submit" disabled={loading}
                                className="w-full mt-2 bg-[#cbd5e1] hover:bg-[#94a3b8] text-slate-800 font-bold py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                                        Signing in...
                                    </>
                                ) : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-[13px] font-medium text-slate-500">
                            Don't have an account? <Link to={`/signup?returnUrl=${encodeURIComponent(returnUrl)}`} className="text-blue-600 font-bold hover:underline">Sign Up</Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
