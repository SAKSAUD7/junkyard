import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api, BASE_URL } from '../services/api'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

function getAdImageUrl(ad) {
    if (!ad.image && !ad.image_url) return null;
    const img = ad.image_url || ad.image;
    if (img.startsWith('http')) return img;
    return `${BASE_URL}${img}`;
}

// Organic verified yard fallbacks strictly guaranteeing 4 cards per placement without empty whitespace
const FALLBACK_ORGANIC_YARDS = [
    {
        id: 'org-1',
        title: '10-10 Express Auto Parts',
        location: 'United States',
        rating: 4.8,
        reviews_count: 110,
        tag: 'SPONSORED',
        button_text: 'Visit Website',
        redirect_url: '/junkyards',
        is_organic: true,
        template_type: 'sponsored',
        gradient: 'from-purple-600 to-indigo-700',
        initials: '1E',
        features: ['Used Auto Parts', 'Fast Response']
    },
    {
        id: 'org-2',
        title: 'Pay Less Auto Parts',
        location: 'Middletown, OH',
        rating: 4.8,
        reviews_count: 124,
        tag: 'SPONSORED',
        button_text: 'View Inventory',
        redirect_url: '/junkyards',
        is_organic: true,
        template_type: 'sponsored',
        gradient: 'from-blue-600 to-indigo-700',
        initials: 'PL',
        features: ['Large Inventory', 'Nationwide shipping']
    },
    {
        id: 'org-3',
        title: 'Hanover Auto Wreckers',
        location: 'Hanover, ON',
        rating: 4.6,
        reviews_count: 89,
        tag: 'SPONSORED',
        button_text: 'Find Parts',
        redirect_url: '/junkyards',
        is_organic: true,
        template_type: 'sponsored',
        gradient: 'from-emerald-500 to-teal-700',
        initials: 'HA',
        features: ['Quality used parts', 'All makes & models']
    },
    {
        id: 'org-4',
        title: 'Meier Auto Salvage',
        location: 'Sioux City, IA',
        rating: 4.5,
        reviews_count: 76,
        tag: 'PREMIUM',
        button_text: 'Call Now',
        redirect_url: '/junkyards',
        is_organic: true,
        template_type: 'premium',
        gradient: 'from-amber-400 to-amber-600',
        initials: 'M',
        features: ['Quality used parts', 'Expert support']
    }
];

