import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [touched, setTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const validateEmail = (value) => {
        if (!value) return 'Please enter your email address';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return '';
    };

    const handleBlur = () => { setTouched(true); setError(validateEmail(email)); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const emailError = validateEmail(email);
        if (emailError) { setError(emailError); setTouched(true); return; }
        setLoading(true);
        setError('');
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSubmitted(true);
        } catch (err) {
            setError('Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isValid = !validateEmail(email);

    return (
        <>
            <SEO title="Forgot Password - Reset Your JYNM Account" description="Reset your JunkYardsNearMe account password. Enter your email to receive password reset instructions." noindex={true} />
            <Navbar />

            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center py-20 px-4">
                <div className="w-full max-w-md">
                    {/* Brand Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 mb-5">
                            <span className="text-blue-600 font-black text-2xl" style={{ fontFamily: "'Outfit', sans-serif" }}>JYNM</span>
                            <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded uppercase tracking-wider">Auto Parts</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {submitted ? 'Check Your Email' : 'Forgot Password?'}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {submitted ? `We've sent reset instructions to ${email}` : "Enter your email and we'll send you reset instructions."}
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_40px_rgb(0,0,0,0.06)] p-8">
                        {!submitted ? (
                            <>
                                {/* Icon */}
                                <div className="flex justify-center mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                        <svg className="w-7 h-7 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                    </div>
                                </div>

                                {touched && error && (
                                    <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                        <span className="font-medium">{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label htmlFor="reset-email" className="block text-[13px] font-bold text-slate-700 mb-2">Email Address</label>
                                        <input
                                            id="reset-email" type="email" value={email}
                                            onChange={(e) => setEmail(e.target.value)} onBlur={handleBlur}
                                            placeholder="your.email@example.com"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-[15px] placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
                                        />
                                    </div>

                                    <button
                                        type="submit" disabled={!isValid || loading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl shadow-[0_8px_20px_rgb(37,99,235,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                                                Sending...
                                            </>
                                        ) : 'Send Reset Instructions'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-5">
                                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left">
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        <strong className="text-blue-600">Note:</strong> Password reset functionality is currently in development. For immediate assistance, please contact support.
                                    </p>
                                </div>
                                <button onClick={() => navigate('/signin')}
                                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-[0_8px_20px_rgb(37,99,235,0.25)]">
                                    Back to Sign In
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 text-center">
                        <Link to="/signin" className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
