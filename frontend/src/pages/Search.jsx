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
                if (isNumeric) { params.zipcode = searchTerm; }
                else { params.search = searchTerm; }
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

    const isNumericSearch = zipcode && /^\d+$/.test(zipcode);
    const seoTitle = zipcode
        ? `${filteredJunkyards.length} Junkyards ${isNumericSearch ? `Near ${zipcode}` : `Matching "${zipcode}"`} | Search Results`
        : 'Search Junkyards | Find Auto Salvage Yards Near You';
    const seoDescription = zipcode
        ? `Found ${filteredJunkyards.length} auto salvage yards ${isNumericSearch ? `near ZIP code ${zipcode}` : `matching "${zipcode}"`}. Browse junkyards, compare prices, and find used auto parts.`
        : 'Search for auto salvage yards and junkyards near you. Find used auto parts by location, ZIP code, or vendor name.';

    return (
        <div className="bg-[#f8fafc] min-h-screen">
            <SEO
                title={seoTitle}
                description={seoDescription}
                canonicalUrl={zipcode ? `/search?zipcode=${zipcode}` : '/search'}
                noindex={filteredJunkyards.length === 0}
            />
            <Navbar />

            {/* Light Hero */}
            <section className="relative pt-28 pb-14 bg-white border-b border-slate-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/80 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
                <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 bg-blue-50 border border-blue-100">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg>
                        <span className="text-blue-600 text-[12px] font-bold uppercase tracking-widest">Search Results</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                        Junkyards <span className="text-blue-600">Found</span>
                    </h1>
                    {zipcode && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 mb-4">
                            <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                            <span className="font-bold text-slate-700 text-sm">{isNumericSearch ? `ZIP: ${zipcode}` : `Search: "${zipcode}"`}</span>
                        </div>
                    )}
                    <p className="text-lg text-slate-600 font-medium">
                        Found <span className="font-black text-blue-600">{filteredJunkyards.length}</span>{' '}
                        junkyard{filteredJunkyards.length !== 1 ? 's' : ''}{zipcode && ` matching "${zipcode}"`}
                    </p>
                </div>
            </section>

            {/* Results */}
            <section className="py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
                                    <div className="w-full h-32 bg-slate-100 rounded-xl mb-4" />
                                    <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : filteredJunkyards.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                            {filteredJunkyards.map((vendor) => (
                                <VendorCard key={vendor.id} vendor={vendor} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
                            <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>No Junkyards Found</h3>
                            <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                {zipcode
                                    ? `No junkyards found near ${zipcode}. Try a different ZIP code or browse all vendors.`
                                    : 'Try adjusting your search criteria or browse all junkyards.'}
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <Link to="/vendors" className="font-bold px-8 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-[0_8px_20px_rgb(37,99,235,0.25)]">
                                    View All Vendors
                                </Link>
                                <Link to="/" className="font-bold px-8 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition">
                                    New Search
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}
