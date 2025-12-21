import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function QuoteRequest() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    // Get part details from URL params
    const make = searchParams.get('make') || ''
    const model = searchParams.get('model') || ''
    const part = searchParams.get('part') || ''
    const year = searchParams.get('year') || ''

    // Generate random security code
    const [securityCode] = useState(Math.random().toString(36).substring(2, 8).toUpperCase())

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
        window.location.reload()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
            <Navbar />

            <div className="relative py-16 px-4">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 via-secondary-600/5 to-accent-600/5"></div>

                <div className="relative max-w-3xl mx-auto">
                    {/* Vehicle Selection Summary */}
                    <div className="text-center mb-8 animate-fade-in">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full mb-6">
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-white/90 font-semibold">Vehicle Selected</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-300 to-purple-300 mb-4">
                            You have selected a
                        </h1>
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6 shadow-glass">
                            <p className="text-3xl md:text-4xl font-black text-white">
                                {year} {make} {model}
                            </p>
                            <p className="text-xl md:text-2xl text-cyan-400 font-bold mt-2">
                                {part}
                            </p>
                        </div>
                        <p className="text-xl text-white/70">
                            Complete the fields below to get an <span className="text-cyan-400 font-bold">Instant Quote</span>
                        </p>
                    </div>

                    {/* Quote Form Card */}
                    <div className="relative animate-scale-in">
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-20"></div>

                        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                            {/* Header with Gradient */}
                            <div className="relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 animate-gradient"></div>
                                <div className="relative py-6 px-6 text-center">
                                    <h2 className="text-3xl font-black text-white">GET A QUOTE NOW</h2>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="text-dark-900 font-bold mb-2 flex items-center text-sm">
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
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none text-dark-900 font-medium bg-white transition-all"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="text-dark-900 font-bold mb-2 flex items-center text-sm">
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
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 outline-none text-dark-900 font-medium bg-white transition-all"
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="text-dark-900 font-bold mb-2 flex items-center text-sm">
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
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none text-dark-900 font-medium bg-white transition-all"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                {/* ZIP */}
                                <div>
                                    <label className="text-dark-900 font-bold mb-2 flex items-center text-sm">
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
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none text-dark-900 font-medium bg-white transition-all"
                                        placeholder="Enter your ZIP code"
                                    />
                                </div>

                                {/* Security Code */}
                                <div>
                                    <label className="text-dark-900 font-bold mb-2 flex items-center text-sm">
                                        <svg className="w-5 h-5 text-secondary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                        Security Code <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 px-8 py-4 rounded-xl border-2 border-gray-300 shadow-inner">
                                            <span className="text-3xl font-black text-dark-900 tracking-widest select-none" style={{ fontFamily: 'monospace' }}>
                                                {securityCode}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={refreshSecurityCode}
                                            className="text-cyan-500 hover:text-cyan-600 font-semibold text-sm underline"
                                        >
                                            Change?
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        name="securityCodeInput"
                                        value={formData.securityCodeInput}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 outline-none text-dark-900 font-medium bg-white transition-all uppercase"
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
                                    <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:from-blue-600 group-hover:to-cyan-600 text-white font-black py-5 px-6 rounded-xl text-xl transition-all duration-300 shadow-glow group-hover:shadow-glow-lg transform group-hover:scale-[1.02]">
                                        FIND MY PART NOW →
                                    </div>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-glass">
                        <div className="flex items-center justify-center gap-8 flex-wrap">
                            {/* 100% Satisfaction */}
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-glow">
                                    <span className="text-3xl font-black text-white">100%</span>
                                </div>
                                <p className="text-xs text-white/80 font-semibold">SATISFACTION<br />GUARANTEE</p>
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
                                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-xs text-white/80 font-semibold">VERISIGN<br />SECURED</p>
                            </div>

                            {/* Authorize.net */}
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-glow">
                                    <span className="text-xs font-black text-white leading-tight">AUTHORIZE<br />.NET</span>
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
