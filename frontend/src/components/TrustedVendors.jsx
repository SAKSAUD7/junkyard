import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { getLogoUrl } from '../utils/imageUrl';
import { useCMS } from '../hooks/useCMS';

const PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Cpath d='M20 75 L50 30 L80 75 Z' fill='%23cbd5e1'/%3E%3Ccircle cx='70' cy='28' r='10' fill='%23cbd5e1'/%3E%3C/svg%3E";

const THEMES = [
    { button: 'bg-[#1a56ff]', hover: 'hover:bg-[#0e48db]', accent: '#1a56ff', badge: 'bg-[#ffb020] text-white' },
    { button: 'bg-[#8b5cf6]', hover: 'hover:bg-[#7c3aed]', accent: '#8b5cf6', badge: 'bg-[#ffb020] text-white' },
    { button: 'bg-[#e11d48]', hover: 'hover:bg-[#be123c]', accent: '#e11d48', badge: 'bg-[#ef4444] text-white' },
    { button: 'bg-[#f97316]', hover: 'hover:bg-[#ea580c]', accent: '#f97316', badge: 'bg-[#ffb020] text-white' },
    { button: 'bg-[#10b981]', hover: 'hover:bg-[#059669]', accent: '#10b981', badge: 'bg-[#ffb020] text-white' },
    { button: 'bg-[#0891b2]', hover: 'hover:bg-[#0e7490]', accent: '#0891b2', badge: 'bg-[#0891b2] text-white' },
    { button: 'bg-[#7c3aed]', hover: 'hover:bg-[#6d28d9]', accent: '#7c3aed', badge: 'bg-[#7c3aed] text-white' },
];

const FALLBACK_VENDORS = [
    { id: 'v1', name: 'All American Auto Parts', city: 'Dallas', state: 'TX', rating_stars: 5, reviews: 128, parts: '10,000+', savings: '70%', logo: null },
    { id: 'v2', name: 'Sunrise Salvage', city: 'Phoenix', state: 'AZ', rating_stars: 5, reviews: 96, parts: '8,500+', savings: '70%', logo: null },
    { id: 'v3', name: 'Liberty Auto Solutions', city: 'Atlanta', state: 'GA', rating_stars: 5, reviews: 110, parts: '15,000+', savings: '75%', logo: null },
    { id: 'v4', name: 'Highline Auto Parts', city: 'Chicago', state: 'IL', rating_stars: 4.7, reviews: 80, parts: '7,200+', savings: '60%', logo: null },
    { id: 'v5', name: 'Premium Parts Depot', city: 'Miami', state: 'FL', rating_stars: 5, reviews: 134, parts: '12,000+', savings: '60%', logo: null },
    { id: 'v6', name: 'West Coast Auto Recyclers', city: 'Los Angeles', state: 'CA', rating_stars: 4.8, reviews: 92, parts: '20,000+', savings: '65%', logo: null },
    { id: 'v7', name: 'Gulf State Auto Parts', city: 'Houston', state: 'TX', rating_stars: 4.9, reviews: 145, parts: '11,000+', savings: '72%', logo: null },
];

// Cards visible per breakpoint
const CARDS_VISIBLE = 5; // Maximum simultaneous visible (we scroll smoothly)
const CARD_WIDTH = 272; // px including gap
const AUTOPLAY_INTERVAL = 3500;

