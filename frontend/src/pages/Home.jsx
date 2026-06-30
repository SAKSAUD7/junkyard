import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LeadForm from '../components/LeadForm'
import PincodeSearch from '../components/PincodeSearch'
import TrustedVendors from '../components/TrustedVendors'
import DynamicAd from '../components/DynamicAd'
import MobileAdBanner from '../components/MobileAdBanner'
import FloatingActionButtons from '../components/FloatingActionButtons'
import SEO from '../components/SEO'
import ExitIntentPopup from '../components/ExitIntentPopup'
import MobileStickyBar from '../components/MobileStickyBar'

import { MotionStagger, MotionItem } from '../components/MotionSection'
import PopularParts from '../components/PopularParts'
import RealSavingsTable from '../components/RealSavingsTable'
import AutoPartsInsights from '../components/AutoPartsInsights'
import { getOrganizationSchema, getWebsiteSchema } from '../utils/structuredData'
import { useCMS } from '../hooks/useCMS'
import { api } from '../services/api'
import AdCarousel from '../components/AdCarousel'
import VendorCTASection from '../components/VendorCTASection'
import WhyChooseJynmSection from '../components/WhyChooseJynmSection'
import MakesBackgroundCarousel from '../components/MakesBackgroundCarousel'

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
    const { get } = useCMS('home')
    const leadFormRef = useRef(null)

    const scrollToLeadForm = () => {
        leadFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    // ── Hero 2-Step Inline Lead Form State ─────────────────────────────────
    // Vehicle data
    const [makes, setMakes] = useState([])
    const [models, setModels] = useState([])
    const [years, setYears] = useState([])
    const [parts, setParts] = useState([])
    const [vehicleCache, setVehicleCache] = useState(null)
    const [heroMake, setHeroMake] = useState('')
    const [heroModel, setHeroModel] = useState('')
    const [heroYear, setHeroYear] = useState('')
    const [heroPartId, setHeroPartId] = useState('')
    const [loadingMakes, setLoadingMakes] = useState(false)
    const [loadingVehicle, setLoadingVehicle] = useState(false)
    const [loadingParts, setLoadingParts] = useState(false)
    // Contact info (step 2)
    const [heroName, setHeroName] = useState('')
    const [heroEmail, setHeroEmail] = useState('')
    const [heroPhone, setHeroPhone] = useState('')
    const [heroState, setHeroState] = useState('')
    const [heroZip, setHeroZip] = useState('')
    // Flow control
    const [heroStep, setHeroStep] = useState(1)   // 1 or 2
    const [heroError, setHeroError] = useState('')
    const [heroSubmitting, setHeroSubmitting] = useState(false)
    const [heroSuccess, setHeroSuccess] = useState(false)
    // CAPTCHA
    const [captchaCode, setCaptchaCode] = useState('')
    const [captchaInput, setCaptchaInput] = useState('')
    const generateCaptcha = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
        const nums = '23456789'
        const code = [
            nums[Math.floor(Math.random() * nums.length)],
            chars[Math.floor(Math.random() * chars.length)],
            (chars + nums)[Math.floor(Math.random() * (chars.length + nums.length))],
            (chars + nums)[Math.floor(Math.random() * (chars.length + nums.length))]
        ]
        return code.sort(() => Math.random() - 0.5).join('')
    }

    const formatPhone = (val) => {
        const raw = val.replace(/\D/g, '').substring(0, 10)
        if (raw.length === 0) return ''
        if (raw.length <= 3) return raw
        if (raw.length <= 6) return `(${raw.slice(0, 3)}) ${raw.slice(3)}`
        return `(${raw.slice(0, 3)}) ${raw.slice(3, 6)}-${raw.slice(6)}`
    }

    const US_STATES = ['AK', 'AL', 'AR', 'AS', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'GU', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MP', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VI', 'VT', 'WA', 'WI', 'WV', 'WY']

    // Zip Code Dropdown State
    const [zipcodes, setZipcodes] = useState([])
    const [showZipSuggestions, setShowZipSuggestions] = useState(false)
    const [loadingZipcodes, setLoadingZipcodes] = useState(false)

    /* Load zipcodes when state changes */
    useEffect(() => {
        const fetchZipcodes = async () => {
            if (!heroState) {
                setZipcodes([]); setShowZipSuggestions(false); return
            }
            setLoadingZipcodes(true)
            try {
                const data = await api.getZipcodesByState(heroState)
                if (data && data.zipcodes) {
                    setZipcodes(data.zipcodes)
                } else {
                    setZipcodes([])
                }
            } catch (err) {
                setZipcodes([])
            } finally {
                setLoadingZipcodes(false)
            }
        }
        fetchZipcodes()
    }, [heroState])

    useEffect(() => {
        setLoadingMakes(true)
        api.getMakes().then(d => setMakes(d || [])).catch(() => { }).finally(() => setLoadingMakes(false))
    }, [])

    /* Bulk-fetch models+years when make changes */
    useEffect(() => {
        if (!heroMake) { setModels([]); setYears([]); setParts([]); setVehicleCache(null); setHeroModel(''); setHeroYear(''); setHeroPartId(''); return }
        setLoadingVehicle(true)
        api.getVehicleDataBulk(heroMake)
            .then(d => {
                setVehicleCache(d)
                setModels((d.models || []).map(m => ({ modelID: m.model_id, modelName: m.model_name, years: m.years || [], parts: m.parts || {} })))
            })
            .catch(() => setModels([]))
            .finally(() => setLoadingVehicle(false))
        setHeroModel(''); setHeroYear(''); setHeroPartId('')
    }, [heroMake])

    /* Filter years from cache when model changes */
    useEffect(() => {
        if (!heroModel) { setYears([]); setParts([]); setHeroYear(''); setHeroPartId(''); return }
        const mod = models.find(m => String(m.modelID) === String(heroModel))
        setYears(mod ? mod.years : [])
        setHeroYear(''); setHeroPartId('')
    }, [heroModel, models])

    /* Load parts when year changes */
    useEffect(() => {
        if (!heroYear || !heroModel) { setParts([]); setHeroPartId(''); return }
        // Try cache first
        const mod = models.find(m => String(m.modelID) === String(heroModel))
        if (mod?.parts?.[heroYear]?.length > 0) {
            setParts(mod.parts[heroYear].map(p => ({ partID: p.part_id, partName: p.part_name })))
            setHeroPartId('')
            return
        }
        // Fallback to API
        setLoadingParts(true)
        api.getParts({ make_id: heroMake, model_id: heroModel, year: heroYear })
            .then(d => setParts((d || []).map(p => ({ partID: p.partID || p.part_id, partName: p.partName || p.part_name }))))
            .catch(() => setParts([]))
            .finally(() => setLoadingParts(false))
        setHeroPartId('')
    }, [heroYear, heroModel, models])

    const handleHeroNext = () => {
        if (!heroMake || !heroModel || !heroYear || !heroPartId) {
            setHeroError('Please select Make, Model, Year and Part to continue.')
            return
        }
        setHeroError('')
        setCaptchaCode(generateCaptcha())
        setCaptchaInput('')
        setHeroStep(2)
    }

    const handleHeroBack = () => { setHeroStep(1); setHeroError(''); setCaptchaInput('') }

    const handleHeroSubmit = async (e) => {
        e.preventDefault()
        if (!heroName || !heroEmail || !heroPhone || !heroState || !heroZip) {
            setHeroError('Please fill in all contact fields.')
            return
        }
        if (!captchaInput.trim()) {
            setHeroError('Please enter the CAPTCHA value.')
            return
        }
        if (captchaInput.trim().toUpperCase() !== captchaCode) {
            setHeroError('Please re-enter the CAPTCHA value properly.')
            setCaptchaCode(generateCaptcha())
            setCaptchaInput('')
            return
        }
        setHeroError('')
        setHeroSubmitting(true)
        const makeObj = makes.find(m => String(m.makeID) === String(heroMake))
        const partObj = parts.find(p => String(p.partID) === String(heroPartId))
        try {
            await api.createLead({
                make: makeObj?.makeName || heroMake,
                model: heroModel,
                year: parseInt(heroYear),
                part: partObj?.partName || heroPartId,
                name: heroName, email: heroEmail, phone: heroPhone,
                state: heroState, zip: heroZip,
                lead_type: 'quality_auto_parts',
            })
            setHeroSuccess(true)
        } catch { setHeroError('Submission failed. Please try again.') }
        finally { setHeroSubmitting(false) }
    }

    const handleHeroReset = () => { setHeroSuccess(false); setHeroStep(1); setHeroMake(''); setHeroModel(''); setHeroYear(''); setHeroPartId(''); setHeroName(''); setHeroEmail(''); setHeroPhone(''); setHeroState(''); setHeroZip(''); setHeroError(''); setCaptchaCode(''); setCaptchaInput('') }

    // Auto-reset to step 1 after 10s of showing the success message
    const [successCountdown, setSuccessCountdown] = useState(10)
    useEffect(() => {
        if (!heroSuccess) { setSuccessCountdown(10); return }
        setSuccessCountdown(10)
        const interval = setInterval(() => {
            setSuccessCountdown(prev => {
                if (prev <= 1) { clearInterval(interval); handleHeroReset(); return 0 }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [heroSuccess])


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
                HERO SECTION — Video Background Layout (White Theme)
            ============================================================ */}
            <section className="relative overflow-hidden border-b border-slate-100 bg-slate-50 pt-4 lg:pt-8 pb-20 min-h-[90vh] flex flex-col justify-start">
                
                {/* Full-bleed cinematic background video - DESKTOP ONLY */}
                <div className="absolute inset-0 z-0 bg-white hidden lg:block">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover mix-blend-multiply opacity-90"
                        style={{ filter: 'brightness(1.05) contrast(1.1)' }}
                    >
                        <source src="/Video/hero-models-bg-v2.mp4" type="video/mp4" />
                    </video>
                    {/* Light Gradient Overlay for text readability (fades smoothly without hard lines) */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white via-white/80 to-transparent w-3/4" />
                </div>

                <div className="relative w-full max-w-[1400px] mx-auto z-10 flex flex-col justify-start px-4 sm:px-6 lg:px-8 flex-1 mt-2">
                    <div className="w-full lg:max-w-[70%] text-left mb-2 lg:mb-10 text-center lg:text-left">
                        {/* Trust Badge */}
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full mb-6 bg-blue-50 text-blue-600 text-[12px] lg:text-[13px] font-bold border border-blue-100/50 backdrop-blur-md">
                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            The #1 Junkyard & Auto Salvage Network in the U.S.
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-[54px] font-black text-[#1e293b] mb-4 lg:mb-5 tracking-tight leading-[1.15]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Find Verified Auto Parts <br />
                            From <span className="text-blue-600">6,500+</span> Junkyards <br />
                            In Under <span className="text-emerald-600">60</span> Seconds
                        </h1>

                        <p className="text-[15px] lg:text-[17px] text-slate-600 mb-2 lg:mb-8 max-w-[540px] font-medium leading-relaxed mx-auto lg:mx-0">
                            Compare prices from licensed salvage yards nationwide <br className="hidden sm:block" />
                            and save up to 80% compared to dealership pricing.
                        </p>
                    </div>

                    {/* MOBILE VIDEO - rendered in flow so it takes space and fits perfectly */}
                    <div className="w-[100vw] -ml-[calc(50vw-50%)] relative z-0 flex lg:hidden items-center justify-center mix-blend-multiply aspect-video mt-0 mb-2">
                        <video
                            autoPlay muted loop playsInline
                            className="w-full h-full object-cover scale-[1.1] origin-[center_70%] opacity-100"
                            style={{ filter: 'brightness(1.05) contrast(1.05)' }}
                        >
                            <source src="/Video/hero-models-bg.mp4" type="video/mp4" />
                        </video>
                    </div>

                    {/* Bottom Row Forms Container */}
                    <div className="w-full xl:max-w-[800px] lg:max-w-[750px] flex flex-col items-start mt-2 space-y-4">
                        <div ref={leadFormRef} className="w-full mb-8 relative z-20">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 relative z-10 pl-2">Fill This Form To Find Your Part</h3>
                            <div className={`bg-white/80 backdrop-blur-2xl shadow-[0_8px_40px_rgba(37,99,235,0.18),0_2px_12px_rgba(0,0,0,0.08)] border border-blue-200/60 relative z-20 overflow-visible
                                before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-b before:from-white/60 before:to-white/10 before:pointer-events-none
                                ${heroStep === 2 && !heroSuccess ? 'rounded-3xl' : 'rounded-2xl lg:rounded-full'}`}>

                                {/* SUCCESS STATE */}
                                {heroSuccess && (
                                    <div className="flex items-center gap-4 px-6 py-4">
                                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-slate-900 text-[15px]">The lead has been submitted 🎉</p>
                                        </div>
                                        <button onClick={handleHeroReset} className="text-blue-600 text-[13px] font-bold hover:underline whitespace-nowrap flex-shrink-0">New Search</button>
                                    </div>
                                )}

                                {/* STEP 1 — Vehicle + Part */}
                                {!heroSuccess && heroStep === 1 && (
                                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center p-1.5 lg:p-1.5 gap-3 lg:gap-0 w-full">
                                        {/* Step badge */}
                                        <div className="hidden lg:flex items-center gap-2 px-5 border-r border-slate-100 shrink-0">
                                            <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-[11px] font-black flex items-center justify-center">1</span>
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Vehicle</span>
                                        </div>
                                        <div className="grid grid-cols-2 lg:flex lg:flex-1 lg:flex-row gap-2 lg:gap-0">
                                            {/* Make */}
                                            <select value={heroMake} onChange={e => setHeroMake(e.target.value)}
                                                className="col-span-1 lg:flex-1 lg:min-w-0 bg-slate-50 lg:bg-transparent border border-slate-100 lg:border-y-0 lg:border-l-0 lg:border-r text-[13px] font-semibold text-slate-700 outline-none px-4 py-2.5 lg:py-2 appearance-none cursor-pointer rounded-xl lg:rounded-none">
                                                <option value="">{loadingMakes ? 'Loading...' : '🚗 Make'}</option>
                                                {makes.map(m => <option key={m.makeID} value={m.makeID}>{m.makeName}</option>)}
                                            </select>
                                            {/* Model */}
                                            <select value={heroModel} onChange={e => setHeroModel(e.target.value)} disabled={!heroMake}
                                                className="col-span-1 lg:flex-1 lg:min-w-0 bg-slate-50 lg:bg-transparent border border-slate-100 lg:border-y-0 lg:border-l-0 lg:border-r text-[13px] font-semibold text-slate-700 outline-none px-4 py-2.5 lg:py-2 appearance-none cursor-pointer disabled:opacity-40 rounded-xl lg:rounded-none">
                                                <option value="">{loadingVehicle ? 'Loading...' : 'Model'}</option>
                                                {models.map(m => <option key={m.modelID} value={m.modelID}>{m.modelName}</option>)}
                                            </select>
                                            {/* Year */}
                                            <select value={heroYear} onChange={e => setHeroYear(e.target.value)} disabled={!heroModel}
                                                className="col-span-1 lg:flex-1 lg:min-w-0 bg-slate-50 lg:bg-transparent border border-slate-100 lg:border-y-0 lg:border-l-0 lg:border-r text-[13px] font-semibold text-slate-700 outline-none px-4 py-2.5 lg:py-2 appearance-none cursor-pointer disabled:opacity-40 rounded-xl lg:rounded-none">
                                                <option value="">Year</option>
                                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                            {/* Part */}
                                            <select value={heroPartId} onChange={e => setHeroPartId(e.target.value)} disabled={!heroYear || loadingParts}
                                                className="col-span-1 lg:flex-[1.5] lg:min-w-0 bg-slate-50 lg:bg-transparent border border-slate-100 lg:border-none text-[13px] font-semibold text-slate-700 outline-none px-4 py-2.5 lg:py-2 appearance-none cursor-pointer disabled:opacity-40 rounded-xl lg:rounded-none">
                                                <option value="">{loadingParts ? 'Loading...' : '🔩 Part'}</option>
                                                {parts.map(p => <option key={p.partID} value={p.partID}>{p.partName}</option>)}
                                            </select>
                                        </div>
                                        {/* Next */}
                                        <button type="button" onClick={handleHeroNext}
                                            className="w-full lg:min-w-0 lg:w-auto bg-blue-600 text-white text-[13px] font-bold rounded-xl lg:rounded-full px-7 py-2.5 hover:bg-blue-700 transition shadow-[0_8px_20px_rgb(37,99,235,0.25)] flex items-center justify-center gap-2 group shrink-0 mt-1 lg:mt-0">
                                            Next Step
                                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </button>
                                    </div>
                                )}

                                {/* STEP 2 — Contact Info */}
                                {!heroSuccess && heroStep === 2 && (
                                    <form onSubmit={handleHeroSubmit}
                                        className="flex flex-col p-5 gap-4">
                                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                            <button type="button" onClick={handleHeroBack} className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-[13px] font-black flex items-center justify-center transition">
                                                ←
                                            </button>
                                            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Contact Details</span>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                                            <input type="text" placeholder="Your Name" value={heroName} onChange={e => setHeroName(e.target.value)} required
                                                className="bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-semibold text-slate-700 outline-none px-4 py-3 placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-colors" />
                                            <input type="email" placeholder="Email Address" value={heroEmail} onChange={e => setHeroEmail(e.target.value)} required
                                                className="bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-semibold text-slate-700 outline-none px-4 py-3 placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-colors" />
                                            <input type="tel" placeholder="Phone Number" value={heroPhone} onChange={e => setHeroPhone(formatPhone(e.target.value))} required
                                                className="bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-semibold text-slate-700 outline-none px-4 py-3 placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-colors" />
                                        </div>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                            <select value={heroState} onChange={e => { setHeroState(e.target.value); setHeroZip(''); }} required
                                                className="bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-semibold text-slate-700 outline-none px-4 py-3 appearance-none cursor-pointer focus:bg-white focus:border-blue-500 transition-colors">
                                                <option value="">State</option>
                                                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>

                                            <div className="relative">
                                                <input type="text" placeholder="ZIP Code" value={heroZip}
                                                    onChange={e => {
                                                        const val = e.target.value.replace(/\D/g, '').slice(0, 5)
                                                        setHeroZip(val)
                                                        if (zipcodes.length > 0) setShowZipSuggestions(true)
                                                    }}
                                                    onFocus={() => { if (zipcodes.length > 0) setShowZipSuggestions(true) }}
                                                    onBlur={() => setTimeout(() => setShowZipSuggestions(false), 200)}
                                                    maxLength={5} required
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-semibold text-slate-700 outline-none px-4 py-3 placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-colors" />

                                                {/* AUTO-SUGGEST DROPDOWN */}
                                                {showZipSuggestions && zipcodes.length > 0 && (
                                                    <div className="absolute top-14 left-0 z-[100] w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                                        {zipcodes.filter(z => z.postal_code.startsWith(heroZip)).map(z => (
                                                            <div key={z.postal_code}
                                                                className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-[13px] text-slate-700 border-b last:border-0 border-slate-100 transition-colors"
                                                                onClick={() => {
                                                                    setHeroZip(z.postal_code)
                                                                    setShowZipSuggestions(false)
                                                                }}>
                                                                <span className="font-bold text-slate-900">{z.postal_code}</span> - <span className="text-slate-500">{z.city_name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {loadingZipcodes && <div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}
                                            </div>

                                            {/* CAPTCHA Row */}
                                            <div className="col-span-2 flex flex-wrap sm:flex-nowrap items-center gap-3">
                                                {/* Code Display */}
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <div
                                                        className="px-4 py-3.5 rounded-xl font-black text-[18px] tracking-[0.3em] select-none bg-slate-900 text-slate-100 border border-slate-700 h-full flex items-center justify-center"
                                                        style={{ fontFamily: "'Courier New', monospace", letterSpacing: '0.35em', textDecoration: 'line-through 1px rgba(255,255,255,0.15)' }}
                                                    >
                                                        {captchaCode}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setCaptchaCode(generateCaptcha()); setCaptchaInput('') }}
                                                        className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                                                        title="Refresh CAPTCHA"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                {/* Input */}
                                                <input
                                                    type="text"
                                                    placeholder="Enter code"
                                                    value={captchaInput}
                                                    onChange={e => setCaptchaInput(e.target.value.toUpperCase().slice(0, 4))}
                                                    maxLength={4}
                                                    autoComplete="off"
                                                    required
                                                    className="flex-1 min-w-[80px] bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-700 outline-none px-4 py-3.5 placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-colors tracking-widest uppercase text-center"
                                                />
                                                {/* Status indicator */}
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${captchaInput.length === 4
                                                        ? captchaInput.toUpperCase() === captchaCode
                                                            ? 'bg-emerald-100 text-emerald-600'
                                                            : 'bg-red-100 text-red-500'
                                                        : 'bg-slate-100 text-slate-300'
                                                    }`}>
                                                    {captchaInput.length === 4 ? (
                                                        captchaInput.toUpperCase() === captchaCode
                                                            ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                            : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <button type="submit" disabled={heroSubmitting || !heroZip || heroZip.length < 5}
                                            className="w-full mt-1 py-3 bg-emerald-500 text-white text-[15px] md:text-[16px] font-extrabold rounded-xl hover:bg-emerald-600 transition shadow-[0_8px_20px_rgb(16,185,129,0.25)] flex items-center justify-center disabled:opacity-60 disabled:shadow-none disabled:cursor-not-allowed">
                                            {heroSubmitting ? 'Sending...' : '✓ Find My Part Now'}
                                        </button>
                                    </form>
                                )}

                                {/* Error message */}
                                {heroError && (
                                    <div className="px-6 pb-3 text-red-500 text-[12px] font-semibold">{heroError}</div>
                                )}
                            </div>

                            {/* Step indicator dots */}
                            {!heroSuccess && (
                                <div className="flex items-center justify-center gap-2 mt-3 pb-4">
                                    <div className={`h-1.5 rounded-full transition-all ${heroStep === 1 ? 'w-8 bg-blue-600' : 'w-4 bg-slate-200'}`} />
                                    <div className={`h-1.5 rounded-full transition-all ${heroStep === 2 ? 'w-8 bg-emerald-500' : 'w-4 bg-slate-200'}`} />
                                </div>
                            )}
                        </div>

                        {/* Pincode Search Strip beneath Lead Form */}
                        <div className="w-full max-w-3xl mt-4 animate-fade-in-up relative" style={{ animationDelay: '0.4s', zIndex: 50 }}>
                            <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-blue-100/60 relative">
                                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/50 to-white/10 pointer-events-none"></div>
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 relative z-10 pl-2">Or Search Locally By Zip Code</h3>
                                <div className="relative" style={{ zIndex: 9999 }}>
                                    <PincodeSearch />
                                </div>
                            </div>
                        </div>


                        {/* Badges Line */}
                        <div className="flex flex-wrap items-center justify-start gap-5 text-[13px] font-bold text-slate-600 mb-16 md:mb-0 mt-6 lg:mt-8">
                            <div className="flex items-center gap-2"><svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> 6,500+ Verified Vendors</div>
                            <div className="flex items-center gap-2"><svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" /><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></svg> 50 States Covered</div>
                            <div className="flex items-center gap-2"><svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A120.153 120.153 0 0121 8c0 7.143-5.26 13.91-11 16-5.74-2.09-11-8.857-11-16a120.153 120.153 0 019.7-6.954 1.5 1.5 0 011.6 0zM10 16.5c3.844-1.636 7-6.5 7-9.711A118.068 118.068 0 0010 3.32a118.068 118.068 0 00-7 3.47c0 3.211 3.156 8.075 7 9.711zM10.75 9h-1.5v3.25H6v1.5h3.25V17h1.5v-3.25H14v-1.5h-3.25V9z" clipRule="evenodd" /></svg> No Spam Guarantee</div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md border border-slate-100"><svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Secure & Reliable</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* AD SLIDER 1 */}
            <AdCarousel slotGroup="carousel_1" page="home" title="Top Deals Near You" />

            {/* 5-Card Stats Block (No Overlap) */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-30 mt-12 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white rounded-[20px] shadow-[0_15px_40px_rgb(0,0,0,0.06)] p-6 text-center border border-slate-50 transition-transform hover:-translate-y-1">
                        <h3 className="text-3xl font-black text-blue-600 mb-1 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>6,500+</h3>
                        <p className="text-[13px] font-bold text-[#1e293b]">Verified Vendors</p>
                    </div>
                    <div className="bg-white rounded-[20px] shadow-[0_15px_40px_rgb(0,0,0,0.06)] p-6 text-center border border-slate-50 transition-transform hover:-translate-y-1">
                        <h3 className="text-3xl font-black text-purple-600 mb-1 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>347,000+</h3>
                        <p className="text-[13px] font-bold text-[#1e293b]">Quality Parts</p>
                    </div>
                    <div className="bg-white rounded-[20px] shadow-[0_15px_40px_rgb(0,0,0,0.06)] p-6 text-center border border-slate-50 transition-transform hover:-translate-y-1">
                        <h3 className="text-3xl font-black text-pink-500 mb-1 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>1M+</h3>
                        <p className="text-[13px] font-bold text-[#1e293b]">Searches Completed</p>
                    </div>
                    <div className="bg-white rounded-[20px] shadow-[0_15px_40px_rgb(0,0,0,0.06)] p-6 text-center border border-slate-50 transition-transform hover:-translate-y-1">
                        <h3 className="text-3xl font-black text-orange-500 mb-1 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>50</h3>
                        <p className="text-[13px] font-bold text-[#1e293b]">States Covered</p>
                    </div>
                    <div className="bg-white rounded-[20px] shadow-[0_15px_40px_rgb(0,0,0,0.06)] p-6 text-center border border-slate-50 transition-transform hover:-translate-y-1">
                        <h3 className="text-3xl font-black text-green-500 mb-1 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>4.9/5</h3>
                        <p className="text-[13px] font-bold text-[#1e293b]">Customer Rating</p>
                    </div>
                </div>
            </div>

            {/* ============================================================
                3-COLUMN FEATURE PANELS (How It Works, Vendor CTA, Why JYNM)
            ============================================================ */}
            <section className="py-16 bg-white border-t border-b border-slate-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid xl:grid-cols-3 gap-6">

                        {/* 1. How It Works */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_4px_25px_rgb(0,0,0,0.03)] text-center h-full flex flex-col">
                            <h2 className="text-xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>How It <span className="text-blue-600">Works</span></h2>
                            <p className="text-[13px] text-slate-500 font-medium mb-8">Simple steps to get the parts you need</p>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                                {[
                                    { title: 'Search', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>, desc: 'Tell us what you need' },
                                    { title: 'Compare', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>, desc: 'Get quotes from verified junkyards' },
                                    { title: 'Choose', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" /></svg>, desc: 'Pick the best price and quality' },
                                    { title: 'Save', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>, desc: 'Save up to 80% instantly' }
                                ].map(st => (
                                    <div key={st.title} className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col items-center justify-center text-center shadow-sm">
                                        <div className="mb-3 text-blue-600">{st.icon}</div>
                                        <p className="text-[14px] font-bold text-slate-900 mb-1">{st.title}</p>
                                        <p className="text-[11px] text-slate-500 leading-tight">{st.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

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
                AD STRIP — Backend-connected ads (slot: home_hero_below)
            ============================================================ */}
            <div className="w-full py-6 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
                <div className="max-w-[1400px] mx-auto">
                    <DynamicAd slot="home_hero_below" page="home" />
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

            {/* CTA BANNER — with image panel */}
            <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #1e40af 100%)' }}>
                <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 items-stretch">
                    {/* Left — text content */}
                    <div className="relative py-20 md:py-24 px-8 md:px-16 flex flex-col justify-center" style={{ zIndex: 1 }}>
                        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', transform: 'translate(-50%,-50%)' }} />
                        <h2
                            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#ffffff', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1rem' }}
                            dangerouslySetInnerHTML={{ __html: get('cta_banner', 'heading', 'Ready to Find Your <span style="background: linear-gradient(135deg, #93c5fd, #bfdbfe); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Perfect Part?</span>') }}
                        />
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '460px', marginBottom: '2rem' }}>
                            {get('cta_banner', 'subheading', 'Join thousands of mechanics and car owners who save hundreds by using JYNM to source quality used auto parts across all 50 states.')}
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                            <Link to="/quote" id="cta-get-quote-btn" className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold bg-white text-blue-600 transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/10">
                                {get('cta_banner', 'button_text', 'Get Free Quote Now')}
                            </Link>
                            <Link to="/vendors" id="cta-browse-btn" className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-white transition-all duration-300 hover:bg-white/10 border border-white/20">
                                Browse All Vendors
                            </Link>
                        </div>
                        {/* Trust row */}
                        <div className="flex flex-wrap gap-6 mt-10 text-white/60 text-sm font-semibold">
                            <span>✓ 6,500+ Trusted Yards</span>
                            <span>✓ 50 States</span>
                            <span>✓ Free to Use</span>
                        </div>
                    </div>
                    {/* Right — image */}
                    <div className="hidden lg:block relative min-h-[380px]">
                        <img
                            src="/heroes/junkyard-aerial.png"
                            alt="Aerial view of a large auto salvage junkyard"
                            className="absolute inset-0 w-full h-full object-cover opacity-70"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent" />
                        <div className="absolute bottom-8 left-8 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                            <p className="text-white font-black text-2xl">1M+</p>
                            <p className="text-white/80 text-sm font-medium">Searches completed on JYNM</p>
                        </div>
                    </div>
                </div>
            </section>



            {/* Mobile Ad Banner — renders all ads as swipe carousel (MobileAdBanner logic unchanged) */}
            <MobileAdBanner page="home" />

            {/* Floating Action Buttons — WhatsApp, Call, AI Chat */}
            <FloatingActionButtons />

            {/* Conversion Engine Components */}
            <MobileStickyBar />


            {/* AD SLIDER 5 */}
            <div className="bg-white pt-8">
                <AdCarousel slotGroup="carousel_5" page="home" title="Promoted Partners" />
            </div>

            <Footer />
        </div>
    )
}
