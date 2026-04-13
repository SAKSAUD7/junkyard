import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeadForm from '../components/LeadForm';
import LocationMap from '../components/LocationMap';
import SEO from '../components/SEO';
import Rating from '../components/Rating';
import VendorBadges from '../components/VendorBadges';
import { getLocalBusinessSchema, getBreadcrumbSchema } from '../utils/structuredData';
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
                let targetId = id;
                if (!targetId && params.slug) {
                    const match = params.slug.match(/^(\d+)-/);
                    if (match && match[1]) targetId = match[1];
                }
                if (targetId) {
                    const data = await api.getVendor(targetId);
                    setVendor(data);
                    setError(null);
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
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0b0d' }}>
                <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
            </div>
        );
    }

    if (error || !vendor) {
        return (
            <div className="min-h-screen" style={{ background: '#0a0b0d' }}>
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-white/10 mb-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <svg className="w-10 h-10 text-white/20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4">Vendor Not Found</h1>
                    <p className="text-white/50 mb-8 max-w-md mx-auto">The junkyard or auto salvage yard you're looking for doesn't exist or has been removed.</p>
                    <button onClick={() => navigate('/junkyards')} className="font-bold text-black px-8 py-3 rounded-xl transition-all shadow-lg" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
                        ← Browse All Vendors
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const logoUrl = getLogoUrl(vendor.logo);
    const localBusinessSchema = getLocalBusinessSchema({
        name: vendor.name, address: vendor.address, city: vendor.city, state: vendor.state,
        zipcode: vendor.zipcode, description: vendor.description, rating: vendor.rating, logo: logoUrl
    });
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: 'Home', url: '/' }, { name: 'Junkyards', url: '/junkyards' }, { name: vendor.name, url: `/vendors/${vendor.id}` }
    ]);

    return (
        <div className="min-h-screen" style={{ background: '#0a0b0d' }}>
            <SEO
                title={`${vendor.name} - Auto Salvage Yard in ${vendor.city}, ${vendor.state}`}
                description={vendor.description || `Find used auto parts at ${vendor.name} in ${vendor.city}, ${vendor.state}. ${vendor.rating_stars || 5} star rating. Get a quote today!`}
                canonical={`/vendors/${vendor.id}`}
                schema={{ '@context': 'https://schema.org', '@graph': [localBusinessSchema, breadcrumbSchema] }}
            />
            <Navbar />

            {/* Breadcrumb */}
            <div className="border-b border-white/[8%] sticky top-16 md:top-20 z-30" style={{ background: 'rgba(10,11,13,0.9)', backdropFilter: 'blur(20px)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-2 text-xs md:text-sm text-white/40">
                        <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
                        <span className="text-white/20">/</span>
                        <Link to="/junkyards" className="hover:text-amber-400 transition-colors">Junkyards</Link>
                        <span className="text-white/20">/</span>
                        <span className="text-amber-400 font-semibold truncate">{vendor.name}</span>
                    </div>
                </div>
            </div>

            <div className="relative pt-6 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column - Vendor Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                <div className="rounded-2xl border border-white/[8%] overflow-hidden relative" style={{ background: '#111318' }}>
                                    {/* Top ambient glow */}
                                    <div className="absolute top-0 inset-x-0 h-1" style={{ background: 'linear-gradient(90deg, #f59e0b, #ea580c)' }} />

                                    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                                        {/* Logo */}
                                        <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/5 border border-white/10 p-3 md:p-4 flex items-center justify-center">
                                            {logoUrl ? (
                                                <img src={logoUrl} alt={vendor.name} className="max-w-full max-h-full object-contain" onError={e => { e.target.src = '/images/logo-placeholder.png'; }} />
                                            ) : (
                                                <svg className="w-12 h-12 text-white/20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" /></svg>
                                            )}
                                        </div>

                                        <div className="flex-1 w-full">
                                            <div className="mb-3">
                                                <VendorBadges isTopRated={vendor.is_top_rated} isFeatured={vendor.is_featured} />
                                            </div>
                                            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">{vendor.name}</h1>

                                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-white/50 text-sm mb-4">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    {vendor.city}, {vendor.state} {vendor.zipcode}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    Est. 2005
                                                </div>
                                            </div>

                                            <Rating stars={vendor.rating_stars || 5} percentage={vendor.rating_percentage || 100} size="lg" showPercentage={true} value={vendor.rating || '5.0'} theme="dark" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {vendor.description && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                                    <div className="rounded-2xl border border-white/[8%] p-6 md:p-8" style={{ background: '#111318' }}>
                                        <h2 className="text-xl font-bold text-white mb-4">About This Junkyard</h2>
                                        <p className="text-white/50 leading-relaxed text-sm md:text-base">{vendor.description}</p>
                                    </div>
                                </motion.div>
                            )}

                            {vendor.review_snippet && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                                    <div className="rounded-2xl border border-amber-500/20 p-6 md:p-8 relative overflow-hidden" style={{ background: 'rgba(245,158,11,0.05)' }}>
                                        <div className="absolute top-4 right-6 text-6xl font-black opacity-10 text-amber-500" style={{ fontFamily: 'serif' }}>"</div>
                                        <div className="flex gap-4 relative z-10">
                                            <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-500 font-bold">
                                                C
                                            </div>
                                            <div>
                                                <Rating stars={5} size="sm" showValue={false} showPercentage={false} theme="dark" />
                                                <p className="text-white/70 italic mt-2 leading-relaxed text-sm md:text-base">"{vendor.review_snippet}"</p>
                                                <p className="text-white/30 text-xs mt-2 uppercase tracking-widest font-semibold">— Verified Customer</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Location Map */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                                <div className="rounded-2xl border border-white/[8%] overflow-hidden" style={{ background: '#111318' }}>
                                    <div className="p-6 md:p-8 border-b border-white/5">
                                        <h2 className="text-xl font-bold text-white mb-2">Location</h2>
                                        <p className="text-white/50 text-sm">{vendor.address}, {vendor.city}, {vendor.state} {vendor.zipcode}</p>
                                    </div>
                                    <LocationMap address={`${vendor.address}, ${vendor.city}, ${vendor.state} ${vendor.zipcode}`} name={vendor.name} />
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column - Sticky Quote Form */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-28 lg:top-36 xl:top-40 z-20">
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                                    <div className="rounded-2xl border border-amber-500/30 overflow-hidden shadow-2xl relative" style={{ background: 'rgba(10,11,13,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(245,158,11,0.1)' }}>
                                        {/* Amber accent overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 pointer-events-none" />

                                        <div className="p-6 border-b border-white/10 relative z-10 text-center">
                                            <div className="inline-block p-2 rounded-xl bg-amber-500/10 text-amber-500 mb-3">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                            <h2 className="text-2xl font-black text-white mb-1">Request a Quote</h2>
                                            <p className="text-white/40 text-sm">Directly from {vendor.name}</p>
                                        </div>

                                        <div className="p-6 relative z-10">
                                            <LeadForm layout="vertical" vendorId={id} showTitle={false} />
                                            <p className="text-center text-xs text-white/30 mt-4 leading-relaxed">
                                                By submitting, you agree to share your request with {vendor.name} and receive quotes via email or text.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-center gap-2 text-white/30 text-xs">
                                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                        Your information is secure
                                    </div>
                                </motion.div>
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
