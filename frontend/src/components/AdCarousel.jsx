import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, BASE_URL } from '../services/api'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

function getAdImageUrl(ad) {
    if (!ad.image && !ad.image_url) return null;
    const img = ad.image_url || ad.image;
    if (img.startsWith('http')) return img;
    return `${BASE_URL}${img}`;
}

// Organic verified yard fallbacks to guarantee 4 cards per placement without empty whitespace
const FALLBACK_ORGANIC_YARDS = [
    {
        id: 'org-1',
        title: 'Pay Less Auto Parts',
        location: 'Middletown, OH',
        rating: 4.8,
        reviews_count: 142,
        tag: 'Verified Salvage',
        button_text: 'View Inventory',
        redirect_url: '/junkyards',
        is_organic: true,
        gradient: 'from-blue-600 to-indigo-700',
        initials: 'PL',
        features: ['OEM Used Parts', 'Warranty Guaranteed']
    },
    {
        id: 'org-2',
        title: 'Hanover Auto Wreckers',
        location: 'Hanover, ON',
        rating: 4.9,
        reviews_count: 98,
        tag: 'Top Rated',
        button_text: 'Find Parts',
        redirect_url: '/junkyards',
        is_organic: true,
        gradient: 'from-emerald-500 to-teal-700',
        initials: 'HA',
        features: ['All Makes & Models', 'Express Delivery']
    },
    {
        id: 'org-3',
        title: 'A-1 Rylie Auto Parts',
        location: 'Dallas, TX',
        rating: 4.7,
        reviews_count: 105,
        tag: 'Premier Partner',
        button_text: 'Get Quote',
        redirect_url: '/quote',
        is_organic: true,
        gradient: 'from-blue-500 to-cyan-700',
        initials: 'A1',
        features: ['Large Inventory', 'Fast Turnaround']
    },
    {
        id: 'org-4',
        title: 'Meier Auto Salvage',
        location: 'Sioux City, IA',
        rating: 4.9,
        reviews_count: 176,
        tag: 'Verified Yard',
        button_text: 'Check Stock',
        redirect_url: '/junkyards',
        is_organic: true,
        gradient: 'from-amber-500 to-orange-600',
        initials: 'M',
        features: ['Engines & Transmissions', 'Tested Parts']
    },
    {
        id: 'org-5',
        title: 'Bessler Auto Parts',
        location: 'Hebron, KY',
        rating: 4.8,
        reviews_count: 210,
        tag: 'Verified Yard',
        button_text: 'Browse Parts',
        redirect_url: '/junkyards',
        is_organic: true,
        gradient: 'from-purple-600 to-indigo-800',
        initials: 'BA',
        features: ['Recycled OEM', 'Nationwide Shipping']
    },
    {
        id: 'org-6',
        title: 'Midwest Auto Recyclers',
        location: 'Chicago, IL',
        rating: 4.9,
        reviews_count: 130,
        tag: 'Top Rated',
        button_text: 'View Yard',
        redirect_url: '/junkyards',
        is_organic: true,
        gradient: 'from-rose-500 to-pink-700',
        initials: 'MA',
        features: ['Late Model Wrecks', 'Certified Quality']
    }
];

