import React, { useState } from 'react';

const AD_CLICK_URL = (id) => {
    const base = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000/api')).replace(/\/api\/?$/, '');
    return `${base}/ads/${id}/click/`;
};

// Resolve image URL safely
const resolveImg = (ad) => {
    if (!ad) return null;
    const src = ad.resolved_image_url || ad.image_url || ad.image;
    if (!src) return null;
    if (src.startsWith('http') || src.startsWith('/media')) return src;
    return src;
};

// Initials avatar fallback
const InitialsAvatar = ({ name, size = 'md', gradient = 'blue' }) => {
    const initials = name ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() : 'AD';
    const gradients = {
        blue:   'from-blue-500 to-blue-700',
        purple: 'from-violet-500 to-purple-700',
        orange: 'from-orange-400 to-red-600',
        green:  'from-emerald-400 to-teal-600',
        dark:   'from-slate-600 to-slate-900',
    };
    const sizes = { sm: 'w-10 h-10 text-sm', md: 'w-14 h-14 text-base', lg: 'w-20 h-20 text-xl' };
    return (
        <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${gradients[gradient] || gradients.blue} flex items-center justify-center font-black text-white flex-shrink-0`}>
            {initials}
        </div>
    );
};

// Sponsored pill badge
const SponsoredPill = ({ variant = 'light' }) => {
    const vars = {
        light:  'bg-slate-100 text-slate-500',
        blue:   'bg-blue-50 text-blue-500 border border-blue-100',
        dark:   'bg-white/10 text-white/70',
        amber:  'bg-amber-400/15 text-amber-500 border border-amber-300/30',
    };
    return (
        <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full ${vars[variant]}`}>
            <svg className="w-2 h-2 fill-current" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" /></svg>
            Sponsored
        </span>
    );
};

