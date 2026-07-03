import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileAdBanner from '../components/MobileAdBanner';
import { api } from '../services/api';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';

const PAYMENT_OPTIONS = ['Cash', 'Credit Card', 'Debit Card', 'PayPal', 'Wire Transfer', 'Check'];
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function AddYardPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [cmsData, setCmsData] = useState({});

    const [formData, setFormData] = useState({
        business_name: '', email: '', phone: '', toll_free: '', fax: '', website: '',
        owner_first_name: '', owner_last_name: '', owner_phone: '', owner_email: '',
        address: '', city: '', state: '', zip_code: '', country: 'United States',
        services: '', brands: '', parts_categories: '', description: '', logo: null,
        payment_methods: [],
        business_hours: DAYS.reduce((acc, day) => ({ ...acc, [day]: { open: '09:00', close: '17:00', closed: day === 'sunday' } }), {}),
        subscription_plan: 'standard'
    });

    useEffect(() => {
        const fetchCMS = async () => {
            try {
                const response = await api.cms.getPageContent('add_a_yard');
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

    const handlePaymentChange = (method) => {
        setFormData(prev => {
            const methods = prev.payment_methods.includes(method)
                ? prev.payment_methods.filter(m => m !== method)
                : [...prev.payment_methods, method];
            return { ...prev, payment_methods: methods };
        });
    };

    const handleHoursChange = (day, field, value) => {
        setFormData(prev => ({
            ...prev,
            business_hours: {
                ...prev.business_hours,
                [day]: { ...prev.business_hours[day], [field]: value }
            }
        }));
    };

    const steps = [
        { number: 1, title: cmsData.step1_title || 'Business Info', subtitle: cmsData.step1_sub || 'Basic details' },
        { number: 2, title: cmsData.step2_title || 'Location & Owner', subtitle: cmsData.step2_sub || 'Where and who' },
        { number: 3, title: cmsData.step3_title || 'Services & Setup', subtitle: cmsData.step3_sub || 'What you do' },
        { number: 4, title: cmsData.step4_title || 'Plan & Review', subtitle: cmsData.step4_sub || 'Final check' }
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
                if (!formData.services || !formData.brands || !formData.description) { setError('Services, Brands, and Description are required'); return false; }
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
            
            // Generate required contact_name from owner names if available, or default to business name
            const contactName = `${formData.owner_first_name} ${formData.owner_last_name}`.trim() || formData.business_name;
            submitData.append('contact_name', contactName);

            Object.keys(formData).forEach(key => {
                if (key === 'payment_methods' || key === 'business_hours') {
                    submitData.append(key, JSON.stringify(formData[key]));
                } else if (formData[key] !== null && formData[key] !== '') {
                    submitData.append(key, formData[key]);
                }
            });
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
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>{cmsData.success_heading || 'Application Submitted!'}</h2>
                        <p className="text-slate-500 mb-8 font-medium leading-relaxed">{cmsData.success_message || 'Thank you for joining our platform. Our team will review your application and get back to you shortly. Once approved, you can manage your inventory and ads from the Vendor Portal.'}</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button onClick={() => navigate('/vendor/login')} className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-[0_8px_20px_rgb(37,99,235,0.25)]">
                                {cmsData.login_btn || 'Go to Vendor Login'}
                            </button>
                            <button onClick={() => navigate('/')} className="px-8 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition">
                                {cmsData.home_btn || 'Back to Home'}
                            </button>
                        </div>
                    </motion.div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-[#f8fafc] min-h-screen flex flex-col font-sans">
            <SEO title="List Your Junkyard" description="Partner with us" canonicalUrl="/add-a-yard" noindex={true} />
            <Navbar />

            {/* Light Hero */}
            <section className="relative pt-32 pb-16 bg-white border-b border-slate-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/80 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 bg-blue-50 border border-blue-100">
                        <span className="text-blue-600 text-[11px] font-black uppercase tracking-widest">Vendor Network</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {cmsData.title || 'Partner With JYNM'}
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
                        {cmsData.subtitle || 'List your yard and connect with thousands of buyers searching for auto parts daily.'}
                    </p>
                </div>
            </section>

            <div className="flex-grow max-w-4xl mx-auto w-full px-4 py-12">
                {/* Stepper */}
                <div className="flex items-center justify-between mb-12 relative px-4">
                    <div className="absolute top-5 left-8 right-8 h-1 bg-slate-100 -z-10 rounded-full">
                        <div className="h-full bg-blue-600 transition-all duration-500 rounded-full" style={{ width: `${((step - 1) / 3) * 100}%` }} />
                    </div>
                    {steps.map(s => (
                        <div key={s.number} className="flex flex-col items-center group">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-300 ${
                                step >= s.number ? 'bg-blue-600 text-white shadow-[0_8px_16px_rgb(37,99,235,0.3)]' : 'bg-white text-slate-400 border-2 border-slate-100'
                            }`}>
                                {step > s.number ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : s.number}
                            </div>
                            <span className={`mt-3 text-[12px] font-bold uppercase tracking-wider transition-colors duration-300 hidden sm:block ${
                                step >= s.number ? 'text-blue-600' : 'text-slate-400'
                            }`}>{s.title}</span>
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_40px_rgb(0,0,0,0.04)] overflow-hidden">
                    <div className="p-8 md:p-12">
                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold flex items-center gap-3">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                {error}
                            </div>
                        )}
                        
                        <form>
                            <AnimatePresence mode="wait">
                                <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                    
                                    {step === 1 && (
                                        <div className="space-y-8">
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{cmsData.sec1_heading || 'Business Information'}</h3>
                                                <p className="text-slate-500 font-medium">{cmsData.sec1_subheading || "Let's start with your core business details."}</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="md:col-span-2">
                                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Business Name *</label>
                                                    <input type="text" name="business_name" value={formData.business_name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[15px] font-medium transition-all" placeholder="e.g. Acme Auto Parts" />
                                                </div>
                                                <div>
                                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Business Email *</label>
                                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[15px] font-medium transition-all" placeholder="info@company.com" />
                                                </div>
                                                <div>
                                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Phone Number *</label>
                                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[15px] font-medium transition-all" placeholder="(555) 123-4567" />
                                                </div>
                                                <div>
                                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Toll Free Number</label>
                                                    <input type="tel" name="toll_free" value={formData.toll_free} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[15px] font-medium transition-all" placeholder="(800) 123-4567" />
                                                </div>
                                                <div>
                                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Fax Number</label>
                                                    <input type="tel" name="fax" value={formData.fax} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[15px] font-medium transition-all" placeholder="(555) 987-6543" />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Website URL</label>
                                                    <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[15px] font-medium transition-all" placeholder="https://www.yourdomain.com" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-8">
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{cmsData.sec2_heading || 'Location & Owner'}</h3>
                                                <p className="text-slate-500 font-medium">{cmsData.sec2_subheading || 'Where are you located and who is the main contact?'}</p>
                                            </div>
                                            
                                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                                <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">{cmsData.owner_details_title || 'Owner / Manager Details'}</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[12px] font-bold text-slate-600 mb-1.5 uppercase">First Name</label>
                                                        <input type="text" name="owner_first_name" value={formData.owner_first_name} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm font-medium" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[12px] font-bold text-slate-600 mb-1.5 uppercase">Last Name</label>
                                                        <input type="text" name="owner_last_name" value={formData.owner_last_name} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm font-medium" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[12px] font-bold text-slate-600 mb-1.5 uppercase">Owner Phone</label>
                                                        <input type="tel" name="owner_phone" value={formData.owner_phone} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm font-medium" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[12px] font-bold text-slate-600 mb-1.5 uppercase">Owner Email</label>
                                                        <input type="email" name="owner_email" value={formData.owner_email} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm font-medium" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="md:col-span-2">
                                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Street Address *</label>
                                                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[15px] font-medium" placeholder="123 Salvage Way" />
                                                </div>
                                                <div>
                                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">City *</label>
                                                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[15px] font-medium" placeholder="Detroit" />
                                                </div>
                                                <div>
                                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">State *</label>
                                                    <select name="state" value={formData.state} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[15px] font-medium appearance-none">
                                                        <option value="">Select State</option>
                                                        {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">ZIP Code *</label>
                                                    <input type="text" name="zip_code" value={formData.zip_code} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[15px] font-medium" placeholder="12345" />
                                                </div>
                                                <div>
                                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Country</label>
                                                    <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-500 cursor-not-allowed font-medium text-[15px]" readOnly />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="space-y-8">
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{cmsData.sec3_heading || 'Services & Setup'}</h3>
                                                <p className="text-slate-500 font-medium">{cmsData.sec3_subheading || "Tell customers what you offer and when you're open."}</p>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 gap-6">
                                                <div>
                                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Services Offered *</label>
                                                    <input type="text" name="services" value={formData.services} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[15px] font-medium" placeholder="Towing, Pick-a-part, Recycled Parts (comma separated)" />
                                                </div>
                                                <div>
                                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Brands Serviced *</label>
                                                    <input type="text" name="brands" value={formData.brands} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[15px] font-medium" placeholder="Ford, Toyota, Honda, All Makes (comma separated)" />
                                                </div>
                                                <div>
                                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Parts Categories (Optional)</label>
                                                    <input type="text" name="parts_categories" value={formData.parts_categories} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[15px] font-medium" placeholder="Engines, Transmissions, Body Parts" />
                                                </div>
                                                <div>
                                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Business Description *</label>
                                                    <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-[15px] font-medium resize-none" placeholder="Tell us about your salvage yard..." />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-[13px] font-bold text-slate-700 mb-3 uppercase tracking-wide">Payment Methods</label>
                                                    <div className="flex flex-wrap gap-3">
                                                        {PAYMENT_OPTIONS.map(method => (
                                                            <button 
                                                                type="button" 
                                                                key={method}
                                                                onClick={() => handlePaymentChange(method)}
                                                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${formData.payment_methods.includes(method) ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
                                                            >
                                                                {method}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                                    <label className="block text-[13px] font-bold text-slate-700 mb-4 uppercase tracking-wide">Business Hours</label>
                                                    <div className="space-y-3">
                                                        {DAYS.map(day => (
                                                            <div key={day} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100">
                                                                <div className="w-24 font-bold text-sm text-slate-700 capitalize">{day}</div>
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input type="checkbox" checked={formData.business_hours[day].closed} onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                                                                    <span className="text-xs font-bold text-slate-500 uppercase">Closed</span>
                                                                </label>
                                                                {!formData.business_hours[day].closed && (
                                                                    <div className="flex items-center gap-2 flex-1 justify-end">
                                                                        <input type="time" value={formData.business_hours[day].open} onChange={(e) => handleHoursChange(day, 'open', e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-medium" />
                                                                        <span className="text-slate-400 font-medium">to</span>
                                                                        <input type="time" value={formData.business_hours[day].close} onChange={(e) => handleHoursChange(day, 'close', e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-medium" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Business Logo</label>
                                                    <input type="file" name="logo" accept="image/*" onChange={handleFileChange} className="w-full file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 file:font-bold hover:file:bg-blue-100 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 4 && (
                                        <div className="space-y-8">
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{cmsData.sec4_heading || 'Choose Plan & Submit'}</h3>
                                                <p className="text-slate-500 font-medium">{cmsData.sec4_subheading || 'Select your listing plan and review your application.'}</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                                {[
                                                    { id: 'standard', name: cmsData.plan1_name || 'Standard Plan', desc: cmsData.plan1_desc || 'Basic directory listing', price: cmsData.plan1_price || 'Free' },
                                                    { id: 'premium', name: cmsData.plan2_name || 'Premium Plan', desc: cmsData.plan2_desc || 'Featured placement & analytics', price: cmsData.plan2_price || '$49/mo' }
                                                ].map(plan => (
                                                    <div 
                                                        key={plan.id}
                                                        onClick={() => setFormData({...formData, subscription_plan: plan.id})}
                                                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.subscription_plan === plan.id ? 'border-blue-600 bg-blue-50/50 shadow-[0_8px_20px_rgb(37,99,235,0.1)]' : 'border-slate-100 bg-white hover:border-blue-200'}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className={`font-black text-lg ${formData.subscription_plan === plan.id ? 'text-blue-700' : 'text-slate-800'}`}>{plan.name}</h4>
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.subscription_plan === plan.id ? 'border-blue-600' : 'border-slate-300'}`}>
                                                                {formData.subscription_plan === plan.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-500 mb-3">{plan.desc}</p>
                                                        <span className="inline-block px-3 py-1 bg-white rounded-lg text-sm font-bold text-slate-900 border border-slate-200">{plan.price}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                                                <div className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                                                    <span className="text-slate-500 font-bold text-[13px] uppercase">Business</span>
                                                    <span className="font-bold text-slate-900">{formData.business_name}</span>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                                                    <span className="text-slate-500 font-bold text-[13px] uppercase">Contact</span>
                                                    <span className="font-bold text-slate-900 text-right">{formData.email}</span>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                                                    <span className="text-slate-500 font-bold text-[13px] uppercase">Location</span>
                                                    <span className="font-bold text-slate-900 text-right">{formData.city}, {formData.state} {formData.zip_code}</span>
                                                </div>
                                            </div>

                                            <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl text-center">
                                                <p className="text-sm text-blue-700 font-semibold">{cmsData.terms_text || 'By submitting, you agree to our Terms of Service and Privacy Policy. A representative will contact you shortly after review.'}</p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </form>

                        <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100 gap-4">
                            <button type="button" onClick={prevStep} disabled={step === 1 || loading} className={`px-6 py-3.5 rounded-xl font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                {cmsData.back_btn || 'Back'}
                            </button>
                            
                            {step < 4 ? (
                                <button type="button" onClick={nextStep} className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-[0_4px_14px_rgb(37,99,235,0.3)] hover:bg-blue-700 hover:shadow-[0_6px_20px_rgb(37,99,235,0.4)] transition-all">
                                    {cmsData.continue_btn || 'Continue →'}
                                </button>
                            ) : (
                                <button type="button" onClick={handleSubmit} disabled={loading} className="px-8 py-3.5 bg-green-600 text-white font-bold rounded-xl shadow-[0_4px_14px_rgb(22,163,74,0.3)] hover:bg-green-700 hover:shadow-[0_6px_20px_rgb(22,163,74,0.4)] transition-all disabled:opacity-50 flex items-center gap-2">
                                    {loading && <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>}
                                    {cmsData.submit_btn || 'Submit Application'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <MobileAdBanner page="add-a-yard" />
            <Footer />
        </div>
    );
}
