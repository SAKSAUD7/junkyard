import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LeadForm from '../components/LeadForm'
import PincodeSearch from '../components/PincodeSearch'
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
    const { data: allVendors } = useData('data_junkyards_complete.json')

    // SEO structured data
    const combinedSchema = {
        '@context': 'https://schema.org',
        '@graph': [
            getOrganizationSchema(),
            getWebsiteSchema()
        ]
    };



    const handleZipSearch = (e) => {
        e.preventDefault()
        if (zipcode) {
            navigate(`/search?zipcode=${zipcode}`)
        }
    }

    return (
        <div className="min-h-screen bg-white">
            {/* SEO Meta Tags */}
            <SEO
                title="Find Auto Salvage Yards & Used Auto Parts Near You"
                description="Search 1,000+ verified junkyards nationwide. Find quality used auto parts by make, model, or location. Free quotes, nationwide shipping. Save up to 80% on OEM parts."
                schema={combinedSchema}
            />

            <Navbar />

            {/* Premium Hero Section - Car and Driver Inspired */}
            <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">

                {/* Background Pattern Overlay */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }}></div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900"></div>

                {/* Desktop Sidebar Ads */}
                <div className="absolute top-8 left-8 z-30 hidden xl:block">
                    <DynamicAd slot="left_sidebar_ad" page="home" />
                </div>
                <div className="absolute top-8 right-8 z-30 hidden xl:block">
                    <DynamicAd slot="right_sidebar_ad" page="home" />
                </div>

                {/* Main Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">

                    {/* Brand Logo */}
                    <div className="text-center mb-12 animate-fade-in-down">
                        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter mb-4">
                            JYNM
                        </h1>
                        <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                            <span className="text-white/90 font-medium text-sm tracking-wider">
                                JUNKYARDSNEARME.COM
                            </span>
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="text-center max-w-5xl mx-auto mb-16 animate-fade-in-up">
                        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                            Find Quality Used Auto Parts
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400 mt-2">
                                In Seconds
                            </span>
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-300 font-light max-w-3xl mx-auto">
                            Search 1,000+ verified junkyards nationwide. Save up to 80% on OEM parts with free quotes and nationwide shipping.
                        </p>
                    </div>

                    {/* Search Methods */}
                    <div className="max-w-4xl mx-auto space-y-8">

                        {/* Primary: ZIP Code Search */}
                        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-white mb-2">Search by Location</h3>
                                <p className="text-gray-400">Find junkyards near you instantly</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl">
                                <PincodeSearch />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-gray-900 text-gray-400 text-sm font-medium">
                                    OR
                                </span>
                            </div>
                        </div>

                        {/* Secondary: Vehicle Details Search */}
                        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-white mb-2">Search by Vehicle</h3>
                                <p className="text-gray-400">Get specific parts for your make and model</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl">
                                <LeadForm layout="horizontal" mode="quality_auto_parts" enableSteps={true} />
                            </div>
                        </div>

                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">1,000+</div>
                            <div className="text-sm text-gray-400">Verified Vendors</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">24/7</div>
                            <div className="text-sm text-gray-400">Support</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">80%</div>
                            <div className="text-sm text-gray-400">Average Savings</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">Free</div>
                            <div className="text-sm text-gray-400">Quotes</div>
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
