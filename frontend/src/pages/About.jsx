import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { getOrganizationSchema } from '../utils/structuredData'
import { api } from '../services/api'
import { useCMS } from '../hooks/useCMS'
import AdCarousel from '../components/AdCarousel'
import PageHero from '../components/PageHero'

export default function About() {
    const { get } = useCMS('about')
    const [vendorCount, setVendorCount] = useState(0)
    const [stateCount, setStateCount] = useState(0)
    const [loading, setLoading] = useState(true)

    // Fetch real counts from backend
    useEffect(() => {
        let isMounted = true;
        const fetchCounts = async () => {
            try {
                const [vendorsResult, statesResult] = await Promise.allSettled([
                    api.getVendors({ page_size: 1 }),
                    api.getStateCounts()
                ])

                if (!isMounted) return;

                if (vendorsResult.status === 'fulfilled') {
                    const totalVendors = vendorsResult.value.count !== undefined
                        ? vendorsResult.value.count
                        : (Array.isArray(vendorsResult.value) ? vendorsResult.value.length : 1200);
                    setVendorCount(totalVendors)
                } else {
                    setVendorCount(1200)
                }

                if (statesResult.status === 'fulfilled') {
                    const activeStatesCount = Object.keys(statesResult.value).length || 50
                    setStateCount(activeStatesCount)
                } else {
                    setStateCount(50)
                }

                setLoading(false)
            } catch (error) {
                console.error('Error fetching counts:', error)
                if (isMounted) {
                    setVendorCount(1200)
                    setStateCount(50)
                    setLoading(false)
                }
            }
        }

        fetchCounts()
        return () => { isMounted = false; }
    }, [])

    const stats = [
        { 
            label: get('stats', 'label_1', 'Active Junkyards'), 
            value: loading ? '...' : vendorCount.toLocaleString() + '+',
            desc: 'Verified yards across USA'
        },
        { 
            label: get('stats', 'label_2', 'States Covered'), 
            value: loading ? '...' : stateCount + '+',
            desc: 'Coast-to-coast coverage'
        },
        { 
            label: get('stats', 'label_3', 'Daily Searches'), 
            value: get('stats', 'value_3', '50,000+'),
            desc: 'Processed parts requests'
        },
        { 
            label: get('stats', 'label_4', 'Avg Savings'), 
            value: get('stats', 'value_4', '70% Off'),
            desc: 'Compared to dealer OEM list'
        },
    ]

    const features = [
        {
            title: get('features', 'feature1_title', 'Nationwide Junkyard Network'),
            description: get('features', 'feature1_desc', 'Connect instantly across our massive directory of over 1,200 verified auto recyclers and scrap yards in all 50 states.'),
            badge: 'Verified Coverage',
            icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: get('features', 'feature2_title', 'Intelligent Part Matching'),
            description: get('features', 'feature2_desc', 'Filter effortlessly by year, make, model, trim, and interchange codes to find high-grade OEM parts in minutes.'),
            badge: 'Instant Results',
            icon: (
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            )
        },
        {
            title: get('features', 'feature3_title', 'Direct Salvage Communication'),
            description: get('features', 'feature3_desc', 'Streamlined connection to salvage specialists, inventory departments, and parts dispatchers without middlemen.'),
            badge: 'Zero Markup',
            icon: (
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            )
        }
    ]

    const milestones = [
        { 
            year: get('journey', 'milestone1_year', '2020'), 
            title: get('journey', 'milestone1_title', 'The Inception'), 
            desc: get('journey', 'milestone1_desc', 'Founded to bridge the communication gap between salvage operators and automotive repair shops.') 
        },
        { 
            year: get('journey', 'milestone2_year', '2022'), 
            title: get('journey', 'milestone2_title', 'Coast-to-Coast Expansion'), 
            desc: get('journey', 'milestone2_desc', 'Extended coverage across 50 states, onboarding over 500 licensed auto recyclers.') 
        },
        { 
            year: get('journey', 'milestone3_year', '2024'), 
            title: get('journey', 'milestone3_title', 'Next-Gen Matching Engine'), 
            desc: get('journey', 'milestone3_desc', 'Introduced real-time quote dispatch algorithms and verified yard certification standards.') 
        },
        { 
            year: get('journey', 'milestone4_year', '2026'), 
            title: get('journey', 'milestone4_title', 'Leading Marketplace'), 
            desc: get('journey', 'milestone4_desc', '1,200+ verified salvage yards servicing tens of thousands of parts inquiries every day.') 
        }
    ]

    const organizationSchema = getOrganizationSchema();

    return (
        <div className="bg-[#f8fafc] min-h-screen text-slate-900 selection:bg-blue-600 selection:text-white">
            <SEO
                title={get('meta', 'title', 'About Us - Junkyards Near Me | America\'s Auto Salvage Marketplace')}
                description={get('meta', 'description', 'Learn about Junkyards Near Me — connecting mechanics, auto rebuilders, and car owners with over 1,200 verified junkyards across all 50 states. Save up to 70% on OEM used auto parts.')}
                canonicalUrl="/about"
                structuredData={[organizationSchema]}
            />
            <Navbar />

            {/* Elevated Hero Section */}
            <PageHero
                page="about"
                tag="About JunkYardsNearMe.com"
                title="Pioneering Modern"
                titleAccent="Auto Salvage"
                subtitle="Junkyards Near Me is North America's premier digital gateway connecting vehicle owners, certified mechanics, and fleet managers directly with licensed automotive recyclers and scrap yards across all 50 states."
                backgroundImage="https://images.unsplash.com/photo-1590240974864-8eff38640196?auto=format&fit=crop&q=80&w=1920"
                height="large"
            />

            {/* Modernized Floating Stats Deck */}
            <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 z-30 -mt-20 mb-16">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {stats.map((stat, index) => (
                        <div 
                            key={index} 
                            className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.12)] hover:-translate-y-1 hover:border-blue-400 transition-all duration-300 group flex flex-col justify-between"
                        >
                            <div className="w-8 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 group-hover:w-14 transition-all duration-300" />
                            <div 
                                className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight leading-none mb-2" 
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                {stat.value}
                            </div>
                            <div>
                                <div 
                                    className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-wide uppercase"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    {stat.label}
                                </div>
                                <div className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                                    {stat.desc}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AD PLACEMENT 1: Promoted Partners in Responsive 4-Card Grid */}
            <AdCarousel slotGroup="carousel_1" page="about" title="Promoted Salvage Partners" />

            {/* Mission & Core Philosophy Section */}
            <section className="py-20 lg:py-28 bg-white border-t border-b border-slate-200/70">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                        
                        {/* Left Column: Mission Narrative */}
                        <div className="lg:col-span-6 space-y-8">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                Our Mission & Purpose
                            </div>

                            <h2 
                                className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]" 
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                Reimagining How America Finds <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Used Auto Parts</span>
                            </h2>

                            <div className="space-y-5 text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
                                <p>
                                    Junkyards Near Me was established with a singular vision: to eliminate the friction, uncertainty, and inflated dealer prices associated with sourcing replacement vehicle components.
                                </p>
                                <p>
                                    When an automobile is disabled on a repair lift or in your home garage, you require authentic OEM parts immediately without waiting weeks for expensive backorders. Local automotive dismantlers house millions of premium, fully functional components ready for immediate pickup and nationwide dispatch.
                                </p>
                            </div>

                            {/* Value Proposition Glass Card */}
                            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-50/80 to-indigo-50/40 border border-blue-200/70 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-600/30">
                                        ⚡
                                    </div>
                                    <h3 
                                        className="text-lg sm:text-xl font-black text-slate-900" 
                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                    >
                                        Effortless Local & National Sourcing
                                    </h3>
                                </div>
                                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                    Simply search by zip code or select your vehicle specifics. You instantly unlock verified yards, direct inventories, genuine reviews, and real-time quote dispatch — empowering you to negotiate directly with zero middlemen.
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Interactive Feature Cards */}
                        <div className="lg:col-span-6 space-y-5">
                            {features.map((feature, index) => (
                                <div 
                                    key={index} 
                                    className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgba(37,99,235,0.12)] hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 group"
                                >
                                    <div className="flex items-start gap-5">
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-slate-50 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:scale-105 shadow-sm">
                                            {feature.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                                <h3 
                                                    className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug" 
                                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                                >
                                                    {feature.title}
                                                </h3>
                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full shrink-0">
                                                    {feature.badge}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-sm sm:text-[15px] leading-relaxed font-normal">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </section>

            {/* Modernized Timeline: Our Journey */}
            <section className="py-20 lg:py-28 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
                        Marketplace Growth
                    </div>
                    <h2 
                        className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight" 
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        Our <span className="text-blue-600">Evolutionary Journey</span>
                    </h2>
                    <p className="text-slate-500 text-base sm:text-lg mt-3">
                        How JYNM grew from a grassroots community directory into North America's premier auto salvage network.
                    </p>
                </div>
                
                <div className="relative">
                    {/* Connecting line on desktop */}
                    <div className="hidden lg:block absolute top-12 left-0 w-full h-1 bg-gradient-to-r from-blue-200 via-blue-500 to-indigo-300 rounded-full" />
                    
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {milestones.map((m, i) => (
                            <div 
                                key={i} 
                                className="relative z-10 flex flex-col p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div 
                                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform"
                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                    >
                                        {m.year}
                                    </div>
                                    <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        Phase {i + 1}
                                    </span>
                                </div>
                                <h3 
                                    className="text-lg font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors" 
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    {m.title}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-normal">
                                    {m.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AD PLACEMENT 2: More Partners in Responsive 4-Card Grid */}
            <div className="border-t border-slate-200/80 bg-white py-12">
                <AdCarousel slotGroup="carousel_5" page="about" title="Featured Automotive Recyclers" />
            </div>

            <Footer />
        </div>
    )
}
