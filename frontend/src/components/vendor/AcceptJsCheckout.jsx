import React, { useState, useEffect, useRef } from 'react';

// ─── Validation Helpers ──────────────────────────────────────────────────────

/** Luhn check — the standard algorithm for validating credit card numbers */
function luhnCheck(num) {
    const digits = num.replace(/\D/g, '');
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let d = parseInt(digits[i], 10);
        if (shouldDouble) { d *= 2; if (d > 9) d -= 9; }
        sum += d;
        shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
}

/** Format card number into groups of 4: "4111 1111 1111 1111" */
function formatCard(raw) {
    return raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function validateCard(cardNumber, expMonth, expYear, cardCode) {
    const errors = {};
    const digits = cardNumber.replace(/\D/g, '');

    // Card number
    if (!digits) {
        errors.cardNumber = 'Card number is required.';
    } else if (digits.length < 13 || digits.length > 16) {
        errors.cardNumber = 'Card number must be 13–16 digits.';
    } else if (!luhnCheck(digits)) {
        errors.cardNumber = 'Invalid card number.';
    }

    // Expiry Month
    const mm = parseInt(expMonth, 10);
    if (!expMonth) {
        errors.expMonth = 'Required.';
    } else if (isNaN(mm) || mm < 1 || mm > 12) {
        errors.expMonth = 'Invalid month (01–12).';
    }

    // Expiry Year
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-based
    const yy = parseInt(expYear, 10);
    if (!expYear) {
        errors.expYear = 'Required.';
    } else if (isNaN(yy) || expYear.length < 4) {
        errors.expYear = 'Use 4-digit year.';
    } else if (yy < currentYear || (yy === currentYear && mm < currentMonth)) {
        errors.expYear = 'Card is expired.';
    }

    // CVV
    const cvvDigits = cardCode.replace(/\D/g, '');
    if (!cvvDigits) {
        errors.cardCode = 'CVV is required.';
    } else if (cvvDigits.length < 3 || cvvDigits.length > 4) {
        errors.cardCode = 'CVV must be 3 or 4 digits.';
    }

    return errors;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AcceptJsCheckout({
    amount,
    onSuccess,
    onError,
    buttonText = 'Pay Now'
}) {
    const [loading, setLoading]     = useState(false);
    const [isMockMode, setIsMockMode] = useState(false);
    const [submitted, setSubmitted]  = useState(false); // prevent duplicate submission
    const submitLock = useRef(false);

    // Form fields
    const [cardNumber, setCardNumber] = useState('');
    const [expMonth,   setExpMonth]   = useState('');
    const [expYear,    setExpYear]    = useState('');
    const [cardCode,   setCardCode]   = useState('');

    // Inline validation errors
    const [errors, setErrors]   = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        const loginId  = import.meta.env.VITE_AUTHORIZENET_API_LOGIN_ID;
        const clientKey = import.meta.env.VITE_AUTHORIZENET_CLIENT_KEY;

        if (!loginId || !clientKey) {
            console.warn('Authorize.net Client Keys missing. Using Mock Mode.');
            setIsMockMode(true);
            return;
        }

        const env = import.meta.env.VITE_AUTHORIZENET_ENV || 'sandbox';
        const scriptUrl = env === 'production'
            ? 'https://js.authorize.net/v1/Accept.js'
            : 'https://jstest.authorize.net/v1/Accept.js';

        if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
            const script = document.createElement('script');
            script.src   = scriptUrl;
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    // Re-validate only touched fields as user types
    useEffect(() => {
        if (Object.keys(touched).length === 0) return;
        const allErrors = validateCard(cardNumber, expMonth, expYear, cardCode);
        const relevantErrors = {};
        Object.keys(touched).forEach(f => {
            if (allErrors[f]) relevantErrors[f] = allErrors[f];
        });
        setErrors(relevantErrors);
    }, [cardNumber, expMonth, expYear, cardCode, touched]);

    const markTouched = (field) => setTouched(prev => ({ ...prev, [field]: true }));

    const handleSubmit = (e) => {
        e.preventDefault();

        // Duplicate-submission guard
        if (submitLock.current || submitted) return;

        // Mark all fields as touched so errors appear
        setTouched({ cardNumber: true, expMonth: true, expYear: true, cardCode: true });

        // Full validation before any API call
        const allErrors = validateCard(cardNumber, expMonth, expYear, cardCode);
        setErrors(allErrors);
        if (Object.keys(allErrors).length > 0) return;

        // Lock against double-clicks
        submitLock.current = true;
        setLoading(true);

        if (isMockMode) {
            setTimeout(() => {
                setLoading(false);
                setSubmitted(true);
                submitLock.current = false;
                onSuccess('mock_nonce_' + Math.random().toString(36).substring(7));
            }, 1000);
            return;
        }

        const loginId   = import.meta.env.VITE_AUTHORIZENET_API_LOGIN_ID;
        const clientKey = import.meta.env.VITE_AUTHORIZENET_CLIENT_KEY;

        const secureData = {
            authData: { clientKey, apiLoginID: loginId },
            cardData: {
                cardNumber: cardNumber.replace(/\s/g, ''),
                month: expMonth.padStart(2, '0'),
                year:  expYear,
                cardCode
            }
        };

        if (window.Accept && window.Accept.dispatchData) {
            window.Accept.dispatchData(secureData, responseHandler);
        } else {
            setLoading(false);
            submitLock.current = false;
            if (onError) onError('Payment gateway not fully loaded. Please try again.');
        }
    };

    const responseHandler = (response) => {
        setLoading(false);
        submitLock.current = false;

        if (response.messages.resultCode === 'Error') {
            const errorText = response.messages.message.map(m => m.text).join(' ');
            if (onError) onError(errorText);
        } else {
            setSubmitted(true);
            if (onSuccess) onSuccess(response.opaqueData.dataValue);
        }
    };

    // ── Shared style helpers ──────────────────────────────────────────────────
    const fieldCls = (err) =>
        `w-full bg-white text-slate-900 border rounded-xl px-4 py-3 focus:ring-2 transition-all font-mono ${
            err
                ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                : 'border-slate-200 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff]'
        }`;

    const FieldError = ({ msg }) =>
        msg ? <p className="text-red-500 text-[11px] font-bold mt-1">{msg}</p> : null;

    return (
        <form onSubmit={handleSubmit} className="w-full" noValidate>

            {/*── Mock Mode Banner ───────────────────────────────────────── */}
            {isMockMode && (
                <div className="mb-4 bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-2">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                        <strong className="block mb-1">Sandbox Mock Mode</strong>
                        VITE_AUTHORIZENET_API_LOGIN_ID and CLIENT_KEY are not set. Validation still runs — a mock nonce is returned on success for testing.
                    </div>
                </div>
            )}

            <div className="space-y-4">

                {/* ── Card Number ─────────────────────────────────────────── */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Card Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-number"
                            placeholder="•••• •••• •••• ••••"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCard(e.target.value))}
                            onBlur={() => markTouched('cardNumber')}
                            maxLength={19}
                            className={`${fieldCls(errors.cardNumber)} pl-12 text-lg`}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                    </div>
                    <FieldError msg={errors.cardNumber} />
                </div>

                <div className="grid grid-cols-2 gap-4">

                    {/* ── Expiry ─────────────────────────────────────────── */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Expiration <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            <div className="w-1/2">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="cc-exp-month"
                                    placeholder="MM"
                                    value={expMonth}
                                    onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                                    onBlur={() => markTouched('expMonth')}
                                    maxLength={2}
                                    className={`${fieldCls(errors.expMonth)} text-center`}
                                />
                            </div>
                            <div className="w-1/2">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="cc-exp-year"
                                    placeholder="YYYY"
                                    value={expYear}
                                    onChange={(e) => setExpYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    onBlur={() => markTouched('expYear')}
                                    maxLength={4}
                                    className={`${fieldCls(errors.expYear)} text-center`}
                                />
                            </div>
                        </div>
                        {/* Show first expiry error that applies */}
                        <FieldError msg={errors.expMonth || errors.expYear} />
                    </div>

                    {/* ── CVV ────────────────────────────────────────────── */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            CVV <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            inputMode="numeric"
                            autoComplete="cc-csc"
                            placeholder="•••"
                            value={cardCode}
                            onChange={(e) => setCardCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            onBlur={() => markTouched('cardCode')}
                            maxLength={4}
                            className={fieldCls(errors.cardCode)}
                        />
                        <FieldError msg={errors.cardCode} />
                    </div>
                </div>

                {/* ── Submit Button ─────────────────────────────────────── */}
                <div className="mt-8">
                    <button
                        type="submit"
                        disabled={loading || submitted}
                        className="w-full bg-[#1a56ff] hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-lg py-4 rounded-xl shadow-[0_8px_30px_rgba(26,86,255,0.25)] hover:shadow-[0_8px_30px_rgba(26,86,255,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="w-5 h-5 animate-spin text-white/50" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Processing Securely...
                            </>
                        ) : submitted ? (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Payment Submitted
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                {buttonText} (${amount})
                            </>
                        )}
                    </button>

                    <div className="flex items-center justify-center gap-3 mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Secure 256-bit SSL Checkout
                    </div>
                </div>
            </div>
        </form>
    );
}
