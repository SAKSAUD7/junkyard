import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useVendorAuth } from '../../contexts/VendorAuthContext';
import { useCMS } from '../../hooks/useCMS';
import PasswordInput from '../../components/PasswordInput';
import SEO from '../../components/SEO';

const VendorLogin = () => {
    const { get } = useCMS('vendor_portal');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [failCount, setFailCount] = useState(0);

    const { login } = useVendorAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectAfter = searchParams.get('redirect') || '/vendor/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (failCount >= 5) { setError('Too many failed attempts. Please wait.'); return; }
        setError(''); setLoading(true);
        const result = await login(email, password);
        if (result.success) {
            navigate(decodeURIComponent(redirectAfter));
        } else {
            setFailCount(c => c + 1);
            setError('Invalid credentials. Please check your email and password.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center font-inter bg-slate-900">
            <SEO title="Vendor Login – JYNM" description="Sign in to your JYNM Vendor account." noindex={true} />

            {/* Backdrop Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={get('hero', 'background_image') || "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1920&auto=format&fit=crop"}
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
            <div className="relative z-10 w-full max-w-[380px] mx-4 rounded-3xl overflow-hidden shadow-2xl bg-transparent mt-8" style={{ maxHeight: '95vh', overflowY: 'auto' }}>
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
                    <div className="flex flex-col items-center pt-8 pb-6 px-6 text-center">
                        <img
                            src="/logo.png"
                            alt="JYNM"
                            className="h-16 w-auto object-contain mb-4 drop-shadow-2xl"
                            onError={e => e.currentTarget.style.display = 'none'}
                        />
                        <h1 className="text-2xl font-black text-white leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Vendor <span className="text-yellow-400">Sign In</span>
                        </h1>
                        <p className="text-white/70 text-[13px] mt-1.5 font-medium leading-snug">
                            Sign in to access your yard listing tools and manage your inventory.
                        </p>
                    </div>

                    {/* White Form Card */}
                    <div className="bg-white mx-3 mb-3 rounded-2xl px-5 py-5 shadow-2xl">
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[12px] font-semibold text-center">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="vendor@example.com"
                                        required
                                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Password</label>
                                    <Link to="/vendor/forgot-password" className="text-[12px] text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                                        Forgot Password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </span>
                                    <PasswordInput
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-9 py-2.5 border border-slate-200 rounded-xl text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!email || !password || loading}
                                className="w-full py-3 rounded-xl font-black text-[15px] bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
                                Sign In <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>

                            <p className="text-center text-[13px] text-slate-500 font-medium pb-2">
                                New to JYNM?{' '}
                                <Link to="/vendor/signup" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                                    Create Free Vendor Account
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorLogin;
