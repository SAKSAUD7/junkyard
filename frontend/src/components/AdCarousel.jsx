import React, { useState, useEffect, useRef } from 'react'
import { api, BASE_URL } from '../services/api'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

function getAdImageUrl(ad) {
    if (!ad.image && !ad.image_url) return null;
    const img = ad.image_url || ad.image;
    if (img.startsWith('http')) return img;
    return `${BASE_URL}${img}`;
}

export default function AdCarousel({ slotGroup = 'carousel_1', page = 'all', title = "" }) {
    const [ads, setAds] = useState([])
    const scrollRef = useRef(null)
    const isInteracting = useRef(false)

    useEffect(() => {
        // Use exact slot to avoid pulling all carousel_* slots at once
        api.getAds({ slot: slotGroup, target_page: page })
            .then(data => {
                const results = Array.isArray(data) ? data : (data?.results || [])
                if (results.length > 0) setAds(results)
            })
            .catch(() => {})
    }, [slotGroup, page])

    useEffect(() => {
        if (ads.length <= 1) return;
        const SPEED = 1.0; // px per 16ms tick

        const timer = setInterval(() => {
            if (!scrollRef.current || isInteracting.current) return;
            const el = scrollRef.current;
            el.scrollLeft += SPEED;
            if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
                el.scrollLeft = 0;
            }
        }, 16);

        return () => clearInterval(timer);
    }, [ads]);

    if (ads.length === 0) return null;

    return (
        <div className="w-full my-8 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
            {title && (
                <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-[14px] font-black text-[#0f172a] uppercase tracking-[0.1em]">{title}</h3>
                    <div className="h-px bg-slate-100 flex-1"></div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                isInteracting.current = true;
                                if(scrollRef.current) scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
                                setTimeout(() => isInteracting.current = false, 1000);
                            }}
                            className="p-1.5 rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-400 transition-all"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => {
                                isInteracting.current = true;
                                if(scrollRef.current) scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                                setTimeout(() => isInteracting.current = false, 1000);
                            }}
                            className="p-1.5 rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-400 transition-all"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
            
            <div className="relative border border-[#e2e8f0] rounded-[24px] bg-[#f8fafc]/50 p-4 sm:p-6 shadow-[0_2px_12px_rgb(0,0,0,0.02)] overflow-hidden group">
                <style>{`
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
                <div className="overflow-hidden w-full relative">
                    {/* Fade gradients at edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#f8fafc] to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#f8fafc] to-transparent z-10 pointer-events-none" />

                    <div 
                        ref={scrollRef}
                        className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        onMouseEnter={() => isInteracting.current = true}
                        onMouseLeave={() => isInteracting.current = false}
                        onTouchStart={() => isInteracting.current = true}
                        onTouchEnd={() => isInteracting.current = false}
                        onTouchCancel={() => isInteracting.current = false}
                    >
                        {ads.map((ad, index) => (
                            <AdCard key={`${ad.id}-${index}`} ad={ad} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function AdCard({ ad }) {
    const isPremium = ad.template_type === 'premium';
    const isCompact = ad.template_type === 'compact';
    const clickUrl = ad.redirect_url || ad.click_url || ad.cta_url || '#';
    const imageUrl = getAdImageUrl(ad);

    // Color accent based on first char of title for variety
    const accentPalette = [
        { bg: 'from-blue-500 to-blue-700',    light: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
        { bg: 'from-violet-500 to-purple-700', light: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9' },
        { bg: 'from-emerald-500 to-teal-600',  light: '#ecfdf5', border: '#a7f3d0', text: '#047857' },
        { bg: 'from-orange-400 to-red-600',    light: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
        { bg: 'from-sky-400 to-cyan-600',      light: '#f0f9ff', border: '#bae6fd', text: '#0369a1' },
    ];
    const palette = accentPalette[(ad.title?.charCodeAt(0) || 65) % accentPalette.length];

    // Initials fallback
    const initials = ad.title
        ? ad.title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
        : 'AD';

    if (isPremium) {
        return (
            <a
                href={clickUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-[280px] sm:w-[340px] h-[180px] rounded-2xl overflow-hidden relative group/card block"
                style={{
                    background: 'linear-gradient(135deg, #0c1a3a 0%, #0f2055 50%, #1a1040 100%)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}
            >
                {/* Grid mesh */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }} />

                {/* Glow orbs */}
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl pointer-events-none group-hover/card:bg-blue-400/30 transition-all duration-700" />
                <div className="absolute -bottom-4 right-8 w-20 h-20 bg-violet-400/20 rounded-full blur-2xl pointer-events-none group-hover/card:bg-violet-400/30 transition-all duration-700" />

                {/* Image */}
                {imageUrl && (
                    <div className="absolute right-0 top-0 w-2/5 h-full overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1a3a] via-[#0c1a3a]/60 to-transparent z-10" />
                        <img src={imageUrl} alt="" className="w-full h-full object-cover opacity-35 group-hover/card:opacity-50 group-hover/card:scale-105 transition-all duration-700" onError={e => e.target.parentElement.style.display='none'} />
                    </div>
                )}

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between h-full p-5">
                    <div>
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/25">
                            ★ Premium
                        </span>
                        <h4 className="mt-2 text-[16px] font-black text-white leading-tight line-clamp-2 max-w-[65%]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {ad.title}
                        </h4>
                    </div>
                    <span className="inline-flex items-center gap-1.5 w-fit px-4 py-2 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#1a56ff] text-white text-[12px] font-bold transition-all group-hover/card:shadow-[0_8px_20px_rgba(79,70,229,0.5)]">
                        {ad.button_text || 'Visit Yard'}
                        <svg className="w-3 h-3 group-hover/card:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </span>
                </div>

                {/* Hover border glow */}
                <div className="absolute inset-0 rounded-2xl border border-white/0 group-hover/card:border-white/10 transition-all duration-300 pointer-events-none" />
            </a>
        );
    }

    if (isCompact) {
        return (
            <a
                href={clickUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-[200px] h-[180px] rounded-2xl bg-white border border-slate-100 p-4 flex flex-col items-center justify-between group/card text-center transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-slate-200"
            >
                {/* Logo */}
                <div className="relative mt-1">
                    {imageUrl ? (
                        <div className="w-14 h-14 rounded-full overflow-hidden border-4 border-slate-50 shadow-sm group-hover/card:scale-105 transition-transform duration-300">
                            <img src={imageUrl} alt={ad.title} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                        </div>
                    ) : (
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${palette.bg} flex items-center justify-center font-black text-lg text-white shadow-sm group-hover/card:scale-105 transition-transform duration-300`}>
                            {initials}
                        </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#1a56ff] rounded-full border-2 border-white flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </span>
                </div>

                <div>
                    <p className="text-[12px] font-black text-slate-900 leading-snug line-clamp-2 group-hover/card:text-blue-700 transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {ad.title}
                    </p>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Sponsored</span>
                </div>

                <span
                    className="w-full py-1.5 rounded-xl text-[11px] font-bold text-center transition-all"
                    style={{ background: palette.light, color: palette.text, border: `1px solid ${palette.border}` }}
                >
                    {ad.button_text || 'Visit'} →
                </span>
            </a>
        );
    }

    // ── Standard carousel card ──────────────────────────────────────────────────
    return (
        <a
            href={clickUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-[260px] sm:w-[300px] h-[180px] rounded-2xl bg-white border border-slate-100 p-4 flex flex-col justify-between group/card transition-all duration-300 hover:shadow-[0_10px_36px_rgba(0,0,0,0.07)] hover:border-slate-200 hover:-translate-y-1 relative overflow-hidden"
        >
            {/* Top accent line with palette color */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${palette.bg}`} />

            {/* Header row */}
            <div className="flex items-center gap-3">
                {imageUrl ? (
                    <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50 group-hover/card:scale-105 transition-transform duration-300">
                        <img src={imageUrl} alt={ad.title} className="w-full h-full object-contain p-1" onError={e => e.target.style.display='none'} />
                    </div>
                ) : (
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${palette.bg} flex items-center justify-center font-black text-sm text-white flex-shrink-0 group-hover/card:scale-105 transition-transform duration-300`}>
                        {initials}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-black text-slate-900 leading-snug line-clamp-2 group-hover/card:text-blue-700 transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {ad.title}
                    </h4>
                </div>
            </div>

            {/* Middle: descriptor */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: palette.light, color: palette.text, border: `1px solid ${palette.border}` }}>Sponsored</span>
                <span className="text-[11px] text-slate-400 font-medium">· Used Auto Parts</span>
            </div>

            {/* CTA row */}
            <div className="flex items-center justify-between">
                <span
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 group-hover/card:shadow-md"
                    style={{ background: palette.light, color: palette.text, border: `1px solid ${palette.border}` }}
                >
                    {ad.button_text || 'Visit Yard'}
                    <svg className="w-2.5 h-2.5 group-hover/card:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </span>
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">AD</span>
            </div>
        </a>
    );
}
