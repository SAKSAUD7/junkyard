import React, { useState, useEffect } from 'react'
import { api } from '../services/api'

/** A compact, horizontal ad strip banner for page injection.
 *  Props:
 *   slot      — ad slot key, e.g. "strip_top", "strip_middle"
 *   page      — target page filter, e.g. "home", "search", "all"
 *   label     — optional small label tag like "Sponsored" (default shown)
 */
export default function AdSlotStrip({ slot = 'strip_top', page = 'all', label = 'Sponsored' }) {
    const [ads, setAds] = useState([])
    const [current, setCurrent] = useState(0)
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        api.getAds({ slot_group: slot.startsWith('strip') ? 'strip' : slot, target_page: page })
            .then(data => {
                const results = Array.isArray(data) ? data : (data?.results || [])
                if (results.length > 0) setAds(results)
            })
            .catch(() => {})
    }, [slot, page])

    // Auto-rotate
    useEffect(() => {
        if (ads.length <= 1) return
        const t = setInterval(() => setCurrent(c => (c + 1) % ads.length), 7000)
        return () => clearInterval(t)
    }, [ads.length])

    if (!visible || ads.length === 0) return null

    const ad = ads[current]
    const hasImage = ad.image_url || ad.image

    return (
        <div className="w-full my-4 px-4 sm:px-6 lg:px-8">
            <div className="relative max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 hover:shadow-md transition-shadow group">
                {/* Dismiss */}
                <button
                    onClick={() => setVisible(false)}
                    className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors"
                    aria-label="Close ad"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Sponsored label */}
                <div className="absolute top-2 left-3 z-10">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-white/80 px-2 py-0.5 rounded-full border border-slate-100">{label}</span>
                </div>

                <a
                    href={ad.redirect_url || ad.click_url || ad.cta_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 px-5 py-3.5 pt-7"
                    onClick={e => { if (!ad.redirect_url && !ad.click_url && !ad.cta_url) e.preventDefault() }}
                >
                    {/* Thumbnail */}
                    {hasImage && (
                        <div className="w-16 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                            <img
                                src={ad.image_url || ad.image}
                                alt={ad.title || 'Advertisement'}
                                className="w-full h-full object-cover"
                                onError={e => { e.target.style.display = 'none' }}
                            />
                        </div>
                    )}

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-black text-slate-800 truncate leading-tight">
                            {ad.title || 'Premium Auto Parts — Advertise Here'}
                        </p>
                        {ad.description && (
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{ad.description}</p>
                        )}
                    </div>

                    {/* CTA */}
                    <div className="flex-shrink-0 bg-blue-600 group-hover:bg-blue-700 text-white text-[12px] font-bold px-4 py-2 rounded-xl transition-colors whitespace-nowrap">
                        {ad.button_text || ad.cta_text || 'Learn More'} →
                    </div>
                </a>

                {/* Rotation dots */}
                {ads.length > 1 && (
                    <div className="flex justify-center gap-1 pb-2">
                        {ads.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`h-1 rounded-full transition-all ${i === current ? 'w-5 bg-blue-500' : 'w-1 bg-slate-200'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
