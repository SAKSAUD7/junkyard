import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LeadForm from '../components/LeadForm'
import TrustedVendors from '../components/TrustedVendors'
import { useData } from '../hooks/useData'
import DynamicAd from '../components/DynamicAd'
import SponsoredAd from '../components/qualityautoparts'
import SideAd from '../components/SideAd'
import SEO from '../components/SEO'
import { getOrganizationSchema, getWebsiteSchema } from '../utils/structuredData'

export default function Home() {
    const navigate = useNavigate()
    const [zipcode, setZipcode] = useState('')
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
        ?.filter(v => v.rating >= 4.5)
        ?.sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating
            return b.reviewCount - a.reviewCount
        })
        ?.slice(0, 6) || []

    // Get sponsored vendors
    const sponsoredVendors = allVendors
        ?.filter(v => v.rating === 5.0 || (v.rating >= 4.8 && v.reviewCount > 100))
        ?.sort((a, b) => b.reviewCount - a.reviewCount)
        ?.slice(0, 3) || []

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

            {/* Industrial Automotive Hero Section */}
            <div className="relative min-h-[90vh] flex flex-col justify-start pt-12 overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80)',
                    }}
                ></div>

                {/* Dark Overlay for Readability */}
                <div className="absolute inset-0 bg-dark-950/80"></div>

                {/* Left Sidebar Ads - Fixed in Hero */}
                <div className="absolute top-4 left-4 z-30 flex flex-col gap-4 hidden lg:block">
                    <SponsoredAd />
                    <DynamicAd slot="left_sidebar_ad" page="home" />
                </div>

                {/* Right Sidebar Ads - Fixed in Hero */}
                <div className="absolute top-4 right-4 z-30 flex flex-col gap-4 hidden lg:block">
                    <DynamicAd slot="right_sidebar_ad" page="home" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">

                    {/* Centered Logo & Branding */}
                    <div className="text-center mb-6">
                        <div className="inline-flex flex-col items-center">
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight font-display mb-1 drop-shadow-xl">
                                JYNM
                            </h1>
                            <span className="text-orange-500 font-bold text-xs md:text-sm tracking-[0.2em] uppercase font-mono bg-dark-950/50 px-3 py-0.5 rounded">
                                JunkYardsNearMe.com
                            </span>
                        </div>
                    </div>

                    {/* Main Content Container */}
                    <div className="flex flex-col items-center gap-8 relative z-10">

                        {/* Centered Copy */}
                        <div className="text-center max-w-4xl mx-auto space-y-4 pt-2">
                            <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-white leading-tight drop-shadow-xl">
                                FOR YOUR <span className="text-orange-500 inline-block transform -skew-x-6 mx-1.5 border-2 border-orange-500 px-1.5 py-0.5">JUNKYARD</span>
                                <br />
                                AUTO PARTS RECYCLING
                                <br />
                                AND AUTO SALVAGE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">SEARCH IN SECONDS.</span>
                            </h2>

                            <h3 className="text-base md:text-lg font-medium text-white/90">
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
                    <div className="relative py-20 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 to-dark-800"></div>

                        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12 animate-fade-in">
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 px-6 py-3 rounded-full mb-6">
                                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-white font-semibold">PREMIUM PARTNERS</span>
                                </div>

                                <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-4">
                                    Top-Rated Vendors
                                </h2>
                                <p className="text-xl text-white/60 max-w-2xl mx-auto">
                                    Verified excellence. Trusted by thousands.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {sponsoredVendors.map((vendor, index) => (
                                    <div
                                        key={vendor.accountID}
                                        className="group relative"
                                        onClick={() => navigate(`/vendors/${vendor.slug}`)}
                                    >
                                        {/* Card Glow */}
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

                                        {/* Card */}
                                        <div className="relative bg-dark-800/90 backdrop-blur-xl border border-yellow-400/30 rounded-3xl overflow-hidden transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
                                            {/* Premium Badge */}
                                            <div className="absolute top-4 right-4 z-10">
                                                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-dark-900 px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    {index === 0 ? 'TOP RATED' : 'FEATURED'}
                                                </div>
                                            </div>

                                            {/* Logo */}
                                            <div className="aspect-[16/9] bg-gradient-to-br from-dark-700 to-dark-800 p-8 flex items-center justify-center">
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

                                            {/* Content */}
                                            <div className="p-6">
                                                <h3 className="font-bold text-xl mb-3 text-white line-clamp-2 min-h-[3.5rem] group-hover:text-primary-400 transition-colors">
                                                    {vendor.name}
                                                </h3>

                                                {/* Rating */}
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <svg
                                                                key={i}
                                                                className={`w-5 h-5 ${i < Math.floor(vendor.rating) ? 'text-yellow-400' : 'text-dark-600'}`}
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                    <span className="font-bold text-white">{vendor.rating.toFixed(1)}</span>
                                                    <span className="text-sm text-white/50">({vendor.reviewCount})</span>
                                                </div>

                                                {/* Location */}
                                                <div className="flex items-center gap-2 text-white/60 mb-4">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="text-sm font-medium">{vendor.city}, {vendor.state.toUpperCase()}</span>
                                                </div>

                                                <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-glow transform hover:scale-105">
                                                    View Details →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }



            <Footer />
        </div >
    )
}
