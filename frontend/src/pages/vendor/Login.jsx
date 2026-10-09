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
        <div className="min-h-screen w-full flex font-inter overflow-hidden">
            <SEO title="Vendor Login – JYNM" description="Sign in to your JYNM Vendor account." noindex={true} />

            {/* ===== LEFT PANEL — dark junkyard-worker image (desktop only) ===== */}
            <div className="hidden lg:flex flex-col justify-between flex-1 relative overflow-hidden p-10">
                {/* Background image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1400&auto=format&fit=crop"
                        alt="Vendor at junkyard"
                        className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/65 to-slate-800/85" />
                </div>

                {/* Top section */}
                <div className="relative z-10">
                    <Link to="/" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-[13px] font-semibold mb-12 group bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
                        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back Home
                    </Link>
                    <div className="inline-flex items-center gap-2 bg-blue-500/25 border border-blue-400/40 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase text-blue-300 mb-5">
                        🏪 Yard Partner Portal
                    </div>
                    <h1 className="text-4xl font-black leading-tight tracking-tight text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Vendor <span className="text-blue-400">Sign In</span>
                    </h1>
                    <p className="text-white/70 text-[15px] mt-4 max-w-sm leading-relaxed font-medium">
                        Sign in to access your yard listing tools and manage your inventory.
                    </p>
                </div>

                {/* Bottom feature cards */}
                <div className="relative z-10 space-y-4">
                    {[
                        { icon: '📦', title: 'Manage Your Inventory', desc: 'Add, edit and manage your parts & listings.' },
                        { icon: '📈', title: 'Receive More Leads', desc: 'Real-time buyer notifications.' },
                        { icon: '⚡', title: 'Grow Your Business', desc: 'Boost visibility & increase yard revenue.' },
                    ].map(f => (
                        <div key={f.title} className="flex items-center gap-4 bg-white/10 p-3.5 rounded-2xl border border-white/15 backdrop-blur-sm hover:bg-white/15 transition-colors cursor-default">
                            <div className="w-11 h-11 rounded-xl bg-blue-500/25 border border-blue-400/30 flex items-center justify-center text-xl shrink-0">{f.icon}</div>
                            <div>
                                <div className="text-[14px] font-bold text-white">{f.title}</div>
                                <div className="text-[12px] text-white/60 font-medium">{f.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== RIGHT PANEL — white form ===== */}
            <div className="w-full lg:w-[460px] shrink-0 flex flex-col items-center justify-center relative bg-slate-900 lg:bg-white min-h-screen">
                {/* Mobile background */}
                <div className="absolute inset-0 z-0 lg:hidden block">
                    <img src="https://images.unsplash.com/photo-1549317336-206569e8475c?auto=format&fit=crop&q=80&w=1400" alt="Vendor Mobile Background" className="w-full h-full object-cover object-center opacity-70" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-800/80" />
                </div>

                {/* Mobile — back link */}
                <div className="absolute top-4 left-4 sm:top-5 sm:left-5 lg:hidden z-20">
                    <Link to="/" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-[13px] font-semibold bg-white/10 backdrop-blur border border-white/20 px-3 py-2 rounded-full shadow-sm hover:bg-white/20 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back Home
                    </Link>
                </div>

                <div className="w-full max-w-[420px] px-5 sm:px-6 py-6 sm:py-10 relative z-10 bg-white lg:bg-transparent rounded-3xl lg:rounded-none shadow-2xl lg:shadow-none m-4 mt-24 sm:mt-16 md:m-0 my-auto lg:my-0 lg:mx-0">
                    {/* Logo */}
                    <div className="text-center mb-6">
                        <Link to="/" className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 inline-block mb-4">
                            <img src="/logo.png" alt="JYNM" className="h-10 w-auto" onError={e => e.currentTarget.style.display = 'none'} />
                        </Link>
                        {/* Mobile portal badge */}
                        <div className="lg:hidden inline-flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-700 mb-3 mx-auto">
                            🏪 Yard Partner Portal
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Vendor <span className="text-blue-600">Sign In</span>
                        </h2>
                        <p className="text-slate-500 text-[13px] mt-1 font-medium">
                            Sign in to access your yard listing tools and manage your inventory.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold flex items-start gap-2.5">
                            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="vl-email" className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </span>
                                <input id="vl-email" type="email" required value={email}
                                    onChange={e => { setEmail(e.target.value); setError(''); }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="vendor@example.com" autoComplete="email" />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label htmlFor="vl-pw" className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Password</label>
                                <Link to="/vendor/forgot-password" className="text-[12px] text-blue-600 font-bold hover:text-blue-700 transition-all">Forgot password?</Link>
                            </div>
                            <PasswordInput id="vl-pw" required value={password}
                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                placeholder="••••••••••" autoComplete="current-password" />
                        </div>

                        <button type="submit" disabled={loading || failCount >= 5}
                            className="w-full mt-1 py-3.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(37,99,235,0.35)] disabled:opacity-60 flex items-center justify-center gap-2 text-[15px]">
                            {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                            {loading ? 'Signing in…' : 'Sign In →'}
                        </button>
                    </form>

                    {/* Feature strip */}
                    <div className="flex items-center justify-around mt-8 pt-6 border-t border-slate-100">
                        {[{ icon: '📦', label: 'Manage Inventory' }, { icon: '📈', label: 'Receive Leads' }, { icon: '⚡', label: 'Grow Business' }].map(f => (
                            <div key={f.label} className="flex flex-col items-center gap-1.5 text-center flex-1">
                                <span className="text-2xl">{f.icon}</span>
                                <span className="text-[10px] font-bold text-slate-500 leading-tight">{f.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Sign Up link */}
                    <p className="text-center text-[13px] text-slate-500 font-medium mt-5">
                        New to JYNM?{' '}
                        <Link to={`/vendor/signup?redirect=${encodeURIComponent(redirectAfter)}`} className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                            Create Free Vendor Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VendorLogin;
