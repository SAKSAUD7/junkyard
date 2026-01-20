import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeadForm from '../components/LeadForm';
import LocationMap from '../components/LocationMap';
import SEO from '../components/SEO';
import { getLocalBusinessSchema, getBreadcrumbSchema } from '../utils/structuredData';

const VendorDetail = () => {
    const params = useParams();
    const { id } = params;
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                setLoading(true);
                const data = await api.getVendors();

                // Handle paginated response
                const vendors = data.results || (Array.isArray(data) ? data : []);

                let targetId = id;
                // Support legacy URLs: /junkyards/:state/:slug
                // Slug format: ID-SLUG (e.g., 6481441-1-morgan-highway-auto-parts)
                if (!targetId && params.slug) {
                    const match = params.slug.match(/^(\d+)-/);
                    if (match && match[1]) {
                        targetId = match[1];
                    }
                }

                if (targetId) {
                    const foundVendor = vendors.find(v => v.id === parseInt(targetId));
                    setVendor(foundVendor);
                    setError(foundVendor ? null : 'Vendor not found');
                } else {
                    setError('Invalid vendor ID');
                }
            } catch (err) {
                console.error('Error fetching vendor:', err);
                setError('Failed to load vendor');
            } finally {
                setLoading(false);
            }
        };
        fetchVendor();
    }, [id, params.slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50 flex items-center justify-center">
                <div className="text-gray-900 text-xl">Loading...</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50 flex items-center justify-center">
                <div className="text-gray-900 text-xl">Loading vendor details...</div>
            </div>
        );
    }

    if (error || !vendor) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white border border-gray-200 rounded-full mb-6">
                        <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Vendor Not Found</h1>
                    <p className="text-gray-600 mb-8">The vendor you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/vendors')}
                        className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-glow"
                    >
                        ← Back to All Vendors
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    // SEO structured data
    const localBusinessSchema = getLocalBusinessSchema({
        name: vendor.name,
        address: vendor.address,
        city: vendor.city,
        state: vendor.state,
        zipcode: vendor.zipcode,
        description: vendor.description,
        rating: vendor.rating,
        logo: vendor.logo
    });

    const breadcrumbSchema = getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Vendors', url: '/vendors' },
        { name: vendor.name, url: `/vendors/${vendor.id}` }
    ]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50">
            <SEO
                title={`${vendor.name} - Auto Salvage Yard in ${vendor.city}, ${vendor.state}`}
                description={vendor.description || `Find used auto parts at ${vendor.name} in ${vendor.city}, ${vendor.state}. ${vendor.rating} customer rating. Get a quote today!`}
                canonicalUrl={`/vendors/${vendor.id}`}
                structuredData={[localBusinessSchema, breadcrumbSchema]}
            />
            <Navbar />

            {/* Breadcrumb */}
            <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <Link to="/vendors" className="hover:text-blue-600 transition-colors">Vendors</Link>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-900 font-medium">{vendor.name}</span>
                    </div>
                </div>
            </div>

            {/* Hero Section - Compact Mobile */}
            <div className="relative compact-section overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left - Vendor Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Logo & Name Card - Compact */}
                            <div className="bg-white border border-gray-200 rounded-2xl md:rounded-3xl compact-card">
                                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 md:gap-6">
                                    {/* Logo */}
                                    <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 flex items-center justify-center">
                                        {vendor.logo ? (
                                            <img
                                                src={vendor.logo}
                                                alt={vendor.name}
                                                className="max-w-full max-h-full object-contain"
                                                onError={(e) => {
                                                    e.target.src = '/images/logo-placeholder.png';
                                                }}
                                            />
                                        ) : (
                                            <svg className="w-16 h-16 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Name & Rating - Compact */}
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 sm:mb-3 md:mb-4 break-words">
                                            {vendor.name}
                                        </h1>

                                        {/* Rating - Compact */}
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
                                            <div className="flex items-center gap-0.5 sm:gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg
                                                        key={i}
                                                        className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span className="text-base sm:text-lg font-bold text-gray-900">{vendor.rating}</span>
                                            <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full compact-text font-semibold">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Verified
                                            </span>
                                        </div>

                                        {/* Location - Compact */}
                                        <div className="flex items-start gap-1.5 sm:gap-2 text-gray-700 compact-text">
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="break-words">{vendor.address}, {vendor.city}, {vendor.state} {vendor.zipcode}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {vendor.description && (
                                <div className="bg-white border border-gray-200 rounded-2xl md:rounded-3xl compact-card">
                                    <h2 className="compact-title font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 flex items-center gap-1.5 sm:gap-2">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        About This Vendor
                                    </h2>
                                    <p className="text-gray-600 compact-text leading-relaxed">
                                        {vendor.description}
                                    </p>
                                </div>
                            )}

                            {/* Review Snippet */}
                            {vendor.reviewSnippet && (
                                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl md:rounded-3xl compact-card">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <svg className="w-12 h-12 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">Customer Review</h3>
                                            <p className="text-gray-700 italic">"{vendor.reviewSnippet}"</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quick Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Location Card */}
                                <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl compact-card">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h3 className="font-bold text-gray-900">Location</h3>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        {vendor.city}, {vendor.state}
                                    </p>
                                    <p className="text-gray-500 text-xs mt-1">ZIP: {vendor.zipcode}</p>
                                </div>

                                {/* State Card */}
                                <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl compact-card">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h3 className="font-bold text-gray-900">State</h3>
                                    </div>
                                    <p className="text-gray-600 text-sm font-semibold">{vendor.state}</p>
                                </div>
                            </div>

                            {/* Location Map */}
                            <LocationMap
                                address={vendor.address}
                                city={vendor.city}
                                state={vendor.state}
                                zipcode={vendor.zipcode}
                                name={vendor.name}
                                theme="light"
                            />
                        </div>

                        {/* Right - Contact Form */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <div className="relative">
                                    {/* Glow Effect */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 animate-pulse-slow"></div>

                                    {/* Form Container */}
                                    <div className="relative bg-white backdrop-blur-xl border border-gray-200 rounded-3xl p-6">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                            </svg>
                                            Get a Quote
                                        </h2>
                                        <p className="text-gray-600 mb-6">Fill out the form below to request a quote from {vendor.name}</p>
                                        <LeadForm vendorName={vendor.name} />
                                    </div>
                                </div>

                                {/* Back Button */}
                                <button
                                    onClick={() => navigate('/vendors')}
                                    className="w-full mt-6 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                    Back to All Vendors
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default VendorDetail;
