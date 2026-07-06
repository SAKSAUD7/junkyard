import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVendorAuth } from '../../contexts/VendorAuthContext';
import { useCMS } from '../../hooks/useCMS';
import PasswordInput from '../../components/PasswordInput';
import SEO from '../../components/SEO';

const FEATURES = [
    { icon: '📦', title: 'Manage Inventory', desc: 'Add, edit and manage your parts & listings.' },
    { icon: '📥', title: 'Get More Leads', desc: 'Receive real-time leads from serious buyers.' },
    { icon: '📈', title: 'Grow Business', desc: 'Boost visibility and increase your sales.' },
];

const VendorLogin = () => {
    const { get } = useCMS('vendor_portal');
    const [tab, setTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [failCount, setFailCount] = useState(0);

    const { login } = useVendorAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (failCount >= 5) { setError('Too many failed attempts. Please wait before trying again.'); return; }
        setError(''); setLoading(true);
        const result = await login(email, password);
        if (result.success) {
            navigate('/vendor/dashboard');
        } else {
            setFailCount(c => c + 1);
            setError('Invalid credentials. Please check your email and password.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f0fff4] flex flex-col font-inter">
            <SEO title="Vendor Login – JYNM" description="Log in to your JYNM Vendor account." noindex={true} />

            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
                {/* Unified Auth Container */}
                <div className="w-full max-w-[900px] flex flex-col gap-4">
                    <div className="w-full bg-white rounded-3xl shadow-[0_20px_60px_rgba(22,163,74,0.12)] overflow-hidden flex flex-col md:flex-row min-h-[auto]">

                    {/* Left panel — Green */}
                    <div className="md:w-[380px] shrink-0 relative bg-gradient-to-br from-[#15803d] to-[#22c55e] flex flex-col items-center justify-center p-10 text-white overflow-hidden hidden md:flex">
                        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/10" />
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-white/10" />
                        <div className="relative z-10 w-36 h-36 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-8 border border-white/30">
                            <span className="text-5xl">🏪</span>
                        </div>
                        <h2 className="relative z-10 text-2xl font-black mb-2 text-center" style={{ fontFamily: "'Outfit', sans-serif" }} 
                            dangerouslySetInnerHTML={{ __html: get('login', 'panel_heading', 'Welcome Vendor!') }} />
                        <p className="relative z-10 text-green-100 text-sm text-center font-medium max-w-[200px]"
                            dangerouslySetInnerHTML={{ __html: get('login', 'panel_subtext', 'Login to manage your inventory, leads and grow your business.') }} />
                        <div className="relative z-10 mt-10 w-full space-y-2">
                            {FEATURES.map(f => (
                                <div key={f.title} className="flex items-start gap-3">
                                    <span className="text-lg">{f.icon}</span>
                                    <div>
                                        <p className="text-white text-[12px] font-bold">{f.title}</p>
                                        <p className="text-green-200 text-[11px]">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right panel — Form */}
                    <div className="flex-1 flex flex-col justify-center p-8 sm:p-12">
                        <div className="flex items-center justify-between mb-8">
                            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-slate-500 hover:text-green-600 transition-colors text-sm font-semibold">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                Back
                            </button>
                            <Link to="/" className="flex items-center gap-2">
                                <img src="/logo.png" alt="JYNM" className="h-8 w-auto" onError={e => e.currentTarget.style.display='none'} />
                                <span className="font-black text-slate-900 text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>JYNM</span>
                            </Link>
                            <div className="w-12" />
                        </div>

                        {/* Tabs */}
                        <div className="flex rounded-xl border border-slate-200 p-1 mb-7">
                            {['login', 'signup'].map(t => (
                                <button key={t} onClick={() => { setTab(t); setError(''); }}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === t ? 'bg-green-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    {t === 'login' ? 'Login' : 'Create Account'}
                                </button>
                            ))}
                        </div>

                        <h1 className="text-2xl font-black text-slate-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}
                            dangerouslySetInnerHTML={{ __html: tab === 'login' ? get('login', 'form_heading', 'Vendor Sign In') : 'Register as Vendor' }} />
                        <p className="text-slate-500 text-sm mb-6"
                            dangerouslySetInnerHTML={{ __html: tab === 'login' ? get('login', 'form_subtext', 'Access your vendor dashboard.') : 'Start listing your yard today.' }} />

                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                {error}
                            </div>
                        )}

                        {tab === 'login' ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email</label>
                                    <input type="email" required value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-all"
                                        placeholder="vendor@example.com" autoComplete="email" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Password</label>
                                        <Link to="/vendor/forgot-password" className="text-[12px] text-green-600 font-semibold hover:underline">Forgot password?</Link>
                                    </div>
                                    <PasswordInput required value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-all"
                                        placeholder="••••••••" autoComplete="current-password" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="vremember" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4 text-green-600 rounded border-slate-300 focus:ring-green-500" />
                                    <label htmlFor="vremember" className="text-[13px] text-slate-600 font-medium">Remember me</label>
                                </div>
                                <button type="submit" disabled={loading || failCount >= 5}
                                    className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-[0_4px_12px_rgba(22,163,74,0.3)] disabled:opacity-60 flex items-center justify-center gap-2">
                                    {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                    {loading ? 'Signing in…' : get('login', 'submit_btn', 'Login')}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-slate-500 text-sm mb-4">List your yard and start receiving leads from buyers.</p>
                                <Link to="/add-a-yard"
                                    className="inline-block px-8 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-[0_4px_12px_rgba(22,163,74,0.3)]">
                                    Register Your Yard
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile & Desktop Feature Strip */}
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 px-3 py-1 w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <div className="text-[11px] font-bold text-slate-700 leading-tight">Manage Your<br/>Inventory</div>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-1 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <div className="text-[11px] font-bold text-slate-700 leading-tight">Receive More<br/>Leads</div>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-1 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v8l9-11h-7z" /></svg>
                        </div>
                        <div className="text-[11px] font-bold text-slate-700 leading-tight">Grow Your<br/>Business</div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};

export default VendorLogin;