export default function AdCarousel({ slotGroup = 'carousel_1', page = 'all', title = "" }) {
    const [ads, setAds] = useState([])
    const [pageIndex, setPageIndex] = useState(0)

    useEffect(() => {
        let isMounted = true;
        api.getAds({ slot: slotGroup, target_page: page })
            .then(data => {
                if (!isMounted) return;
                const results = Array.isArray(data) ? data : (data?.results || []);
                setAds(results);
            })
            .catch(() => {
                // Network / endpoint graceful fallback
                if (isMounted) setAds([]);
            });
        return () => { isMounted = false; };
    }, [slotGroup, page]);

    // Merge ads with organic yard fallbacks to strictly guarantee exactly 4 cards per row
    const combinedItems = (() => {
        const list = [...ads];
        if (list.length >= 4) return list;
        
        // Fill up to 4 using unique fallbacks
        for (const fb of FALLBACK_ORGANIC_YARDS) {
            if (list.length >= 4) break;
            if (!list.some(item => (item.title || item.name) === fb.title)) {
                list.push(fb);
            }
        }
        return list;
    })();

    const ITEMS_PER_PAGE = 4;
    const totalPages = Math.ceil(combinedItems.length / ITEMS_PER_PAGE);
    const currentPage = Math.min(pageIndex, Math.max(0, totalPages - 1));
    const currentItems = combinedItems.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

    return (
        <section className="w-full my-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
            {/* Header with Title and Pagination Controls */}
            {title && (
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                        <h3 
                            className="text-[13px] sm:text-[15px] font-black text-slate-900 uppercase tracking-[0.08em] flex items-center gap-2"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            <span>{title}</span>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100/80 px-2 py-0.5 rounded-full lowercase first-letter:uppercase tracking-normal">
                                Verified
                            </span>
                        </h3>
                    </div>

                    <div className="flex items-center gap-2">
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1.5">
                                <button 
                                    onClick={() => setPageIndex(p => (p > 0 ? p - 1 : totalPages - 1))}
                                    aria-label="Previous ad page"
                                    className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 active:scale-95 transition-all"
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>
                                <span className="text-xs font-semibold text-slate-400 px-1">
                                    {currentPage + 1} / {totalPages}
                                </span>
                                <button 
                                    onClick={() => setPageIndex(p => (p < totalPages - 1 ? p + 1 : 0))}
                                    aria-label="Next ad page"
                                    className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 active:scale-95 transition-all"
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* 4-Card Responsive Grid without Horizontal Scrolling or Gaps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {currentItems.map((item, index) => (
                    <AdGridCard key={`${item.id || index}-${currentPage}`} item={item} />
                ))}
            </div>
        </section>
    );
}

function AdGridCard({ item }) {
    const isPremium = item.template_type === 'premium';
    const isOrganic = Boolean(item.is_organic);
    const clickUrl = item.redirect_url || item.click_url || item.cta_url || '/junkyards';
    const imageUrl = getAdImageUrl(item);
    const title = item.title || item.name || 'Verified Auto Recycler';
    const location = item.location || 'United States';
    const rating = item.rating || 4.8;
    const reviewsCount = item.reviews_count || 110;
    const buttonText = item.button_text || 'Visit Yard';

    const accentPalette = [
        { gradient: 'from-blue-600 to-indigo-700', light: 'bg-blue-50 text-blue-700 border-blue-200' },
        { gradient: 'from-violet-600 to-purple-800', light: 'bg-purple-50 text-purple-700 border-purple-200' },
        { gradient: 'from-emerald-600 to-teal-800', light: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { gradient: 'from-amber-500 to-orange-700', light: 'bg-amber-50 text-amber-700 border-amber-200' },
    ];
    const palette = accentPalette[(title.charCodeAt(0) || 65) % accentPalette.length];

    const initials = item.initials || (title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'JY');

    // Link target: if internal URL use react router link behaviour or standard anchor for external
    const isExternal = clickUrl.startsWith('http');
    const LinkComponent = isExternal ? 'a' : Link;
    const linkProps = isExternal ? { href: clickUrl, target: '_blank', rel: 'noopener noreferrer' } : { to: clickUrl };

    if (isPremium) {
        return (
            <LinkComponent
                {...linkProps}
                className="group relative flex flex-col justify-between rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br from-[#0c1a3a] via-[#0f2552] to-[#161244] border border-blue-900/60 shadow-[0_8px_30px_rgba(12,26,58,0.25)] min-h-[220px]"
            >
                {/* Ambient glow mesh */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-400/30 transition-all duration-500" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-indigo-500/15 rounded-full blur-xl pointer-events-none" />

                <div>
                    <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center font-black text-white text-base shrink-0 group-hover:scale-105 transition-transform duration-300">
                            {imageUrl ? (
                                <img src={imageUrl} alt={title} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                            ) : (
                                <span>{initials}</span>
                            )}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            ★ Premium
                        </span>
                    </div>

                    <h4 
                        className="text-[15px] font-black text-white leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors relative z-10"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        {title}
                    </h4>

                    <p className="text-[12px] text-blue-200/80 font-medium flex items-center gap-1.5 mt-1 relative z-10">
                        <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="truncate">{location}</span>
                    </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-4 relative z-10">
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                        <span>★ {rating}</span>
                        <span className="text-white/40 text-[10px]">({reviewsCount})</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 group-hover:bg-blue-500 px-3.5 py-1.5 rounded-xl transition-all shadow-md">
                        {buttonText}
                        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </span>
                </div>
            </LinkComponent>
        );
    }

    // Standard / Organic Card
    return (
        <LinkComponent
            {...linkProps}
            className="group relative flex flex-col justify-between rounded-2xl p-5 bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(37,99,235,0.12)] hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 min-h-[220px]"
        >
            <div>
                {/* Header row: Avatar + Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-base shrink-0 shadow-sm bg-gradient-to-br ${item.gradient || palette.gradient} group-hover:scale-105 transition-transform duration-300`}>
                            {imageUrl ? (
                                <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-xl" onError={e => e.target.style.display='none'} />
                            ) : (
                                <span>{initials}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h4 
                                className="text-[14px] sm:text-[15px] font-black text-slate-900 leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                {title}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5 truncate">
                                <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                <span className="truncate">{location}</span>
                            </p>
                        </div>
                    </div>

                    <span className={`inline-flex items-center text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${isOrganic ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {isOrganic ? 'VERIFIED' : 'SPONSORED'}
                    </span>
                </div>

                {/* Features & Ratings */}
                <div className="my-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 mb-2">
                        <span>★ {rating}</span>
                        <span className="text-slate-400 font-normal text-[11px]">({reviewsCount} reviews)</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {(item.features || ['Used Auto Parts', 'Fast Response']).slice(0, 2).map((feat, fidx) => (
                            <span key={fidx} className="text-[10px] font-semibold text-slate-600 bg-slate-100/90 px-2 py-0.5 rounded-md">
                                {feat}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA row */}
            <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between mt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {isOrganic ? 'Verified Partner' : 'Ad'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all">
                    {buttonText}
                    <svg className="w-3.5 h-3.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                </span>
            </div>
        </LinkComponent>
    );
}
