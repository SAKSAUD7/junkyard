import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { getOrganizationSchema } from '../utils/structuredData'
import { api } from '../services/api'

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
            <section className="relative pt-28 pb-14 bg-white border-b border-slate-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] opacity-60 pointer-events-none translate-x-1/3 -translate-y-1/4" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-50 rounded-full blur-[80px] opacity-40 pointer-events-none -translate-x-1/3 translate-y-1/4" />

                <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 bg-blue-50 border border-blue-100 animate-fade-in-up">
                            <span className="text-blue-600 text-[12px] font-bold uppercase tracking-widest">About JunkYardsNearMe.com</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight animate-fade-in-up" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em', lineHeight: 1.05 }}>
                            Expediting <span className="text-blue-600">Your Search</span>
                        </h1>
                        <p className="text-[17px] md:text-[20px] text-slate-500 font-medium max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-100">
                            Welcome to Junkyards Near Me — your source for listings, information and reviews of local junk yards and auto recyclers near you. We offer one of the most comprehensive listings of salvage yards across the United States and Canada.
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
            </section>

            <div className="bg-white">
                <AdCarousel slotGroup="carousel_1" page="about" title="Promoted Partners" />
            </div>

            {/* Mission Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                            Why <span className="text-blue-600">JYNM?</span>
                        </h2>
                        <div className="space-y-6 leading-relaxed text-lg text-slate-600 font-medium">
                            <p>
                                Junkyards Near Me was founded under the idea that with the increased amount of retail business junk yards are getting, there needed to be an easier way to put consumers in contact with the junk yards near them so they could get the parts they need, when they need them.
                            </p>
                            <p>
                                We realize that when your car is broken and you need parts, you want them to be available locally and affordably. Often, that means a trip to your local auto recycler where you can get your parts the same day and get your car back on the road.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl bg-blue-50 border border-blue-100">
                            <h3 className="text-xl font-bold mb-5 flex items-center gap-3 text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                <span className="text-2xl">🔧</span> Easy To Use!
                            </h3>
                            <p className="text-slate-600 font-medium leading-relaxed">
                                With Junkyards Near Me, you simply enter your zip code or postal code and instantly receive a listing of all the junk yards in your area along with helpful information and reviews written by people just like you. We make it easy for you to find what you need.
                            </p>
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


            {/* Our Journey Timeline */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                        {get('journey', 'heading', 'Our')} <span className="text-blue-600">{get('journey', 'heading_accent', 'Journey')}</span>
                    </h2>
                </div>
                
                <div className="relative">
                    {/* Horizontal Line */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2"></div>
                    
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { 
                                year: get('journey', 'milestone1_year', '2020'), 
                                title: get('journey', 'milestone1_title', 'The Idea'), 
                                desc: get('journey', 'milestone1_desc', 'Started as a local directory connecting a few shops in Texas.') 
                            },
                            { 
                                year: get('journey', 'milestone2_year', '2022'), 
                                title: get('journey', 'milestone2_title', 'Going National'), 
                                desc: get('journey', 'milestone2_desc', 'Expanded our database to cover 25 states and 500+ yards.') 
                            },
                            { 
                                year: get('journey', 'milestone3_year', '2024'), 
                                title: get('journey', 'milestone3_title', 'AI Integration'), 
                                desc: get('journey', 'milestone3_desc', 'Launched instant quote matching algorithms and verification.') 
                            },
                            { 
                                year: get('journey', 'milestone4_year', '2026'), 
                                title: get('journey', 'milestone4_title', 'Market Leader'), 
                                desc: get('journey', 'milestone4_desc', '1,200+ verified yards processing thousands of quotes daily.') 
                            }
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

