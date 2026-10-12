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
    faq: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1920&auto=format&fit=crop',
    blog: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1920&auto=format&fit=crop',
    how_it_works: 'https://images.unsplash.com/photo-1617813374374-ea4aa0d37ead?q=80&w=1920&auto=format&fit=crop',
    quote_request: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920&auto=format&fit=crop',
    sell_your_car: 'https://images.unsplash.com/photo-1581266064-4dce3e2af8a3?q=80&w=1920&auto=format&fit=crop',
    about: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1920&auto=format&fit=crop',
    contact: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=1920&auto=format&fit=crop',
};

const LOCAL_PAGE_HEROES = {
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
    overlayOpacity = 0.42,
    height = 'medium',
    children
}) {
    // Always call the hook — pass null when page not provided so it's a no-op.
    const { get } = useCMS(page || null);

    const defaultImage = backgroundImage 
        || (page && LOCAL_PAGE_HEROES[page])
        || (page && PAGE_FALLBACK_IMAGES[page]) 
        || '/heroes/junkyard-aerial.webp';

    // CMS override wins if it is a non-empty string; otherwise fallback
    const cmsBg = page ? get('hero', 'background_image', '') : '';
    const resolvedBg = (cmsBg && typeof cmsBg === 'string' && cmsBg.trim() !== '') ? cmsBg : defaultImage;
    const backupBg = page && PAGE_FALLBACK_IMAGES[page] ? PAGE_FALLBACK_IMAGES[page] : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920&auto=format&fit=crop';

    const [imgSrc, setImgSrc] = React.useState(resolvedBg);

    React.useEffect(() => {
        setImgSrc(resolvedBg);
    }, [resolvedBg]);

    const heights = {
        small: 'py-16 md:py-20',
        medium: 'py-20 md:py-28 min-h-[360px]',
        large: 'py-24 md:py-36 min-h-[440px]'
    };

    return (
        <section className={`relative w-full ${heights[height]} flex items-center justify-center overflow-hidden bg-slate-950`}>
            {/* Vivid Background Image Engine with fallback support */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                    src={imgSrc}
                    alt=""
                    onError={() => {
                        if (imgSrc !== backupBg) setImgSrc(backupBg);
                    }}
                    className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.08] transition-transform duration-[25s] ease-out scale-105"
                />
            </div>
            
            {/* Ambient Lighting & Depth Gradients */}
            <div 
                className="absolute inset-0 z-10 bg-gradient-to-b from-slate-950/70 via-slate-900/40 to-slate-950/85"
                style={{ opacity: overlayOpacity }}
            />
            <div className="absolute inset-0 z-10 bg-radial-at-t from-blue-600/15 via-transparent to-transparent pointer-events-none" />

            {/* Glowing bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent z-20" />

            {/* Content Container */}
            <div className="relative z-20 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                {tag && (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 bg-white/10 hover:bg-white/15 border border-white/25 backdrop-blur-md shadow-lg shadow-black/20 transition-all">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-white text-[12px] font-extrabold uppercase tracking-widest">{tag}</span>
                    </div>
                )}
                
                {(title || titleAccent) && (
                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-5 tracking-tight drop-shadow-md" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                        {title} {titleAccent && <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">{titleAccent}</span>}
                    </h1>
                )}
                
                {subtitle && (
                    <p className="text-[15px] sm:text-[18px] md:text-[20px] text-slate-200 font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-sm">
                        {subtitle}
                    </p>
                )}

                {children && (
                    <div className="mt-7 w-full flex justify-center">
                        {children}
                    </div>
                )}
            </div>
        </section>
    );
}
