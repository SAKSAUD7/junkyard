import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LeadForm from '../components/LeadForm'
import TrustedVendors from '../components/TrustedVendors'
import { useData } from '../hooks/useData'
import DynamicAd from '../components/DynamicAd'
import SponsoredAd from '../components/qualityautoparts'
import SideAd from '../components/SideAd'
import MobileAdBanner from '../components/MobileAdBanner'
import SEO from '../components/SEO'
import { getOrganizationSchema, getWebsiteSchema } from '../utils/structuredData'

export default function Home() {
    const navigate = useNavigate()
    const [zipcode, setZipcode] = useState('')
    const carouselRef = useRef(null)
    const { data: allVendors } = useData('data_junkyards_complete.json')

    // SEO structured data
    const combinedSchema = {
        '@context': 'https://schema.org',
        '@graph': [
            getOrganizationSchema(),
            getWebsiteSchema()
        ]
    };

    // Get top rated vendors
    const topVendors = allVendors
        ?.filter(v => {
            if (typeof v.rating === 'string' && v.rating.includes('%')) {
                return parseFloat(v.rating) >= 90; // Consider 90%+ as top rated
            }
            return parseFloat(v.rating) >= 4.5;
        })
        ?.sort((a, b) => {
            const rA = parseFloat(a.rating) || 0;
            const rB = parseFloat(b.rating) || 0;
            return rB - rA;
        })
        ?.slice(0, 6) || []

    // Get sponsored vendors (top 8 with highest ratings)
    const sponsoredVendors = allVendors
        ?.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
        .slice(0, 8) || []

    // Auto-scroll carousel every 3 seconds
    useEffect(() => {
        const carousel = carouselRef.current
        if (!carousel) return

        const scrollInterval = setInterval(() => {
            const scrollAmount = 320 // Card width (300px) + gap (20px)
            const maxScroll = carousel.scrollWidth - carousel.clientWidth

            if (carousel.scrollLeft >= maxScroll - 10) {
                // Reset to start when reaching the end
                carousel.scrollTo({ left: 0, behavior: 'smooth' })
            } else {
                // Scroll to next card
                carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' })
            }
        }, 3000) // Auto-scroll every 3 seconds

        return () => clearInterval(scrollInterval)
    }, [sponsoredVendors])

    const handleZipSearch = (e) => {
        e.preventDefault()
        if (zipcode) {
            navigate(`/search?zipcode=${zipcode}`)
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

            {/* Featured Vendors - Premium Cards */}
            {
                sponsoredVendors.length > 0 && (
                    <div className="relative compact-section overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 to-dark-800"></div>

                        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
                            <div className="text-center mb-4 sm:mb-6 md:mb-8 animate-fade-in">
                                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-2 sm:mb-3">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-white font-semibold compact-text">PREMIUM PARTNERS</span>
                                </div>

                                <h2 className="compact-title font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-2 px-2 sm:px-3">
                                    Top-Rated Vendors
                                </h2>
                                <p className="compact-text text-white/60 max-w-2xl mx-auto px-3 sm:px-4">
                                    Verified excellence. Trusted by thousands.
                                </p>
                            </div>

                            <div className="mobile-grid-2 compact-gap">
                                {sponsoredVendors.map((vendor, index) => (
                                    <div key={vendor.accountID} className="relative h-full bg-dark-800/90 backdrop-blur-xl border border-yellow-400/30 rounded-xl sm:rounded-2xl overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col">
                                        {/* Premium Badge - Compact */}
                                        <div className="absolute top-2 right-2 z-10">
                                            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-dark-900 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold flex items-center gap-0.5">
                                                <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                {index === 0 ? 'TOP RATED' : 'FEATURED'}
                                            </div>
                                        </div>

                                        {/* Logo - Compact */}
                                        <div className="aspect-[16/9] bg-gradient-to-br from-dark-700 to-dark-800 p-3 sm:p-4 md:p-6 flex items-center justify-center">
                                            {vendor.logo ? (
                                                <img
                                                    src={vendor.logo}
                                                    alt={vendor.name}
                                                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="text-white/20">
                                                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content - Compact */}
                                        <div className="compact-card flex flex-col flex-grow">
                                            <h3 className="font-bold compact-heading mb-1.5 sm:mb-2 text-white line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-primary-400 transition-colors">
                                                {vendor.name}
                                            </h3>

                                            {/* Rating - Compact */}
                                            <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
                                                <div className="flex items-center flex-wrap gap-1">
                                                    {[...Array(5)].map((_, i) => {
                                                        const ratingNum = typeof vendor.rating === 'string' && vendor.rating.includes('%')
                                                            ? (parseFloat(vendor.rating) / 20)
                                                            : parseFloat(vendor.rating);
                                                        return (
                                                            <svg
                                                                key={i}
                                                                className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(ratingNum || 0) ? 'text-yellow-400' : 'text-dark-600'}`}
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        );
                                                    })}
                                                </div>
                                                <span className="font-bold text-white compact-text">{vendor.rating}</span>
                                                {vendor.reviewCount && <span className="text-[10px] sm:text-xs text-white/50">({vendor.reviewCount})</span>}
                                            </div>

                                            {/* Location - Compact */}
                                            <div className="flex items-center gap-1.5 text-white/60 mb-3 sm:mb-4 mt-auto">
                                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="compact-text font-medium">{vendor.city}, {vendor.state.toUpperCase()}</span>
                                            </div>

                                            <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-2 sm:py-2.5 px-4 rounded-lg sm:rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-95 compact-text">
                                                View Details →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* View All Button */}
                            <div className="mt-16 text-center animate-fade-in">
                                <button
                                    onClick={() => navigate('/vendors')}
                                    className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/20 text-white font-black px-10 py-5 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xl group"
                                >
                                    <span>EXPLORE ALL {allVendors?.length || ''} VENDORS</span>
                                    <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                            </div>
                        </div >
                    </div >
                )
            }

            {/* Mobile Ad Banner */}
            <MobileAdBanner page="home" />

            <Footer />
        </div >
    )
}
