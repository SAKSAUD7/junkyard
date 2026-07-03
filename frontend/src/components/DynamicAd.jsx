import React, { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import { StandardTemplate, MinimalTemplate, PremiumTemplate, CompactTemplate, MicroTemplate } from './AdTemplates'

export default function DynamicAd({ slot, page = 'all', templateOverride = null }) {
    const [ads, setAds] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const timerRef = useRef(null)

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const data = await api.getAds({ slot, target_page: page })
                const results = Array.isArray(data) ? data : (data.results || [])
                if (results.length > 0) setAds(results)
            } catch {
                console.warn('[DynamicAd] Ads unavailable')
            } finally {
                setLoading(false)
            }
        }
        fetchAds()
    }, [slot, page])

    // Auto-rotate if multiple ads in same slot
    useEffect(() => {
        if (ads.length <= 1) return
        timerRef.current = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % ads.length)
        }, 6000)
        return () => clearInterval(timerRef.current)
    }, [ads.length])

    if (loading || ads.length === 0) return null

    const renderTemplate = (ad) => {
        const type = templateOverride || ad.template_type
        switch (type) {
            case 'micro':    return <MicroTemplate    key={ad.id} ad={ad} />
            case 'minimal':  return <MinimalTemplate  key={ad.id} ad={ad} />
            case 'premium':  return <PremiumTemplate  key={ad.id} ad={ad} />
            case 'compact':  return <CompactTemplate  key={ad.id} ad={ad} />
            case 'standard':
            default:         return <StandardTemplate key={ad.id} ad={ad} />
        }
    }

    // If multiple ads in same slot — show as a continuous marquee
    if (ads.length > 1) {
        // We duplicate the array to ensure the infinite scroll has enough content to be seamless
        const displayAds = [...ads, ...ads];

        return (
            <div className="w-full overflow-hidden relative group">
                <style>{`
                    @keyframes dynamic-ad-marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .dynamic-ad-marquee-container:hover .dynamic-ad-marquee-track {
                        animation-play-state: paused !important;
                    }
                `}</style>
                
                {/* Fade gradients at edges */}
                <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#f8fafc] to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#f8fafc] to-transparent z-10 pointer-events-none" />

                <div className="dynamic-ad-marquee-container w-full">
                    <div 
                        className="flex gap-4 sm:gap-6 min-w-max dynamic-ad-marquee-track py-2"
                        style={{ animation: 'dynamic-ad-marquee 60s linear infinite' }}
                    >
                        {displayAds.map((ad, i) => (
                            <div key={`${ad.id}-${i}`} className="w-[300px] sm:w-[450px] md:w-[600px] flex-shrink-0">
                                {renderTemplate(ad)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return <div className="w-full">{renderTemplate(ads[0])}</div>
}