export default function AdCarousel({ 
    slotGroup = 'carousel_1', 
    page = 'all', 
    title = "Featured Salvage Partners",
    subtitle = "Trusted junkyards and auto recyclers offering quality used auto parts.",
    autoRotateSeconds = 2
}) {
    const [ads, setAds] = useState([])
    const [mobileIndex, setMobileIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const touchStartX = useRef(0)
    const touchEndX = useRef(0)

    // Load active ads from API
    useEffect(() => {
        let isMounted = true;
        api.getAds({ slot: slotGroup, target_page: page })
            .then(data => {
                if (!isMounted) return;
                const results = Array.isArray(data) ? data : (data?.results || []);
                setAds(results);
            })
            .catch(() => {
                if (isMounted) setAds([]);
            });
        return () => { isMounted = false; };
    }, [slotGroup, page]);

    // Track ad impression once per browser session per ad
    useEffect(() => {
        if (!ads || ads.length === 0) return;
        ads.forEach(ad => {
            if (ad.id && !ad.is_organic) {
                const sessionKey = `ad_imp_${ad.id}`;
                try {
                    if (!sessionStorage.getItem(sessionKey)) {
                        sessionStorage.setItem(sessionKey, '1');
                        api.trackAdImpression(ad.id).then(result => {
                            // The ad was replaced or deactivated after this payload was
                            // fetched; drop the stale card rather than retrying it.
                            if (result?.status === 'not_found') {
                                setAds(current => current.filter(item => item.id !== ad.id));
                            }
                        });
                    }
                } catch {
                    // sessionStorage may fail in private mode; ignore
                }
            }
        });
    }, [ads]);

    // Merge ads with fallback organic yards to guarantee exactly 4 cards
    const combinedItems = (() => {
        const list = [...ads];
        if (list.length >= 4) return list.slice(0, 4);
        
        for (const fb of FALLBACK_ORGANIC_YARDS) {
            if (list.length >= 4) break;
            if (!list.some(item => (item.title || item.name) === fb.title)) {
                list.push(fb);
            }
        }
        return list;
    })();

    // 2-second auto-rotation interval
    useEffect(() => {
        if (isPaused || combinedItems.length <= 1) return;

        const interval = setInterval(() => {
            // Check if tab is visible
            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
                return;
            }
            setMobileIndex(prev => (prev + 1) % combinedItems.length);
        }, autoRotateSeconds * 1000);

        return () => clearInterval(interval);
    }, [isPaused, combinedItems.length, autoRotateSeconds]);

    // Touch Swipe Handlers for Mobile
    const handleTouchStart = (e) => {
        setIsPaused(true);
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        setIsPaused(false);
        const distance = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 40;

        if (distance > minSwipeDistance) {
            // Swiped Left -> Next Card
            setMobileIndex(prev => (prev + 1) % combinedItems.length);
        } else if (distance < -minSwipeDistance) {
            // Swiped Right -> Previous Card
            setMobileIndex(prev => (prev - 1 + combinedItems.length) % combinedItems.length);
        }
    };

    const handleCardClick = (item) => {
        if (!item.is_organic && item.id) {
            api.trackAdClick(item.id).catch(() => {});
        }
    };

    return (
        <section 
            className="w-full my-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto select-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Header with Title, Subtitle, and View All Link */}
            {title && (
                <div className="flex items-end justify-between mb-4 sm:mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            <h3 
                                className="text-sm sm:text-lg font-black text-slate-900 uppercase tracking-wider"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                {title}
                            </h3>
                        </div>
                        {subtitle && (
                            <p className="text-xs sm:text-sm text-slate-500 font-medium hidden sm:block">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <Link 
                        to="/junkyards" 
                        className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group whitespace-nowrap"
                    >
                        <span>View All</span>
                        <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            )}

            {/* ============================================================
                MOBILE VIEW (< lg): 1 Card visible rotating every 2 seconds
            ============================================================ */}
            <div 
                className="block lg:hidden relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="overflow-hidden rounded-3xl min-h-[190px]">
                    {combinedItems.map((item, index) => (
                        <div 
                            key={`mobile-${item.id || index}`}
                            className={`transition-all duration-500 ease-in-out ${
                                index === mobileIndex 
                                    ? 'opacity-100 scale-100 block' 
                                    : 'opacity-0 scale-98 hidden pointer-events-none'
                            }`}
                        >
                            <AdCard item={item} onCardClick={() => handleCardClick(item)} />
                        </div>
                    ))}
                </div>

                {/* Mobile Pagination Dot Indicators (4 dots for 4 cards) */}
                <div className="flex justify-center items-center gap-2 mt-4">
                    {combinedItems.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setMobileIndex(i)}
                            aria-label={`Go to slide ${i + 1}`}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                mobileIndex === i 
                                    ? 'w-7 bg-blue-600 shadow-sm shadow-blue-500/30' 
                                    : 'w-2 bg-slate-200 hover:bg-slate-300'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* ============================================================
                DESKTOP VIEW (>= lg): 4 Cards visible simultaneously in full row
            ============================================================ */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-4 sm:gap-5">
                {combinedItems.map((item, index) => (
                    <AdCard key={`desktop-${item.id || index}`} item={item} onCardClick={() => handleCardClick(item)} />
                ))}
            </div>
        </section>
    );
}

// ── Reusable Ad Card Component (Sponsored & Premium variants) ────────────────
function AdCard({ item, onCardClick }) {
    const isOrganic = !!item.is_organic;
    const isPremium = item.template_type === 'premium';
    const clickUrl = item.redirect_url || item.click_url || item.cta_url || '/junkyards';
    const imageUrl = getAdImageUrl(item);
    const title = item.title || item.name || 'Verified Auto Recycler';
    const location = item.location || 'United States';
    const rating = item.rating || null;
    const reviewsCount = item.reviews_count || null;
    const initials = item.initials || title.substring(0, 2).toUpperCase();
    const buttonText = item.button_text || (isPremium ? 'Call Now' : 'Visit Website');
    const features = item.features || ['Used Auto Parts', 'Fast Response'];

    if (isPremium && !isOrganic) {
        return (
            <div 
                className="w-full rounded-2xl bg-[#0B1528] text-white border border-slate-800 shadow-[0_8px_30px_rgba(11,21,40,0.35)] p-4 sm:p-5 flex flex-col justify-between relative group hover:border-amber-500/50 hover:shadow-[0_12px_36px_rgba(245,158,11,0.15)] transition-all duration-300"
            >
                {/* Top Row: Initials Avatar + Name & Location + Premium Badge */}
                <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                            {/* Avatar */}
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                                {initials}
                            </div>
                            
                            {/* Title & Location */}
                            <div className="min-w-0 flex-1">
                                <h4 
                                    className="font-black text-sm sm:text-[15px] text-white truncate leading-tight group-hover:text-amber-400 transition-colors"
                                    title={title}
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    {title}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 font-medium">
                                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="truncate" title={location}>{location}</span>
                                </div>
                            </div>
                        </div>

                        {/* Gold Premium Badge */}
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-400/15 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full shrink-0">
                            ★ PREMIUM
                        </span>
                    </div>

                    {/* Rating Bar */}
                    {rating && (
                    <div className="flex items-center gap-1 text-[12px] font-bold text-amber-400 mb-3">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{rating}</span>
                        {reviewsCount && (
                            <span className="text-slate-400 font-normal">({reviewsCount} reviews)</span>
                        )}
                    </div>
                    )}

                    {/* Features Tag Pills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {features.map((f, i) => (
                            <span 
                                key={i} 
                                className="text-[10px] font-semibold text-slate-300 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded-md"
                            >
                                {f}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Bottom Row: AD Disclosure + Call / Quote Button */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">
                        AD
                    </span>
                    <a
                        href={clickUrl}
                        target={clickUrl.startsWith('http') ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        onClick={onCardClick}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <span>{buttonText}</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </div>
        );
    }

    // Standard SPONSORED Card
    return (
        <div 
            className="w-full rounded-2xl bg-white text-slate-900 border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-4 sm:p-5 flex flex-col justify-between relative group hover:border-blue-400 hover:shadow-[0_12px_32px_rgba(37,99,235,0.1)] transition-all duration-300"
        >
            {/* Top Row: Initials Avatar + Name & Location + Sponsored Badge */}
            <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient || 'from-blue-600 to-indigo-700'} text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20`}>
                            {initials}
                        </div>
                        
                        {/* Title & Location */}
                        <div className="min-w-0 flex-1">
                            <h4 
                                className="font-black text-sm sm:text-[15px] text-slate-900 truncate leading-tight group-hover:text-blue-600 transition-colors"
                                title={title}
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                {title}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 font-medium">
                                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate" title={location}>{location}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sponsored Badge */}
                    {isOrganic ? (
                        <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full shrink-0">
                            Recommended
                        </span>
                    ) : (
                        <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200/80 px-2 py-0.5 rounded-full shrink-0">
                            SPONSORED
                        </span>
                    )}
                </div>

                {/* Rating Bar */}
                {rating && (
                <div className="flex items-center gap-1 text-[12px] font-bold text-amber-500 mb-3">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{rating}</span>
                    {reviewsCount && (
                        <span className="text-slate-400 font-normal">({reviewsCount} reviews)</span>
                    )}
                </div>
                )}

                {/* Features Tag Pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {features.map((f, i) => (
                        <span 
                            key={i} 
                            className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                        >
                            {f}
                        </span>
                    ))}
                </div>
            </div>

            {/* Bottom Row: AD Disclosure + CTA Link */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                    {isOrganic ? '' : 'AD'}
                </span>
                <a
                    href={clickUrl}
                    target={clickUrl.startsWith('http') ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    onClick={onCardClick}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-black text-blue-600 hover:text-blue-700 group-hover:translate-x-0.5 transition-all"
                >
                    <span>{buttonText}</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            </div>
        </div>
    );
}
