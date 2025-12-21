import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LeadForm from '../components/LeadForm'
import { useData } from '../hooks/useData'

export default function Home() {
    const navigate = useNavigate()
    const [zipcode, setZipcode] = useState('')
    const { data: allVendors } = useData('data_junkyards_complete.json')

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
            <Navbar />

            {/* Ultra-Modern Hero Section with Automotive Background */}
            <div className="relative min-h-[90vh] flex items-center overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80)',
                    }}
                ></div>

                {/* Dark Overlay with Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-dark-950/95 via-dark-900/90 to-dark-800/85"></div>

                {/* Animated Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-purple-600/15 to-pink-600/15 animate-gradient"></div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        {/* Left - Content with Glassmorphism */}
                        <div className="text-center lg:text-left space-y-8 animate-fade-in">
                            {/* Premium Badge */}
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-white/90 text-sm font-medium">1,018+ Verified Vendors</span>
                            </div>

                            {/* Main Heading with Gradient Text */}
                            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-300 to-purple-300 leading-tight">
                                Find Auto Parts
                                <span className="block text-cyan-400">Near You</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-white/80 font-light max-w-2xl">
                                Connect with <span className="font-bold text-cyan-400">trusted junkyards</span> nationwide.
                                Quality parts, competitive prices, instant quotes.
                            </p>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                                    <div className="text-3xl font-bold text-cyan-400">1K+</div>
                                    <div className="text-xs text-white/60">Vendors</div>
                                </div>
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                                    <div className="text-3xl font-bold text-blue-400">50</div>
                                    <div className="text-xs text-white/60">States</div>
                                </div>
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                                    <div className="text-3xl font-bold text-purple-400">24/7</div>
                                    <div className="text-xs text-white/60">Support</div>
                                </div>
                            </div>

                            {/* ZIP Search with Glassmorphism */}
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-glass">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                    Search by Location or Vendor
                                </h3>
                                <form onSubmit={handleZipSearch} className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        value={zipcode}
                                        onChange={(e) => setZipcode(e.target.value)}
                                        placeholder="Enter ZIP Code or Vendor Name"
                                        className="flex-1 px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-primary-400 focus:bg-white/20 outline-none transition-all backdrop-blur-sm"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 hover:from-blue-600 hover:via-cyan-600 hover:to-purple-600 text-white font-bold px-8 py-4 rounded-2xl shadow-glow hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105"
                                    >
                                        Search →
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Right - Lead Form with Enhanced Styling */}
                        <div className="lg:mt-0 animate-scale-in">
                            <div className="relative">
                                {/* Glow Effect */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 animate-pulse-slow"></div>
                                <div className="relative">
                                    <LeadForm />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Featured Vendors - Premium Cards */}
            {sponsoredVendors.length > 0 && (
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
            )}

            {/* Top Vendors Grid - Modern Cards */}
            <div className="relative py-20">
                <div className="absolute inset-0 bg-gradient-to-b from-dark-800 to-dark-900"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-4">
                            Trusted Salvage Yards
                        </h2>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8">
                            Quality parts from verified vendors nationwide
                        </p>

                        <button
                            onClick={() => navigate('/vendors')}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold px-12 py-4 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 shadow-glass"
                        >
                            VIEW ALL 1,018 VENDORS →
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {topVendors.map((vendor) => (
                            <div
                                key={vendor.accountID}
                                className="group bg-dark-800/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-primary-400/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
                                onClick={() => navigate(`/vendors/${vendor.slug}`)}
                            >
                                {/* Logo */}
                                <div className="aspect-[16/9] bg-gradient-to-br from-dark-700 to-dark-800 p-6 flex items-center justify-center">
                                    {vendor.logo ? (
                                        <img
                                            src={vendor.logo}
                                            alt={vendor.name}
                                            className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="text-white/10">
                                            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="font-bold text-lg mb-3 text-white group-hover:text-primary-400 transition-colors line-clamp-2 min-h-[3.5rem]">
                                        {vendor.name}
                                    </h3>

                                    {/* Rating */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-4 h-4 ${i < Math.floor(vendor.rating) ? 'text-yellow-400' : 'text-dark-600'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="font-semibold text-white">{vendor.rating.toFixed(1)}</span>
                                        <span className="text-xs text-white/50">({vendor.reviewCount})</span>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-center gap-2 text-white/60 mb-4">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm">{vendor.city}, {vendor.state.toUpperCase()}</span>
                                    </div>

                                    <button className="w-full bg-white/5 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-cyan-500 border border-white/10 group-hover:border-blue-500 text-white/70 group-hover:text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Browse Link */}
                    <div className="text-center">
                        <button
                            onClick={() => navigate('/browse')}
                            className="text-cyan-400 hover:text-cyan-300 font-semibold text-lg inline-flex items-center gap-2 hover:gap-3 transition-all"
                        >
                            Or Browse by Location
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
