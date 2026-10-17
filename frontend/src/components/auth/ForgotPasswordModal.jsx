import { useEffect, useState } from 'react';
import { useCMS } from '../../hooks/useCMS';
import authService from '../../services/authService';
import { vendorAuth } from '../../services/vendorApi';

const CONTEXTS = {
    customer: { title: 'Reset Your Password', description: "Enter your email and we'll send secure reset instructions.", placeholder: 'your.email@example.com' },
    vendor: { title: 'Recover Vendor Access', description: "Enter your vendor email and we'll send secure reset instructions.", placeholder: 'vendor@example.com' },
    admin: { title: 'Recover Admin Access', description: "Enter your administrator email and we'll send secure reset instructions.", placeholder: 'admin@example.com' },
};

export default function ForgotPasswordModal({
    isOpen,
    onClose,
    onBackToLogin,
    userType = 'customer',
}) {
    const { get: getGlobal } = useCMS('global');
    const context = CONTEXTS[userType] || CONTEXTS.customer;
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const resetForm = () => {
        setEmail('');
        setError('');
        setSubmitted(false);
    };

    useEffect(() => {
        if (!isOpen) return undefined;
        const previousOverflow = document.body.style.overflow;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !loading) {
                resetForm();
                onClose();
            }
        };
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, loading, onClose]);


    const validateEmail = (value) => {
        if (!value.trim()) return 'Please enter your email address.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Please enter a valid email address.';
        return '';
    };

    const handleClose = () => {
        if (loading) return;
        resetForm();
        onClose();
    };

    const handleBackToLogin = () => {
        if (loading) return;
        resetForm();
        (onBackToLogin || onClose)();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const validationError = validateEmail(email);
        if (validationError) {
            setError(validationError);
            return;
        }
        setLoading(true);
        setError('');
        try {
            if (userType === 'vendor') await vendorAuth.requestPasswordReset(email);
            else await authService.requestPasswordReset(email, userType);
            setSubmitted(true);
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'We could not send reset instructions right now. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;
    const logoUrl = getGlobal('brand', 'logo');

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/45 backdrop-blur-sm p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && handleClose()}>
            <div className="relative w-full max-w-[420px] max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-100 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)]" role="dialog" aria-modal="true" aria-labelledby="forgot-password-title">
                <div className="absolute left-0 right-0 top-0 z-10 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                <button type="button" onClick={handleClose} disabled={loading} aria-label="Close password reset dialog" className="absolute right-4 top-4 z-20 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50">×</button>
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 pb-5 pt-8 text-center">
                    <div className="mb-4 inline-block rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                        <img src={logoUrl || '/logo.png'} alt="JYNM" className="h-8 w-auto" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                    </div>
                    <h2 className="font-outfit text-2xl font-black tracking-tight text-slate-800" id="forgot-password-title">{context.title}</h2>
                    <p className="mt-1 text-[13px] font-medium text-slate-500">{context.description}</p>
                </div>
                <div className="p-6">
                    {submitted ? (
                        <div className="py-4 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">✓</div>
                            <h3 className="text-xl font-bold text-slate-900">Check your email</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">If an account exists for <strong>{email.trim().toLowerCase()}</strong>, reset instructions have been sent.</p>
                            <p className="mt-3 text-xs text-slate-500">The link expires automatically and can only be used once.</p>
                            <button type="button" onClick={handleBackToLogin} className="mt-6 w-full rounded-xl bg-blue-700 px-4 py-3 font-bold text-white hover:bg-blue-800">Back to sign in</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
                            <div>
                                <label htmlFor="forgot-password-email" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-700">Email Address</label>
                                <input id="forgot-password-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder={context.placeholder} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                            </div>
                            <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-[15px] font-bold text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Sending…' : 'Send reset instructions'}</button>
                            <button type="button" onClick={handleBackToLogin} disabled={loading} className="w-full text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800">Back to sign in</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
