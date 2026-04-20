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

// Lightweight floating particles canvas
function ParticleField() {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;
        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
        resize();
        window.addEventListener('resize', resize);
        const particles = Array.from({ length: 45 }, () => ({
            x: Math.random() * 1600, y: Math.random() * 900,
            vx: (Math.random() - 0.5) * 0.25, vy: -Math.random() * 0.3 - 0.05,
            r: Math.random() * 1.2 + 0.3,
            color: Math.random() > 0.5 ? '#2563eb' : '#06b6d4',
            alpha: Math.random() * 0.4 + 0.1
        }));
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
                ctx.fill();
            });
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId); };
    }, []);
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
}

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
        if (stateData && stateData.stateCode) {
            navigate(`/browse/${stateData.stateCode.toLowerCase()}`);
        }
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
        <div style={{ background: '#060c18', minHeight: '100vh', color: '#e2e8f0', overflowX: 'hidden' }}>
            <SEO
                title="Browse Junkyards by State – Interactive USA Map | JunkyardsNearMe"
                description={`Explore ${statesData.length} states on our interactive map. Find ${totalVendors}+ verified junkyards nationwide. Click any state to see local listings.`}
                schema={schema}
            />

            <Navbar />

            {/* ── HERO ── */}
            <section
                className="relative overflow-hidden"
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Background */}
                <div className="absolute inset-0" style={{ zIndex: 0 }}>
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(14,30,64,0.95) 0%, #060c18 100%)' }} />
                    {/* Ambient blue ring */}
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full"
                        style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.09) 0%, transparent 70%)', filter: 'blur(60px)' }} />
                    {/* Grid lines */}
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'linear-gradient(rgba(37,99,235,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.04) 1px, transparent 1px)',
                        backgroundSize: '60px 60px'
                    }} />
                    <ParticleField />
                </div>

                {/* Content */}
                <div className="relative flex-1 flex flex-col" style={{ zIndex: 1 }}>
                    {/* Top metadata strip */}
                    <div
                        className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-6"
                        style={{
                            opacity: introVisible ? 1 : 0,
                            transform: introVisible ? 'translateY(0)' : 'translateY(20px)',
                            transition: 'opacity 0.7s ease, transform 0.7s ease'
                        }}
                    >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            {/* Left — headline */}
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
                                    style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)', backdropFilter: 'blur(8px)' }}>
                                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22d3ee', boxShadow: '0 0 6px #22d3ee' }} />
                                    <span style={{ color: '#67e8f9', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
                                        {statesData.length} States Active · {totalVendors.toLocaleString()}+ Yards
                                    </span>
                                </div>
                                <h1
                                    className="font-black mb-2"
                                    style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em', color: '#f1f5f9', lineHeight: 1.1 }}
                                >
                                    {get('hero', 'heading', 'Explore Junkyards')}{' '}
                                    <span style={{ background: 'linear-gradient(135deg, #60a5fa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                        by State
                                    </span>
                                </h1>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '520px' }}>
                                    {get('browse', 'subheading', get('map', 'heading', 'Click any state on the map to browse verified junkyards. Hover for a quick preview.'))}
                                </p>
                            </div>

                            {/* Right — search */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4" style={{ color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={get('map', 'search_placeholder', 'Find a state...')}
                                    className="w-full md:w-64 pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                                    style={{
                                        background: 'rgba(15,23,42,0.8)',
                                        border: '1px solid rgba(37,99,235,0.25)',
                                        color: '#e2e8f0',
                                        backdropFilter: 'blur(12px)',
                                        fontFamily: "'Outfit', sans-serif",
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(37,99,235,0.6)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(37,99,235,0.25)'}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute inset-y-0 right-3 flex items-center"
                                        style={{ color: '#475569' }}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── 70/30 SPLIT LAYOUT ── */}
                    <div
                        className="flex-1 w-full max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-8 pb-8 flex flex-col lg:flex-row gap-6 h-full min-h-[500px]"
                        style={{
                            opacity: introVisible && !loading ? 1 : 0,
                            transform: introVisible && !loading ? 'translateY(0)' : 'translateY(30px)',
                            transition: 'opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s',
                        }}
                    >
                        {loading ? (
                            <div className="flex flex-col flex-1 items-center justify-center py-32">
                                <div className="w-16 h-16 rounded-full mb-6 animate-spin" style={{ border: '3px solid rgba(37,99,235,0.15)', borderTopColor: '#2563eb' }} />
                                <p style={{ color: '#475569', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', letterSpacing: '0.08em' }}>
                                    Loading map data...
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* MAP CONTAINER (70% width on Desktop) */}
                                <div 
                                    className="w-full lg:w-[70%] h-[50vh] lg:h-[calc(100vh-280px)] min-h-[400px] relative overflow-hidden rounded-2xl flex items-center justify-center"
                                    style={{
                                        background: 'rgba(7,13,26,0.7)',
                                        border: '1px solid rgba(37,99,235,0.15)',
                                        boxShadow: '0 20px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.6), transparent)' }} />
                                    
                                    {searchTerm && (
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-xl"
                                            style={{ background: 'rgba(10,18,35,0.9)', border: '1px solid rgba(37,99,235,0.4)', backdropFilter: 'blur(10px)' }}>
                                            <span style={{ color: '#93c5fd', fontSize: '0.8rem' }}>
                                                Showing: <strong style={{ color: '#f1f5f9' }}>{filteredStates.length} state{filteredStates.length !== 1 ? 's' : ''}</strong> matching "{searchTerm}"
                                            </span>
                                        </div>
                                    )}

                                    {/* Map Component tightly bound to parent div */}
                                    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                                        <USAMap
                                            statesData={filteredStates.length > 0 ? filteredStates : statesData}
                                            onStateSelect={handleStateSelect}
                                        />
                                    </div>
                                </div>

                                {/* LISTINGS PANEL (30% width on Desktop) */}
                                <div className="w-full lg:w-[30%] h-auto lg:h-[calc(100vh-280px)] overflow-y-auto pr-2 flex flex-col gap-4 custom-scrollbar">
                                    <h2 className="text-xl font-bold mb-2 sticky top-0 bg-[#060c18]/90 backdrop-blur pb-2 pt-1 z-10" style={{ color: '#f1f5f9', fontFamily: "'Outfit', sans-serif" }}>
                                        {searchTerm ? `Results for "${searchTerm}"` : 'Active States'}
                                    </h2>
                                    
                                    <div className="flex flex-col gap-3">
                                        {(searchTerm ? filteredStates : statesData).slice(0, 50).map(state => (
                                            <button
                                                key={state.stateCode}
                                                onClick={() => handleStateSelect(state)}
                                                className="text-left rounded-xl p-4 transition-all duration-200 w-full hover:scale-[1.02] flex items-center justify-between"
                                                style={{
                                                    background: 'rgba(15,23,42,0.7)',
                                                    border: '1px solid rgba(37,99,235,0.15)',
                                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)'}
                                                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(37,99,235,0.15)'}
                                            >
                                                <div>
                                                    <div style={{ color: '#e2e8f0', fontWeight: 'bold', fontSize: '1rem', fontFamily: "'Outfit', sans-serif" }}>
                                                        {state.stateName}
                                                    </div>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace", marginTop: '0.2rem' }}>
                                                        {state.stateCode}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col justify-end items-end">
                                                    <div style={{ color: '#22d3ee', fontSize: '1.2rem', fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>
                                                        {state.junkyardCount}
                                                    </div>
                                                    <div style={{ color: '#64748b', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        Yards
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <MobileAdBanner page="browse" />
            <Footer />
        </div>
    );
}
