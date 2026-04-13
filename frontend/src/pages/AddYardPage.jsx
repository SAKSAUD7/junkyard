import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileAdBanner from '../components/MobileAdBanner';
import axios from 'axios';
import { api } from '../services/api';
import SEO from '../components/SEO';

// ─── Sub-components ──────────────────────────────────────────────────────────

function PaymentMethodCard({ method, icon, label, isSelected, onSelect }) {
    return (
        <div
            onClick={() => onSelect(method)}
            className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 select-none
                ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
        >
            {/* Radio indicator */}
            <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                ${isSelected
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300 bg-white'
                }`}>
                {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-200
                    ${isSelected
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                    }`}>
                    {icon}
                </div>
                <div>
                    <p className={`font-bold text-base transition-colors duration-200 ${isSelected ? 'text-blue-700' : 'text-gray-800'
                        }`}>
                        {label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Enter card details below</p>
                </div>
            </div>
        </div>
    );
}

function PaymentFormSection({ isVisible, cardDetails, onChange, errors }) {
    const formatCardNumber = (val) => {
        const digits = val.replace(/\D/g, '').slice(0, 16);
        return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    };
    const formatExpiry = (val) => {
        const digits = val.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
        return digits;
    };

    return (
        <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${isVisible ? 'max-h-[700px] opacity-100 mt-5' : 'max-h-0 opacity-0'
                }`}
        >
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl border border-blue-100 p-6">
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-gray-800 text-base">Card Details</h3>
                </div>

                <div className="space-y-4">
                    {/* Card Number */}
                    <div>
                        <label className="block text-gray-700 font-semibold text-sm mb-2">Card Number *</label>
                        <input
                            type="text"
                            value={cardDetails.cardNumber}
                            onChange={(e) => onChange('cardNumber', formatCardNumber(e.target.value))}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className={`w-full bg-white border rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all font-mono tracking-widest text-sm
                                ${errors.cardNumber
                                    ? 'border-red-400 focus:ring-red-200'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                                }`}
                        />
                        {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                    </div>

                    {/* Cardholder Name */}
                    <div>
                        <label className="block text-gray-700 font-semibold text-sm mb-2">Cardholder Name *</label>
                        <input
                            type="text"
                            value={cardDetails.cardName}
                            onChange={(e) => onChange('cardName', e.target.value)}
                            placeholder="John Doe"
                            className={`w-full bg-white border rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-sm
                                ${errors.cardName
                                    ? 'border-red-400 focus:ring-red-200'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                                }`}
                        />
                        {errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>}
                    </div>

                    {/* Expiry + CVV row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-semibold text-sm mb-2">Expiry Date *</label>
                            <input
                                type="text"
                                value={cardDetails.expiry}
                                onChange={(e) => onChange('expiry', formatExpiry(e.target.value))}
                                placeholder="MM/YY"
                                maxLength={5}
                                className={`w-full bg-white border rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-sm
                                    ${errors.expiry
                                        ? 'border-red-400 focus:ring-red-200'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                                    }`}
                            />
                            {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold text-sm mb-2">CVV *</label>
                            <input
                                type="password"
                                value={cardDetails.cvv}
                                onChange={(e) => {
                                    const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    onChange('cvv', v);
                                }}
                                placeholder="•••"
                                maxLength={4}
                                className={`w-full bg-white border rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-sm
                                    ${errors.cvv
                                        ? 'border-red-400 focus:ring-red-200'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                                    }`}
                            />
                            {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                        </div>
                    </div>
                </div>

                {/* Security badge */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-blue-100">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs text-gray-500">Your payment information is encrypted and secure</p>
                </div>
            </div>
        </div>
    );
}

function PlanSelectionCard({ plan, isSelected, onSelect }) {
    const planStyles = {
        standard: { badge: 'from-blue-600 to-teal-600', ring: 'border-blue-500', bg: 'from-blue-50 to-teal-50', check: 'from-blue-600 to-teal-600' },
        minimal: { badge: 'from-gray-700 to-gray-900', ring: 'border-gray-700', bg: 'from-gray-50 to-gray-100', check: 'from-gray-700 to-gray-900' },
        premium: { badge: 'from-yellow-500 to-orange-500', ring: 'border-yellow-500', bg: 'from-yellow-50 to-orange-50', check: 'from-yellow-500 to-orange-500' },
        compact: { badge: 'from-blue-500 to-cyan-500', ring: 'border-cyan-500', bg: 'from-blue-50 to-cyan-50', check: 'from-blue-500 to-cyan-500' },
    };
    const s = planStyles[plan.id] || planStyles.standard;

    return (
        <div
            onClick={() => onSelect(plan.id)}
            className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 group
                ${isSelected
                    ? `${s.ring} bg-gradient-to-br ${s.bg} shadow-xl scale-[1.02]`
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg hover:scale-[1.01]'
                }`}
        >
            {/* Selection checkmark */}
            {isSelected && (
                <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-r ${s.check} flex items-center justify-center shadow-lg`}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}

            {/* Plan badge */}
            <div className={`inline-block px-4 py-1.5 rounded-lg bg-gradient-to-r ${s.badge} mb-4 shadow-sm`}>
                <span className="text-white font-bold text-sm">{plan.name}</span>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-5 leading-relaxed">{plan.description}</p>

            {/* Feature list */}
            <ul className="space-y-2.5">
                {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-sm text-gray-700">
                        <svg className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-blue-500' : 'text-gray-400'
                            } group-hover:text-blue-400 transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                    </li>
                ))}
            </ul>

            {/* Bottom selection indicator */}
            <div className={`mt-5 pt-4 border-t flex items-center justify-between ${isSelected ? 'border-blue-200' : 'border-gray-100'
                }`}>
                <span className={`text-xs font-semibold ${isSelected ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                    {isSelected ? '✓ Selected' : 'Click to select'}
                </span>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
            </div>
        </div>
    );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function AddYardPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        // Account Information
        business_name: '',
        contact_name: '',
        email: '',
        phone: '',
        toll_free: '',
        fax: '',
        website: '',

        // Location
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'United States',

        // Owner Information
        owner_first_name: '',
        owner_last_name: '',
        owner_phone: '',
        owner_email: '',

        // Payment Method
        payment_method: '',

        // Business Hours
        business_hours: {
            monday: [{ open: '08:00', close: '17:00' }],
            tuesday: [{ open: '08:00', close: '17:00' }],
            wednesday: [{ open: '08:00', close: '17:00' }],
            thursday: [{ open: '08:00', close: '17:00' }],
            friday: [{ open: '08:00', close: '17:00' }],
            saturday: [{ open: '09:00', close: '14:00' }],
            sunday: []
        },

        // Business Details
        services: '',
        brands: '',
        parts_categories: '',
        description: '',

        // Subscription Plan
        subscription_plan: 'standard',

        // Media
        logo: null,
        images: []
    });

    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvv: '',
    });
    const [cardErrors, setCardErrors] = useState({});

    const paymentMethodOptions = [
        { method: 'credit_card', label: 'Credit Card', icon: '💳' },
        { method: 'debit_card', label: 'Debit Card', icon: '🏦' },
    ];

    const subscriptionPlans = [
        {
            id: 'standard',
            name: 'Standard Plan',
            description: 'Modern glassmorphism design with gradient effects',
            features: ['Featured Partner Badge', 'Gradient Text', 'Image Zoom Effect', 'Explore Now CTA'],
            color: 'from-blue-600 to-teal-600'
        },
        {
            id: 'minimal',
            name: 'Minimal Plan',
            description: 'Ultra clean and professional',
            features: ['Verified Badge', 'Clean White Card', 'Subtle Shadows', 'Learn More CTA'],
            color: 'from-gray-700 to-gray-900'
        },
        {
            id: 'premium',
            name: 'Premium Plan',
            description: 'Luxury gold design with epic animations',
            features: ['Premium Elite Badge', 'Gold Glow Effect', 'Shimmer Animations', 'Premium Access CTA'],
            color: 'from-yellow-500 to-orange-500'
        },
        {
            id: 'compact',
            name: 'Compact Plan',
            description: 'Sleek micro design for quick view',
            features: ['Top Pick Badge', 'Compact Layout', 'Gradient Text', 'Quick View CTA'],
            color: 'from-blue-500 to-cyan-500'
        }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePaymentSelect = (method) => {
        // Radio behaviour: selecting the same method deselects it
        setFormData(prev => ({
            ...prev,
            payment_method: prev.payment_method === method ? '' : method,
        }));
        // Reset card details when switching
        if (formData.payment_method !== method) {
            setCardDetails({ cardNumber: '', cardName: '', expiry: '', cvv: '' });
            setCardErrors({});
        }
    };

    const handleCardDetailChange = (field, value) => {
        setCardDetails(prev => ({ ...prev, [field]: value }));
        // Clear error on change
        if (cardErrors[field]) {
            setCardErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleHoursChange = (day, index, field, value) => {
        setFormData(prev => ({
            ...prev,
            business_hours: {
                ...prev.business_hours,
                [day]: prev.business_hours[day].map((slot, i) =>
                    i === index ? { ...slot, [field]: value } : slot
                )
            }
        }));
    };

    const addHourSlot = (day) => {
        setFormData(prev => ({
            ...prev,
            business_hours: {
                ...prev.business_hours,
                [day]: [...prev.business_hours[day], { open: '08:00', close: '17:00' }]
            }
        }));
    };

    const removeHourSlot = (day, index) => {
        setFormData(prev => ({
            ...prev,
            business_hours: {
                ...prev.business_hours,
                [day]: prev.business_hours[day].filter((_, i) => i !== index)
            }
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'logo') {
            setFormData(prev => ({ ...prev, logo: files[0] }));
        } else if (name === 'images') {
            setFormData(prev => ({ ...prev, images: Array.from(files) }));
        }
    };

    const validateStep = (currentStep) => {
        setError('');
        switch (currentStep) {
            case 1:
                if (!formData.business_name || formData.business_name.length < 3) {
                    setError('Business name must be at least 3 characters');
                    return false;
                }
                if (!formData.contact_name) {
                    setError('Contact name is required');
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
                if (!formData.address) {
                    setError('Address is required');
                    return false;
                }
                if (!formData.city) {
                    setError('City is required');
                    return false;
                }
                if (!formData.state) {
                    setError('State is required');
                    return false;
                }
                if (!formData.zip_code) {
                    setError('ZIP code is required');
                    return false;
                }
                break;
            case 5:
                if (!formData.services) {
                    setError('Services information is required');
                    return false;
                }
                if (!formData.brands) {
                    setError('Vehicle brands information is required');
                    return false;
                }
                if (!formData.description || formData.description.length < 50) {
                    setError('Description must be at least 50 characters');
                    return false;
                }
                break;
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        setStep(step - 1);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep(step)) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const submitData = new FormData();

            // Add all text fields
            Object.keys(formData).forEach(key => {
                if (key === 'logo' && formData[key]) {
                    submitData.append(key, formData[key]);
                } else if (key === 'images' && formData[key].length > 0) {
                    submitData.append(key, JSON.stringify([]));
                } else if (key === 'business_hours') {
                    submitData.append(key, JSON.stringify(formData[key]));
                } else if (formData[key] && typeof formData[key] !== 'object') {
                    submitData.append(key, formData[key]);
                }
            });

            // Call API using centralized service
            // Token is handled by interceptor, Content-Type is auto-set for FormData
            await api.submitYard(submitData);

            setSuccess(true);
        } catch (err) {
            console.error('Submission error:', err);
            if (err.response?.status === 401) {
                setError('Please sign in to submit your yard. You will be redirected...');
                setTimeout(() => {
                    window.location.href = '/signin?returnUrl=/add-a-yard';
                }, 2000);
            } else {
                setError(err.response?.data?.message || err.response?.data?.error || 'Failed to submit. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { number: 1, title: 'Account', icon: '🏢' },
        { number: 2, title: 'Location', icon: '📍' },
        { number: 3, title: 'Plan', icon: '⭐' },
        { number: 4, title: 'Owner', icon: '👤' },
        { number: 5, title: 'Details', icon: '📝' },
        { number: 6, title: 'Media', icon: '📸' }
    ];

    if (success) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50 pt-32 pb-20">
                    <div className="max-w-3xl mx-auto px-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-cyan-500/20 blur-3xl"></div>

                            <div className="relative bg-white backdrop-blur-2xl border border-green-200 rounded-3xl p-12 text-center shadow-lg">
                                <div className="relative inline-block mb-8">
                                    <div className="absolute inset-0 bg-green-500 blur-2xl opacity-50 animate-pulse"></div>
                                    <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>

                                <h2 className="text-4xl font-black text-gray-900 mb-4">
                                    Application <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Submitted!</span>
                                </h2>

                                <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                                    Thank you for choosing the <span className="text-blue-600 font-bold">{subscriptionPlans.find(p => p.id === formData.subscription_plan)?.name}</span>! We'll review your application and get back to you within <span className="text-green-400 font-bold">1-2 business days</span>.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={() => navigate('/')}
                                        className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                                        <span className="relative">Back to Home</span>
                                    </button>

                                    <button
                                        onClick={() => navigate('/vendors')}
                                        className="px-8 py-4 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300"
                                    >
                                        Browse Vendors
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <SEO
                title="List Your Junkyard - Add Your Auto Salvage Yard | Junkyards Near Me"
                description="Join our marketplace and reach thousands of customers searching for quality auto parts. List your junkyard or auto salvage yard today."
                canonical="/add-a-yard"
                noindex={true}
            />
            <Navbar />

            {/* Ultra-Modern Hero Section - Compact Mobile */}
            <div className="relative min-h-[35vh] sm:min-h-[45vh] md:min-h-[60vh] bg-gradient-to-br from-blue-600 to-teal-600 flex items-center overflow-hidden">


                <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full compact-section">
                    <div className="text-center space-y-2 sm:space-y-4 md:space-y-6 animate-fade-in">
                        {/* Premium Badge - Compact */}
                        <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                            <span className="text-white compact-text font-medium">Create New Account</span>
                        </div>

                        {/* Main Heading with Gradient Text - Compact */}
                        <h1 className="compact-hero font-black text-white leading-tight px-2">
                            List Your
                            <span className="block">Junkyard</span>
                        </h1>

                        <p className="compact-heading text-white/90 font-light max-w-3xl mx-auto px-2">
                            Join our marketplace and reach <span className="font-bold">thousands of customers</span> searching for quality auto parts
                        </p>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Form Section */}
            <div className="bg-gradient-to-br from-white via-blue-50 to-teal-50 compact-section pb-20">
                <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6">

                    {/* Progress Steps */}
                    <div className="mb-8 sm:mb-12 md:mb-16">
                        <div className="flex items-center justify-between max-w-4xl mx-auto">
                            {steps.map((s, idx) => (
                                <div key={s.number} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-1">
                                        <div className={`relative w-10 h-10 sm:w-12 md:w-14 sm:h-12 md:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-base sm:text-xl mb-2 transition-all duration-300 ${step >= s.number
                                            ? 'bg-gradient-to-br from-blue-600 to-teal-600 shadow-lg shadow-blue-500/50 scale-110'
                                            : 'bg-white border border-gray-200'
                                            }`}>
                                            {step > s.number ? (
                                                <svg className="w-5 h-5 sm:w-6 md:w-7 sm:h-6 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <span>{s.icon}</span>
                                            )}
                                        </div>
                                        <span className={`text-[10px] sm:text-xs font-bold transition-colors ${step >= s.number ? 'text-blue-600' : 'text-gray-400'
                                            }`}>
                                            {s.title}
                                        </span>
                                    </div>

                                    {idx < steps.length - 1 && (
                                        <div className={`h-1 flex-1 mx-0 rounded-full transition-all duration-500 ${step > s.number
                                            ? 'bg-gradient-to-r from-blue-600 to-teal-600'
                                            : 'bg-gray-200'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-3xl"></div>

                        <div className="relative bg-white backdrop-blur-2xl border border-gray-200 rounded-2xl md:rounded-3xl compact-card md:p-12 shadow-lg">
                            <form onSubmit={handleSubmit}>
                                {/* Step 1: Account Information */}
                                {step === 1 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="mb-8">
                                            <h2 className="text-3xl font-black text-gray-900 mb-2">Account Information</h2>
                                            <p className="text-gray-600">Tell us about your business</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <label className="block text-gray-900 font-semibold mb-3">Account Name *</label>
                                                <input
                                                    type="text"
                                                    name="business_name"
                                                    value={formData.business_name}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    placeholder="ABC Auto Parts & Salvage"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-gray-900 font-semibold mb-3">Contact Name *</label>
                                                <input
                                                    type="text"
                                                    name="contact_name"
                                                    value={formData.contact_name}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    placeholder="John Doe"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-900 font-semibold mb-3">Email *</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    placeholder="contact@example.com"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-900 font-semibold mb-3">Account Website</label>
                                                <input
                                                    type="url"
                                                    name="website"
                                                    value={formData.website}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    placeholder="http://www.mywebsite.com"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-900 font-semibold mb-3">Local Phone *</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    placeholder="(555) 123-4567"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-900 font-semibold mb-3">Toll Free</label>
                                                <input
                                                    type="tel"
                                                    name="toll_free"
                                                    value={formData.toll_free}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    placeholder="(800) 123-4567"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-gray-900 font-semibold mb-3">Fax</label>
                                                <input
                                                    type="tel"
                                                    name="fax"
                                                    value={formData.fax}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    placeholder="(555) 123-4568"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Location */}
                                {step === 2 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="mb-8">
                                            <h2 className="text-3xl font-black text-gray-900 mb-2">Location Details</h2>
                                            <p className="text-gray-600">Where can customers find you?</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-gray-900 font-semibold mb-3">Street Address *</label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    placeholder="123 Main Street"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-gray-900 font-semibold mb-3">ZIP/Postal Code *</label>
                                                    <input
                                                        type="text"
                                                        name="zip_code"
                                                        value={formData.zip_code}
                                                        onChange={handleChange}
                                                        className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                        placeholder="78701"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-gray-900 font-semibold mb-3">City *</label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleChange}
                                                        className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                        placeholder="Austin"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-gray-900 font-semibold mb-3">State/Province *</label>
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        value={formData.state}
                                                        onChange={handleChange}
                                                        className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                        placeholder="TX"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-gray-900 font-semibold mb-3">Country</label>
                                                    <input
                                                        type="text"
                                                        name="country"
                                                        value={formData.country}
                                                        onChange={handleChange}
                                                        className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Plan Selection + Payment */}
                                {step === 3 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="mb-8">
                                            <h2 className="text-3xl font-black text-gray-900 mb-2">Choose Your Plan</h2>
                                            <p className="text-gray-600">Select the advertising template that fits your needs</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {subscriptionPlans.map(plan => (
                                                <PlanSelectionCard
                                                    key={plan.id}
                                                    plan={plan}
                                                    isSelected={formData.subscription_plan === plan.id}
                                                    onSelect={(id) => setFormData(prev => ({ ...prev, subscription_plan: id }))}
                                                />
                                            ))}
                                        </div>

                                        {/* Payment Methods — Radio Style */}
                                        <div className="mt-10 pt-8 border-t border-gray-100">
                                            <label className="block text-gray-900 font-bold text-base mb-1">Payment Method</label>
                                            <p className="text-sm text-gray-500 mb-4">Select your preferred payment method</p>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {paymentMethodOptions.map(({ method, label, icon }) => (
                                                    <div key={method}>
                                                        <PaymentMethodCard
                                                            method={method}
                                                            label={label}
                                                            icon={icon}
                                                            isSelected={formData.payment_method === method}
                                                            onSelect={handlePaymentSelect}
                                                        />
                                                        <PaymentFormSection
                                                            isVisible={formData.payment_method === method}
                                                            cardDetails={cardDetails}
                                                            onChange={handleCardDetailChange}
                                                            errors={cardErrors}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Owner Information + Business Hours */}
                                {step === 4 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="mb-8">
                                            <h2 className="text-3xl font-black text-gray-900 mb-2">Business Owner</h2>
                                            <p className="text-gray-600">Owner contact information</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-gray-900 font-semibold mb-3">First Name</label>
                                                <input
                                                    type="text"
                                                    name="owner_first_name"
                                                    value={formData.owner_first_name}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    placeholder="John"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-900 font-semibold mb-3">Last Name</label>
                                                <input
                                                    type="text"
                                                    name="owner_last_name"
                                                    value={formData.owner_last_name}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    placeholder="Doe"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-900 font-semibold mb-3">Owner Phone</label>
                                                <input
                                                    type="tel"
                                                    name="owner_phone"
                                                    value={formData.owner_phone}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    placeholder="(555) 123-4567"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-900 font-semibold mb-3">Owner Email</label>
                                                <input
                                                    type="email"
                                                    name="owner_email"
                                                    value={formData.owner_email}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    placeholder="owner@example.com"
                                                />
                                            </div>
                                        </div>

                                        {/* Business Hours */}
                                        <div className="mt-8">
                                            <label className="block text-gray-900 font-semibold mb-4">Business Hours</label>
                                            <div className="space-y-4">
                                                {/* Monday to Saturday - Grouped */}
                                                <div className="bg-gray-50 rounded-xl p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-gray-900 font-semibold">Monday to Saturday</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => addHourSlot('monday')}
                                                            className="text-blue-600 text-sm hover:text-blue-700"
                                                        >
                                                            + Add Hours
                                                        </button>
                                                    </div>
                                                    {formData.business_hours.monday.length === 0 ? (
                                                        <p className="text-gray-400 text-sm">Closed</p>
                                                    ) : (
                                                        formData.business_hours.monday.map((slot, idx) => (
                                                            <div key={idx} className="flex items-center gap-3 mb-2">
                                                                <input
                                                                    type="time"
                                                                    value={slot.open}
                                                                    onChange={(e) => {
                                                                        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].forEach(day => {
                                                                            handleHoursChange(day, idx, 'open', e.target.value);
                                                                        });
                                                                    }}
                                                                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm"
                                                                />
                                                                <span className="text-gray-600">to</span>
                                                                <input
                                                                    type="time"
                                                                    value={slot.close}
                                                                    onChange={(e) => {
                                                                        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].forEach(day => {
                                                                            handleHoursChange(day, idx, 'close', e.target.value);
                                                                        });
                                                                    }}
                                                                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm"
                                                                />
                                                                {formData.business_hours.monday.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].forEach(day => {
                                                                                removeHourSlot(day, idx);
                                                                            });
                                                                        }}
                                                                        className="text-red-600 hover:text-red-700"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))
                                                    )}
                                                </div>

                                                {/* Sunday - Separate */}
                                                <div className="bg-gray-50 rounded-xl p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-gray-900 font-semibold">Sunday</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (formData.business_hours.sunday.length === 0) {
                                                                    addHourSlot('sunday');
                                                                } else {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        business_hours: {
                                                                            ...prev.business_hours,
                                                                            sunday: []
                                                                        }
                                                                    }));
                                                                }
                                                            }}
                                                            className={`text-sm font-medium ${formData.business_hours.sunday.length === 0
                                                                ? 'text-blue-600 hover:text-blue-700'
                                                                : 'text-red-600 hover:text-red-700'
                                                                }`}
                                                        >
                                                            {formData.business_hours.sunday.length === 0 ? '+ Open Sunday' : 'Mark as Closed'}
                                                        </button>
                                                    </div>
                                                    {formData.business_hours.sunday.length === 0 ? (
                                                        <div className="flex items-center gap-2 text-red-600">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            <span className="font-medium">Holiday - Closed</span>
                                                        </div>
                                                    ) : (
                                                        formData.business_hours.sunday.map((slot, idx) => (
                                                            <div key={idx} className="flex items-center gap-3 mb-2">
                                                                <input
                                                                    type="time"
                                                                    value={slot.open}
                                                                    onChange={(e) => handleHoursChange('sunday', idx, 'open', e.target.value)}
                                                                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm"
                                                                />
                                                                <span className="text-gray-600">to</span>
                                                                <input
                                                                    type="time"
                                                                    value={slot.close}
                                                                    onChange={(e) => handleHoursChange('sunday', idx, 'close', e.target.value)}
                                                                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm"
                                                                />
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 5: Business Details */}
                                {step === 5 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="mb-8">
                                            <h2 className="text-3xl font-black text-gray-900 mb-2">Business Details</h2>
                                            <p className="text-gray-600">What makes your yard special?</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-gray-900 font-semibold mb-3">Services Offered *</label>
                                                <textarea
                                                    name="services"
                                                    value={formData.services}
                                                    onChange={handleChange}
                                                    rows={3}
                                                    className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                                    placeholder="Auto parts, Towing, Recycling, etc."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-900 font-semibold mb-3">Vehicle Makes/Brands *</label>
                                                <textarea
                                                    name="brands"
                                                    value={formData.brands}
                                                    onChange={handleChange}
                                                    rows={3}
                                                    className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                                    placeholder="Ford, Chevrolet, Toyota, Honda, etc."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-900 font-semibold mb-3">Parts Categories</label>
                                                <textarea
                                                    name="parts_categories"
                                                    value={formData.parts_categories}
                                                    onChange={handleChange}
                                                    rows={2}
                                                    className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                                    placeholder="Engines, Transmissions, Body Parts, etc."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-900 font-semibold mb-3">Business Description *</label>
                                                <textarea
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleChange}
                                                    rows={5}
                                                    className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                                    placeholder="Describe your business, what makes you unique, your experience, etc."
                                                />
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className={`text-sm ${formData.description.length >= 50 ? 'text-green-400' : 'text-gray-400'}`}>
                                                        {formData.description.length} / 50 characters minimum
                                                    </p>
                                                    {formData.description.length >= 50 && (
                                                        <span className="text-green-400 text-sm">✓ Good to go!</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 6: Media Upload */}
                                {step === 6 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="mb-8">
                                            <h2 className="text-3xl font-black text-gray-900 mb-2">Media & Images</h2>
                                            <p className="text-gray-600">Make your listing stand out (optional)</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-gray-900 font-semibold mb-3">Business Logo</label>
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        name="logo"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="w-full bg-dark-700/50 border-2 border-dashed border-white/10 rounded-xl px-5 py-8 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white file:font-semibold hover:file:bg-cyan-600 cursor-pointer focus:border-cyan-500 focus:outline-none transition-all"
                                                    />
                                                    <p className="text-gray-400 text-sm mt-2">Max 2MB, JPG or PNG</p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-gray-900 font-semibold mb-3">Yard Images</label>
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        name="images"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleFileChange}
                                                        className="w-full bg-dark-700/50 border-2 border-dashed border-white/10 rounded-xl px-5 py-8 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white file:font-semibold hover:file:bg-blue-600 cursor-pointer focus:border-cyan-500 focus:outline-none transition-all"
                                                    />
                                                    <p className="text-gray-400 text-sm mt-2">Max 5 images, 5MB each</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 animate-shake">
                                        <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-red-400 font-medium">{error}</p>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/10">
                                    {step > 1 ? (
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="group flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300"
                                        >
                                            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Back
                                        </button>
                                    ) : (
                                        <div></div>
                                    )}

                                    {step < 6 ? (
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/30"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                                            <span className="relative flex items-center gap-2">
                                                Continue
                                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                                            <span className="relative flex items-center gap-2">
                                                {loading ? (
                                                    <>
                                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        Submit Application
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </>
                                                )}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Ad Banner */}
            <MobileAdBanner page="add-yard" />

            <Footer />
        </>
    );
}
