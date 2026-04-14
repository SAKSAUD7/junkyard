import { Link } from 'react-router-dom';
import Rating from './Rating';
import VendorBadges from './VendorBadges';
import { getLogoUrl } from '../utils/imageUrl';

export default function VendorCard({ vendor, compact = false, showBadge = true }) {
    const logoUrl = getLogoUrl(vendor.logo);

    return (
        <Link
            to={`/vendors/${vendor.id}`}
            id={`vendor-card-${vendor.id}`}
            className="group relative block h-full"
        >
            {/* Main Card */}
            <div className="relative h-full flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1.5" 
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>

                {/* Verified / Featured Badge */}
                {showBadge && (vendor.is_top_rated || vendor.is_featured) && (
                    <div className="absolute top-3 right-3 z-10">
                        <VendorBadges
                            isTopRated={vendor.is_top_rated}
                            isFeatured={vendor.is_featured}
                            compact={true}
                        />
                    </div>
                )}

                {/* Logo / Image area */}
                <div className="relative bg-slate-50 flex items-center justify-center overflow-hidden transition-colors duration-300 group-hover:bg-blue-50/30"
                    style={{ height: compact ? '120px' : '148px', padding: '1.5rem' }}>
                    
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={`${vendor.name} logo`}
                            loading="lazy"
                            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                            onError={e => { e.target.src = '/images/logo-placeholder.png'; }}
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-blue-50 border border-blue-100">
                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5m4 0H9" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-100 mx-5" />

                {/* Content */}
                <div className="flex flex-col flex-1 p-5">
                    
                    {/* Vendor Name */}
                    <h3 className="font-black text-base leading-tight text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[2.5rem]"
                        style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {vendor.name}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-slate-500 mb-3 text-sm">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate font-medium">{vendor.city}, {vendor.state}</span>
                    </div>

                    {/* Rating */}
                    <div className="mb-4">
                        <Rating
                            stars={vendor.rating_stars || 5}
                            percentage={vendor.rating_percentage || 100}
                            size="sm"
                            showPercentage={true}
                        />
                    </div>

                    {/* Trust indicators */}
                    <div className="flex items-center gap-2 flex-wrap mb-4">
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
                        <div className="w-full text-center py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 group-hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md">
                            View Details
                            <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