export default function TrustedVendors() {
    const { get } = useCMS('home');
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        api.getTrustedVendors(20)
            .then(v => {
                const list = (!v || v.length === 0) ? FALLBACK_VENDORS : v;
                // Duplicate arrays many times so it never runs out over the scroll
                setVendors([...list, ...list, ...list, ...list, ...list, ...list, ...list, ...list]);
            })
            .catch(() => setVendors([...FALLBACK_VENDORS, ...FALLBACK_VENDORS, ...FALLBACK_VENDORS, ...FALLBACK_VENDORS, ...FALLBACK_VENDORS]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <section className="py-16 bg-[#fafbfc]">
                <div className="max-w-[1400px] mx-auto px-4">
                    <div className="text-center mb-10">
                        <div className="h-9 w-72 bg-slate-100 rounded-xl animate-pulse mx-auto mb-3" />
                        <div className="h-4 w-48 bg-slate-100 rounded animate-pulse mx-auto" />
                    </div>
                    <div className="flex gap-6 overflow-hidden">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="flex-shrink-0 w-[260px] h-[340px] bg-slate-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!vendors.length) return null;

    return (
        <section
            className="py-16 bg-[#fafbfc] border-b border-slate-100 overflow-hidden relative"
        >
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {get('trusted_vendors', 'heading', 'Our Network Of Trusted Vendors')}
                        </h2>
                        <p className="text-slate-500 font-medium text-[15px]">
                            {get('trusted_vendors', 'subheading', 'Trusted by thousands for quality parts and great prices.')}
                        </p>
                    </div>
                </div>

                {/* Carousel Track (Marquee) */}
                <div
                    className="flex gap-5 pb-4 overflow-hidden tv-marquee-container"
                >
                    <div className="flex gap-5 min-w-max tv-marquee" style={{ animation: 'marquee 150s linear infinite' }}>
                        <style>{`
                            @keyframes marquee {
                                0% { transform: translateX(0); }
                                100% { transform: translateX(-50%); }
                            }
                            .tv-marquee-container:hover .tv-marquee {
                                animation-play-state: paused !important;
                            }
                        `}</style>
                    {vendors.map((vendor, index) => {
                        const theme = THEMES[index % THEMES.length];
                        const logoUrl = vendor.logo ? getLogoUrl(vendor.logo) : PLACEHOLDER;
                        const rating = vendor.rating_stars || 4.9;
                        const reviews = vendor.reviews || Math.floor(Math.random() * 100 + 50);

                        return (
                            <Link
                                to={`/vendors/${vendor.id}`}
                                key={`${vendor.id}-${index}`}
                                className="snap-start flex-shrink-0 w-[256px] group focus:outline-none"
                            >
                                <div className="h-full flex flex-col bg-white rounded-2xl border border-slate-100 shadow-[0_4px_25px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_50px_rgb(0,0,0,0.1)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden p-5 text-center relative hover:animate-rainbow-shadow">
                                    {/* Top accent bar */}
                                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: theme.accent }} />

                                    {/* Badge */}
                                    <div className={`absolute top-4 left-4 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide ${theme.badge}`}>
                                        {vendor.is_featured ? 'Featured' : vendor.is_top_rated ? 'Top Rated' : 'Trusted'}
                                    </div>

                                    {/* Logo */}
                                    <div className="h-20 w-full flex items-center justify-center mt-6 mb-4">
                                        {logoUrl === PLACEHOLDER ? (
                                            <div
                                                className="w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl text-white border-[3px] border-white shadow-lg"
                                                style={{ background: theme.accent }}
                                            >
                                                {vendor.name.charAt(0)}
                                            </div>
                                        ) : (
                                            <img src={logoUrl} alt={vendor.name} className="h-16 object-contain rounded-lg" />
                                        )}
                                    </div>

                                    <h3 className="text-[16px] font-bold text-slate-900 mb-1 leading-snug line-clamp-2">{vendor.name}</h3>
                                    <p className="text-[13px] font-medium text-slate-500 mb-3">
                                        {vendor.city}{vendor.city && vendor.state ? ', ' : ''}{vendor.state}
                                    </p>

                                    {/* Rating */}
                                    <div className="flex items-center justify-center gap-1.5 mb-4 text-[13px] font-bold text-slate-700">
                                        <svg className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        {rating} <span className="text-slate-400 font-normal">({reviews})</span>
                                    </div>

                                    <div className="space-y-0.5 mb-5 text-[13px]">
                                        <p className="text-slate-600 font-medium">{vendor.parts || vendor.inventory_count ? `${vendor.inventory_count || vendor.parts}+ Parts` : '10,000+ Parts'}</p>
                                        <p className="font-bold text-slate-800">Up to {vendor.savings || vendor.rating_percentage || '70'}% Off</p>
                                    </div>

                                    <div className="mt-auto">
                                        <span className={`w-full py-2.5 rounded-xl font-bold text-[14px] text-white flex justify-center items-center transition-colors ${theme.button} ${theme.hover}`}>
                                            View Inventory
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                    </div>
                </div>

                {/* View All CTA */}
                <div className="text-center mt-8">
                    <Link
                        to="/vendors"
                        className="inline-flex items-center gap-2 text-blue-600 font-bold text-[15px] hover:text-blue-700 transition-colors border-b-2 border-blue-100 hover:border-blue-400 pb-0.5"
                    >
                        View All Vendors
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
