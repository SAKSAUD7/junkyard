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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && handleClose()}>
            <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="forgot-password-title">
                <button type="button" onClick={handleClose} disabled={loading} aria-label="Close password reset dialog" className="absolute right-4 top-4 z-10 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50">×</button>
                <div className="bg-gradient-to-br from-blue-700 to-indigo-600 px-6 py-8 text-center text-white">
                    <img src={logoUrl || '/logo.png'} alt="JYNM" className="mx-auto mb-4 h-12 w-auto object-contain" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                    <h2 className="text-2xl font-black" id="forgot-password-title">{context.title}</h2>
                    <p className="mt-2 text-sm text-blue-100">{context.description}</p>
                </div>
                <div className="p-6 sm:p-8">
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
                                <label htmlFor="forgot-password-email" className="mb-2 block text-sm font-bold text-slate-700">Email address</label>
                                <input id="forgot-password-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder={context.placeholder} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-700 px-4 py-3 font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Sending…' : 'Send reset instructions'}</button>
                            <button type="button" onClick={handleBackToLogin} disabled={loading} className="w-full text-sm font-semibold text-slate-500 hover:text-slate-800">Back to sign in</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
