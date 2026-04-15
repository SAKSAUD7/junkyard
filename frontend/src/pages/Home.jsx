import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LeadForm from '../components/LeadForm'
import PincodeSearch from '../components/PincodeSearch'
import TrustedVendors from '../components/TrustedVendors'
import DynamicAd from '../components/DynamicAd'
import MobileAdBanner from '../components/MobileAdBanner'
import SEO from '../components/SEO'
import { getOrganizationSchema, getWebsiteSchema } from '../utils/structuredData'

const API_BASE = import.meta.env.VITE_API_URL || ''

// ─── useSiteStats ────────────────────────────────────────────────────────────
// Fetches live site statistics from the public /api/site-stats/ endpoint.
// Results are cached in sessionStorage for 5 minutes so the hero and stats
// strip stay consistent for the duration of a user's visit.
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
        } catch (_) {}
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
            } catch (_) {}

            try {
                const res = await fetch(`${API_BASE}/api/site-stats/`)
                if (!res.ok) throw new Error('non-ok')
                const data = await res.json()
                const merged = { ...DEFAULTS, ...data }
                setStats(merged)
                try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: merged, ts: Date.now() })) }
                catch (_) {}
            } catch (_) {
                // keep defaults — no visual error needed
            }
        }
        fetchStats()
    }, [])

    return stats
}
// ─────────────────────────────────────────────────────────────────────────────


// --- ANIMATED COUNTER ---
function AnimatedCounter({ target, suffix = '', prefix = '' }) {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const started = useRef(false)
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true
                const steps = 60
                const increment = target / steps
                let current = 0
                const timer = setInterval(() => {
                    current += increment
                    if (current >= target) { setCount(target); clearInterval(timer) }
                    else setCount(Math.floor(current))
                }, 2000 / steps)
            }
        }, { threshold: 0.5 })
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [target])
    return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}


// --- FLOATING PARTICLE CANVAS (lightweight) ---
function ParticleField() {
    const canvasRef = useRef(null)
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        let animId
        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
        resize()
        window.addEventListener('resize', resize)
        const particles = Array.from({ length: 60 }, () => ({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3, vy: -Math.random() * 0.4 - 0.05,
            r: Math.random() * 1.2 + 0.3,
            color: Math.random() > 0.65 ? 'var(--neon-orange)' : 'var(--neon-blue)',
            alpha: Math.random() * 0.5 + 0.1
        }))
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy
                if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width }
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0')
                ctx.fill()
            })
            animId = requestAnimationFrame(draw)
        }
        draw()
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId) }
    }, [])
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }} />
}

