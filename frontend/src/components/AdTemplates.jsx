import React from 'react';

/* ─── Shared CTA link ─────────────────────────────────────── */
const AdLink = ({ ad, className, children }) => (
    <a
        href={`${import.meta.env.VITE_API_URL.replace('/api', '')}/ads/${ad.id}/click/`}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
    >
        {children}
    </a>
);

/* ─── Standard Template ───────────────────────────────────── */
export const StandardTemplate = ({ ad }) => (
    <div className="w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px] lg:max-w-[240px] group">
        <div className="relative">
            {/* Amber glow on hover */}
            <div className="absolute -inset-1 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-all duration-500"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }} />

            {/* Card */}
            <div className="relative rounded-2xl border border-white/[8%] overflow-hidden group-hover:border-amber-500/40 transition-all duration-300"
                style={{ background: '#111318' }}>

                {ad.show_badge && (
                    <div className="py-1.5 px-3 text-center relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <span className="text-[9px] uppercase tracking-widest text-black font-black relative z-10">
                            ⭐ Featured Partner
                        </span>
                    </div>
                )}

                <div className="p-3 sm:p-4">
                    <h3 className="text-white font-black text-sm sm:text-base text-center mb-2 leading-tight">
                        {ad.title}
                    </h3>
                </div>

                {ad.image && (
                    <div className="aspect-[4/3] relative overflow-hidden">
                        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top, rgba(17,19,24,0.7) 0%, transparent 60%)' }} />
                        <img
                            src={ad.image} alt={ad.title} loading="lazy"
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </div>
                )}

                <div className="p-3 sm:p-4">
                    <AdLink ad={ad}
                        className="block w-full text-black text-[10px] sm:text-xs font-black py-2 sm:py-2.5 px-3 rounded-xl transition-all duration-300 uppercase tracking-wide text-center hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', boxShadow: '0 4px 14px rgba(245,158,11,0.25)' }}
                    >
                        {ad.button_text || 'Explore Now'} →
                    </AdLink>
                </div>
            </div>
        </div>
    </div>
);

/* ─── Minimal Template ────────────────────────────────────── */
export const MinimalTemplate = ({ ad }) => (
    <div className="w-full max-w-[160px] sm:max-w-[180px] md:max-w-[200px] group">
        <div className="relative">
            <div className="absolute -inset-0.5 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-all duration-500"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }} />

            <div className="relative rounded-2xl border border-white/[8%] overflow-hidden group-hover:border-amber-500/40 transition-all duration-300"
                style={{ background: '#111318' }}>

                {ad.show_badge && (
                    <div className="py-1 px-3 text-center border-b border-white/[6%]"
                        style={{ background: 'rgba(245,158,11,0.08)' }}>
                        <span className="text-[8px] uppercase tracking-widest text-amber-400 font-bold">⚡ Verified</span>
                    </div>
                )}

                <div className="p-2 sm:p-3">
                    <h3 className="text-white font-black text-xs sm:text-sm text-center mb-1.5 leading-tight">
                        {ad.title}
                    </h3>
                </div>

                {ad.image && (
                    <div className="aspect-[4/3] relative overflow-hidden">
                        <img src={ad.image} alt={ad.title} loading="lazy"
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </div>
                )}

                <div className="p-2 sm:p-3">
                    <AdLink ad={ad}
                        className="block w-full text-black text-[10px] sm:text-xs font-bold py-2 sm:py-2.5 px-3 rounded-xl text-center transition-all duration-300 hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
                    >
                        {ad.button_text || 'Learn More'} →
                    </AdLink>
                </div>
            </div>
        </div>
    </div>
);

