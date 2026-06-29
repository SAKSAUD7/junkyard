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

    // If multiple ads in same slot — show one at a time with dots
    if (ads.length > 1) {
        return (
            <div className="w-full">
                <div className="transition-opacity duration-300">
                    {renderTemplate(ads[currentIndex])}
                </div>
                {/* Dots */}
                <div className="flex justify-center gap-1.5 mt-3">
                    {ads.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { clearInterval(timerRef.current); setCurrentIndex(i); }}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-5 bg-[#1a56ff]' : 'w-1.5 bg-slate-200 hover:bg-slate-300'}`}
                            aria-label={`Ad ${i + 1}`}
                        />
                    ))}
                </div>
            </div>
        )
    }

    return <div className="w-full">{renderTemplate(ads[0])}</div>
}
