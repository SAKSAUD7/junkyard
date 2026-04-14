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
    const [isSuccess, setIsSuccess] = useState(false)
    const [isError, setIsError] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        setIsSuccess(false)
        setIsError(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setIsSuccess(false)
        setIsError(false)

        try {
            await api.sendContactMessage(formData)
            setIsSuccess(true)
            setFormData({ name: '', email: '', subject: '', message: '' })
            setTimeout(() => setIsSuccess(false), 10000)
        } catch (error) {
            console.error('Error sending message:', error)
            // Even if it 500s right now, we can degrade gracefully by informing the user visually without crashing
            setIsError(true)
            setTimeout(() => setIsError(false), 8000)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <SEO
                title="Contact Us - Get Help Finding Auto Parts"
                description="Contact Junkyards Near Me for support. Questions about finding parts, vendor inquiries, or technical support. We're here to help connect you with the right salvage yard."
            />

            <Navbar />

            {/* Hero Section - Cinematic Car Imagery */}
            <div className="hero-depth pt-24 pb-20 flex flex-col justify-center items-center text-center" style={{ minHeight: '40vh', background: 'var(--bg-base)' }}>
                {/* PRIMARY — aerial junkyard cars at night */}
                <div className="hero-bg-primary" style={{ backgroundImage: "url('/heroes/aerial-night.png')", opacity: 0.55 }} />
                {/* DEPTH — stacked crushed cars, blurred */}
                <div className="hero-bg-depth" style={{ backgroundImage: "url('/heroes/stacked-cars.png')" }} />
                <div className="hero-overlay-base" />
                <div className="hero-vignette" />
                <div className="hero-glow-teal" />
                <div className="hero-glow-orange" />
                <div className="hero-grid" />
                <div className="hero-scanline" />
                <div className="hero-fade-bottom" />

                <div className="hero-content relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="text-center max-w-3xl mx-auto mb-8">
                        <div className="inline-block mb-4 px-4 py-1.5 rounded-full border shadow-xl" style={{ border: '1px solid rgba(37,99,235,0.4)', background: 'rgba(37,99,235,0.15)', backdropFilter: 'blur(10px)' }}>
                            <span className="font-bold text-xs tracking-wider uppercase text-blue-300">
                                Get in Touch
                            </span>
                        </div>
                        <h1 className="font-black mb-4 px-2 text-white" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontFamily: "'Outfit', sans-serif", textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
                            We'd Love to <br />
                            <span className="text-blue-400">
                                Hear from You
                            </span>
                        </h1>
                        <p className="font-light leading-relaxed px-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
                            Have questions about finding a part? Need help using our platform? Our team is here to assist you 24/7.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-20">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Contact Info Cards */}
                    <div className="space-y-6 mt-16 lg:mt-0">
                        <div className="rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)]" style={{ background: '#ffffff', border: '1px solid rgba(37,99,235,0.1)', backdropFilter: 'blur(20px)' }}>
                            <h3 className="font-bold text-xl mb-6 flex items-center gap-3" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                                <span className="p-3 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--neon-blue)' }}>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </span>
                                Office Headquarters
                            </h3>
                            <div className="space-y-4 text-base" style={{ color: 'var(--text-secondary)' }}>
                                <p className="flex items-start gap-4">
                                    <svg className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: 'var(--neon-orange)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="leading-relaxed">
                                        123 Auto Salvage Way<br />
                                        Phoenix, AZ 85001<br />
                                        United States
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)]" style={{ background: '#ffffff', border: '1px solid rgba(234,88,12,0.1)', backdropFilter: 'blur(20px)' }}>
                            <h3 className="font-bold text-xl mb-6 flex items-center gap-3" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                                <span className="p-3 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(234,88,12,0.1)', color: 'var(--neon-orange)' }}>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                Direct Contact
                            </h3>
                            <div className="space-y-4 text-base" style={{ color: 'var(--text-secondary)' }}>
                                <a href="mailto:support@jynm.com" className="flex items-center gap-4 transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--neon-blue)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                                    <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    support@jynm.com
                                </a>
                                <a href="tel:+18005551234" className="flex items-center gap-4 transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--neon-orange)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                                    <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    +1 (800) 555-1234
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="rounded-3xl relative overflow-hidden shadow-2xl" style={{ background: 'rgba(240,245,250,0.8)', border: '1px solid rgba(37,99,235,0.2)', backdropFilter: 'blur(20px)' }}>
                        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right, rgba(37,99,235,0.1), transparent 70%)' }}></div>
                        
                        <h2 className="font-bold text-2xl mb-6 px-8 pt-8 relative z-10" style={{ fontFamily: "'Outfit', sans-serif" }}>Send us a Message</h2>

                        {/* Success Message */}
                        {isSuccess && (
                            <div className="mx-8 mb-6 relative z-10 rounded-xl p-4 animate-fade-in" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 p-1 rounded-full" style={{ background: 'rgba(16,185,129,0.2)' }}>
                                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-emerald-400 mb-1">Message Sent Successfully!</h3>
                                        <p className="text-sm text-emerald-200">
                                            Thank you for your message! We will get back to you shortly.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsSuccess(false)}
                                        className="flex-shrink-0 text-emerald-500 hover:text-emerald-300 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {isError && (
                            <div className="mx-8 mb-6 relative z-10 rounded-xl p-4 animate-fade-in" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 p-1 rounded-full" style={{ background: 'rgba(239,68,68,0.2)' }}>
                                        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-red-400 mb-1">Failed to Send Message</h3>
                                        <p className="text-sm text-red-200">
                                            We couldn't send your message. Please try again later or contact us directly at support@jynm.com
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsError(false)}
                                        className="flex-shrink-0 text-red-500 hover:text-red-300 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10 px-8 pb-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl px-4 py-3 outline-none transition-all placeholder-gray-600"
                                        style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(37,99,235,0.1)', color: 'var(--text-primary)' }}
                                        onFocus={e => e.target.style.borderColor = 'var(--neon-blue)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(37,99,235,0.1)'}
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl px-4 py-3 outline-none transition-all placeholder-gray-600"
                                        style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(37,99,235,0.1)', color: 'var(--text-primary)' }}
                                        onFocus={e => e.target.style.borderColor = 'var(--neon-blue)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(37,99,235,0.1)'}
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl px-4 py-3 outline-none transition-all placeholder-gray-600"
                                    style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(37,99,235,0.1)', color: 'var(--text-primary)' }}
                                    onFocus={e => e.target.style.borderColor = 'var(--neon-blue)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(37,99,235,0.1)'}
                                    placeholder="How can we help?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    className="w-full rounded-xl px-4 py-3 outline-none transition-all placeholder-gray-600 resize-none"
                                    style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(37,99,235,0.1)', color: 'var(--text-primary)' }}
                                    onFocus={e => e.target.style.borderColor = 'var(--neon-blue)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(37,99,235,0.1)'}
                                    placeholder="Tell us more regarding your inquiry..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wide ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                                style={{ background: 'var(--neon-blue)', color: 'var(--bg-base)' }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    'Send Message'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
