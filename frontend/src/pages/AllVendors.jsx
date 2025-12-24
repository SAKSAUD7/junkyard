import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../hooks/useData';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DynamicAd from '../components/DynamicAd';
import SEO from '../components/SEO';
import { getCollectionPageSchema } from '../utils/structuredData';

const AllVendors = () => {
    const { data: junkyards } = useData('data_junkyards.json');
    const [filteredVendors, setFilteredVendors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const vendorsPerPage = 24;

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

            {/* Ultra-Modern Hero Section */}
            <div className="relative min-h-[70vh] flex items-center overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80)',
                    }}
                ></div>

                {/* Dark Overlay with Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-dark-950/95 via-dark-900/90 to-dark-800/85"></div>

                {/* Left Sidebar Ads - Fixed in Hero */}
                <div className="absolute top-4 left-4 z-30 flex flex-col gap-4 hidden lg:block">
                    <DynamicAd slot="left_sidebar_ad" page="vendors" />
                </div>

                {/* Right Sidebar Ads - Fixed in Hero */}
                <div className="absolute top-4 right-4 z-30 flex flex-col gap-4 hidden lg:block">
                    <DynamicAd slot="right_sidebar_ad" page="vendors" />
                </div>

                {/* Animated Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-purple-600/15 to-pink-600/15 animate-gradient"></div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
                    <div className="text-center space-y-8 animate-fade-in">
                        {/* Premium Badge */}
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-white/90 text-sm font-medium">{junkyards?.length || 0} Verified Auto Salvage Yards</span>
                        </div>

                        {/* Main Heading with Gradient Text */}
                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-300 to-purple-300 leading-tight">
                            Browse All
                            <span className="block text-cyan-400">Junkyards</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-white/80 font-light max-w-3xl mx-auto">
                            Find <span className="font-bold text-cyan-400">quality auto parts</span> from trusted salvage yards nationwide.
                            Search by location, filter by state, and connect instantly.
                        </p>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                                <div className="text-3xl font-bold text-cyan-400">{junkyards?.length || 0}</div>
                                <div className="text-xs text-white/60">Total Vendors</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                                <div className="text-3xl font-bold text-blue-400">{states.length}</div>
                                <div className="text-xs text-white/60">States</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                                <div className="text-3xl font-bold text-purple-400">100%</div>
                                <div className="text-xs text-white/60">Verified</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                                <div className="text-3xl font-bold text-pink-400">24/7</div>
                                <div className="text-xs text-white/60">Support</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Search & Filter Section with Glassmorphism */}
            <div className="sticky top-0 z-40 backdrop-blur-xl bg-dark-900/80 border-b border-white/10 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-cyan-400 focus:bg-white/20 outline-none transition-all backdrop-blur-sm"
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
                                className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white focus:border-purple-400 focus:bg-white/20 outline-none transition-all backdrop-blur-sm appearance-none cursor-pointer"
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

            {/* Vendors Grid */}
            <div className="relative py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {currentVendors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {currentVendors.map((vendor) => (
                                <Link
                                    key={vendor.id}
                                    to={`/vendors/${vendor.id}`}
                                    className="group relative"
                                >
                                    {/* Card Glow Effect */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>

                                    {/* Card */}
                                    <div className="relative bg-dark-800/50 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-cyan-400/50">
                                        {/* Logo Area */}
                                        <div className="aspect-[16/9] bg-gradient-to-br from-dark-700 to-dark-800 p-6 flex items-center justify-center">
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
                                                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            {/* Vendor Name */}
                                            <h3 className="font-bold text-lg mb-3 text-white group-hover:text-cyan-400 transition-colors line-clamp-2 min-h-[3.5rem]">
                                                {vendor.name}
                                            </h3>

                                            {/* Location */}
                                            <div className="flex items-center gap-2 text-white/60 mb-3">
                                                <svg className="w-4 h-4 flex-shrink-0 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-sm font-medium">{vendor.city}, {vendor.state}</span>
                                            </div>

                                            {/* Rating */}
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg
                                                            key={i}
                                                            className="w-4 h-4 text-yellow-400"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <span className="text-sm font-semibold text-white">{vendor.rating}</span>
                                            </div>

                                            {/* CTA Button */}
                                            <button className="w-full bg-white/5 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-cyan-500 border border-white/10 group-hover:border-cyan-500 text-white/70 group-hover:text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg group-hover:shadow-glow">
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

            <Footer />
        </div>
    );
};

export default AllVendors;
