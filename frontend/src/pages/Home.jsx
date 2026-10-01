import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import SEO from '../components/SEO'
import { getOrganizationSchema, getWebsiteSchema } from '../utils/structuredData'
import { useCMS } from '../hooks/useCMS'
import HeroSection from '../components/home/HeroSection'

// Lazy load below-the-fold components
const Footer = React.lazy(() => import('../components/Footer'))
const DynamicAd = React.lazy(() => import('../components/DynamicAd'))
const AdCarousel = React.lazy(() => import('../components/AdCarousel'))
const VendorCTASection = React.lazy(() => import('../components/VendorCTASection'))
const WhyChooseJynmSection = React.lazy(() => import('../components/WhyChooseJynmSection'))
const CTABanner = React.lazy(() => import('../components/home/CTABanner'))
const StatsSection = React.lazy(() => import('../components/home/StatsSection'))
const HowItWorksSection = React.lazy(() => import('../components/home/HowItWorksSection'))

const API_BASE = import.meta.env.VITE_API_URL || ''

// ─── useSiteStats ────────────────────────────────────────────────────────────
// Fetches live site statistics from the public /api/site-stats/ endpoint.
// Results are cached in sessionStorage for 5 minutes.
// Falls back to conservative defaults if the network request fails.
function useSiteStats() {
    const CACHE_KEY = 'site_stats_cache'
    const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
    const DEFAULTS = {
        vendors_count: 1200,
        states_covered: 50,
        parts_listed: 50000,
        savings_percent: 80,
    }

    const [stats, setStats] = useState(() => {
        try {
            const cached = sessionStorage.getItem(CACHE_KEY)
            if (cached) {
                const { data, ts } = JSON.parse(cached)
                if (Date.now() - ts < CACHE_TTL) return data
            }
        } catch (_) { }
        return DEFAULTS
    })

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const cached = sessionStorage.getItem(CACHE_KEY)
                if (cached) {
                    const { data, ts } = JSON.parse(cached)
                    if (Date.now() - ts < CACHE_TTL) { setStats(data); return }
                }
            } catch (_) { }

            try {
                const res = await fetch(`${API_BASE}/api/common/site-stats/`)
                if (!res.ok) throw new Error('non-ok')
                const data = await res.json()
                const merged = { ...DEFAULTS, ...data }
                setStats(merged)
                try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: merged, ts: Date.now() })) }
                catch (_) { }
            } catch (_) {
                // keep defaults — no visual error needed
            }
        }
        fetchStats()
    }, [])

    return stats
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
    const siteStats = useSiteStats()
    const { get, ready } = useCMS('home')

    const combinedSchema = {
        '@context': 'https://schema.org',
        '@graph': [getOrganizationSchema(), getWebsiteSchema()]
    }

    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
            <SEO
                title="Find Junkyards & Used Auto Parts Near You"
                description="Search 1,000+ verified junkyards nationwide. Find quality used auto parts by make, model, or location. Free quotes, nationwide shipping. Save up to 80% on OEM parts."
                schema={combinedSchema}
            />

            <Navbar />

            {/* ============================================================
                HERO SECTION — 2-step lead form + video background
            ============================================================ */}
            <HeroSection get={get} ready={ready} />

            <Suspense fallback={<div className="h-32 bg-slate-50 animate-pulse"></div>}>

                {/* ============================================================
                    SERVICE DISCOVERY WIDGET — "What Can We Help With?"
                    4-card JYNM-native service menu, placed BELOW hero.
                    DO NOT redesign, DO NOT change visual identity.
                ============================================================ */}
                <section className="bg-white border-b border-slate-100 py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-[1400px] mx-auto">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mb-5">
                            What Can We Help You With?
                        </p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            {/* Find Parts */}
                            <Link to="/quote" className="group flex flex-col items-center text-center gap-3 bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-[0_8px_25px_rgba(37,99,235,0.12)] transition-all duration-200">
                                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <div>
                                    <p className="text-[13px] font-black text-slate-900 group-hover:text-blue-600 transition-colors">Find Auto Parts</p>
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5 hidden sm:block">Search 6,500+ junkyards</p>
                                </div>
                            </Link>
                            {/* Sell Your Vehicle */}
                            <Link to="/sell-your-car" className="group flex flex-col items-center text-center gap-3 bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-[0_8px_25px_rgba(37,99,235,0.12)] transition-all duration-200 relative">
                                <span className="absolute -top-2 right-3 text-[9px] font-black uppercase tracking-widest bg-blue-600 text-white px-2 py-0.5 rounded-full">New</span>
                                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1 1h11l2-6H7" /></svg>
                                </div>
                                <div>
                                    <p className="text-[13px] font-black text-slate-900 group-hover:text-blue-600 transition-colors">Sell Your Vehicle</p>
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5 hidden sm:block">Submit for an offer</p>
                                </div>
                            </Link>
                            {/* VIN Decoder */}
                            <Link to="/sell-your-car" className="group flex flex-col items-center text-center gap-3 bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-[0_8px_25px_rgba(37,99,235,0.12)] transition-all duration-200">
                                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <div>
                                    <p className="text-[13px] font-black text-slate-900 group-hover:text-blue-600 transition-colors">Decode Your VIN</p>
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5 hidden sm:block">Identify your vehicle</p>
                                </div>
                            </Link>
                            {/* Find Junkyards */}
                            <Link to="/junkyards" className="group flex flex-col items-center text-center gap-3 bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-[0_8px_25px_rgba(37,99,235,0.12)] transition-all duration-200">
                                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <div>
                                    <p className="text-[13px] font-black text-slate-900 group-hover:text-blue-600 transition-colors">Find a Junkyard</p>
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5 hidden sm:block">Near your location</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* AD SLIDER 1 */}
                <AdCarousel slotGroup="carousel_1" page="home" title="Top Deals Near You" />


                {/* 5-Card Stats Block */}
                <StatsSection get={get} />

                {/* ============================================================
                    3-COLUMN FEATURE PANELS (How It Works, Vendor CTA, Why JYNM)
                ============================================================ */}
                <section className="py-16 bg-white border-t border-b border-slate-100">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid xl:grid-cols-3 gap-6">
                            <HowItWorksSection get={get} />
                            {/* 2. Vendor CTA — compact card */}
                            <VendorCTASection />
                            {/* 3. Why Choose JYNM — compact card */}
                            <WhyChooseJynmSection />
                        </div>
                    </div>
                </section>

                {/* AD SLIDER 2 */}
                <AdCarousel slotGroup="carousel_2" page="home" title="Recommended Yards" />

                {/* ============================================================
                    AD STRIP — Backend-connected ads (slot: strip_home_mid)
                ============================================================ */}
                <div className="w-full py-6 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
                    <div className="max-w-[1400px] mx-auto">
                        <DynamicAd slot="strip_home_mid" page="home" />
                    </div>
                </div>




                {/* CTA BANNER — blue gradient section with image panel */}
                <CTABanner get={get} />

                {/* AD SLIDER 5 */}
                <div className="bg-white pt-8">
                    <AdCarousel slotGroup="carousel_5" page="home" title="Promoted Partners" />
                </div>

                <Footer />
            </Suspense>
        </div>
    )
}
