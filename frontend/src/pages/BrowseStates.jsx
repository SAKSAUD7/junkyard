import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import USAMap from '../components/USAMap';
import { api } from '../services/api';
import DynamicAd from '../components/DynamicAd';
import MobileAdBanner from '../components/MobileAdBanner';
import SEO from '../components/SEO';
import { getCollectionPageSchema, getBreadcrumbSchema } from '../utils/structuredData';
import { useCMS } from '../hooks/useCMS';
import AdCarousel from '../components/AdCarousel';

export default function BrowseStates() {
    const { get } = useCMS('browse');
    const [searchParams] = useSearchParams();
    const stateParam = searchParams.get('state');

    const [statesData, setStatesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalVendors, setTotalVendors] = useState(0);
    const [introVisible, setIntroVisible] = useState(false);
    const navigate = useNavigate();
    const mapRef = useRef(null);

    useEffect(() => {
        if (stateParam) setSearchTerm(stateParam);
    }, [stateParam]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const results = await Promise.allSettled([api.getStates(), api.getStateCounts()]);
                const statesResponse = results[0].status === 'fulfilled' ? results[0].value : [];
                const countsResponse = results[1].status === 'fulfilled' ? results[1].value : {};
                const statesList = statesResponse.results || statesResponse || [];
                let total = 0;
                const merged = statesList.map(state => {
                    const count = countsResponse[state.stateCode] || 0;
                    total += count;
                    return { ...state, junkyardCount: count };
                }).filter(s => s.junkyardCount > 0).sort((a, b) => b.junkyardCount - a.junkyardCount);
                setStatesData(merged);
                setTotalVendors(total);
            } catch (err) {
                console.warn('[BrowseStates] Data unavailable');
            } finally {
                setLoading(false);
                setTimeout(() => setIntroVisible(true), 100);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, []);

    const filteredStates = statesData.filter(s => {
        const q = searchTerm.toLowerCase().trim();
        if (!q) return true;
        if (q.length <= 2) return s.stateCode?.toLowerCase() === q;
        return s.stateName?.toLowerCase().includes(q);
    });

    const handleStateSelect = (stateData) => {
        if (stateData && stateData.stateCode) navigate(`/browse/${stateData.stateCode.toLowerCase()}`);
    };

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            getCollectionPageSchema({
                name: 'Browse Junkyards by State',
                description: 'Find auto salvage yards and junkyards across all US states',
                url: typeof window !== 'undefined' ? window.location.href : '',
                numberOfItems: statesData.length
            }),
            getBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Browse States', url: '/browse' }])
        ]
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen flex flex-col">
            <SEO
                title={get('seo', 'meta_title', 'Browse Junkyards by State – Interactive USA Map | JunkyardsNearMe')}
                description={get('seo', 'meta_desc', `Explore ${statesData.length} states on our interactive map. Find ${totalVendors}+ verified junkyards nationwide. Click any state to see local listings.`)}
                schema={schema}
            />

            <Navbar />

            {/* ── HERO ── */}
            <section className="relative pt-28 pb-14 bg-white border-b border-slate-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] opacity-60 pointer-events-none translate-x-1/3 -translate-y-1/4" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-50 rounded-full blur-[80px] opacity-40 pointer-events-none -translate-x-1/3 translate-y-1/4" />

                <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <div className="text-center mb-4">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 bg-blue-50 border border-blue-100">
                            <span className="text-blue-600 text-[12px] font-bold uppercase tracking-widest">{get('hero', 'badge', 'Interactive Map')}</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {get('hero', 'heading', 'Browse Junkyards')} <span className="text-blue-600">{get('hero', 'heading_accent', 'By State')}</span>
                        </h1>
                        <p className="text-[17px] text-slate-500 font-medium max-w-2xl mx-auto mb-2 leading-relaxed">
                            {get('hero', 'subheading', 'Explore our interactive map. Find verified junkyards nationwide.')}
                        </p>
                    </div>
                </div>
            </section>

            <div className="flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col-reverse lg:flex-row-reverse gap-6 lg:h-[calc(100vh-100px)] min-h-[600px] overflow-hidden">
                
                {/* LEFT PANEL - STATES LIST & SEARCH */}
                <div className="w-full lg:w-[35%] flex flex-col bg-white rounded-3xl border border-slate-100 shadow-[0_8px_40px_rgb(0,0,0,0.04)] overflow-hidden flex-shrink-0 h-[600px] lg:h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>{get('map', 'panel_heading', 'Find Your State')}</h2>
                        
                        {/* Search Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={get('map', 'search_placeholder', 'Search for a state...')}
                                className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl text-[15px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* States List */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                                <span className="font-bold text-sm">Loading States...</span>
                            </div>
                        ) : filteredStates.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                                {filteredStates.map(state => (
                                    <button
                                        key={state.stateCode}
                                        onClick={() => handleStateSelect(state)}
                                        className="group flex flex-row items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-blue-100 hover:shadow-[0_4px_12px_rgb(37,99,235,0.08)] transition-all text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 min-w-[40px] rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[11px] uppercase tracking-wider group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {state.stateCode}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-[15px]">{state.stateName}</span>
                                                <span className="text-[13px] font-medium text-slate-500">{state.junkyardCount} active yards</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-slate-500 font-medium">
                                No states found matching "{searchTerm}"
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL - INTERACTIVE MAP */}
                <div className="flex-1 bg-white rounded-3xl overflow-hidden relative z-0 border border-slate-200 shadow-[0_8px_40px_rgb(0,0,0,0.06)] min-h-[400px]">
                    {/* Label badge */}
                    <div className="absolute top-4 left-4 z-10 hidden sm:block">
                        <div className="px-4 py-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block mr-2 animate-pulse" />
                            {get('map', 'click_hint', 'Click a State to Browse')}
                        </div>
                    </div>

                    {/* Zoom buttons — rendered here so they are not clipped by overflow-hidden inside the map child */}
                    <div className="absolute bottom-4 left-4 z-20 flex flex-col rounded-xl shadow-lg overflow-hidden border border-slate-200 bg-white">
                        <button
                            onClick={() => mapRef.current?.zoomIn()}
                            className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Zoom In"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v12M6 12h12" />
                            </svg>
                        </button>
                        <div className="w-full h-[1px] bg-slate-200" />
                        <button
                            onClick={() => mapRef.current?.zoomOut()}
                            className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Zoom Out"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                            </svg>
                        </button>
                    </div>

                    {/* USA Map */}
                    <div className="w-[110%] h-[110%] -ml-[5%] -mt-[5%] absolute inset-0">
                        <USAMap 
                            ref={mapRef}
                            onStateSelect={handleStateSelect}
                            statesData={statesData}
                        />
                    </div>
                    
                    <div className="absolute inset-0 pointer-events-none rounded-3xl ring-1 ring-inset ring-slate-900/5" />
                </div>
            </div>

            <MobileAdBanner page="browse" />
            <div className="bg-white">
                <AdCarousel slotGroup="carousel_5" page="browse" title="Sponsored Vendors" />
            </div>
            <Footer />
        </div>
    );
}
