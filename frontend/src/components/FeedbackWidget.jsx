import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ReCAPTCHA from 'react-google-recaptcha';
import { useLocation } from 'react-router-dom';

const DevRecaptcha = ({ onChange }) => (
    <div className="border border-[#d3d3d3] bg-[#f9f9f9] p-3 rounded-[3px] flex items-center justify-between w-[304px] h-[78px] shadow-sm">
        <label className="flex items-center gap-3 cursor-pointer pl-1">
            <input 
                type="checkbox" 
                onChange={(e) => onChange(e.target.checked ? 'dev-mock-token-xyz' : null)} 
                className="w-7 h-7 rounded-[2px] border-2 border-[#c1c1c1] bg-white cursor-pointer" 
            />
            <span className="text-[14px] font-medium text-[#282828]">I'm not a robot</span>
        </label>
        <div className="flex flex-col items-center pr-1 text-center">
            <div className="text-[11px] text-[#555] font-bold">reCAPTCHA</div>
            <div className="text-[9px] text-[#555] mt-0.5 font-bold uppercase text-red-500">Dev Only</div>
        </div>
    </div>
);

const FeedbackWidget = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        topic: 'find_business',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);
    const recaptchaRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/common/feedback/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    setIsOpen(false);
                    setTimeout(() => {
                        setSubmitted(false);
                        setFormData({ topic: 'find_business', description: '' });
                        setCaptchaToken(null);
                        if (recaptchaRef.current) recaptchaRef.current.reset();
                    }, 500); // Reset after close animation
                }, 3000);
            }
        } catch (error) {
            console.error('Error submitting feedback', error);
        } finally {
            setLoading(false);
        }
    };

    if (location.pathname.startsWith('/admin-portal')) {
        return null;
    }

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center z-50 transition-colors"
                aria-label="Open Feedback Form"
            >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 5.582 2 10c0 2.476 1.34 4.686 3.425 6.13-.19.896-.706 2.378-1.572 3.25 1.764.12 3.992-.477 5.753-1.636.757.215 1.564.336 2.394.336 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
                    <circle cx="8" cy="10" r="1.5" fill="white" />
                    <circle cx="12" cy="10" r="1.5" fill="white" />
                    <circle cx="16" cy="10" r="1.5" fill="white" />
                </svg>
            </motion.button>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-y-auto w-full h-[100dvh]">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                            className="relative w-full max-w-[700px] max-h-[92vh] overflow-y-auto flex flex-col bg-slate-50/50 rounded-3xl md:rounded-[32px] shadow-2xl my-auto z-10 scrollbar-hide"
                        >
                            {/* The Floating Middle Icon (simulated via absolute positioning on the main white box) */}
                            <div className="relative pt-6">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[8px] z-10 hidden sm:flex h-16 w-16 bg-white rounded-full items-center justify-center shadow-sm">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.477 2 2 5.582 2 10c0 2.476 1.34 4.686 3.425 6.13-.19.896-.706 2.378-1.572 3.25 1.764.12 3.992-.477 5.753-1.636.757.215 1.564.336 2.394.336 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
                                            <circle cx="8" cy="10" r="1" fill="white" />
                                            <circle cx="12" cy="10" r="1" fill="white" />
                                            <circle cx="16" cy="10" r="1" fill="white" />
                                        </svg>
                                    </div>
                                    {/* subtle outer ring */}
                                    <div className="absolute inset-[-4px] border border-blue-50 rounded-full" />
                                </div>

                                {/* Main White Box */}
                                <div className="bg-white rounded-t-3xl md:rounded-[32px] p-6 sm:p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                                    <button 
                                        onClick={() => setIsOpen(false)}
                                        className="absolute top-4 right-4 sm:top-8 sm:right-8 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors z-20"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>

                                    {submitted ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Thank you!</h3>
                                            <p className="text-slate-500">Your feedback has been submitted successfully. We appreciate your input!</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col md:flex-row gap-8 md:gap-10 pt-4 sm:pt-0">
                                            {/* Left Column */}
                                            <div className="flex-1 max-w-[280px]">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center sm:hidden">
                                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 2C6.477 2 2 5.582 2 10c0 2.476 1.34 4.686 3.425 6.13-.19.896-.706 2.378-1.572 3.25 1.764.12 3.992-.477 5.753-1.636.757.215 1.564.336 2.394.336 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
                                                        </svg>
                                                    </div>
                                                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tell Us What You Think</h2>
                                                </div>
                                                <p className="text-[14px] text-slate-600 mb-8 leading-relaxed font-medium pr-4">
                                                    We're all ears! Your suggestions and feedback help us serve you better.
                                                </p>

                                                <div className="hidden sm:block bg-slate-50/70 border border-slate-100/50 rounded-2xl p-6 sm:p-7 space-y-6 sm:space-y-7">
                                                    <div className="flex gap-4">
                                                        <div className="w-10 h-10 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center shrink-0">
                                                            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.8-6.3 4.8 2.3-7.4-6-4.6h7.6z"/></svg>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-[14px] font-bold text-slate-900 leading-tight">Better Experience</h4>
                                                            <p className="text-[12px] text-slate-500 mt-1">Your feedback helps us improve</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <div className="w-10 h-10 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center shrink-0">
                                                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-[14px] font-bold text-slate-900 leading-tight">Trusted Platform</h4>
                                                            <p className="text-[12px] text-slate-500 mt-1">We're committed to quality</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <div className="w-10 h-10 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center shrink-0">
                                                            <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-[14px] font-bold text-slate-900 leading-tight">Built for You</h4>
                                                            <p className="text-[12px] text-slate-500 mt-1">Your voice shapes our community</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <div className="w-10 h-10 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center shrink-0">
                                                            <svg className="w-5 h-5 text-violet-500" fill="currentColor" viewBox="0 0 24 24"><path d="M13 3v8h8L11 21v-8H3l10-10z"/></svg>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-[14px] font-bold text-slate-900 leading-tight">Quick Response</h4>
                                                            <p className="text-[12px] text-slate-500 mt-1">We review every feedback</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column / Form */}
                                            <div className="flex-[1.2]">
                                                <form onSubmit={handleSubmit} className="flex flex-col h-full gap-5">
                                                    <div>
                                                        <label className="block text-[13px] font-bold text-slate-800 mb-2">What is your feedback about?</label>
                                                        <div className="relative">
                                                            <select
                                                                required
                                                                className="w-full h-12 bg-white border border-slate-200 text-slate-700 text-[14px] font-medium rounded-xl px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors cursor-pointer"
                                                                value={formData.topic}
                                                                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                                                            >
                                                                <option value="find_business">Can't find a business</option>
                                                                <option value="bug">Report a bug or issue</option>
                                                                <option value="suggestion">Feature suggestion</option>
                                                                <option value="general">General feedback</option>
                                                            </select>
                                                            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 flex flex-col pt-2">
                                                        <label className="block text-[13px] font-bold text-slate-800 mb-2">Tell us what you expected to find</label>
                                                        <div className="relative flex-1">
                                                            <textarea
                                                                required
                                                                className="w-full h-40 bg-white border border-slate-200 text-slate-700 text-[14px] font-medium rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                                                                placeholder="Please describe in detail..."
                                                                value={formData.description}
                                                                maxLength={500}
                                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                            />
                                                            <div className="absolute bottom-3 right-3 text-[11px] font-semibold text-slate-400 bg-white px-1">
                                                                {formData.description.length}/500
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Real Recaptcha or Dev Fallback */}
                                                    <div className="mt-1 mb-2">
                                                        {import.meta.env.VITE_RECAPTCHA_SITE_KEY ? (
                                                            <ReCAPTCHA
                                                                ref={recaptchaRef}
                                                                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                                                                onChange={(token) => setCaptchaToken(token)}
                                                                onExpired={() => setCaptchaToken(null)}
                                                            />
                                                        ) : (
                                                            <DevRecaptcha onChange={setCaptchaToken} />
                                                        )}
                                                    </div>

                                                    <div className="text-[12px] sm:text-[13px] text-slate-600 mb-1 font-medium">
                                                        Or, you can <a href="/add-a-yard" className="text-blue-600 font-bold hover:underline">add a business here.</a>
                                                    </div>

                                                    <div>
                                                        <button 
                                                            type="submit"
                                                            disabled={loading || formData.description.length < 5 || !captchaToken}
                                                            className={`h-11 px-6 bg-blue-600 text-white text-[14px] font-bold rounded-lg flex items-center gap-2 transition-all ${loading || formData.description.length < 5 || !captchaToken ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 shadow-md shadow-blue-600/20 w-fit'}`}
                                                        >
                                                            {loading ? (
                                                                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                                                            )}
                                                            Send Feedback
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bottom Banner inside the modal container matching the screenshot */}
                            <div className="bg-slate-50 px-5 sm:px-8 py-4 sm:py-5 rounded-b-3xl md:rounded-b-[32px] border-t border-slate-100 flex items-center justify-between z-10 w-full overflow-hidden shrink-0">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-bold text-slate-900 leading-tight">Your feedback matters!</h4>
                                        <p className="text-[12px] text-slate-500 mt-0.5">We read every message and use your input to improve JYNM for everyone.</p>
                                    </div>
                                </div>

                                <div className="hidden sm:flex text-blue-200">
                                    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="currentColor">
                                        <path d="M48 20a4 4 0 0 0-4-4H20a4 4 0 0 0-4 4v16a4 4 0 0 0 4 4h4v6l6-6h14a4 4 0 0 0 4-4V20zm-2 16a2 2 0 0 1-2 2H29.17l-3.59 3.59V38H20a2 2 0 0 1-2-2V20a2 2 0 0 1 2-2h24a2 2 0 0 1 2 2v16z"/>
                                        <path d="M26 24h12v2H26zM26 30h8v2h-8z"/>
                                    </svg>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FeedbackWidget;
