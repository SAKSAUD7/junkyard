import { Link } from 'react-router-dom';
import Rating from './Rating';
import VendorBadges from './VendorBadges';
import { getLogoUrl } from '../utils/imageUrl';
import { generateVendorUrl } from '../utils/urlHelpers';

export default function VendorCard({ vendor, compact = false, showBadge = true }) {
    const logoUrl = getLogoUrl(vendor.logo);
    const vendorUrl = generateVendorUrl(vendor);

    return (
        <Link
            to={vendorUrl}
            id={`vendor-card-${vendor.id}`}
            className="group relative block h-full focus:outline-none"
        >
            {/* Main Card */}
            <div className="relative h-full flex flex-row sm:flex-col bg-white border border-slate-100 rounded-[16px] sm:rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-200 hover:shadow-xl sm:hover:-translate-y-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">

                {/* Verified / Featured Badge - adjust positioning for mobile horizontal */}
                {showBadge && (vendor.is_top_rated || vendor.is_featured) && (
                    <div className="absolute top-2 left-2 sm:top-3 sm:right-3 sm:left-auto z-10 scale-[0.8] sm:scale-100 origin-top-left sm:origin-top-right">
                        <VendorBadges
                            isTopRated={vendor.is_top_rated}
                            isFeatured={vendor.is_featured}
                            compact={true}
                        />
                    </div>
                )}

                {/* Logo / Image area */}
                <div className="relative bg-slate-50 flex items-center justify-center overflow-hidden transition-colors duration-300 group-hover:bg-blue-50/30 w-[100px] sm:w-auto shrink-0 border-r sm:border-r-0 sm:border-b border-slate-100"
                    style={{ height: compact ? 'auto' : 'auto', minHeight: '120px' }}>
                    
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={`${vendor.name} logo`}
                            loading="lazy"
                            className="max-h-16 sm:max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105 p-2 sm:p-6"
                            onError={e => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Cpath d='M20 75 L50 30 L80 75 Z' fill='%23cbd5e1'/%3E%3Ccircle cx='70' cy='28' r='10' fill='%23cbd5e1'/%3E%3C/svg%3E"; }}
                        />
                    ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center bg-blue-50 border border-blue-100">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5m4 0H9" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-3 sm:p-5 min-w-0">
                    
                    {/* Vendor Name */}
                    <h3 className="font-black text-[14px] sm:text-base leading-tight text-slate-900 mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors line-clamp-2"
                        style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {vendor.name}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-slate-500 mb-2 sm:mb-3 text-[11px] sm:text-sm">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate font-medium">{vendor.city}, {vendor.state}</span>
                    </div>

                    {/* Rating */}
                    <div className="mb-2 sm:mb-4 scale-90 origin-left sm:scale-100">
                        <Rating
                            stars={vendor.rating_stars || 5}
                            percentage={vendor.rating_percentage || 100}
                            size="sm"
                            showPercentage={true}
                        />
                    </div>

                    {/* Trust indicators (hidden on mobile to save space, or scaled down) */}
                    <div className="hidden sm:flex items-center gap-2 flex-wrap mb-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                            ✓ Verified
                        </span>
                        {vendor.phone && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-100">
                                📞 Phone
                            </span>
                        )}
                    </div>

                    {/* CTA Button */}
                    <div className="mt-auto">
                        <div className="w-full text-center py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl font-bold text-[12px] sm:text-sm text-white bg-blue-600 group-hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm group-hover:shadow-md">
                            View <span className="hidden sm:inline">Details</span>
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
