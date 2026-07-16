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
import { getLogoUrl } from '../utils/imageUrl';
import Rating from '../components/Rating';
import VendorBadges from '../components/VendorBadges';
import { generateVendorUrl } from '../utils/urlHelpers';

const BADGE_COLORS = ['text-blue-700 bg-blue-50 border-blue-100','text-purple-700 bg-purple-50 border-purple-100','text-orange-700 bg-orange-50 border-orange-100','text-emerald-700 bg-emerald-50 border-emerald-100'];

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

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                setLoading(true);
                const params = {
                    state: state,
                    page: currentPage,
                    page_size: vendorsPerPage,
                    search: searchTerm
                };

                const data = await api.getVendors(params);

                if (data.results) {
                    setJunkyards(data.results);
                    setTotalCount(data.count);
                    setTotalPages(Math.ceil(data.count / vendorsPerPage));
                } else if (Array.isArray(data)) {
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

        const timeoutId = setTimeout(() => {
            fetchVendors();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [state, currentPage, searchTerm]);

    useEffect(() => {
        window.scrollTo(0, 0);
        setCurrentPage(1);
    }, [state]);

    useEffect(() => {
        const query = searchParams.get('search') || '';
        if (query !== searchTerm) {
            setSearchTerm(query);
            setCurrentPage(1);
        }
    }, [searchParams]);

    const stateInfo = states?.find(s => s.stateCode?.toLowerCase() === state.toLowerCase());
    const stateName = stateInfo?.stateName || state.toUpperCase();

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
                { name: 'Browse States', url: '/junkyards-by-location' },
                { name: stateName, url: `/junkyards/${state}` }
            ])
        ]
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen flex flex-col">
            <SEO
                title={`Junkyards in ${stateName} - ${totalCount} Auto Salvage Yards`}
                description={`Find ${totalCount} verified junkyards in ${stateName}. Search used auto parts from trusted salvage yards. Free quotes, nationwide shipping available.`}
                schema={schema}
            />

            <Navbar />

            {/* Light Hero Section */}
            <section className="relative pt-32 pb-14 bg-white border-b border-slate-100 overflow-hidden">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-50/80 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 -translate-y-1/2" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-6">
                            <Link to="/junkyards-by-location" className="hover:text-blue-600 transition-colors">Browse States</Link>
                            <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                            <span className="text-slate-900">{stateName}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 bg-blue-50 border border-blue-100">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-blue-600 text-[10px] font-black uppercase tracking-wider">{totalCount} Verified Yards</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                            Junkyards in <span className="text-blue-600">{stateName}</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-medium max-w-xl">
                            Search our extensive network of certified auto salvage yards across {stateName} to find the exact parts you need.
                        </p>
                    </div>

                    {/* Search / Filter Widget right side */}
                    <div className="w-full md:w-[400px]">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_40px_rgb(0,0,0,0.06)] relative z-20">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Find a yard</h3>
                            <div className="relative mb-3">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    placeholder="City, Name, or ZIP..."
                                    className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[15px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[12px] font-bold text-slate-500">
                                    Showing {Math.min(((currentPage - 1) * vendorsPerPage) + 1, totalCount || 0)}–{Math.min(currentPage * vendorsPerPage, totalCount || 0)} of {totalCount}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Grid Section */}
            <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <svg className="animate-spin h-10 w-10 text-blue-600 mb-6" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="font-bold">Loading yards...</span>
                    </div>
                ) : junkyards.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                            {junkyards.map((vendor, index) => {
                                const logoUrl = vendor.logo ? getLogoUrl(vendor.logo) : null;
                                const badgeColor = BADGE_COLORS[index % BADGE_COLORS.length];
                                return (
                                    <Link to={generateVendorUrl(vendor)} key={vendor.id} className="block group focus:outline-none">
                                        <div className="bg-white rounded-[16px] md:rounded-2xl border border-slate-100 shadow-[0_2px_16px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full flex flex-col">

                                            {/* Status Badge */}
                                            <div className="flex items-center gap-1 justify-between px-3 md:px-4 pt-3 md:pt-4">
                                                <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-wider px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full border ${badgeColor}`}>
                                                    ✓ {vendor.is_featured ? 'Featured' : vendor.is_top_rated ? 'Top Rated' : 'Verified'}
                                                </span>
                                                {(vendor.is_top_rated || vendor.is_featured) && (
                                                    <VendorBadges isTopRated={vendor.is_top_rated} isFeatured={vendor.is_featured} compact={true} />
                                                )}
                                            </div>

                                            {/* Logo */}
                                            <div className="h-20 md:h-32 flex items-center justify-center bg-slate-50 mx-3 md:mx-4 my-2 md:my-3 rounded-lg md:rounded-xl overflow-hidden">
                                                {logoUrl ? (
                                                    <img src={logoUrl} alt={vendor.name}
                                                        className="max-h-full max-w-full object-contain p-2 md:p-3 group-hover:scale-105 transition-transform duration-300"
                                                        onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-blue-100 text-blue-600 font-black text-sm md:text-xl flex items-center justify-center">
                                                        {vendor.name?.charAt(0) || 'J'}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="px-3 md:px-4 pb-3 md:pb-4 flex-1 flex flex-col">
                                                <h3 className="font-black text-slate-900 text-[12px] md:text-[15px] leading-snug mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                    {vendor.name}
                                                </h3>
                                                <p className="text-[10px] md:text-[12px] font-medium text-slate-400 mb-2 flex items-center gap-1 md:gap-1.5">
                                                    <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                                                    <span className="truncate">{vendor.city}, {vendor.state}</span>
                                                </p>

                                                <div className="mb-2 md:mb-3">
                                                    <Rating stars={vendor.rating_stars || 5} percentage={vendor.rating_percentage || 100} size="sm" showPercentage={false} />
                                                </div>

                                                <div className="mt-auto">
                                                    <span className="w-full py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold text-[11px] md:text-[13px] text-white bg-blue-600 group-hover:bg-blue-700 transition-colors flex justify-center items-center gap-1 md:gap-1.5">
                                                        View <span className="hidden md:inline">Inventory</span>
                                                        <svg className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-12 gap-2">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-3 bg-white text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                
                                {/* Truncated pagination dots logic skipped for simplicity, showing sequence */}
                                {[...Array(totalPages)].map((_, i) => {
                                    // simple logic for 5 pages around current
                                    if(Math.abs(currentPage - (i + 1)) <= 2 || i === 0 || i === totalPages - 1) {
                                        const isCurrent = currentPage === i + 1;
                                        return (
                                            <button
                                                key={i + 1}
                                                onClick={() => paginate(i + 1)}
                                                className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold transition-all shadow-sm ${
                                                    isCurrent
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-[0_4px_12px_rgb(37,99,235,0.3)]'
                                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 border'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        );
                                    } else if (Math.abs(currentPage - (i + 1)) === 3) {
                                        return <span key={i + 1} className="w-8 h-12 flex items-center justify-center text-slate-400 font-black">...</span>;
                                    }
                                    return null;
                                })}
                                
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-3 bg-white text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No Junkyards Found</h3>
                        <p className="text-slate-500 font-medium">Try adjusting your search criteria.</p>
                        {searchTerm && (
                            <button
                                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                                className="mt-6 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm transition-colors"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}
            </div>

            <MobileAdBanner page="state_browse" />
            <Footer />
        </div>
    );
}
