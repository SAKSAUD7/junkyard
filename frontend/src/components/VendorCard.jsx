import { Link } from 'react-router-dom';
import Rating from './Rating';
import VendorBadges from './VendorBadges';
import { getLogoUrl } from '../utils/imageUrl';
import { generateVendorUrl } from '../utils/urlHelpers';
import SaveJunkyardButton from './SaveJunkyardButton';

/**
 * VendorCard — Responsive junkyard listing card.
 * On mobile (2-col grid) it uses a compact layout.
 * On sm+ it expands to the full card.
 */
export default function VendorCard({ vendor, compact = false, showBadge = true }) {
    const logoUrl = getLogoUrl(vendor.logo);
    const vendorUrl = generateVendorUrl(vendor);

    return (
        <Link
            to={vendorUrl}
            id={`vendor-card-${vendor.id}`}
            className="group relative block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-[18px]"
        >
            {/* Card Shell */}
            <div className="relative h-full flex flex-col bg-white border border-slate-200 rounded-[18px] overflow-hidden transition-all duration-300 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 shadow-sm">

                {/* ── Badge + Save row (absolute) ── */}
                <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5 items-end">
                    {showBadge && (vendor.is_top_rated || vendor.is_featured) && (
                        <VendorBadges
                            isTopRated={vendor.is_top_rated}
                            isFeatured={vendor.is_featured}
                            compact={true}
                        />
                    )}
                    <SaveJunkyardButton
                        vendor={vendor}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border shadow-sm bg-white/90 backdrop-blur-sm"
                    />
                </div>

                {/* ── Logo / Image ── */}
                {/* Mobile: h-[120px] | sm+: h-[170px] */}
                <div className="relative bg-slate-50 flex items-center justify-center overflow-hidden transition-colors duration-300 group-hover:bg-blue-50/40 w-full h-[110px] sm:h-[170px] border-b border-slate-100 shrink-0">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={`${vendor.name} logo`}
                            loading="lazy"
                            className="max-h-16 sm:max-h-24 max-w-[75%] object-contain transition-transform duration-500 group-hover:scale-110 p-1 sm:p-2"
                            onError={e => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Cpath d='M20 75 L50 30 L80 75 Z' fill='%23cbd5e1'/%3E%3Ccircle cx='70' cy='28' r='10' fill='%23cbd5e1'/%3E%3C/svg%3E"; }}
                        />
                    ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center bg-blue-100 border border-blue-200 shadow-inner">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5m4 0H9" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* ── Content ── */}
                <div className="flex flex-col flex-1 p-3 sm:p-5 min-w-0">

                    {/* Vendor Name */}
                    <h3
                        className="font-extrabold text-[13px] sm:text-[16px] leading-tight text-slate-900 mb-1 sm:mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-2"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        {vendor.name}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-slate-500 mb-2 sm:mb-3 text-[11px] sm:text-[13px]">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate font-semibold">{vendor.city}, {vendor.state}</span>
                    </div>

                    {/* Rating — hidden on very small mobile to save space */}
                    <div className="mb-2 sm:mb-4 hidden xs:block">
                        <Rating
                            stars={vendor.rating_stars || 5}
                            percentage={vendor.rating_percentage || 100}
                            size="sm"
                            showPercentage={false}
                        />
                    </div>

                    {/* Verified badge */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-2 sm:mb-4">
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                            ✓ Verified
                        </span>
                        {vendor.phone && (
                            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-50 text-slate-600 border border-slate-100">
                                📞 Phone
                            </span>
                        )}
                    </div>

                    {/* CTA */}
                    <div className="mt-auto pt-2 border-t border-slate-50">
                        <div className="w-full text-center py-2 sm:py-3 px-2 sm:px-4 rounded-xl font-black text-[12px] sm:text-[14px] tracking-wide text-white bg-blue-600 group-hover:bg-[#1a56ff] hover:shadow-[0_4px_16px_rgba(37,99,235,0.4)] transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2">
                            View inventory
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
