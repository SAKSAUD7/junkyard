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
        <div style={{ background: 'var(--bg-base, var(--bg-base))', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <SEO
                title={seoTitle}
                description={seoDescription}
                canonicalUrl={zipcode ? `/search?zipcode=${zipcode}` : '/search'}
                noindex={filteredJunkyards.length === 0}
            />
            <Navbar />

            {/* Hero Section */}
            <div className="hero-depth relative overflow-hidden pt-24 pb-16" style={{ background: 'var(--bg-base)' }}>
                <div className="hero-bg-primary" style={{ backgroundImage: "url('/heroes/stacked-cars.png')", opacity: 0.55 }} />
                <div className="hero-bg-depth" style={{ backgroundImage: "url('/heroes/aerial-night.png')" }} />
                <div className="hero-overlay-base" />
                <div className="hero-vignette" />
                <div className="hero-glow-teal" />
                <div className="hero-glow-orange" />
                <div className="hero-grid" />
                <div className="hero-scanline" />
                <div className="hero-fade-bottom" />

                <div className="hero-content relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-2" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.25)' }}>
                            <svg className="w-8 h-8" style={{ color: 'var(--neon-blue)' }} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>

                        <h1 className="font-black" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontFamily: "'Outfit', sans-serif", color: '#ffffff' }}>
                            Search <span style={{ background: 'linear-gradient(135deg, var(--neon-blue), #66e0ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Results</span>
                        </h1>

                        {zipcode && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.2)', backdropFilter: 'blur(10px)' }}>
                                <svg className="w-4 h-4" style={{ color: 'var(--neon-blue)' }} fill="currentColor" viewBox="0 0 20 20">
                                    {/^\d+$/.test(zipcode) ? (
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    ) : (
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    )}
                                </svg>
                                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                    {/^\d+$/.test(zipcode) ? `ZIP: ${zipcode}` : `Search: "${zipcode}"`}
                                </span>
                            </div>
                        )}

                        <p className="text-lg font-light">
                            Found <span className="font-bold" style={{ color: 'var(--neon-blue)' }}>{filteredJunkyards.length}</span> <span style={{ color: 'var(--text-secondary)' }}>junkyards{zipcode && ` matching "${zipcode}"`}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="relative py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="flex justify-center items-center py-24">
                            <div className="animate-spin rounded-full h-14 w-14 border-2" style={{ borderColor: 'rgba(37,99,235,0.2)', borderTopColor: 'var(--neon-blue)' }}></div>
                        </div>
                    ) : filteredJunkyards.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {filteredJunkyards.map((vendor) => (
                                <VendorCard key={vendor.id} vendor={vendor} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6" style={{ background: 'rgba(234,88,12,0.05)', border: '1px solid rgba(234,88,12,0.2)' }}>
                                <svg className="w-10 h-10" style={{ color: 'var(--neon-orange)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>No Junkyards Found</h3>
                            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                                {zipcode
                                    ? `No junkyards found near ${zipcode}. Try a different ZIP code or browse all vendors.`
                                    : 'Try adjusting your search criteria or browse all junkyards.'
                                }
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <Link
                                    to="/vendors"
                                    className="font-bold px-8 py-3 rounded-xl transition-all transform hover:-translate-y-1"
                                    style={{ background: 'var(--neon-blue)', color: 'var(--bg-base)' }}
                                >
                                    View All Vendors
                                </Link>
                                <Link
                                    to="/"
                                    className="font-semibold px-8 py-3 rounded-xl transition-all"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
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
