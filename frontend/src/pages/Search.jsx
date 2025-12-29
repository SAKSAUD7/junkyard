import { useSearchParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useData } from '../hooks/useData';
import SEO from '../components/SEO';

export default function Search() {
    const [searchParams] = useSearchParams();
    const zipcode = searchParams.get('zipcode');
    const { data: junkyards } = useData('data_junkyards.json');
    const [filteredJunkyards, setFilteredJunkyards] = useState([]);

    useEffect(() => {
        if (!junkyards) return;

        let filtered = junkyards;

        // ZIP code or vendor name search
        if (zipcode) {
            const searchTerm = zipcode.toLowerCase().trim();

            // Check if it's a numeric ZIP code
            const isNumeric = /^\d+$/.test(searchTerm);

            if (isNumeric) {
                // ZIP code search
                const zipPrefix = searchTerm.substring(0, 3);
                filtered = junkyards.filter(j => {
                    // Exact match
                    if (j.zipcode && j.zipcode === searchTerm) {
                        return true;
                    }
                    // Prefix match (same area)
                    if (j.zipcode && j.zipcode.startsWith(zipPrefix)) {
                        return true;
                    }
                    return false;
                });
            } else {
                // Vendor name, city, or state search
                filtered = junkyards.filter(j => {
                    return (
                        j.name.toLowerCase().includes(searchTerm) ||
                        j.city.toLowerCase().includes(searchTerm) ||
                        j.state.toLowerCase().includes(searchTerm)
                    );
                });
            }
        }

        setFilteredJunkyards(filtered);
    }, [junkyards, zipcode]);

    // Dynamic SEO based on search
    const isNumericSearch = zipcode && /^\d+$/.test(zipcode);
    const searchType = isNumericSearch ? 'ZIP code' : 'search term';
    const seoTitle = zipcode
        ? `${filteredJunkyards.length} Junkyards ${isNumericSearch ? `Near ${zipcode}` : `Matching "${zipcode}"`} | Search Results`
        : 'Search Junkyards | Find Auto Salvage Yards Near You';
    const seoDescription = zipcode
        ? `Found ${filteredJunkyards.length} auto salvage yards ${isNumericSearch ? `near ZIP code ${zipcode}` : `matching "${zipcode}"`}. Browse junkyards, compare prices, and find used auto parts.`
        : 'Search for auto salvage yards and junkyards near you. Find used auto parts by location, ZIP code, or vendor name.';

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
            <SEO
                title={seoTitle}
                description={seoDescription}
                canonicalUrl={zipcode ? `/search?zipcode=${zipcode}` : '/search'}
                noindex={filteredJunkyards.length === 0}
            />
            <Navbar />

            {/* Hero Section - Compact Mobile-First */}
            <div className="relative compact-section overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

                <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="text-center space-y-2 sm:space-y-3 md:space-y-4 animate-fade-in">
                        {/* Search Icon - Compact */}
                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-full mb-2 sm:mb-3 md:mb-4">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>

                        <h1 className="compact-hero font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-300 to-purple-300 leading-tight px-2">
                            Search Results
                        </h1>

                        {zipcode && (
                            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 rounded-full">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                    {/^\d+$/.test(zipcode) ? (
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    ) : (
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    )}
                                </svg>
                                <span className="text-white font-semibold compact-text">
                                    {/^\d+$/.test(zipcode) ? `ZIP: ${zipcode}` : `Search: "${zipcode}"`}
                                </span>
                            </div>
                        )}

                        <p className="compact-heading text-white/80 font-light px-2">
                            Found <span className="font-bold text-cyan-400">{filteredJunkyards.length}</span> junkyards
                            {zipcode && ` matching "${zipcode}"`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Results Section - Compact Mobile */}
            <div className="relative compact-section">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    {filteredJunkyards.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 compact-gap">
                            {filteredJunkyards.map((vendor) => (
                                <Link
                                    key={vendor.id}
                                    to={`/vendors/${vendor.id}`}
                                    className="group relative"
                                >
                                    {/* Card Glow Effect */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>

                                    {/* Card - Compact Mobile */}
                                    <div className="relative bg-dark-800/50 backdrop-blur-sm border border-white/10 rounded-lg md:rounded-2xl overflow-hidden transform transition-all duration-500 hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-lg md:hover:shadow-2xl hover:border-cyan-400/50">
                                        {/* Logo Area - Compact */}
                                        <div className="aspect-[16/9] bg-gradient-to-br from-dark-700 to-dark-800 p-2 sm:p-3 md:p-4 lg:p-6 flex items-center justify-center">
                                            {vendor.logo ? (
                                                <img
                                                    src={vendor.logo}
                                                    alt={vendor.name}
                                                    className="max-h-full max-w-full object-contain group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-500"
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
                                        <div className="compact-card">
                                            {/* Vendor Name - Compact */}
                                            <h3 className="font-bold compact-heading mb-1.5 sm:mb-2 md:mb-3 text-white group-hover:text-cyan-400 transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem]">
                                                {vendor.name}
                                            </h3>

                                            {/* Location - Compact */}
                                            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-white/60 mb-1.5 sm:mb-2 md:mb-3">
                                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="compact-text font-medium">{vendor.city}, {vendor.state}</span>
                                            </div>

                                            {/* ZIP Code Badge - Compact */}
                                            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-white/60 mb-2 sm:mb-3 md:mb-4">
                                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                                </svg>
                                                <span className="text-[10px] sm:text-xs font-mono bg-blue-500/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">{vendor.zipcode}</span>
                                            </div>

                                            {/* Rating - Compact */}
                                            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 mb-2 sm:mb-3 md:mb-4">
                                                <div className="flex items-center gap-0.5 sm:gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg
                                                            key={i}
                                                            className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-yellow-400"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <span className="compact-text font-semibold text-white">{vendor.rating}</span>
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
                            <h3 className="text-2xl font-bold text-white mb-2">No Junkyards Found</h3>
                            <p className="text-white/60 mb-6">
                                {zipcode
                                    ? `No junkyards found near ${zipcode}. Try a different ZIP code or browse all vendors.`
                                    : 'Try adjusting your search criteria or browse all junkyards.'
                                }
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Link
                                    to="/vendors"
                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-glow"
                                >
                                    View All Vendors
                                </Link>
                                <Link
                                    to="/"
                                    className="bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300"
                                >
                                    New Search
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
