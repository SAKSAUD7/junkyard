import { Link } from 'react-router-dom';
import Rating from './Rating';
import VendorBadges from './VendorBadges';

export default function VendorCard({ vendor, compact = false, showBadge = true }) {
    return (
        <Link
            to={`/vendors/${vendor.id}`}
            className="group relative"
        >
            {/* Card Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>

            {/* Card Container */}
            <div className="relative h-full bg-dark-800/50 backdrop-blur-sm border border-white/10 rounded-lg md:rounded-2xl overflow-hidden transform transition-all duration-500 hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-lg md:hover:shadow-2xl hover:border-cyan-400/50 flex flex-col">

                {/* Trusted/Premium Badge */}
                {showBadge && (
                    <div className="absolute top-2 right-2 z-10">
                        <VendorBadges
                            isTopRated={vendor.is_top_rated}
                            isFeatured={vendor.is_featured}
                            compact={true}
                        />
                    </div>
                )}

                {/* Logo Area */}
                <div className="aspect-[16/9] bg-gradient-to-br from-dark-700 to-dark-800 p-2 sm:p-3 md:p-4 lg:p-6 flex items-center justify-center">
                    {vendor.logo && vendor.logo !== '/images/logo-placeholder.png' ? (
                        <img
                            src={vendor.logo}
                            alt={vendor.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                                e.target.src = '/images/logo-placeholder.png';
                            }}
                        />
                    ) : (
                        <div className="text-white/10">
                            <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="compact-card flex flex-col flex-grow p-3 sm:p-4">
                    {/* Vendor Name */}
                    <h3 className="font-bold text-sm sm:text-base md:text-lg mb-1.5 sm:mb-2 md:mb-3 text-white group-hover:text-cyan-400 transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem]">
                        {vendor.name}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-white/60 mb-1.5 sm:mb-2 md:mb-3 mt-auto">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs sm:text-sm font-medium truncate">{vendor.city}, {vendor.state}</span>
                    </div>

                    {/* ZIP Code (Optional, if available and compact mode is false or requested) */}
                    {vendor.zipcode && (
                        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-white/60 mb-2 sm:mb-3 md:mb-4">
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                            </svg>
                            <span className="text-[10px] sm:text-xs font-mono bg-blue-500/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">{vendor.zip_code || vendor.zipcode}</span>
                        </div>
                    )}

                    {/* Rating */}
                    <div className="mb-2 sm:mb-3 md:mb-4">
                        <Rating
                            stars={vendor.rating_stars || 5}
                            percentage={vendor.rating_percentage || 100}
                            size="sm"
                            showPercentage={true}
                        />
                    </div>

                    {/* CTA Button */}
                    <button className="w-full bg-white/5 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-cyan-500 border border-white/10 group-hover:border-cyan-500 text-white/70 group-hover:text-white font-semibold py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 rounded-lg md:rounded-xl transition-all duration-300 shadow-md group-hover:shadow-lg text-xs sm:text-sm min-h-10">
                        View Details →
                    </button>
                </div>
            </div>
        </Link>
    );
}
