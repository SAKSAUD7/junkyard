import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';
import DynamicAd from '../components/DynamicAd';
import MobileAdBanner from '../components/MobileAdBanner';
import SEO from '../components/SEO';
import { getCollectionPageSchema, getBreadcrumbSchema } from '../utils/structuredData';

export default function BrowseStates() {
    const [searchParams] = useSearchParams();
    const stateParam = searchParams.get('state');

    const [statesData, setStatesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalVendors, setTotalVendors] = useState(0);

    useEffect(() => {
        if (stateParam) setSearchTerm(stateParam);
    }, [stateParam]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statesResponse, countsResponse] = await Promise.all([
                    api.getStates(),
                    api.getStateCounts()
                ]);

                const statesList = statesResponse.results || statesResponse;
                let total = 0;
                const mergedData = statesList.map(state => {
                    const count = countsResponse[state.stateCode] || 0;
                    total += count;
                    return { ...state, junkyardCount: count };
                }).filter(state => state.junkyardCount > 0).sort((a, b) => b.junkyardCount - a.junkyardCount);

                setStatesData(mergedData);
                setTotalVendors(total);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const filteredStates = statesData.filter(state => {
        const searchLower = searchTerm.toLowerCase().trim();
        if (!searchLower) return true;
        const stateCodeLower = state.stateCode.toLowerCase();
        const stateNameLower = state.stateName.toLowerCase();
        if (searchLower.length <= 2) return stateCodeLower === searchLower;
        return stateNameLower.includes(searchLower);
    });

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            getCollectionPageSchema({
                name: 'Browse Junkyards by State',
                description: 'Find auto salvage yards and junkyards across all US states',
                url: typeof window !== 'undefined' ? window.location.href : '',
                numberOfItems: statesData.length
            }),
            getBreadcrumbSchema([
                { name: 'Home', url: '/' },
                { name: 'Browse States', url: '/browse' }
            ])
        ]
    };

    return (
        <div className="min-h-screen" style={{ background: '#0a0b0d' }}>
            <SEO
                title="Browse Junkyards by State - Find Auto Salvage Yards Near You"
                description={`Find junkyards and auto salvage yards across ${statesData.length} states. Search ${totalVendors}+ verified vendors nationwide.`}
                schema={schema}
            />
            <Navbar />

            {/* Cinematic Hero */}
            <div className="relative min-h-[40vh] md:min-h-[50vh] flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #080909 0%, #0f1117 100%)' }}>
                {/* Background photo */}
                <div className="absolute inset-0">
                    <img src="/images/static/car-junkyard-rusty.png" alt="Junkyard" loading="lazy" className="w-full h-full object-cover object-center" style={{ opacity: 0.18 }} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(8,9,9,0.5) 0%, rgba(8,9,9,0.85) 100%)' }} />
                </div>
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-[100px]" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
                    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                </div>

                <div className="absolute top-4 left-4 z-30 hidden xl:block"><DynamicAd slot="left_sidebar_ad" page="browse" /></div>
                <div className="absolute top-4 right-4 z-30 hidden xl:block"><DynamicAd slot="right_sidebar_ad" page="browse" /></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-center py-12">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                            <span className="text-white text-sm font-semibold tracking-wide">
                                {statesData?.length || 0} States • {totalVendors}+ Verified Junkyards
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-4">
                            Browse by <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Location</span>
                        </h1>

                        <p className="text-white/50 text-base md:text-lg font-light max-w-2xl mx-auto mb-8">
                            Find quality auto parts from trusted salvage yards. Select your state to discover local junkyards.
                        </p>

                        <div className="max-w-xl mx-auto relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-white/30 group-focus-within:text-amber-500 transition-colors" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                            </div>
                            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search for a state..."
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all shadow-xl backdrop-blur-sm"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="relative py-12 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2 text-amber-500">
                            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                            <span className="font-bold text-lg">{filteredStates?.length || 0} states available</span>
                        </div>
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="text-white/40 hover:text-white font-semibold text-sm flex items-center gap-1 transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg> Clear Search
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                            <p className="text-white/40 mt-4 font-semibold uppercase tracking-widest text-xs">Loading states...</p>
                        </div>
                    ) : filteredStates && filteredStates.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                            {filteredStates.map((state, i) => (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.02 }} key={state.stateCode}>
                                    <Link to={`/browse/${state.stateCode.toLowerCase()}`} className="group block h-full">
                                        <div className="h-full bg-white/5 border border-white/[8%] hover:border-amber-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10">
                                            <div>
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-500 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                                </div>
                                                <h3 className="font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">{state.stateName}</h3>
                                                <p className="text-white/30 text-xs font-mono mb-4">{state.stateCode}</p>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full transition-all duration-500 group-hover:from-amber-400 group-hover:to-orange-400"
                                                            style={{
                                                                width: `${Math.min((state.junkyardCount / Math.max(...statesData.map(s => s.junkyardCount))) * 100, 100)}%`,
                                                                background: 'linear-gradient(90deg, #f59e0b, #ea580c)'
                                                            }} />
                                                    </div>
                                                    <span className="text-white font-bold text-sm">{state.junkyardCount}</span>
                                                </div>
                                                <p className="text-white/30 text-xs text-right">vendors</p>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 rounded-3xl border border-white/5 bg-white/5">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 border border-white/10 rounded-full mb-4">
                                <svg className="w-8 h-8 text-white/30" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No states found</h3>
                            <p className="text-white/40 mb-6">We couldn't find any states matching "{searchTerm}"</p>
                            <button onClick={() => setSearchTerm('')} className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-2 rounded-lg transition-colors border border-white/10">Clear Search</button>
                        </div>
                    )}
                </div>
            </div>

            <MobileAdBanner page="browse" />
            <Footer />
        </div>
    );
}
