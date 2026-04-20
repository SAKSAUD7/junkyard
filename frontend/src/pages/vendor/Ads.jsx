import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vendorAdApi } from '../../services/vendorApi';
import { api } from '../../services/api';
import { LoadingButton, EmptyState } from '../../components/vendor/UIElements';

const DEFAULT_PLANS = [
    {
        id: 'premium',
        name: 'Premium Plan',
        price: 99,
        color: 'from-purple-500 to-indigo-600',
        popular: true,
        features: [
            'Top placement in all search results',
            'Featured rotating Homepage Banner',
            'Priority Lead generation mapping',
            '"Top Rated" trusted vendor badge'
        ]
    },
    {
        id: 'standard',
        name: 'Standard Plan',
        price: 49,
        color: 'from-blue-500 to-cyan-500',
        popular: false,
        features: [
            'Elevated search standing',
            '"Featured" vendor status badge',
            'Unlimited profile impressions',
            'Dashboard analytics unlocked'
        ]
    },
    {
        id: 'compact',
        name: 'Compact Listing',
        price: 29,
        color: 'from-amber-400 to-orange-500',
        popular: false,
        features: [
            'Highlighted layout aesthetic',
            'Verified badge on profile',
            'Mobile-optimized profile snippet'
        ]
    },
    {
        id: 'minimal',
        name: 'Minimal Tier',
        price: 19,
        color: 'from-emerald-400 to-teal-500',
        popular: false,
        features: [
            'Basic marketplace visibility',
            'Standard SEO indexing',
            'Base catalog linkage'
        ]
    }
];

