import React from 'react';
import { useCMS } from '../hooks/useCMS';

/**
 * PageHero — Unified premium automotive hero section for all public pages.
 *
 * If a `page` prop is provided, the component will try to pull
 * the background image from the CMS (hero › background_image).
 * The `backgroundImage` prop is used as a fallback.
 */
const PAGE_FALLBACK_IMAGES = {
    faq: '/heroes/parts-warehouse.png',
    blog: '/heroes/salvage-sunset.png',
    how_it_works: '/heroes/mechanic-parts.png',
    quote_request: '/heroes/junkyard-aerial.webp',
    sell_your_car: '/heroes/stacked-cars.png',
    about: '/heroes/junkyard-aerial.webp',
    contact: '/heroes/aerial-night.png',
};

export default function PageHero({
    page,                // CMS page key (e.g. 'about', 'faq'). Optional.
    tag,
    title,
    titleAccent,
    subtitle,
    backgroundImage,
    overlayOpacity = 0.65,
    height = 'medium',
    children
}) {
    // Always call the hook — pass null when page not provided so it's a no-op.
    const { get } = useCMS(page || null);

    const defaultImage = (page && PAGE_FALLBACK_IMAGES[page]) 
        || backgroundImage 
        || '/heroes/junkyard-aerial.webp';

    // CMS override wins if it is a non-empty string; otherwise fallback
    const cmsBg = page ? get('hero', 'background_image', '') : '';
    const resolvedBg = (cmsBg && typeof cmsBg === 'string' && cmsBg.trim() !== '') ? cmsBg : defaultImage;

    const heights = {
        small: 'py-16 md:py-24',
        medium: 'py-20 md:py-32 min-h-[380px]',
        large: 'py-28 md:py-40 min-h-[460px]'
    };

    return (
        <section className={`relative w-full ${heights[height]} flex items-center justify-center overflow-hidden bg-slate-900`}>
            {/* Background Image Engine */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] ease-linear scale-110"
                style={{ backgroundImage: `url('${resolvedBg}')` }}
            />
            
            {/* Core Dark Overlay */}
            <div 
                className="absolute inset-0 z-10 bg-slate-900"
                style={{ opacity: overlayOpacity }}
            />
            
            {/* Gradient Overlay for bottom blending */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-20" />

            {/* Content Container */}
            <div className="relative z-20 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                {tag && (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 bg-white/10 border border-white/20 backdrop-blur-md animate-fade-in-up">
                        <span className="text-white text-[12px] font-bold uppercase tracking-widest">{tag}</span>
                    </div>
                )}
                
                {(title || titleAccent) && (
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight animate-fade-in-up delay-75" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                        {title} {titleAccent && <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{titleAccent}</span>}
                    </h1>
                )}
                
                {subtitle && (
                    <p className="text-[17px] md:text-[20px] text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-150">
                        {subtitle}
                    </p>
                )}

                {children && (
                    <div className="mt-8 animate-fade-in-up delay-200 w-full flex justify-center">
                        {children}
                    </div>
                )}
            </div>
        </section>
    );
}