// Arrow CTA icon
const ArrowIcon = ({ className = 'w-3.5 h-3.5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);


// ─── Standard Template ─────────────────────────────────────────────────────────
// Horizontal card with left logo + right content — clean & readable
export const StandardTemplate = ({ ad }) => {
    const img = resolveImg(ad);
    return (
        <a
            href={AD_CLICK_URL(ad.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="group block w-full outline-none"
            aria-label={`Sponsored: ${ad.title}`}
        >
            <div className="relative flex items-stretch bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300 hover:border-blue-100 hover:shadow-[0_8px_40px_rgba(26,86,255,0.08)] hover:-translate-y-0.5">
                {/* Left color accent stripe */}
                <div className="w-1 flex-shrink-0 bg-gradient-to-b from-[#1a56ff] to-[#6366f1]" />

                {/* Logo panel */}
                <div className="flex items-center justify-center bg-slate-50 w-[88px] flex-shrink-0 border-r border-slate-100 px-4">
                    {img ? (
                        <img
                            src={img}
                            alt={ad.title}
                            loading="lazy"
                            className="w-12 h-12 object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                            onError={e => e.target.style.display = 'none'}
                        />
                    ) : (
                        <InitialsAvatar name={ad.title} size="md" gradient="blue" />
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-1 items-center gap-4 px-4 py-3.5">
                    <div className="flex-1 min-w-0">
                        <SponsoredPill variant="blue" />
                        <h3 className="mt-1 text-[15px] font-black text-slate-900 leading-tight line-clamp-1 group-hover:text-blue-700 transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {ad.title}
                        </h3>
                        <p className="text-[12px] text-slate-500 font-medium mt-0.5">Quality Used Auto Parts</p>
                    </div>
                    <div className="flex-shrink-0">
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a56ff] text-white text-[12px] font-bold whitespace-nowrap transition-all duration-200 group-hover:bg-[#0e48db] group-hover:shadow-[0_6px_16px_rgba(26,86,255,0.3)]">
                            {ad.button_text || 'Visit Yard'}
                            <ArrowIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                    </div>
                </div>
            </div>
        </a>
    );
};


// ─── Minimal Template ──────────────────────────────────────────────────────────
// Clean pill-style inline strip — great for tight horizontal rows
export const MinimalTemplate = ({ ad }) => {
    const img = resolveImg(ad);
    return (
        <a
            href={AD_CLICK_URL(ad.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 w-full bg-white border border-slate-100 rounded-2xl px-4 py-3 outline-none transition-all duration-200 hover:border-slate-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
            aria-label={`Sponsored: ${ad.title}`}
        >
            {/* Thumbnail */}
            {img ? (
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100">
                    <img src={img} alt={ad.title} loading="lazy" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" onError={e => e.target.style.display='none'} />
                </div>
            ) : (
                <InitialsAvatar name={ad.title} size="sm" gradient="dark" />
            )}

            {/* Name */}
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-black text-slate-800 leading-snug line-clamp-1 group-hover:text-slate-900 transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {ad.title}
                </p>
                <SponsoredPill variant="light" />
            </div>

            {/* CTA */}
            <span className="flex-shrink-0 text-[11px] font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1 whitespace-nowrap">
                {ad.button_text || 'View'} <ArrowIcon className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
        </a>
    );
};


// ─── Premium Template ──────────────────────────────────────────────────────────
// Dark glassmorphism hero card — flagship sponsored content
export const PremiumTemplate = ({ ad }) => {
    const img = resolveImg(ad);
    return (
        <a
            href={AD_CLICK_URL(ad.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="group block w-full outline-none"
            aria-label={`Sponsored: ${ad.title}`}
        >
            <div className="relative flex items-stretch bg-gradient-to-br from-[#0c1a3a] via-[#0f2055] to-[#1a1040] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_rgba(99,102,241,0.25)] hover:-translate-y-1"
                style={{ minHeight: '120px' }}>

                {/* Animated gradient orbs */}
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/30 transition-all duration-700" />
                <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-violet-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-violet-500/30 transition-all duration-700" />

                {/* Mesh grid overlay */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }} />

                {/* Image as background panel */}
                {img && (
                    <div className="absolute right-0 top-0 w-2/5 h-full overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1a3a] to-transparent z-10" />
                        <img src={img} alt="" loading="lazy" className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-500 group-hover:scale-105 transition-transform duration-700" onError={e => e.target.parentElement.style.display='none'} />
                    </div>
                )}

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-5 flex-1">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                            <SponsoredPill variant="amber" />
                            <h3 className="mt-1.5 text-[17px] font-black text-white leading-snug line-clamp-2 max-w-[70%]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {ad.title}
                            </h3>
                        </div>
                        {!img && <InitialsAvatar name={ad.title} size="md" gradient="purple" />}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#1a56ff] text-white text-[12px] font-bold transition-all duration-200 group-hover:shadow-[0_8px_20px_rgba(79,70,229,0.5)]">
                            {ad.button_text || 'Visit Yard'}
                            <ArrowIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                        <span className="text-[11px] text-white/40 font-medium">Premium Vendor</span>
                    </div>
                </div>
            </div>
        </a>
    );
};


// ─── Compact Template ──────────────────────────────────────────────────────────
// Sleek icon + name card — for tighter marquee slots
export const CompactTemplate = ({ ad }) => {
    const img = resolveImg(ad);
    // Pick a color accent based on title hash
    const colors = ['blue', 'purple', 'orange', 'green'];
    const accentIdx = ad.title ? ad.title.charCodeAt(0) % colors.length : 0;
    const accent = colors[accentIdx];
    const accentClasses = {
        blue:   { pill: 'bg-blue-50 text-blue-600 border-blue-100', ring: 'ring-blue-100' },
        purple: { pill: 'bg-violet-50 text-violet-600 border-violet-100', ring: 'ring-violet-100' },
        orange: { pill: 'bg-orange-50 text-orange-600 border-orange-100', ring: 'ring-orange-100' },
        green:  { pill: 'bg-emerald-50 text-emerald-600 border-emerald-100', ring: 'ring-emerald-100' },
    };
    const cls = accentClasses[accent];

    return (
        <a
            href={AD_CLICK_URL(ad.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center text-center bg-white border border-slate-100 rounded-2xl p-4 outline-none transition-all duration-200 hover:border-slate-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] hover:-translate-y-1 w-full"
            aria-label={`Sponsored: ${ad.title}`}
        >
            {/* Logo / Avatar */}
            <div className={`relative mb-3 ring-4 ${cls.ring} rounded-full transition-all group-hover:ring-8`}>
                {img ? (
                    <div className="w-14 h-14 rounded-full overflow-hidden">
                        <img src={img} alt={ad.title} loading="lazy" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                    </div>
                ) : (
                    <InitialsAvatar name={ad.title} size="md" gradient={accent} />
                )}
                {/* Verified dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </span>
            </div>

            <p className="text-[13px] font-black text-slate-900 leading-snug line-clamp-2 mb-1 group-hover:text-blue-700 transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {ad.title}
            </p>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cls.pill} mb-3`}>Sponsored</span>

            <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                {ad.button_text || 'View'} <ArrowIcon className="w-2.5 h-2.5" />
            </span>
        </a>
    );
};


// ─── Micro Template ────────────────────────────────────────────────────────────
// Tiny inline chip — mobile or ultra-compact slots
export const MicroTemplate = ({ ad }) => {
    const img = resolveImg(ad);
    return (
        <a
            href={AD_CLICK_URL(ad.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 bg-white border border-slate-100 rounded-full px-3 py-1.5 outline-none transition-all duration-200 hover:border-blue-200 hover:shadow-[0_4px_12px_rgba(26,86,255,0.1)] hover:bg-blue-50"
            aria-label={`Sponsored: ${ad.title}`}
        >
            {img ? (
                <img src={img} alt={ad.title} loading="lazy" className="w-5 h-5 rounded-full object-cover flex-shrink-0" onError={e => e.target.style.display='none'} />
            ) : (
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-[7px] font-black text-white">{ad.title?.[0]}</span>
                </div>
            )}
            <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-700 transition-colors line-clamp-1 max-w-[100px]">{ad.title}</span>
            <span className="text-[9px] text-slate-400 font-medium flex-shrink-0">AD</span>
        </a>
    );
};
