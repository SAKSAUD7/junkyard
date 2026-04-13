import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { useData } from '../hooks/useData';
import SEO from '../components/SEO';
import Rating from '../components/Rating';
import { getCollectionPageSchema, getBreadcrumbSchema } from '../utils/structuredData';
import DynamicAd from '../components/DynamicAd';
import MobileAdBanner from '../components/MobileAdBanner';

export default function BrowseState() {
    const { state } = useParams();
    const [searchParams] = useSearchParams();
    const initialSearch = searchParams.get('search') || '';

    const [junkyards, setJunkyards] = useState([]);
    const [loading, setLoading] = useState(true);
    const { data: states } = useData('data_states.json');
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const vendorsPerPage = 24;

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                setLoading(true);
                const params = { state, page: currentPage, page_size: vendorsPerPage, search: searchTerm };
                const data = await api.getVendors(params);

                if (data.results) {
                    setJunkyards(data.results);
                    setTotalCount(data.count);
                    setTotalPages(Math.ceil(data.count / vendorsPerPage));
                } else if (Array.isArray(data)) {
                    setJunkyards(data);
                    setTotalCount(data.length);
                    setTotalPages(1);
                } else {
                    setJunkyards([]);
                    setTotalCount(0);
                }
            } catch (err) {
                console.error('Error fetching vendors:', err);
                setJunkyards([]);
                setTotalCount(0);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchVendors, 300);
        return () => clearTimeout(timeoutId);
    }, [state, currentPage, searchTerm]);

    useEffect(() => {
        window.scrollTo(0, 0);
        setCurrentPage(1);
    }, [state]);

    useEffect(() => {
        const query = searchParams.get('search') || '';
        if (query !== searchTerm) {
            setSearchTerm(query);
            setCurrentPage(1);
        }
    }, [searchParams]);

    const stateInfo = states?.find(s => s.stateCode?.toLowerCase() === state.toLowerCase());
    const stateName = stateInfo?.stateName || state.toUpperCase();

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            getCollectionPageSchema({
                name: `Junkyards in ${stateName}`,
                description: `Find auto salvage yards and used auto parts in ${stateName}`,
                url: typeof window !== 'undefined' ? window.location.href : '',
                numberOfItems: totalCount
            }),
            getBreadcrumbSchema([
                { name: 'Home', url: '/' },
                { name: 'Browse States', url: '/browse' },
                { name: stateName, url: `/browse/${state}` }
            ])
        ]
    };

    return (
        <div className="min-h-screen" style={{ background: '#0a0b0d' }}>
            <SEO
                title={`Junkyards in ${stateName} - ${totalCount} Auto Salvage Yards`}
                description={`Find ${totalCount} verified junkyards in ${stateName}. free quotes, nationwide shipping.`}
                schema={schema}
            />
            <Navbar />

            {/* Cinematic Hero */}
            <div className="relative min-h-[30vh] md:min-h-[40vh] flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #080909 0%, #0f1117 100%)' }}>
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10 blur-[100px]" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
                    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 py-12">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                        <div className="flex items-center gap-2 text-white/40 text-sm mb-6 font-semibold uppercase tracking-wider">
                            <Link to="/browse" className="hover:text-amber-400 transition-colors">States</Link>
                            <span className="text-white/20">/</span>
                            <span className="text-white">{stateName}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full mb-4">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-white text-xs font-semibold tracking-wide">{totalCount} Verified Junkyards</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight">
                            Junkyards in <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stateName}</span>
                        </h1>
                    </motion.div>
                </div>
            </div>

            {/* Sticky Filter Bar */}
            <div className="sticky top-[64px] md:top-[72px] z-40 border-b border-white/10" style={{ background: 'rgba(10,11,13,0.9)', backdropFilter: 'blur(20px)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative w-full md:max-w-md group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-white/30 group-focus-within:text-amber-500 transition-colors" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                        </div>
                        <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            placeholder="Search by name or city..."
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm"
                        />
                    </div>
                    <div className="flex justify-between md:justify-end items-center gap-4 text-xs font-semibold uppercase tracking-widest text-white/40">
                        <span>Showing {Math.min(totalCount, (currentPage - 1) * vendorsPerPage + 1)} - {Math.min(currentPage * vendorsPerPage, totalCount)} of {totalCount}</span>
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="flex items-center gap-1 hover:text-white transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg> Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
                        </div>
                    ) : junkyards.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {junkyards.map((vendor, i) => (
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i % 12 * 0.05 }} key={vendor.id}>
                                    <Link to={`/vendors/${vendor.id}`} className="group relative block h-full">
                                        {/* Hover Glow */}
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500" />

                                        <div className="relative h-full flex flex-col bg-white/5 border border-white/[8%] rounded-2xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:border-amber-500/30" style={{ background: '#111318' }}>
                                            <div className="aspect-[16/9] w-full p-4 flex items-center justify-center border-b border-white/5 relative overflow-hidden bg-white/2">
                                                {vendor.logo ? (
                                                    <img src={vendor.logo} alt={vendor.name} className="max-h-full max-w-full object-contain relative z-10" onError={(e) => { e.target.src = '/images/logo-placeholder.png'; }} />
                                                ) : (
                                                    <svg className="w-12 h-12 text-white/10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" /></svg>
                                                )}
                                            </div>

                                            <div className="p-5 flex flex-col flex-grow">
                                                <h3 className="font-bold text-lg text-white mb-2 line-clamp-2 leading-tight group-hover:text-amber-400 transition-colors">{vendor.name}</h3>

                                                <div className="flex items-center gap-1.5 text-white/40 mb-4 mt-auto">
                                                    <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                                    <span className="text-sm truncate">{vendor.city}, {vendor.state}</span>
                                                </div>

                                                <div className="flex items-center justify-between mt-auto">
                                                    <Rating stars={vendor.rating_stars || 5} size="sm" showValue={true} value={vendor.rating || '5.0'} theme="dark" showPercentage={false} />
                                                    <span className="text-xs font-bold text-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>View</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white/5 border border-white/5 rounded-3xl">
                            <h3 className="text-xl font-bold text-white mb-2">No junkyards found</h3>
                            <p className="text-white/40 mb-6">Try adjusting your search criteria</p>
                            <button onClick={() => setSearchTerm('')} className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-2 rounded-lg transition-colors border border-white/10">Clear Search</button>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center">
                            <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 backdrop-blur-sm">
                                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${currentPage === 1 ? 'text-white/20 cursor-not-allowed' : 'text-white hover:bg-white/10'}`}>
                                    ← Prev
                                </button>
                                <div className="flex items-center gap-1 hidden sm:flex">
                                    {[...Array(totalPages)].map((_, idx) => {
                                        const p = idx + 1;
                                        if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                                            return (
                                                <button key={p} onClick={() => paginate(p)} className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-semibold transition-all ${currentPage === p ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
                                                    {p}
                                                </button>
                                            );
                                        } else if (p === currentPage - 2 || p === currentPage + 2) {
                                            return <span key={p} className="text-white/20 px-2">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>
                                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${currentPage === totalPages ? 'text-white/20 cursor-not-allowed' : 'text-white hover:bg-white/10'}`}>
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <MobileAdBanner page="browse" />
            <Footer />
        </div>
    );
}
