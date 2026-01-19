import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { api } from '../services/api'

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await api.sendContactMessage(formData)
            alert('Thank you for your message! We will get back to you shortly.')
            setFormData({ name: '', email: '', subject: '', message: '' })
        } catch (error) {
            console.error('Error sending message:', error)
            alert('Failed to send message. Please try again later.')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-teal-50 text-gray-700 selection:bg-blue-100">
            {/* SEO Meta Tags */}
            <SEO
                title="Contact Us - Get Help Finding Auto Parts"
                description="Contact Junkyards Near Me for support. Questions about finding parts, vendor inquiries, or technical support. We're here to help connect you with the right salvage yard."
            />

            <Navbar />

            {/* Hero Section - Compact */}
            <div className="relative compact-section overflow-hidden bg-gradient-to-br from-blue-600 to-teal-600 pb-24">
                <div className="absolute inset-0 bg-white/10 blur-[100px] rounded-full transform -translate-y-1/2 translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-8">
                        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm">
                            <span className="text-white font-bold text-sm tracking-wide uppercase">
                                Get in Touch
                            </span>
                        </div>
                        <h1 className="compact-hero font-black mb-2 sm:mb-3 md:mb-4 text-white px-2">
                            We'd Love to <br />
                            <span className="text-teal-200">
                                Hear from You
                            </span>
                        </h1>
                        <p className="compact-heading text-white/90 font-light leading-relaxed px-2">
                            Have questions about finding a part? Need help using our platform? Our team is here to assist you 24/7.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-20">
                <div className="grid lg:grid-cols-2 compact-gap">
                    {/* Contact Info Card */}
                    <div className="space-y-3 sm:space-y-4 md:space-y-6">
                        <div className="bg-white shadow-xl border border-gray-100 rounded-2xl md:rounded-3xl compact-card hover:shadow-2xl transition-all duration-300">
                            <h3 className="compact-title font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 flex items-center gap-2 sm:gap-3">
                                <span className="p-1.5 sm:p-2 md:p-3 bg-blue-100 rounded-lg md:rounded-xl text-blue-600">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </span>
                                Office Headquarters
                            </h3>
                            <div className="space-y-2 sm:space-y-3 md:space-y-4 text-gray-600">
                                <p className="flex items-start gap-2 sm:gap-3 md:gap-4 compact-text">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>
                                        123 Auto Salvage Way<br />
                                        Phoenix, AZ 85001<br />
                                        United States
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="bg-white shadow-xl border border-gray-100 rounded-2xl md:rounded-3xl compact-card hover:shadow-2xl transition-all duration-300">
                            <h3 className="compact-title font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 flex items-center gap-2 sm:gap-3">
                                <span className="p-1.5 sm:p-2 md:p-3 bg-teal-100 rounded-lg md:rounded-xl text-teal-600">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                Direct Contact
                            </h3>
                            <div className="space-y-2 sm:space-y-3 md:space-y-4 text-gray-600">
                                <a href="mailto:support@jynm.com" className="flex items-center gap-2 sm:gap-3 md:gap-4 hover:text-blue-600 transition-colors compact-text">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    support@jynm.com
                                </a>
                                <a href="tel:+18005551234" className="flex items-center gap-2 sm:gap-3 md:gap-4 hover:text-blue-600 transition-colors compact-text">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    +1 (800) 555-1234
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white shadow-xl border border-gray-100 rounded-2xl md:rounded-3xl compact-card relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 pointer-events-none"></div>
                        <h2 className="compact-title font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 px-6 pt-6 relative z-10">Send us a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-6 relative z-10 px-6 pb-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-400"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-400"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-400"
                                    placeholder="How can we help?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={4}
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-400"
                                    placeholder="Tell us more regarding your inquiry..."
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
