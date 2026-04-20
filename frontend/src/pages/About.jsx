import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { getOrganizationSchema } from '../utils/structuredData'
import { api } from '../services/api'
import Carousel3D from '../components/Carousel3D'
import { useCMS } from '../hooks/useCMS'

export default function About() {
    const { get } = useCMS('about')
    const [vendorCount, setVendorCount] = useState(0)
    const [stateCount, setStateCount] = useState(0)
    const [loading, setLoading] = useState(true)

    // Fetch real counts from backend
    useEffect(() => {
        const fetchCounts = async () => {
            try {
                // We use Promise.allSettled to gracefully handle 500 errors from the backend.
                const [vendorsResult, statesResult] = await Promise.allSettled([
                    api.getVendors({ page_size: 1 }),
                    api.getStateCounts()
                ])

                if (vendorsResult.status === 'fulfilled') {
                    const totalVendors = vendorsResult.value.count !== undefined
                        ? vendorsResult.value.count
                        : (Array.isArray(vendorsResult.value) ? vendorsResult.value.length : 1200);
                    setVendorCount(totalVendors)
                } else {
                    setVendorCount(1200) // Fallback due to API error
                }

                if (statesResult.status === 'fulfilled') {
                    const activeStatesCount = Object.keys(statesResult.value).length || 50
                    setStateCount(activeStatesCount)
                } else {
                    setStateCount(50) // Fallback due to API error
                }

                setLoading(false)
            } catch (error) {
                console.error('Error fetching counts:', error)
                // Fallback to default values if whole block fails
                setVendorCount(1200)
                setStateCount(50)
                setLoading(false)
            }
        }

        fetchCounts()
    }, [])

    const stats = [
        { label: get('stats', 'label_1', 'Active Junkyards'), value: loading ? '...' : vendorCount.toLocaleString() + '+' },
        { label: get('stats', 'label_2', 'States Covered'), value: loading ? '...' : stateCount + '+' },
        { label: get('stats', 'label_3', 'Daily Searches'), value: get('stats', 'value_3', '50k+') },
        { label: get('stats', 'label_4', 'Parts Found'), value: get('stats', 'value_4', '1M+') },
    ]

    const features = [
        {
            title: get('features', 'feature1_title', 'Nationwide Network'),
            description: get('features', 'feature1_desc', 'Determine availability across our massive network of over 1,000 verified junkyards in all 50 states.'),
            icon: (
                <svg className="w-6 h-6 text-[var(--neon-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: get('features', 'feature2_title', 'Smart Search'),
            description: get('features', 'feature2_desc', 'Instantly filter by vehicle make, model, year, and part type to find exactly what you need in seconds.'),
            icon: (
                <svg className="w-6 h-6 text-[var(--neon-orange)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            )
        },
        {
            title: get('features', 'feature3_title', 'Direct Contact'),
            description: get('features', 'feature3_desc', 'Get direct access to junkyard phone numbers, addresses, and websites. No middlemen, no hidden fees.'),
            icon: (
                <svg className="w-6 h-6 text-[var(--neon-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            )
        }
    ]

    const organizationSchema = getOrganizationSchema();

    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <SEO
                title={get('meta', 'title', 'About Us - Junkyards Near Me | The Future of Auto Salvage')}
                description={get('meta', 'description', 'Learn about Junkyards Near Me - connecting mechanics, enthusiasts, and car owners with over 1,000 verified junkyards across all 50 states. Save up to 70% on quality used auto parts.')}
                canonicalUrl="/about"
                structuredData={[organizationSchema]}
            />
            <Navbar />

            {/* Hero Section - Cinematic Depth with Car Imagery */}
            <div className="hero-depth pt-24 pb-16 flex flex-col justify-center items-center" style={{ minHeight: '60vh', background: 'var(--bg-base)' }}>
                {/* PRIMARY — CMS-controlled hero image */}
                <div className="hero-bg-primary" style={{ backgroundImage: `url('${get('hero', 'bg_image', '/heroes/aerial-night.png')}')`, opacity: 0.6 }} />
                {/* DEPTH — stacked crushed cars, blurred */}
                <div className="hero-bg-depth" style={{ backgroundImage: "url('/heroes/stacked-cars.png')" }} />
                <div className="hero-overlay-base" />
                <div className="hero-vignette" />
                <div className="hero-glow-teal" />
                <div className="hero-glow-orange" />
                <div className="hero-grid" />
                <div className="hero-scanline" />
                <div className="hero-fade-bottom" />

                <div className="hero-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-block mb-4 px-4 py-1.5 rounded-full" style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.4)' }}>
                            <span className="text-blue-300 font-bold text-xs tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                About Us
                            </span>
                        </div>
                        <h1 className="font-black mb-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#ffffff', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', lineHeight: 1.1, textShadow: '0 2px 15px rgba(0,0,0,0.5)' }}>
                            {get('hero', 'heading', 'The Future of')} <br />
                            <span style={{ color: '#60a5fa' }}>
                                {get('hero', 'heading_accent', 'Auto Salvage')}
                            </span>
                        </h1>
                        <p className="leading-relaxed mb-8 px-2" style={{ color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', maxWidth: '600px', margin: '0 auto' }}>
                            {get('hero', 'subheading', "We're revolutionizing how you find used auto parts. Connecting mechanics, enthusiasts, and car owners with the nation's most extensive inventory.")}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                        {stats.map((stat, index) => (
                            <div key={index} className="p-6 rounded-2xl text-center group hover:-translate-y-1 transition-all duration-300" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)' }}>
                                <div className="text-3xl md:text-4xl font-black mb-2 transition-transform duration-300 group-hover:scale-110" style={{ color: index % 2 === 0 ? '#60a5fa' : '#fb923c', fontFamily: "'Outfit', sans-serif" }}>
                                    {stat.value}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mission Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="font-bold" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                            {get('mission', 'title', 'Our Mission is')} <span style={{ color: '#2563eb' }}>{get('mission', 'title_accent', 'Simple')}</span>
                        </h2>
                        <div className="space-y-6 leading-relaxed text-lg" style={{ color: 'var(--text-secondary)' }}>
                            <p>
                                {get('mission', 'para_1', "Finding quality used auto parts shouldn't be a hassle. We built Junkyards Near Me to bridge the gap between organized inventory and the people who need it most.")}
                            </p>
                            <p>
                                {get('mission', 'para_2', "Whether you're restoring a classic, fixing a daily driver, or running a repair shop, our platform gives you instant access to millions of parts across the country.")}
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl" style={{ background: 'rgba(234,88,12,0.05)', border: '1px solid rgba(234,88,12,0.2)' }}>
                            <h3 className="text-xl font-bold mb-5 flex items-center gap-3" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                                <span className="text-2xl" style={{ color: 'var(--neon-orange)' }}>⚡</span> Why Choose Used?
                            </h3>
                            <ul className="space-y-4">
                                {[
                                    'Save up to 70% compared to new parts',
                                    'Environmentally friendly auto recycling',
                                    'Find rare and discontinued items',
                                    'OEM quality fit and finish'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', color: 'var(--neon-blue)' }}>
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at center, rgba(37,99,235,0.08) 0%, transparent 60%)', filter: 'blur(40px)', zIndex: 0 }}></div>
                        <div className="grid gap-6 relative z-10 w-full max-w-lg mx-auto">
                            {features.map((feature, index) => (
                                <div key={index} className="p-6 rounded-2xl transition-colors duration-300 group" style={{ background: '#ffffff', border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                                    <div className="flex items-start gap-5">
                                        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110" style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.2)' }}>
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>{feature.title}</h3>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{feature.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3D Showcase Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Premium <span className="text-blue-600">Assets</span>
                    </h2>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                        Take a look at the high-fidelity parts you can expect to find across our verified network.
                    </p>
                </div>
                
                <Carousel3D 
                    items={[
                        {
                            image: '/3d/engine_core.png',
                            title: 'Futuristic Engine Cores',
                            description: 'Find premium, high-performance engine blocks sourced straight from verified suppliers.',
                            tag: 'Power Unit'
                        },
                        {
                            image: '/3d/transmission.png',
                            title: 'Intricate Transmissions',
                            description: 'From classic to modern EV transmissions, we connect you with the exact parts you need.',
                            tag: 'Drivetrain'
                        },
                        {
                            image: '/3d/suspension.png',
                            title: 'Complete Suspension Systems',
                            description: 'Ensure a smooth ride with thoroughly inspected suspension components and coilovers.',
                            tag: 'Chassis'
                        },
                        {
                            image: '/3d/salvage_yard.png',
                            title: 'Organized Nationwide Inventory',
                            description: 'Our network of salvage yards is mapped out digitally, ensuring zero wasted time.',
                            tag: 'Logistics'
                        }
                    ]} 
                />
            </div>

            <Footer />
        </div>
    )
}

