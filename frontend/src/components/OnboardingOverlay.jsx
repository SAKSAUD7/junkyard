import { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

export default function OnboardingOverlay() {
    const [isVisible, setIsVisible] = useState(false)
    const [step, setStep] = useState(0)
    const { isAuthenticated } = useContext(AuthContext)
    const navigate = useNavigate()

    useEffect(() => {
        const hasSeen = sessionStorage.getItem('jynm_onboarding_seen')
        // Don't show if already authenticated or seen
        if (!hasSeen && !isAuthenticated) {
            const timer = setTimeout(() => {
                setIsVisible(true)
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isAuthenticated])
    
    // Auto slide logic
    useEffect(() => {
        if (!isVisible || step >= 3) return
        
        const autoSlidertimer = setInterval(() => {
            setStep(prev => (prev < 2 ? prev + 1 : 3))
        }, 3500)
        
        return () => clearInterval(autoSlidertimer)
    }, [isVisible, step])

    const handleDismiss = () => {
        setIsVisible(false)
        sessionStorage.setItem('jynm_onboarding_seen', 'true')
    }

    if (!isVisible) return null

    const slides = [
        {
            title: "Welcome to JYNM",
            subtitle: "Your Ultimate Auto Parts Network",
            image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600",
            icon: (
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )
        },
        {
            title: "Find Any Part",
            subtitle: "Search across 6,500+ licensed junkyards in 60 seconds.",
            image: "https://images.unsplash.com/photo-1625893348123-5e921d7b1ba2?auto=format&fit=crop&q=80&w=600",
            icon: (
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
            )
        },
        {
            title: "Save Up To 80%",
            subtitle: "Compare prices instantly and grab the best deal.",
            image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=600",
            icon: (
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    ]

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-[9999] flex flex-col bg-white overflow-hidden"
                >
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 p-5 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>JYNM</span>
                        </div>
                        <button onClick={handleDismiss} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Image Area - Mindtrip style rounded arches / big beautiful pictures */}
                    <div className="relative flex-1 w-full flex items-center justify-center bg-gray-100 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={step}
                                src={slides[step].image}
                                alt={slides[step].title}
                                className="absolute inset-0 w-full h-full object-cover"
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.6 }}
                            />
                        </AnimatePresence>
                        
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        
                        {/* Centered Graphic Component */}
                        <motion.div 
                            key={`icon-${step}`}
                            className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-white/20 backdrop-blur-md bg-white/10 flex items-center justify-center"
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                        >
                            {slides[step].icon}
                        </motion.div>
                    </div>

                    {/* Content Area */}
                    <div className="bg-white rounded-t-[32px] -mt-6 sm:-mt-10 relative z-20 px-6 pt-8 pb-10 sm:px-12 flex flex-col items-center text-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)] min-h-[360px]">
                        
                        {/* Dots */}
                        <div className="flex gap-2 mb-6">
                            {[0, 1, 2].map((i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setStep(i)}
                                    className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-blue-600' : step === 3 && i === 2 ? 'w-6 bg-blue-600' : 'w-2 bg-slate-200 hover:bg-slate-300'}`}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`text-${step}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="w-full flex-1 flex flex-col justify-center"
                            >
                                {step < 3 ? (
                                    <>
                                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                                            {slides[step].title}
                                        </h1>
                                        <p className="text-base sm:text-lg text-slate-500 font-medium mb-8 max-w-sm mx-auto">
                                            {slides[step].subtitle}
                                        </p>
                                    </>
                                ) : (
                                    <div className="mb-4">
                                        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                                            Get Started Now
                                        </h1>
                                        <p className="text-sm text-slate-500 font-medium mb-6">
                                            Create an account to save favorite yards, streamline part requests, and receive automated quotes.
                                        </p>
                                    </div>
                                )}

                                <div className="w-full max-w-sm mx-auto flex flex-col gap-3">
                                    {step < 3 ? (
                                        <>
                                            <button 
                                                onClick={() => setStep(prev => prev + 1)} 
                                                className="w-full py-4 rounded-2xl bg-black text-white font-bold text-lg hover:bg-slate-800 transition-colors active:scale-[0.98]"
                                            >
                                                Next
                                            </button>
                                            <button 
                                                onClick={handleDismiss} 
                                                className="w-full py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold text-lg hover:bg-slate-200 transition-colors active:scale-[0.98]"
                                            >
                                                Skip to Website
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={() => { handleDismiss(); navigate('/signup'); }} 
                                                className="w-full py-3.5 rounded-2xl border-2 border-blue-600 bg-blue-600 text-white font-bold text-base shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition"
                                            >
                                                Create Account
                                            </button>
                                            <button 
                                                onClick={() => { handleDismiss(); navigate('/signin'); }} 
                                                className="w-full py-3.5 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-base hover:bg-slate-50 transition"
                                            >
                                                I Already Have an Account
                                            </button>
                                            <button 
                                                onClick={handleDismiss} 
                                                className="w-full py-3 mt-2 rounded-2xl bg-slate-100 text-slate-500 font-bold text-sm hover:text-slate-800 transition"
                                            >
                                                Skip For Now (Continue as Guest)
                                            </button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
