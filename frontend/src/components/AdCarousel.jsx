import React, { useState, useEffect, useRef } from 'react'
import { api, BASE_URL } from '../services/api'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

function getAdImageUrl(ad) {
    if (!ad.image && !ad.image_url) return null;
    const img = ad.image_url || ad.image;
    if (img.startsWith('http')) return img;
    return `${BASE_URL}${img}`;
}

export default function AdCarousel({ slotGroup = 'carousel', page = 'all', title = "" }) {
    const [ads, setAds] = useState([])
    const scrollRef = useRef(null)

    useEffect(() => {
        api.getAds({ slot_group: slotGroup, target_page: page })
            .then(data => {
                const results = Array.isArray(data) ? data : (data?.results || [])
                
                // Duplicate ads if there are only a few, purely to show the carousel effect
                let displayAds = [...results]
                if (displayAds.length > 0 && displayAds.length < 5) {
                    displayAds = [...displayAds, ...displayAds, ...displayAds].slice(0, 8)
                }

                if (results.length > 0) setAds(displayAds)
            })
            .catch(() => {})
    }, [slotGroup, page])

    const scroll = (direction) => {
        if (scrollRef.current) {
            const cw = scrollRef.current.clientWidth
            const scrollAmount = direction === 'left' ? -(cw * 0.75) : (cw * 0.75)
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        }
    }

    if (ads.length === 0) return null

    return (
        <div className="w-full my-8 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
            {title && (
                <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-[14px] font-black text-[#0f172a] uppercase tracking-[0.1em]">{title}</h3>
                    <div className="h-px bg-slate-100 flex-1"></div>
                </div>
            )}
            
            <div className="relative border border-[#e2e8f0] rounded-[24px] bg-[#f8fafc]/50 p-4 sm:p-6 shadow-[0_2px_12px_rgb(0,0,0,0.02)] overflow-hidden group">
                {/* Left Arrow */}
                {ads.length > 2 && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 focus:outline-none"
                    >
                        <ChevronLeftIcon className="w-6 h-6" strokeWidth={2.5} />
                    </button>
                )}
                
                {/* Scroll Container */}
                <div 
                    ref={scrollRef}
                    className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {ads.map((ad, index) => (
                        <AdCard key={`${ad.id}-${index}`} ad={ad} />
                    ))}
                </div>

                {/* Right Arrow */}
                {ads.length > 2 && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all opacity-0 group-hover:opacity-100 focus:outline-none"
                    >
                        <ChevronRightIcon className="w-6 h-6" strokeWidth={2.5} />
                    </button>
                )}
            </div>
        </div>
    )
}

function AdCard({ ad }) {
    const isPremium = ad.template_type === 'premium'; 
    const clickUrl = ad.redirect_url || ad.click_url || ad.cta_url || '#';
    const imageUrl = getAdImageUrl(ad);

    if (isPremium) {
        return (
            <a 
                href={clickUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-shrink-0 w-[85vw] sm:w-[480px] h-[200px] flex items-center rounded-[20px] bg-gradient-to-br from-[#eff6ff] to-[#e0e7ff] p-6 snap-start hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden group/card border border-[#bfdbfe]/50"
            >
                {imageUrl && (
                    <div className="absolute right-0 top-0 w-1/2 h-full opacity-30 mix-blend-multiply pointer-events-none group-hover/card:scale-110 transition-transform duration-700">
                         <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
                
                <div className="relative z-10 w-[65%] pr-4 flex flex-col justify-center h-full">
                    <div className="mb-4">
                        <h4 className="text-[24px] sm:text-[28px] font-black text-[#1e3a8a] leading-[1.1] mb-1 font-['Outfit'] tracking-tight group-hover/card:text-blue-900 transition-colors">{ad.title}</h4>
                        <p className="text-[16px] font-black text-[#3b82f6] mb-1 leading-tight">
                            Maximum Visibility
                        </p>
                        <p className="text-[14px] font-bold text-[#60a5fa] leading-tight">
                            Drive More Sales
                        </p>
                    </div>
                    <div>
                        <div className="inline-flex items-center justify-center bg-blue-600 text-white font-bold px-6 py-2.5 rounded-[12px] text-[13px] shadow-sm transition-all group-hover/card:bg-blue-700 hover:shadow-md">
                            {ad.button_text || 'Advertise Now'}
                        </div>
                    </div>
                </div>
                {imageUrl && (
                    <div className="relative z-10 w-[35%] flex justify-end items-center pointer-events-none">
                        <img src={imageUrl} alt={ad.title} className="w-full h-auto max-h-[140px] object-contain drop-shadow-xl group-hover/card:scale-110 transition-transform duration-500" />
                    </div>
                )}
            </a>
        )
    }

    // Standard Card
    return (
        <a 
             href={clickUrl} 
             target="_blank" 
             rel="noopener noreferrer"
             className="flex-shrink-0 w-[85vw] sm:w-[320px] h-[200px] rounded-[20px] bg-white border border-[#f1f5f9] p-6 snap-start flex flex-col justify-center hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:border-[#cbd5e1] transition-all group/card hover:-translate-y-1 relative"
        >
             <span className="absolute top-5 right-5 bg-[#f8fafc] text-[#94a3b8] border border-slate-100 px-2 py-0.5 text-[8px] rounded-md font-extrabold uppercase tracking-widest">AD</span>
             
             <div className="flex items-center gap-4 h-full">
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
                       <div>
                           <h4 className="font-black text-[#0f172a] text-[18px] sm:text-[20px] mb-2 group-hover/card:text-blue-600 transition-colors line-clamp-2 leading-tight font-['Outfit'] tracking-tight">{ad.title}</h4>
                           <p className="text-[13px] font-semibold text-[#64748b] mb-4 line-clamp-2 leading-relaxed">{ad.description || 'Top Quality Used Parts'}</p>
                       </div>
                       
                       <div>
                           <div className="inline-flex items-center text-[12px] font-bold text-[#475569] bg-[#f8fafc] border border-[#f1f5f9] px-4 py-2.5 rounded-[10px] group-hover/card:bg-slate-100 group-hover/card:text-slate-900 transition-all">
                               {ad.button_text || 'Visit Website'}
                           </div>
                       </div>
                  </div>

                  {imageUrl ? (
                      <div className="w-[84px] h-[84px] sm:w-[94px] sm:h-[94px] flex-shrink-0 relative group-hover/card:scale-105 transition-transform duration-500">
                          <div className="absolute inset-0 bg-[#f1f5f9] rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                          <img src={imageUrl} alt={ad.title} className="relative w-full h-full object-cover rounded-full border-4 border-white shadow-[0_4px_12px_rgb(0,0,0,0.05)]" />
                      </div>
                  ) : (
                      <div className="w-[84px] h-[84px] sm:w-[94px] sm:h-[94px] flex-shrink-0 bg-slate-50 rounded-full border-4 border-white shadow-sm flex items-center justify-center">
                          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                  )}
             </div>
        </a>
    )
}