export default function Ads() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [activeAd, setActiveAd] = useState(null);
    const [fetchingActive, setFetchingActive] = useState(true);

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [duration, setDuration] = useState(30);
    const [placement, setPlacement] = useState('featured');
    
    // CMS Data
    const [cmsData, setCmsData] = useState({});
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);

    useEffect(() => {
        const fetchCMS = async () => {
            try {
                const response = await api.cms.getContent('vendor_portal');
                const contentMap = {};
                if (response?.data) {
                    response.data.forEach(item => { contentMap[item.key] = item.value; });
                    setCmsData(contentMap);
                    
                    if (contentMap.ad_plans) {
                        try {
                            const parsedPlans = JSON.parse(contentMap.ad_plans);
                            if (Array.isArray(parsedPlans) && parsedPlans.length > 0){
                                setSubscriptionPlans(parsedPlans);
                                return; // Successfully ingested dynamic CMS array
                            }
                        } catch (e) { console.error('Failed to parse ad_plans JSON:', e); }
                    }
                }
            } catch (err) {
                console.error('Failed to fetch CMS configuration:', err);
            }
            // Execute Fallback Sequence if dynamic CMS is empty
            setSubscriptionPlans(DEFAULT_PLANS);
        };

        const fetchCurrentAd = async () => {
            try {
                const response = await vendorAdApi.getCurrentAd();
                // Destructure active_plan from the backend's wrapper response
                if (response.data && response.data.active_plan && response.data.active_plan.status === 'active') {
                    setActiveAd(response.data.active_plan);
                }
            } catch (err) {
                // If no active ad, backend might return 404
            } finally {
                setFetchingActive(false);
            }
        };

        fetchCMS();
        fetchCurrentAd();
    }, []);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            // Mocking payment processing delay
            await new Promise(r => setTimeout(r, 2000));
            await vendorAdApi.purchaseAd({
                plan_type: selectedPlan.id,
                duration: duration,
                placement: placement,
                payment_status: 'completed',
                transaction_id: 'txn_' + Math.random().toString(36).substr(2, 9)
            });
            window.location.reload();
        } catch (err) {
            console.error('Checkout failed', err);
            alert(err.response?.data?.error || 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingActive) {
        return <div className="p-8"><div className="animate-pulse bg-slate-200 h-64 rounded-2xl w-full"></div></div>;
    }

    if (activeAd) {
        return (
            <div className="p-8">
                <div className="vendor-glass-card p-10 bg-gradient-to-r from-blue-50 to-teal-50">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-black text-slate-800">Your Active Campaign</h2>
                        <span className="vendor-badge vendor-badge-success py-2 px-4 shadow-sm animate-pulse">Running</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                            <p className="text-sm text-slate-500 font-bold mb-2">Plan Tier</p>
                            <p className="text-2xl font-black capitalize text-blue-600">{activeAd.plan_type}</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                            <p className="text-sm text-slate-500 font-bold mb-2">Started On</p>
                            <p className="text-xl font-bold text-slate-800">{new Date(activeAd.start_date).toLocaleDateString()}</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                            <p className="text-sm text-slate-500 font-bold mb-2">Ends On</p>
                            <p className="text-xl font-bold text-slate-800">{new Date(activeAd.end_date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    <p className="text-slate-600 text-sm">To change or extend your plan, please wait until the current billing cycle expires or contact priority vendor support.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-10 text-center">
                {cmsData.header_title ? (
                    <h1 className="text-4xl font-black text-slate-800 mb-3" dangerouslySetInnerHTML={{ __html: cmsData.header_title }} />
                ) : (
                    <h1 className="text-4xl font-black text-slate-800 mb-3">Marketplace 
                        <span className="vendor-gradient-text ml-2">Advertising</span>
                    </h1>
                )}
                
                <p className="text-slate-500">
                    {cmsData.header_desc || "Boost your yard's visibility globally and dominate the search results."}
                </p>
            </div>

            {/* Stepper Header */}
            <div className="flex justify-center mb-10">
                {[1,2,3,4].map(s => (
                    <div key={s} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                            step >= s ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-200 text-slate-400'
                        }`}>
                            {step > s ? '✓' : s}
                        </div>
                        {s < 4 && <div className={`w-16 h-1 mx-2 transition-all ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`}></div>}
                    </div>
                ))}
            </div>

            <div className="vendor-card">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Step 1: Browse Plans */}
                        {step === 1 && (
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Select a Plan</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {subscriptionPlans.map(plan => (
                                        <div 
                                            key={plan.id}
                                            onClick={() => { setSelectedPlan(plan); setStep(2); }}
                                            className={`relative cursor-pointer rounded-2xl p-8 border-2 transition-all hover:-translate-y-1 ${
                                                selectedPlan?.id === plan.id ? 'border-blue-600 shadow-xl bg-blue-50/20' : 'border-slate-200 hover:shadow-md'
                                            }`}
                                        >
                                            {plan.popular && (
                                                <div className="absolute top-0 right-8 transform -translate-y-1/2">
                                                    <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                        Most Popular
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`inline-block px-4 py-1.5 rounded-lg bg-gradient-to-r ${plan.color} mb-6`}>
                                                <span className="text-white font-bold text-sm tracking-wide">{plan.name}</span>
                                            </div>
                                            <div className="mb-6 border-b border-slate-100 pb-6">
                                                <span className="text-5xl font-black text-slate-800">${plan.price}</span>
                                                <span className="text-slate-500 font-medium">/mo</span>
                                            </div>
                                            <ul className="space-y-4">
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className="flex gap-3 text-slate-600 font-medium items-center">
                                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Duration */}
                        {step === 2 && (
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Choose Duration</h2>
                                <div className="max-w-xl mx-auto space-y-4">
                                    {[
                                        { label: '1 Month', value: 30, discount: 0 },
                                        { label: '3 Months', value: 90, discount: 10 },
                                        { label: '6 Months', value: 180, discount: 20 },
                                    ].map(opt => (
                                        <div 
                                            key={opt.value}
                                            onClick={() => setDuration(opt.value)}
                                            className={`flex items-center justify-between p-6 rounded-xl cursor-pointer border-2 transition-all ${
                                                duration === opt.value ? 'bg-blue-50 border-blue-600' : 'border-slate-200 hover:border-blue-300'
                                            }`}
                                        >
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-800">{opt.label}</h3>
                                                {opt.discount > 0 && <span className="text-green-600 text-sm font-bold mt-1 block">Save {opt.discount}%!</span>}
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                duration === opt.value ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                                            }`}>
                                                {duration === opt.value && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Placement */}
                        {step === 3 && (
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Select Placement</h2>
                                <div className="max-w-xl mx-auto space-y-4">
                                    {[
                                        { id: 'featured', label: 'Featured Search Results', desc: 'Appear at the very top of part searches' },
                                        { id: 'homepage', label: 'Homepage Banner', desc: 'High visibility across the main landing page' },
                                        { id: 'both', label: 'Maximum Visibility (Both)', desc: 'Dominate both search and homepage traffic' },
                                    ].map(opt => (
                                        <div 
                                            key={opt.id}
                                            onClick={() => setPlacement(opt.id)}
                                            className={`flex items-center justify-between p-6 rounded-xl cursor-pointer border-2 transition-all ${
                                                placement === opt.id ? 'bg-blue-50 border-blue-600' : 'border-slate-200 hover:border-blue-300'
                                            }`}
                                        >
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-800">{opt.label}</h3>
                                                <span className="text-slate-500 text-sm mt-1 block">{opt.desc}</span>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                placement === opt.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                                            }`}>
                                                {placement === opt.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Checkout */}
                        {step === 4 && (
                            <div className="max-w-2xl mx-auto">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Secure Checkout</h2>
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-8">
                                    <div className="flex justify-between items-center mb-4 text-lg">
                                        <span className="text-slate-600 font-medium">Selected Plan</span>
                                        <span className="font-bold text-slate-800">{selectedPlan.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-4 text-lg border-b border-slate-200 pb-4">
                                        <span className="text-slate-600 font-medium">Placement</span>
                                        <span className="font-bold text-slate-800 capitalize">{placement}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-6 text-lg border-b border-slate-200 pb-6">
                                        <span className="text-slate-600 font-medium">Duration</span>
                                        <span className="font-bold text-slate-800">{duration / 30} Month(s)</span>
                                    </div>
                                    <div className="flex justify-between items-center text-2xl font-black">
                                        <span className="text-slate-800">Total Due</span>
                                        <span className="text-blue-600">${selectedPlan.price * (duration / 30)}</span>
                                    </div>
                                </div>
                                
                                <div className="text-center rounded-xl overflow-hidden shadow-sm border border-slate-200">
                                    {/* Mock Credit Card UI representation */}
                                    <div className="bg-slate-800 p-6 text-left">
                                        <p className="text-slate-400 text-sm uppercase tracking-widest mb-4">Payment Method</p>
                                        <div className="font-mono text-white text-lg tracking-widest mb-4">**** **** **** 4242</div>
                                        <div className="flex justify-between text-slate-300 text-sm w-1/2">
                                            <span>EXP 12/28</span>
                                            <span>CVC ***</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Footer Controls */}
                <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100">
                    {step > 1 ? (
                        <button onClick={() => setStep(step - 1)} className="px-6 py-2 text-slate-600 font-medium hover:text-slate-900 transition-colors">
                            Back
                        </button>
                    ) : <div></div>}
                    
                    {step < 4 ? (
                        <button onClick={() => setStep(step + 1)} className="vendor-btn vendor-btn-primary px-10">
                            Continue
                        </button>
                    ) : (
                        <LoadingButton isLoading={loading} onClick={handleCheckout} className="!bg-green-600 hover:!bg-green-700 text-white px-10 shadow-lg shadow-green-500/30">
                            Pay & Activate Securely
                        </LoadingButton>
                    )}
                </div>
            </div>
        </div>
    );
}
