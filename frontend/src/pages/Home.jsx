import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LeadForm from '../components/LeadForm'
import PincodeSearch from '../components/PincodeSearch'
import TrustedVendors from '../components/TrustedVendors'
import HeroCarousel from '../components/HeroCarousel'
import TestimonialsCarousel from '../components/TestimonialsCarousel'
import { useData } from '../hooks/useData'
import DynamicAd from '../components/DynamicAd'
import MobileAdBanner from '../components/MobileAdBanner'
import SEO from '../components/SEO'
import { getOrganizationSchema, getWebsiteSchema } from '../utils/structuredData'
import { Link } from 'react-router-dom'

/* ─── Scroll-Reveal Wrapper ────────────────────────────── */
function FadeInSection({ children, delay = 0, direction = 'up' }) {
    const controls = useAnimation()
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
    const variants = {
        hidden: { opacity: 0, y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0, x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0 },
        visible: { opacity: 1, y: 0, x: 0 }
    }
    useEffect(() => { if (inView) controls.start('visible') }, [inView, controls])
    return (
        <motion.div ref={ref} initial="hidden" animate={controls} variants={variants} transition={{ duration: 0.7, delay, ease: 'easeOut' }}>
            {children}
        </motion.div>
    )
}

/* ─── Stat Counter ────────────────────────────────────── */
function StatItem({ value, label, icon }) {
    return (
        <div className="text-center group">
            <div className="text-3xl md:text-4xl font-black text-amber-400 mb-1 group-hover:scale-110 transition-transform duration-300">{value}</div>
            <div className="text-white/50 text-sm uppercase tracking-widest">{label}</div>
        </div>
    )
}


const DYNAMIC_CATEGORY_ADS = [
    {
        id: "1",
        category: "engine",
        imageUrl: "/images/uploads/client_image_6.png",
        startDate: "2026-04-01T00:00:00.000Z",
        endDate: "2027-12-31T23:59:59.000Z"
    },
    {
        id: "2",
        category: "transmission",
        imageUrl: "/images/uploads/client_image_7.png",
        startDate: "2026-04-01T00:00:00.000Z",
        endDate: "2027-12-31T23:59:59.000Z"
    },
    {
        id: "3",
        category: "tires",
        imageUrl: "/images/uploads/client_image_8.png",
        startDate: "2026-04-01T00:00:00.000Z",
        endDate: "2027-12-31T23:59:59.000Z"
    },
    {
        id: "4",
        category: "battery",
        imageUrl: "/images/uploads/client_image_3.png",
        startDate: "2026-04-01T00:00:00.000Z",
        endDate: "2027-12-31T23:59:59.000Z"
    },
    {
        id: "5",
        category: "body",
        imageUrl: "/images/uploads/client_image_1.png",
        startDate: "2026-04-01T00:00:00.000Z",
        endDate: "2027-12-31T23:59:59.000Z"
    }
];

