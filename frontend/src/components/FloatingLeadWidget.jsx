import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LeadForm from './LeadForm';

export default function FloatingLeadWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Monitor scroll for mobile floating behavior
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 400); // approx hero height
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // init
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
            {/* DESKTOP: Fixed Right Tab */}
            <div className="hidden lg:block fixed right-0 top-1/2 -translate-y-1/2 z-[100]">
                <AnimatePresence>
                    {!isOpen && (
                        <motion.button
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 100, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            onClick={() => setIsOpen(true)}
                            className="bg-blue-600 text-white font-black py-4 px-3 rounded-l-2xl shadow-[-8px_0_20px_rgba(37,99,235,0.2)] hover:bg-blue-700 hover:pr-4 transition-all flex flex-col items-center gap-2 group"
                            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                            aria-label="Find Your Part"
                        >
                            <span className="text-[15px] tracking-widest uppercase rotate-180 mb-2">Find Part</span>
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center rotate-90">
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* MOBILE: CTA (In-flow vs Floating) */}
            <div className="lg:hidden">
                <AnimatePresence>
                    {!isOpen && (
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            onClick={() => setIsOpen(true)}
                            className={`
                                z-[90] shadow-[0_8px_30px_rgba(37,99,235,0.3)]
                                flex items-center justify-center gap-2 font-black transition-all
                                ${isScrolled 
                                    ? 'fixed bottom-[100px] right-5 rounded-full w-14 h-14 bg-blue-600 text-white hover:bg-blue-700' 
                                    : 'absolute top-[280px] left-1/2 -translate-x-1/2 w-[90%] max-w-[320px] bg-blue-600 text-white py-3.5 rounded-xl'
                                }
                            `}
                            aria-label="Find Your Part"
                        >
                            {isScrolled ? (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    FIND YOUR PART
                                </>
                            )}
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* WIDGET OVERLAY & PANEL */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 lg:bg-transparent z-[999]"
                            aria-hidden="true"
                        />

                        {/* Panel (Desktop Slide-in, Mobile Bottom Sheet) */}
                        <motion.div
                            initial={window.innerWidth >= 1024 ? { opacity: 0, scale: 0.95, y: -20 } : { y: '100%' }}
                            animate={window.innerWidth >= 1024 ? { opacity: 1, scale: 1, y: 0 } : { y: 0 }}
                            exit={window.innerWidth >= 1024 ? { opacity: 0, scale: 0.95, y: -20 } : { y: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className={`
                                fixed z-[1000] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col
                                lg:top-24 lg:right-8 lg:max-h-[calc(100vh-8rem)] lg:w-[380px] lg:rounded-2xl lg:border lg:border-slate-100
                                max-lg:bottom-0 max-lg:left-0 max-lg:w-full max-lg:h-[85dvh] max-lg:rounded-t-3xl
                            `}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 bg-white sticky top-0 z-10 rounded-t-2xl">
                                <div>
                                    <h2 className="text-[20px] font-extrabold text-slate-900 tracking-tight">Get a Free Quote Now</h2>
                                </div>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-500 rounded-full flex items-center justify-center transition-colors shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Scrollable Form Content */}
                            <div className="flex-1 overflow-y-auto p-5 relative text-[13px] custom-scrollbar">
                                <LeadForm layout="vertical" enableSteps={true} mode="quality_auto_parts" />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
