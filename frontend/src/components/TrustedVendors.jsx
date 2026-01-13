import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import VendorCard from './VendorCard';

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
        <section className="compact-section px-3 sm:px-4 lg:px-8 bg-gradient-to-b from-dark-900 to-dark-800">
            <div className="max-w-7xl mx-auto">
                {/* Section Header - Compact */}
                <div className="text-center mb-4 sm:mb-6 md:mb-8">
                    <div className="inline-flex items-center gap-1.5 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-full mb-2 sm:mb-3 md:mb-4">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="compact-text font-semibold text-white">Premium Partners</span>
                    </div>
                    <h2 className="compact-title font-bold text-white mb-2">
                        Trusted <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Vendors</span>
                    </h2>
                    <p className="text-white/60 compact-text max-w-2xl mx-auto px-2">
                        Verified and trusted junkyards offering quality parts and exceptional service
                    </p>
                </div>

                {/* Vendors Grid - Mobile-First: 2 cols mobile, 3 tablet, 4-5 desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 compact-gap">
                    {trustedVendors.map((vendor) => (
                        <VendorCard key={vendor.id} vendor={vendor} />
                    ))}
                </div>

                {/* View All Link - Compact */}
                <div className="text-center mt-4 sm:mt-6 md:mt-8">
                    <Link
                        to="/vendors"
                        className="inline-flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold text-xs sm:text-sm md:text-base rounded-lg md:rounded-xl hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 hover:-translate-y-1 min-h-11"
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
