import React from 'react';

// Standard Template - Modern Glassmorphism Design
export const StandardTemplate = ({ ad }) => (
    <div className="max-w-[220px] sm:max-w-[240px] animate-fade-in group">
        <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-75 transition-all duration-500"></div>

            {/* Main Card */}
            <div className="relative bg-gradient-to-br from-dark-800/90 via-dark-900/95 to-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl overflow-hidden">
                {ad.show_badge && (
                    <div className="relative bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 py-1.5 px-3 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        <span className="text-[9px] uppercase tracking-widest text-white font-black relative z-10 drop-shadow-lg">
                            ✨ Featured Partner
                        </span>
                    </div>
                )}

                <div className="p-4">
                    <h3 className="text-white font-black text-base text-center mb-3 leading-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {ad.title}
                    </h3>
                </div>

                {ad.image && (
                    <div className="aspect-[4/3] bg-gradient-to-br from-dark-800 to-dark-900 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                        <img
                            src={ad.image}
                            alt={ad.title}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                <div className="p-4">
                    <a
                        href={`${import.meta.env.VITE_API_URL}/ads/${ad.id}/click/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 text-white text-xs font-black py-3 px-4 rounded-xl transition-all duration-300 uppercase tracking-wide text-center transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-cyan-500/50"
                    >
                        {ad.button_text || 'Explore Now'} →
                    </a>
                </div>
            </div>
        </div>
    </div>
);

// Minimal Template - Ultra Clean Modern Design
export const MinimalTemplate = ({ ad }) => (
    <div className="max-w-[200px] animate-fade-in group">
        <div className="relative">
            {/* Subtle Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-all duration-500"></div>

            {/* Main Card */}
            <div className="relative bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                {ad.show_badge && (
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 py-1 px-3 text-center">
                        <span className="text-[8px] uppercase tracking-widest text-white font-bold">
                            ⚡ Verified
                        </span>
                    </div>
                )}

                <div className="p-3">
                    <h3 className="text-gray-900 font-black text-sm text-center mb-2 leading-tight">
                        {ad.title}
                    </h3>
                </div>

                {ad.image && (
                    <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                        <img
                            src={ad.image}
                            alt={ad.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                <div className="p-3">
                    <a
                        href={`${import.meta.env.VITE_API_URL}/ads/${ad.id}/click/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                        {ad.button_text || 'Learn More'} →
                    </a>
                </div>
            </div>
        </div>
    </div>
);

// Premium Template - Luxury Gold Design with Epic Animations
export const PremiumTemplate = ({ ad }) => (
    <div className="max-w-[240px] sm:max-w-[260px] animate-fade-in group">
        <div className="relative">
            {/* Subtle Glow Effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-all duration-700"></div>

            {/* Main Card */}
            <div className="relative bg-gradient-to-br from-yellow-900/30 via-amber-900/40 to-orange-900/30 backdrop-blur-2xl border-2 border-yellow-500/50 rounded-3xl overflow-hidden shadow-2xl">
                {ad.show_badge && (
                    <div className="relative bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 py-2 px-4 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_50%)]"></div>
                        <span className="text-[10px] uppercase tracking-widest text-gray-900 font-black relative z-10 drop-shadow-lg">
                            ⭐ Premium Elite Partner ⭐
                        </span>
                    </div>
                )}

                <div className="p-5">
                    <h3 className="text-white font-black text-lg text-center mb-3 leading-tight drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                        {ad.title}
                    </h3>
                </div>

                {ad.image && (
                    <div className="aspect-[4/3] bg-gradient-to-br from-yellow-900/50 to-orange-900/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent z-10"></div>
                        <img
                            src={ad.image}
                            alt={ad.title}
                            className="w-full h-full object-cover transform group-hover:scale-110 group-hover:rotate-1 transition-all duration-700"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                <div className="p-5">
                    <a
                        href={`${import.meta.env.VITE_API_URL}/ads/${ad.id}/click/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative block w-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 hover:from-yellow-400 hover:via-amber-300 hover:to-yellow-400 text-gray-900 text-sm font-black py-3.5 px-5 rounded-2xl transition-all duration-300 uppercase tracking-wide text-center transform hover:scale-110 hover:-translate-y-2 shadow-2xl hover:shadow-yellow-500/80 overflow-hidden group/btn"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-700"></div>
                        <span className="relative z-10">{ad.button_text || 'Get Premium Access'} ✨</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
);

// Compact Template - Sleek Micro Design
export const CompactTemplate = ({ ad }) => (
    <div className="max-w-[180px] animate-fade-in group">
        <div className="relative">
            {/* Compact Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-0 group-hover:opacity-60 transition-all duration-300"></div>

            {/* Main Card */}
            <div className="relative bg-gradient-to-br from-dark-800/95 to-dark-900/95 backdrop-blur-lg border border-cyan-500/20 rounded-xl overflow-hidden">
                {ad.show_badge && (
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 py-0.5 px-2 text-center">
                        <span className="text-[7px] uppercase tracking-wider text-white font-bold">
                            ⚡ Top Pick
                        </span>
                    </div>
                )}

                <div className="p-2">
                    <h3 className="text-white font-bold text-xs text-center mb-1.5 leading-tight bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        {ad.title}
                    </h3>
                </div>

                {ad.image && (
                    <div className="aspect-square bg-gradient-to-br from-dark-800 to-dark-900 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                        <img
                            src={ad.image}
                            alt={ad.title}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                <div className="p-2">
                    <a
                        href={`${import.meta.env.VITE_API_URL}/ads/${ad.id}/click/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-[10px] font-bold py-1.5 px-2 rounded-lg transition-all duration-300 uppercase tracking-wide text-center transform hover:scale-105 shadow-md hover:shadow-cyan-500/50"
                    >
                        {ad.button_text || 'View'} →
                    </a>
                </div>
            </div>
        </div>
    </div>
);
