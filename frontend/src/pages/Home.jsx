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
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50">
            {/* SEO Meta Tags */}
            <SEO
                title="Find Auto Salvage Yards & Used Auto Parts Near You"
                description="Search 1,000+ verified junkyards nationwide. Find quality used auto parts by make, model, or location. Free quotes, nationwide shipping. Save up to 80% on OEM parts."
                schema={combinedSchema}
            />

            <Navbar />

            {/* Modern Hero Section - Light Theme (Updated with Brand Gradient) */}
            <div className="relative min-h-[30vh] sm:min-h-[50vh] md:min-h-[70vh] flex flex-col justify-start pt-2 sm:pt-6 md:pt-12 overflow-hidden bg-gradient-to-br from-blue-600 to-teal-600">

                {/* Desktop Sidebar Ads - Fixed in Hero */}
                <div className="absolute top-4 left-4 z-30 flex flex-col gap-4 hidden xl:block">
                    <DynamicAd slot="left_sidebar_ad" page="home" />
                </div>

                <div className="absolute top-4 right-4 z-30 flex flex-col gap-4 hidden xl:block">
                    <DynamicAd slot="right_sidebar_ad" page="home" />
                </div>


                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">

                    {/* Centered Logo & Branding - Compact */}
                    <div className="text-center mb-2 sm:mb-4">
                        <div className="inline-flex flex-col items-center">
                            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tight font-display mb-0.5 sm:mb-1">
                                JYNM
                            </h1>
                            <span className="text-blue-600 font-bold text-[8px] sm:text-[10px] md:text-xs tracking-[0.2em] uppercase font-mono bg-white px-1 sm:px-2 md:px-3 py-0.5 rounded shadow-sm">
                                JunkYardsNearMe.com
                            </span>
                        </div>
                    </div>

                    {/* Main Content Container - Compact */}
                    <div className="flex flex-col items-center gap-2 sm:gap-4 md:gap-6 relative z-10">

                        {/* Centered Copy - Compact */}
                        <div className="text-center max-w-4xl mx-auto space-y-1.5 sm:space-y-3 pt-0.5">
                            <h2 className="text-lg sm:text-2xl md:text-4xl font-black text-white leading-tight px-2">
                                FOR YOUR <span className="text-white inline-block transform -skew-x-6 mx-1 sm:mx-1.5 border-2 border-white px-1 sm:px-1.5 py-0 sm:py-0.5">JUNKYARD</span>
                                <br />
                                AUTO PARTS RECYCLING
                                <br />
                                AND AUTO SALVAGE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-teal-200">SEARCH IN SECONDS.</span>
                            </h2>

                            <h3 className="text-xs sm:text-base font-medium text-white/90 px-4">
                                LOCATE USED AUTO PARTS <span className="font-script text-white font-bold text-lg sm:text-2xl ml-1 sm:ml-1.5" style={{ fontFamily: 'cursive' }}>near you!</span>
                            </h3>

                            {/* Divider Line */}
                            <div className="w-16 h-1 bg-white/20 mx-auto rounded-full"></div>
                        </div>

                        {/* Pincode Search Bar - PRIMARY SEARCH */}
                        <div className="w-full max-w-5xl mx-auto animate-fade-in-up px-2 sm:px-0">
                            <div className="text-center mb-2 sm:mb-4">
                                <h3 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2">Search by ZIP Code</h3>
                                <p className="text-xs sm:text-base text-white/80">Find junkyards near you instantly</p>
                            </div>
                            <PincodeSearch />
                        </div>

                        {/* Horizontal Lead Form ("Two Parts") */}
                        <div className="w-full max-w-5xl mx-auto mt-4 sm:mt-6 animate-fade-in-up px-2 sm:px-0">
                            <div className="text-center mb-2 sm:mb-3">
                                <p className="text-xs sm:text-base text-white/70">Or search by vehicle details</p>
                            </div>
                            <LeadForm layout="horizontal" mode="quality_auto_parts" enableSteps={true} />
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
