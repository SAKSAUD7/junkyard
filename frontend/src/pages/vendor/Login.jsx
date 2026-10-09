import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useVendorAuth } from '../../contexts/VendorAuthContext';
import { useCMS } from '../../hooks/useCMS';
import PasswordInput from '../../components/PasswordInput';
import SEO from '../../components/SEO';

const BG_IMAGE_URL = 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=2000&auto=format&fit=crop';

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
        <div className="min-h-screen w-full relative flex font-inter items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 overflow-hidden">
            <SEO title="Vendor Login – JYNM" description="Sign in to your JYNM Vendor account." noindex={true} />

            {/* Background Image - Bright Luxury Car */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1620892019318-7b243ebd7f7e?q=80&w=2000&auto=format&fit=crop"
                    alt="Luxury Auto Background"
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-slate-50/90 to-white/95"></div>
            </div>

            <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8 min-h-screen w-full">
                <div className="w-full max-w-[920px] flex items-stretch gap-0 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden relative">

                    {/* Left branding — desktop only */}
                    <div className="hidden lg:flex flex-col justify-between flex-1 p-10 text-slate-800 bg-slate-50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white opacity-90 z-0"></div>
                        <div className="relative z-10">
                            <Link to="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors text-[13px] font-semibold mb-10 group bg-white/80 px-4 py-2 rounded-full backdrop-blur-md border border-slate-200 shadow-sm">
                                <svg className="w-4 h-4 transform group-Hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                Back to JYNM
                            </Link>
                            <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase text-blue-300 mb-6 backdrop-blur-md shadow-lg shadow-blue-900/20">
                                🏪 Yard Partner Portal
                            </div>
                            <h1 className="text-4xl font-black leading-tight tracking-tight shadow-md drop-shadow-xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Vendor <span className="text-blue-400">Sign In</span>
                            </h1>
                            <p className="text-white/80 text-base mt-4 max-w-sm leading-relaxed font-medium text-[15px]">
                                Sign in to manage your yard listing and inventory.
                            </p>
                        </div>
                        <div className="space-y-5 mt-10">
                            {[
                                { icon: '📦', title: 'Manage Inventory', desc: 'Add, edit and manage your parts & listings.' },
                                { icon: '📈', title: 'Receive More Leads', desc: 'Real-time buyer notifications.' },
                                { icon: '⚡', title: 'Grow Your Business', desc: 'Boost visibility & increase yard revenue.' },
                            ].map(f => (
                                <div key={f.title} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
                                    <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-xl shrink-0 drop-shadow-md">{f.icon}</div>
                                    <div>
                                        <div className="text-[14px] font-bold text-white">{f.title}</div>
                                        <div className="text-[12px] text-white/70 font-medium">{f.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — Auth Card */}
                    <div className="w-full max-w-[440px] lg:w-[440px] shrink-0 flex flex-col items-center gap-6">
                        {/* Mobile Header Link */}
                        <div className="text-center w-full lg:hidden">
                            <Link to="/" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-[13px] font-semibold mb-6 group bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                Back Home
                            </Link>
                        </div>

                        <div className="w-full bg-white rounded-[24px] shadow-2xl overflow-hidden transform transition-all relative">
                            {/* Inner subtle top highlight */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>

                            <div className="px-7 pt-8 pb-5 text-center border-b border-slate-100 bg-slate-50/50">
                                <Link to="/" className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 inline-block mb-4">
                                    <img src="/logo.png" alt="JYNM" className="h-8 w-auto" onError={e => e.currentTarget.style.display='none'} />
                                </Link>
                                <div className="lg:hidden inline-flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-700 mb-4 block mx-auto w-fit">
                                    🏪 Yard Partner Portal
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight font-outfit"
                                    dangerouslySetInnerHTML={{ __html: get('login', 'form_heading', 'Vendor Sign In') }} />
                                <p className="text-slate-500 text-[13px] mt-1 font-medium"
                                    dangerouslySetInnerHTML={{ __html: get('login', 'form_subtext', 'Sign in to manage your yard listing and inventory.') }} />
                            </div>

                            <div className="px-7 py-6">
                                {error && (
                                    <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold flex items-start gap-2.5">
                                        <svg className="w-[18px] h-[18px] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                        {error}
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="vl-email" className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            </span>
                                            <input
                                                id="vl-email" type="email" required value={email}
                                                onChange={e => { setEmail(e.target.value); setError(''); }}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                                placeholder="vendor@example.com" autoComplete="email"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label htmlFor="vl-pw" className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Password</label>
                                            <Link to="/vendor/forgot-password" className="text-[12px] text-blue-600 font-bold hover:text-blue-700 hover:underline transition-all">Forgot password?</Link>
                                        </div>
                                        <PasswordInput
                                            id="vl-pw" required value={password}
                                            onChange={e => { setPassword(e.target.value); setError(''); }}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                            placeholder="••••••••••" autoComplete="current-password"
                                        />
                                    </div>
                                    <button
                                        type="submit" disabled={loading || failCount >= 5}
                                        className="w-full mt-2 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98] transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] disabled:opacity-60 flex items-center justify-center gap-2 text-[15px]"
                                    >
                                        {loading && <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                        {loading ? 'Signing in…' : get('login', 'submit_btn', 'Sign In →')}
                                    </button>
                                </form>
                            </div>

                            {/* Feature strip */}
                            <div className="flex items-center justify-around px-4 py-3 bg-slate-50 border-t border-slate-100">
                                {[{ icon: '📦', label: 'Manage Inventory' }, { icon: '📈', label: 'Receive Leads' }, { icon: '⚡', label: 'Grow Business' }].map(f => (
                                    <div key={f.label} className="flex flex-col items-center gap-1 text-center flex-1">
                                        <span className="text-lg">{f.icon}</span>
                                        <span className="text-[10px] font-bold text-slate-500 leading-tight">{f.label}</span>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Sign Up Link */}
                            <div className="text-center py-5 bg-slate-50 border-t border-slate-100">
                                <p className="text-[13px] text-slate-500 font-medium">
                                    New to JYNM?{' '}
                                    <Link to={`/vendor/signup?redirect=${encodeURIComponent(redirectAfter)}`} className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                                        Create Free Vendor Account
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorLogin;
