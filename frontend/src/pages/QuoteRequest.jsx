import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

const US_STATES = ['AK', 'AL', 'AR', 'AS', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'GU', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MP', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VI', 'VT', 'WA', 'WI', 'WV', 'WY']

export default function QuoteRequest() {
    const [searchParams] = useSearchParams()

    // Get part details from URL params
    const make = searchParams.get('make') || ''
    const model = searchParams.get('model') || ''
    const part = searchParams.get('part') || ''
    const year = searchParams.get('year') || ''
    
    // CMS Data
    const [cmsData, setCmsData] = useState({})

    useEffect(() => {
        const fetchCMS = async () => {
            try {
                const response = await api.cms.getContent('quote_request');
                if (response?.data) {
                    const contentMap = {};
                    response.data.forEach(item => { contentMap[item.key] = item.value; });
                    setCmsData(contentMap);
                }
            } catch (err) {
                console.error('Failed to fetch CMS configuration:', err);
            }
        };
        fetchCMS();
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        state: '',
        zip: ''
    })

    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [formError, setFormError] = useState('')

    // CAPTCHA
    const [captchaCode, setCaptchaCode] = useState('')
    const [captchaInput, setCaptchaInput] = useState('')

    const generateCaptcha = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
        const nums = '23456789'
        const code = [
            nums[Math.floor(Math.random() * nums.length)],
            chars[Math.floor(Math.random() * chars.length)],
            (chars + nums)[Math.floor(Math.random() * (chars.length + nums.length))],
            (chars + nums)[Math.floor(Math.random() * (chars.length + nums.length))]
        ]
        return code.sort(() => Math.random() - 0.5).join('')
    }

    useEffect(() => {
        setCaptchaCode(generateCaptcha())
    }, [])

    const formatPhone = (val) => {
        const raw = val.replace(/\D/g, '').substring(0, 10)
        if (raw.length === 0) return ''
        if (raw.length <= 3) return raw
        if (raw.length <= 6) return `(${raw.slice(0, 3)}) ${raw.slice(3)}`
        return `(${raw.slice(0, 3)}) ${raw.slice(3, 6)}-${raw.slice(6)}`
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handlePhoneChange = (e) => {
        setFormData({
            ...formData,
            phone: formatPhone(e.target.value)
        })
    }

    // Zip Code Dropdown State
    const [zipcodes, setZipcodes] = useState([])
    const [showZipSuggestions, setShowZipSuggestions] = useState(false)
    const [loadingZipcodes, setLoadingZipcodes] = useState(false)

    useEffect(() => {
        const fetchZipcodes = async () => {
            if (!formData.state) {
                setZipcodes([]); setShowZipSuggestions(false); return
            }
            setLoadingZipcodes(true)
            try {
                const data = await api.getZipcodesByState(formData.state)
                if (data && data.zipcodes) {
                    setZipcodes(data.zipcodes)
                } else {
                    setZipcodes([])
                }
            } catch (err) {
                setZipcodes([])
            } finally {
                setLoadingZipcodes(false)
            }
        }
        fetchZipcodes()
    }, [formData.state])

    const handleNext = () => {
        if (!formData.name || !formData.phone || !formData.email) {
            setFormError('Please fill in Name, Phone, and Email')
            return
        }
        setFormError('')
        setCurrentStep(2)
    }

    const handleBack = () => {
        setCurrentStep(1)
        setFormError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.name || !formData.phone || !formData.email || !formData.state || !formData.zip) {
            setFormError('Please fill in all required fields')
            return
        }

        if (captchaInput.toUpperCase() !== captchaCode) {
            setFormError('Security code does not match. Please try again.')
            setCaptchaCode(generateCaptcha())
            setCaptchaInput('')
            return
        }

        setFormError('')
        setIsSubmitting(true)

        try {
            await api.createLead({
                make: make || 'Unknown',
                model: model || 'Unknown',
                year: year ? parseInt(year) : 2024,
                part: part || 'Unknown',
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                state: formData.state,
                zip: formData.zip,
                lead_type: 'quality_auto_parts',
            })
            setSubmitSuccess(true)
        } catch (err) {
            setFormError('Submission failed. Please try again.')
            console.error(err)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <SEO
                title={`Get Quote - ${year} ${make} ${model} ${part} | Junkyards Near Me`}
                description={`Request an instant quote for ${part} for your ${year} ${make} ${model}. Connect with verified auto salvage yards and get the best prices on used auto parts.`}
                canonicalUrl="/quote"
                noindex={true}
            />
            <Navbar />

            <div className="flex-1 pt-12 md:pt-16 pb-20">
                <div className="max-w-xl mx-auto px-4 sm:px-6">
                    {/* Header Banner */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full mb-6 bg-blue-50 text-blue-600 text-[13px] font-bold border border-blue-100">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                            Getting Quotes For
                        </div>
                        
                        {make && model && year ? (
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {year} {make} {model} <br/>
                                <span className="text-blue-600">{part}</span>
                            </h1>
                        ) : (
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {cmsData.hero_heading ? (
                                    <span dangerouslySetInnerHTML={{ __html: cmsData.hero_heading }} />
                                ) : (
                                    <>Request an <span className="text-blue-600">Instant Quote</span></>
                                )}
                            </h1>
                        )}
                        <p className="mt-4 text-slate-500 font-medium">
                            {cmsData.instruction_text ? (
                                <span dangerouslySetInnerHTML={{ __html: cmsData.instruction_text }} />
                            ) : (
                                'Complete the fields below to connect with verified auto salvage yards nationwide.'
                            )}
                        </p>
                    </div>

                    {/* Main Form Container */}
                    <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(37,99,235,0.06)] border border-blue-100 overflow-hidden">
                        
                        {submitSuccess ? (
                            <div className="p-12 text-center">
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-2">Quote Request Sent!</h2>
                                <p className="text-slate-500 font-medium mb-8">
                                    We've broadcasted your request to our network of verified salvage yards. You'll receive quotes shortly.
                                </p>
                                <Link to="/" className="inline-flex items-center justify-center bg-blue-600 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                    Return to Home
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Progress Bar */}
                                <div className="flex bg-slate-50 border-b border-slate-100">
                                    <div className={`flex-1 py-4 text-center text-sm font-bold transition-colors ${currentStep === 1 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>
                                        1. Contact Details
                                    </div>
                                    <div className={`flex-1 py-4 text-center text-sm font-bold transition-colors ${currentStep === 2 ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400'}`}>
                                        2. Location & Submit
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="p-8 sm:p-10 relative overflow-hidden" style={{ minHeight: '400px' }}>
                                    
                                    {formError && (
                                        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">
                                            {formError}
                                        </div>
                                    )}

                                    <AnimatePresence mode="wait">
                                        {currentStep === 1 && (
                                            <motion.div
                                                key="step1"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ duration: 0.2 }}
                                                className="space-y-6"
                                            >
                                                <div>
                                                    <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        required
                                                        placeholder="John Doe"
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handlePhoneChange}
                                                        required
                                                        placeholder="(555) 123-4567"
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        required
                                                        placeholder="john@example.com"
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleNext}
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-[0_8px_20px_rgb(37,99,235,0.25)] mt-4 flex justify-center items-center gap-2"
                                                >
                                                    Continue to Location
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                                </button>
                                            </motion.div>
                                        )}

                                        {currentStep === 2 && (
                                            <motion.div
                                                key="step2"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.2 }}
                                                className="space-y-6 flex flex-col h-full"
                                            >
                                                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                                    <button type="button" onClick={handleBack} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center transition">
                                                        ←
                                                    </button>
                                                    <span className="text-sm font-bold text-slate-900">Go Back</span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">State <span className="text-red-500">*</span></label>
                                                        <select 
                                                            name="state"
                                                            value={formData.state}
                                                            onChange={(e) => { handleChange(e); setFormData(prev => ({...prev, zip: ''})) }}
                                                            required
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all appearance-none cursor-pointer"
                                                        >
                                                            <option value="">Select</option>
                                                            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="relative">
                                                        <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">ZIP Code <span className="text-red-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            name="zip"
                                                            value={formData.zip}
                                                            onChange={e => {
                                                                const val = e.target.value.replace(/\D/g, '').slice(0, 5)
                                                                setFormData(prev => ({ ...prev, zip: val }))
                                                                if (zipcodes.length > 0) setShowZipSuggestions(true)
                                                            }}
                                                            onFocus={() => { if (zipcodes.length > 0) setShowZipSuggestions(true) }}
                                                            onBlur={() => setTimeout(() => setShowZipSuggestions(false), 200)}
                                                            maxLength={5}
                                                            required
                                                            placeholder="12345"
                                                            autoComplete="off"
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                                                        />
                                                        {showZipSuggestions && zipcodes.length > 0 && (
                                                            <div className="absolute top-[80px] left-0 z-50 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                                                {zipcodes.filter(z => z.postal_code.startsWith(formData.zip)).map(z => (
                                                                    <div key={z.postal_code}
                                                                        className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 border-b last:border-0 border-slate-100 transition-colors"
                                                                        onClick={() => {
                                                                            setFormData(prev => ({ ...prev, zip: z.postal_code }))
                                                                            setShowZipSuggestions(false)
                                                                        }}>
                                                                        <span className="font-bold text-slate-900">{z.postal_code}</span> - <span className="text-slate-500">{z.city_name}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {loadingZipcodes && <div className="absolute right-4 top-10"><div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">Security Verification <span className="text-red-500">*</span></label>
                                                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                                                        <div className="flex items-center gap-2 flex-shrink-0 bg-slate-900 rounded-xl px-4 py-3">
                                                            <div
                                                                className="font-black text-lg text-slate-100 select-none flex items-center justify-center"
                                                                style={{ fontFamily: "'Courier New', monospace", letterSpacing: '0.35em', textDecoration: 'line-through 1px rgba(255,255,255,0.15)' }}
                                                            >
                                                                {captchaCode}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => { setCaptchaCode(generateCaptcha()); setCaptchaInput('') }}
                                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                                                title="Refresh CAPTCHA"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        
                                                        <input
                                                            type="text"
                                                            placeholder="Enter code"
                                                            value={captchaInput}
                                                            onChange={e => setCaptchaInput(e.target.value.toUpperCase().slice(0, 4))}
                                                            maxLength={4}
                                                            autoComplete="off"
                                                            required
                                                            className="flex-1 w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all uppercase tracking-widest text-center"
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting || formData.zip.length < 5}
                                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-4 px-6 rounded-xl transition-all shadow-[0_8px_20px_rgb(16,185,129,0.25)] disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2 mt-4"
                                                >
                                                    {isSubmitting ? 'Sending Request...' : '✓ Get Instant Quotes'}
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </form>
                            </>
                        )}
                    </div>

                    {/* Trust Badges below form */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[13px] font-bold text-slate-500">
                        {cmsData.trust_text ? (
                            cmsData.trust_text.split('•').map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {item.trim()}
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="flex items-center gap-1.5"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Secure & Encrypted</div>
                                <div className="flex items-center gap-1.5"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>100% Free</div>
                                <div className="flex items-center gap-1.5"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>No Obligation</div>
                            </>
                        )}
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    )
}
