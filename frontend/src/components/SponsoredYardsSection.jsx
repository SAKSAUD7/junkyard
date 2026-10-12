import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DEFAULT_SPONSORED_YARDS = [
    {
        id: 'sp-1',
        name: 'Pay Less Auto Parts',
        initials: 'PL',
        avatarBg: 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white',
        location: 'Middletown, OH',
        isPremium: false,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
        rating: 4.8,
        reviewsCount: 142,
        phone: '+1 (800) 555-0192',
        features: [
            'Large used parts inventory',
            'Quality tested parts',
            'Nationwide shipping'
        ],
        ctaText: 'View Inventory',
        ctaType: 'inventory',
        link: '/junkyards'
    },
    {
        id: 'sp-2',
        name: 'Hanover Auto Wreckers',
        initials: 'HA',
        avatarBg: 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white',
        location: 'Hanover, ON',
        isPremium: false,
        image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=800&auto=format&fit=crop',
        rating: 4.9,
        reviewsCount: 98,
        phone: '+1 (866) 293-3731',
        features: [
            'Quality used parts',
            'All makes & models',
            'Fast shipping (Canada & US)'
        ],
        ctaText: 'Find Parts',
        ctaType: 'parts',
        link: '/junkyards'
    },
    {
        id: 'sp-3',
        name: 'A-1 Rylie Auto Parts',
        initials: 'A1',
        avatarBg: 'bg-gradient-to-br from-red-600 to-rose-800 text-white border border-red-500/30',
        location: 'Dallas, TX',
        isPremium: true,
        image: '/heroes/junkyard-aerial.webp',
        rating: 4.7,
        reviewsCount: 102,
        phone: '+1 (214) 555-0187',
        features: [
            'Extensive inventory',
            'Affordable prices',
            'Fast quote response'
        ],
        ctaText: 'Get a Quote',
        ctaType: 'quote',
        link: '/quote'
    },
    {
        id: 'sp-4',
        name: 'Meier Auto Salvage',
        initials: 'M',
        avatarBg: 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black',
        location: 'Sioux City, IA',
        isPremium: true,
        image: 'https://images.unsplash.com/photo-1620892019318-7b243ebd7f7e?q=80&w=800&auto=format&fit=crop',
        rating: 4.9,
        reviewsCount: 176,
        phone: '+1 (712) 555-0143',
        features: [
            'Quality used parts',
            'All makes & models',
            'Expert support'
        ],
        ctaText: 'Call Now',
        ctaType: 'call',
        link: '/junkyards'
    }
];

