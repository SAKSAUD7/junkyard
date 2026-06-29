import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { getOrganizationSchema } from '../utils/structuredData'
import { api } from '../services/api'
import Carousel3D from '../components/Carousel3D'
import { useCMS } from '../hooks/useCMS'
import AdCarousel from '../components/AdCarousel'

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
        <div className="bg-white min-h-screen text-slate-900 font-inter">
            <SEO
                title={get('meta', 'title', 'About Us - Junkyards Near Me | The Future of Auto Salvage')}
                description={get('meta', 'description', 'Learn about Junkyards Near Me - connecting mechanics, enthusiasts, and car owners with over 1,000 verified junkyards across all 50 states. Save up to 70% on quality used auto parts.')}
                canonicalUrl="/about"
                structuredData={[organizationSchema]}
            />
            <Navbar />

            {/* Clean Hero Section */}
            <div className="pt-32 pb-20 overflow-hidden relative border-b border-slate-100 bg-slate-50">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[100px] transform translate-x-1/3 -translate-y-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-50/50 rounded-full blur-[80px] transform -translate-x-1/3 translate-y-1/4 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 bg-white border border-slate-200 shadow-sm animate-fade-in-up">
                            <span className="text-blue-600 text-xs font-bold uppercase tracking-wider">Our Story</span>
                        </div>
                        <h1 className="font-black mb-6 text-5xl md:text-6xl lg:text-7xl animate-fade-in-up text-slate-900" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em', lineHeight: 1.05 }}>
                            {get('hero', 'heading', 'The Future of')} <br />
                            <span className="text-blue-600">
                                {get('hero', 'heading_accent', 'Auto Salvage')}
                            </span>
                        </h1>
                        <p className="leading-relaxed mb-12 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-medium animate-fade-in-up delay-100">
                            {get('hero', 'subheading', "We're revolutionizing how you find used auto parts. Connecting mechanics, enthusiasts, and car owners with the nation's most extensive inventory.")}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 animate-fade-in-up delay-200">
                        {stats.map((stat, index) => (
                            <div key={index} className="p-8 rounded-2xl text-center bg-white border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.08)] hover:-translate-y-1 hover:border-blue-200 transition-all duration-300">
                                <div className="text-4xl md:text-5xl font-black mb-2 text-slate-900" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                                    {stat.value}
                                </div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white">
                <AdCarousel slotGroup="carousel_1" page="about" title="Promoted Partners" />
            </div>

            {/* Mission Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                            {get('mission', 'title', 'Our Mission is')} <span className="text-blue-600">{get('mission', 'title_accent', 'Simple')}</span>
                        </h2>
                        <div className="space-y-6 leading-relaxed text-lg text-slate-600 font-medium">
                            <p>
                                {get('mission', 'para_1', "Finding quality used auto parts shouldn't be a hassle. We built Junkyards Near Me to bridge the gap between organized inventory and the people who need it most.")}
                            </p>
                            <p>
                                {get('mission', 'para_2', "Whether you're restoring a classic, fixing a daily driver, or running a repair shop, our platform gives you instant access to millions of parts across the country.")}
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl bg-orange-50 border border-orange-100">
                            <h3 className="text-xl font-bold mb-5 flex items-center gap-3 text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                <span className="text-2xl text-orange-600">⚡</span> Why Choose Used?
                            </h3>
                            <ul className="space-y-4">
                                {[
                                    'Save up to 70% compared to new parts',
                                    'Environmentally friendly auto recycling',
                                    'Find rare and discontinued items',
                                    'OEM quality fit and finish'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0 text-blue-600">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="grid gap-6 relative z-10 w-full max-w-lg mx-auto">
                            {features.map((feature, index) => (
                                <div key={index} className="p-6 rounded-2xl transition-all duration-300 group bg-white border border-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-lg hover:border-blue-200">
                                    <div className="flex items-start gap-5">
                                        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 bg-slate-50 border border-slate-100 text-blue-600 group-hover:bg-blue-50 group-hover:text-blue-700">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2 text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>{feature.title}</h3>
                                            <p className="text-slate-500 text-[0.95rem] lineHeight-[1.6] font-medium">{feature.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* USA Map Integration */}
            <div className="py-24 bg-slate-50 overflow-hidden border-t border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 bg-orange-50 border border-orange-100">
                            <span className="text-orange-600 text-xs font-bold uppercase tracking-wider">Nationwide</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                            A Nationwide <span className="text-blue-600">Network</span>
                        </h2>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium">
                            We've established strong partnerships with over 1,000 trusted salvage yards across all 50 states, ensuring fast fulfillment everywhere.
                        </p>
                    </div>
                    
                    <div className="relative max-w-5xl mx-auto hidden md:block">
                        <img src="/images/usa-gradient-map.png" alt="USA Network Map" className="w-full h-auto drop-shadow-2xl mix-blend-multiply opacity-90" />
                        
                        {/* Overlay stats badges */}
                        <div className="absolute top-[30%] left-[15%] bg-white p-4 rounded-xl shadow-xl border border-slate-200 animate-float" style={{ animationDelay: '0s' }}>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Western Hubs</p>
                            <p className="text-2xl font-black text-blue-600" style={{ fontFamily: "'Outfit', sans-serif" }}>320+ Yards</p>
                        </div>
                        <div className="absolute top-[40%] right-[10%] bg-white p-4 rounded-xl shadow-xl border border-slate-200 animate-float" style={{ animationDelay: '1.5s' }}>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Eastern Hubs</p>
                            <p className="text-2xl font-black text-blue-600" style={{ fontFamily: "'Outfit', sans-serif" }}>450+ Yards</p>
                        </div>
                        <div className="absolute bottom-[10%] left-[40%] bg-white p-4 rounded-xl shadow-xl border border-slate-200 animate-float" style={{ animationDelay: '3s' }}>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Central Hubs</p>
                            <p className="text-2xl font-black text-blue-600" style={{ fontFamily: "'Outfit', sans-serif" }}>280+ Yards</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Our Journey Timeline */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                        Our <span className="text-blue-600">Journey</span>
                    </h2>
                </div>
                
                <div className="relative">
                    {/* Horizontal Line */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2"></div>
                    
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { year: '2020', title: 'The Idea', desc: 'Started as a local directory connecting a few shops in Texas.' },
                            { year: '2022', title: 'Going National', desc: 'Expanded our database to cover 25 states and 500+ yards.' },
                            { year: '2024', title: 'AI Integration', desc: 'Launched instant quote matching algorithms and verification.' },
                            { year: '2026', title: 'Market Leader', desc: '1,200+ verified yards processing thousands of quotes daily.' }
                        ].map((milestone, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex justify-center items-center font-black text-xl mb-6 shadow-xl shadow-blue-600/30 border-4 border-white">
                                    {milestone.year}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{milestone.title}</h3>
                                <p className="text-slate-500 font-medium">{milestone.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white">
                <AdCarousel slotGroup="carousel_5" page="about" title="More Partners" />
            </div>

            <Footer />
        </div>
    )
}

