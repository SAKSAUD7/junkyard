import React, { useState, useEffect } from 'react';
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

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

const STATE_NAMES = {
    AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming'
};

const PRICE_TIERS = ['Up to 60% Off','Up to 70% Off','Up to 75% Off','Up to 80% Off'];
const BADGE_COLORS = ['text-blue-700 bg-blue-50 border-blue-100','text-purple-700 bg-purple-50 border-purple-100','text-orange-700 bg-orange-50 border-orange-100','text-emerald-700 bg-emerald-50 border-emerald-100'];

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
        <div className="bg-[#f8fafc] min-h-screen">
            <SEO
                title={`All Junkyards - Browse ${totalCount} Auto Salvage Yards Nationwide`}
                description={`Browse our complete directory of ${totalCount} verified auto salvage yards. Find used auto parts, compare prices, and connect with local junkyards.`}
                canonicalUrl={`/vendors${currentPage > 1 ? `?page=${currentPage}` : ''}`}
                structuredData={[collectionSchema]}
            />
            <Navbar />

            {/* ── HERO ── */}
            <section className="relative pt-28 pb-14 bg-white border-b border-slate-100 overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] opacity-60 pointer-events-none translate-x-1/3 -translate-y-1/4" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-50 rounded-full blur-[80px] opacity-40 pointer-events-none -translate-x-1/3 translate-y-1/4" />

                <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <div className="text-center mb-10">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 bg-blue-50 border border-blue-100">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                            <span className="text-blue-600 text-[12px] font-bold uppercase tracking-widest">
                                50 States • {totalCount > 0 ? `${totalCount.toLocaleString()}+` : '6,500+'} Verified Yards
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Find Trusted Junkyards <span className="text-blue-600">Near You</span>
                        </h1>
                        <p className="text-[17px] text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                            Connect with verified salvage yards across the U.S. and find the exact auto parts you need — fast.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-3xl mx-auto">
                            <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
                                {/* Name/ZIP input */}
                                <div className="flex-[2] relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                    </div>
                                    <input
                                        id="vendor-search"
                                        type="text"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        placeholder="Search by name, city, or ZIP..."
                                        className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl border border-slate-100 text-[14px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                    />
                                </div>
                                {/* State dropdown */}
                                <div className="flex-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                                    </div>
                                    <select
                                        id="state-filter"
                                        value={selectedState}
                                        onChange={handleStateChange}
                                        className="w-full pl-11 pr-10 py-3.5 bg-white rounded-xl border border-slate-100 text-[14px] font-medium text-slate-900 appearance-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                    >
                                        <option value="">All States</option>
                                        {US_STATES.map(s => <option key={s} value={s}>{STATE_NAMES[s] || s}</option>)}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                                    </div>
                                </div>
                                {/* Search Button */}
                                <button className="px-7 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-[0_8px_20px_rgb(37,99,235,0.25)] whitespace-nowrap text-[14px]">
                                    Search Yards
                                </button>
                            </div>
                            {/* Active filters */}
                            {(searchTerm || selectedState) && (
                                <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                                    {searchTerm && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-[12px] font-bold">
                                            "{searchTerm}"
                                            <button onClick={() => setSearchParams({ search: '', state: selectedState, page: 1 })} className="hover:text-blue-900">✕</button>
                                        </span>
                                    )}
                                    {selectedState && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-[12px] font-bold">
                                            {STATE_NAMES[selectedState] || selectedState}
                                            <button onClick={() => setSearchParams({ search: searchTerm, state: '', page: 1 })} className="hover:text-indigo-900">✕</button>
                                        </span>
                                    )}
                                    <button onClick={handleClearFilters} className="text-[12px] font-bold text-red-500 hover:text-red-700 transition">
                                        Clear all
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── MAIN CONTENT ── */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Results Bar */}
                <div className="flex items-center justify-between mb-7">
                    <div>
                        <h2 className="text-xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Top Rated Junkyards
                        </h2>
                        <p className="text-[13px] text-slate-500 font-medium mt-0.5">
                            {loading ? 'Loading...' : vendors.length > 0
                                ? `Showing ${(currentPage - 1) * vendorsPerPage + 1}–${Math.min(currentPage * vendorsPerPage, totalCount)} of ${totalCount.toLocaleString()} results`
                                : '0 results'}
                        </p>
                    </div>
                </div>

                {/* Loading Skeleton */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                                <div className="w-full h-36 bg-slate-100 rounded-xl mb-4" />
                                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
                                <div className="h-10 bg-slate-100 rounded-xl" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="py-20 text-center">
                        <div className="inline-block p-6 rounded-2xl mb-4 bg-red-50 border border-red-100">
                            <p className="text-red-600 font-black mb-1">⚠ Error Loading Vendors</p>
                            <p className="text-slate-500 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Vendor Grid */}
                {!loading && !error && vendors.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {vendors.map((vendor, index) => {
                            const logoUrl = vendor.logo ? getLogoUrl(vendor.logo) : null;
                            const priceTier = PRICE_TIERS[index % PRICE_TIERS.length];
                            const badgeColor = BADGE_COLORS[index % BADGE_COLORS.length];
                            return (
                                <Link to={`/vendors/${vendor.id}`} key={vendor.id} className="block group focus:outline-none">
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_16px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full flex flex-col">

                                        {/* Status Badge */}
                                        <div className="flex items-center justify-between px-4 pt-4">
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${badgeColor}`}>
                                                ✓ {vendor.is_featured ? 'Featured' : vendor.is_top_rated ? 'Top Rated' : 'Verified'}
                                            </span>
                                            {(vendor.is_top_rated || vendor.is_featured) && (
                                                <VendorBadges isTopRated={vendor.is_top_rated} isFeatured={vendor.is_featured} compact={true} />
                                            )}
                                        </div>

                                        {/* Logo */}
                                        <div className="h-32 flex items-center justify-center bg-slate-50 mx-4 my-3 rounded-xl overflow-hidden">
                                            {logoUrl ? (
                                                <img src={logoUrl} alt={vendor.name}
                                                    className="max-h-full max-w-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                                                    onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-black text-xl flex items-center justify-center">
                                                    {vendor.name?.charAt(0) || 'J'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="px-4 pb-4 flex-1 flex flex-col">
                                            <h3 className="font-black text-slate-900 text-[15px] leading-snug mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                {vendor.name}
                                            </h3>
                                            <p className="text-[12px] font-medium text-slate-400 mb-2.5 flex items-center gap-1.5">
                                                <svg className="w-3 h-3 text-slate-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                                                {vendor.city}, {vendor.state}
                                            </p>

                                            <div className="mb-3">
                                                <Rating stars={vendor.rating_stars || 5} percentage={vendor.rating_percentage || 100} size="sm" showPercentage={false} />
                                            </div>

                                            <div className="mb-2"></div>

                                            <div className="mt-auto">
                                                <span className="w-full py-2.5 rounded-xl font-bold text-[13px] text-white bg-blue-600 group-hover:bg-blue-700 transition-colors flex justify-center items-center gap-1.5">
                                                    View Inventory
                                                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && vendors.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>No vendors found</h3>
                        <p className="text-slate-500 mb-6">Try adjusting your search or clearing filters</p>
                        <button onClick={handleClearFilters} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">
                            Clear All Filters
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}
                                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition disabled:cursor-not-allowed">
                                ← Prev
                            </button>
                            {[...Array(totalPages)].map((_, index) => {
                                const n = index + 1;
                                if (n === 1 || n === totalPages || (n >= currentPage - 1 && n <= currentPage + 1)) {
                                    return (
                                        <button key={n} onClick={() => paginate(n)}
                                            className={`min-w-[36px] px-3 py-2 rounded-xl text-sm font-bold transition ${currentPage === n ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgb(37,99,235,0.3)]' : 'text-slate-500 hover:bg-slate-50'}`}>
                                            {n}
                                        </button>
                                    );
                                } else if (n === currentPage - 2 || n === currentPage + 2) {
                                    return <span key={n} className="text-slate-400 px-1">…</span>;
                                }
                                return null;
                            })}
                            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition disabled:cursor-not-allowed">
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
