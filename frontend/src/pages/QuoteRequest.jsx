import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

export default function QuoteRequest() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    // Get part details from URL params
    const make = searchParams.get('make') || ''
    const model = searchParams.get('model') || ''
    const part = searchParams.get('part') || ''
    const year = searchParams.get('year') || ''

    // Generate random security code
    const [securityCode, setSecurityCode] = useState('')
    
    // CMS Data
    const [cmsData, setCmsData] = useState({})

    useEffect(() => {
        setSecurityCode(Math.random().toString(36).substring(2, 8).toUpperCase())
        
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
        zip: '',
        securityCodeInput: ''
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        // Validate form
        if (!formData.name || !formData.phone || !formData.email || !formData.zip) {
            alert('Please fill in all required fields')
            return
        }

        // Validate security code
        if (formData.securityCodeInput.toUpperCase() !== securityCode) {
            alert('Security code does not match. Please try again.')
            return
        }

        // Here you would typically send the data to your backend
        console.log('Quote Request:', {
            ...formData,
            make,
            model,
            part,
            year
        })

        // Navigate to search results
        navigate(`/search?make=${make}&model=${model}&part=${part}&year=${year}`)
    }

    const refreshSecurityCode = () => {
        setSecurityCode(Math.random().toString(36).substring(2, 8).toUpperCase())
        setFormData({...formData, securityCodeInput: ''})
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
            <SEO
                title={`Get Quote - ${year} ${make} ${model} ${part} | Junkyards Near Me`}
                description={`Request an instant quote for ${part} for your ${year} ${make} ${model}. Connect with verified auto salvage yards and get the best prices on used auto parts.`}
                canonicalUrl="/quote"
                noindex={true}
            />
            <Navbar />

            {/* ── HERO ── */}
            <section className="hero-depth pt-24 pb-16 flex flex-col justify-center items-center text-center" style={{ minHeight: '40vh', background: 'var(--bg-base)' }}>
                <div className="hero-bg-primary" style={{ backgroundImage: "url('/heroes/engine-glow-dark.png')", opacity: 0.7 }} />
                <div className="hero-overlay-base" />
                <div className="hero-vignette" />
                <div className="hero-glow-teal" />
                <div className="hero-glow-orange" />
                <div className="hero-grid" />
                <div className="hero-scanline" />
                <div className="hero-fade-bottom" />

                <div className="hero-content relative max-w-4xl mx-auto px-4 text-center z-10 w-full mt-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 border shadow-xl animate-fade-in" style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                        <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse" />
                        <span className="text-white text-[0.75rem] font-bold tracking-[0.12em] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            Vehicle Selected
                        </span>
                    </div>

                    {cmsData.hero_heading ? (
                        <h1 className="animate-fade-in-up text-white" dangerouslySetInnerHTML={{ __html: cmsData.hero_heading }} style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', marginBottom: '0.5rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }} />
                    ) : (
                        <h1 className="animate-fade-in-up text-white" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', marginBottom: '0.5rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                            You have selected a
                        </h1>
                    )}
                    
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6 shadow-2xl inline-block min-w-[300px] animate-fade-in-up delay-100">
                        <p className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif", textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                            {year} {make} {model}
                        </p>
                        <p className="text-xl md:text-2xl text-blue-400 font-bold mt-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {part}
                        </p>
                    </div>
                </div>
            </section>

            <div className="relative pb-16 px-4 bg-white">
                <div className="relative max-w-3xl mx-auto -mt-16 z-20">
                    {cmsData.instruction_text ? (
                        <p className="text-xl text-slate-600 text-center mb-6 font-semibold" dangerouslySetInnerHTML={{ __html: cmsData.instruction_text }} />
                    ) : (
                        <p className="text-xl text-slate-600 text-center mb-6 font-semibold">
                            Complete the fields below to get an <span className="text-blue-600 font-bold">Instant Quote</span>
                        </p>
                    )}

                    {/* Quote Form Card */}
                    <div className="relative animate-scale-in">
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-orange-500 rounded-3xl blur-md opacity-20"></div>

                        <div className="relative bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden border border-slate-200">
                            {/* Header with Gradient */}
                            <div className="relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700"></div>
                                <div className="relative py-6 px-6 text-center">
                                    <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '0.05em' }}>
                                        {cmsData.form_heading || 'GET A QUOTE NOW'}
                                    </h2>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="text-slate-800 font-bold mb-2 flex items-center text-sm">
                                        <svg className="w-5 h-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        Name <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none text-slate-800 font-medium bg-white transition-all"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="text-slate-800 font-bold mb-2 flex items-center text-sm">
                                        <svg className="w-5 h-5 text-secondary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                        </svg>
                                        Phone <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 outline-none text-slate-800 font-medium bg-white transition-all"
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="text-slate-800 font-bold mb-2 flex items-center text-sm">
                                        <svg className="w-5 h-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                        Email <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none text-slate-800 font-medium bg-white transition-all"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                {/* ZIP */}
                                <div>
                                    <label className="text-slate-800 font-bold mb-2 flex items-center text-sm">
                                        <svg className="w-5 h-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        ZIP Code <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="zip"
                                        value={formData.zip}
                                        onChange={handleChange}
                                        required
                                        pattern="[0-9]{5}"
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none text-slate-800 font-medium bg-white transition-all"
                                        placeholder="Enter your ZIP code"
                                    />
                                </div>

                                {/* Security Code */}
                                <div>
                                    <label className="text-slate-800 font-bold mb-2 flex items-center text-sm">
                                        <svg className="w-5 h-5 text-secondary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                        {cmsData.security_code_label || 'Security Code'} <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 px-8 py-4 rounded-xl border-2 border-gray-300 shadow-inner">
                                            <span className="text-3xl font-black text-slate-800 tracking-widest select-none" style={{ fontFamily: 'monospace' }}>
                                                {securityCode}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={refreshSecurityCode}
                                            className="text-cyan-500 hover:text-cyan-600 font-semibold text-sm underline"
                                        >
                                            {cmsData.security_code_change_text || 'Change?'}
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        name="securityCodeInput"
                                        value={formData.securityCodeInput}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 outline-none text-slate-800 font-medium bg-white transition-all uppercase"
                                        placeholder="Enter the security code above"
                                        maxLength={6}
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="relative w-full group overflow-hidden mt-8"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 animate-gradient"></div>
                                    <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:from-blue-600 group-hover:to-cyan-600 text-slate-800 font-black py-5 px-6 rounded-xl text-xl transition-all duration-300 shadow-glow group-hover:shadow-glow-lg transform group-hover:scale-[1.02]">
                                        {cmsData.form_submit_button || 'FIND MY PART NOW →'}
                                    </div>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-8 bg-white/10 backdrop-blur-xl border border-slate-300 rounded-2xl p-8 shadow-glass">
                        <div className="flex items-center justify-center gap-8 flex-wrap">
                            {/* 100% Satisfaction */}
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-glow">
                                    <span className="text-3xl font-black text-slate-800">100%</span>
                                </div>
                                <p className="text-xs text-slate-600 font-semibold uppercase whitespace-pre-line text-center hover:scale-105 transition-transform" dangerouslySetInnerHTML={{ __html: cmsData.trust_badge_1?.replace(/\|/g, '<br />') || '100%<br />SATISFACTION<br />GUARANTEE' }} />
                            </div>

                            {/* Payment Methods */}
                            <div className="flex gap-3">
                                <div className="w-16 h-12 bg-white/90 rounded-lg flex items-center justify-center shadow-md">
                                    <span className="text-xs font-black text-blue-600">VISA</span>
                                </div>
                                <div className="w-16 h-12 bg-white/90 rounded-lg flex items-center justify-center shadow-md">
                                    <span className="text-xs font-black text-red-600">MC</span>
                                </div>
                                <div className="w-16 h-12 bg-white/90 rounded-lg flex items-center justify-center shadow-md">
                                    <span className="text-xs font-black text-blue-800">AMEX</span>
                                </div>
                            </div>

                            {/* VeriSign */}
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-glow">
                                    <svg className="w-12 h-12 text-slate-800" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-xs text-slate-600 font-semibold uppercase whitespace-pre-line text-center hover:scale-105 transition-transform" dangerouslySetInnerHTML={{ __html: cmsData.trust_badge_2?.replace(/\|/g, '<br />') || 'VERISIGN<br />SECURED' }} />
                            </div>

                            {/* Authorize.net */}
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-glow">
                                    <span className="text-xs font-black text-slate-800 leading-tight uppercase whitespace-pre-line text-center hover:scale-105 transition-transform" dangerouslySetInnerHTML={{ __html: cmsData.trust_badge_3?.replace(/\|/g, '<br />') || 'AUTHORIZE<br />.NET' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
