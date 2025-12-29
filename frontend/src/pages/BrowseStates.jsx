import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';
import DynamicAd from '../components/DynamicAd';
import MobileAdBanner from '../components/MobileAdBanner';
import SEO from '../components/SEO';
import { getCollectionPageSchema, getBreadcrumbSchema } from '../utils/structuredData';

export default function BrowseStates() {
    const [statesData, setStatesData] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch data from backend API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log('Fetching states and vendors from backend API...');

                // Fetch both states and vendors from backend
                const [statesResponse, vendorsResponse] = await Promise.all([
                    api.getStates(),
                    api.getVendors()
                ]);

                // Handle paginated response for states
                const states = statesResponse.results || statesResponse;
                setStatesData(states);

                // Vendors API returns all vendors without pagination
                setVendors(vendorsResponse);

                console.log(`Loaded ${states.length} states and ${vendorsResponse.length} vendors from API`);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data from API:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Calculate vendor counts per state only when both datasets are loaded
    const statesWithCounts = (statesData.length > 0 && vendors.length > 0) ? statesData.map(state => {
        const count = vendors.filter(v => v.state === state.stateCode).length;
        return {
            ...state,
            junkyardCount: count
        };
    }).filter(state => state.junkyardCount > 0) // Only show states with vendors
        .sort((a, b) => b.junkyardCount - a.junkyardCount) : []; // Sort by count descending

    // Filter states by search term
    const filteredStates = statesWithCounts.filter(state =>
        state.stateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        state.stateCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // SEO structured data
    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            getCollectionPageSchema({
                name: 'Browse Junkyards by State',
                description: 'Find auto salvage yards and junkyards across all US states',
                url: typeof window !== 'undefined' ? window.location.href : '',
                numberOfItems: statesWithCounts.length
            }),
            getBreadcrumbSchema([
                { name: 'Home', url: '/' },
                { name: 'Browse States', url: '/browse' }
            ])
        ]
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
            {/* SEO Meta Tags */}
            <SEO
                title="Browse Junkyards by State - Find Auto Salvage Yards Near You"
                description={`Find junkyards and auto salvage yards across ${statesWithCounts.length} states. Search ${vendors.length}+ verified vendors nationwide. Free quotes, quality used auto parts.`}
                schema={schema}
            />

            <Navbar />

            {/* Ultra-Modern Hero Section - Compact Mobile */}
            <div className="relative min-h-[35vh] sm:min-h-[45vh] md:min-h-[60vh] flex items-center overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&q=80)',
                    }}
                ></div>

                {/* Dark Overlay with Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-dark-950/95 via-dark-900/90 to-dark-800/85"></div>

                {/* Animated Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-purple-600/15 to-pink-600/15 animate-gradient"></div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

                {/* Desktop Sidebar Ads - Fixed in Hero */}
                <div className="absolute top-4 left-4 z-30 flex flex-col gap-4 hidden xl:block">
                    <DynamicAd slot="left_sidebar_ad" page="browse" />
                </div>

                <div className="absolute top-4 right-4 z-30 flex flex-col gap-4 hidden xl:block">
                    <DynamicAd slot="right_sidebar_ad" page="browse" />
                </div>

                <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full compact-section">
                    <div className="text-center space-y-2 sm:space-y-4 md:space-y-6 animate-fade-in">
                        {/* Premium Badge - Compact */}
                        <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-white/90 compact-text font-medium">
                                {statesWithCounts?.length || 0} States • {vendors?.length || 0} Verified Junkyards
                            </span>
                        </div>

                        {/* Main Heading with Gradient Text - Compact */}
                        <h1 className="compact-hero font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-300 to-purple-300 leading-tight px-2">
                            Browse by
                            <span className="block text-cyan-400">Location</span>
                        </h1>

                        <p className="compact-heading text-white/80 font-light max-w-3xl mx-auto px-2">
                            Find <span className="font-bold text-cyan-400">quality auto parts</span> from trusted salvage yards.
                            Select your state to discover local junkyards.
                        </p>

                        {/* Search Bar - Compact */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search for a state..."
                                    className="w-full pl-10 sm:pl-12 md:pl-14 pr-3 sm:pr-4 py-2.5 sm:py-3 md:py-4 lg:py-5 bg-white/10 border-2 border-white/20 rounded-lg md:rounded-2xl text-white compact-text placeholder-white/50 focus:border-cyan-400 focus:bg-white/20 outline-none transition-all backdrop-blur-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>


            {/* States Grid Section - Compact Mobile */}
            <div className="relative compact-section">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    {/* Results Info */}
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/70">
                            <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold">
                                {filteredStates?.length || 0} states available
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

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-white/60 mt-4">Loading states...</p>
                        </div>
                    ) : filteredStates && filteredStates.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 compact-gap">
                            {filteredStates.map((state) => (
                                <Link
                                    key={state.stateCode}
                                    to={`/browse/${state.stateCode.toLowerCase()}`}
                                    className="group relative"
                                >
                                    {/* Card Glow Effect */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>

                                    {/* Card - Compact */}
                                    <div className="relative bg-dark-800/50 backdrop-blur-sm border border-white/10 rounded-lg md:rounded-2xl compact-card transform transition-all duration-500 hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-lg md:hover:shadow-2xl hover:border-cyan-400/50">
                                        {/* State Icon - Compact */}
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg md:rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4 group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-300">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                        </div>

                                        {/* State Name - Compact */}
                                        <h3 className="compact-heading font-bold text-white mb-1 sm:mb-1.5 md:mb-2 group-hover:text-cyan-400 transition-colors">
                                            {state.stateName}
                                        </h3>

                                        {/* State Abbreviation - Compact */}
                                        <p className="text-white/50 text-[10px] sm:text-xs font-mono mb-1.5 sm:mb-2 md:mb-3">
                                            {state.stateCode}
                                        </p>

                                        {/* Junkyard Count */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                                                    style={{ width: `${Math.min((state.junkyardCount / Math.max(...(statesWithCounts?.map(s => s.junkyardCount) || [1]))) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-cyan-400 font-bold compact-heading">
                                                {state.junkyardCount}
                                            </span>
                                        </div>
                                        <p className="text-white/60 text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                                            {state.junkyardCount === 1 ? 'junkyard' : 'junkyards'}
                                        </p>

                                        {/* Arrow Icon */}
                                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
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
                            <h3 className="text-2xl font-bold text-white mb-2">No states found</h3>
                            <p className="text-white/60 mb-6">Try adjusting your search</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-glow"
                            >
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Ad Banner */}
            <MobileAdBanner page="browse" />

            <Footer />
        </div>
    );
}
