import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vendorAdApi } from '../../services/vendorApi';
import { api } from '../../services/api';
import { useVendorAuth } from '../../contexts/VendorAuthContext';
import { LoadingButton } from '../../components/vendor/UIElements';
import { 
    PremiumTemplate, 
    StandardTemplate, 
    CompactTemplate, 
    MinimalTemplate 
} from '../../components/AdTemplates';

const DEFAULT_PLANS = [
    {
        id: 'premium',
        name: 'Premium',
        price: 99,
        color: 'from-slate-900 to-slate-800',
        textColor: 'text-white',
        popular: true,
        features: [
            'Top placement in all search results',
            'Featured rotating Homepage Banner',
            'Priority Lead generation mapping',
            '"Top Rated" trusted vendor badge'
        ],
        Component: PremiumTemplate
    },
    {
        id: 'standard',
        name: 'Standard',
        price: 49,
        color: 'from-blue-600 to-indigo-600',
        textColor: 'text-white',
        popular: false,
        features: [
            'Elevated search standing',
            '"Featured" vendor status badge',
            'Unlimited profile impressions',
            'Dashboard analytics unlocked'
        ],
        Component: StandardTemplate
    },
    {
        id: 'compact',
        name: 'Compact',
        price: 29,
        color: 'from-amber-400 to-orange-500',
        textColor: 'text-white',
        popular: false,
        features: [
            'Highlighted layout aesthetic',
            'Verified badge on profile',
            'Mobile-optimized profile snippet'
        ],
        Component: CompactTemplate
    },
    {
        id: 'minimal',
        name: 'Minimal',
        price: 19,
        color: 'from-slate-100 to-slate-200',
        textColor: 'text-slate-800',
        popular: false,
        features: [
            'Basic marketplace visibility',
            'Standard SEO indexing',
            'Base catalog linkage'
        ],
        Component: MinimalTemplate
    }
];

