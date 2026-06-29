import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../hooks/useData';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LeadForm from '../components/LeadForm';
import LocationMap from '../components/LocationMap';
import SEO from '../components/SEO';
import { getLocalBusinessSchema, getBreadcrumbSchema } from '../utils/structuredData';

const JunkyardDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: junkyards } = useData('data_junkyards.json');

    const vendor = junkyards?.find(j => j.id === parseInt(id));

    if (!junkyards) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 text-blue-600">
                    <svg fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                </div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col">
                <Navbar />
                <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white border border-slate-100 rounded-full mb-6 shadow-sm">
                        <svg className="w-10 h-10 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Junkyard Not Found</h1>
                    <p className="text-slate-500 font-medium mb-8">The junkyard you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/browse')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-[0_4px_14px_rgb(37,99,235,0.3)] inline-flex items-center gap-2"
                    >
                        ← Browse All Yards
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const localBusinessSchema = vendor ? getLocalBusinessSchema({
        name: vendor.name,
        address: vendor.address,
        city: vendor.city,
        state: vendor.state,
        zipcode: vendor.zipcode,
        description: vendor.description,
        rating: vendor.rating,
        logo: vendor.logo,
        id: vendor.id
    }) : null;

    const breadcrumbSchema = vendor ? getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Browse', url: '/browse' },
        { name: vendor.name, url: `/junkyard/${vendor.id}` }
    ]) : null;

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <SEO
                title={vendor ? `${vendor.name} - Auto Salvage Yard in ${vendor.city}, ${vendor.state}` : 'Junkyard Details'}
                description={vendor?.description || `Find used auto parts at ${vendor?.name}.`}
                canonicalUrl={`/junkyard/${id}`}
                structuredData={[localBusinessSchema, breadcrumbSchema]}
            />
            <Navbar />

            {/* Breadcrumb */}
            <div className="bg-white border-b border-slate-100 pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-slate-500">
                        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        <Link to="/browse" className="hover:text-blue-600 transition-colors">Browse</Link>
                        <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        <span className="text-slate-900">{vendor.name}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left - Vendor Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Profile Card */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_40px_rgb(0,0,0,0.04)] p-8">
                            <div className="flex flex-col sm:flex-row items-start gap-6">
                                {/* Vendor Logo Avatar */}
                                <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-slate-50 border border-slate-100 p-3 flex items-center justify-center">
                                    {vendor.logo ? (
                                        <img
                                            src={vendor.logo} alt={vendor.name}
                                            className="max-w-full max-h-full object-contain"
                                            onError={(e) => { e.target.src = '/images/logo-placeholder.png'; }}
                                        />
                                    ) : (
                                        <span className="text-3xl font-black text-slate-300">{vendor.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 border border-green-100">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        Verified Yard
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        {vendor.name}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-4 text-[13px] font-bold text-slate-500">
                                        <div className="flex items-center gap-1 text-slate-900 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            {vendor.rating}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                            {vendor.city}, {vendor.state}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {vendor.description && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgb(0,0,0,0.02)] p-8">
                                <h2 className="text-[15px] font-black uppercase text-slate-800 tracking-wider mb-4 border-b border-slate-100 pb-2">About This Vendor</h2>
                                <p className="text-slate-600 text-[15px] leading-relaxed font-medium">
                                    {vendor.description}
                                </p>
                            </div>
                        )}

                        {/* Location Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-start gap-4 shadow-[0_2px_12px_rgb(0,0,0,0.02)]">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                </div>
                                <div>
                                    <h3 className="font-black text-[13px] uppercase tracking-wider text-slate-800 mb-1">Full Address</h3>
                                    <p className="text-slate-600 text-sm font-medium">{vendor.address}<br/>{vendor.city}, {vendor.state} {vendor.zipcode}</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col shadow-[0_2px_12px_rgb(0,0,0,0.02)] relative overflow-hidden h-[120px]">
                                {/* Mini map preview visual */}
                                <div className="absolute inset-0 bg-slate-50 opacity-50 z-0" style={{ backgroundImage: 'linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                <div className="relative z-10 flex items-center justify-center w-full h-full">
                                    <span className="bg-white border border-slate-200 shadow-sm rounded-full px-4 py-1.5 text-[11px] font-black text-slate-800 tracking-wider">MAP VIEW</span>
                                </div>
                            </div>
                        </div>

                        {/* Location Map Interactive */}
                        <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-[0_4px_24px_rgb(0,0,0,0.04)] bg-white h-[400px]">
                            <LocationMap
                                address={vendor.address}
                                city={vendor.city}
                                state={vendor.state}
                                zipcode={vendor.zipcode}
                                name={vendor.name}
                            />
                        </div>
                    </div>

                    {/* Right - Contact LeadForm */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 bg-white rounded-3xl border border-slate-200 shadow-[0_8px_40px_rgb(0,0,0,0.08)] p-1">
                            <div className="bg-slate-50 rounded-[22px] p-6 h-full">
                                <div className="mb-6">
                                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                        Get a Quote
                                    </h2>
                                    <p className="text-[13px] font-medium text-slate-500">Contact <span className="font-bold text-slate-700">{vendor.name}</span> directly.</p>
                                </div>
                                <div className="bg-white rounded-xl border border-slate-200 p-1">
                                    <LeadForm vendorName={vendor.name} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default JunkyardDetail;
