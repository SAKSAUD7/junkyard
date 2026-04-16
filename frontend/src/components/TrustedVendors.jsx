import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { getLogoUrl } from '../utils/imageUrl';
import './TrustedVendors.css';

const PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Cpath d='M20 75 L50 30 L80 75 Z' fill='%23cbd5e1'/%3E%3Ccircle cx='70' cy='28' r='10' fill='%23cbd5e1'/%3E%3C/svg%3E";

/* ── Single circular card ────────────────────────── */
function CircleCard({ vendor, orbitClass }) {
    const logoUrl = getLogoUrl(vendor.logo);
    const stars  = vendor.rating_stars ?? 5;
    const pct    = vendor.rating_percentage ?? (vendor.rating ? Math.round(vendor.rating * 20) : 100);

    return (
        <Link to={`/vendors/${vendor.id}`} className="tv-circle-link">
            <div className={`tv-circle-card ${orbitClass}`}>

                {/* Verified badge */}
                <div className="tv-circle-verified">
                    <svg width="11" height="11" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#fff' }}>
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* Logo */}
                <div className="tv-circle-logo">
                    <img
                        src={logoUrl || PLACEHOLDER}
                        alt={vendor.name}
                        loading="lazy"
                        onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
                    />
                </div>

                {/* Name */}
                <p className="tv-circle-name">{vendor.name}</p>

                {/* Location */}
                <div className="tv-circle-location">
                    <svg width="9" height="9" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#f59e0b', flexShrink: 0 }}>
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{vendor.city}, {vendor.state}</span>
                </div>

                {/* Stars */}
                <div className="tv-circle-stars">
                    {[...Array(5)].map((_, i) => (
                        <svg key={i} viewBox="0 0 20 20"
                            fill={i < stars ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth={i < stars ? 0 : 1.5}
                            style={{ width: 11, height: 11, color: '#f59e0b' }}>
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                    <span className="tv-circle-pct">{pct}%</span>
                </div>

                {/* CTA */}
                <div className="tv-circle-cta">
                    <span>View Details</span>
                    <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" style={{ width: 10, height: 10 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}

/* ── Main section ────────────────────────────────── */
export default function TrustedVendors() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getTrustedVendors(10)
            .then(v => setVendors(v || []))
            .catch(() => console.warn('[TrustedVendors] unavailable'))
            .finally(() => setLoading(false));
    }, []);

    if (loading || !vendors.length) return null;

    // Positions 0-4 = left side, 5-9 = right side
    const ORBIT_CLASSES = [
        'tv-orbit-0', 'tv-orbit-1', 'tv-orbit-2', 'tv-orbit-3', 'tv-orbit-4',
        'tv-orbit-5', 'tv-orbit-6', 'tv-orbit-7', 'tv-orbit-8', 'tv-orbit-9',
    ];

    return (
        <section className="tv-section">
            {/* Soft glow blobs */}
            <div className="tv-blob tv-blob-1" />
            <div className="tv-blob tv-blob-2" />
            <div className="tv-blob tv-blob-3" />

            {/* ── DESKTOP orbital layout ─────────────────── */}
            <div className="tv-orbital-wrapper">
                {/* Centered heading */}
                <div className="tv-center-text">
                    <div className="tv-badge">
                        <span className="tv-badge-dot" />
                        <span className="tv-badge-text">Top Vendors</span>
                    </div>
                    <h2 className="tv-heading">
                        Trusted{' '}
                        <span className="tv-heading-gradient">Salvage Yards</span>
                    </h2>
                    <p className="tv-subhead">
                        Hand‑picked, verified junkyards trusted by thousands of car owners nationwide.
                    </p>
                    <Link to="/vendors" id="trusted-vendors-view-all" className="tv-view-all-btn">
                        <span>View All Vendors</span>
                        <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>

                {/* Absolute-positioned orbital cards (desktop only) */}
                <div className="tv-orbital-cards">
                    {vendors.slice(0, 10).map((vendor, i) => (
                        <div key={vendor.id} className={`tv-orbit-slot ${ORBIT_CLASSES[i] || ''}`}>
                            <CircleCard vendor={vendor} orbitClass={`tv-float-${i}`} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── MOBILE / TABLET grid fallback ─────────── */}
            <div className="tv-mobile-section">
                {/* Heading */}
                <div className="tv-mobile-header">
                    <div className="tv-badge">
                        <span className="tv-badge-dot" />
                        <span className="tv-badge-text">Top Vendors</span>
                    </div>
                    <h2 className="tv-heading">
                        Trusted{' '}
                        <span className="tv-heading-gradient">Salvage Yards</span>
                    </h2>
                    <p className="tv-subhead">
                        Hand‑picked, verified junkyards trusted by thousands of car owners nationwide.
                    </p>
                </div>

                {/* Grid */}
                <div className="tv-grid-fallback">
                    {vendors.slice(0, 10).map(vendor => (
                        <CircleCard key={vendor.id} vendor={vendor} orbitClass="" />
                    ))}
                </div>

                {/* Button */}
                <div style={{ textAlign: 'center', marginTop: 32 }}>
                    <Link to="/vendors" id="trusted-vendors-view-all-mobile" className="tv-view-all-btn">
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
