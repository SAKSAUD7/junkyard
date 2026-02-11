import { useSearchParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';
import VendorCard from '../components/VendorCard';
import SEO from '../components/SEO';

export default function Search() {
    const [searchParams] = useSearchParams();
    const zipcode = searchParams.get('zipcode');
    const [filteredJunkyards, setFilteredJunkyards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!zipcode) return;

            setLoading(true);
            try {
                let params = {};
                const searchTerm = zipcode.trim();
                const isNumeric = /^\d+$/.test(searchTerm);

                if (isNumeric) {
                    params.zipcode = searchTerm;
                } else {
                    params.search = searchTerm;
                }

                const results = await api.getVendors(params);
                setFilteredJunkyards(results);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [zipcode]);

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
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                        </div>
                    ) : filteredJunkyards.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 compact-gap">
                            {filteredJunkyards.map((vendor) => (
                                <VendorCard key={vendor.id} vendor={vendor} />
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
