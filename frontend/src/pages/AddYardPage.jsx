import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import AcceptJsCheckout from '../components/vendor/AcceptJsCheckout';
import { useVendorAuth } from '../contexts/VendorAuthContext';
import VendorAuthModal from '../components/vendor/VendorAuthModal';

// Mock CMS Hook - this makes the strings easy to update without code changes later
const useAddYardCMS = () => {
    return {
        step1: {
            title: "Let's create your junkyard profile",
            subtitle: "This helps buyers trust and find you easily."
        },
        step2: {
            title: "Where is your junkyard located?",
            subtitle: "Add your location so buyers can find you."
        },
        step3: {
            title: "Tell us about your yard",
            subtitle: "Add services, brands & photos to attract more buyers."
        },
        step4: {
            title: "Review & choose your plan",
            subtitle: "Review your information and go live."
        }
    };
};

const STEPS_NAV = [
    { num: 1, title: 'Business', subtitle: 'Basic info' },
    { num: 2, title: 'Location', subtitle: 'Where you are' },
    { num: 3, title: 'Services', subtitle: 'What you offer' },
    { num: 4, title: 'Plan & Payment', subtitle: 'Choose your plan' }
];

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

const CustomSelect = ({ options, value, onChange, placeholder, disabled, name }) => {
    const [open, setOpen] = React.useState(false);
    return (
        <div className="relative">
            <button 
                type="button"
                disabled={disabled}
                className={`w-full bg-white border ${open ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'} text-slate-800 text-[14px] font-bold rounded-xl h-[46px] px-4 flex items-center justify-between transition-all hover:border-slate-300 ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`}
                onClick={() => setOpen(!open)}
            >
                <span className={value ? "text-slate-800" : "text-slate-500 font-normal truncate"}>{value || placeholder}</span>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''} shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {open && !disabled && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1 ring-1 ring-black/5">
                        {options.map((opt, idx) => (
                            <button
                                key={idx}
                                type="button"
                                className={`w-full text-left px-4 py-2 hover:bg-slate-50 text-[14px] ${value === opt.value ? 'font-bold text-blue-600 bg-blue-50/30' : 'font-medium text-slate-700'}`}
                                onClick={() => {
                                    onChange({ target: { name, value: opt.value } });
                                    setOpen(false);
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                        {options.length === 0 && (
                            <div className="px-4 py-3 text-[14px] text-slate-500 italic">No options found</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default function AddYardPage() {
    const navigate = useNavigate();
    const cms = useAddYardCMS();
    const { isAuthenticated, loading: authLoading } = useVendorAuth();
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [paymentStatusMsg, setPaymentStatusMsg] = useState('');
    const [touched, setTouched] = useState({});

    // Custom UI Alert Modal State
    const [showExitWarning, setShowExitWarning] = useState(false);
    const [pendingNavRoute, setPendingNavRoute] = useState(null);
    
    // location cascading state
    const [availableZips, setAvailableZips] = useState([]);
    const [availableCities, setAvailableCities] = useState([]);
    const [filteredZips, setFilteredZips] = useState([]);

    // Step 3 — Parts
    const [allParts, setAllParts] = useState([]);       // all parts from backend
    const [partsSearch, setPartsSearch] = useState(''); // search filter
    const [customPartInput, setCustomPartInput] = useState('');

    // Step 3 — Makes/Brands
    const [allMakes, setAllMakes] = useState([]);       // all makes from backend
    const [brandSearch, setBrandSearch] = useState(''); // search filter in dropdown
    const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

    // Step 3 — Photos
    const photoInputRef = React.useRef(null);

    const [formData, setFormData] = useState({
        business_name: '', email: '', phone: '', website: '', description: '',
        city: '', state: '', zip_code: '', country: 'United States',
        parts: [],
        brands: [],
        photos: [],
        logo: null,
        subscription_plan: 'free'
    });

    // Prevent accidental navigation
    const hasUnsavedChanges = !isSubmitted && (
        formData.business_name || formData.email || formData.phone || formData.city || step > 1
    );

    useEffect(() => {
        // Handle tab closing / browser reload
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        
        // Handle internal SPA navigation clicks (Navbar links, Footer links)
        const handleClickCapture = (e) => {
            if (!hasUnsavedChanges) return;
            
            // Find if click was on a link
            const link = e.target.closest('a');
            if (!link || !link.href || link.target === '_blank') return;
            
            // Check if it's an internal route that navigates away from the form
            if (link.href.startsWith(window.location.origin) && !link.href.includes('/add-a-yard/form')) {
                e.preventDefault();
                e.stopPropagation();
                setPendingNavRoute(link.href.replace(window.location.origin, '')); // store relative path
                setShowExitWarning(true); // display custom modal
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('click', handleClickCapture, { capture: true });
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('click', handleClickCapture, { capture: true });
        };
    }, [hasUnsavedChanges]);



    const [logoPreview, setLogoPreview] = useState(null);
    const logoInputRef = React.useRef(null);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, logo: file }));
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    // Fetch all parts & makes on mount
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [parts, makes] = await Promise.all([
                    api.getAllParts(),
                    api.getAllMakes()
                ]);
                setAllParts(parts);
                setAllMakes(makes);
            } catch (err) {
                console.error('Failed to load parts/makes:', err);
            }
        };
        fetchAll();
    }, []);

    // Step 1: When state changes, load cities from the real backend endpoint
    useEffect(() => {
        const fetchCities = async () => {
            if (!formData.state) {
                setAvailableCities([]);
                setAvailableZips([]);
                setFilteredZips([]);
                // Reset city & zip when state cleared
                setFormData(prev => ({ ...prev, city: '', zip_code: '' }));
                return;
            }
            try {
                // Fetch real city names from Vendor table filtered by state
                const cities = await api.getCities(formData.state);
                setAvailableCities(Array.isArray(cities) ? cities : []);

                // Fetch ZIP codes for this state (separate call)
                const data = await api.getZipcodesByState(formData.state);
                const zips = data.zipcodes || [];
                setAvailableZips(zips);
                setFilteredZips(zips);

                // If current city/zip no longer valid for new state, reset
                setFormData(prev => ({
                    ...prev,
                    city: '',
                    zip_code: ''
                }));
            } catch (err) {
                console.error('Failed to load location data:', err);
            }
        };
        fetchCities();
    }, [formData.state]);

    // Step 2: When city changes, filter the ZIP codes down to that city only
    useEffect(() => {
        if (!formData.city) {
            setFilteredZips(availableZips); // show all state zips when no city selected
            return;
        }
        // Filter zips where the city matches — use city name from zip entry if available
        // Since Vendor ZIPs may not align 1:1 with city names, show all state zips as fallback
        const cityZips = availableZips.filter(z =>
            z.city_name?.toLowerCase() === formData.city?.toLowerCase()
        );
        setFilteredZips(cityZips.length > 0 ? cityZips : availableZips);
        // Reset zip if it was from a different city
        if (formData.zip_code && !cityZips.some(z => z.postal_code === formData.zip_code)) {
            setFormData(prev => ({ ...prev, zip_code: '' }));
        }
    }, [formData.city, availableZips]);

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === 'phone') {
            const raw = value.replace(/\D/g, '').slice(0, 10);
            value = raw.length > 6 ? `(${raw.slice(0,3)}) ${raw.slice(3,6)}-${raw.slice(6)}` : 
                    raw.length > 3 ? `(${raw.slice(0,3)}) ${raw.slice(3)}` : raw;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleBlur = (e) => {
        setTouched(prev => ({ ...prev, [e.target.name]: true }));
    };

    const getFieldError = (name) => {
        if (!touched[name]) return '';
        if (name === 'business_name' && !formData.business_name) return 'Business Name is required.';
        if (name === 'email') {
            if (!formData.email) return 'Business Email is required.';
            if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Invalid email address.';
        }
        if (name === 'phone') {
            if (!formData.phone) return 'Phone Number is required.';
            if (formData.phone.replace(/\D/g, '').length < 10) return 'Invalid phone number.';
        }
        if (name === 'website' && formData.website && !/^(http|https):\/\/[^ "]+$/.test(formData.website)) {
            return 'Invalid URL. Must include http:// or https://';
        }
        return '';
    };

    const togglePart = (part) => {
        setFormData(prev => ({
            ...prev,
            parts: prev.parts.includes(part) ? prev.parts.filter(p => p !== part) : [...prev.parts, part]
        }));
    };

    const toggleBrand = (brandName) => {
        setFormData(prev => ({
            ...prev,
            brands: prev.brands.includes(brandName)
                ? prev.brands.filter(b => b !== brandName)
                : [...prev.brands, brandName]
        }));
        setBrandDropdownOpen(false);
        setBrandSearch('');
    };

    const addCustomBrand = () => {
        const name = brandSearch.trim();
        if (name && !formData.brands.includes(name)) {
            setFormData(prev => ({ ...prev, brands: [...prev.brands, name] }));
        }
        setBrandDropdownOpen(false);
        setBrandSearch('');
    };

    const addCustomPart = () => {
        const name = customPartInput.trim();
        if (name && !formData.parts.includes(name)) {
            setFormData(prev => ({ ...prev, parts: [...prev.parts, name] }));
        }
        setCustomPartInput('');
    };

    const addPhotos = (e) => {
        const files = Array.from(e.target.files || []);
        const previews = files.map(f => ({ file: f, url: URL.createObjectURL(f) }));
        setFormData(prev => ({ ...prev, photos: [...prev.photos, ...previews] }));
        e.target.value = '';
    };

    const removePhoto = (idx) => {
        setFormData(prev => {
            const updated = [...prev.photos];
            URL.revokeObjectURL(updated[idx].url);
            updated.splice(idx, 1);
            return { ...prev, photos: updated };
        });
    };

    const validateStep = (currentStep) => {
        setError('');
        if (currentStep === 1) {
            // Force touch all fields to show inline errors on Submit attempt
            setTouched(prev => ({ ...prev, business_name: true, email: true, phone: true, website: true }));
            if (!formData.business_name) return false;
            if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) return false;
            if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) return false;
            if (formData.website && !/^(http|https):\/\/[^ "]+$/.test(formData.website)) return false;
        } else if (currentStep === 2) {
            if (!formData.city || !formData.state || !formData.zip_code || !formData.country) {
                setError('All location fields are required.'); return false;
            }
        }
        return true;
    };

    const nextStep = () => { if (validateStep(step)) { setStep(step + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
    const prevStep = () => { setStep(step - 1); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    const handleSubmit = async (e, nonce = null) => {
        if (e && e.preventDefault) e.preventDefault();
        setLoading(true);
        setError('');

        const isFree = formData.subscription_plan === 'free';
        setPaymentStatusMsg(isFree ? 'Submitting your application...' : 'Processing your payment...');

        try {
            let transactionId = null;
            if (!isFree) {
                if (!nonce) throw new Error("Payment nonce missing.");
                const amount = formData.subscription_plan === 'premium' ? 49 : 99;
                const chargeResponse = await api.chargeCard({
                    nonce: nonce, 
                    amount: amount, 
                    item_type: 'yard_submission', 
                    item_id: formData.business_name || 'Yard'
                });
                transactionId = chargeResponse.transaction_id;
                setPaymentStatusMsg('Submitting your yard...');
            }

            // Build FormData so photos are uploaded as real files
            const fd = new FormData();
            fd.append('business_name', formData.business_name);
            fd.append('contact_name', formData.business_name);
            fd.append('email', formData.email);
            fd.append('phone', formData.phone);
            fd.append('website', formData.website || '');
            fd.append('address', `${formData.city}, ${formData.state} ${formData.zip_code}`);
            fd.append('city', formData.city);
            fd.append('state', formData.state);
            fd.append('zip_code', formData.zip_code);
            fd.append('country', formData.country);
            fd.append('services', formData.parts?.length ? formData.parts.join(', ') : 'General Auto Parts & Services');
            fd.append('brands', formData.brands?.length ? formData.brands.join(', ') : '');
            fd.append('parts_categories', formData.parts?.length ? formData.parts.join(', ') : '');
            fd.append('description', formData.description || '');
            fd.append('subscription_plan', formData.subscription_plan);
            fd.append('payment_methods', JSON.stringify([]));
            fd.append('business_hours', JSON.stringify({}));
            
            if (transactionId) {
                fd.append('transaction_id', transactionId);
                fd.append('payment_status', 'completed');
            }

            // Append actual photo files (not blob URLs)
            if (formData.photos && formData.photos.length > 0) {
                formData.photos.forEach(photo => {
                    if (photo.file) {
                        fd.append('photos', photo.file, photo.file.name);
                    }
                });
            }

            if (formData.logo) {
                fd.append('logo', formData.logo, formData.logo.name);
            }

            await api.submitYard(fd);

            setLoading(false);
            setIsSubmitted(true);
        } catch (err) {
            setLoading(false);
            const data = err.response?.data;
            if (data && typeof data === 'object') {
                // Surface first validation error from the serializer
                const firstKey = Object.keys(data)[0];
                setError(`${firstKey}: ${Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]}`);
            } else {
                setError(err.message || 'Submission failed. Please try again.');
            }
        }
    };

    const inputWrapperClasses = "mb-6";
    const labelClasses = "block text-[13px] font-bold text-slate-800 mb-2";
    const getInputClass = (name) => `w-full bg-white border rounded-xl px-4 py-3 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 transition-all shadow-sm ${
        getFieldError(name) ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/10' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'
    }`;
    const inputClasses = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm appearance-none";
    const dropdownIcon = <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;

    // Render a blocking modal instead of redirecting if completely unauthenticated
    if (!authLoading && !isAuthenticated()) {
        return (
            <div className="bg-[#f8fafc] min-h-screen flex flex-col font-inter">
                <SEO title="Create Junkyard Profile" noindex={true} />
                <VendorAuthModal isOpen={true} />
            </div>
        );
    }

    return (
        <div className="bg-[#f8fafc] min-h-screen flex flex-col font-inter">
            <SEO title="Create Junkyard Profile" noindex={true} />

            {/* CUSTOM EXIT WARNING MODAL */}
            {showExitWarning && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-[360px] w-full p-6 animate-fade-in-up border border-slate-100">
                        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5 mx-auto ring-4 ring-white shadow-sm border border-red-100">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-[20px] font-black text-center text-slate-900 mb-2 font-outfit" style={{ fontFamily: "'Outfit', sans-serif" }}>Leave This Page?</h3>
                        <p className="text-slate-500 text-[13.5px] text-center mb-6 leading-relaxed">
                            You have unsaved information waiting. <br/>Are you sure you want to leave? Your progress will be permanently lost.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowExitWarning(false)} 
                                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 font-bold text-[14px] rounded-xl hover:bg-slate-100 transition-colors">
                                Cancel
                            </button>
                            <button 
                                onClick={() => { setShowExitWarning(false); navigate(pendingNavRoute); }} 
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold text-[14px] rounded-xl hover:bg-red-700 transition-all shadow-[0_4px_12px_rgba(220,38,38,0.25)] hover:shadow-[0_6px_16px_rgba(220,38,38,0.35)] hover:-translate-y-0.5">
                                Yes, Leave
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Navbar />

            <div className="flex-grow flex items-start justify-center pt-24 pb-20 px-4">
                
                <div className="w-full max-w-[850px] bg-white rounded-[24px] shadow-sm border border-slate-100 p-8 sm:p-12 relative overflow-hidden">
                    
                    {/* Abstract circle in top right corner */}
                    <div className="absolute top-8 right-8 w-24 h-24 bg-blue-50 rounded-full blur-xl opacity-60 pointer-events-none" />

                    {isSubmitted ? (
                        <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight">Your yard has been successfully processed!</h2>
                            <p className="text-[15px] text-slate-600 mb-8 max-w-[500px] leading-relaxed">
                                {formData.subscription_plan === 'free'
                                    ? `Thank you for registering ${formData.business_name || 'your business'}. Your application has been submitted and is under review.`
                                    : `Thank you for your payment! Your transaction through Authorize.net was successful. Your ${formData.subscription_plan} plan is active, and your application is under review.`
                                }
                                <br/><br/>
                                You will be notified soon via email at <span className="font-bold text-slate-800">{formData.email || 'your provided email'}</span> once approved.
                            </p>
                            <button
                                onClick={() => navigate('/add-a-yard')}
                                className="px-8 py-3.5 bg-blue-600 text-white text-[15px] font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Submit Another Yard
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Horizontal Progress Tracker */}
                    <div className="flex items-center justify-center pb-6 mb-8 hidden md:flex border-b border-slate-100 mx-auto max-w-3xl">
                        {STEPS_NAV.map((nav, idx) => {
                            const isActive = step === nav.num;
                            const isCompleted = step > nav.num;
                            return (
                                <div key={nav.num} className="flex items-center">
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors shrink-0 ${
                                            isCompleted ? 'bg-blue-600 text-white' : 
                                            isActive ? 'bg-blue-600 text-white ring-4 ring-blue-50' : 
                                            'bg-slate-100 text-slate-400'
                                        }`}>
                                            {isCompleted ? <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : nav.num}
                                        </div>
                                        <div className="hidden lg:block whitespace-nowrap">
                                            <p className={`text-[13px] font-bold ${isActive || isCompleted ? 'text-blue-600' : 'text-slate-500'}`}>{nav.title}</p>
                                            <p className={`text-[11px] font-medium hidden xl:block ${isActive || isCompleted ? 'text-blue-400' : 'text-slate-400'}`}>{nav.subtitle}</p>
                                        </div>
                                    </div>
                                    {/* Connecting Line */}
                                    {idx < STEPS_NAV.length - 1 && (
                                        <div className="w-8 sm:w-12 lg:w-16 h-[1px] mx-3 sm:mx-6 bg-slate-100"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Header Block */}
                    <div className="flex items-center gap-5 mb-10">
                        <div className="w-16 h-16 rounded-2xl bg-[#f0f4f8] flex items-center justify-center shrink-0">
                            {step === 1 && (
                                <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 4h-3V2h-2v2h-4V2H8v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM5 20V14h14l.002 6H5zm14-8H5V6h14v6z" />
                                </svg>
                            )}
                            {step === 2 && (
                                <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C7.589 2 4 5.589 4 10c0 4.908 7.054 11.472 7.556 12.021a.63.63 0 00.888 0C12.946 21.472 20 14.908 20 10c0-4.411-3.589-8-8-8zm0 18.066C10.373 18.257 5.2 12.784 5.2 10c0-3.75 3.05-6.8 6.8-6.8s6.8 3.05 6.8 6.8c0 2.784-5.173 8.257-6.8 10.066z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            )}
                            {step === 3 && (
                                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 9.82a.504.504 0 00.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                                </svg>
                            )}
                            {step === 4 && (
                                <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm-1.999 14.413l-3.713-3.705L7.7 11.292l2.299 2.295 5.294-5.294 1.414 1.414-6.706 6.706z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1 leading-tight tracking-tight">
                                {cms[`step${step}`].title}
                            </h2>
                            <p className="text-[13px] text-slate-500 font-medium">
                                {cms[`step${step}`].subtitle}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100">
                            {error}
                        </div>
                    )}

                    {loading && (
                        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-[14px] font-bold text-slate-800">{paymentStatusMsg}</p>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                            
                            {/* STEP 1: Profile */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="mb-2">
                                        <label className="block text-[13px] font-bold text-slate-800 mb-3">Business Logo (Optional)</label>
                                        <div className="flex items-center gap-4">
                                            {logoPreview ? (
                                                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-75 transition-opacity" onClick={() => logoInputRef.current?.click()}>
                                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                                                </div>
                                            ) : (
                                                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 flex-shrink-0 cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-colors group" onClick={() => logoInputRef.current?.click()}>
                                                    <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-blue-500">Upload</span>
                                                </div>
                                            )}
                                            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                            <div className="text-[12px] text-slate-500">
                                                <p>Upload your business logo.</p>
                                                <p>Will be displayed on your vendor profile.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                        <div className={`md:col-span-2 ${inputWrapperClasses}`}>
                                            <label className={labelClasses}>Business Name <span className="text-red-500">*</span></label>
                                            <input type="text" name="business_name" value={formData.business_name} onChange={handleChange} onBlur={handleBlur} className={getInputClass('business_name')} placeholder="Enter business name" />
                                            {getFieldError('business_name') && <p className="text-red-500 text-[11px] font-bold mt-1.5">{getFieldError('business_name')}</p>}
                                        </div>
                                        <div className={inputWrapperClasses}>
                                            <label className={labelClasses}>Business Email <span className="text-red-500">*</span></label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} className={getInputClass('email')} placeholder="Enter email" />
                                            {getFieldError('email') && <p className="text-red-500 text-[11px] font-bold mt-1.5">{getFieldError('email')}</p>}
                                        </div>
                                        <div className={inputWrapperClasses}>
                                            <label className={labelClasses}>Phone Number <span className="text-red-500">*</span></label>
                                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} className={getInputClass('phone')} placeholder="(999) 999-9999" />
                                            {getFieldError('phone') && <p className="text-red-500 text-[11px] font-bold mt-1.5">{getFieldError('phone')}</p>}
                                        </div>
                                        <div className={`md:col-span-2 ${inputWrapperClasses}`}>
                                            <label className={labelClasses}>Website (Optional)</label>
                                            <input type="url" name="website" value={formData.website} onChange={handleChange} onBlur={handleBlur} className={getInputClass('website')} placeholder="https://yourwebsite.com" />
                                            {getFieldError('website') && <p className="text-red-500 text-[11px] font-bold mt-1.5">{getFieldError('website')}</p>}
                                        </div>
                                        <div className={`md:col-span-2 ${inputWrapperClasses}`}>
                                            <label className={labelClasses}>About This Yard (Description)</label>
                                            <textarea name="description" value={formData.description} onChange={handleChange} onBlur={handleBlur} className={`${getInputClass('description')} resize-y`} placeholder="Tell us about your yard, specialties, and inventory..." rows="3"></textarea>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Location (Redesigned matching screenshot) */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                                        <div className={inputWrapperClasses}>
                                            <label className={labelClasses}>State <span className="text-red-500">*</span></label>
                                            <CustomSelect 
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                placeholder="Select state"
                                                options={US_STATES.map(s => ({ label: s, value: s }))}
                                            />
                                        </div>
                                        <div className={inputWrapperClasses}>
                                            <label className={labelClasses}>City <span className="text-red-500">*</span></label>
                                            <CustomSelect 
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                disabled={availableCities.length === 0}
                                                placeholder={availableCities.length === 0 ? 'Select a state first' : 'Select city'}
                                                options={availableCities.map(c => ({ label: c, value: c }))}
                                            />
                                        </div>
                                        <div className={inputWrapperClasses}>
                                            <label className={labelClasses}>ZIP Code <span className="text-red-500">*</span></label>
                                            <CustomSelect 
                                                name="zip_code"
                                                value={formData.zip_code}
                                                onChange={handleChange}
                                                disabled={filteredZips.length === 0}
                                                placeholder={filteredZips.length === 0 ? 'Select a location first' : 'Select ZIP code'}
                                                options={filteredZips.map(z => ({ label: z.postal_code, value: z.postal_code }))}
                                            />
                                        </div>
                                        <div className={inputWrapperClasses}>
                                            <label className={labelClasses}>Country <span className="text-red-500">*</span></label>
                                            <CustomSelect 
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                placeholder="Select country"
                                                options={[{ label: 'United States', value: 'United States' }, { label: 'Canada', value: 'Canada' }]}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mt-2 flex items-start gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-100">
                                        <span className="text-blue-600 mt-0.5"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15 9l7 3-7 3-3 7-3-7-7-3 7-3z" /></svg></span>
                                        <div>
                                            <p className="text-[13px] font-bold text-blue-700">We'll use this to connect you with nearby buyers</p>
                                            <p className="text-[12px] text-slate-500 font-medium">You can update this anytime from your dashboard.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Services, Parts, Brands, Photos */}
                            {step === 3 && (
                                <div className="space-y-10">

                                    {/* ── PARTS ─────────────────────────────────── */}
                                    <div>
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-[15px] font-black text-slate-900">What parts do you sell?</h3>
                                                <p className="text-[12px] text-slate-500 mt-0.5">Select all that apply · {formData.parts.length} selected</p>
                                            </div>
                                        </div>

                                        {/* Parts search */}
                                        <div className="relative mb-4">
                                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            <input
                                                type="text"
                                                value={partsSearch}
                                                onChange={e => setPartsSearch(e.target.value)}
                                                placeholder="Search parts..."
                                                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-[13px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white shadow-sm"
                                            />
                                        </div>

                                        {/* Parts grid */}
                                        <div className="max-h-60 overflow-y-auto pr-1 flex flex-wrap gap-2.5 rounded-xl">
                                            {(partsSearch
                                                ? allParts.filter(p => p.partName.toLowerCase().includes(partsSearch.toLowerCase()))
                                                : allParts
                                            ).map(part => {
                                                const isActive = formData.parts.includes(part.partName);
                                                return (
                                                    <button
                                                        key={part.partID} type="button"
                                                        onClick={() => togglePart(part.partName)}
                                                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 text-[12px] font-bold transition-all ${
                                                            isActive
                                                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100'
                                                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <div className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center shrink-0 ${
                                                            isActive ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                                                        }`}>
                                                            {isActive && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                        </div>
                                                        {part.partName}
                                                    </button>
                                                );
                                            })}
                                            {allParts.length === 0 && (
                                                <p className="text-slate-400 text-[12px] py-4">Loading parts...</p>
                                            )}
                                        </div>

                                        {/* Add custom part */}
                                        <div className="mt-4 flex gap-3">
                                            <input
                                                type="text"
                                                value={customPartInput}
                                                onChange={e => setCustomPartInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomPart())}
                                                placeholder="Don't see your part? Type to add it..."
                                                className="flex-1 border border-dashed border-slate-300 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 bg-white"
                                            />
                                            <button
                                                type="button" onClick={addCustomPart}
                                                className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700 transition-colors"
                                            >
                                                + Add
                                            </button>
                                        </div>

                                        {/* Selected parts chips */}
                                        {formData.parts.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {formData.parts.map(p => (
                                                    <span key={p} className="flex items-center gap-1.5 pl-3 pr-2 py-1 bg-blue-600 text-white text-[11px] font-bold rounded-full">
                                                        {p}
                                                        <button type="button" onClick={() => togglePart(p)} className="hover:bg-blue-700 rounded-full p-0.5">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* ── BRANDS / MAKES ────────────────────────── */}
                                    <div>
                                        <h3 className="text-[15px] font-black text-slate-900 mb-1">Brands you work with</h3>
                                        <p className="text-[12px] text-slate-500 mb-4">Select from the dropdown or type a custom brand</p>

                                        {/* Searchable dropdown */}
                                        <div className="relative">
                                            <div
                                                className={`flex items-center gap-2 w-full border rounded-xl px-4 py-3 cursor-pointer transition-all bg-white shadow-sm ${
                                                    brandDropdownOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'
                                                }`}
                                                onClick={() => setBrandDropdownOpen(o => !o)}
                                            >
                                                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                                <input
                                                    type="text"
                                                    value={brandSearch}
                                                    onChange={e => { setBrandSearch(e.target.value); setBrandDropdownOpen(true); }}
                                                    onClick={e => { e.stopPropagation(); setBrandDropdownOpen(true); }}
                                                    placeholder="Search brands (e.g. Toyota, Ford...)" 
                                                    className="flex-1 bg-transparent text-[13px] text-slate-900 placeholder-slate-400 focus:outline-none"
                                                />
                                                <svg className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${brandDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>

                                            {/* Dropdown list */}
                                            {brandDropdownOpen && (
                                                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                                                    {(brandSearch
                                                        ? allMakes.filter(m => m.makeName.toLowerCase().includes(brandSearch.toLowerCase()))
                                                        : allMakes
                                                    ).map(make => (
                                                        <button
                                                            key={make.makeID} type="button"
                                                            onClick={() => toggleBrand(make.makeName)}
                                                            className={`w-full text-left px-4 py-2.5 text-[13px] font-medium flex items-center justify-between transition-colors ${
                                                                formData.brands.includes(make.makeName)
                                                                    ? 'bg-blue-50 text-blue-700 font-bold'
                                                                    : 'text-slate-700 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            {make.makeName}
                                                            {formData.brands.includes(make.makeName) && (
                                                                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                            )}
                                                        </button>
                                                    ))}
                                                    {/* Add custom brand if search doesn't match */}
                                                    {brandSearch && !allMakes.some(m => m.makeName.toLowerCase() === brandSearch.toLowerCase()) && (
                                                        <button
                                                            type="button" onClick={addCustomBrand}
                                                            className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-blue-600 hover:bg-blue-50 border-t border-slate-100 flex items-center gap-2"
                                                        >
                                                            <span className="text-blue-500">+</span> Add "{brandSearch}" as custom brand
                                                        </button>
                                                    )}
                                                    {allMakes.length === 0 && (
                                                        <p className="text-slate-400 text-[12px] px-4 py-3">Loading brands...</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Selected brand chips */}
                                        {formData.brands.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {formData.brands.map(brand => (
                                                    <span key={brand} className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-blue-50 text-blue-700 text-[12px] font-bold rounded-full border border-blue-100">
                                                        {brand}
                                                        <button type="button" onClick={() => toggleBrand(brand)} className="hover:bg-blue-100 rounded-full p-0.5 transition-colors">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* ── PHOTOS ────────────────────────────────── */}
                                    <div>
                                        <h3 className="text-[15px] font-black text-slate-900 mb-1">Upload photos of your yard</h3>
                                        <p className="text-[12px] text-slate-500 mb-4">Buyers trust listings with photos · Max 10 photos</p>

                                        <div className="flex flex-wrap gap-3">
                                            {/* Existing photo previews */}
                                            {formData.photos.map((photo, idx) => (
                                                <div key={idx} className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden group shrink-0">
                                                    <img src={photo.url} alt={`yard-${idx}`} className="w-full h-full object-cover" />
                                                    {/* Hover overlay with remove button */}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            type="button" onClick={() => removePhoto(idx)}
                                                            className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Upload button */}
                                            {formData.photos.length < 10 && (
                                                <button
                                                    type="button"
                                                    onClick={() => photoInputRef.current?.click()}
                                                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-blue-600 transition-all shrink-0 group"
                                                >
                                                    <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                    </div>
                                                    <span className="text-[11px] font-bold">Upload</span>
                                                </button>
                                            )}
                                            <input
                                                ref={photoInputRef}
                                                type="file" accept="image/*" multiple
                                                className="hidden"
                                                onChange={addPhotos}
                                            />
                                        </div>

                                        {formData.photos.length === 0 && (
                                            <p className="mt-3 text-[12px] text-slate-400 italic">No photos uploaded yet. Photos increase buyer trust significantly!</p>
                                        )}
                                    </div>

                                </div>
                            )}

                            {/* STEP 4: Review & Payment */}
                            {step === 4 && (
                                <div className="space-y-8">
                                    {/* Review Summary */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-3V2h-2v2h-4V2H8v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM5 20V14h14l.002 6H5zm14-8H5V6h14v6z" /></svg></div>
                                                <div>
                                                    <h4 className="text-[14px] font-bold text-slate-900">Business</h4>
                                                    <p className="text-[12px] text-slate-500 mt-1">{formData.business_name || 'Mohammed Saqaeb Junkyard'}</p>
                                                    <p className="text-[12px] text-slate-500">{formData.email || 'info@jynm.com'} | {formData.phone || '(999) 999-9999'}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setStep(1)} className="text-[13px] font-bold text-blue-600">Edit</button>
                                        </div>
                                        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C7.589 2 4 5.589 4 10c0 4.908 7.054 11.472 7.556 12.021a.63.63 0 00.888 0C12.946 21.472 20 14.908 20 10c0-4.411-3.589-8-8-8zm0 18.066C10.373 18.257 5.2 12.784 5.2 10c0-3.75 3.05-6.8 6.8-6.8s6.8 3.05 6.8 6.8c0 2.784-5.173 8.257-6.8 10.066z" /><circle cx="12" cy="10" r="3" /></svg></div>
                                                <div>
                                                    <h4 className="text-[14px] font-bold text-slate-900">Location</h4>
                                                    <p className="text-[12px] text-slate-500 mt-1">{formData.city || 'Bangalore'}, {formData.state || 'Karnataka'} {formData.zip_code || '560001'}, {formData.country || 'India'}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setStep(2)} className="text-[13px] font-bold text-blue-600">Edit</button>
                                        </div>
                                        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M21.442 8.528l-8.083-8.083a2.986 2.986 0 00-4.226 0L2.146 7.432a3.02 3.02 0 000 4.253l8.084 8.083a2.986 2.986 0 004.226 0l6.986-6.987a3.02 3.02 0 000-4.253zm-3.5 1.42l-6.987 6.987a1.006 1.006 0 01-1.42 0L3.55 10.273a1.018 1.018 0 010-1.428l6.987-6.987a1.006 1.006 0 011.42 0l7.985 7.985a1.018 1.018 0 010 1.428z" /><circle cx="15.5" cy="8.5" r="1.5" /></svg></div>
                                                <div>
                                                    <h4 className="text-[14px] font-bold text-slate-900">Services & Brands</h4>
                                                    <p className="text-[12px] text-slate-500 mt-1">{formData.parts.slice(0, 3).join(', ')} + {Math.max(0, formData.parts.length - 3)} more</p>
                                                    <p className="text-[12px] text-slate-500">{formData.brands.slice(0, 4).join(', ')} = {Math.max(0, formData.brands.length - 4)} more</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setStep(3)} className="text-[13px] font-bold text-blue-600">Edit</button>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 5h-2.586l-2.707-2.707A.996.996 0 0014 2h-4a.996.996 0 00-.707.293L6.586 5H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2zM4 18V7h3c.266 0 .52-.105.707-.293L10.414 4h3.172l2.707 2.707A.996.996 0 0017 7h3l.002 11H4z" /><circle cx="12" cy="12" r="3" /></svg></div>
                                                <div>
                                                    <h4 className="text-[14px] font-bold text-slate-900">Photos</h4>
                                                    <p className="text-[12px] text-slate-500 mt-1">{formData.photos.length} photos uploaded</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setStep(3)} className="text-[13px] font-bold text-blue-600">Edit</button>
                                        </div>
                                    </div>

                                    {/* Plans Selection */}
                                    <div className="pt-6">
                                        <h3 className="text-[15px] font-bold text-slate-900 mb-4">Choose your plan</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                            {[
                                                { id: 'free', name: 'Free Plan', price: '$0', desc: ['Basic listing', 'Limited visibility'] },
                                                { id: 'premium', name: 'Premium Plan', price: '$49', isPopular: true, desc: ['Featured in search', 'More visibility', 'Priority support'] },
                                                { id: 'featured', name: 'Featured Plan', price: '$99', desc: ['Top placement', 'Maximum visibility', 'Dedicated support'] }
                                            ].map(plan => (
                                                <div 
                                                    key={plan.id}
                                                    onClick={() => setFormData({...formData, subscription_plan: plan.id})}
                                                    className={`rounded-2xl cursor-pointer transition-all border-2 flex flex-col items-center text-center p-6 relative ${
                                                        formData.subscription_plan === plan.id 
                                                        ? 'border-blue-500 bg-blue-50/20 shadow-md' 
                                                        : 'border-slate-100 bg-white hover:border-blue-200'
                                                    }`}
                                                >
                                                    {plan.isPopular && (
                                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap">
                                                            Most Popular
                                                        </div>
                                                    )}
                                                    <h4 className="text-[15px] font-bold text-slate-900 mb-3">{plan.name}</h4>
                                                    <div className="text-3xl font-black text-slate-900 mb-4">{plan.price} <span className="text-[13px] font-medium text-slate-500">/mo</span></div>
                                                    
                                                    <ul className="text-[12px] text-slate-600 space-y-2 mb-6">
                                                        {plan.desc.map((d, idx) => (
                                                            <li key={idx} className="flex items-center justify-center gap-1.5">
                                                                {plan.isPopular && <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                                                {d}
                                                            </li>
                                                        ))}
                                                    </ul>

                                                    <div className="mt-auto">
                                                        {formData.subscription_plan === plan.id ? (
                                                            <span className="text-[13px] font-bold text-blue-600">Current Plan</span>
                                                        ) : (
                                                            <span className="text-[13px] font-bold text-slate-400 opacity-0 group-hover:opacity-100">Select</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Checkout block for Paid Plans */}
                                    {formData.subscription_plan !== 'free' && (
                                        <div className="pt-8 max-w-lg mx-auto">
                                            <h3 className="text-[15px] font-bold text-slate-900 mb-4 text-center">Secure Payment</h3>
                                            <div className="bg-white border border-slate-100 shadow-md rounded-2xl p-6">
                                                <AcceptJsCheckout 
                                                    amount={formData.subscription_plan === 'premium' ? 49 : formData.subscription_plan === 'featured' ? 99 : 0} 
                                                    onSuccess={(nonce) => handleSubmit(null, nonce)} 
                                                    onError={(err) => setError(err)} 
                                                    buttonText="Pay & Submit Yard"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Footer matches perfectly */}
                    <div className="mt-12 flex items-center justify-between">
                        {step > 1 ? (
                            <button onClick={prevStep} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-[14px] font-bold hover:bg-slate-50 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Back
                            </button>
                        ) : (
                            <div className="flex-1" /> // empty spacer so the right button stays aligned right
                        )}

                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
                            {step === 4 && (
                                formData.subscription_plan !== 'free' ? (
                                    <div className="text-[11px] font-medium text-slate-500 flex items-start gap-1.5 order-2 sm:order-1 sm:mr-2 text-left max-w-[185px] sm:max-w-none">
                                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-[3px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm9 13H6v-8h12v8z" /></svg>
                                        <span>Secure payment powered by <span className="font-bold text-slate-700">Authorize.net</span></span>
                                    </div>
                                ) : (
                                    <div className="text-[11px] font-medium text-slate-500 flex items-start gap-1.5 order-2 sm:order-1 sm:mr-2 text-left max-w-[185px] sm:max-w-none">
                                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-[2px]" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        <span>No credit card required for the <span className="font-bold text-slate-700">Free Plan</span>. Your listing will be published once approved.</span>
                                    </div>
                                )
                            )}

                            {step < 4 ? (
                                <button onClick={nextStep} className="px-6 py-3 bg-blue-600 text-white text-[14px] font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 order-1 sm:order-2">
                                    Save & Continue <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                            ) : formData.subscription_plan === 'free' ? (
                                <button onClick={handleSubmit} disabled={loading} className="px-6 py-3 bg-blue-600 text-white text-[14px] font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 order-1 sm:order-2">
                                    Submit Application 
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                            ) : null}
                        </div>
                    </div>
                        </>
                    )}


                </div>
            </div>

            <Footer />
        </div>
    );
}
