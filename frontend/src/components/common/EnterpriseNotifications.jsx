/**
 * Enterprise Notification Framework
 * ====================================
 * Replaces all browser alert() / confirm() calls.
 * Provides animated toasts, payment progress modals, loading skeletons,
 * and retry buttons — accessible and fully responsive.
 *
 * Usage:
 *   import { useNotifications, NotificationContainer } from '../common/EnterpriseNotifications';
 *
 *   const { showToast, showPaymentProgress, hidePaymentProgress } = useNotifications();
 */
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

// ───────────────────────────────────────────────────────────────────────────────
// Context
// ───────────────────────────────────────────────────────────────────────────────
const NotificationContext = createContext(null);

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>');
    return ctx;
}

// ───────────────────────────────────────────────────────────────────────────────
// Toast Component
// ───────────────────────────────────────────────────────────────────────────────
const TOAST_ICONS = {
    success: (
        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
    ),
    error: (
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    warning: (
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
    ),
    info: (
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    payment: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    ),
};

const TOAST_BG = {
    success: 'border-l-4 border-emerald-500 bg-white',
    error:   'border-l-4 border-red-500 bg-white',
    warning: 'border-l-4 border-amber-500 bg-white',
    info:    'border-l-4 border-blue-500 bg-white',
    payment: 'border-l-4 border-blue-600 bg-white',
};

function Toast({ id, type = 'info', title, message, onRetry, onDismiss }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    const dismiss = () => {
        setVisible(false);
        setTimeout(() => onDismiss(id), 320);
    };

    return (
        <div
            role="alert"
            aria-live="assertive"
            className={`
                flex items-start gap-3 rounded-xl p-4 shadow-lg max-w-sm w-full
                ${TOAST_BG[type] || TOAST_BG.info}
                transition-all duration-300 ease-out
                ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
            `}
        >
            <div className="shrink-0 mt-0.5">{TOAST_ICONS[type]}</div>
            <div className="flex-1 min-w-0">
                {title && <p className="font-bold text-slate-900 text-sm mb-0.5">{title}</p>}
                {message && <p className="text-slate-600 text-sm leading-snug">{message}</p>}
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                    >
                        Retry
                    </button>
                )}
            </div>
            <button
                onClick={dismiss}
                aria-label="Dismiss notification"
                className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

// ───────────────────────────────────────────────────────────────────────────────
// Payment Progress Modal
// ───────────────────────────────────────────────────────────────────────────────
const PAYMENT_STAGES = [
    { id: 'validating',  label: 'Validating payment details',    icon: '🔐' },
    { id: 'sending',     label: 'Sending to payment gateway',    icon: '📡' },
    { id: 'authorized',  label: 'Payment authorized',            icon: '✅' },
    { id: 'provisioning', label: 'Activating your subscription', icon: '🚀' },
    { id: 'complete',    label: 'Payment complete!',             icon: '🎉' },
];

function PaymentProgressModal({ stage, visible, amount }) {
    if (!visible) return null;
    const stageIdx = PAYMENT_STAGES.findIndex(s => s.id === stage);

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Payment in progress"
                className="bg-white rounded-3xl p-10 shadow-2xl max-w-md w-full mx-4 text-center"
            >
                {/* Animated Shield */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full bg-blue-50 animate-ping opacity-30" />
                    <div className="relative w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                </div>

                <h2 className="text-xl font-black text-slate-900 mb-1"
                    style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Processing Payment
                </h2>
                {amount && (
                    <p className="text-3xl font-black text-blue-600 mb-6">${amount}</p>
                )}

                {/* Stage Progress */}
                <div className="space-y-3 text-left mb-6">
                    {PAYMENT_STAGES.map((s, i) => {
                        const done    = i < stageIdx;
                        const current = i === stageIdx;
                        return (
                            <div key={s.id} className={`flex items-center gap-3 transition-opacity duration-300 ${i > stageIdx ? 'opacity-30' : 'opacity-100'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300 ${
                                    done    ? 'bg-emerald-500 text-white' :
                                    current ? 'bg-blue-600 text-white ring-4 ring-blue-200' :
                                              'bg-slate-100 text-slate-400'
                                }`}>
                                    {done ? '✓' : s.icon}
                                </div>
                                <span className={`text-sm font-semibold ${current ? 'text-slate-900' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {s.label}
                                    {current && <span className="ml-2 inline-block w-4 overflow-hidden">
                                        <span className="inline-block animate-bounce">...</span>
                                    </span>}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <p className="text-xs text-slate-400 font-medium">
                    🔒 Secured by 256-bit SSL · Do not close this window
                </p>
            </div>
        </div>,
        document.body
    );
}

// ───────────────────────────────────────────────────────────────────────────────
// Provider
// ───────────────────────────────────────────────────────────────────────────────
export function NotificationProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const [paymentModal, setPaymentModal] = useState({ visible: false, stage: 'validating', amount: null });
    const timerRefs = useRef({});

    const showToast = useCallback(({ type = 'info', title, message, duration = 5000, onRetry } = {}) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, type, title, message, onRetry }]);

        if (duration > 0) {
            timerRefs.current[id] = setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
                delete timerRefs.current[id];
            }, duration);
        }
        return id;
    }, []);

    const dismissToast = useCallback((id) => {
        clearTimeout(timerRefs.current[id]);
        delete timerRefs.current[id];
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showPaymentProgress = useCallback((amount) => {
        setPaymentModal({ visible: true, stage: 'validating', amount });
    }, []);

    const updatePaymentStage = useCallback((stage) => {
        setPaymentModal(prev => ({ ...prev, stage }));
    }, []);

    const hidePaymentProgress = useCallback(() => {
        setPaymentModal({ visible: false, stage: 'validating', amount: null });
    }, []);

    useEffect(() => {
        return () => Object.values(timerRefs.current).forEach(clearTimeout);
    }, []);

    return (
        <NotificationContext.Provider value={{ showToast, showPaymentProgress, updatePaymentStage, hidePaymentProgress }}>
            {children}

            {/* Toast Container */}
            {createPortal(
                <div
                    aria-label="Notifications"
                    className="fixed bottom-6 right-6 z-[9998] flex flex-col gap-3 items-end pointer-events-none"
                >
                    {toasts.map(t => (
                        <div key={t.id} className="pointer-events-auto">
                            <Toast {...t} onDismiss={dismissToast} />
                        </div>
                    ))}
                </div>,
                document.body
            )}

            {/* Payment Progress Modal */}
            <PaymentProgressModal
                visible={paymentModal.visible}
                stage={paymentModal.stage}
                amount={paymentModal.amount}
            />
        </NotificationContext.Provider>
    );
}
