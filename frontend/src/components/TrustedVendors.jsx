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
                console.warn('[TrustedVendors] Backend unavailable');
            } finally {
                setLoading(false);
            }
        };
        fetchTrustedVendors();
    }, []);

    if (loading) return null;
    if (!trustedVendors || trustedVendors.length === 0) return null;

    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-5">
                {trustedVendors.map((vendor) => {
                    const logoUrl = getLogoUrl(vendor.logo);
                    return (
                        <Link
                            key={vendor.id}
                            to={`/vendors/${vendor.id}`}
                            className="group relative block"
                            style={{ textDecoration: 'none' }}
                        >
                            {/* Glow halo */}
                            <div
                                className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.25), rgba(234,88,12,0.15))', filter: 'blur(5px)', zIndex: 0 }}
                            />

                            <div
                                className="relative flex flex-col items-center text-center p-4 rounded-xl transition-all duration-300 group-hover:-translate-y-1"
                                style={{
                                    background: '#ffffff',
                                    border: '1px solid rgba(37,99,235,0.08)',
                                    zIndex: 1
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(37,99,235,0.08)'}
                            >
                                {/* Verified Badge */}
                                <div
                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, var(--neon-blue), #0099dd)', boxShadow: '0 0 8px rgba(37,99,235,0.5)' }}
                                >
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>

                                {/* Logo */}
                                <div
                                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300"
                                    style={{ background: 'rgba(240,245,250,0.8)', border: '1px solid rgba(37,99,235,0.12)' }}
                                >
                                    {logoUrl ? (
                                        <img
                                            src={logoUrl}
                                            alt={vendor.name}
                                            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                        />
                                    ) : null}
                                    <svg
                                        className="w-6 h-6"
                                        style={{ color: 'var(--neon-blue)', display: logoUrl ? 'none' : 'block' }}
                                        fill="currentColor" viewBox="0 0 20 20"
                                    >
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                </div>

                                {/* Name */}
                                <h3
                                    className="text-xs sm:text-sm font-bold mb-1 line-clamp-2 min-h-[2rem] group-hover:text-[var(--neon-blue)] transition-colors"
                                    style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}
                                >
                                    {vendor.name}
                                </h3>

                                {/* Location */}
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    <svg className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--neon-orange)' }} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-[10px] sm:text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{vendor.city}, {vendor.state}</span>
                                </div>

                                {/* Stars */}
                                <div className="flex items-center justify-center gap-0.5 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-3 h-3" style={{ color: 'var(--neon-orange)' }} fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                    <span className="text-[10px] ml-1" style={{ color: 'var(--text-secondary)' }}>{vendor.rating}</span>
                                </div>

                                {/* CTA */}
                                <div className="flex items-center justify-center gap-1 pt-2 w-full" style={{ borderTop: '1px solid rgba(37,99,235,0.08)' }}>
                                    <span className="text-[10px] sm:text-xs group-hover:text-[var(--neon-blue)] transition-colors" style={{ color: '#667788' }}>View Details</span>
                                    <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" style={{ color: 'var(--neon-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="text-center mt-8">
                <Link to="/vendors" id="trusted-vendors-view-all" className="btn-primary" style={{ fontSize: '0.875rem', display: 'inline-flex' }}>
                    <span>View All Vendors</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