export default function SponsoredYardsSection({
    title = 'Featured Partners',
    badgeText = 'Sponsored',
    viewAllLink = '/junkyards',
    viewAllText = 'View All',
    stateFilter = null,
    className = ''
}) {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('jynm_fav_yards') || '[]');
        } catch (_) {
            return [];
        }
    });
    const [activeIndex, setActiveIndex] = useState(0);

    const toggleFavorite = (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        setFavorites(prev => {
            const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
            try {
                localStorage.setItem('jynm_fav_yards', JSON.stringify(next));
            } catch (_) {}
            return next;
        });
    };

    const handleAction = (yard) => {
        if (yard.ctaType === 'call') {
            window.location.href = `tel:${yard.phone.replace(/[^0-9+]/g, '')}`;
        } else if (yard.ctaType === 'quote') {
            navigate('/quote');
        } else {
            navigate(yard.link);
        }
    };

    return (
        <section className={`w-full py-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto ${className}`}>
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full hidden sm:block" />
                    <h2
                        className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 uppercase"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        <span>{title}</span>
                        {badgeText && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full lowercase first-letter:uppercase tracking-normal">
                                {badgeText}
                            </span>
                        )}
                    </h2>
                </div>

                {viewAllLink && (
                    <Link
                        to={viewAllLink}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 group transition-colors"
                    >
                        <span>{viewAllText}</span>
                        <svg
                            className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                )}
            </div>

            {/* Mobile Snap Carousel & Desktop 4-Card Grid */}
            <div className="relative">
                {/* Container: horizontally scrollable on mobile (1 card visible at a time with snap), 4-col grid on lg */}
                <div
                    className="flex lg:grid lg:grid-cols-4 gap-4 overflow-x-auto lg:overflow-visible snap-x snap-mandatory no-scrollbar pb-3 -mx-4 px-4 sm:mx-0 sm:px-0"
                    onScroll={(e) => {
                        const scrollLeft = e.currentTarget.scrollLeft;
                        const width = e.currentTarget.offsetWidth;
                        if (width > 0) {
                            setActiveIndex(Math.round(scrollLeft / width));
                        }
                    }}
                >
                    {DEFAULT_SPONSORED_YARDS.map((yard) => {
                        const isFav = favorites.includes(yard.id);
                        const isDark = yard.isPremium;

                        return (
                            <div
                                key={yard.id}
                                className={`shrink-0 w-[86vw] max-w-[340px] lg:w-auto snap-center rounded-3xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative group border ${
                                    isDark
                                        ? 'bg-[#0B1528] text-white border-slate-800 shadow-[0_8px_30px_rgba(11,21,40,0.25)] hover:border-blue-500/40 hover:-translate-y-1'
                                        : 'bg-white text-slate-900 border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:border-slate-300 hover:-translate-y-1'
                                } p-4 sm:p-5`}
                            >
                                {/* Top Header: Logo + Title + Badges */}
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div
                                                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 shadow-sm ${yard.avatarBg}`}
                                            >
                                                {yard.initials}
                                            </div>
                                            <div className="min-w-0">
                                                <h3
                                                    className={`text-sm sm:text-[15px] font-black truncate leading-snug group-hover:text-blue-500 transition-colors ${
                                                        isDark ? 'text-white' : 'text-slate-900'
                                                    }`}
                                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                                >
                                                    {yard.name}
                                                </h3>
                                                <p
                                                    className={`text-[11px] font-semibold flex items-center gap-1 mt-0.5 ${
                                                        isDark ? 'text-slate-400' : 'text-slate-500'
                                                    }`}
                                                >
                                                    <svg
                                                        className="w-3.5 h-3.5 text-blue-500 shrink-0"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                    </svg>
                                                    <span className="truncate">{yard.location}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Badges / Favorite */}
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {yard.isPremium ? (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                                    ★ PREMIUM
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                                    SPONSORED
                                                </span>
                                            )}

                                            <button
                                                type="button"
                                                onClick={(e) => toggleFavorite(yard.id, e)}
                                                className={`p-1.5 rounded-full transition-colors ${
                                                    isDark
                                                        ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                                                        : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'
                                                }`}
                                                aria-label="Save yard"
                                            >
                                                <svg
                                                    className={`w-4 h-4 ${isFav ? 'text-rose-500 fill-rose-500' : ''}`}
                                                    fill={isFav ? 'currentColor' : 'none'}
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Thumbnail Image */}
                                    <div className="w-full h-32 rounded-2xl overflow-hidden mb-3 relative bg-slate-950">
                                        <img
                                            src={yard.image}
                                            alt={yard.name}
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                e.currentTarget.src = '/heroes/junkyard-aerial.webp';
                                            }}
                                        />
                                        <div
                                            className={`absolute inset-0 ${
                                                isDark
                                                    ? 'bg-gradient-to-t from-[#0B1528] via-transparent to-transparent'
                                                    : 'bg-gradient-to-t from-black/40 via-transparent to-transparent'
                                            }`}
                                        />
                                    </div>

                                    {/* Value Prop Checklists */}
                                    <div className="space-y-1.5 mb-4">
                                        {yard.features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                                    <svg
                                                        className="w-2.5 h-2.5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={3}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span
                                                    className={`text-xs font-semibold ${
                                                        isDark ? 'text-slate-300' : 'text-slate-600'
                                                    }`}
                                                >
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-2">
                                    {yard.isPremium && yard.ctaType === 'call' ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleAction(yard)}
                                                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 text-center"
                                            >
                                                Call Now
                                            </button>
                                            <Link
                                                to="/junkyards"
                                                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all text-center border border-slate-700"
                                            >
                                                View Inventory
                                            </Link>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleAction(yard)}
                                            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                                                isDark
                                                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                                                    : 'bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 hover:border-blue-400'
                                            }`}
                                        >
                                            <span>{yard.ctaText}</span>
                                            <svg
                                                className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2.5}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Mobile Pagination Dot Indicator (1 card visible at a time) */}
                <div className="flex lg:hidden justify-center items-center gap-1.5 mt-3">
                    {DEFAULT_SPONSORED_YARDS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                activeIndex === i ? 'w-6 bg-blue-600' : 'w-1.5 bg-slate-300'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
