import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LeadForm from './LeadForm';

export default function FloatingLeadWidget() {
    const location = useLocation();
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

    return (
        <>
            {/* TRIGGER FAB — circular, bottom-right on mobile, right-middle on desktop */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                        onClick={() => setIsOpen(true)}
                        aria-label="Find a Part Fast"
                        title="Find a Part Fast"
                        className="hidden lg:flex fixed z-[500] group
                            lg:bottom-auto lg:right-0 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-3 lg:rounded-r-none lg:rounded-l-2xl lg:pr-3
                            lg:w-auto lg:h-auto lg:px-3 lg:py-3.5
                            items-center justify-center gap-2
                            bg-gradient-to-br from-[#1a56ff] to-[#4f46e5]
                            rounded-full shadow-[0_6px_30px_rgba(26,86,255,0.5)]
                            hover:shadow-[0_8px_40px_rgba(26,86,255,0.7)]
                            hover:scale-100 hover:translate-x-0
                            transition-all duration-200 cursor-pointer"
                    >
                        {/* Pulse ring */}
                        <span className="absolute inset-0 rounded-full lg:rounded-l-2xl lg:rounded-r-none bg-blue-400/40 animate-ping pointer-events-none" />

                        {/* Wrench icon */}
                        <svg className="relative w-6 h-6 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>

                        {/* Desktop label (hidden on mobile) */}
                        <span className="hidden lg:block text-[10px] font-black tracking-[0.2em] uppercase text-white whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                            Find a Part
                        </span>

                        {/* Tooltip (mobile only) */}
                        <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none lg:hidden shadow-lg">
                            Find a Part Fast
                            <span className="absolute top-full right-4 border-4 border-transparent border-t-slate-900" />
                        </span>
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
                                'hidden lg:flex fixed z-[999] bg-white flex-col',
                                // Desktop: right-side panel
                                'lg:top-16 lg:right-0 lg:bottom-0 lg:w-[320px] lg:rounded-l-[20px] lg:shadow-[-12px_0_50px_rgba(37,99,235,0.15)]',
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
