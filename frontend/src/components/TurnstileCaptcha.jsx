import React, { useEffect, useRef, useState } from 'react';

export default function TurnstileCaptcha({ onVerify, onError }) {
    const containerRef = useRef(null);
    const [widgetId, setWidgetId] = useState(null);
    
    // Fallback mode if no key provided
    const [mockMode, setMockMode] = useState(false);
    const siteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY;

    useEffect(() => {
        if (!siteKey) {
            setMockMode(true);
            return;
        }

        // Add script if not exists
        if (!document.getElementById('turnstile-script')) {
            const script = document.createElement('script');
            script.id = 'turnstile-script';
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }

        const renderWidget = () => {
            if (window.turnstile && containerRef.current && !widgetId) {
                const id = window.turnstile.render(containerRef.current, {
                    sitekey: siteKey,
                    theme: 'auto',
                    callback: function(token) {
                        if (onVerify) onVerify(token);
                    },
                    'error-callback': function() {
                        if (onError) onError('Challenge verification failed');
                    }
                });
                setWidgetId(id);
            }
        };

        // Render immediately if script is already loaded, otherwise poll/wait
        if (window.turnstile) {
            renderWidget();
        } else {
            const interval = setInterval(() => {
                if (window.turnstile) {
                    clearInterval(interval);
                    renderWidget();
                }
            }, 100);
            return () => clearInterval(interval);
        }

        return () => {
            if (widgetId && window.turnstile) {
                window.turnstile.remove(widgetId);
            }
        };
    }, [siteKey, onVerify, onError, widgetId]);

    if (mockMode) {
        return (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                    <input 
                        type="checkbox" 
                        id="mock-captcha"
                        className="w-5 h-5 rounded border-slate-300 text-[#1a56ff] focus:ring-[#1a56ff]"
                        onChange={(e) => {
                            if (e.target.checked && onVerify) {
                                setTimeout(() => onVerify('mock-turnstile-token'), 500);
                            }
                        }}
                    />
                    <label htmlFor="mock-captcha" className="font-medium text-slate-700 select-none">
                        I am human <br/>
                        <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">(Turnstile Key Missing - Mock Mode)</span>
                    </label>
                </div>
                <svg className="w-8 h-8 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L7 12.431l3.118 3.121a1 1 0 001.414 0l5.952-5.95-1.062-1.062-5.6 5.6z"/>
                </svg>
            </div>
        );
    }

    return (
        <div className="flex justify-center" ref={containerRef}></div>
    );
}
