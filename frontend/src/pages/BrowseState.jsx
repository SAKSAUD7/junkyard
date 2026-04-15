import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { useData } from '../hooks/useData';
import SEO from '../components/SEO';
import { getCollectionPageSchema, getBreadcrumbSchema } from '../utils/structuredData';
import DynamicAd from '../components/DynamicAd';
import MobileAdBanner from '../components/MobileAdBanner';

export default function BrowseState() {
    const { state } = useParams();
    const [searchParams] = useSearchParams();
    const initialSearch = searchParams.get('search') || '';

    const [junkyards, setJunkyards] = useState([]);
    const [loading, setLoading] = useState(true);
    const { data: states } = useData('data_states.json');
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const vendorsPerPage = 24;

    // Fetch vendors from API with server-side filtering
    useEffect(() => {
        const fetchVendors = async () => {
            try {
                setLoading(true);
                // Construct API params for server-side filtering
                const params = {
                    state: state,
                    page: currentPage,
                    page_size: vendorsPerPage,
                    search: searchTerm
                };

                const data = await api.getVendors(params);

                // Handle paginated response
                if (data.results) {
                    setJunkyards(data.results);
                    setTotalCount(data.count);
                    setTotalPages(Math.ceil(data.count / vendorsPerPage));
                } else if (Array.isArray(data)) {
                    // Fallback if API returns array (shouldn't happen with pagination)
                    setJunkyards(data);
                    setTotalCount(data.length);
                    setTotalPages(1);
                } else {
                    setJunkyards([]);
                    setTotalCount(0);
                }
            } catch (err) {
                console.error('Error fetching vendors:', err);
                setJunkyards([]);
                setTotalCount(0);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search to prevent too many API calls
        const timeoutId = setTimeout(() => {
            fetchVendors();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [state, currentPage, searchTerm]);

    // Scroll to top when page loads or state changes
    useEffect(() => {
        window.scrollTo(0, 0);
        setCurrentPage(1); // Reset to page 1 on state change
    }, [state]);

    // Sync search term with URL
    useEffect(() => {
        const query = searchParams.get('search') || '';
        if (query !== searchTerm) {
            setSearchTerm(query);
            setCurrentPage(1);
        }
    }, [searchParams]);

    // Get state full name
    const stateInfo = states?.find(s => s.stateCode?.toLowerCase() === state.toLowerCase());
    const stateName = stateInfo?.stateName || state.toUpperCase();

    // Pagination handler
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // SEO structured data
    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            getCollectionPageSchema({
                name: `Junkyards in ${stateName}`,
                description: `Find auto salvage yards and used auto parts in ${stateName}`,
                url: typeof window !== 'undefined' ? window.location.href : '',
                numberOfItems: totalCount
            }),
            getBreadcrumbSchema([
                { name: 'Home', url: '/' },
                { name: 'Browse States', url: '/browse' },
                { name: stateName, url: `/browse/${state}` }
            ])
        ]
    };

    return (
        <div style={{ background: 'var(--bg-base, var(--bg-base))', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <SEO
                title={`Junkyards in ${stateName} - ${totalCount} Auto Salvage Yards`}
                description={`Find ${totalCount} verified junkyards in ${stateName}. Search used auto parts from trusted salvage yards. Free quotes, nationwide shipping available.`}
                schema={schema}
            />

            <Navbar />

            {/* Dark Hero with Animation */}
            <div className="hero-depth relative pt-24 pb-12 overflow-hidden flex items-center" style={{ minHeight: '40vh', background: 'var(--bg-base)' }}>

                {/* Animation background */}
                <div className="hero-bg-primary" style={{ backgroundImage: "url('/heroes/salvage-sunset.png')", opacity: 0.58 }} />
                <div className="hero-bg-depth" style={{ backgroundImage: "url('/heroes/stacked-cars.png')" }} />
                <div className="hero-overlay-base" />
                <div className="hero-vignette" />
                <div className="hero-glow-teal" />
                <div className="hero-glow-orange" />
                <div className="hero-grid" />
                <div className="hero-scanline" />
                <div className="hero-fade-bottom" />

                <div className="hero-content relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
                    <div className="space-y-4">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'JetBrains Mono', monospace" }}>
                            <Link to="/browse" className="transition-colors" style={{ color: 'rgba(255,255,255,0.7)' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
                                Browse States
                            </Link>
                            <span style={{ color: 'rgba(255,255,255,0.5)' }}>›</span>
                            <span style={{ color: '#ffffff' }}>{stateName}</span>
                        </div>

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#60a5fa', boxShadow: '0 0 8px #60a5fa' }}></div>
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#ffffff' }}>
                                {totalCount} Verified Junkyards
                            </span>
                        </div>

                        <h1 className="font-black leading-tight px-0" style={{ fontSize: 'clamp(2.2rem, 5vw, 4.5rem)', color: '#ffffff', fontFamily: "'Outfit', sans-serif" }}>
                            Junkyards in
                            <span className="block" style={{ color: '#60a5fa' }}>{stateName}</span>
                        </h1>

                        <p className="text-lg font-light" style={{ color: 'rgba(255,255,255,0.85)' }}>
                            Explore <strong style={{ color: '#ffffff' }}>{totalCount} auto salvage yards</strong> in {stateName}.
                        </p>
                    </div>
                </div>
            </div>


            {/* Sticky Search & Filter Bar */}
            <div className="sticky top-0 z-40" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(37,99,235,0.1)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5" style={{ color: 'var(--neon-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            placeholder="Search by junkyard name or city..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all placeholder-gray-600"
                            style={{ background: 'rgba(240,245,250,0.8)', border: '1px solid rgba(37,99,235,0.15)', color: 'var(--text-primary)' }}
                            onFocus={e => e.target.style.borderColor = 'var(--neon-blue)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(37,99,235,0.15)'}
                        />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
                            Showing {Math.min(((currentPage - 1) * vendorsPerPage) + 1, totalCount)}–{Math.min(currentPage * vendorsPerPage, totalCount)} of <strong style={{ color: 'var(--neon-blue)' }}>{totalCount}</strong> junkyards
                        </span>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                                style={{ color: 'var(--neon-orange)' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#ff9500'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--neon-orange)'}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Vendors Grid */}
            <div className="relative py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="text-center py-24">
                            <div className="spinner-glow mx-auto mb-4" />
                            <p style={{ color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem' }}>Scanning junkyard database...</p>
                        </div>
                    ) : junkyards.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {junkyards.map((vendor) => (
                                <Link
                                    key={vendor.id}
                                    to={`/vendors/${vendor.id}`}
                                    className="group relative block"
                                >
                                    <div
                                        className="relative rounded-2xl overflow-hidden h-full transition-all duration-300 transform group-hover:-translate-y-2"
                                        style={{
                                            background: '#ffffff',
                                            border: '1px solid rgba(15,23,42,0.08)',
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = 'rgba(37,99,235,0.25)';
                                            e.currentTarget.style.boxShadow = '0 12px 32px rgba(37,99,235,0.1)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = 'rgba(15,23,42,0.08)';
                                            e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
                                        }}
                                    >
                                        {/* Logo Area */}
                                        <div className="aspect-video flex items-center justify-center p-4" style={{ background: 'rgba(37,99,235,0.03)' }}>
                                            {vendor.logo ? (
                                                <img
                                                    src={vendor.logo}
                                                    alt={vendor.name}
                                                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Cpath d='M20 75 L50 30 L80 75 Z' fill='%23cbd5e1'/%3E%3Ccircle cx='70' cy='28' r='10' fill='%23cbd5e1'/%3E%3C/svg%3E"; }}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center">
                                                    <svg className="w-12 h-12" style={{ color: 'rgba(37,99,235,0.2)' }} fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 flex flex-col">
                                            <h3 className="font-bold text-sm sm:text-base mb-1 line-clamp-2 transition-colors duration-300 group-hover:text-[var(--neon-blue)]" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                                                {vendor.name}
                                            </h3>

                                            <div className="flex items-center gap-1.5 mb-3 mt-1">
                                                <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--neon-orange)' }} fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{vendor.city}, {vendor.state}</span>
                                            </div>

                                            <div className="flex items-center gap-1 mb-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg key={i} className="w-3 h-3" fill={i < Math.round(vendor.rating || 0) ? '#fbbf24' : 'rgba(255,255,255,0.1)'} viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                                <span className="text-xs ml-1" style={{ color: 'var(--text-secondary)' }}>{vendor.rating}</span>
                                            </div>

                                            <div className="mt-auto font-bold py-2 px-3 rounded-lg text-xs uppercase tracking-wider text-center transition-all"
                                                style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--neon-blue)', border: '1px solid rgba(37,99,235,0.2)' }}
                                            >
                                                View Details →
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6" style={{ background: 'rgba(234,88,12,0.05)', border: '1px solid rgba(234,88,12,0.2)' }}>
                                <svg className="w-10 h-10" style={{ color: 'var(--neon-orange)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>No junkyards found</h3>
                            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Try adjusting your search</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="font-bold px-8 py-3 rounded-xl transition-all transform hover:-translate-y-1"
                                style={{ background: 'var(--neon-blue)', color: 'var(--bg-base)' }}
                            >
                                Clear Search
                            </button>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center">
                            <div className="inline-flex items-center gap-2 rounded-2xl p-2" style={{ background: 'rgba(240,245,250,0.8)', border: '1px solid rgba(37,99,235,0.1)' }}>
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                                    style={{ color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', background: 'transparent' }}
                                >
                                    ← Prev
                                </button>

                                <div className="flex items-center gap-1">
                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNumber = index + 1;
                                        if (pageNumber === 1 || pageNumber === totalPages || (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)) {
                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => paginate(pageNumber)}
                                                    className="min-w-[36px] px-3 py-2 rounded-xl text-sm font-bold transition-all"
                                                    style={{
                                                        background: currentPage === pageNumber ? 'var(--neon-blue)' : 'transparent',
                                                        color: currentPage === pageNumber ? 'var(--bg-base)' : 'var(--text-secondary)',
                                                        boxShadow: currentPage === pageNumber ? '0 0 12px rgba(37,99,235,0.4)' : 'none'
                                                    }}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                                            return <span key={pageNumber} style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                                    style={{ color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', background: 'transparent' }}
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Ad Banner */}
            <MobileAdBanner page="browse" />

            <Footer />
        </div>
    );
}
