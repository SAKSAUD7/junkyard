import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVendorAuth } from '../../contexts/VendorAuthContext';
import { useCMS } from '../../hooks/useCMS';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PasswordInput from '../../components/PasswordInput';

const VendorLogin = () => {
    const { get: getGlobal } = useCMS('global');
    const { get } = useCMS('vendor_portal');
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

    const logoUrl = getGlobal('brand', 'logo');

    return (
        <div className="flex min-h-screen w-full bg-white relative overflow-hidden font-sans">
            {/* LEFT SIDE: Solid Blue Welcome Panel */}
            <div className="hidden lg:flex w-1/2 bg-[#3b82f6] flex-col items-center justify-center p-12 text-center text-white">
                <div className="w-80 bg-white rounded-2xl shadow-xl mb-12 flex items-center justify-center p-8">
                    <img
                        src={logoUrl || '/logo.png'}
                        alt="JYNM Logo"
                        className="h-20 w-auto object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                </div>
                <h2 className="text-[32px] font-bold mb-3 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>{get('login', 'panel_heading', 'Welcome Back!')}</h2>
                <p className="text-blue-100 text-lg font-medium">{get('login', 'panel_subtext', 'Sign in to access your account')}</p>
            </div>

            {/* RIGHT SIDE: White Auth Card */}
            <div className="w-full lg:w-1/2 flex flex-col pt-6 pb-12 px-6 sm:px-12 relative z-10 bg-white">
                {/* Close 'X' Button at top right */}
                <div className="flex justify-end w-full mb-8 lg:mb-16">
                    <Link to="/" className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </Link>
                </div>

                <div className="w-full max-w-[420px] mx-auto flex-1 flex flex-col justify-center animate-fade-in-up">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }} dangerouslySetInnerHTML={{ __html: get('login', 'form_heading', 'Welcome <span class="text-blue-600">Back</span>') }} />
                        <p className="text-slate-500 font-medium text-[15px]">{get('login', 'form_subtext', 'Sign in to your account')}</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl animate-fade-in bg-red-50 border border-red-100 text-red-600 text-[14px] font-medium flex items-center gap-3 shadow-sm">
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Demo Credentials */}
                    <div className="mb-8 p-4 rounded-xl bg-blue-50/50 border border-blue-100/50">
                        <div className="text-blue-600 text-xs font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Demo Access
                        </div>
                        <div className="text-[13px] text-slate-600 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-medium">
                            <span className="text-slate-400">Email:</span> vendor@test.com
                            <span className="text-slate-400">Pass:</span> vendor123
                        </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-slate-700 text-[14px] font-bold mb-2">
                                {get('login', 'email_label', 'Email Address')}
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="w-full bg-white border-2 border-slate-900/10 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-0 transition-colors font-medium text-[15px]"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="vendor@example.com"
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-slate-700 text-[14px] font-bold mb-2">
                                {get('login', 'password_label', 'Password')}
                            </label>
                            <PasswordInput
                                id="password"
                                className="w-full bg-[#f8fafc] border-none rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-shadow font-medium text-[15px]"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                            <div className="flex justify-end mt-3">
                                <Link
                                    to="/vendor/forgot-password"
                                    className="text-blue-600 hover:text-blue-700 text-[13px] font-semibold transition-colors"
                                >
                                    {get('login', 'forgot_password', 'Forgot Password?')}
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold py-4 px-4 rounded-xl shadow-[0_8px_20px_rgb(29,78,216,0.25)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-[15px]"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Signing In...
                                </>
                            ) : (
                                get('login', 'submit_btn', 'Sign In')
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-[14px] font-medium text-slate-500">
                        {get('login', 'signup_text', "Don't have an account?")}{' '}
                        <Link to="/vendor/signup" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                            {get('login', 'signup_link', 'Sign Up')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorLogin;
