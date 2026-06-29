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
        <>
            <SEO title="Sign In - JYNM Auto Parts Hub" description="Sign in to your JYNM account to list your junkyard or manage your profile." noindex={true} />
            <Navbar />

            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center py-20 px-4">
                <div className="w-full max-w-md">
                    {/* Brand Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 mb-5">
                            <span className="text-blue-600 font-black text-2xl" style={{ fontFamily: "'Outfit', sans-serif" }}>JYNM</span>
                            <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded uppercase tracking-wider">Auto Parts</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Welcome Back</h1>
                        <p className="text-slate-500 font-medium">Sign in to your JYNM account to continue.</p>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_40px_rgb(0,0,0,0.06)] p-8">
                        {error && (
                            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="signin-email" className="block text-[13px] font-bold text-slate-700 mb-2">Email Address</label>
                                <input
                                    id="signin-email" name="email" type="email" required
                                    value={formData.email} onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-[15px] placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="signin-password" className="block text-[13px] font-bold text-slate-700">Password</label>
                                    <Link to="/forgot-password" className="text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</Link>
                                </div>
                                <PasswordInput
                                    id="signin-password" name="password" required
                                    value={formData.password} onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-[15px] placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                id="signin-submit" type="submit" disabled={loading}
                                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl shadow-[0_8px_20px_rgb(37,99,235,0.3)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                                        Signing in...
                                    </>
                                ) : 'Sign In'}
                            </button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-slate-100" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-3 bg-white text-[13px] font-medium text-slate-400">New to JYNM?</span>
                            </div>
                        </div>

                        <Link
                            to={`/signup?returnUrl=${encodeURIComponent(returnUrl)}`}
                            className="flex w-full justify-center items-center py-3.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold transition-all duration-200 text-[15px]"
                        >
                            Create Free Account
                        </Link>
                    </div>

                    <div className="mt-6 text-center">
                        <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                            Back to main site
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
