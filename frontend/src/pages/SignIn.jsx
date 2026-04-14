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
            <SEO
                title="Sign In - JYNM Auto Parts Hub"
                description="Sign in to your JYNM account to list your junkyard or manage your profile."
                noindex={true}
            />
            <Navbar />

            <div className="flex min-h-screen w-full bg-[#030712] relative overflow-hidden">
                {/* LEFT SIDE: Cinematic 3D Visual (Absolute Background on Mobile, Split Pane on Desktop) */}
                <div className="absolute inset-0 z-0 lg:relative lg:flex lg:w-1/2 bg-black flex items-center justify-center border-r border-blue-500/10">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-900/40 rounded-full blur-[120px] pointer-events-none" />
                    
                    <img
                        src="/3d/auth-signin.png"
                        alt="JYNM Authentication"
                        className="absolute inset-0 w-full h-full object-cover lg:opacity-80 opacity-40 mix-blend-screen"
                        style={{ filter: 'contrast(1.1) brightness(0.9) drop-shadow(0 0 20px rgba(37,99,235,0.3))' }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712]/50 lg:bg-gradient-to-r lg:from-black/20 lg:via-transparent lg:to-[#030712]" />
                    <div className="hidden lg:block absolute inset-0 bg-gradient-to-b from-[#030712] via-transparent to-[#030712]" />
                    
                    <div className="hidden lg:block absolute bottom-12 left-12 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black/60 backdrop-blur-md border border-blue-500/20 shadow-2xl">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]"></span>
                            <span className="text-blue-100 text-sm font-bold tracking-widest uppercase font-mono">Secure Connection Established</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Auth Card */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-16 relative z-10">
                    <div className="w-full max-w-md animate-fade-in-up delay-100">
                        {/* Title Block outside the card */}
                        <div className="mb-8">
                            <h1 className="text-3xl sm:text-4xl font-black text-white font-outfit tracking-tight mb-2">Welcome Back</h1>
                            <p className="text-slate-400 text-sm sm:text-base">Sign in to your JYNM account to continue.</p>
                        </div>

                        {/* Card */}
                        <div className="rounded-2xl overflow-hidden bg-[#0f172a]/80 backdrop-blur-3xl border border-slate-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
                            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
                            
                            <div className="p-6 sm:p-8">
                                {error && (
                                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="signin-email" className="block text-slate-400 text-xs font-bold tracking-wider uppercase mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            id="signin-email"
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-[#0a0f18] border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono text-sm"
                                            placeholder="you@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="signin-password" className="block text-slate-400 text-xs font-bold tracking-wider uppercase mb-2">
                                            Password
                                        </label>
                                        <PasswordInput
                                            id="signin-password"
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full bg-[#0a0f18] border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono text-sm"
                                            placeholder="••••••••"
                                        />
                                        <div className="flex justify-end mt-2">
                                            <Link
                                                to="/forgot-password"
                                                className="text-blue-400 hover:text-blue-300 text-xs font-mono transition-colors"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                    </div>

                                    <button
                                        id="signin-submit"
                                        type="submit"
                                        disabled={loading}
                                        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Signing in...
                                            </>
                                        ) : 'Sign In'}
                                    </button>
                                </form>

                                <div className="relative my-7">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-slate-800" />
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="px-3 bg-[#0f172a] text-slate-500 text-xs font-mono">New to JYNM?</span>
                                    </div>
                                </div>

                                <Link
                                    to={`/signup?returnUrl=${encodeURIComponent(returnUrl)}`}
                                    className="flex w-full justify-center items-center py-3.5 px-4 rounded-xl border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 font-bold transition-all duration-200"
                                >
                                    Create Free Account
                                </Link>
                            </div>
                        </div>

                        {/* Back block */}
                        <div className="mt-8 text-center text-sm font-medium text-slate-500">
                            <Link to="/" className="hover:text-white transition-colors flex items-center justify-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Back to main site
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
