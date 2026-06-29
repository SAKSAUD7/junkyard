import React, { useState } from 'react';

const AD_CLICK_URL = (id) => {
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
    return `${base}/ads/${id}/click/`;
};

// ─── Shared Badge ──────────────────────────────────────────────────────────────
const FeaturedBadge = ({ color = 'blue' }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        gold: 'bg-amber-50 text-amber-600 border-amber-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    };
    return (
        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${colors[color] || colors.blue}`}>
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Sponsored
        </span>
    );
};

// ─── Standard Template ─────────────────────────────────────────────────────────
// Full-width horizontal card — great for strip/banner slot between sections
export const StandardTemplate = ({ ad }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <a
            href={AD_CLICK_URL(ad.id)}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="group block w-full outline-none"
            aria-label={`Sponsored: ${ad.title}`}
        >
            <div
                className="relative flex flex-col sm:flex-row items-stretch bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300"
                style={{
                    boxShadow: hovered
                        ? '0 16px 48px rgba(26,86,255,0.10), 0 2px 8px rgba(0,0,0,0.04)'
                        : '0 4px 20px rgba(0,0,0,0.04)',
                    transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
                }}
            >
                {/* Accent top bar */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1a56ff] via-[#8b5cf6] to-[#ec4899]" />

                {/* Image Panel */}
                {ad.image && (
                    <div className="sm:w-[200px] md:w-[240px] flex-shrink-0 overflow-hidden bg-slate-50">
                        <img
                            src={ad.image}
                            alt={ad.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            style={{ minHeight: '120px', maxHeight: '180px' }}
                            onError={(e) => { e.target.closest('div').style.display = 'none'; }}
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between p-5 gap-3">
                    <div>
                        {ad.show_badge && <FeaturedBadge color="blue" />}
                        <h3 className="mt-2 text-[16px] font-black text-slate-900 leading-snug line-clamp-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {ad.title}
                        </h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a56ff] text-white text-[13px] font-bold transition-all duration-200 group-hover:bg-[#0e48db] group-hover:shadow-[0_8px_20px_rgba(26,86,255,0.3)]">
                            {ad.button_text || 'Learn More'}
                            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </span>
                    </div>
                </div>
            </div>
        </a>
    );
};

// ─── Minimal Template ──────────────────────────────────────────────────────────
// Clean sidebar card — narrow, vertically stacked
export const MinimalTemplate = ({ ad }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <a
            href={AD_CLICK_URL(ad.id)}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="group block w-full outline-none"
            aria-label={`Sponsored: ${ad.title}`}
        >
            <div
                className="relative bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300"
                style={{
                    boxShadow: hovered
                        ? '0 12px 36px rgba(0,0,0,0.08)'
                        : '0 2px 12px rgba(0,0,0,0.03)',
                    transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
                }}
            >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-slate-400 to-slate-600" />

                {ad.image && (
                    <div className="w-full overflow-hidden bg-slate-50" style={{ height: '140px' }}>
                        <img
                            src={ad.image}
                            alt={ad.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => { e.target.closest('div').style.display = 'none'; }}
                        />
                    </div>
                )}

                <div className="p-4 space-y-3">
                    {ad.show_badge && <FeaturedBadge color="blue" />}
                    <h3 className="text-[14px] font-bold text-slate-800 leading-snug line-clamp-2">
                        {ad.title}
                    </h3>
                    <span className="inline-flex w-full items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white text-[12px] font-bold transition-all group-hover:bg-slate-700">
                        {ad.button_text || 'Visit Site'} →
                    </span>
                </div>
            </div>
        </a>
    );
};

// ─── Premium Template ──────────────────────────────────────────────────────────
// Full-width vibrant hero card with gradient accent — flagship ads
export const PremiumTemplate = ({ ad }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <a
            href={AD_CLICK_URL(ad.id)}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="group block w-full outline-none"
            aria-label={`Sponsored: ${ad.title}`}
        >
            <div
                className="relative flex flex-col sm:flex-row items-stretch bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                    boxShadow: hovered
                        ? '0 20px 60px rgba(139,92,246,0.25), 0 4px 16px rgba(0,0,0,0.2)'
                        : '0 8px 32px rgba(0,0,0,0.15)',
                    transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
                }}
            >
                {/* Gradient glow overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#8b5cf6]/10 via-transparent to-[#1a56ff]/10 pointer-events-none" />

                {/* Image */}
                {ad.image && (
                    <div className="sm:w-[220px] md:w-[260px] flex-shrink-0 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0f172a]/60 z-10 sm:block hidden" />
                        <img
                            src={ad.image}
                            alt={ad.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            style={{ minHeight: '140px', maxHeight: '200px' }}
                            onError={(e) => { e.target.closest('div').style.display = 'none'; }}
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between p-5 md:p-6 gap-4 relative z-10">
                    <div>
                        {ad.show_badge && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                                ⭐ Premium Partner
                            </span>
                        )}
                        <h3 className="mt-2 text-[18px] md:text-[20px] font-black text-white leading-snug line-clamp-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {ad.title}
                        </h3>
                    </div>
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#1a56ff] text-white text-[13px] font-bold w-fit transition-all duration-200 group-hover:shadow-[0_8px_24px_rgba(139,92,246,0.4)]">
                        {ad.button_text || 'Get Access'}
                        <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </span>
                </div>
            </div>
        </a>
    );
};

// ─── Compact Template ──────────────────────────────────────────────────────────
// Side-by-side mini card — ideal for tight sidebar slots
export const CompactTemplate = ({ ad }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <a
            href={AD_CLICK_URL(ad.id)}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="group flex items-center gap-3 bg-white rounded-xl border border-slate-100 p-3 outline-none transition-all duration-200"
            aria-label={`Sponsored: ${ad.title}`}
            style={{
                boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.07)' : '0 2px 8px rgba(0,0,0,0.03)',
                transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
            }}
        >
            {/* Thumbnail */}
            {ad.image ? (
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-50">
                    <img
                        src={ad.image}
                        alt={ad.title}
                        className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-110"
                        onError={(e) => { e.target.closest('div').style.display = 'none'; }}
                    />
                </div>
            ) : (
                <div className="w-14 h-14 rounded-lg flex-shrink-0 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
            )}

            {/* Text */}
            <div className="flex-1 min-w-0">
                {ad.show_badge && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500">Sponsored</span>
                )}
                <p className="text-[12px] font-bold text-slate-800 leading-snug line-clamp-2 mt-0.5">{ad.title}</p>
                <span className="text-[11px] font-semibold text-blue-600 group-hover:underline">{ad.button_text || 'View'} →</span>
            </div>
        </a>
    );
};

// ─── Micro Template ────────────────────────────────────────────────────────────
// Tiny square card — used in mobile hero or tight grids
export const MicroTemplate = ({ ad }) => (
    <a
        href={AD_CLICK_URL(ad.id)}
        target="_blank"
        rel="noopener noreferrer"
        className="group block w-20 rounded-xl overflow-hidden border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow"
        aria-label={`Sponsored: ${ad.title}`}
    >
        <div className="relative aspect-square bg-slate-50">
            {ad.image && (
                <img
                    src={ad.image}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            )}
            <span className="absolute top-0 right-0 bg-blue-600 text-white text-[7px] font-black px-1 py-0.5 rounded-bl">AD</span>
        </div>
        <div className="p-1.5 text-center">
            <span className="block text-[9px] font-bold text-slate-700 line-clamp-1">{ad.title}</span>
            <span className="block text-[8px] text-blue-600 font-semibold mt-0.5">Open →</span>
        </div>
    </a>
);
