import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { getOrganizationSchema } from '../utils/structuredData'

export default function About() {
    const stats = [
        { label: 'Active Junkyards', value: '1,000+' },
        { label: 'States Covered', value: '50' },
        { label: 'Daily Searches', value: '50k+' },
        { label: 'Parts Found', value: '1M+' },
    ]

    const features = [
        {
            title: 'Nationwide Network',
            description: 'Determine availability across our massive network of over 1,000 verified junkyards in all 50 states.',
            icon: (
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: 'Smart Search',
            description: 'Instantly filter by vehicle make, model, year, and part type to find exactly what you need in seconds.',
            icon: (
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            )
        },
        {
            title: 'Direct Contact',
            description: 'Get direct access to junkyard phone numbers, addresses, and websites. No middlemen, no hidden fees.',
            icon: (
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            )
        }
    ]

    const organizationSchema = getOrganizationSchema();

    return (
        <div className="min-h-screen bg-[#0f172a] text-white selection:bg-blue-500/30">
            <SEO
                title="About Us - Junkyards Near Me | The Future of Auto Salvage"
                description="Learn about Junkyards Near Me - connecting mechanics, enthusiasts, and car owners with over 1,000 verified junkyards across all 50 states. Save up to 70% on quality used auto parts."
                canonicalUrl="/about"
                structuredData={[organizationSchema]}
            />
            <Navbar />

            {/* Hero Section - Compact */}
            <div className="relative compact-section overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen transform -translate-y-1/2 translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
                            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-bold text-sm tracking-wide uppercase">
                                About Us
                            </span>
                        </div>
                        <h1 className="compact-hero font-black mb-2 sm:mb-3 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-200 px-2">
                            The Future of <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
                                Auto Salvage
                            </span>
                        </h1>
                        <p className="compact-heading text-gray-400 leading-relaxed mb-4 sm:mb-6 md:mb-8 px-2">
                            We're revolutionizing how you find used auto parts. Connecting mechanics, enthusiasts, and car owners with the nation's best extensive inventory.
                        </p>
                    </div>

                    {/* Stats Grid - Compact */}
                    <div className="grid grid-cols-2 md:grid-cols-4 compact-gap mt-4 sm:mt-6 md:mt-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl text-center group hover:bg-white/10 transition-all duration-300">
                                <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform duration-300">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-gray-400 font-medium uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mission Section - Compact */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 compact-section">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-4xl font-bold">
                            Our Mission is <span className="text-blue-400">Simple</span>
                        </h2>
                        <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
                            <p>
                                Finding quality used auto parts shouldn't be a hassle. We built Junkyards Near Me to bridge the gap between organized inventory and the people who need it most.
                            </p>
                            <p>
                                Whether you're restoring a classic, fixing a daily driver, or running a repair shop, our platform gives you instant access to millions of parts across the country.
                            </p>
                        </div>

                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-8 rounded-3xl backdrop-blur-sm">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-2xl">🌱</span> Why Choose Used?
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    'Save up to 70% compared to new parts',
                                    'Environmentally friendly recycling',
                                    'Find rare and discontinued items',
                                    'OEM quality fit and finish'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-300">
                                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">✓</div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-3xl opacity-20 rounded-full"></div>
                        <div className="grid gap-6 relative z-10">
                            {features.map((feature, index) => (
                                <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                    <p className="text-gray-400">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
