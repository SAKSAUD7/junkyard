import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function TrustedVendors() {
    const [trustedVendors, setTrustedVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrustedVendors = async () => {
            try {
                setLoading(true);
                const vendors = await api.getTrustedVendors(6);
                setTrustedVendors(vendors);
            } catch (error) {
                console.error('Error fetching trusted vendors:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrustedVendors();
    }, []);

    if (loading) {
        return null; // Don't show anything while loading
    }

    if (!trustedVendors || trustedVendors.length === 0) {
        return null; // Don't show section if no trusted vendors
    }

    return (
        <section className="compact-section px-3 sm:px-4 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Section Header - Compact */}
                <div className="text-center mb-4 sm:mb-6 md:mb-8">
                    <div className="inline-flex items-center gap-1.5 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-blue-50 border border-blue-200 rounded-full mb-2 sm:mb-3 md:mb-4">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="compact-text font-semibold text-blue-600">Premium Partners</span>
                    </div>
                    <h2 className="compact-title font-bold text-gray-900 mb-2">
                        Trusted <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Vendors</span>
                    </h2>
                    <p className="text-gray-600 compact-text max-w-2xl mx-auto px-2">
                        Verified and trusted junkyards offering quality parts and exceptional service
                    </p>
                </div>

                {/* Vendors Grid - Mobile-First: 2 cols mobile, 3 tablet, 4-5 desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 compact-gap">
                    {trustedVendors.map((vendor) => (
                        <Link
                            key={vendor.id}
                            to={`/vendors/${vendor.id}`}
                            className="group relative"
                        >
                            {/* Card - Compact */}
                            <div className="relative bg-white border border-gray-200 rounded-lg md:rounded-xl compact-card transform transition-all duration-200 hover:border-blue-300 hover:shadow-md">
                                {/* Trusted Badge - Smaller on mobile */}
                                <div className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full p-1 md:p-1.5">
                                    <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>

                                {/* Vendor Logo - Compact */}
                                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-blue-50 rounded-md md:rounded-lg flex items-center justify-center mb-1.5 sm:mb-2 mx-auto group-hover:scale-105 transition-transform duration-200">
                                    {vendor.logo && vendor.logo !== '/images/logo-placeholder.png' ? (
                                        <img src={vendor.logo} alt={vendor.name} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain" />
                                    ) : (
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                        </svg>
                                    )}
                                </div>

                                {/* Vendor Name - Compact */}
                                <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2 text-center min-h-[2rem] sm:min-h-[2.5rem]">
                                    {vendor.name}
                                </h3>

                                {/* Location - Compact */}
                                <div className="flex items-center justify-center gap-1 text-gray-600 mb-1.5 sm:mb-2">
                                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-[10px] sm:text-xs truncate">{vendor.city}, {vendor.state}</span>
                                </div>

                                {/* Rating - Compact */}
                                <div className="flex items-center justify-center gap-1 mb-1.5 sm:mb-2">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <span className="text-[10px] sm:text-xs text-gray-600">{vendor.rating}</span>
                                </div>

                                {/* CTA - Compact */}
                                <div className="flex items-center justify-center pt-1.5 sm:pt-2 border-t border-gray-200">
                                    <span className="text-[10px] sm:text-xs text-gray-600 group-hover:text-blue-600 transition-colors">View Details</span>
                                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600 group-hover:translate-x-0.5 transition-transform ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* View All Link - Compact */}
                <div className="text-center mt-4 sm:mt-6 md:mt-8">
                    <Link
                        to="/vendors"
                        className="inline-flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold text-xs sm:text-sm md:text-base rounded-lg md:rounded-xl hover:shadow-md hover:from-blue-700 hover:to-teal-700 transition-all duration-200 hover:-translate-y-1 min-h-11"
                    >
                        <span>View All Vendors</span>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
