import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useVendorAuth } from '../../contexts/VendorAuthContext';
import { useCMS } from '../../hooks/useCMS';
import PasswordInput from '../../components/PasswordInput';
import SEO from '../../components/SEO';

// Automotive background — salvage yard operations (Unsplash free-use)
const BG = 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1400&q=75';

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
        <div className="min-h-screen flex flex-col relative font-inter overflow-hidden">
            <SEO title="Vendor Login – JYNM" description="Sign in to your JYNM Vendor account." noindex={true} />

            {/* Automotive Background */}
            <div className="absolute inset-0 z-0">
                <img src={BG} alt="" aria-hidden="true" className="w-full h-full object-cover object-right" loading="eager" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/90 via-[#0d1f3c]/80 to-[#0a1628]/40" />
            </div>

            <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8 min-h-screen">
                <div className="w-full max-w-[920px] flex items-stretch gap-0">

                    {/* Left branding — desktop only */}
                    <div className="hidden lg:flex flex-col justify-between flex-1 p-10 text-white">
                        <div>
                            <Link to="/" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-semibold mb-10">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                Back to JYNM
                            </Link>
                            <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-[11px] font-bold tracking-widest uppercase text-blue-200 mb-5">
                                🏪 Yard Partner Portal
                            </div>
                            <h1 className="text-4xl font-black leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Vendor <span className="text-[#4e9dff]">Sign In</span>
                            </h1>
                            <p className="text-white/65 text-base mt-3 max-w-sm leading-relaxed">
                                Sign in to manage your yard listing and inventory.
                            </p>
                        </div>
                        <div className="space-y-4 mt-10">
                            {[
                                { icon: '📦', title: 'Manage Inventory', desc: 'Add, edit and manage your parts & listings.' },
                                { icon: '📈', title: 'Receive More Leads', desc: 'Real-time buyer notifications.' },
                                { icon: '⚡', title: 'Grow Your Business', desc: 'Boost visibility & increase yard revenue.' },
                            ].map(f => (
                                <div key={f.title} className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shrink-0">{f.icon}</div>
                                    <div>
                                        <div className="text-[13px] font-bold text-white">{f.title}</div>
                                        <div className="text-[11px] text-white/55">{f.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — Auth Card */}
                    <div className="w-full max-w-[400px] lg:w-[400px] shrink-0">
                        <div className="bg-white rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col">

                            <div className="px-7 pt-8 pb-5 border-b border-slate-100 text-center">
                                <div className="lg:hidden mb-4 text-left">
                                    <Link to="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-semibold">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        Back Home
                                    </Link>
                                </div>
                                <Link to="/" className="inline-block mb-3">
                                    <img src="/logo.png" alt="JYNM" className="h-10 w-auto mx-auto" onError={e => e.currentTarget.style.display='none'} />
                                </Link>
                                <div className="lg:hidden inline-flex items-center gap-1 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-3">
                                    🏪 Yard Partner Portal
                                </div>
                                <h2 className="text-xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}
                                    dangerouslySetInnerHTML={{ __html: get('login', 'form_heading', 'Vendor Sign In') }} />
                                <p className="text-slate-500 text-sm mt-1"
                                    dangerouslySetInnerHTML={{ __html: get('login', 'form_subtext', 'Sign in to manage your yard listing and inventory.') }} />
                            </div>

                            <div className="px-7 py-6">
                                {error && (
                                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold flex items-center gap-2">
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                        {error}
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="vl-email" className="block text-[13px] font-bold text-slate-700 mb-1.5">Email Address</label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            </span>
                                            <input
                                                id="vl-email" type="email" required value={email}
                                                onChange={e => { setEmail(e.target.value); setError(''); }}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                                placeholder="vendor@example.com" autoComplete="email"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label htmlFor="vl-pw" className="text-[13px] font-bold text-slate-700">Password</label>
                                            <Link to="/vendor/forgot-password" className="text-[12px] text-blue-600 font-semibold hover:underline">Forgot password?</Link>
                                        </div>
                                        <PasswordInput
                                            id="vl-pw" required value={password}
                                            onChange={e => { setPassword(e.target.value); setError(''); }}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                            placeholder="••••••••" autoComplete="current-password"
                                        />
                                    </div>
                                    <button
                                        type="submit" disabled={loading || failCount >= 5}
                                        className="w-full py-3.5 bg-[#1a56ff] hover:bg-[#1648d0] text-white font-bold rounded-xl transition-all shadow-[0_6px_20px_rgba(26,86,255,0.3)] disabled:opacity-60 flex items-center justify-center gap-2 text-[15px] active:scale-[0.98]"
                                    >
                                        {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                        {loading ? 'Signing in…' : get('login', 'submit_btn', 'Sign In →')}
                                    </button>
                                </form>
                                <p className="mt-5 text-center text-sm text-slate-500">
                                    New to JYNM?{' '}
                                    <Link to={`/vendor/signup?redirect=${encodeURIComponent(redirectAfter)}`} className="font-bold text-blue-600 hover:underline">
                                        Create Free Vendor Account
                                    </Link>
                                </p>
                            </div>

                            {/* Feature strip */}
                            <div className="flex items-center justify-around px-4 py-3 bg-slate-50 border-t border-slate-100">
                                {[{ icon: '📦', label: 'Manage Inventory' }, { icon: '📈', label: 'Receive Leads' }, { icon: '⚡', label: 'Grow Business' }].map(f => (
                                    <div key={f.label} className="flex flex-col items-center gap-1 text-center flex-1">
                                        <span className="text-lg">{f.icon}</span>
                                        <span className="text-[10px] font-bold text-slate-500">{f.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorLogin;
