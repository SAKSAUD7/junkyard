import { Link } from 'react-router-dom';
import Rating from './Rating';
import VendorBadges from './VendorBadges';

export default function VendorCard({ vendor, compact = false, showBadge = true }) {
    return (
        <Link
            to={`/vendors/${vendor.id}`}
            className="group relative block h-full"
        >
            {/* Ambient Glow Effect (Behind Card) */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 rounded-2xl blur-md opacity-0 group-hover:opacity-40 transition duration-500 group-hover:duration-200"></div>

            {/* Main Card Container */}
            <div className="relative h-full flex flex-col bg-dark-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1">

                {/* Trusted/Premium Badge */}
                {showBadge && (vendor.is_top_rated || vendor.is_featured) && (
                    <div className="absolute top-3 right-3 z-10">
                        <VendorBadges
                            isTopRated={vendor.is_top_rated}
                            isFeatured={vendor.is_featured}
                            compact={true}
                        />
                    </div>
                )}

                {/* Image/Logo Section */}
                <div className="relative aspect-[16/9] bg-dark-950 p-6 flex items-center justify-center overflow-hidden group-hover:bg-dark-900 transition-colors duration-500">
                    {/* Subtle Grid Pattern Overlay */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

                    {vendor.logo && vendor.logo !== '/images/logo-placeholder.png' ? (
                        <img
                            src={vendor.logo}
                            alt={vendor.name}
                            className="relative z-10 max-h-full max-w-full object-contain transform group-hover:scale-110 transition-transform duration-500 will-change-transform"
                            onError={(e) => {
                                e.target.src = '/images/logo-placeholder.png';
                            }}
                        />
                    ) : (
                        <div className="relative z-10 text-white/5 group-hover:text-white/10 transition-colors duration-300">
                            <svg className="w-16 h-16 sm:w-20 sm:h-20" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-grow p-5 relative">
                    {/* Gradient Divider Line */}
                    <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                    {/* Vendor Name */}
                    <h3 className="font-display font-bold text-lg leading-tight text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2 min-h-[3rem]">
                        {vendor.name}
                    </h3>

                    {/* Location */}
                    <div className="flex items-start gap-2 text-white/60 mb-4 text-sm">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="line-clamp-1">{vendor.city}, {vendor.state}</span>
                    </div>

                    {/* Rating & Stats */}
                    <div className="flex items-center justify-between mb-5">
                        <Rating
                            stars={vendor.rating_stars || 5}
                            percentage={vendor.rating_percentage || 100}
                            size="sm"
                            showPercentage={true}
                        />
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                        <button className="w-full relative overflow-hidden bg-dark-800 hover:bg-dark-700 border border-white/10 hover:border-cyan-500/50 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 group/btn">
                            <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                                View Vendor Details
                                <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                            {/* Button Hover Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300"></div>
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
