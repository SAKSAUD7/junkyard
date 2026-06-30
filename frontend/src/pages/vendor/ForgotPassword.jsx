import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { vendorAuth } from '../../services/vendorApi';
import { useCMS } from '../../hooks/useCMS';

const VendorForgotPassword = () => {
    const { get } = useCMS('navbar');
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await vendorAuth.requestPasswordReset(email);
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset instructions');
            console.error('Password reset error:', err);
        } finally {
            setLoading(false);
        }
    };

    const logoUrl = get('brand', 'logo', '/logo.svg');

    return (
        <div className="flex min-h-screen w-full bg-white relative overflow-hidden font-sans">
            {/* LEFT SIDE: Solid Blue Panel */}
            <div className="hidden lg:flex w-1/2 bg-[#3b82f6] flex-col items-center justify-center p-12 text-center text-white">
                <div className="w-80 h-40 bg-white rounded-lg shadow-[0_20px_40px_rgb(0,0,0,0.15)] mb-16 flex items-center justify-center p-6">
                    <img src={logoUrl} alt="JYNM Logo" className="h-12 w-auto opacity-80" />
                </div>
                <h2 className="text-[32px] font-bold mb-3 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Recover Access</h2>
                <p className="text-blue-100 text-lg font-medium">Reset your vendor account password</p>
            </div>

            {/* RIGHT SIDE: White Card */}
            <div className="w-full lg:w-1/2 flex flex-col pt-6 pb-12 px-6 sm:px-12 relative z-10 bg-white">
                <div className="flex justify-end w-full mb-8 lg:mb-16">
                    <Link to="/vendor/login" className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </Link>
                </div>

                <div className="w-full max-w-[420px] mx-auto flex-1 flex flex-col justify-center animate-fade-in-up">
                    {submitted ? (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-50/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Check Your <span className="text-blue-600">Email</span>
                            </h2>

                            <p className="text-slate-500 font-medium text-[15px] mb-10 leading-relaxed">
                                We've sent password reset instructions to <br/><strong className="text-slate-800">{email}</strong>
                            </p>

                            <Link
                                to="/vendor/login"
                                className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold py-4 px-4 rounded-xl shadow-[0_8px_20px_rgb(29,78,216,0.25)] transition-all duration-300 flex justify-center items-center gap-2 text-[15px]"
                            >
                                Back to Sign In
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-10">
                                <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Forgot <span className="text-blue-600">Password?</span>
                                </h1>
                                <p className="text-slate-500 font-medium text-[15px]">
                                    Enter your email to receive reset instructions
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 rounded-xl animate-fade-in bg-red-50 border border-red-100 text-red-600 text-[14px] font-medium flex items-center gap-3 shadow-sm">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p>{error}</p>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-slate-700 text-[14px] font-bold mb-2">
                                        Email Address
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

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold py-4 px-4 rounded-xl shadow-[0_8px_20px_rgb(29,78,216,0.25)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[15px]"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Sending Instructions...
                                        </>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                                
                                <div className="mt-8 text-center text-[14px] font-medium text-slate-500">
                                    Remember your password?{' '}
                                    <Link to="/vendor/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                                        Sign In
                                    </Link>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorForgotPassword;
