import React, { useState, useEffect } from 'react';

// Reusable Authorize.net Accept.js Form
export default function AcceptJsCheckout({ 
    amount, 
    onSuccess, 
    onError,
    buttonText = "Pay Now"
}) {
    const [loading, setLoading] = useState(false);
    const [isMockMode, setIsMockMode] = useState(false);
    
    // Form fields
    const [cardNumber, setCardNumber] = useState('');
    const [expMonth, setExpMonth] = useState('');
    const [expYear, setExpYear] = useState('');
    const [cardCode, setCardCode] = useState('');

    useEffect(() => {
        // We need VITE_AUTHORIZENET_API_LOGIN_ID and VITE_AUTHORIZENET_CLIENT_KEY
        const loginId = import.meta.env.VITE_AUTHORIZENET_API_LOGIN_ID;
        const clientKey = import.meta.env.VITE_AUTHORIZENET_CLIENT_KEY;

        if (!loginId || !clientKey) {
            console.warn("Authorize.net Client Keys missing. Using Mock Mode.");
            setIsMockMode(true);
            return;
        }

        // Dynamically load Accept.js script
        const env = import.meta.env.VITE_AUTHORIZENET_ENV || 'sandbox';
        const scriptUrl = env === 'production' 
            ? 'https://js.authorize.net/v1/Accept.js' 
            : 'https://jstest.authorize.net/v1/Accept.js';

        if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
            const script = document.createElement('script');
            script.src = scriptUrl;
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        if (isMockMode) {
            // Simulate a short network delay then return a mock nonce
            setTimeout(() => {
                setLoading(false);
                onSuccess("mock_nonce_" + Math.random().toString(36).substring(7));
            }, 1000);
            return;
        }

        const loginId = import.meta.env.VITE_AUTHORIZENET_API_LOGIN_ID;
        const clientKey = import.meta.env.VITE_AUTHORIZENET_CLIENT_KEY;

        const authData = {
            clientKey: clientKey,
            apiLoginID: loginId
        };
        
        const cardData = {
            cardNumber: cardNumber.replace(/\s/g, ''),
            month: expMonth,
            year: expYear,
            cardCode: cardCode
        };

        const secureData = {
            authData: authData,
            cardData: cardData
        };

        if (window.Accept && window.Accept.dispatchData) {
            window.Accept.dispatchData(secureData, responseHandler);
        } else {
            console.error("Accept.js is not loaded.");
            setLoading(false);
            if (onError) onError("Payment gateway not fully loaded. Please try again in a few seconds.");
        }
    };

    const responseHandler = (response) => {
        setLoading(false);
        if (response.messages.resultCode === "Error") {
            let i = 0;
            let errorText = "";
            while (i < response.messages.message.length) {
                errorText += response.messages.message[i].text + " ";
                i = i + 1;
            }
            if (onError) onError(errorText);
        } else {
            // Success
            const nonce = response.opaqueData.dataValue;
            if (onSuccess) onSuccess(nonce);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            {isMockMode && (
                <div className="mb-4 bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-2">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <div>
                        <strong className="block mb-1">Sandbox Mock Mode</strong>
                        You have not provided VITE_AUTHORIZENET_API_LOGIN_ID and CLIENT_KEY in the frontend environment. This form will generate a mock success nonce for testing purposes.
                    </div>
                </div>
            )}
            
            <div className="space-y-4">
                {/* Card Number */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Card Number</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            required 
                            maxLength="19"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="•••• •••• •••• ••••"
                            className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 pl-12 focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff] transition-all font-mono text-lg"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Expiry */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expiration</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                required 
                                maxLength="2"
                                placeholder="MM"
                                value={expMonth}
                                onChange={(e) => setExpMonth(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-1/2 bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-center focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff] transition-all font-mono"
                            />
                            <input 
                                type="text" 
                                required 
                                maxLength="4"
                                placeholder="YYYY"
                                value={expYear}
                                onChange={(e) => setExpYear(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-1/2 bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-center focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff] transition-all font-mono"
                            />
                        </div>
                    </div>

                    {/* CVV */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">CVV</label>
                        <input 
                            type="text" 
                            required 
                            maxLength="4"
                            placeholder="123"
                            value={cardCode}
                            onChange={(e) => setCardCode(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff] transition-all font-mono"
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#1a56ff] hover:bg-blue-700 disabled:opacity-75 disabled:cursor-wait text-white font-black text-lg py-4 rounded-xl shadow-[0_8px_30px_rgba(26,86,255,0.25)] hover:shadow-[0_8px_30px_rgba(26,86,255,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="w-5 h-5 animate-spin text-white/50" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Processing Securely...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                                {buttonText} (${amount})
                            </>
                        )}
                    </button>
                    
                    <div className="flex items-center justify-center gap-3 mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        Secure 256-bit SSL Checkout
                    </div>
                </div>
            </div>
        </form>
    );
}