/* ─── Premium Template ────────────────────────────────────── */
export const PremiumTemplate = ({ ad }) => (
    <div className="w-full max-w-[200px] sm:max-w-[220px] md:max-w-[240px] lg:max-w-[260px] group">
        <div className="relative">
            <div className="absolute -inset-2 rounded-3xl blur-xl opacity-20 group-hover:opacity-50 transition-all duration-700"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }} />

            <div className="relative rounded-3xl border-2 border-amber-500/30 overflow-hidden group-hover:border-amber-400/60 transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(17,19,24,0.98), rgba(30,22,8,0.95))' }}>

                {ad.show_badge && (
                    <div className="relative py-2 px-4 text-center overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <span className="text-[10px] uppercase tracking-widest text-black font-black relative z-10">
                            ⭐ Premium Elite Partner ⭐
                        </span>
                    </div>
                )}

                <div className="p-3 sm:p-4 md:p-5">
                    <h3 className="font-black text-base sm:text-lg text-center mb-2 leading-tight"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {ad.title}
                    </h3>
                </div>

                {ad.image && (
                    <div className="aspect-[4/3] relative overflow-hidden">
                        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top, rgba(17,19,24,0.8) 0%, transparent 60%)' }} />
                        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), transparent)' }} />
                        <img src={ad.image} alt={ad.title} loading="lazy"
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </div>
                )}

                <div className="p-4 sm:p-5">
                    <AdLink ad={ad}
                        className="relative block w-full text-black text-xs sm:text-sm font-black py-3 sm:py-3.5 px-4 rounded-2xl transition-all duration-300 uppercase tracking-wide text-center hover:-translate-y-1 overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', boxShadow: '0 6px 20px rgba(245,158,11,0.35)' }}
                    >
                        <span className="relative z-10">{ad.button_text || 'Get Premium Access'} ✨</span>
                    </AdLink>
                </div>
            </div>
        </div>
    </div>
);

/* ─── Compact Template ────────────────────────────────────── */
export const CompactTemplate = ({ ad }) => (
    <div className="w-full max-w-[140px] sm:max-w-[160px] md:max-w-[180px] group">
        <div className="relative">
            <div className="absolute -inset-0.5 rounded-xl blur opacity-0 group-hover:opacity-50 transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }} />

            <div className="relative rounded-xl border border-white/[8%] overflow-hidden group-hover:border-amber-500/40 transition-all duration-300"
                style={{ background: '#111318' }}>

                {ad.show_badge && (
                    <div className="py-0.5 px-2 text-center"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
                        <span className="text-[7px] uppercase tracking-wider text-black font-bold">⚡ Top Pick</span>
                    </div>
                )}

                <div className="p-2">
                    <h3 className="text-amber-400 font-bold text-xs text-center mb-1.5 leading-tight">{ad.title}</h3>
                </div>

                {ad.image && (
                    <div className="aspect-square relative overflow-hidden">
                        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top, rgba(17,19,24,0.6) 0%, transparent 60%)' }} />
                        <img src={ad.image} alt={ad.title} loading="lazy"
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </div>
                )}

                <div className="p-2">
                    <AdLink ad={ad}
                        className="block w-full text-black text-[10px] font-bold py-1.5 px-2 rounded-lg transition-all duration-300 uppercase tracking-wide text-center hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
                    >
                        {ad.button_text || 'View'} →
                    </AdLink>
                </div>
            </div>
        </div>
    </div>
);

/* ─── Micro Template ──────────────────────────────────────── */
export const MicroTemplate = ({ ad }) => (
    <div className="max-w-[85px] group">
        <div className="relative">
            <div className="relative rounded-lg border border-white/[8%] overflow-hidden group-hover:border-amber-500/40 transition-all duration-300"
                style={{ background: '#111318' }}>
                <div className="aspect-square relative overflow-hidden">
                    <img src={ad.image} alt={ad.title} loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="absolute top-0 right-0 text-[6px] font-black text-black px-1 py-0.5 rounded-bl"
                        style={{ background: '#f59e0b' }}>AD</div>
                </div>
                <div className="p-1 text-center">
                    <AdLink ad={ad}
                        className="block w-full text-black text-[8px] font-bold py-1 rounded transition-colors uppercase"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
                    >
                        OPEN
                    </AdLink>
                </div>
            </div>
        </div>
    </div>
);
