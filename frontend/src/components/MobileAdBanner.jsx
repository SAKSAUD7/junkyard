import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'

export default function MobileAdBanner({ page = 'all' }) {
    const [ads, setAds] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isDismissed, setIsDismissed] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const touchStartX = useRef(0)
    const touchEndX = useRef(0)

    useEffect(() => {
        // Check if user has dismissed the banner
        const dismissed = localStorage.getItem(`mobile-ad-dismissed-${page}`)
        if (dismissed === 'true') {
            setIsDismissed(true)
            return
        }

        const fetchAds = async () => {
            try {
                // Fetch both left and right sidebar ads for mobile
                const leftAds = await api.getAds({ slot: 'left_sidebar_ad', target_page: page })
                const rightAds = await api.getAds({ slot: 'right_sidebar_ad', target_page: page })

                // Combine and process ads
                const allAds = [
                    ...(leftAds.results || leftAds || []),
                    ...(rightAds.results || rightAds || [])
                ]

                if (allAds.length > 0) {
                    const processedAds = allAds.map(ad => {
                        let imageUrl = ad.image
                        if (imageUrl && !imageUrl.startsWith('http')) {
                            const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
                            imageUrl = `${baseUrl}${imageUrl}`
                        }
                        return { ...ad, image: imageUrl }
                    })

                    setAds(processedAds)
                    // Delay showing banner for smooth animation
                    setTimeout(() => setIsVisible(true), 500)
                }
            } catch (error) {
                console.error('Failed to load mobile ads', error)
            }
        }

        fetchAds()
    }, [page])

    // Auto-rotate ads every 5 seconds
    useEffect(() => {
        if (ads.length <= 1) return

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % ads.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [ads.length])

    // Handle touch swipe gestures
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX
    }

    const handleTouchEnd = () => {
        const swipeDistance = touchStartX.current - touchEndX.current
        const minSwipeDistance = 50

        if (swipeDistance > minSwipeDistance) {
            // Swipe left - next ad
            setCurrentIndex(prev => (prev + 1) % ads.length)
        } else if (swipeDistance < -minSwipeDistance) {
            // Swipe right - previous ad
            setCurrentIndex(prev => (prev - 1 + ads.length) % ads.length)
        }
    }

    const handleDismiss = () => {
        setIsVisible(false)
        setTimeout(() => {
            setIsDismissed(true)
            localStorage.setItem(`mobile-ad-dismissed-${page}`, 'true')
        }, 300)
    }

    if (ads.length === 0 || isDismissed) return null

    const currentAd = ads[currentIndex]

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'
                }`}
        >
            {/* Backdrop blur spacer */}
            <div className="absolute inset-0 backdrop-blur-xl bg-dark-900/95 border-t border-white/10"></div>

            <div
                className="relative p-3 pb-safe"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-1 right-1 z-10 bg-dark-800/90 text-white/70 hover:text-white rounded-full p-1.5 transition-colors"
                    aria-label="Close advertisement"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Ad content */}
                <a
                    href={`${import.meta.env.VITE_API_URL}/ads/${currentAd.id}/click/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                >
                    <div className="flex items-center gap-3 bg-gradient-to-r from-dark-800 to-dark-700 rounded-xl overflow-hidden border border-white/10 hover:border-orange-500/50 transition-all shadow-lg">
                        {/* Ad image */}
                        {currentAd.image && (
                            <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-dark-900">
                                <img
                                    src={currentAd.image}
                                    alt={currentAd.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                    }}
                                />
                            </div>
                        )}

                        {/* Ad text */}
                        <div className="flex-1 py-2 pr-8">
                            <div className="text-[10px] uppercase tracking-widest text-orange-400 font-bold mb-1">
                                Sponsored
                            </div>
                            <h4 className="text-white font-bold text-sm sm:text-base mb-1 line-clamp-1">
                                {currentAd.title}
                            </h4>
                            <span className="inline-block text-xs sm:text-sm text-orange-400 font-semibold">
                                {currentAd.button_text || 'Learn More'} →
                            </span>
                        </div>
                    </div>
                </a>

                {/* Navigation dots */}
                {ads.length > 1 && (
                    <div className="flex justify-center gap-1.5 mt-2">
                        {ads.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentIndex
                                        ? 'bg-orange-500 w-6'
                                        : 'bg-white/30 hover:bg-white/50'
                                    }`}
                                aria-label={`View ad ${index + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Swipe indicator (shows on first load) */}
                {ads.length > 1 && currentIndex === 0 && (
                    <div className="absolute top-1/2 left-0 right-0 flex justify-between px-2 pointer-events-none opacity-50">
                        <svg className="w-6 h-6 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <svg className="w-6 h-6 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    )
}
