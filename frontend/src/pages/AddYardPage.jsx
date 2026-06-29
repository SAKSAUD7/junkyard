import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileAdBanner from '../components/MobileAdBanner';
import { api } from '../services/api';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddYardPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [cmsData, setCmsData] = useState({});

    const [formData, setFormData] = useState({
        business_name: '', contact_name: '', email: '', phone: '', website: '',
        address: '', city: '', state: '', zip_code: '', country: 'United States',
        services: '', brands: '', parts_categories: '', description: '', logo: null
    });

    useEffect(() => {
        const fetchCMS = async () => {
            try {
                const response = await api.cms.getContent('add_a_yard');
                const contentMap = {};
                if (response?.data) {
                    response.data.forEach(item => { contentMap[item.key] = item.value; });
                    setCmsData(contentMap);
                }
            } catch (err) { console.error('Failed to fetch CMS:', err); }
        };
        fetchCMS();
    }, []);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleFileChange = (e) => {
        if (e.target.name === 'logo' && e.target.files.length > 0) {
            setFormData(prev => ({ ...prev, logo: e.target.files[0] }));
        }
    };

    const steps = [
        { number: 1, title: cmsData.step1_title || 'Basic Info', subtitle: cmsData.step1_subtitle || 'Create your profile' },
        { number: 2, title: cmsData.step2_title || 'Location', subtitle: cmsData.step2_subtitle || 'Where are you located?' },
        { number: 3, title: cmsData.step3_title || 'Services', subtitle: cmsData.step3_subtitle || 'Business offerings' },
        { number: 4, title: cmsData.step4_title || 'Review', subtitle: cmsData.step4_subtitle || 'Final check' }
    ];

    const validateStep = (currentStep) => {
        setError('');
        switch (currentStep) {
            case 1:
                if (!formData.business_name || formData.business_name.length < 3) { setError('Business name must be at least 3 characters'); return false; }
                if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) { setError('Valid email is required'); return false; }
                if (!formData.phone) { setError('Phone number is required'); return false; }
                break;
            case 2:
                if (!formData.address || !formData.city || !formData.state || !formData.zip_code) { setError('All location fields are required'); return false; }
                break;
            case 3:
                if (!formData.services || !formData.description) { setError('Services and Description are required'); return false; }
                break;
        }
        return true;
    };

    const nextStep = () => { if (validateStep(step)) { setStep(step + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
    const prevStep = () => { setStep(step - 1); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(step)) return;
        setLoading(true); setError('');
        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => { if (formData[key] !== null) submitData.append(key, formData[key]); });
            await api.submitYard(submitData);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-[#f8fafc] min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center p-4 py-20 mt-16">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-12 rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-slate-100 max-w-xl w-full text-center">
                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>{cmsData.success_title || 'Application Submitted!'}</h2>
                        <p className="text-slate-500 mb-8 font-medium leading-relaxed">{cmsData.success_message || 'Thank you for joining our platform. You will be able to manage your Premium Ads and inventory from your Dashboard once approved.'}</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button onClick={() => navigate('/signin')} className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-[0_8px_20px_rgb(37,99,235,0.25)]">
                                {cmsData.btn_login || 'Go to Login'}
                            </button>
                            <button onClick={() => navigate('/')} className="px-8 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition">
                                {cmsData.btn_home || 'Back to Home'}
                            </button>
                        </div>
                    </motion.div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-[#f8fafc] min-h-screen flex flex-col">
            <SEO title="List Your Junkyard" description="Partner with us" canonicalUrl="/add-a-yard" noindex={true} />
            <Navbar />

            {/* Light Hero */}
            <section className="relative pt-32 pb-16 bg-white border-b border-slate-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/80 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 bg-blue-50 border border-blue-100">
                        <span className="text-blue-600 text-[11px] font-black uppercase tracking-widest">Partner Network</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                        {cmsData.title || 'Vendor Onboarding'}
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
                        {cmsData.subtitle || 'Join thousands of yards expanding their business online.'}
                    </p>
                </div>
            </section>

            <div className="flex-grow max-w-3xl mx-auto w-full px-4 py-12">
                {/* Stepper */}
                <div className="flex items-center justify-between mb-12 relative px-4">
                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -z-10 -translate-y-1/2">
                        <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }} />
                    </div>
                    {steps.map(s => (
                        <div key={s.number} className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 ${
                                step >= s.number ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgb(37,99,235,0.35)]' : 'bg-white text-slate-400 border border-slate-200'
                            }`}>
                                {step > s.number ? '✓' : s.number}
                            </div>
                            <span className={`absolute -bottom-6 text-[12px] font-bold whitespace-nowrap transition-colors duration-300 hidden sm:block ${
                                step >= s.number ? 'text-blue-600' : 'text-slate-400'
                            }`}>{s.title}</span>
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bg-white flex flex-col rounded-3xl border border-slate-100 shadow-[0_8px_40px_rgb(0,0,0,0.06)] p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            {error}
                        </div>
                    )}
                    
                    <form className="add-yard-form">
                        <AnimatePresence mode="wait">
                            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                                
                                {step === 1 && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-black text-slate-900 mb-6 border-b pb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Basic Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="md:col-span-2">
                                                <label className="block text-[13px] font-bold text-slate-700 mb-2">Business Name *</label>
                                                <input type="text" name="business_name" value={formData.business_name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-[15px]" placeholder="e.g. ABC Auto Salvage" />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-bold text-slate-700 mb-2">Contact Name *</label>
                                                <input type="text" name="contact_name" value={formData.contact_name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-[15px]" placeholder="John Doe" />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-bold text-slate-700 mb-2">Website</label>
                                                <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-[15px]" placeholder="https://..." />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-bold text-slate-700 mb-2">Business Email *</label>
                                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-[15px]" placeholder="info@company.com" />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-bold text-slate-700 mb-2">Phone Number *</label>
                                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-[15px]" placeholder="(123) 456-7890" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-black text-slate-900 mb-6 border-b pb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Location Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="md:col-span-2">
                                                <label className="block text-[13px] font-bold text-slate-700 mb-2">Street Address *</label>
                                                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-[15px]" placeholder="123 Salvage Way" />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-bold text-slate-700 mb-2">City *</label>
                                                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-[15px]" placeholder="Detroit" />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-bold text-slate-700 mb-2">State *</label>
                                                <select name="state" value={formData.state} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-[15px]">
                                                    <option value="">Select State</option>
                                                    {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-bold text-slate-700 mb-2">ZIP Code *</label>
                                                <input type="text" name="zip_code" value={formData.zip_code} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-[15px]" placeholder="12345" />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-bold text-slate-700 mb-2">Country</label>
                                                <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed font-medium text-[15px]" readOnly />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-black text-slate-900 mb-6 border-b pb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Services & Media</h3>
                                        <div className="grid grid-cols-1 gap-5">
                                            <div>
                                                <label className="block text-[13px] font-bold text-slate-700 mb-2">Services Offered *</label>
                                                <input type="text" name="services" value={formData.services} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-[15px]" placeholder="Towing, Pick-a-part, Recycled Parts (comma separated)" />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-bold text-slate-700 mb-2">Specialized Categories</label>
                                                <input type="text" name="parts_categories" value={formData.parts_categories} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-[15px]" placeholder="Engines, Transmissions, Body Parts (comma separated)" />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-bold text-slate-700 mb-2">Description *</label>
                                                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-[15px]" placeholder="Tell us about your salvage yard and what makes it unique..." />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-bold text-slate-700 mb-2">Business Logo</label>
                                                <input type="file" name="logo" accept="image/*" onChange={handleFileChange} className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100 text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-black text-slate-900 mb-6 border-b pb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Review & Submit</h3>
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                                            <div className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between">
                                                <span className="text-slate-500 font-bold text-[13px] uppercase">Business Name</span>
                                                <span className="font-bold text-slate-900">{formData.business_name}</span>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between">
                                                <span className="text-slate-500 font-bold text-[13px] uppercase">Contact</span>
                                                <span className="font-bold text-slate-900 text-right">{formData.contact_name}<br/><span className="text-sm font-medium text-slate-500">{formData.email}</span></span>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between">
                                                <span className="text-slate-500 font-bold text-[13px] uppercase">Location</span>
                                                <span className="font-bold text-slate-900 text-right">{formData.city}, {formData.state} {formData.zip_code}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
                                            <p className="text-sm text-blue-700 font-medium">By submitting, you agree to our Terms of Service and Privacy Policy.</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </form>

                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 gap-4">
                        <button type="button" onClick={prevStep} disabled={step === 1 || loading} className={`px-6 py-3 rounded-xl font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            Back
                        </button>
                        
                        {step < 4 ? (
                            <button type="button" onClick={nextStep} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-[0_4px_14px_rgb(37,99,235,0.3)] hover:bg-blue-700 hover:shadow-[0_6px_20px_rgb(37,99,235,0.4)] transition-all">
                                Continue →
                            </button>
                        ) : (
                            <button type="button" onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-[0_4px_14px_rgb(22,163,74,0.3)] hover:bg-green-700 hover:shadow-[0_6px_20px_rgb(22,163,74,0.4)] transition-all disabled:opacity-50 flex items-center gap-2">
                                {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>}
                                Submit Application
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <MobileAdBanner page="add-a-yard" />
            <Footer />
        </div>
    );
}
