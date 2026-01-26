import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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

const AllVendors = () => {
    const [vendors, setVendors] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // URL Params for shareable state
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1');
    const searchTerm = searchParams.get('search') || '';
    const selectedState = searchParams.get('state') || '';

    const vendorsPerPage = 24;

    // Fetch vendors from API
    useEffect(() => {
        const fetchVendors = async () => {
            try {
                setLoading(true);
                // Prepare params
                const params = {
                    page: currentPage,
                    page_size: vendorsPerPage
                };
                if (searchTerm) params.search = searchTerm;
                if (selectedState) params.state = selectedState;

                const data = await api.getVendors(params);

                // Handle paginated response
                if (data.results) {
                    setVendors(data.results);
                    setTotalCount(data.count);
                } else {
                    // Fallback if API structure differs (shouldn't happen with new backend)
                    setVendors(Array.isArray(data) ? data : []);
                    setTotalCount(Array.isArray(data) ? data.length : 0);
                }
                setError(null);
            } catch (err) {
                console.error('Error fetching vendors:', err);
                setError('Failed to load vendors. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        // Debounce search slightly to avoid excessive API calls
        const timer = setTimeout(() => {
            fetchVendors();
        }, 300);

        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, selectedState]);

    // Update filters and reset to page 1
    const handleSearchChange = (e) => {
        setSearchParams({ search: e.target.value, state: selectedState, page: 1 });
    };

    const handleStateChange = (e) => {
        setSearchParams({ search: searchTerm, state: e.target.value, page: 1 });
    };

    const handleClearFilters = () => {
        setSearchParams({ page: 1 });
    };

    const paginate = (pageNumber) => {
        setSearchParams({ search: searchTerm, state: selectedState, page: pageNumber });
        window.scrollTo(0, 0);
    };

    const totalPages = Math.ceil(totalCount / vendorsPerPage);

    // Get unique states (We need a separate API call for this now, or hardcode/fetch once)
    // Ideally use api.getStates() but for now let's use a Common list or fetch separate.
    // Existing code derived it from full list. Let's fetch common states if possible or use a static list.
    // For simplicity/robustness, let's load states efficiently.
    const [availableStates, setAvailableStates] = useState([]);
    useEffect(() => {
        const loadStates = async () => {
            try {
                // Use the optimized common/states endpoint if available or hollander states
                // Fallback: standard US states list
                const states = [
                    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
                ];
                setAvailableStates(states);
            } catch (e) { console.error(e); }
        };
        loadStates();
    }, []);


    // SEO structured data
    const collectionSchema = getCollectionPageSchema({
        name: 'All Auto Salvage Yards',
        description: `Browse ${totalCount} verified auto salvage yards`,
        numberOfItems: totalCount
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50">
            <SEO
                title={`All Junkyards - Browse ${totalCount} Auto Salvage Yards Nationwide`}
                description={`Browse our complete directory of ${totalCount} verified auto salvage yards. Find used auto parts, compare prices, and connect with local junkyards.`}
                canonicalUrl={`/vendors${currentPage > 1 ? `?page=${currentPage}` : ''}`}
                structuredData={[collectionSchema]}
            />
            <Navbar />

            {/* Modern Hero Section - Light Theme */}
            <div className="relative min-h-[25vh] sm:min-h-[40vh] md:min-h-[60vh] flex items-center overflow-hidden bg-gradient-to-br from-blue-600 to-teal-600">
                {/* Desktop Sidebar Ads */}
                <div className="absolute top-4 left-4 z-30 flex flex-col gap-4 hidden xl:block">
                    <DynamicAd slot="left_sidebar_ad" page="vendors" />
                </div>

                <div className="absolute top-4 right-4 z-30 flex flex-col gap-4 hidden xl:block">
                    <DynamicAd slot="right_sidebar_ad" page="vendors" />
                </div>

                <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full compact-section">
                    <div className="text-center space-y-2 sm:space-y-4 md:space-y-6 animate-fade-in">
                        {/* Premium Badge */}
                        <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-white text-xs sm:text-sm font-medium text-gray-500">{totalCount}+ Verified Auto Salvage Yards</span>
                        </div>

                        {/* Main Heading - Mobile First */}
                        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight px-2">
                            Browse All
                            <span className="block">Junkyards</span>
                        </h1>

                        <p className="text-sm sm:text-base md:text-lg text-white/90 font-light max-w-3xl mx-auto px-2">
                            Find <span className="font-bold">quality auto parts</span> from trusted salvage yards nationwide.
                            Search by location, filter by state, and connect instantly.
                        </p>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 compact-gap max-w-4xl mx-auto">
                            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg md:rounded-xl compact-card hover:bg-white/30 transition-all duration-200">
                                <div className="compact-title font-bold text-white">{totalCount}</div>
                                <div className="text-[10px] sm:text-xs text-white/80">Total Vendors</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg md:rounded-xl compact-card hover:bg-white/30 transition-all duration-200">
                                <div className="compact-title font-bold text-white">{availableStates.length}+</div>
                                <div className="text-[10px] sm:text-xs text-white/80">States</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg md:rounded-xl compact-card hover:bg-white/30 transition-all duration-200">
                                <div className="compact-title font-bold text-white">100%</div>
                                <div className="text-[10px] sm:text-xs text-white/80">Verified</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg md:rounded-xl compact-card hover:bg-white/30 transition-all duration-200">
                                <div className="compact-title font-bold text-white">24/7</div>
                                <div className="text-[10px] sm:text-xs text-white/80">Support</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filter Section - Light Theme */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-md">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 compact-gap">
                        {/* Search Input */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Search by name, city, or state..."
                                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 md:py-4 bg-white border-2 border-gray-300 rounded-lg md:rounded-xl text-gray-900 compact-text placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* State Filter */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <select
                                value={selectedState}
                                onChange={handleStateChange}
                                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 md:py-4 bg-white border-2 border-gray-300 rounded-lg md:rounded-xl text-gray-900 compact-text focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All States</option>
                                {availableStates.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Results Info */}
                    <div className="mt-4 flex items-center justify-between text-gray-700">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold">
                                Showing {vendors.length > 0 ? (currentPage - 1) * vendorsPerPage + 1 : 0}-{Math.min(currentPage * vendorsPerPage, totalCount)} of {totalCount} junkyards
                            </span>
                        </div>
                        {(searchTerm || selectedState) && (
                            <button
                                onClick={handleClearFilters}
                                className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Vendors Grid - Compact Mobile */}
            <div className="relative compact-section">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center py-20">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-gray-600">Loading vendors...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                            <p className="text-red-600 font-semibold mb-2">⚠️ Error</p>
                            <p className="text-gray-700">{error}</p>
                        </div>
                    )}

                    {/* Vendor List */}
                    {!loading && !error && vendors.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                            {vendors.map((vendor) => (
                                <Link
                                    key={vendor.id}
                                    to={`/vendors/${vendor.id}`}
                                    className="group relative"
                                >
                                    {/* Card */}
                                    <div className="relative h-full bg-white border border-gray-200 rounded-lg md:rounded-xl overflow-hidden transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-blue-300 flex flex-col">
                                        {/* Logo Area - Compact for Mobile */}
                                        <div className="aspect-[16/9] sm:aspect-[16/8] bg-gray-100 p-1.5 sm:p-2 md:p-3 lg:p-4 flex items-center justify-center">
                                            {vendor.logo ? (
                                                <img
                                                    src={getLogoUrl(vendor.logo)}
                                                    alt={vendor.name}
                                                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.target.src = '/images/logo-placeholder.png';
                                                    }}
                                                />
                                            ) : (
                                                <div className="text-white/10">
                                                    <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content - Compact Mobile */}
                                        <div className="p-1.5 sm:p-3 md:p-4 flex flex-col flex-grow">
                                            {/* Vendor Name */}
                                            <h3 className="font-bold text-xs sm:text-base md:text-lg mb-0.5 sm:mb-1.5 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[1.75rem] sm:min-h-[2.5rem]">
                                                {vendor.name}
                                            </h3>

                                            {/* Location */}
                                            <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600 mb-1 sm:mb-1.5">
                                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-[10px] sm:text-sm font-medium text-gray-500">{vendor.city}, {vendor.state}</span>
                                            </div>

                                            {/* Description Snippet */}
                                            {vendor.description && (
                                                <p className="text-[10px] sm:text-xs text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                                                    {vendor.description}
                                                </p>
                                            )}

                                            {/* Badges */}
                                            <VendorBadges
                                                isTopRated={vendor.is_top_rated}
                                                isFeatured={vendor.is_featured}
                                            />

                                            {/* Rating - Compact */}
                                            <div className="mb-1.5 sm:mb-2 mt-auto">
                                                <Rating
                                                    stars={vendor.rating_stars || 5}
                                                    percentage={vendor.rating_percentage || 100}
                                                    size="sm"
                                                    showPercentage={false}
                                                    showValue={true}
                                                    value={vendor.rating || '5.0'}
                                                    theme="light"
                                                />
                                            </div>

                                            {/* CTA Button */}
                                            <button className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold py-1 sm:py-2 md:py-2.5 px-1.5 sm:px-3 rounded-md sm:rounded-lg text-[10px] sm:text-sm transition-all duration-200 shadow-md hover:shadow-lg">
                                                View Details →
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-6">
                                <svg className="w-10 h-10 text-white/30" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-400 mb-2">No vendors found</h3>
                            <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
                            <button
                                onClick={handleClearFilters}
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-glow"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-8 sm:mt-10 md:mt-12 flex justify-center">
                            <div className="inline-flex items-center gap-1 sm:gap-2 bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-1.5 sm:p-2">
                                {/* Previous Button */}
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${currentPage === 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    ← Previous
                                </button>

                                {/* Page Numbers */}
                                <div className="flex items-center gap-1">
                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNumber = index + 1;
                                        // Show first page, last page, current page, and pages around current
                                        if (
                                            pageNumber === 1 ||
                                            pageNumber === totalPages ||
                                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => paginate(pageNumber)}
                                                    className={`min-w-[32px] sm:min-w-[40px] px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${currentPage === pageNumber
                                                        ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-md'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                        }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        } else if (
                                            pageNumber === currentPage - 2 ||
                                            pageNumber === currentPage + 2
                                        ) {
                                            return (
                                                <span key={pageNumber} className="text-gray-400 px-1 sm:px-2 text-xs sm:text-sm">
                                                    ...
                                                </span>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>

                                {/* Next Button */}
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${currentPage === totalPages
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Ad Banner */}
            <MobileAdBanner page="vendors" />

            <Footer />
        </div>
    );
};

export default AllVendors;
