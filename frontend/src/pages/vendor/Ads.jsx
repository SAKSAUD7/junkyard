import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { vendorAdApi } from '../../services/vendorApi';
import { useVendorAuth } from '../../contexts/VendorAuthContext';
import { LoadingButton } from '../../components/vendor/UIElements';
import { 
    PremiumTemplate, 
    StandardTemplate, 
    CompactTemplate, 
    MinimalTemplate 
} from '../../components/AdTemplates';
import AcceptJsCheckout from '../../components/vendor/AcceptJsCheckout';
import { useNotifications } from '../../components/common/EnterpriseNotifications';

// Dedicated payments API instance — uses vendor_access_token (NOT the customer token).
// This is intentionally separate from vendorApi (which has baseURL=/api/vendor)
// to correctly hit /api/payments/ without a broken relative path.
const _BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000');
const paymentsApi = axios.create({ baseURL: `${_BASE}/api/payments` });
paymentsApi.interceptors.request.use(cfg => {
    const token = localStorage.getItem('vendor_access_token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

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
    const { showToast, showPaymentProgress, updatePaymentStage, hidePaymentProgress } = useNotifications();
    const idempotencyKeyRef = useRef((typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : (Math.random().toString(36).substring(2) + Date.now().toString(36)));

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [activeAd, setActiveAd] = useState(null);
    const [fetchingActive, setFetchingActive] = useState(true);

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [duration, setDuration] = useState(30);
    const [placement, setPlacement] = useState('featured');
    const [billing, setBilling] = useState('monthly');
    
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

    const handleCheckout = async (nonce) => {
        const amount = selectedPlan.price * (duration / 30);
        // Use stable idempotency key to prevent double-charges on retry
        const idempotencyKey = idempotencyKeyRef.current;


        setLoading(true);
        showPaymentProgress(amount.toFixed(2));

        try {
            updatePaymentStage('sending');

            // ── CRITICAL FIX: use paymentsApi (vendor JWT) not the customer api ──
            // This resolves the "No refresh token" 401 error that crashed the checkout.
            // paymentsApi injects vendor_access_token and hits /api/payments/charge/
            const chargeResponse = await paymentsApi.post('/charge/', {
                nonce,
                amount,
                item_type: 'ad_plan',
                item_id: selectedPlan.id,
                source_module: 'vendor_ads',
                idempotency_key: idempotencyKey,
                description: `${selectedPlan.name || selectedPlan.id} Ad Plan — ${duration / 30} month(s)`,
            });

            updatePaymentStage('authorized');

            // Provision the Ad
            updatePaymentStage('provisioning');
            await vendorAdApi.purchaseAd({
                plan_type: selectedPlan.id,
                duration: duration,
                placement: placement,
                payment_status: 'completed',
                transaction_id: chargeResponse.data.transaction_id || chargeResponse.data.internal_id,
            });

            updatePaymentStage('complete');
            await new Promise(r => setTimeout(r, 1200)); // brief celebration pause
            hidePaymentProgress();

            showToast({
                type: 'success',
                title: 'Payment Successful! 🎉',
                message: `Your ${selectedPlan.name || selectedPlan.id} plan is now active.`,
                duration: 8000,
            });

            // Refresh active ad state without full page reload
            const response = await vendorAdApi.getCurrentAd();
            if (response.data?.active_plan?.status === 'active') {
                setActiveAd(response.data.active_plan);
            }

        } catch (err) {
            console.error('Checkout failed', err);
            hidePaymentProgress();
            const errMsg = err.response?.data?.error || err.message || 'Payment failed. Please try again.';
            showToast({
                type: 'error',
                title: 'Payment Failed',
                message: errMsg,
                duration: 10000,
                onRetry: () => handleCheckout(nonce),
            });
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

    // 4-tier plan definitions for the Plan Selector (Step 1)
    const displayPlans = [
        {
            id: 'minimal',
            icon: '🏷️',
            name: 'MINIMAL',
            subtitle: 'Basic marketplace presence',
            price: 19,
            color: 'from-slate-300 to-slate-400',
            btnColor: 'bg-slate-700 hover:bg-slate-600',
            popular: false,
            features: [
                'Basic marketplace visibility',
                'Standard SEO indexing',
                'Base catalog linkage',
            ],
        },
        {
            id: 'compact',
            icon: '📦',
            name: 'COMPACT',
            subtitle: 'Great for getting started',
            price: 29,
            color: 'from-amber-400 to-orange-500',
            btnColor: 'bg-amber-500 hover:bg-amber-600',
            popular: false,
            features: [
                'Highlighted layout aesthetic',
                'Verified badge on profile',
                'Mobile-optimized profile snippet',
            ],
        },
        {
            id: 'standard',
            icon: '⭐',
            name: 'STANDARD',
            subtitle: 'Elevated visibility & leads',
            price: 49,
            color: 'from-blue-500 to-indigo-600',
            btnColor: 'bg-blue-600 hover:bg-blue-700',
            popular: false,
            features: [
                'Elevated search standing',
                '"Featured" vendor status badge',
                'Unlimited profile impressions',
                'Dashboard analytics unlocked',
            ],
        },
        {
            id: 'premium',
            icon: '⚡',
            name: 'PREMIUM',
            subtitle: 'Maximum visibility & leads',
            price: 99,
            color: 'from-slate-900 to-slate-800',
            btnColor: 'bg-slate-800 hover:bg-slate-700',
            popular: true,
            features: [
                'Top placement in search results',
                'Homepage rotating banner',
                'Priority lead generation mapping',
                '"Top Rated" trusted vendor badge',
                'Advanced analytics',
            ],
        },
    ];



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
                        {/* ── STEP 1: Select Plan ─────────────────────────────────── */}
                        {step === 1 && (
                            <div className="space-y-8">
                                <div className="text-center">
                                    <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        Choose Your Visibility Tier
                                    </h2>
                                    {/* Billing Toggle */}
                                    <div className="inline-flex items-center bg-slate-100 rounded-full p-1 mt-4">
                                        <button onClick={() => setBilling('monthly')}
                                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${billing === 'monthly' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>
                                            Monthly
                                        </button>
                                        <button onClick={() => setBilling('quarterly')}
                                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${billing === 'quarterly' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>
                                            Quarterly
                                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">Save 15%</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {displayPlans.map(plan => {
                                        const discount = billing === 'quarterly' ? 0.15 : 0;
                                        const finalPrice = billing === 'quarterly'
                                            ? Math.round(plan.price * 3 * (1 - discount))
                                            : plan.price;
                                        const perMonth = billing === 'quarterly'
                                            ? Math.round(plan.price * (1 - discount))
                                            : plan.price;
                                        
                                        const isSelected = selectedPlan?.id === plan.id;
                                        const PreviewComponent = plan.Component || subscriptionPlans.find(p => p.id === plan.id)?.Component;

                                        return (
                                            <div key={plan.id}
                                                onClick={() => {
                                                    const planData = subscriptionPlans.find(p => p.id === plan.id) || { ...plan, price: perMonth };
                                                    setSelectedPlan({ ...planData, price: perMonth });
                                                }}
                                                className={`relative flex flex-col rounded-3xl border-2 bg-white transition-all duration-300 cursor-pointer overflow-hidden ${
                                                    isSelected
                                                        ? 'border-[#1a56ff] ring-4 ring-blue-100 shadow-xl scale-[1.02] z-10'
                                                        : 'border-slate-200 hover:border-blue-300 hover:shadow-lg'
                                                }`}>
                                                
                                                <div className="p-8 flex flex-col flex-1">
                                                    {/* Top Row: Pill & Radio */}
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className={`text-[12px] font-black px-3 py-1 rounded-full uppercase tracking-widest text-white ${plan.btnColor.split(' ')[0]}`}>
                                                            {plan.name}
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            {plan.popular && (
                                                                <div className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-widest uppercase mb-2 shadow-sm">
                                                                    MOST POPULAR
                                                                </div>
                                                            )}
                                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-blue-600 bg-blue-500' : 'border-slate-300'}`}>
                                                                {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="mb-8">
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-[44px] font-black text-slate-900 tracking-tighter leading-none">${perMonth}</span>
                                                            <span className="text-slate-400 font-medium">/mo</span>
                                                        </div>
                                                        {billing === 'quarterly' && (
                                                            <p className="text-emerald-600 text-[12px] font-bold mt-1">${finalPrice} billed quarterly</p>
                                                        )}
                                                    </div>

                                                    {/* Live Preview Area */}
                                                    <div className="mb-8">
                                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3">Live Preview</p>
                                                        <div className="bg-[#f8fafc] border border-slate-100 rounded-2xl p-5 flex items-center justify-center min-h-[140px]">
                                                            <div className="w-full">
                                                                {PreviewComponent ? <PreviewComponent ad={mockAd} /> : <p className="text-center text-slate-400">Loading Preview...</p>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Features */}
                                                    <ul className="space-y-3 flex-1">
                                                        {plan.features.map((f, i) => (
                                                            <li key={i} className="flex items-start gap-3 text-[14px] text-slate-600 font-medium tracking-tight">
                                                                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                {f}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        );
                                    })}
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
                                
                                <div className="text-center rounded-2xl overflow-hidden shadow-lg border border-slate-100 p-8 bg-white max-w-md mx-auto">
                                    <AcceptJsCheckout 
                                        amount={selectedPlan.price * (duration / 30)} 
                                        onSuccess={handleCheckout} 
                                        onError={(err) => showToast({ type: 'error', title: 'Card Error', message: err, duration: 8000 })} 
                                        buttonText="Secure Checkout"
                                    />
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
                        <div className="w-[150px]"></div>
                    )}
                </div>
            </div>
        </div>
    );
}
