import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Rating from '../components/Rating';
import VendorBadges from '../components/VendorBadges';
import SEO from '../components/SEO';
import { getCollectionPageSchema } from '../utils/structuredData';
import { api } from '../services/api';
import { getLogoUrl } from '../utils/imageUrl';
import { useCMS } from '../hooks/useCMS';

// 3D Tilt Card Wrapper
function TiltCard({ children }) {
    const ref = useRef(null);
    const handleMove = (e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotateX = ((y - cy) / cy) * -6;
        const rotateY = ((x - cx) / cx) * 6;
        el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`;
    };
    const handleLeave = () => {
        if (ref.current) ref.current.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
    };
    return (
        <div
            ref={ref}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={{ transition: 'transform 0.1s ease', willChange: 'transform' }}
        >
            {children}
        </div>
    );
}
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];



const AllVendors = () => {
    const { get } = useCMS('vendors');
    const [vendors, setVendors] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1');
    const searchTerm = searchParams.get('search') || '';
    const selectedState = searchParams.get('state') || '';
    const vendorsPerPage = 24;

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                setLoading(true);
                const params = { page: currentPage, page_size: vendorsPerPage };
                if (searchTerm) params.search = searchTerm;
                if (selectedState) params.state = selectedState;
                const data = await api.getVendors(params);
                if (data.results) {
                    setVendors(data.results);
                    setTotalCount(data.count);
                } else {
                    setVendors(Array.isArray(data) ? data : []);
                    setTotalCount(Array.isArray(data) ? data.length : 0);
                }
                setError(null);
            } catch (err) {
                console.warn('[AllVendors] Vendors unavailable');
                setError('Failed to load vendors. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        const timer = setTimeout(fetchVendors, 300);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, selectedState]);

    const handleSearchChange = (e) => setSearchParams({ search: e.target.value, state: selectedState, page: 1 });
    const handleStateChange = (e) => setSearchParams({ search: searchTerm, state: e.target.value, page: 1 });
    const handleClearFilters = () => setSearchParams({ page: 1 });
    const paginate = (n) => { setSearchParams({ search: searchTerm, state: selectedState, page: n }); window.scrollTo(0, 0); };
    const totalPages = Math.ceil(totalCount / vendorsPerPage);

    const collectionSchema = getCollectionPageSchema({
        name: 'All Auto Salvage Yards',
        description: `Browse ${totalCount} verified auto salvage yards`,
        numberOfItems: totalCount
    });

    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
            <SEO
                title={`All Junkyards - Browse ${totalCount} Auto Salvage Yards Nationwide`}
                description={`Browse our complete directory of ${totalCount} verified auto salvage yards. Find used auto parts, compare prices, and connect with local junkyards.`}
                canonicalUrl={`/vendors${currentPage > 1 ? `?page=${currentPage}` : ''}`}
                structuredData={[collectionSchema]}
            />
            <Navbar />

            {/* ── HERO ── */}
            <section
                className="hero-depth pt-24 pb-16 flex flex-col justify-center items-center text-center"
                style={{ minHeight: '40vh', background: 'var(--bg-base)' }}
            >
                {/* PRIMARY — CMS-controlled hero image */}
                <div className="hero-bg-primary" style={{ backgroundImage: `url('${get('hero', 'bg_image', '/heroes/salvage-sunset.png')}')`, opacity: 0.6 }} />
                {/* DEPTH — car crusher blur */}
                <div className="hero-bg-depth" style={{ backgroundImage: "url('/heroes/car-crusher.png')" }} />
                
                <div className="hero-overlay-base" />
                <div className="hero-vignette" />
                <div className="hero-glow-teal" />
                <div className="hero-glow-orange" />
                <div className="hero-grid" />
                <div className="hero-scanline" />
                <div className="hero-fade-bottom" />

                <div className="hero-content relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 shadow-xl" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_#60a5fa]"></div>
                        <span className="font-bold tracking-wider text-xs uppercase" style={{ color: '#ffffff' }}>
                            50 States • {totalCount > 0 ? `${totalCount}+` : '1,000+'} Vendors
                        </span>
                    </div>

                    <h1 className="font-black mb-4 tracking-tight px-2 animate-fade-in-up" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: '#ffffff', fontFamily: "'Outfit', sans-serif", textShadow: '0 2px 10px rgba(0,0,0,0.5)' }} dangerouslySetInnerHTML={{ __html: get('hero', 'heading', 'Browse All <span class="block md:inline mt-2 md:mt-0" style="color: #60a5fa">Junkyards</span>') }} />

                    <p className="font-light max-w-3xl mx-auto mb-10 px-2 text-lg animate-fade-in-up delay-100" style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }} dangerouslySetInnerHTML={{ __html: get('hero', 'subheading', 'Find <strong style="color: #ffffff">quality auto parts</strong> from trusted salvage yards statewide. Filter by location and connect instantly.') }} />

                    {/* Integrated Search Bar inside Hero */}
                    <div className="max-w-4xl mx-auto mt-8 animate-fade-in-up delay-200 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Text Search */}
                            <div className="md:col-span-2 relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                    <svg className="w-6 h-6 transition-colors" style={{ color: 'var(--neon-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    id="vendor-search"
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Search by name, city, or state..."
                                    className="w-full pl-14 pr-4 py-4 rounded-xl text-lg transition-all duration-300 outline-none bg-white relative"
                                    style={{ border: '2px solid transparent', color: '#0f172a', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                    onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 4px 20px rgba(37,99,235,0.15)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}
                                />
                            </div>
                            
                            {/* State Dropdown */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <select
                                    id="state-filter"
                                    value={selectedState}
                                    onChange={handleStateChange}
                                    className="w-full pl-12 pr-10 py-4 rounded-xl text-lg font-semibold outline-none appearance-none cursor-pointer bg-white transition-all duration-300 relative"
                                    style={{ border: '2px solid transparent', color: '#0f172a', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                    onFocus={e => { e.target.style.borderColor = '#2563eb'; }}
                                    onBlur={e => { e.target.style.borderColor = 'transparent'; }}
                                >
                                    <option value="">All States</option>
                                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* ── ALIGN RESULTS & MAIN GRID ── */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">

                    {/* Results info */}
                    <div className="mt-3 flex items-center justify-between">
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: "'JetBrains Mono', monospace" }}>
                            <span style={{ color: 'var(--neon-blue)' }}>{vendors.length > 0 ? `${(currentPage - 1) * vendorsPerPage + 1}–${Math.min(currentPage * vendorsPerPage, totalCount)}` : '0'}</span>
                            {' '}of{' '}
                            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{totalCount}</span>
                            {' '}junkyards
                        </span>
                        {(searchTerm || selectedState) && (
                            <button
                                onClick={handleClearFilters}
                                className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
                                style={{ color: 'var(--neon-orange)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}
                                onMouseEnter={e => e.currentTarget.style.color = '#ff9500'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--neon-orange)'}
                            >
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

            {/* ── VENDOR GRID ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center items-center py-24">
                        <div className="text-center">
                            <div className="spinner-glow mx-auto mb-4" />
                            <p style={{ color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}>
                                Scanning junkyard database...
                            </p>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="py-12 text-center">
                        <div className="inline-block p-6 rounded-xl mb-4" style={{ background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.2)' }}>
                            <p style={{ color: '#ff4444', fontWeight: 700, marginBottom: '0.5rem' }}>⚠ Connection Error</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{error}</p>
                        </div>
                    </div>
                )}

                {/* Vendor Cards */}
                {!loading && !error && vendors.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                        {vendors.map((vendor) => (
                            <TiltCard key={vendor.id}>
                                <Link to={`/vendors/${vendor.id}`} className="group block h-full" style={{ textDecoration: 'none' }}>
                                    {/* glow halo */}
                                    <div className="relative h-full">
                                        <div
                                            className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                            style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(234,88,12,0.2))', filter: 'blur(6px)', zIndex: 0 }}
                                        />
                                        <div
                                            className="relative h-full flex flex-col rounded-xl overflow-hidden transition-all duration-400 group-hover:-translate-y-1"
                                            style={{
                                                background: '#ffffff',
                                                border: '1px solid rgba(37,99,235,0.08)',
                                                zIndex: 1,
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(37,99,235,0.08)'}
                                        >
                                            {/* Badge */}
                                            {(vendor.is_top_rated || vendor.is_featured) && (
                                                <div className="absolute top-2 right-2 z-10">
                                                    <VendorBadges isTopRated={vendor.is_top_rated} isFeatured={vendor.is_featured} compact={true} />
                                                </div>
                                            )}

                                            {/* Logo Area */}
                                            <div
                                                className="aspect-[16/9] flex items-center justify-center p-4 relative overflow-hidden"
                                                style={{ background: 'rgba(240,245,250,0.8)' }}
                                            >
                                                {/* subtle dot grid */}
                                                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
                                                {vendor.logo ? (
                                                    <img
                                                        src={getLogoUrl(vendor.logo)}
                                                        alt={vendor.name}
                                                        className="relative z-10 max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                                                        onError={e => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Cpath d='M20 75 L50 30 L80 75 Z' fill='%23cbd5e1'/%3E%3Ccircle cx='70' cy='28' r='10' fill='%23cbd5e1'/%3E%3C/svg%3E"; }}
                                                    />
                                                ) : (
                                                    <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-xl bg-blue-50 border border-blue-100">
                                                        <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5m4 0H9" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Divider */}
                                            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.15), transparent)' }} />

                                            {/* Content */}
                                            <div className="flex flex-col flex-grow p-3 sm:p-4">
                                                <h3
                                                    className="font-bold text-sm sm:text-base mb-1.5 line-clamp-2 transition-colors duration-200 group-hover:text-[var(--neon-blue)]"
                                                    style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif", minHeight: '2.5rem' }}
                                                >
                                                    {vendor.name}
                                                </h3>

                                                <div className="flex items-center gap-1.5 mb-3" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                                    <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--neon-orange)' }} fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="truncate">{vendor.city}, {vendor.state}</span>
                                                </div>

                                                <div className="mb-3">
                                                    <Rating
                                                        stars={vendor.rating_stars || 5}
                                                        percentage={vendor.rating_percentage || 100}
                                                        size="sm"
                                                        showPercentage={false}
                                                    />
                                                </div>

                                                <div className="mt-auto">
                                                    <div
                                                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wide transition-all duration-300"
                                                        style={{
                                                            background: 'rgba(37,99,235,0.06)',
                                                            border: '1px solid rgba(37,99,235,0.15)',
                                                            color: 'var(--neon-blue)',
                                                            letterSpacing: '0.06em'
                                                        }}
                                                    >
                                                        View Details
                                                        <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </TiltCard>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && vendors.length === 0 && (
                    <div className="text-center py-24">
                        <div
                            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
                            style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)' }}
                        >
                            <svg className="w-10 h-10" style={{ color: 'var(--neon-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginBottom: '0.5rem' }}>
                            No vendors found
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Try adjusting your search or filters
                        </p>
                        <button onClick={handleClearFilters} className="btn-neon" style={{ fontSize: '0.875rem' }}>
                            Clear All Filters
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                        <div
                            className="inline-flex items-center gap-1.5 p-1.5 rounded-xl"
                            style={{ background: 'rgba(240,245,250,0.8)', border: '1px solid rgba(37,99,235,0.12)', backdropFilter: 'blur(12px)' }}
                        >
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                                style={{
                                    color: currentPage === 1 ? '#334455' : 'var(--text-secondary)',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    background: 'transparent',
                                    border: 'none'
                                }}
                            >
                                ← Prev
                            </button>

                            {[...Array(totalPages)].map((_, index) => {
                                const n = index + 1;
                                if (n === 1 || n === totalPages || (n >= currentPage - 1 && n <= currentPage + 1)) {
                                    return (
                                        <button
                                            key={n}
                                            onClick={() => paginate(n)}
                                            className="min-w-[36px] px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200"
                                            style={{
                                                background: currentPage === n ? '#2563eb' : 'transparent',
                                                color: currentPage === n ? '#ffffff' : 'var(--text-secondary)',
                                                border: 'none',
                                                cursor: 'pointer',
                                                boxShadow: currentPage === n ? '0 4px 12px rgba(37,99,235,0.35)' : 'none'
                                            }}
                                        >
                                            {n}
                                        </button>
                                    );
                                } else if (n === currentPage - 2 || n === currentPage + 2) {
                                    return <span key={n} style={{ color: '#334455', padding: '0 4px', fontSize: '0.875rem' }}>…</span>;
                                }
                                return null;
                            })}

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                                style={{
                                    color: currentPage === totalPages ? '#334455' : 'var(--text-secondary)',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    background: 'transparent',
                                    border: 'none'
                                }}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default AllVendors;
