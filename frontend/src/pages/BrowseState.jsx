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
                { name: 'Browse States', url: '/browse' },
                { name: stateName, url: `/browse/${state}` }
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
                            <Link to="/browse" className="hover:text-blue-600 transition-colors">Browse States</Link>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {junkyards.map((vendor) => (
                                <Link
                                    key={vendor.id}
                                    to={`/junkyard/${vendor.id}`}
                                    className="group flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(37,99,235,0.08)] hover:border-blue-100 transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    {/* Logo Header */}
                                    <div className="h-32 bg-slate-50 flex items-center justify-center p-6 border-b border-slate-100 relative">
                                        {/* Status indicator */}
                                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-green-500"></div>
                                        {vendor.logo ? (
                                            <img
                                                src={vendor.logo}
                                                alt={vendor.name}
                                                className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-300"
                                                onError={(e) => { e.target.src = '/images/logo-placeholder.png'; }}
                                            />
                                        ) : (
                                            <span className="text-4xl font-black text-slate-200">{vendor.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    
                                    {/* Body */}
                                    <div className="p-6 flex-grow flex flex-col justify-between relative overflow-hidden">
                                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                        
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                <span className="text-sm font-bold text-slate-700">{vendor.rating}</span>
                                            </div>
                                            <h3 className="font-black text-lg text-slate-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1" title={vendor.name}>
                                                {vendor.name}
                                            </h3>
                                            <div className="flex items-start gap-2 text-slate-500 mb-4">
                                                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                                <p className="text-sm font-medium line-clamp-2 leading-relaxed tracking-tight">{vendor.address}, {vendor.city}, {vendor.state} {vendor.zipcode}</p>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold">
                                            <span className="text-slate-500">View Yard</span>
                                            <svg className="w-5 h-5 text-blue-600 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </div>
                                    </div>
                                </Link>
                            ))}
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
