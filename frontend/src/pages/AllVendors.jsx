import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DynamicAd from '../components/DynamicAd';
import MobileAdBanner from '../components/MobileAdBanner';
import Rating from '../components/Rating';
import VendorBadges from '../components/VendorBadges';
import SEO from '../components/SEO';
import { getCollectionPageSchema } from '../utils/structuredData';
import { api } from '../services/api';
import { getLogoUrl } from '../utils/imageUrl';

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

const VendorCardSkeleton = () => (
    <div className="rounded-2xl border border-white/[8%] overflow-hidden animate-pulse" style={{ background: '#111318' }}>
        <div className="aspect-[16/9] bg-white/5" />
        <div className="p-4 space-y-2">
            <div className="h-4 bg-white/5 rounded-lg w-3/4" />
            <div className="h-3 bg-white/5 rounded-lg w-1/2" />
            <div className="h-8 bg-white/5 rounded-lg mt-4" />
        </div>
    </div>
);

const AllVendors = () => {
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

    const collectionSchema = getCollectionPageSchema({ name: 'All Auto Salvage Yards', description: `Browse ${totalCount} verified auto salvage yards`, numberOfItems: totalCount });

    return (
        <div className="min-h-screen" style={{ background: '#0a0b0d' }}>
            <SEO
                title={`All Junkyards - Browse ${totalCount} Auto Salvage Yards Nationwide`}
                description={`Browse our directory of ${totalCount} verified auto salvage yards. Find used auto parts, compare prices, and connect with local junkyards.`}
                canonical={`/junkyards${currentPage > 1 ? `?page=${currentPage}` : ''}`}
                schema={{ '@context': 'https://schema.org', '@graph': [collectionSchema] }}
            />
            <Navbar />

            {/* Hero */}
            <section className="relative py-16 md:py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #080909 0%, #0f1117 100%)' }}>
                {/* Background photo */}
                <div className="absolute inset-0">
                    <img src="/images/static/car-blue-classic.png" alt="Auto Salvage" loading="lazy" className="w-full h-full object-cover object-center" style={{ opacity: 0.15 }} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(8,9,9,0.55) 0%, rgba(8,9,9,0.9) 100%)' }} />
                </div>
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
                    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                </div>
                <div className="hidden xl:block absolute top-4 left-4 z-30"><DynamicAd slot="left_sidebar_ad" page="vendors" /></div>
                <div className="hidden xl:block absolute top-4 right-4 z-30"><DynamicAd slot="right_sidebar_ad" page="vendors" /></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 mb-6" style={{ background: 'rgba(245,158,11,0.08)' }}>
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">{totalCount}+ Verified Junkyards</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-none mb-4">
                            Browse All <span className="block" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Junkyards</span>
                        </h1>
                        <p className="text-white/50 text-base max-w-xl mx-auto">Find quality auto parts from trusted salvage yards nationwide.</p>

                        {/* Stats Strip */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-10">
                            {[{ v: totalCount, l: 'Total Vendors' }, { v: `${US_STATES.length}+`, l: 'States' }, { v: '100%', l: 'Verified' }, { v: '24/7', l: 'Support' }].map((s, i) => (
                                <div key={i} className="rounded-xl border border-white/[8%] p-4 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <div className="text-xl font-black text-amber-400">{s.v}</div>
                                    <div className="text-white/40 text-xs uppercase tracking-widest">{s.l}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Sticky Filter Bar */}
            <div className="sticky top-0 z-40 border-b border-white/[8%]" style={{ background: 'rgba(10,11,13,0.95)', backdropFilter: 'blur(20px)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Search */}
                        <div className="md:col-span-2 relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-white/30" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                            </div>
                            <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Search by name, city, or state..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 text-white bg-white/5 placeholder-white/30 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all text-sm" />
                        </div>
                        {/* State Filter */}
                        <div className="relative">
                            <select value={selectedState} onChange={handleStateChange} className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-white/10 text-white bg-white/5 focus:border-amber-500/50 outline-none transition-all appearance-none cursor-pointer text-sm">
                                <option value="" style={{ background: '#0f1117' }}>All States</option>
                                {US_STATES.map(s => <option key={s} value={s} style={{ background: '#0f1117' }}>{s}</option>)}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-white/30" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </div>
                        </div>
                    </div>
                    {/* Results info */}
                    <div className="flex items-center justify-between mt-3">
                        <span className="text-white/40 text-xs">
                            Showing <span className="text-white/70 font-semibold">{vendors.length > 0 ? (currentPage - 1) * vendorsPerPage + 1 : 0}–{Math.min(currentPage * vendorsPerPage, totalCount)}</span> of <span className="text-amber-400 font-bold">{totalCount}</span> junkyards
                        </span>
                        {(searchTerm || selectedState) && (
                            <button onClick={handleClearFilters} className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Vendors Grid */}
            <section className="py-10" style={{ background: '#0a0b0d' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading && (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                            {[...Array(12)].map((_, i) => <VendorCardSkeleton key={i} />)}
                        </div>
                    )}
                    {error && !loading && (
                        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
                            <p className="text-red-400 font-semibold mb-2">⚠️ Error</p>
                            <p className="text-white/50">{error}</p>
                        </div>
                    )}
                    {!loading && !error && vendors.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                            {vendors.map((vendor, i) => (
                                <motion.div key={vendor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.5) }}>
                                    <Link to={`/vendors/${vendor.id}`} className="group block rounded-2xl border border-white/[8%] overflow-hidden transition-all duration-300 h-full flex flex-col"
                                        style={{ background: '#111318' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(245,158,11,0.12)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                        {/* Logo Area */}
                                        <div className="aspect-[16/9] bg-white/5 p-3 flex items-center justify-center relative">
                                            {vendor.logo ? (
                                                <img src={getLogoUrl(vendor.logo)} alt={vendor.name} loading="lazy" className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                                                    onError={e => { e.target.src = '/images/logo-placeholder.png'; }} />
                                            ) : (
                                                <svg className="w-12 h-12 text-white/10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" /></svg>
                                            )}
                                        </div>
                                        {/* Content */}
                                        <div className="p-3 sm:p-4 flex flex-col flex-grow">
                                            <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors line-clamp-2 mb-1">{vendor.name}</h3>
                                            <div className="flex items-center gap-1 text-white/40 mb-2 text-xs">
                                                <svg className="w-3 h-3 text-amber-500/60 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                                {vendor.city}, {vendor.state}
                                            </div>
                                            {vendor.description && (
                                                <p className="text-white/30 text-xs mb-2 line-clamp-2 leading-relaxed">{vendor.description}</p>
                                            )}
                                            <VendorBadges isTopRated={vendor.is_top_rated} isFeatured={vendor.is_featured} />
                                            <div className="mt-auto mb-2">
                                                <Rating stars={vendor.rating_stars || 5} percentage={vendor.rating_percentage || 100} size="sm" showPercentage={false} showValue={true} value={vendor.rating || '5.0'} theme="dark" />
                                            </div>
                                            <button className="w-full py-2 px-3 rounded-xl text-xs font-bold text-black transition-all duration-200"
                                                style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
                                                View Details →
                                            </button>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                    {!loading && !error && vendors.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-white/20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white/40 mb-2">No vendors found</h3>
                            <p className="text-white/30 mb-6 text-sm">Try adjusting your search or filters</p>
                            <button onClick={handleClearFilters} className="px-8 py-3 rounded-xl font-bold text-black transition-all" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>Clear Filters</button>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-10 flex justify-center">
                            <div className="inline-flex items-center gap-1 rounded-2xl border border-white/10 p-2" style={{ background: '#111318' }}>
                                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${currentPage === 1 ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>← Prev</button>
                                {[...Array(totalPages)].map((_, idx) => {
                                    const page = idx + 1;
                                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                        return (
                                            <button key={page} onClick={() => paginate(page)}
                                                className={`min-w-[40px] py-2 rounded-xl text-sm font-bold transition-all ${currentPage === page ? 'text-black' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                                                style={currentPage === page ? { background: 'linear-gradient(135deg, #f59e0b, #ea580c)' } : {}}>
                                                {page}
                                            </button>
                                        );
                                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                                        return <span key={page} className="text-white/30 px-2 text-sm">…</span>;
                                    }
                                    return null;
                                })}
                                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${currentPage === totalPages ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>Next →</button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <MobileAdBanner page="vendors" />
            <Footer />
        </div>
    );
};

export default AllVendors;
