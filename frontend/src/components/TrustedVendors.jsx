import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { getLogoUrl } from '../utils/imageUrl';
import './TrustedVendors.css';

/* ─── Scroll-reveal hook ─────────────────────────────────────── */
function useReveal(rootMargin = '-60px') {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { rootMargin }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [rootMargin]);
    return { ref, visible };
}

/* ─── Fallback SVG logo ──────────────────────────────────────── */
const PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Cpath d='M20 75 L50 30 L80 75 Z' fill='%23cbd5e1'/%3E%3Ccircle cx='70' cy='28' r='10' fill='%23cbd5e1'/%3E%3C/svg%3E";

/* ─── Individual vendor card ─────────────────────────────────── */
function VendorCard({ vendor, index }) {
    const logoUrl = getLogoUrl(vendor.logo);
    const { ref, visible } = useReveal('-40px');

    const ratingStars = vendor.rating_stars ?? 5;
    const ratingPct   = vendor.rating_percentage ?? (vendor.rating ? Math.round(vendor.rating * 20) : 100);

    return (
        <div
            ref={ref}
            className={`tv-card-wrap tv-reveal${visible ? ' is-visible' : ''}`}
            style={{ transitionDelay: `${index * 70}ms` }}
        >
            <Link to={`/vendors/${vendor.id}`} className="tv-card-link">
                <div className="tv-card">
                    {/* Verified badge */}
                    <div className="tv-verified" title="Verified">
                        <svg width="13" height="13" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#fff' }}>
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>

                    {/* Circular logo */}
                    <div className="tv-logo-ring">
                        <img
                            src={logoUrl || PLACEHOLDER}
                            alt={vendor.name}
                            className="tv-logo-img"
                            loading="lazy"
                            onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
                        />
                    </div>

                    {/* Name */}
                    <h3 className="tv-name">{vendor.name}</h3>

                    {/* Location */}
                    <div className="tv-location">
                        <svg width="11" height="11" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#f59e0b', flexShrink: 0 }}>
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                            {vendor.city}, {vendor.state}
                        </span>
                    </div>

                    {/* Stars + rating */}
                    <div className="tv-stars">
                        {[...Array(5)].map((_, i) => (
                            <svg key={i} className="tv-star" fill={i < ratingStars ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={i < ratingStars ? 0 : 1.5} viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                        <span className="tv-rating-pct">{ratingPct}%</span>
                    </div>

                    {/* CTA */}
                    <div className="tv-cta">
                        <span>View Details</span>
                        <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </Link>
        </div>
    );
}

/* ─── Main exported section ──────────────────────────────────── */
export default function TrustedVendors() {
    const [trustedVendors, setTrustedVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const headerReveal = useReveal('-40px');

    useEffect(() => {
        const fetchTrustedVendors = async () => {
            try {
                setLoading(true);
                const vendors = await api.getTrustedVendors(6);
                setTrustedVendors(vendors);
            } catch {
                console.warn('[TrustedVendors] Backend unavailable');
            } finally {
                setLoading(false);
            }
        };
        fetchTrustedVendors();
    }, []);

    if (loading || !trustedVendors || trustedVendors.length === 0) return null;

    return (
        <section className="tv-section">
            {/* ── Decorative floating blobs ────────────────────── */}
            <div className="tv-blob tv-blob-1" />
            <div className="tv-blob tv-blob-2" />
            <div className="tv-blob tv-blob-3" />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

                {/* ── Section header ─────────────────────────── */}
                <div
                    ref={headerReveal.ref}
                    className={`tv-reveal${headerReveal.visible ? ' is-visible' : ''}`}
                    style={{ textAlign: 'center' }}
                >
                    <div className="tv-badge">
                        <span className="tv-badge-dot" />
                        <span className="tv-badge-text">Top Vendors</span>
                    </div>

                    <h2 className="tv-heading">
                        Trusted{' '}
                        <span className="tv-heading-gradient">Salvage Yards</span>
                    </h2>

                    <p className="tv-subhead">
                        Hand-picked, verified junkyards trusted by thousands of car owners across the nation.
                    </p>
                </div>

                {/* ── Vendor card grid ───────────────────────── */}
                <div className="tv-grid">
                    {trustedVendors.map((vendor, i) => (
                        <VendorCard key={vendor.id} vendor={vendor} index={i} />
                    ))}
                </div>

                {/* ── View all button ────────────────────────── */}
                <div className="tv-view-all-wrap">
                    <Link to="/vendors" id="trusted-vendors-view-all" className="tv-view-all-btn">
                        <span>View All Vendors</span>
                        <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
