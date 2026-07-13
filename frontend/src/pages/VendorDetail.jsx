import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeadForm from '../components/LeadForm';
import LocationMap from '../components/LocationMap';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { getLocalBusinessSchema } from '../utils/structuredData';
import { getLogoUrl } from '../utils/imageUrl';

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
                let targetId = id || params.slug || params.vendorSlug;
                
                // If targetId is a full SEO slug (e.g. 5726-sa-recycling), extract just the numeric part
                if (targetId) {
                    const match = targetId.match(/^(\d+)/);
                    if (match && match[1]) {
                        targetId = match[1];
                    }
                }
                if (targetId) {
                    const data = await api.getVendor(targetId);
                    setVendor(data);
                    setError(null);
                } else {
                    setError('Invalid vendor ID');
                }
            } catch (err) {
                setError('Failed to load vendor');
            } finally {
                setLoading(false);
            }
        };
        fetchVendor();
    }, [id, params.slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-semibold text-sm">Loading yard info...</p>
                </div>
            </div>
        );
    }

    if (error || !vendor) {
        return (
            <div className="min-h-screen bg-[#f8fafc]">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 border border-red-100 rounded-2xl mb-6">
                        <svg className="w-10 h-10 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Vendor Not Found</h1>
                    <p className="text-slate-500 mb-8">The vendor you're looking for doesn't exist or has been removed.</p>
                    <button onClick={() => navigate('/vendors')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-[0_8px_20px_rgb(37,99,235,0.25)]">
                        ← Back to All Vendors
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const logoUrl = getLogoUrl(vendor.logo);

    const mergedParts = Array.from(new Set([
        ...(vendor.services ? vendor.services.split(',').map(s => s.trim()).filter(Boolean) : []),
        ...(vendor.portal_inventory?.parts || [])
    ]));

    const mergedBrands = Array.from(new Set([
        ...(vendor.brands ? vendor.brands.split(',').map(b => b.trim()).filter(Boolean) : []),
        ...(vendor.portal_inventory?.makes || [])
    ]));

    const localBusinessSchema = getLocalBusinessSchema({
        name: vendor.name,
        address: vendor.address,
        city: vendor.city,
        state: vendor.state,
        zipcode: vendor.zipcode,
        description: vendor.description,
        rating: vendor.rating,
        logo: logoUrl
    });

    // Build the SEO-canonical slug URL matching the redirect map format
    const nameSlug = (vendor.name || 'vendor').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const citySlug = (vendor.city || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const stateSlug = (vendor.state || '').toLowerCase();
    const vendorSlug = `${vendor.id}-${nameSlug}${citySlug ? '-' + citySlug : ''}${stateSlug ? '-' + stateSlug : ''}`;
    const canonicalPath = `https://junkyardsnearme.com/vendors/${vendorSlug}`;

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <SEO
                title={`${vendor.name} - Auto Salvage Yard in ${vendor.city}, ${vendor.state}`}
                description={vendor.description || `Find used auto parts at ${vendor.name} in ${vendor.city}, ${vendor.state}. ${vendor.rating} customer rating. Get a quote today!`}
                canonical={canonicalPath}
                schema={localBusinessSchema}
            />
            <Navbar />

            {/* ── Breadcrumb ── */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
                    <Breadcrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'All Junkyards', href: '/vendors' },
                            { label: vendor.name, href: `/vendors/${vendorSlug}` }
                        ]}
                    />
                </div>
            </div>

            {/* ── Hero Card ── */}
            <div className="bg-white border-b border-slate-100 pt-8 pb-10">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-8">
                        {/* Logo */}
                        <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-center">
                            {logoUrl ? (
                                <img src={logoUrl} alt={vendor.name} className="max-w-full max-h-full object-contain"
                                    onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-black text-2xl flex items-center justify-center">
                                    {vendor.name?.charAt(0) || 'J'}
                                </div>
                            )}
                        </div>

                        {/* Name & Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {vendor.name}
                                </h1>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-[11px] font-black uppercase tracking-wide">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    Verified
                                </span>
                            </div>

                            {/* Stars */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="font-bold text-slate-700 text-[14px]">{vendor.rating || '5.0'}</span>
                            </div>

                            {/* Address */}
                            <p className="flex items-start gap-1.5 text-slate-500 text-[14px] font-medium">
                                <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                {vendor.address}, {vendor.city}, {vendor.state} {vendor.zipcode}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Grid ── */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column — Details */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* About */}
                        {vendor.description && (
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_16px_rgb(0,0,0,0.03)] p-6">
                                <h2 className="font-black text-slate-900 text-[16px] mb-3 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                    </div>
                                    About This Yard
                                </h2>
                                <p className="text-slate-600 text-[14px] leading-relaxed">{vendor.description}</p>
                            </div>
                        )}

                        {/* Quick Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Location */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_16px_rgb(0,0,0,0.03)] p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                    </div>
                                    <h3 className="font-black text-slate-800 text-[14px]">Location</h3>
                                </div>
                                <p className="text-slate-600 text-[13px] font-medium">{vendor.city}, {vendor.state}</p>
                                <p className="text-slate-400 text-[12px] mt-0.5">ZIP: {vendor.zipcode}</p>
                            </div>

                            {/* State */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_16px_rgb(0,0,0,0.03)] p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                                        <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" /></svg>
                                    </div>
                                    <h3 className="font-black text-slate-800 text-[14px]">State</h3>
                                </div>
                                <p className="text-slate-600 text-[13px] font-semibold">{vendor.state}</p>
                            </div>
                            
                            {/* Website */}
                            {vendor.website && (
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_16px_rgb(0,0,0,0.03)] p-5 col-span-1 sm:col-span-2">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                                            <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg>
                                        </div>
                                        <h3 className="font-black text-slate-800 text-[14px]">Website</h3>
                                    </div>
                                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline text-[13px] font-semibold break-all">
                                        {vendor.website}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Inventory / Services */}
                        {(mergedParts.length > 0 || mergedBrands.length > 0) && (
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_16px_rgb(0,0,0,0.03)] p-6">
                                <h2 className="font-black text-slate-900 text-[16px] mb-4 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>
                                    </div>
                                    Parts & Services Inventory
                                </h2>
                                
                                {mergedParts.length > 0 && (
                                    <div className="mb-4">
                                        <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-2">Parts / Services Offered</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {mergedParts.map((service, idx) => (
                                                <span key={`srv-${idx}`} className="bg-slate-50 border border-slate-100 text-slate-600 px-3 py-1 rounded-full text-[13px] font-medium">
                                                    {service}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {mergedBrands.length > 0 && (
                                    <div>
                                        <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-2">Brands Supported</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {mergedBrands.map((brand, idx) => (
                                                <span key={`brnd-${idx}`} className="bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-full text-[13px] font-bold">
                                                    {brand}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Yard Photos */}
                        {vendor.images && vendor.images.length > 0 && (() => {
                            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                            const resolveImg = (img) => {
                                if (!img) return null;
                                const raw = img.url || img;
                                if (typeof raw !== 'string') return null;
                                if (raw.startsWith('http')) return raw;
                                return `${API_BASE}${raw.startsWith('/') ? '' : '/'}${raw}`;
                            };
                            return (
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_16px_rgb(0,0,0,0.03)] p-6">
                                    <h2 className="font-black text-slate-900 text-[16px] mb-4 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                                        </div>
                                        Yard Photos
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {vendor.images.map((imgItem, idx) => {
                                            const src = resolveImg(imgItem);
                                            if (!src) return null;
                                            return (
                                                <a key={idx} href={src} target="_blank" rel="noopener noreferrer"
                                                   className="aspect-video bg-slate-100 rounded-xl overflow-hidden shadow-sm group relative block">
                                                    <img src={src} alt={`${vendor.name} yard photo ${idx + 1}`}
                                                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                         onError={(e) => { e.currentTarget.closest('a').style.display = 'none'; }} />
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Customer Review Snippet */}
                        {vendor.review_snippet && (
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" /></svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-black text-slate-900 text-[14px] mb-1.5">Customer Review</h3>
                                        <p className="text-slate-600 text-[13px] italic leading-relaxed">"{vendor.review_snippet}"</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Map */}
                        <LocationMap
                            address={vendor.address}
                            city={vendor.city}
                            state={vendor.state}
                            zipcode={vendor.zipcode}
                            name={vendor.name}
                            theme="light"
                        />
                    </div>

                    {/* Right Column — Quote Form */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            {/* Form Card */}
                            <div className="bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-2xl p-6">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgb(37,99,235,0.3)]">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                    </div>
                                    <div>
                                        <h2 className="font-black text-slate-900 text-[16px]" style={{ fontFamily: "'Outfit', sans-serif" }}>Get a Quote</h2>
                                        <p className="text-[11px] text-slate-400 font-medium">Free, no-obligation</p>
                                    </div>
                                </div>
                                <p className="text-slate-500 text-[13px] mb-5 leading-relaxed">
                                    Fill out the form below to request a quote from <span className="font-bold text-slate-700">{vendor.name}</span>
                                </p>
                                <LeadForm vendorName={vendor.name} mode="vendor" />
                            </div>

                            {/* Back Button */}
                            <button
                                onClick={() => navigate('/vendors')}
                                className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[14px] rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                                Back to All Vendors
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default VendorDetail;
