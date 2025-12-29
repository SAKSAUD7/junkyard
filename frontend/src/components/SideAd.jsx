import React, { useState, useEffect } from 'react'

export default function SideAd({ slot, page = 'all' }) {
    const [ad, setAd] = useState(null)
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const fetchAd = async () => {
            try {
                // Fetch ads taking specific page into account
                const response = await fetch(`${import.meta.env.VITE_API_URL}/ads/?slot=${slot}&target_page=${page}`)
                if (response.ok) {
                    const data = await response.json()
                    // Handle paginated response: { count, next, previous, results: [...] }
                    const results = data.results || data
                    if (results && results.length > 0) {
                        // Process image URL
                        let ad = results[0]
                        if (ad.image && !ad.image.startsWith('http')) {
                            const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
                            ad = { ...ad, image: `${baseUrl}${ad.image}` }
                        }
                        setAd(ad)
                    }
                }
            } catch (error) {
                console.error("Failed to load ad", error)
            }
        }
        fetchAd()
    }, [slot, page])

    if (!ad || !isVisible) return null

    // Determine position based on slot
    const positionClass = slot === 'left_sidebar_ad'
        ? 'left-2 lg:left-4'
        : 'right-2 lg:right-4'

    return (
        <div
            className={`fixed top-32 ${positionClass} z-40 w-[160px] lg:w-[200px] hidden lg:block animate-fade-in`}
        >
            <div className="relative group">
                {/* Close Button (Optional UX nicety, not strictly requested but good for "sticky" ads) */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute -top-2 -right-2 bg-dark-900/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Ad Card */}
                <a
                    href={`${import.meta.env.VITE_API_URL}/ads/${ad.id}/click/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-dark-800/90 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden shadow-2xl hover:shadow-glow hover:border-orange-500/50 transition-all duration-300 transform hover:scale-[1.02]"
                >
                    {/* Label */}
                    <div className="bg-dark-950/50 py-1 px-2 text-center border-b border-white/5">
                        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Sponsored</span>
                    </div>

                    {/* Image */}
                    <div className="aspect-[4/5] bg-dark-900 relative">
                        {ad.image ? (
                            <img
                                src={ad.image}
                                alt={ad.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'text-white/10');
                                    e.target.parentElement.innerHTML = '<span class="text-xs">Visual</span>';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/10">
                                <span className="text-xs">Visual</span>
                            </div>
                        )}
                    </div>

                    {/* CTA Section */}
                    <div className="p-3 text-center bg-gradient-to-b from-dark-800 to-dark-900">
                        <h4 className="text-white font-bold text-sm mb-2 leading-tight">{ad.title}</h4>
                        <span className="inline-block w-full bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold py-1.5 rounded transition-colors uppercase tracking-wide">
                            Learn More
                        </span>
                    </div>
                </a>
            </div>
        </div>
    )
}
