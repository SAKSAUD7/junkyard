// OnboardingOverlay — JYNM Phase 4 / 13
// - 3-screen controlled experience: Carousel → Intent → Action
// - Auto-slides carousel, but NEVER auto-redirects the user
// - Shows once per browser (localStorage) or never again once logged in
// - Dismiss via X, Skip, Sign In, Create Account, or Continue as Guest
import { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const STORAGE_KEY = 'jynm_onboarding_v2_done';

const SLIDES = [
    {
        title: 'Welcome to JYNM',
        subtitle: 'Your nationwide network for used auto parts and salvage yards across the US.',
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
    },
    {
        title: 'Find Any Part Fast',
        subtitle: 'Search across 6,500+ licensed junkyards — get same-day local availability.',
        image: 'https://images.unsplash.com/photo-1625893348123-5e921d7b1ba2?auto=format&fit=crop&q=80&w=800',
    },
    {
        title: 'Save Up To 80%',
        subtitle: 'Quality used parts at a fraction of dealer prices. Verified yards. Real reviews.',
        image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800',
    },
];

const INTENT_OPTIONS = [
    { id: 'find_part',   label: 'Find a used auto part',     icon: '🔩' },
    { id: 'find_yard',   label: 'Find a junkyard near me',   icon: '📍' },
    { id: 'sell',        label: 'Sell my vehicle',            icon: '🚗' },
    { id: 'vendor',      label: "I'm a junkyard / recycler", icon: '🏭' },
    { id: 'explore',     label: 'Just exploring',             icon: '🔎' },
];

// Screen enum
const SCREEN = { SLIDES: 0, INTENT: 1, ACTION: 2 };

export default function OnboardingOverlay({ onOpenLogin, onOpenSignup }) {
    const [visible, setVisible]     = useState(false);
    const [screen, setScreen]       = useState(SCREEN.SLIDES);
    const [slide, setSlide]         = useState(0);
    const [intent, setIntent]       = useState(null);
    const { isAuthenticated }       = useContext(AuthContext);
    const navigate                  = useNavigate();
    const location                  = useLocation();
    const timerRef                  = useRef(null);

    useEffect(() => {
        const done = localStorage.getItem(STORAGE_KEY);
        if (!done && !isAuthenticated && location.pathname === '/') {
            const t = setTimeout(() => {
                setVisible(true);
                localStorage.setItem(STORAGE_KEY, 'true'); // Immediately mark as done to prevent repeating
            }, 350);
            return () => clearTimeout(t);
        }
    }, [isAuthenticated, location.pathname]);

    // Auto-advance carousel only while on SLIDES screen
    useEffect(() => {
        if (!visible || screen !== SCREEN.SLIDES) return;
        timerRef.current = setInterval(() => {
            setSlide(s => {
                if (s < SLIDES.length - 1) return s + 1;
                // After the last slide, move to Intent screen
                clearInterval(timerRef.current);
                setScreen(SCREEN.INTENT);
                return s;
            });
        }, 3500);
        return () => clearInterval(timerRef.current);
    }, [visible, screen]);

    const markDone = () => localStorage.setItem(STORAGE_KEY, 'true');

    const dismiss = () => {
        markDone();
        setVisible(false);
    };

    const handleContinueAsGuest = () => {
        dismiss();
    };

    const handleSignIn = () => {
        dismiss();
        if (onOpenLogin) onOpenLogin();
    };

    const handleCreateAccount = () => {
        dismiss();
        if (onOpenSignup) onOpenSignup();
    };

    const handleVendorIntent = () => {
        dismiss();
        navigate('/add-a-yard');
    };

    if (!visible) return null;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="onboarding"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Welcome to JYNM"
                >
                    <motion.div
                        initial={{ y: 24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 24, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="relative w-full max-w-md rounded-3xl bg-white overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.3)]"
                    >
                        {/* ── SCREEN 0: CAROUSEL ── */}
                        {screen === SCREEN.SLIDES && (
                            <>
                                {/* Image */}
                                <div className="relative h-64 sm:h-72 overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        <motion.img
                                            key={slide}
                                            src={SLIDES[slide].image}
                                            alt={SLIDES[slide].title}
                                            className="absolute inset-0 w-full h-full object-cover"
                                            initial={{ opacity: 0, scale: 1.04 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.6 }}
                                        />
                                    </AnimatePresence>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                                    {/* Top bar */}
                                    <div className="absolute top-0 left-0 right-0 px-5 pt-5 flex justify-between items-center">
                                        <span className="text-lg font-black text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>JYNM</span>
                                        <button
                                            onClick={dismiss}
                                            aria-label="Close onboarding"
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Slide title on image */}
                                    <div className="absolute bottom-5 left-5 right-5">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={`title-${slide}`}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -8 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <h2 className="text-2xl font-black text-white leading-tight mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                    {SLIDES[slide].title}
                                                </h2>
                                                <p className="text-[13px] text-white/80 font-medium leading-snug">
                                                    {SLIDES[slide].subtitle}
                                                </p>
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Dots + controls */}
                                <div className="px-6 py-5 flex flex-col items-center gap-4">
                                    {/* Dot indicators */}
                                    <div className="flex items-center gap-2">
                                        {SLIDES.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSlide(i)}
                                                aria-label={`Go to slide ${i + 1}`}
                                                className={`rounded-full transition-all duration-300 ${i === slide ? 'w-6 h-2 bg-blue-600' : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'}`}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => { clearInterval(timerRef.current); setScreen(SCREEN.INTENT); }}
                                        className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[15px] font-bold transition-colors shadow-[0_4px_14px_rgba(37,99,235,0.3)]"
                                    >
                                        Next
                                    </button>
                                    <button
                                        onClick={dismiss}
                                        className="text-[13px] text-slate-400 hover:text-slate-600 font-semibold transition-colors"
                                    >
                                        Skip for now
                                    </button>
                                </div>
                            </>
                        )}

                        {/* ── SCREEN 1: INTENT ── */}
                        {screen === SCREEN.INTENT && (
                            <div className="px-6 py-7">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className="text-lg font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>JYNM</span>
                                        <h2 className="text-xl font-black text-slate-900 mt-1 leading-tight">What brings you to JYNM?</h2>
                                        <p className="text-[13px] text-slate-500 font-medium mt-1">This helps us personalize your experience.</p>
                                    </div>
                                    <button onClick={dismiss} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors flex-shrink-0 ml-3">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Options */}
                                <div className="space-y-2 mb-6">
                                    {INTENT_OPTIONS.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setIntent(opt.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left text-[14px] font-semibold transition-all ${
                                                intent === opt.id
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                    : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-white'
                                            }`}
                                        >
                                            <span className="text-xl">{opt.icon}</span>
                                            {opt.label}
                                            {intent === opt.id && (
                                                <svg className="w-4 h-4 ml-auto text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => {
                                        if (intent === 'vendor') { handleVendorIntent(); return; }
                                        setScreen(SCREEN.ACTION);
                                    }}
                                    disabled={!intent}
                                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[15px] font-bold transition-colors"
                                >
                                    Continue
                                </button>
                                <button onClick={dismiss} className="w-full mt-3 text-[13px] text-slate-400 hover:text-slate-600 font-semibold transition-colors">
                                    Skip for now
                                </button>
                            </div>
                        )}

                        {/* ── SCREEN 2: ACTION ── */}
                        {screen === SCREEN.ACTION && (
                            <div className="px-6 py-7">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className="text-lg font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>JYNM</span>
                                        <h2 className="text-xl font-black text-slate-900 mt-1 leading-tight">How would you like to continue?</h2>
                                        <p className="text-[13px] text-slate-500 font-medium mt-1">Save your searches, get alerts, and more.</p>
                                    </div>
                                    <button onClick={dismiss} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors flex-shrink-0 ml-3">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleSignIn}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[15px] font-bold transition-colors shadow-[0_4px_14px_rgba(37,99,235,0.3)]"
                                    >
                                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                        Sign In
                                    </button>

                                    <button
                                        onClick={handleCreateAccount}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-[15px] font-bold transition-all shadow-[0_4px_14px_rgba(79,70,229,0.3)]"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Create Account — It's Free
                                    </button>

                                    <button
                                        onClick={handleContinueAsGuest}
                                        className="w-full py-3.5 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[15px] font-bold transition-colors"
                                    >
                                        Continue as Guest
                                    </button>
                                </div>

                                <p className="text-center text-[11px] text-slate-400 mt-4 font-medium">
                                    No spam. No credit card required.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
