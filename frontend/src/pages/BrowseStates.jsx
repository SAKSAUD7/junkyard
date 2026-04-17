import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';
import DynamicAd from '../components/DynamicAd';
import MobileAdBanner from '../components/MobileAdBanner';
import SEO from '../components/SEO';
import { getCollectionPageSchema, getBreadcrumbSchema } from '../utils/structuredData';
import { useCMS } from '../hooks/useCMS';

export default function BrowseStates() {
    const [searchParams] = useSearchParams();
    const stateParam = searchParams.get('state');
    const { get } = useCMS('browse');

    const [statesData, setStatesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalVendors, setTotalVendors] = useState(0);

    useEffect(() => {
        if (stateParam) {
            setSearchTerm(stateParam);
        }
    }, [stateParam]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // We use Promise.allSettled for graceful degradation in case the API 500s
                const results = await Promise.allSettled([
                    api.getStates(),
                    api.getStateCounts()
                ]);

                const statesResponse = results[0].status === 'fulfilled' ? results[0].value : [];
                const countsResponse = results[1].status === 'fulfilled' ? results[1].value : {};

                const statesList = statesResponse.results || statesResponse || [];

                let total = 0;
                const mergedData = statesList.map(state => {
                    const count = countsResponse[state.stateCode] || 0;
                    total += count;
                    return {
                        ...state,
                        junkyardCount: count
                    };
                })
                .filter(state => state.junkyardCount > 0)
                .sort((a, b) => b.junkyardCount - a.junkyardCount);

                setStatesData(mergedData);
                setTotalVendors(total);
                
                if (results[0].status === 'rejected') {
                    // Suppress massive red banners, just log
                    console.warn('[BrowseStates] States endpoint failed gracefully.');
                }
            } catch (err) {
                console.warn('[BrowseStates] Data unavailable');
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <SEO
                title="Browse Junkyards by State - Find Auto Salvage Yards Near You"
                description={`Find junkyards and auto salvage yards across ${statesData.length} states. Search ${totalVendors}+ verified vendors nationwide. Free quotes, quality used auto parts.`}
                schema={schema}
            />

            <Navbar />

            {/* Hero - Cinematic Car Imagery */}
            <div className="hero-depth pt-24 pb-16 flex flex-col justify-center items-center text-center" style={{ minHeight: '50vh', background: 'var(--bg-base)' }}>
                {/* PRIMARY — towering stacked crushed cars */}
                <div className="hero-bg-primary" style={{ backgroundImage: "url('/heroes/stacked-cars.png')", opacity: 0.58 }} />
                {/* DEPTH — car crusher action, blurred */}
                <div className="hero-bg-depth" style={{ backgroundImage: "url('/heroes/car-crusher.png')" }} />
                <div className="hero-overlay-base" />
                <div className="hero-vignette" />
                <div className="hero-glow-teal" />
                <div className="hero-glow-orange" />
                <div className="hero-grid" />
                <div className="hero-scanline" />
                <div className="hero-fade-bottom" />

                {/* Sidebar Ads — above depth layers */}
                <div className="absolute top-4 left-4 z-40 hidden xl:flex flex-col gap-4">
                    <DynamicAd slot="left_sidebar_ad" page="browse" />
                </div>
                <div className="absolute top-4 right-4 z-40 hidden xl:flex flex-col gap-4">
                    <DynamicAd slot="right_sidebar_ad" page="browse" />
                </div>

                <div className="hero-content relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 shadow-xl" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_#60a5fa]"></div>
                                <span className="font-bold tracking-wider text-xs uppercase" style={{ color: '#ffffff' }}>
                                    {statesData?.length || 0} States • {totalVendors}+ Vendors
                                </span>
                            </div>

                            <h1 className="font-black mb-4 tracking-tight px-2" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: '#ffffff', fontFamily: "'Outfit', sans-serif", textShadow: '0 2px 10px rgba(0,0,0,0.5)' }} dangerouslySetInnerHTML={{ __html: get('hero', 'heading', 'Browse by <span class="block mt-2" style="color: #60a5fa">Location</span>') }} />

                            <p className="font-light max-w-3xl mb-8 px-2 text-lg" style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }} dangerouslySetInnerHTML={{ __html: get('hero', 'subheading', 'Find <strong style="color: #ffffff">quality auto parts</strong> from trusted salvage yards. Select your state to discover local junkyards.') }} />

                            {/* Search Bar */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-6 h-6 transition-colors" style={{ color: 'var(--neon-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search for a state..."
                                    className="w-full pl-14 pr-4 py-4 rounded-xl text-lg transition-all duration-300 outline-none bg-white"
                                    style={{ 
                                        border: '2px solid #e2e8f0', 
                                        color: '#0f172a',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 4px 20px rgba(37,99,235,0.15)'; }}
                                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}
                                />
                            </div>
                        </div>

                        {/* 3D MAP PIN VISUAL */}
                        <div className="hidden lg:flex items-center justify-center relative animate-fade-in-up delay-300">
                            <div className="relative w-full max-w-lg mx-auto pointer-events-none">
                                {/* Ambient glow behind the pin to boost the 3D effect */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
                                <img 
                                    src="/3d/map-pin.png" 
                                    alt="3D Glowing Location Pin" 
                                    className="relative w-full h-auto"
                                    style={{ 
                                        mixBlendMode: 'screen', // This magically knocks out the pitch black background!
                                        animation: 'float 4.5s ease-in-out infinite',
                                        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6)) contrast(1.1) brightness(1.1)'
                                    }} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* States Grid Section */}
            <div className="relative py-16 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Results Info */}
                    <div className="mb-10 flex items-center justify-between border-b pb-4" style={{ borderColor: 'rgba(37,99,235,0.1)' }}>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg" style={{ color: 'var(--neon-blue)' }}>
                                {filteredStates?.length || 0} states available
                            </span>
                        </div>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="font-semibold text-sm flex items-center gap-2 transition-colors uppercase tracking-wider"
                                style={{ color: 'var(--neon-orange)' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#ff9500'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--neon-orange)'}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear Search
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-24">
                            <div className="spinner-glow mx-auto mb-4" />
                            <p style={{ color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem' }}>
                                Scanning states database...
                            </p>
                        </div>
                    ) : filteredStates && filteredStates.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                            {filteredStates.map((state) => (
                                <Link
                                    key={state.stateCode}
                                    to={`/browse/${state.stateCode.toLowerCase()}`}
                                    className="group relative block"
                                >
                                    <div className="relative rounded-2xl p-5 h-full transition-all duration-300 transform group-hover:-translate-y-2"
                                        style={{ 
                                            background: '#ffffff',
                                            border: '1px solid rgba(15,23,42,0.08)',
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = 'rgba(37,99,235,0.25)';
                                            e.currentTarget.style.boxShadow = '0 12px 32px rgba(37,99,235,0.12)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = 'rgba(15,23,42,0.08)';
                                            e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
                                        }}
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <svg className="w-5 h-5" style={{ color: 'var(--neon-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </div>

                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--neon-blue)' }}>
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                        </div>

                                        <h3 className="font-bold text-lg mb-1 transition-colors duration-300 group-hover:text-[var(--neon-blue)]" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                                            {state.stateName}
                                        </h3>

                                        <p className="text-xs font-mono mb-4" style={{ color: 'var(--neon-orange)', letterSpacing: '0.1em' }}>
                                            {state.stateCode}
                                        </p>

                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-100">
                                                <div
                                                    className="h-full transition-all duration-1000 ease-out"
                                                    style={{ 
                                                        background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
                                                        width: `${Math.min((state.junkyardCount / Math.max(...(statesData?.map(s => s.junkyardCount) || [1]))) * 100, 100)}%` 
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="font-bold text-slate-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                {state.junkyardCount}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6" style={{ background: 'rgba(234,88,12,0.05)', border: '1px solid rgba(234,88,12,0.2)' }}>
                                <svg className="w-10 h-10" style={{ color: 'var(--neon-orange)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>No states found</h3>
                            <p className="mb-8 text-lg" style={{ color: 'var(--text-secondary)' }}>Try adjusting your search</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="font-bold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-105"
                                style={{ background: 'var(--neon-blue)', color: 'var(--bg-base)' }}
                            >
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <MobileAdBanner page="browse" />

            <Footer />
        </div>
    );
}
