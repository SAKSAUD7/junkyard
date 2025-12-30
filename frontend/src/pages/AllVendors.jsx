import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../hooks/useData';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DynamicAd from '../components/DynamicAd';
import MobileAdBanner from '../components/MobileAdBanner';
import Rating from '../components/Rating';
import VendorBadges from '../components/VendorBadges';
import SEO from '../components/SEO';
import { getCollectionPageSchema } from '../utils/structuredData';
import { api } from '../services/api';

const AllVendors = () => {
    const [junkyards, setJunkyards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredVendors, setFilteredVendors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const vendorsPerPage = 24;

    // Fetch vendors from API
    useEffect(() => {
        const fetchVendors = async () => {
            try {
                setLoading(true);
                const data = await api.getVendors();
                setJunkyards(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching vendors:', err);
                setError('Failed to load vendors. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, []);

    // Get unique states
    const states = [...new Set(junkyards?.map(j => j.state) || [])].sort();

    useEffect(() => {
        if (!junkyards) return;

        let filtered = junkyards;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(vendor =>
                vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vendor.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vendor.state.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by state
        if (selectedState) {
            filtered = filtered.filter(vendor => vendor.state === selectedState);
        }

        setFilteredVendors(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [junkyards, searchTerm, selectedState]);

    // Pagination
    const indexOfLastVendor = currentPage * vendorsPerPage;
    const indexOfFirstVendor = indexOfLastVendor - vendorsPerPage;
    const currentVendors = filteredVendors.slice(indexOfFirstVendor, indexOfLastVendor);
    const totalPages = Math.ceil(filteredVendors.length / vendorsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // SEO structured data
    const collectionSchema = getCollectionPageSchema({
        name: 'All Auto Salvage Yards',
        description: `Browse ${filteredVendors.length} verified auto salvage yards across ${states.length} states`,
        numberOfItems: filteredVendors.length
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
            <SEO
                title={`All Junkyards - Browse ${junkyards?.length || 0} Auto Salvage Yards Nationwide`}
                description={`Browse our complete directory of ${junkyards?.length || 0} verified auto salvage yards across ${states.length} states. Find used auto parts, compare prices, and connect with local junkyards.`}
                canonicalUrl="/vendors"
                structuredData={[collectionSchema]}
            />
            <Navbar />

            {/* Ultra-Modern Hero Section - Compact Mobile */}
            <div className="relative min-h-[40vh] sm:min-h-[50vh] md:min-h-[70vh] flex items-center overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80)',
                    }}
                ></div>

                {/* Dark Overlay with Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-dark-950/95 via-dark-900/90 to-dark-800/85"></div>

                {/* Desktop Sidebar Ads - Fixed in Hero */}
                <div className="absolute top-4 left-4 z-30 flex flex-col gap-4 hidden xl:block">
                    <DynamicAd slot="left_sidebar_ad" page="vendors" />
                </div>

                <div className="absolute top-4 right-4 z-30 flex flex-col gap-4 hidden xl:block">
                    <DynamicAd slot="right_sidebar_ad" page="vendors" />
                </div>


                {/* Animated Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-purple-600/15 to-pink-600/15 animate-gradient"></div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

                <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full compact-section">
                    <div className="text-center space-y-2 sm:space-y-4 md:space-y-6 animate-fade-in">
                        {/* Premium Badge - Compact */}
                        <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-white/90 compact-text font-medium">{junkyards?.length || 0} Verified Auto Salvage Yards</span>
                        </div>

                        {/* Main Heading with Gradient Text - Compact */}
                        <h1 className="compact-hero font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-300 to-purple-300 leading-tight px-2">
                            Browse All
                            <span className="block text-cyan-400">Junkyards</span>
                        </h1>

                        <p className="compact-heading text-white/80 font-light max-w-3xl mx-auto px-2">
                            Find <span className="font-bold text-cyan-400">quality auto parts</span> from trusted salvage yards nationwide.
                            Search by location, filter by state, and connect instantly.
                        </p>

                        {/* Stats Cards - Compact */}
                        <div className="grid grid-cols-2 md:grid-cols-4 compact-gap max-w-4xl mx-auto">
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg md:rounded-2xl compact-card hover:bg-white/10 transition-all duration-300">
                                <div className="compact-title font-bold text-cyan-400">{junkyards?.length || 0}</div>
                                <div className="text-[10px] sm:text-xs text-white/60">Total Vendors</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg md:rounded-2xl compact-card hover:bg-white/10 transition-all duration-300">
                                <div className="compact-title font-bold text-blue-400">{states.length}</div>
                                <div className="text-[10px] sm:text-xs text-white/60">States</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg md:rounded-2xl compact-card hover:bg-white/10 transition-all duration-300">
                                <div className="compact-title font-bold text-purple-400">100%</div>
                                <div className="text-[10px] sm:text-xs text-white/60">Verified</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg md:rounded-2xl compact-card hover:bg-white/10 transition-all duration-300">
                                <div className="compact-title font-bold text-pink-400">24/7</div>
                                <div className="text-[10px] sm:text-xs text-white/60">Support</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Search & Filter Section with Glassmorphism - Compact */}
            <div className="sticky top-0 z-40 backdrop-blur-xl bg-dark-900/80 border-b border-white/10 shadow-2xl">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 compact-gap">
                        {/* Search Input */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name, city, or state..."
                                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 md:py-4 bg-white/10 border-2 border-white/20 rounded-lg md:rounded-2xl text-white compact-text placeholder-white/50 focus:border-cyan-400 focus:bg-white/20 outline-none transition-all backdrop-blur-sm"
                                />
                            </div>
                        </div>

                        {/* State Filter */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <select
                                value={selectedState}
                                onChange={(e) => setSelectedState(e.target.value)}
                                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 md:py-4 bg-white/10 border-2 border-white/20 rounded-lg md:rounded-2xl text-white compact-text focus:border-purple-400 focus:bg-white/20 outline-none transition-all backdrop-blur-sm appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-dark-800">All States</option>
                                {states.map(state => (
                                    <option key={state} value={state} className="bg-dark-800">{state}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Results Info */}
                    <div className="mt-4 flex items-center justify-between text-white/70">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold">
                                Showing {indexOfFirstVendor + 1}-{Math.min(indexOfLastVendor, filteredVendors.length)} of {filteredVendors.length} junkyards
                            </span>
                        </div>
                        {(searchTerm || selectedState) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedState('');
                                }}
                                className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm flex items-center gap-1 transition-colors"
                            >
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
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
                                <p className="text-white/60">Loading vendors...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
                            <p className="text-red-400 font-semibold mb-2">⚠️ Error</p>
                            <p className="text-white/70">{error}</p>
                        </div>
                    )}

                    {/* Vendor List */}
                    {!loading && !error && currentVendors.length > 0 ? (
                        <div className="mobile-grid-2 compact-gap">
                            {currentVendors.map((vendor) => (
                                <Link
                                    key={vendor.id}
                                    to={`/vendors/${vendor.id}`}
                                    className="group relative"
                                >
                                    {/* Card Glow Effect */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 rounded-3xl blur opacity-10 group-hover:opacity-30 transition duration-500"></div>

                                    {/* Card - Compact Mobile */}
                                    <div className="relative h-full bg-dark-800/50 backdrop-blur-sm border border-white/10 rounded-lg md:rounded-2xl overflow-hidden transform transition-all duration-500 hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-lg md:hover:shadow-2xl hover:border-cyan-400/50 flex flex-col">
                                        {/* Logo Area - Compact */}
                                        <div className="aspect-[16/9] bg-gradient-to-br from-dark-700 to-dark-800 p-2 sm:p-3 md:p-4 lg:p-6 flex items-center justify-center">
                                            {vendor.logo ? (
                                                <img
                                                    src={vendor.logo}
                                                    alt={vendor.name}
                                                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.target.src = '/images/logo-placeholder.png';
                                                    }}
                                                />
                                            ) : (
                                                <div className="text-white/10">
                                                    <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content - Compact */}
                                        <div className="compact-card flex flex-col flex-grow">
                                            {/* Vendor Name - Compact */}
                                            <h3 className="font-bold compact-heading mb-1.5 sm:mb-2 md:mb-3 text-white group-hover:text-cyan-400 transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem]">
                                                {vendor.name}
                                            </h3>

                                            {/* Location - Compact */}
                                            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-white/60 mb-1.5 sm:mb-2 md:mb-3 mt-auto">
                                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="compact-text font-medium">{vendor.city}, {vendor.state}</span>
                                            </div>

                                            {/* Badges */}
                                            <VendorBadges
                                                isTopRated={vendor.is_top_rated}
                                                isFeatured={vendor.is_featured}
                                            />

                                            {/* Rating */}
                                            <div className="mb-2 sm:mb-3 md:mb-4">
                                                <Rating
                                                    stars={vendor.rating_stars || 5}
                                                    percentage={vendor.rating_percentage || 100}
                                                    size="sm"
                                                    showPercentage={true}
                                                />
                                            </div>

                                            {/* CTA Button - Compact */}
                                            <button className="w-full bg-white/5 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-cyan-500 border border-white/10 group-hover:border-cyan-500 text-white/70 group-hover:text-white font-semibold py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 rounded-lg md:rounded-xl transition-all duration-300 shadow-md group-hover:shadow-lg compact-text min-h-10">
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
                            <h3 className="text-2xl font-bold text-white mb-2">No vendors found</h3>
                            <p className="text-white/60 mb-6">Try adjusting your search or filters</p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedState('');
                                }}
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-glow"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center">
                            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
                                {/* Previous Button */}
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${currentPage === 1
                                        ? 'text-white/30 cursor-not-allowed'
                                        : 'text-white hover:bg-white/10'
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
                                                    className={`min-w-[40px] px-3 py-2 rounded-xl font-semibold transition-all duration-300 ${currentPage === pageNumber
                                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-glow'
                                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
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
                                                <span key={pageNumber} className="text-white/30 px-2">
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
                                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${currentPage === totalPages
                                        ? 'text-white/30 cursor-not-allowed'
                                        : 'text-white hover:bg-white/10'
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
