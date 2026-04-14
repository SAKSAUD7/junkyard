import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVendorAuth } from '../../contexts/VendorAuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PasswordInput from '../../components/PasswordInput';

const VendorLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useVendorAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password);
        if (result.success) {
            navigate('/vendor/dashboard');
        } else {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <div className="flex min-h-screen w-full bg-[#030712] relative overflow-hidden">
                {/* LEFT SIDE: Cinematic 3D Visual (Absolute Background on Mobile, Split Pane on Desktop) */}
                <div className="absolute inset-0 z-0 lg:relative lg:flex lg:w-1/2 bg-black flex items-center justify-center border-r border-orange-500/10">
                    {/* Ambient glows behind the image */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-500/15 rounded-full blur-[120px] pointer-events-none" />
                    
                    <img
                        src="/3d/auth-vendor.png"
                        alt="JYNM Vendor Portal Access"
                        className="absolute inset-0 w-full h-full object-cover lg:opacity-90 opacity-40 transition-opacity duration-1000 mix-blend-screen"
                    />
                    
                    {/* Overlay gradient to blend into center */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712]/50 lg:bg-gradient-to-r lg:from-black/20 lg:via-transparent lg:to-[#030712]" />
                    <div className="hidden lg:block absolute inset-0 bg-gradient-to-b from-[#030712] via-transparent to-[#030712]" />
                    
                    {/* Minimalist floating stats/brand over image (hidden on mobile to prevent clutter) */}
                    <div className="hidden lg:block absolute bottom-12 left-12 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black/60 backdrop-blur-md border border-orange-500/20 shadow-2xl">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_#ea580c]"></span>
                            <span className="text-orange-100 text-sm font-bold tracking-widest uppercase font-mono">Secure Access Gateway</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Auth Card */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-16 relative z-10">
                    <div className="w-full max-w-md animate-fade-in-up delay-100">
                        {/* Title Block outside the card for premium feel */}
                        <div className="mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 bg-gradient-to-br from-blue-900/40 to-blue-600/10 border border-blue-500/20 shadow-[0_0_30px_rgba(37,99,235,0.15)]">
                                <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                                    <path d="M2 17l10 5 10-5" stroke="var(--neon-orange)" strokeWidth="1.5" strokeLinejoin="round"/>
                                    <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5"/>
                                </svg>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-white font-outfit tracking-tight mb-2">Vendor Portal</h1>
                            <p className="text-slate-400 text-sm sm:text-base">Sign in to manage and skyrocket your salvage operations.</p>
                        </div>

                        {/* Card */}
                        <div className="rounded-2xl overflow-hidden bg-[#0f172a]/80 backdrop-blur-3xl border border-slate-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
                            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />
                            
                            <div className="p-6 sm:p-8">
                                {/* Error Message */}
                                {error && (
                                    <div className="mb-6 p-4 rounded-lg animate-fade-in bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Demo Credentials */}
                                <div className="mb-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                    <div className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-2 font-mono flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                        Demo Access
                                    </div>
                                    <div className="font-mono text-[0.8rem] text-slate-300 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                                        <span className="text-slate-500">Email:</span> vendor@test.com
                                        <span className="text-slate-500">Pass:</span> vendor123
                                    </div>
                                </div>

                                {/* Login Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className="block text-slate-400 text-xs font-bold tracking-wider uppercase mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            className="w-full bg-[#0a0f18] border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all font-mono text-sm"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="vendor@example.com"
                                            autoComplete="email"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-slate-400 text-xs font-bold tracking-wider uppercase mb-2">
                                            Password
                                        </label>
                                        <PasswordInput
                                            id="password"
                                            className="w-full bg-[#0a0f18] border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all font-mono text-sm"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                        />
                                        <div className="flex justify-end mt-2">
                                            <Link
                                                to="/vendor/forgot-password"
                                                className="text-orange-400 hover:text-orange-300 text-xs font-mono transition-colors"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full mt-6 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Unlocking...
                                            </>
                                        ) : (
                                            <>
                                                Initialize Access
                                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Back block */}
                        <div className="mt-8 text-center text-sm font-medium text-slate-500">
                            <Link to="/" className="hover:text-white transition-colors flex items-center justify-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Return to Main Site
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default VendorLogin;
