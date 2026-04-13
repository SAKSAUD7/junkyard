import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { getOrganizationSchema } from '../utils/structuredData'
import { api } from '../services/api'

function FadeInSection({ children, delay = 0 }) {
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
    return (
        <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }}>
            {children}
        </motion.div>
    )
}

export default function About() {
    const [vendorCount, setVendorCount] = useState(0)
    const [stateCount, setStateCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [vendorsResponse, stateCountsResponse] = await Promise.all([api.getVendors({ page_size: 1 }), api.getStateCounts()])
                setVendorCount(vendorsResponse.count !== undefined ? vendorsResponse.count : (Array.isArray(vendorsResponse) ? vendorsResponse.length : 0))
                setStateCount(Object.keys(stateCountsResponse).length || 0)
                setLoading(false)
            } catch {
                setVendorCount(6000); setStateCount(55); setLoading(false)
            }
        }
        fetchCounts()
    }, [])

    const stats = [
        { label: 'Active Junkyards', value: loading ? '...' : vendorCount.toLocaleString(), icon: '🏭' },
        { label: 'States Covered', value: loading ? '...' : stateCount, icon: '🗺️' },
        { label: 'Daily Searches', value: '50k+', icon: '🔍' },
        { label: 'Parts Found', value: '1M+', icon: '🔩' },
    ]

    const features = [
        { title: 'Nationwide Network', desc: 'Over 6,000 verified junkyards across 55+ states — instantly searchable.', icon: '🌐', color: 'from-amber-500 to-orange-500' },
        { title: 'Smart Search', desc: 'Filter by make, model, year, and part type to find exactly what you need in seconds.', icon: '🎯', color: 'from-blue-500 to-cyan-500' },
        { title: 'Direct Contact', desc: 'Connect directly with junkyards. No middlemen, no hidden fees, no markups.', icon: '📞', color: 'from-green-500 to-emerald-500' },
    ]

    const whyUsed = ['Save up to 70% compared to new parts', 'Environmentally friendly recycling', 'Find rare and discontinued items', 'OEM quality fit and finish']

    const organizationSchema = getOrganizationSchema()

    return (
        <div className="min-h-screen" style={{ background: '#0a0b0d' }}>
            <SEO
                title="About Us - Junkyards Near Me | The Future of Auto Salvage"
                description="Learn about Junkyards Near Me — connecting mechanics, enthusiasts, and car owners with over 6,000 verified junkyards across 55+ states."
                canonical="/about-us"
                schema={{ '@context': 'https://schema.org', '@graph': [organizationSchema] }}
            />
            <Navbar />

            {/* Hero */}
            <section className="relative py-20 md:py-32 overflow-hidden" style={{ background: '#080909' }}>
                {/* Real photo background */}
                <div className="absolute inset-0">
                    <img src="/images/static/audi-engine.jpg" alt="Engine Bay" className="w-full h-full object-cover object-center" style={{ opacity: 0.18 }} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(8,9,9,0.5) 0%, rgba(8,9,9,0.75) 60%, rgba(8,9,9,1) 100%)' }} />
                </div>
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
                    <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 mb-6" style={{ background: 'rgba(245,158,11,0.08)' }}>
                            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">About Us</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-none mb-6">
                            The Future of<br />
                            <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Auto Salvage</span>
                        </h1>
                        <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
                            We're revolutionizing how you find used auto parts — connecting mechanics, enthusiasts, and car owners with the nation's best inventory.
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 max-w-4xl mx-auto">
                        {stats.map((stat, i) => (
                            <FadeInSection key={stat.label} delay={i * 0.1}>
                                <div className="rounded-2xl border border-white/[8%] p-6 text-center group hover:border-amber-500/30 transition-all duration-300" style={{ background: 'rgba(17,19,24,0.8)', backdropFilter: 'blur(16px)' }}>
                                    <div className="text-2xl mb-2">{stat.icon}</div>
                                    <div className="text-2xl md:text-3xl font-black text-amber-400 mb-1 group-hover:scale-110 transition-transform duration-300">{stat.value}</div>
                                    <div className="text-white/40 text-xs uppercase tracking-widest">{stat.label}</div>
                                </div>
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </section>


            {/* Mission Section */}
            <section className="py-20" style={{ background: '#0f1117' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <FadeInSection>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">Our Purpose</p>
                                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Our Mission is <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Simple</span></h2>
                                </div>
                                <div className="space-y-4 text-white/60 leading-relaxed">
                                    <p>Finding quality used auto parts shouldn't be a hassle. We built Junkyards Near Me to bridge the gap between organized inventory and the people who need it most.</p>
                                    <p>Whether you're restoring a classic, fixing a daily driver, or running a repair shop, our platform gives you instant access to millions of parts across the country.</p>
                                </div>
                                {/* Why Choose Used */}
                                <div className="rounded-2xl border border-amber-500/20 p-6" style={{ background: 'rgba(245,158,11,0.05)' }}>
                                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">🌱 Why Choose Used?</h3>
                                    <ul className="space-y-3">
                                        {whyUsed.map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-white/60 text-sm">
                                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>✓</div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </FadeInSection>

                        <FadeInSection delay={0.2}>
                            <div className="space-y-4">
                                {features.map((feature, i) => (
                                    <div key={feature.title} className="rounded-2xl border border-white/[8%] p-6 hover:border-amber-500/30 transition-all duration-300 group" style={{ background: '#111318' }}>
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-gradient-to-br ${feature.color}`}>
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-amber-300 transition-colors">{feature.title}</h3>
                                                <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </FadeInSection>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
