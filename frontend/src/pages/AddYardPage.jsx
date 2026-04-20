import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileAdBanner from '../components/MobileAdBanner';
import { api } from '../services/api';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingButton } from '../components/vendor/UIElements';

export default function AddYardPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [cmsData, setCmsData] = useState({});

    const [formData, setFormData] = useState({
        // Account Information
        business_name: '',
        contact_name: '',
        email: '',
        phone: '',
        website: '',
        // Location
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'United States',
        // Services & Business Details
        services: '',
        brands: '',
        parts_categories: '',
        description: '',
        // Media
        logo: null
    });

    useEffect(() => {
        const fetchCMS = async () => {
            try {
                const response = await api.cms.getContent('add_a_yard');
                const contentMap = {};
                if (response && response.data) {
                    response.data.forEach(item => {
                        contentMap[item.key] = item.value;
                    });
                    setCmsData(contentMap);
                }
            } catch (err) {
                console.error('Failed to fetch CMS content:', err);
            }
        };
        fetchCMS();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'logo' && files.length > 0) {
            setFormData(prev => ({ ...prev, logo: files[0] }));
        }
    };

    const steps = [
        { 
            number: 1, 
            title: cmsData.step1_title || 'Basic Info', 
            subtitle: cmsData.step1_subtitle || 'Create your profile',
            icon: '🏢' 
        },
        { 
            number: 2, 
            title: cmsData.step2_title || 'Location', 
            subtitle: cmsData.step2_subtitle || 'Where are you located?',
            icon: '📍' 
        },
        { 
            number: 3, 
            title: cmsData.step3_title || 'Services', 
            subtitle: cmsData.step3_subtitle || 'Business offerings',
            icon: '🛠️' 
        },
        { 
            number: 4, 
            title: cmsData.step4_title || 'Review', 
            subtitle: cmsData.step4_subtitle || 'Final check',
            icon: '✅' 
        }
    ];

    const validateStep = (currentStep) => {
        setError('');
        switch (currentStep) {
            case 1:
                if (!formData.business_name || formData.business_name.length < 3) {
                    setError('Business name must be at least 3 characters');
                    return false;
                }
                if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
                    setError('Valid email is required');
                    return false;
                }
                if (!formData.phone) {
                    setError('Phone number is required');
                    return false;
                }
                break;
            case 2:
                if (!formData.address || !formData.city || !formData.state || !formData.zip_code) {
                    setError('All location fields are required');
                    return false;
                }
                break;
            case 3:
                if (!formData.services || !formData.description) {
                    setError('Services and Description are required');
                    return false;
                }
                break;
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(step + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        setStep(step - 1);
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(step)) return;

        setLoading(true);
        setError('');

        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'logo' && formData[key]) {
                    submitData.append(key, formData[key]);
                } else if (formData[key] !== null) {
                    submitData.append(key, formData[key]);
                }
            });

            await api.submitYard(submitData);
            setSuccess(true);
        } catch (err) {
            console.error('Submission error:', err);
            setError(err.response?.data?.error || 'Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-slate-50 pt-32 pb-20 flex items-center justify-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-12 rounded-2xl shadow-xl max-w-2xl text-center"
                    >
                        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">Application Submitted!</h2>
                        <p className="text-slate-600 mb-8">
                            Thank you for joining our platform. You will be able to manage your Premium Ads and inventory from your Dashboard once approved.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => navigate('/')} className="vendor-btn vendor-btn-secondary">
                                Back to Home
                            </button>
                            <button onClick={() => navigate('/signin')} className="vendor-btn vendor-btn-primary">
                                Go to Vendor Login
                            </button>
                        </div>
                    </motion.div>
                </div>
            </>
        );
    }

    return (
        <>
            <SEO title="List Your Junkyard" description="Partner with us" canonicalUrl="/add-a-yard" noindex={true} />
            <Navbar />

            <div className="bg-slate-50 min-h-screen pt-24 pb-20">
                <div className="max-w-4xl mx-auto px-4">
                    
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-slate-800 mb-4">Vendor Onboarding</h1>
                        <p className="text-slate-600">Join thousands of yards expanding their business online.</p>
                    </div>

                    {/* Stepper */}
                    <div className="flex justify-between items-center mb-12 px-4">
                        {steps.map((s, idx) => (
                            <div key={s.number} className="flex flex-col items-center relative z-10 flex-1">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-colors ${
                                    step >= s.number ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border-2 border-slate-200'
                                }`}>
                                    {step > s.number ? '✓' : s.number}
                                </div>
                                <span className={`text-sm mt-3 font-medium ${step >= s.number ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {s.title}
                                </span>
                                {idx < steps.length - 1 && (
                                    <div className="absolute top-6 left-[50%] w-full h-[2px] -z-10 bg-slate-200">
                                        <div className="h-full bg-blue-600 transition-all" style={{ width: step > s.number ? '100%' : '0%' }}></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-slate-800">{steps[step-1].title}</h2>
                                    <p className="text-slate-500">{steps[step-1].subtitle}</p>
                                </div>

                                {step === 1 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Business Name *</label>
                                            <input type="text" name="business_name" value={formData.business_name} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="E.g., ABC Auto Salvage" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Name *</label>
                                            <input type="text" name="contact_name" value={formData.contact_name} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number *</label>
                                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Website (Optional)</label>
                                            <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Street Address *</label>
                                            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">City *</label>
                                            <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">State *</label>
                                            <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="TX" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">ZIP Code *</label>
                                            <input type="text" name="zip_code" value={formData.zip_code} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Core Services *</label>
                                            <textarea name="services" value={formData.services} onChange={handleChange} rows="3" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="We specialize in late model imports..." />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Business Description *</label>
                                            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Family owned since 1995..." />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Business Logo</label>
                                            <input type="file" name="logo" accept="image/*" onChange={handleFileChange} className="w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                        <h3 className="text-lg font-bold text-slate-800 mb-4">Review Information</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-slate-500">Business Name</p>
                                                <p className="font-semibold text-slate-800">{formData.business_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Contact</p>
                                                <p className="font-semibold text-slate-800">{formData.contact_name} ({formData.phone})</p>
                                            </div>
                                            <div className="col-span-2 mt-2 pt-2 border-t border-slate-200">
                                                <p className="text-slate-500">Address</p>
                                                <p className="font-semibold text-slate-800">{formData.address}, {formData.city}, {formData.state} {formData.zip_code}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100">
                            {step > 1 ? (
                                <button type="button" onClick={prevStep} className="px-6 py-2 text-slate-600 font-medium hover:text-slate-900 transition-colors">
                                    Back
                                </button>
                            ) : <div></div>}

                            {step < 4 ? (
                                <button type="button" onClick={nextStep} className="vendor-btn vendor-btn-primary px-8">
                                    Continue
                                </button>
                            ) : (
                                <LoadingButton isLoading={loading} onClick={handleSubmit} className="!bg-green-600 hover:!bg-green-700 text-white px-8">
                                    Submit Application
                                </LoadingButton>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
