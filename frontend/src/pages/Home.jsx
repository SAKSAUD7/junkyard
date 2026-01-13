import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LeadForm from '../components/LeadForm'
import TrustedVendors from '../components/TrustedVendors'
import { api } from '../services/api'
import DynamicAd from '../components/DynamicAd'
import SponsoredAd from '../components/qualityautoparts'
import SideAd from '../components/SideAd'
import MobileAdBanner from '../components/MobileAdBanner'
import SEO from '../components/SEO'
import { getOrganizationSchema, getWebsiteSchema } from '../utils/structuredData'

export default function Home() {
    const navigate = useNavigate()
    const [zipcode, setZipcode] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)


    const combinedSchema = {
        '@context': 'https://schema.org',
        '@graph': [
            getOrganizationSchema(),
            getWebsiteSchema()
        ]
    };

    // Auto-scroll carousel removed as Featured Vendors section is removed

    const handleZipSearch = (e) => {
        e.preventDefault()
        if (zipcode) {
            navigate(`/search?zipcode=${zipcode}`)
        }
    }

    const handleZipChange = async (e) => {
        const val = e.target.value
        setZipcode(val)

        if (val.length >= 2) {
            try {
                const results = await api.suggestZipcodes(val)
                setSuggestions(results)
                setShowSuggestions(true)
            } catch (err) {
                console.error(err)
            }
        } else {
            setSuggestions([])
            setShowSuggestions(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
            {/* SEO Meta Tags */}
            <SEO
                title="Find Auto Salvage Yards & Used Auto Parts Near You"
                description="Search 1,000+ verified junkyards nationwide. Find quality used auto parts by make, model, or location. Free quotes, nationwide shipping. Save up to 80% on OEM parts."
                schema={combinedSchema}
            />

            <Navbar />

            {/* Industrial Automotive Hero Section - Compact */}
            <div className="relative min-h-[40vh] sm:min-h-[50vh] md:min-h-[70vh] flex flex-col justify-start pt-4 sm:pt-6 md:pt-12 overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80)',
                    }}
                ></div>

                {/* Dark Overlay for Readability */}
                <div className="absolute inset-0 bg-dark-950/80"></div>

                {/* Desktop Sidebar Ads - Fixed in Hero */}
                <div className="absolute top-4 left-4 z-30 flex flex-col gap-4 hidden xl:block">
                    <DynamicAd slot="left_sidebar_ad" page="home" />
                </div>

                <div className="absolute top-4 right-4 z-30 flex flex-col gap-4 hidden xl:block">
                    <DynamicAd slot="right_sidebar_ad" page="home" />
                </div>


                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">

                    {/* Centered Logo & Branding - Compact */}
                    <div className="text-center mb-3 sm:mb-4">
                        <div className="inline-flex flex-col items-center">
                            <h1 className="compact-hero font-black text-white tracking-tight font-display mb-0.5 drop-shadow-xl">
                                JYNM
                            </h1>
                            <span className="text-orange-500 font-bold text-[9px] sm:text-[10px] md:text-xs tracking-[0.2em] uppercase font-mono bg-dark-950/50 px-1.5 sm:px-2 md:px-3 py-0.5 rounded">
                                JunkYardsNearMe.com
                            </span>
                        </div>
                    </div>

                    {/* Main Content Container - Compact */}
                    <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 relative z-10">

                        {/* Centered Copy - Compact */}
                        <div className="text-center max-w-4xl mx-auto space-y-2 sm:space-y-3 pt-1">
                            <h2 className="compact-title font-black text-white leading-tight drop-shadow-xl">
                                FOR YOUR <span className="text-orange-500 inline-block transform -skew-x-6 mx-1.5 border-2 border-orange-500 px-1.5 py-0.5">JUNKYARD</span>
                                <br />
                                AUTO PARTS RECYCLING
                                <br />
                                AND AUTO SALVAGE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">SEARCH IN SECONDS.</span>
                            </h2>

                            <h3 className="compact-text font-medium text-white/90">
                                LOCATE USED AUTO PARTS <span className="font-script text-orange-500 font-bold text-2xl ml-1.5 drop-shadow-md" style={{ fontFamily: 'cursive' }}>near you!</span>
                            </h3>

                            {/* Divider Line */}
                            <div className="w-16 h-1 bg-orange-500 mx-auto rounded-full shadow-glow"></div>

                            {/* Zip Code Search Bar */}
                            <div className="w-full max-w-md mx-auto mt-6 px-4 relative">
                                <form onSubmit={handleZipSearch} className="relative group z-20">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-12 pr-28 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all shadow-xl"
                                        placeholder="Enter Zip Code..."
                                        value={zipcode}
                                        onChange={handleZipChange}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        maxLength={5}
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-1.5 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 flex items-center gap-2"
                                    >
                                        <span>Search</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </form>

                                {/* Autocomplete Dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-4 right-4 mt-2 z-10">
                                        <div className="bg-dark-900/95 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                                            {suggestions.map((s, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    className="w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 flex items-center justify-between group"
                                                    onClick={() => {
                                                        setZipcode(s.zipcode)
                                                        setShowSuggestions(false)
                                                        navigate(`/search?zipcode=${s.zipcode}`)
                                                    }}
                                                >
                                                    <span className="font-mono text-cyan-400 font-bold">{s.zipcode}</span>
                                                    <span className="text-sm text-white/60 group-hover:text-white transition-colors">{s.city}, {s.state}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <p className="text-white/40 text-xs text-center mt-3">
                                    Search thousands of junkyards instantly
                                </p>
                            </div>
                        </div>

                        {/* Horizontal Lead Form ("Two Parts") */}
                        <div className="w-full max-w-5xl mx-auto">
                            <LeadForm layout="horizontal" />
                        </div>

                    </div>
                </div>
            </div>


            {/* Trusted Vendors Section */}
            <TrustedVendors />



            {/* Mobile Ad Banner */}
            <MobileAdBanner page="home" />

            <Footer />
        </div >
    )
}
