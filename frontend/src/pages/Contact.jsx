import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { api } from '../services/api'

function FadeInSection({ children, delay = 0, direction = 'up' }) {
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
    const variants = {
        hidden: { opacity: 0, y: direction === 'up' ? 30 : 0 },
        visible: { opacity: 1, y: 0 }
    }
    return (
        <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={variants} transition={{ duration: 0.6, delay }}>
            {children}
        </motion.div>
    )
}

export default function Contact() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
    const [isSuccess, setIsSuccess] = useState(false)
    const [isError, setIsError] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
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
            setIsError(true)
            setTimeout(() => setIsError(false), 8000)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen" style={{ background: '#0a0b0d' }}>
            <SEO
                title="Contact Us - Get Help Finding Auto Parts"
                description="Contact Junkyards Near Me for support. Questions about finding parts, vendor inquiries, or technical support. We're here to help."
                canonical="/contact"
            />
            <Navbar />

            {/* Hero */}
            <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #080909 0%, #0f1117 100%)' }}>
                <div className="absolute inset-0">
                    <img src="/images/static/car-blue-classic.png" alt="" loading="lazy" className="w-full h-full object-cover object-center" style={{ opacity: 0.1 }} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(8,9,9,0.6) 0%, rgba(8,9,9,0.85) 100%)' }} />
                </div>
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/3 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
                    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 mb-6" style={{ background: 'rgba(245,158,11,0.08)' }}>
                            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Get in Touch</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-none mb-6">
                            We'd Love to <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hear from You</span>
                        </h1>
                        <p className="text-white/50 text-base max-w-2xl mx-auto">Have questions about finding a part? Need help using our platform? Our team is here to assist you 24/7.</p>
                    </motion.div>
                </div>
            </section>

            <section className="py-16" style={{ background: '#0a0b0d' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                        {/* Contact Info */}
                        <div className="space-y-6">
                            <FadeInSection delay={0.1}>
                                <div className="rounded-2xl border border-white/[8%] p-8 transition-all hover:border-amber-500/30" style={{ background: '#111318' }}>
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-500">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        </div>
                                        Office Headquarters
                                    </h3>
                                    <div className="flex items-start gap-4 text-white/50 text-sm">
                                        <svg className="w-5 h-5 text-white/30 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <span>123 Auto Salvage Way<br />Phoenix, AZ 85001<br />United States</span>
                                    </div>
                                </div>
                            </FadeInSection>

                            <FadeInSection delay={0.2}>
                                <div className="rounded-2xl border border-white/[8%] p-8 transition-all hover:border-amber-500/30" style={{ background: '#111318' }}>
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-400">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </div>
                                        Direct Contact
                                    </h3>
                                    <div className="space-y-4">
                                        <a href="mailto:info@jynm.com" className="flex items-center gap-4 text-white/50 text-sm hover:text-amber-400 transition-colors">
                                            <svg className="w-5 h-5 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            info@jynm.com
                                        </a>
                                        <a href="tel:1-866-293-3731" className="flex items-center gap-4 text-white/50 text-sm hover:text-amber-400 transition-colors">
                                            <svg className="w-5 h-5 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                            1-866-293-3731
                                        </a>
                                    </div>
                                </div>
                            </FadeInSection>
                        </div>

                        {/* Form */}
                        <FadeInSection delay={0.3}>
                            <div className="rounded-2xl border border-white/[8%] p-8" style={{ background: '#111318' }}>
                                <h2 className="text-2xl font-bold text-white mb-8">Send us a Message</h2>

                                {isSuccess && (
                                    <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 flex gap-3 text-sm">
                                        <div className="text-green-500">✓</div>
                                        <div>
                                            <p className="font-bold text-green-400 pb-1">Message Sent!</p>
                                            <p className="text-green-500/80">Thank you for your message. We will get back to you shortly.</p>
                                        </div>
                                    </div>
                                )}
                                {isError && (
                                    <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex gap-3 text-sm">
                                        <div className="text-red-500">⚠️</div>
                                        <div>
                                            <p className="font-bold text-red-400 pb-1">Failed to Send</p>
                                            <p className="text-red-500/80">Please try again later or email us directly.</p>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Name</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleChange} required
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm" placeholder="Your name" />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Email</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} required
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm" placeholder="your@email.com" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Subject</label>
                                        <input type="text" name="subject" value={formData.subject} onChange={handleChange} required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm" placeholder="How can we help?" />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Message</label>
                                        <textarea name="message" value={formData.message} onChange={handleChange} required rows={4}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm" placeholder="Tell us more regarding your inquiry..." />
                                    </div>
                                    <button type="submit" disabled={isSubmitting}
                                        className={`w-full font-bold text-black py-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/20'}`}
                                        style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
                                        {isSubmitting ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            </div>
                        </FadeInSection>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