export default function Ads() {
    const { vendorProfile } = useVendorAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [activeAd, setActiveAd] = useState(null);
    const [fetchingActive, setFetchingActive] = useState(true);

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [duration, setDuration] = useState(30);
    const [placement, setPlacement] = useState('featured');
    
    // CMS Data
    const [cmsData, setCmsData] = useState({});
    const [subscriptionPlans, setSubscriptionPlans] = useState(DEFAULT_PLANS);

    useEffect(() => {
        const fetchCMS = async () => {
            try {
                const response = await api.cms.getPageContent('vendor_portal');
                if (response) {
                    setCmsData(response);
                    
                    if (response.ad_plans) {
                        try {
                            const parsedPlans = JSON.parse(response.ad_plans);
                            if (Array.isArray(parsedPlans) && parsedPlans.length > 0) {
                                // Merge CMS plans with components
                                const merged = parsedPlans.map(p => {
                                    const def = DEFAULT_PLANS.find(d => d.id === p.id);
                                    return { ...def, ...p, Component: def?.Component || StandardTemplate };
                                });
                                setSubscriptionPlans(merged);
                                return;
                            }
                        } catch (e) { console.error('Failed to parse ad_plans JSON:', e); }
                    }
                }
            } catch (err) {
                console.error('Failed to fetch CMS configuration:', err);
            }
            setSubscriptionPlans(DEFAULT_PLANS);
        };

        const fetchCurrentAd = async () => {
            try {
                const response = await vendorAdApi.getCurrentAd();
                if (response.data && response.data.active_plan && response.data.active_plan.status === 'active') {
                    setActiveAd(response.data.active_plan);
                }
            } catch (err) {
                // If no active ad, backend returns 404/empty
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
            await new Promise(r => setTimeout(r, 1500)); // Mock delay
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

    // Construct mock ad based on vendor's actual data for previews
    const vendorName = vendorProfile?.vendor?.name || vendorProfile?.name || 'Your Yard Name';
    const mockAd = {
        title: vendorName,
        description: 'Quality auto parts and trusted service.',
        image_url: vendorProfile?.vendor?.logo || null,
        link: '#'
    };

    if (fetchingActive) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (activeAd) {
        return (
            <div className="w-full">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>{cmsData.active_heading || 'Active Campaign'}</h2>
                            <p className="text-slate-500 font-medium mt-1">Your visibility plan is currently active and delivering impressions.</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold rounded-xl text-sm shadow-sm animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Live & Running
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 relative z-10">
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <p className="text-sm text-slate-500 font-bold mb-1 uppercase tracking-wider">Plan Tier</p>
                            <p className="text-2xl font-black capitalize text-[#1a56ff]">{activeAd.plan_type}</p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <p className="text-sm text-slate-500 font-bold mb-1 uppercase tracking-wider">Started On</p>
                            <p className="text-xl font-bold text-slate-800">{new Date(activeAd.start_date).toLocaleDateString()}</p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <p className="text-sm text-slate-500 font-bold mb-1 uppercase tracking-wider">Ends On</p>
                            <p className="text-xl font-bold text-slate-800">{new Date(activeAd.end_date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50 relative z-10">
                        <p className="text-blue-800 text-sm font-medium flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            To change or extend your plan, please wait until the current billing cycle expires or contact priority support.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-10 text-center max-w-2xl mx-auto">
                {cmsData.header_title ? (
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }} dangerouslySetInnerHTML={{ __html: cmsData.header_title }} />
                ) : (
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Marketplace <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Advertising</span>
                    </h1>
                )}
                <p className="text-slate-500 text-lg font-medium">
                    {cmsData.header_desc || "Boost your yard's visibility and dominate the search results with our premium ad placements."}
                </p>
            </div>

            {/* Premium Stepper */}
            <div className="flex justify-center mb-12 relative z-10">
                <div className="flex items-center bg-white rounded-full p-2 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100">
                    {[1, 2, 3, 4].map((s, idx) => (
                        <React.Fragment key={s}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                step === s ? 'bg-[#1a56ff] text-white shadow-md scale-110' : 
                                step > s ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'
                            }`}>
                                {step > s ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                ) : s}
                            </div>
                            {idx < 3 && (
                                <div className={`w-8 sm:w-16 h-1 mx-1 rounded-full transition-all duration-300 ${step > s ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="w-full relative z-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {/* ── STEP 1: Select Plan ─────────────────────────────────── */}
                        {step === 1 && (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-black text-slate-800 text-center tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Choose Your Visibility Tier</h2>
                                
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                                    {subscriptionPlans.map(plan => (
                                        <div 
                                            key={plan.id}
                                            onClick={() => { setSelectedPlan(plan); setStep(2); }}
                                            className={`relative cursor-pointer rounded-3xl p-6 md:p-8 border-2 transition-all duration-300 group flex flex-col h-full bg-white ${
                                                selectedPlan?.id === plan.id 
                                                    ? 'border-[#1a56ff] shadow-[0_8px_30px_rgba(26,86,255,0.12)] ring-4 ring-blue-50' 
                                                    : 'border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md'
                                            }`}
                                        >
                                            {plan.popular && (
                                                <div className="absolute top-0 right-8 -translate-y-1/2">
                                                    <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                                                        Most Popular
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider mb-2 bg-gradient-to-r ${plan.color} ${plan.textColor}`}>
                                                        {plan.name}
                                                    </span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-4xl font-black text-slate-900 tracking-tighter">${plan.price}</span>
                                                        <span className="text-slate-500 font-medium">/mo</span>
                                                    </div>
                                                </div>
                                                
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                    selectedPlan?.id === plan.id ? 'border-[#1a56ff] bg-[#1a56ff]' : 'border-slate-200 group-hover:border-blue-300'
                                                }`}>
                                                    {selectedPlan?.id === plan.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                </div>
                                            </div>

                                            {/* Live Preview */}
                                            <div className="mb-6 rounded-2xl bg-slate-50 p-4 border border-slate-100 flex-1 flex flex-col justify-center overflow-hidden">
                                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">Live Preview</p>
                                                <div className="pointer-events-none transform origin-top-left scale-90 w-[111%]">
                                                    {plan.Component && <plan.Component ad={mockAd} />}
                                                </div>
                                            </div>

                                            <ul className="space-y-3 mt-auto">
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className="flex gap-3 text-slate-600 text-sm font-medium items-start">
                                                        <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: Duration ─────────────────────────────────── */}
                        {step === 2 && (
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 mb-8 text-center tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Choose Duration</h2>
                                <div className="max-w-2xl mx-auto space-y-4">
                                    {[
                                        { label: '1 Month', value: 30, discount: 0 },
                                        { label: '3 Months', value: 90, discount: 10 },
                                        { label: '6 Months', value: 180, discount: 20 },
                                    ].map(opt => (
                                        <div 
                                            key={opt.value}
                                            onClick={() => setDuration(opt.value)}
                                            className={`flex items-center justify-between p-6 rounded-2xl cursor-pointer border-2 transition-all bg-white ${
                                                duration === opt.value 
                                                    ? 'border-[#1a56ff] bg-blue-50/30 shadow-[0_4px_20px_rgba(26,86,255,0.08)]' 
                                                    : 'border-slate-100 hover:border-blue-200 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                                                    duration === opt.value ? 'bg-[#1a56ff] text-white' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {opt.value / 30}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-900">{opt.label}</h3>
                                                    {opt.discount > 0 && <span className="text-emerald-600 text-sm font-bold block">Save {opt.discount}% overall!</span>}
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                duration === opt.value ? 'border-[#1a56ff] bg-[#1a56ff]' : 'border-slate-200'
                                            }`}>
                                                {duration === opt.value && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3: Placement ─────────────────────────────────── */}
                        {step === 3 && (
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 mb-8 text-center tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Select Ad Placement</h2>
                                <div className="max-w-2xl mx-auto space-y-4">
                                    {[
                                        { id: 'featured', label: 'Featured Search Results', desc: 'Appear at the very top of relevant part searches' },
                                        { id: 'homepage', label: 'Homepage Banner', desc: 'High visibility across the main landing page directly' },
                                        { id: 'both', label: 'Maximum Visibility (Both)', desc: 'Dominate both search and homepage traffic entirely' },
                                    ].map(opt => (
                                        <div 
                                            key={opt.id}
                                            onClick={() => setPlacement(opt.id)}
                                            className={`flex items-center justify-between p-6 rounded-2xl cursor-pointer border-2 transition-all bg-white ${
                                                placement === opt.id 
                                                    ? 'border-[#1a56ff] bg-blue-50/30 shadow-[0_4px_20px_rgba(26,86,255,0.08)]' 
                                                    : 'border-slate-100 hover:border-blue-200 hover:shadow-sm'
                                            }`}
                                        >
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900 mb-1">{opt.label}</h3>
                                                <span className="text-slate-500 text-sm font-medium">{opt.desc}</span>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ml-4 ${
                                                placement === opt.id ? 'border-[#1a56ff] bg-[#1a56ff]' : 'border-slate-200'
                                            }`}>
                                                {placement === opt.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── STEP 4: Checkout ─────────────────────────────────── */}
                        {step === 4 && (
                            <div className="max-w-2xl mx-auto">
                                <h2 className="text-2xl font-black text-slate-800 mb-8 text-center tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Review & Checkout</h2>
                                
                                <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 mb-8">
                                    <div className="flex justify-between items-center mb-5 text-base">
                                        <span className="text-slate-500 font-medium">Selected Plan</span>
                                        <span className="font-black text-slate-900 bg-slate-50 px-3 py-1 rounded-lg">{selectedPlan.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-5 text-base">
                                        <span className="text-slate-500 font-medium">Placement Options</span>
                                        <span className="font-black text-slate-900 capitalize">{placement}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-6 text-base border-b border-slate-100 pb-6">
                                        <span className="text-slate-500 font-medium">Subscription Duration</span>
                                        <span className="font-black text-slate-900">{duration / 30} Month(s)</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-slate-500 font-medium block mb-1">Total Due Today</span>
                                            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">One-time payment</span>
                                        </div>
                                        <span className="text-4xl font-black text-[#1a56ff] tracking-tighter">${selectedPlan.price * (duration / 30)}</span>
                                    </div>
                                </div>
                                
                                <div className="text-center rounded-2xl overflow-hidden shadow-lg border border-slate-800">
                                    {/* Mock Credit Card UI representation */}
                                    <div className="bg-slate-900 p-8 text-left relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
                                        <div className="flex justify-between items-center mb-8 relative z-10">
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Payment Method</p>
                                            <svg className="w-8 h-8 text-white opacity-90" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <div className="font-mono text-white text-xl tracking-[0.2em] mb-6 relative z-10">**** **** **** 4242</div>
                                        <div className="flex justify-between text-slate-300 text-sm font-medium w-3/4 max-w-[200px] relative z-10">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">Expires</span>
                                                <span>12/28</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">CVC</span>
                                                <span>***</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Footer Controls */}
                <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-100 max-w-4xl mx-auto">
                    {step > 1 ? (
                        <button 
                            onClick={() => setStep(step - 1)} 
                            className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                        >
                            Back
                        </button>
                    ) : <div></div>}
                    
                    {step < 4 ? (
                        <button 
                            onClick={() => selectedPlan && setStep(step + 1)} 
                            disabled={!selectedPlan && step === 1}
                            className="px-8 py-3 rounded-xl bg-[#1a56ff] hover:bg-blue-700 text-white font-bold shadow-[0_4px_14px_rgba(26,86,255,0.3)] disabled:opacity-50 disabled:shadow-none transition-all"
                        >
                            Continue to {step === 1 ? 'Duration' : step === 2 ? 'Placement' : 'Checkout'}
                        </button>
                    ) : (
                        <LoadingButton 
                            isLoading={loading} 
                            onClick={handleCheckout} 
                            className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-[0_4px_14px_rgba(5,150,105,0.3)] transition-all"
                        >
                            Pay & Activate Securely
                        </LoadingButton>
                    )}
                </div>
            </div>
        </div>
    );
}
