import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useData } from '../hooks/useData';

export default function BrowseState() {
    const { state } = useParams();
    const { data: junkyards, loading } = useData('data_junkyards.json');
    const { data: states } = useData('data_states.json');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const vendorsPerPage = 24;

    // Scroll to top when page loads or state changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [state]);

    // Filter junkyards by state
    const stateJunkyards = junkyards?.filter(
        j => j.state.toLowerCase() === state.toLowerCase()
    ) || [];

    // Get state full name
    const stateInfo = states?.find(s => s.stateCode?.toLowerCase() === state.toLowerCase());
    const stateName = stateInfo?.stateName || state.toUpperCase();

    // Filter by search term
    const filteredJunkyards = stateJunkyards.filter(junkyard =>
        junkyard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        junkyard.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const indexOfLastVendor = currentPage * vendorsPerPage;
    const indexOfFirstVendor = indexOfLastVendor - vendorsPerPage;
    const currentVendors = filteredJunkyards.slice(indexOfFirstVendor, indexOfLastVendor);
    const totalPages = Math.ceil(filteredJunkyards.length / vendorsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Get unique cities in this state
    const cities = [...new Set(stateJunkyards.map(j => j.city))].sort();

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
            <Navbar />

            {/* Hero Section */}
            <div className="relative min-h-[50vh] flex items-center overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80)',
                    }}
                ></div>

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-dark-950/95 via-dark-900/90 to-dark-800/85"></div>

                {/* Animated Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-purple-600/15 to-pink-600/15 animate-gradient"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
                    <div className="space-y-6 animate-fade-in">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                            <Link to="/browse" className="hover:text-cyan-400 transition-colors">
                                Browse States
                            </Link>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-white">{stateName}</span>
                        </div>

                        {/* Premium Badge */}
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-white/90 text-sm font-medium">
                                {stateJunkyards.length} Verified Junkyards
                            </span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-300 to-purple-300 leading-tight">
                            Junkyards in
                            <span className="block text-cyan-400">{stateName}</span>
                        </h1>

                        <p className="text-lg md:text-xl text-white/80 font-light max-w-2xl">
                            Explore <span className="font-bold text-cyan-400">{stateJunkyards.length} auto salvage yards</span> across{' '}
                            <span className="font-bold text-purple-400">{cities.length} cities</span> in {stateName}.
                        </p>
                    </div>
                </div>
            </div>

            {/* Search & Filter Section */}
            <div className="sticky top-0 z-40 backdrop-blur-xl bg-dark-900/80 border-b border-white/10 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Search Input */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search by junkyard name or city..."
                            className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-cyan-400 focus:bg-white/20 outline-none transition-all backdrop-blur-sm"
                        />
                    </div>

                    {/* Results Info */}
                    <div className="mt-4 flex items-center justify-between text-white/70">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold">
                                Showing {indexOfFirstVendor + 1}-{Math.min(indexOfLastVendor, filteredJunkyards.length)} of {filteredJunkyards.length} junkyards
                            </span>
                        </div>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm flex items-center gap-1 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Clear Search
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Vendors Grid */}
            <div className="relative py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-white/60 mt-4">Loading junkyards...</p>
                        </div>
                    ) : currentVendors.length > 0 ? (
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
                            <h3 className="text-2xl font-bold text-white mb-2">No junkyards found</h3>
                            <p className="text-white/60 mb-6">Try adjusting your search</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-glow"
                            >
                                Clear Search
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
}