export default function Home() {

    const [currentTime, setCurrentTime] = useState(Date.now())

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 60000)
        return () => clearInterval(interval)
    }, [])

    const activeCategoryImages = useMemo(() => {
        return DYNAMIC_CATEGORY_ADS.filter(item => {
            const start = item.startDate ? new Date(item.startDate).getTime() : null
            const end = item.endDate ? new Date(item.endDate).getTime() : null
            if (start && currentTime < start) return false
            if (end && currentTime > end) return false
            return true
        }).reduce((acc, item) => {
            acc[item.category.toLowerCase()] = item.imageUrl
            return acc
        }, {})
    }, [currentTime])

    const navigate = useNavigate()
    const { data: allVendors } = useData('data_junkyards_complete.json')

    const combinedSchema = {
        '@context': 'https://schema.org',
        '@graph': [getOrganizationSchema(), getWebsiteSchema()]
    }

    const states = [
        { name: 'Texas', abbr: 'TX', count: '180+' },
        { name: 'California', abbr: 'CA', count: '220+' },
        { name: 'Florida', abbr: 'FL', count: '160+' },
        { name: 'New York', abbr: 'NY', count: '90+' },
        { name: 'Ohio', abbr: 'OH', count: '130+' },
        { name: 'Michigan', abbr: 'MI', count: '110+' },
        { name: 'Pennsylvania', abbr: 'PA', count: '150+' },
        { name: 'Illinois', abbr: 'IL', count: '70+' },
    ]

    const categories = [
        { icon: '⚙️', label: 'Engines', query: 'engine' },
        { icon: '🔧', label: 'Transmissions', query: 'transmission' },
        { icon: '🛞', label: 'Wheels & Tires', query: 'tires' },
        { icon: '🔋', label: 'Batteries', query: 'battery' },
        { icon: '🚘', label: 'Body Parts', query: 'body' },
        { icon: '💡', label: 'Lighting', query: 'lights' },
        { icon: '🌬️', label: 'AC & HVAC', query: 'ac' },
        { icon: '🖥️', label: 'Electronics', query: 'electronics' },
    ]

    const howItWorks = [
        { step: '01', title: 'Search Your Part', desc: 'Enter your vehicle make, model, year and the part you need.' },
        { step: '02', title: 'Find Nearby Yards', desc: 'Instantly discover verified junkyards near your location with matching inventory.' },
        { step: '03', title: 'Contact & Save', desc: 'Connect directly with the yard, get a quote, and save up to 80% on OEM parts.' },
    ]

    return (
        <div className="min-h-screen" style={{ background: '#0a0b0d' }}>
            <SEO
                title="Find Auto Salvage Yards & Used Auto Parts Near You"
                description="Search 6,000+ verified junkyards nationwide. Find quality used auto parts by make, model, or location. Free quotes. Save up to 80% on OEM parts."
                schema={combinedSchema}
            />

            <Navbar />

            {/* ══════════════════════════════════════════════════════
                HERO SECTION — Cinematic Dark
            ══════════════════════════════════════════════════════ */}
            <section className="relative min-h-screen flex flex-col items-center justify-start pt-4 overflow-hidden" style={{ background: '#080909' }}>
                {/* Hero Carousel Background */}
                <HeroCarousel />
                {/* Background ambient glows */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
                    {/* Grid overlay */}
                    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                </div>

                {/* Sidebar Ads */}
                <div className="absolute top-4 left-4 z-30 hidden xl:block">
                    <DynamicAd slot="left_sidebar_ad" page="home" />
                </div>
                <div className="absolute top-4 right-4 z-30 hidden xl:block">
                    <DynamicAd slot="right_sidebar_ad" page="home" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 pt-10 md:pt-16">
                    {/* Brand Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-6 md:mb-10"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 mb-6"
                            style={{ background: 'rgba(245,158,11,0.08)' }}>
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">6,000+ Verified Junkyards Nationwide</span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight mb-4">
                            FOR YOUR JUNKYARD
                            <span className="block mt-1" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                AUTO PARTS RECYCLING
                            </span>
                            <span className="block mt-2 text-2xl sm:text-3xl md:text-4xl text-white/90">
                                AND AUTO SALVAGE SEARCH IN SECONDS.
                            </span>
                        </h1>
                        <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto font-medium tracking-wide">
                            LOCATE USED AUTO PARTS near you!
                        </p>
                    </motion.div>

                    {/* Search Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="max-w-5xl mx-auto"
                    >
                        {/* ZIP Search */}
                        <div className="relative z-50 rounded-2xl p-6 mb-4 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}>
                            <h2 className="text-white font-bold text-lg mb-1 text-center">Search by ZIP Code</h2>
                            <p className="text-white/40 text-sm mb-4 text-center">Find junkyards near you instantly</p>
                            <PincodeSearch />
                        </div>

                        {/* Or divider */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                            <span className="text-white/30 text-xs uppercase tracking-widest">Or search by vehicle</span>
                            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                        </div>

                        {/* Lead Form */}
                        <LeadForm layout="horizontal" mode="quality_auto_parts" enableSteps={true} />
                    </motion.div>

                    {/* Stat Strip */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 max-w-3xl mx-auto border-t border-white/5 pt-10"
                    >
                        <StatItem value="6,000+" label="Junkyards" />
                        <StatItem value="55+" label="States" />
                        <StatItem value="1M+" label="Parts" />
                        <StatItem value="80%" label="Avg Savings" />
                    </motion.div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                BROWSE BY STATE
            ══════════════════════════════════════════════════════ */}
            <section className="py-20 relative" style={{ background: '#1a1f2e' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeInSection>
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">Browse by Location</p>
                                <h2 className="text-3xl md:text-4xl font-black text-white">Top States</h2>
                            </div>
                            <Link to="/junkyards-by-location" className="text-amber-400 hover:text-amber-300 text-sm font-semibold flex items-center gap-2 transition-colors">
                                View All States
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </Link>
                        </div>
                    </FadeInSection>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                        {states.map((state, i) => (
                            <FadeInSection key={state.abbr} delay={i * 0.07}>
                                <Link
                                    to={`/junkyards/${state.name.toLowerCase().replace(' ', '-')}`}
                                    className="group block rounded-2xl border border-white/[8%] p-5 transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1"
                                    style={{ background: '#111318' }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-2xl font-black text-white/20 group-hover:text-amber-500/40 transition-colors" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{state.abbr}</span>
                                        <span className="text-xs text-amber-400/70 font-semibold">{state.count}</span>
                                    </div>
                                    <p className="text-white font-semibold text-sm group-hover:text-amber-300 transition-colors">{state.name}</p>
                                    <p className="text-white/30 text-xs mt-0.5">Junkyards</p>
                                </Link>
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                TRUSTED VENDORS - keep component, apply dark background wrapper
            ══════════════════════════════════════════════════════ */}
            <section className="py-0" style={{ background: '#0a0b0d' }}>
                <TrustedVendors />
            </section>


            {/* ══════════════════════════════════════════════════════
                HOW IT WORKS
            ══════════════════════════════════════════════════════ */}
            <section className="py-20 relative overflow-hidden" style={{ background: '#1a1f2e' }}>
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.2), transparent)' }} />
                    <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.2), transparent)' }} />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeInSection>
                        <div className="text-center mb-14">
                            <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">Simple Process</p>
                            <h2 className="text-3xl md:text-4xl font-black text-white">How It Works</h2>
                        </div>
                    </FadeInSection>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {howItWorks.map((step, i) => (
                            <FadeInSection key={step.step} delay={i * 0.15}>
                                <div className="relative rounded-2xl border border-white/[8%] p-8 transition-all duration-300 hover:border-amber-500/30 group" style={{ background: '#111318' }}>
                                    <div className="text-6xl font-black opacity-5 absolute top-4 right-6 group-hover:opacity-10 transition-opacity" style={{ color: '#f59e0b', fontFamily: 'Rajdhani, sans-serif' }}>{step.step}</div>
                                    <div className="relative z-10">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-sm font-black text-black" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>{step.step}</div>
                                        <h3 className="text-white font-bold text-xl mb-2 group-hover:text-amber-300 transition-colors">{step.title}</h3>
                                        <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            </FadeInSection>
                        ))}
                    </div>

                    <FadeInSection delay={0.4}>
                        <div className="text-center mt-12">
                            <Link to="/junkyards" className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-black transition-all duration-300 hover:-translate-y-0.5"
                                style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', boxShadow: '0 8px 30px rgba(245,158,11,0.3)' }}>
                                Browse All Junkyards
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </Link>
                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                CINEMATIC IMAGE STRIP
            ══════════════════════════════════════════════════════ */}
            <section className="py-16 overflow-hidden" style={{ background: '#111827' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeInSection>
                        <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2 text-center">Premium Experience</p>
                        <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-10">Built for Automotive Enthusiasts</h2>
                    </FadeInSection>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <FadeInSection delay={0.1} direction="left">
                            <div className="relative rounded-3xl overflow-hidden h-64 md:h-80 group">
                                <img src="/images/static/dashboard-speedometer.jpg" alt="Car Dashboard Speedometer" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,9,9,0.9) 0%, transparent 60%)' }} />
                                <div className="absolute bottom-6 left-6">
                                    <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">Performance</p>
                                    <h3 className="text-white text-xl font-black">OEM Quality Parts</h3>
                                    <p className="text-white/50 text-sm mt-1">Genuine components, verified condition</p>
                                </div>
                            </div>
                        </FadeInSection>
                        <FadeInSection delay={0.2} direction="right">
                            <div className="relative rounded-3xl overflow-hidden h-64 md:h-80 group">
                                <img src="/images/static/audi-engine.jpg" alt="Car Engine Bay" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,9,9,0.9) 0%, transparent 60%)' }} />
                                <div className="absolute bottom-6 left-6">
                                    <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">Discover</p>
                                    <h3 className="text-white text-xl font-black">Every Make & Model</h3>
                                    <p className="text-white/50 text-sm mt-1">From engines to electronics, we have it all</p>
                                </div>
                            </div>
                        </FadeInSection>
                    </div>
                </div>
            </section>



            {/* Mobile Ad Banner */}
            <MobileAdBanner page="home" />

            <Footer />
        </div>
    )
}
