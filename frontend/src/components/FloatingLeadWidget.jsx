import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LeadForm from './LeadForm';

export default function FloatingLeadWidget() {
    const location = useLocation();

    const EXCLUDED_PREFIXES = [
        '/admin-portal',
        '/admin',
        '/vendor',
        '/signin',
        '/signup',
        '/forgot-password',
    ];
    if (EXCLUDED_PREFIXES.some(p => location.pathname.startsWith(p))) {
        return null;
    }

    const [isOpen, setIsOpen] = useState(false);

    // Prevent body scroll when open on mobile
    useEffect(() => {
        if (isOpen && window.innerWidth < 1024) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    return (
        <>
            {/* TRIGGER TAB — right side, vertical */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ x: 80, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 80, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        onClick={() => setIsOpen(true)}
                        aria-label="Request a Part"
                        className="fixed right-0 top-24 z-[500] flex flex-col items-center gap-2 lg:gap-3 bg-slate-900/90 backdrop-blur-xl border border-white/10 text-white py-3 px-2 lg:py-4 lg:px-2.5 rounded-l-xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:bg-slate-800 hover:-translate-x-0.5 transition-all cursor-pointer group"
                        style={{ writingMode: 'vertical-rl' }}
                    >
                        <span className="text-[10px] lg:text-[11px] font-black tracking-[0.2em] uppercase rotate-180 bg-gradient-to-t from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                            Request Part
                        </span>
                        <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-white/10 group-hover:bg-blue-500 border border-white/10 flex items-center justify-center transition-colors rotate-90">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* PANEL */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/30 lg:bg-transparent z-[998]"
                            aria-hidden="true"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={window.innerWidth >= 1024 ? { opacity: 0, x: 40 } : { y: '100%' }}
                            animate={window.innerWidth >= 1024 ? { opacity: 1, x: 0 } : { y: 0 }}
                            exit={window.innerWidth >= 1024 ? { opacity: 0, x: 40 } : { y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            className={[
                                'fixed z-[999] bg-white flex flex-col',
                                // Desktop: right-side panel
                                'lg:top-16 lg:right-0 lg:bottom-0 lg:w-[320px] lg:rounded-l-[20px] lg:shadow-[-12px_0_50px_rgba(37,99,235,0.15)]',
                                // Mobile: bottom sheet
                                'max-lg:bottom-0 max-lg:left-0 max-lg:w-full max-lg:max-h-[92dvh] max-lg:rounded-t-[24px] max-lg:shadow-[0_-8px_50px_rgba(0,0,0,0.2)]',
                            ].join(' ')}
                        >
                            {/* Mobile drag handle */}
                            <div className="flex justify-center pt-2.5 pb-1 lg:hidden shrink-0">
                                <div className="w-8 h-1 bg-slate-200 rounded-full" />
                            </div>

                            {/* Header */}
                            <div className="px-4 pt-3 lg:pt-4 pb-3 border-b border-slate-100 shrink-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider rounded-full mb-1">
                                            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                            Free &amp; Instant
                                        </span>
                                        <h2 className="text-[16px] font-black text-slate-900 leading-tight">Request a Part</h2>
                                        <p className="text-[11px] text-slate-400 font-medium">From 6,500+ verified junkyards</p>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center transition-all shrink-0"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable form — overflow-y-scroll so scrollbar always visible */}
                            <div
                                className="flex-1 px-4 py-4 overflow-y-scroll"
                                style={{ overflowY: 'scroll', WebkitOverflowScrolling: 'touch' }}
                            >
                                <LeadForm
                                    layout="vertical"
                                    enableSteps={false}
                                    mode="quality_auto_parts"
                                    hideHeader={true}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
