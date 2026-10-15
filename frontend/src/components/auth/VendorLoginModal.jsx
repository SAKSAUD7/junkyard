import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendorAuth } from '../../contexts/VendorAuthContext';
import { AuthContext } from '../../contexts/AuthContext';
import PasswordInput from '../PasswordInput';
import ForgotPasswordModal from './ForgotPasswordModal';
import { Fragment } from 'react';

export default function VendorLoginModal({ isOpen, onComplete }) {
    const navigate = useNavigate();
    const { login } = useVendorAuth();
    const { isAuthenticated: isCustomerAuthenticated, user: customerUser } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    // Escape key handler
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Check if user is already authenticated as a customer
        if (isCustomerAuthenticated && customerUser) {
            setError('You are signed in as a customer. Vendor accounts are separate. Please sign out first or create a vendor account.');
            setLoading(false);
            return;
        }

        const result = await login(email, password);
        if (!result.success) {
            setError(result.error || 'Invalid vendor credentials.');
            setLoading(false);
        } else {
            setLoading(false);
            onComplete?.();
            navigate('/vendor/dashboard');
        }
    };

    const handleClose = () => {
        setError('');
        setEmail('');
        setPassword('');
        onComplete?.();
    };

    if (!isOpen) return null;

    return (
        <Fragment>
            <div className="fixed inset-0 z-[120] flex items-center justify-center font-inter" onClick={handleClose}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity" />

                {/* Modal Dialog */}
                <div
                    className="relative w-full max-w-[440px] mx-4 rounded-3xl overflow-hidden shadow-2xl z-10 my-6 bg-slate-900 border border-white/10"
                    style={{ maxHeight: '92vh', overflowY: 'auto' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Background Image / Gradient */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/heroes/parts-warehouse.png"
                            alt=""
                            className="w-full h-full object-cover opacity-35"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/95 to-slate-950" />
                    </div>

                    {/* Close Button */}
                    <button
                        type="button"
                        onClick={handleClose}
                        className="absolute top-4 right-4 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col p-6 sm:p-7">
                        {/* Brand Header */}
                        <div className="flex flex-col items-center text-center mb-6">
                            <img
                                src="/logo.png"
                                alt="JYNM"
                                className="h-12 w-auto object-contain mb-3 drop-shadow-md"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
                                <span>Vendor Portal</span>
                            </div>
                            <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Vendor <span className="text-yellow-400">Sign In</span>
                            </h2>
                            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xs font-medium">
                                Sign in to manage your yard, inventory, leads, and advertising.
                            </p>
                        </div>

                        {/* White Container Form */}
                        <div className="bg-white rounded-2xl p-5 shadow-2xl text-slate-900">
                            {error && (
                                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold flex items-center gap-2">
                                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-3.5">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">Business Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="partner@youryard.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700">Password</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowForgotPassword(true)}
                                            className="text-[10px] font-bold text-blue-600 hover:underline"
                                        >
                                            Forgot?
                                        </button>
                                    </div>
                                    <PasswordInput
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-60 mt-2"
                                >
                                    {loading ? 'Verifying...' : 'Sign In →'}
                                </button>

                                <div className="text-center pt-1 text-xs text-slate-500 font-semibold">
                                    Don't have a vendor account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleClose();
                                            window.dispatchEvent(new CustomEvent('jynm:open-add-yard'));
                                        }}
                                        className="text-blue-600 hover:underline font-bold"
                                    >
                                        Register Your Yard
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <ForgotPasswordModal
                isOpen={showForgotPassword}
                onClose={() => setShowForgotPassword(false)}
                onBackToLogin={() => setShowForgotPassword(false)}
                userType="vendor"
            />
        </Fragment>
    );
}
