import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'

export default function MobileStickyBar() {
    const [isVisible, setIsVisible] = useState(false)
    const location = useLocation()

    // Read scroll threshold
    useEffect(() => {
        const handleScroll = () => {
            // Show bar after scrolling down 300px
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }
        
        window.addEventListener('scroll', handleScroll)
        handleScroll()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Hide if on quote, add-a-yard, or similar pages
    const hiddenPaths = ['/quote', '/add-a-yard', '/vendor/login']
    if (hiddenPaths.some(p => location.pathname.startsWith(p))) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                    className="fixed bottom-0 left-0 right-0 z-[9000] md:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] pb-safe"
                >
                    <div className="px-4 py-3 flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Find Parts</span>
                            <span className="text-sm font-black text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Get a Free Quote</span>
                        </div>
                        
                        <Link 
                            to="/quote" 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg whitespace-nowrap transition-transform active:scale-95 shimmer-btn relative overflow-hidden"
                            style={{ 
                                boxShadow: '0 4px 15px rgba(37,99,235,0.4)',
                                WebkitTapHighlightColor: 'transparent'
                            }}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Instant Quote
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                            </span>
                            {/* Shimmer effect inside button */}
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-0" />
                        </Link>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
