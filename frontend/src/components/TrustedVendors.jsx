import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { getLogoUrl } from '../utils/imageUrl';

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
        return null;
    }

    if (!trustedVendors || trustedVendors.length === 0) {
        return null;
    }

    return (
        <section className="py-20 px-3 sm:px-4 lg:px-8" style={{ background: '#0a0b0d' }}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 mb-4"
                        style={{ background: 'rgba(245,158,11,0.08)' }}>
                        <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Premium Partners</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
                        Trusted <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Vendors</span>
                    </h2>
                    <p className="text-white/40 text-sm max-w-2xl mx-auto">
                        Verified and trusted junkyards offering quality parts and exceptional service
                    </p>
                </div>

                {/* Vendors Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                    {trustedVendors.map((vendor) => {
                        const logoUrl = getLogoUrl(vendor.logo);
                        return (
                            <Link
                                key={vendor.id}
                                to={`/vendors/${vendor.id}`}
                                className="group relative"
                            >
                                <div className="relative rounded-xl border border-white/[8%] p-4 transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-xl"
                                    style={{ background: '#111318', boxShadow: '0 0 0 transparent' }}
                                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 30px rgba(245,158,11,0.12)'}
                                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 transparent'}
                                >
                                    {/* Trusted Badge */}
                                    <div className="absolute -top-2 -right-2 rounded-full p-1.5"
                                        style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
                                        <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>

                                    {/* Vendor Logo */}
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center mb-3 mx-auto group-hover:scale-105 transition-transform duration-300"
                                        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                                        {logoUrl ? (
                                            <img
                                                src={logoUrl}
                                                alt={vendor.name}
                                                loading="lazy"
                                                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                        ) : null}
                                        <svg
                                            className="w-6 h-6 text-amber-500"
                                            style={{ display: logoUrl ? 'none' : 'block' }}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                        </svg>
                                    </div>

                                    {/* Vendor Name */}
                                    <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-amber-300 transition-colors line-clamp-2 text-center min-h-[2.5rem]">
                                        {vendor.name}
                                    </h3>

                                    {/* Location */}
                                    <div className="flex items-center justify-center gap-1 text-white/40 mb-2">
                                        <svg className="w-3 h-3 flex-shrink-0 text-amber-500/60" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-xs truncate">{vendor.city}, {vendor.state}</span>
                                    </div>

                                    {/* Rating */}
                                    <div className="flex items-center justify-center gap-1 mb-3">
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-xs text-white/30">{vendor.rating}</span>
                                    </div>

                                    {/* CTA */}
                                    <div className="flex items-center justify-center pt-2 border-t border-white/[8%]">
                                        <span className="text-xs text-white/40 group-hover:text-amber-400 transition-colors">View Details</span>
                                        <svg className="w-3 h-3 text-amber-500 group-hover:translate-x-0.5 transition-transform ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* View All CTA */}
                <div className="text-center mt-10">
                    <Link
                        to="/vendors"
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-black transition-all duration-300 hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', boxShadow: '0 8px 30px rgba(245,158,11,0.3)' }}
                    >
                        <span>View All Vendors</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