export default function Home() {
    const navigate = useNavigate()
    const siteStats = useSiteStats()

    const combinedSchema = {
        '@context': 'https://schema.org',
        '@graph': [getOrganizationSchema(), getWebsiteSchema()]
    }

    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
            <SEO
                title="Find Auto Salvage Yards & Used Auto Parts Near You"
                description="Search 1,000+ verified junkyards nationwide. Find quality used auto parts by make, model, or location. Free quotes, nationwide shipping. Save up to 80% on OEM parts."
                schema={combinedSchema}
            />

            <Navbar />

            {/* ============================================================
                HERO SECTION — Cinematic depth with real car imagery
            ============================================================ */}
            <section
                className="hero-depth"
                style={{
                    background: 'var(--bg-base)',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* PRIMARY — stacked crushed cars at night, Ken Burns zoom */}
                <div
                    className="hero-bg-primary"
                    style={{ backgroundImage: 'url(/heroes/stacked-cars.png)', opacity: 0.55 }}
                />
                {/* DEPTH — aerial junkyard, blurred offset layer */}
                <div
                    className="hero-bg-depth"
                    style={{ backgroundImage: 'url(/heroes/aerial-night.png)' }}
                />
                {/* Dark gradient overlay */}
                <div className="hero-overlay-base" />
                {/* Vignette */}
                <div className="hero-vignette" />
                {/* Ambient glows */}
                <div className="hero-glow-teal" />
                <div className="hero-glow-orange" />
                {/* Grid texture */}
                <div className="hero-grid" />
                {/* Moving scanline */}
                <div className="hero-scanline" />
                {/* Fade to page at bottom */}
                <div className="hero-fade-bottom" />
                {/* Particles still active */}
                <ParticleField />

                {/* THREE COLUMN LAYOUT: Left Ad | Content | Right Ad */}
                <div className="hero-content flex flex-1 w-full max-w-[1400px] mx-auto" style={{ paddingTop: '2rem', paddingBottom: '2rem', paddingLeft: '1rem', paddingRight: '1rem' }}>

                    {/* LEFT SIDEBAR AD — desktop only */}
                    <div className="hidden xl:flex flex-col items-start pt-12 pr-6 w-[220px] flex-shrink-0">
                        <DynamicAd slot="left_sidebar_ad" page="home" />
                    </div>

                    {/* CENTER HERO CONTENT */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-2 sm:px-6">

                        {/* Brand lockup */}
                        <div className="mb-6 animate-fade-in">
                            <div
                                className="inline-flex flex-col items-center px-8 py-4 rounded-2xl"
                                style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(16px)'
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                                        fontWeight: 900,
                                        color: '#ffffff',
                                        fontFamily: "'Outfit', sans-serif",
                                        letterSpacing: '-0.04em',
                                        lineHeight: 1,
                                        textShadow: '0 2px 20px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    JYNM
                                </span>
                                <span
                                    style={{
                                        fontSize: '0.7rem',
                                        letterSpacing: '0.25em',
                                        color: 'rgba(147,197,253,0.9)',
                                        fontFamily: "'JetBrains Mono', monospace",
                                        textTransform: 'uppercase',
                                        marginTop: '4px'
                                    }}
                                >
                                    JUNKYARDSNEARME.COM
                                </span>
                            </div>
                        </div>

                        {/* Main Headline */}
                        <h1
                            className="animate-fade-in-up"
                            style={{
                                fontSize: 'clamp(1.8rem, 5vw, 3.4rem)',
                                fontWeight: 900,
                                fontFamily: "'Outfit', sans-serif",
                                letterSpacing: '-0.02em',
                                lineHeight: 1.12,
                                marginBottom: '1rem',
                                color: '#ffffff',
                                textShadow: '0 2px 20px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.4)'
                            }}
                        >
                            FIND THE{' '}
                            <span className="text-blue-400">JUNKYARD</span>
                            <br />
                            AUTO PARTS YOU NEED —
                            <br />
                            <span style={{ color: '#93c5fd' }}>SEARCH IN SECONDS.</span>
                        </h1>

                        {/* Subheadline */}
                        <p
                            className="animate-fade-in-up delay-100"
                            style={{
                                fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
                                color: 'rgba(255,255,255,0.85)',
                                marginBottom: '2.5rem',
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 500,
                                textShadow: '0 1px 6px rgba(0,0,0,0.5)'
                            }}
                        >
                            Locate quality used auto parts from{' '}
                            <span style={{ color: '#fb923c', fontWeight: 800 }}>verified junkyards</span>{' '}near you!
                        </p>

                        {/* ZIP Code Search Box */}
                        <div
                            className="w-full max-w-2xl animate-fade-in-up delay-200 mb-6"
                            style={{
                                background: 'rgba(255,255,255,0.12)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.25)',
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                boxShadow: '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)'
                            }}
                        >
                            <p style={{
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '0.75rem',
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                marginBottom: '0.75rem',
                                fontFamily: "'JetBrains Mono', monospace"
                            }}>
                                Search by ZIP Code · Find junkyards near you instantly
                            </p>
                            <PincodeSearch />
                        </div>

                        {/* Vehicle Search / Lead Form */}
                        <div className="w-full max-w-lg mb-8 animate-fade-in-up delay-300">
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: "'JetBrains Mono', monospace", textAlign: 'center', fontWeight: '600' }}>
                                Or search by vehicle details
                            </p>
                            <LeadForm layout="horizontal" mode="quality_auto_parts" enableSteps={true} />
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-4 mt-8 animate-fade-in-up delay-500">
                            <Link to="/vendors" id="hero-browse-vendors-btn" className="btn-primary">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Browse All Vendors
                            </Link>
                            <Link to="/how-it-works" id="hero-how-it-works-btn" className="btn-neon">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                How It Works
                            </Link>
                        </div>

                        {/* Inline trust strip — below CTAs */}
                        <div className="flex flex-wrap items-center justify-center gap-5 mt-8 animate-fade-in-up delay-700">
                            {[
                                { icon: '✓', text: `${siteStats.vendors_count.toLocaleString()}+ Verified Yards` },
                                { icon: '🛡', text: 'No Spam Guarantee' },
                                { icon: '⚡', text: 'Instant Quotes' },
                                { icon: '💰', text: `Up to ${siteStats.savings_percent}% Savings` },
                            ].map((item, i) => (
                                <span key={i} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.75)', letterSpacing: '0.03em' }}>
                                    <span>{item.icon}</span> {item.text}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR AD — desktop only */}
                    <div className="hidden xl:flex flex-col items-end pt-12 pl-6 w-[220px] flex-shrink-0">
                        <DynamicAd slot="right_sidebar_ad" page="home" />
                    </div>
                </div>

            </section>

            {/* ============================================================
                STATS STRIP
            ============================================================ */}
            <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid rgba(37,99,235,0.08)', borderBottom: '1px solid rgba(37,99,235,0.08)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {[
                            { value: siteStats.vendors_count, suffix: '+', label: 'Verified Junkyards', color: 'var(--neon-blue)' },
                            { value: siteStats.parts_listed, suffix: '+', label: 'Parts Listed', color: 'var(--neon-orange)' },
                            { value: siteStats.states_covered, suffix: ' States', label: 'Coverage', color: 'var(--neon-blue)' },
                            { value: siteStats.savings_percent, suffix: '%', prefix: 'Up to ', label: 'Savings vs. Dealer', color: 'var(--neon-orange)' }
                        ].map((s, i) => (
                            <div key={i} className="scroll-fade-in text-center" style={{ animationDelay: `${i * 80}ms` }}>
                                <div
                                    className="py-6 px-3 rounded-xl"
                                    style={{
                                        background: '#ffffff',
                                        border: `1px solid rgba(${s.color === 'var(--neon-blue)' ? '37,99,235' : '234,88,12'},0.15)`,
                                        boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <div
                                        className="text-3xl md:text-4xl font-black mb-1"
                                        style={{ color: s.color, fontFamily: "'Outfit', sans-serif" }}
                                    >
                                        <AnimatedCounter target={s.value} suffix={s.suffix} prefix={s.prefix} />
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================
                HOW IT WORKS
            ============================================================ */}

            {/* ── TRUST PILLARS ── */}
            <section className="py-16 md:py-20" style={{ background: '#f8fafc' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 scroll-fade-in">
                        <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Why Trust JYNM</p>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                            Built on <span className="text-blue-600">Reliability</span> & Transparency
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            {
                                icon: '🔒',
                                title: 'Verified Network',
                                desc: 'Every junkyard is manually vetted. We only list licensed, legitimate salvage yards you can trust.',
                                accent: '#2563eb',
                            },
                            {
                                icon: '⚡',
                                title: 'Instant Quotes',
                                desc: 'One request reaches multiple vendors simultaneously. Get competitive quotes without the phone tag.',
                                accent: '#f97316',
                            },
                            {
                                icon: '🛡',
                                title: 'Zero Spam Promise',
                                desc: 'We never sell your data. Your contact info goes directly and only to the junkyard you choose.',
                                accent: '#2563eb',
                            },
                            {
                                icon: '💰',
                                title: 'Best Prices Guaranteed',
                                desc: 'Compare hundreds of vendors in seconds. Save up to 80% vs. dealer pricing with real-time availability.',
                                accent: '#f97316',
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="scroll-fade-in bg-white rounded-2xl p-6 border border-slate-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-100"
                                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)', animationDelay: `${i * 80}ms` }}
                            >
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background: `${item.accent}0f`, border: `1px solid ${item.accent}22` }}>
                                    {item.icon}
                                </div>
                                <h3 className="font-black text-slate-900 mb-2 text-base" style={{ fontFamily: "'Outfit', sans-serif" }}>{item.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================
                HOW IT WORKS (original section continues below)
            ============================================================ */}

            <section className="py-20 md:py-28" style={{ background: 'var(--bg-base)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14 scroll-fade-in">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ background: 'rgba(234,88,12,0.08)', border: '1px solid rgba(234,88,12,0.2)' }}>
                            <span style={{ color: 'var(--neon-orange)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>Process</span>
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
                            How It <span style={{ color: '#2563eb' }}>Works</span>
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7, fontSize: '0.9rem' }}>
                            Three simple steps to find the exact used auto parts you need at the best price.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '01', color: 'var(--neon-blue)',
                                icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
                                title: 'Search & Locate',
                                desc: 'Enter your ZIP code or vehicle details. Our system instantly finds verified junkyards near you with the parts you need.'
                            },
                            {
                                step: '02', color: 'var(--neon-orange)',
                                icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
                                title: 'Get Free Quotes',
                                desc: 'Submit a single request to multiple vendors simultaneously. Compare prices, availability, and shipping options in real time.'
                            },
                            {
                                step: '03', color: 'var(--neon-blue)',
                                icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
                                title: 'Order & Save',
                                desc: 'Choose the best deal, order your parts, and save up to 80% compared to dealer prices. Fast shipping nationwide.'
                            }
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="scroll-fade-in p-8 rounded-xl bg-white border border-slate-100 shadow-sm transition-all duration-300"
                                style={{ animationDelay: `${i * 120}ms` }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-4px)'
                                    e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.08), 0 0 0 1px rgba(${item.color === 'var(--neon-blue)' ? '37,99,235' : '234,88,12'},0.15)`
                                    e.currentTarget.style.borderColor = `rgba(${item.color === 'var(--neon-blue)' ? '37,99,235' : '234,88,12'},0.2)`
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'none'
                                    e.currentTarget.style.boxShadow = '0 1px 8px rgba(0,0,0,0.04)'
                                    e.currentTarget.style.borderColor = '#f1f5f9'
                                }}
                            >
                                <div className="flex items-start gap-4 mb-5">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}12`, border: `1px solid ${item.color}28`, color: item.color }}>
                                        {item.icon}
                                    </div>
                                    <div className="text-5xl font-black" style={{ color: `${item.color}12`, fontFamily: "'Outfit', sans-serif" }}>{item.step}</div>
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif", marginBottom: '0.6rem' }}>{item.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.875rem' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================
                TRUSTED VENDORS (dynamic from API — no hardcoded content)
            ============================================================ */}
            <section style={{ background: 'var(--bg-surface)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center mb-12 scroll-fade-in">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
                            <span style={{ color: 'var(--neon-blue)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>Top Vendors</span>
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                            Trusted{' '}
                            <span style={{ color: '#2563eb' }}>
                                Salvage Yards
                            </span>
                        </h2>
                    </div>
                    <TrustedVendors />
                </div>
            </section>

            {/* ============================================================
                3D ENGINE SHOWCASE + WHY CHOOSE US (side by side on desktop)
            ============================================================ */}
            <section className="py-20 md:py-28" style={{ background: 'var(--bg-base)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        {/* 3D Engine Visual */}
                        <div className="scroll-fade-in flex items-center justify-center order-2 lg:order-1">
                            <div className="relative">
                                <div
                                    className="absolute -inset-8 rounded-full pointer-events-none"
                                    style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)' }}
                                />
                                <img
                                    src="/engine-3d.png"
                                    alt="Premium auto parts"
                                    className="relative w-full max-w-md mx-auto"
                                    style={{
                                        mixBlendMode: 'screen',
                                        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.8)) contrast(1.1) brightness(1.2)',
                                        animation: 'float 5s ease-in-out infinite'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Why Choose Us */}
                        <div className="order-1 lg:order-2">
                            <div className="scroll-fade-in mb-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ background: 'rgba(234,88,12,0.08)', border: '1px solid rgba(234,88,12,0.2)' }}>
                                    <span style={{ color: 'var(--neon-orange)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>Advantages</span>
                                </div>
                                <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 900, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
                                    Why Choose{' '}
                                    <span style={{ color: '#2563eb' }}>
                                        JYNM
                                    </span>
                                </h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                                    The smartest way to source quality used auto parts from trusted salvage yards nationwide.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { icon: '✔', title: 'Verified Vendors', desc: 'Every junkyard is manually verified. You deal with legitimate, licensed salvage yards only.', color: 'var(--neon-blue)' },
                                    { icon: '⚡', title: 'Instant Quotes', desc: 'Get real-time quotes from multiple vendors simultaneously. No phone tag, no delays.', color: 'var(--neon-orange)' },
                                    { icon: '🛡', title: 'Quality Guaranteed', desc: 'Parts come with grading info, warranty details, and clear condition descriptions.', color: 'var(--neon-blue)' },
                                    { icon: '💰', title: 'Best Prices', desc: 'Compare prices across hundreds of vendors to always get the most value for your money.', color: 'var(--neon-orange)' },
                                ].map((f, i) => (
                                    <div
                                        key={i}
                                        className="scroll-fade-in flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm transition-all duration-300"
                                        style={{ animationDelay: `${i * 100}ms` }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(${f.color === 'var(--neon-blue)' ? '37,99,235' : '234,88,12'},0.2)`; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)' }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)' }}
                                    >
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ background: `rgba(${f.color === 'var(--neon-blue)' ? '37,99,235' : '234,88,12'},0.08)`, border: `1px solid rgba(${f.color === 'var(--neon-blue)' ? '37,99,235' : '234,88,12'},0.18)` }}>
                                            {f.icon}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif", marginBottom: '0.2rem' }}>{f.title}</h3>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', lineHeight: 1.6 }}>{f.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
                INLINE AD STRIP (horizontal banner between sections)
            ============================================================ */}
            <div className="w-full py-6 px-4" style={{ background: 'var(--bg-surface)' }}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center gap-6 overflow-x-auto">
                        <DynamicAd slot="home_inline_ad" page="home" templateOverride="compact" />
                    </div>
                </div>
            </div>

            {/* CTA BANNER */}
            <section
                className="relative py-20 md:py-24 overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #1e40af 100%)',
                    borderTop: '1px solid rgba(37,99,235,0.3)',
                    borderBottom: '1px solid rgba(37,99,235,0.3)'
                }}
            >
                <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', transform: 'translate(-50%,-50%)' }} />
                <div className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.15) 0%, transparent 70%)', transform: 'translate(50%,50%)' }} />
                <div className="relative max-w-4xl mx-auto px-4 text-center" style={{ zIndex: 1 }}>
                    <h2
                        className="scroll-fade-in"
                        style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, color: '#ffffff', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1rem' }}
                    >
                        Ready to Find Your{' '}
                        <span style={{ background: 'linear-gradient(135deg, #93c5fd, #bfdbfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            Perfect Part?
                        </span>
                    </h2>
                    <p className="scroll-fade-in" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 2.5rem' }}>
                        Join thousands of mechanics and car owners who save hundreds by using JYNM to source quality used auto parts across all 50 states.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 scroll-fade-in">
                        <Link to="/quote" id="cta-get-quote-btn" className="btn-orange">Get Free Quote Now</Link>
                        <Link to="/vendors" id="cta-browse-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: 'white', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '0.625rem', textDecoration: 'none', transition: 'all 0.3s ease', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Browse All Vendors</Link>
                    </div>
                </div>
            </section>



            {/* ADD YOUR YARD CTA */}

            <section className="relative py-24 md:py-32 overflow-hidden shadow-2xl" style={{ margin: '4rem 1rem', borderRadius: '2rem', background: '#0a0f18', border: '1px solid rgba(234,88,12,0.2)' }}>
                {/* Visual Depth / Ambience */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-[150px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none transform -translate-x-1/3 translate-y-1/3" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none mix-blend-overlay" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        <div className="text-left scroll-fade-in pr-0 lg:pr-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(234,88,12,0.1)', border: '1px solid rgba(234,88,12,0.25)', boxShadow: '0 0 20px rgba(234,88,12,0.15)' }}>
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_#ea580c]" />
                                <span style={{ color: '#fed7aa', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Vendor Network Hub</span>
                            </div>
                            
                            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#ffffff', fontWeight: 900, fontFamily: "'Outfit', sans-serif", lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                                Transform Your Salvage{' '}
                                <span style={{ display: 'block', background: 'linear-gradient(135deg, #ea580c, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    Business Today
                                </span>
                            </h2>
                            
                            <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '500px', marginBottom: '2.5rem' }}>
                                Millions of buyers are searching for auto parts immediately. Partner with <strong>JYNM</strong> to dominate your local market, digitize your inventory, and receive high-converting leads on autopilot.
                            </p>
                            
                            <div className="flex flex-wrap gap-4">
                                <Link 
                                    to="/add-a-yard" 
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 hover:-translate-y-1"
                                    style={{ background: 'linear-gradient(135deg, #ea580c, #c2410c)', boxShadow: '0 10px 25px rgba(234,88,12,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    Add Your Junkyard
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </Link>
                                <Link 
                                    to="/vendor/login" 
                                    className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 hover:bg-white/10"
                                    style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}
                                >
                                    Vendor Login
                                </Link>
                            </div>
                        </div>

                        {/* 3D Visual Asset */}
                        <div className="hidden lg:flex items-center justify-center relative">
                            {/* Ambient base */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-blue-500/20 rounded-full animate-spin-slow pointer-events-none" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-orange-500/10 rounded-full animate-spin-slow-reverse pointer-events-none" />
                            
                            {/* We use the Search Lens or Gear Core to emphasize technology and partnership */}
                            <img 
                                src="/3d/gear-core.png" 
                                alt="Advanced Vendor Tech" 
                                className="relative z-10 w-full max-w-[480px] h-auto pointer-events-none"
                                style={{
                                    mixBlendMode: 'screen',
                                    animation: 'float 6s ease-in-out infinite',
                                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.9)) contrast(1.1) brightness(1.2)'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile Ad Banner — renders all ads as swipe carousel (MobileAdBanner logic unchanged) */}
            <MobileAdBanner page="home" />

            <Footer />
        </div>
    )
}
