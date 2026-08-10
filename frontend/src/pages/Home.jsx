import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import TrustedVendors from '../components/TrustedVendors'
import DynamicAd from '../components/DynamicAd'
import MobileAdBanner from '../components/MobileAdBanner'
import SEO from '../components/SEO'
import { getOrganizationSchema, getWebsiteSchema } from '../utils/structuredData'
import { useCMS } from '../hooks/useCMS'
import AdCarousel from '../components/AdCarousel'
import VendorCTASection from '../components/VendorCTASection'
import WhyChooseJynmSection from '../components/WhyChooseJynmSection'
import HeroSection from '../components/home/HeroSection'
import CTABanner from '../components/home/CTABanner'
import StatsSection from '../components/home/StatsSection'
import HowItWorksSection from '../components/home/HowItWorksSection'

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

            {/* ============================================================
                TRUSTED VENDORS — self-contained section
            ============================================================ */}
            <TrustedVendors />

            {/* AD SLIDER 3 */}
            <AdCarousel slotGroup="carousel_3" page="home" title="Featured Sellers" />

            {/* AD SLIDER 4 */}
            <AdCarousel slotGroup="carousel_4" page="home" title="Premium Inventory" />

            {/* CTA BANNER — blue gradient section with image panel */}
            <CTABanner get={get} />

            {/* Mobile Ad Banner — all ads as swipe carousel */}
            {/* <MobileAdBanner page="home" /> */}

            {/* Conversion Engine Components */}

            {/* AD SLIDER 5 */}
            <div className="bg-white pt-8">
                <AdCarousel slotGroup="carousel_5" page="home" title="Promoted Partners" />
            </div>

            <Footer />
        </div>
    )
}
