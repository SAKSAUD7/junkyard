import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'

const AD_CLICK_URL = (id) => {
    const base = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000/api')).replace(/\/api\/?$/, '');
    return `${base}/ads/${id}/click/`;
};

export default function MobileAdBanner({ page = 'all' }) {
    const [ads, setAds] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isDismissed, setIsDismissed] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const touchStartX = useRef(0)
    const touchEndX = useRef(0)
    const timerRef = useRef(null)

    useEffect(() => {
        const dismissed = localStorage.getItem(`mobile-ad-dismissed-${page}`)
        if (dismissed === 'true') {
            setIsDismissed(true)
            return
        }

        const fetchAds = async () => {
            try {
                const bottomAds = await api.getAds({ slot: 'strip_bottom', target_page: page })
                const allAds = [
                    ...(bottomAds.results || bottomAds || [])
                ]
                if (allAds.length > 0) {
                    setAds(allAds)
                    setTimeout(() => setIsVisible(true), 800)
                }
            } catch {
                // Ads unavailable — fail silently
            }
        }
        fetchAds()
    }, [page])

    // Auto-rotate
    useEffect(() => {
        if (ads.length <= 1 || !isVisible) return
        timerRef.current = setInterval(() => goTo('next'), 5000)
        return () => clearInterval(timerRef.current)
    }, [ads.length, isVisible])

    const goTo = (dir) => {
        if (isAnimating) return
        setIsAnimating(true)
        setCurrentIndex(prev => dir === 'next'
            ? (prev + 1) % ads.length
            : (prev - 1 + ads.length) % ads.length
        )
        setTimeout(() => setIsAnimating(false), 300)
    }

    const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
    const handleTouchMove = (e) => { touchEndX.current = e.touches[0].clientX }
    const handleTouchEnd = () => {
        const dist = touchStartX.current - touchEndX.current
        if (Math.abs(dist) > 50) goTo(dist > 0 ? 'next' : 'prev')
    }

    const handleDismiss = () => {
        setIsVisible(false)
        setTimeout(() => {
            setIsDismissed(true)
            localStorage.setItem(`mobile-ad-dismissed-${page}`, 'true')
        }, 350)
    }

    if (ads.length === 0 || isDismissed) return null

    const ad = ads[currentIndex]

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-350 ease-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
        >
            {/* Background panel */}
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]" />

            <div
                className="relative px-4 pt-3 pb-4"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Header row */}
                <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sponsored</span>
                    <button
                        onClick={handleDismiss}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                        aria-label="Close ad"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Ad card */}
                <a
                    href={AD_CLICK_URL(ad.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 p-3 shadow-[0_4px_16px_rgba(0,0,0,0.05)] active:scale-[0.98] transition-transform"
                >
                    {/* Thumbnail */}
                    {ad.image ? (
                        <div className="w-[68px] h-[68px] rounded-xl overflow-hidden flex-shrink-0 bg-slate-50">
                            <img
                                src={ad.image}
                                alt={ad.title}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.closest('div').style.display = 'none'; }}
                            />
                        </div>
                    ) : (
                        <div className="w-[68px] h-[68px] rounded-xl flex-shrink-0 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                            <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    )}

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-slate-900 line-clamp-2 leading-snug" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {ad.title}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-1.5 text-[12px] font-bold text-[#1a56ff]">
                            {ad.button_text || 'Visit Website'}
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </span>
                    </div>

                    {/* Arrow cue */}
                    <div className="w-8 h-8 rounded-xl bg-[#1a56ff] flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </a>

                {/* Dots */}
                {ads.length > 1 && (
                    <div className="flex justify-center gap-1.5 mt-2.5">
                        {ads.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-5 bg-[#1a56ff]' : 'w-1.5 bg-slate-200'}`}
                                aria-label={`Ad ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
