import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { api } from '../services/api'

// Floating animated orb background
function Orb({ className }) {
    return <div className={`absolute rounded-full blur-[100px] pointer-events-none ${className}`} />
}

const infoCards = [
    {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
        ),
        label: 'Call Us',
        value: '1-866-293-3731',
        sub: 'Mon–Fri: 9AM – 6PM EST',
        href: 'tel:18662933731',
        gradient: 'from-blue-500 to-cyan-500',
        glow: 'shadow-blue-200',
    },
    {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        label: 'Email Us',
        value: 'info@jynm.com',
        sub: 'Typical response: 15 mins',
        href: 'mailto:info@jynm.com',
        gradient: 'from-violet-500 to-purple-600',
        glow: 'shadow-purple-200',
    },
    {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        label: 'Coverage',
        value: 'Nationwide',
        sub: 'All 50 States',
        href: null,
        gradient: 'from-emerald-500 to-teal-500',
        glow: 'shadow-emerald-200',
    },
    {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        label: 'Response Time',
        value: '< 2 Hours',
        sub: '24/7 Support Team',
        href: null,
        gradient: 'from-orange-500 to-rose-500',
        glow: 'shadow-orange-200',
    },
]

const topics = [
    { id: 'billing', icon: '💳', label: 'Billing & Payments' },
    { id: 'vendor_support', icon: '🏪', label: 'Vendor Support' },
    { id: 'parts_orders', icon: '🔧', label: 'Parts & Orders' },
    { id: 'technical', icon: '🖥️', label: 'Technical Help' },
    { id: 'feedback', icon: '💬', label: 'Feedback' },
    { id: 'other', icon: '✦', label: 'Other' },
]

const stats = [
    { value: '50+', label: 'States Covered' },
    { value: '<2h', label: 'Avg Response' },
    { value: '10K+', label: 'Happy Customers' },
    { value: '99.9%', label: 'Uptime' },
]

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
    const [activeTopic, setActiveTopic] = useState('')
    const [status, setStatus] = useState('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const [focused, setFocused] = useState('')

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('loading')
        setErrorMsg('')
        try {
            await api.submitContact({ ...form, subject: activeTopic || form.subject })
            setStatus('success')
            setForm({ name: '', email: '', subject: '', message: '' })
            setActiveTopic('')
        } catch (err) {
            setStatus('error')
            setErrorMsg(err?.response?.data?.detail || 'Something went wrong. Please try again.')
        }
    }

    const inputClass = (name) =>
        `w-full px-4 py-3.5 rounded-xl text-[14px] font-medium text-slate-900 placeholder-slate-400 outline-none transition-all border-2 bg-white ${
            focused === name
                ? 'border-blue-500 ring-4 ring-blue-100 shadow-sm'
                : 'border-slate-100 hover:border-slate-200'
        }`

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            <SEO
                title="Contact Us — JYNM | Junkyards Near Me"
                description="Get in touch with the JYNM team. Whether you're a buyer looking for parts or a yard owner wanting to list your business, we're here to help."
            />
            <Navbar />

            {/* Clean Hero Section */}
            <section className="relative pt-28 pb-14 bg-white border-b border-slate-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] opacity-60 pointer-events-none translate-x-1/3 -translate-y-1/4" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-50 rounded-full blur-[80px] opacity-40 pointer-events-none -translate-x-1/3 translate-y-1/4" />

                <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 bg-blue-50 border border-blue-100 animate-fade-in-up">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-blue-600 text-[12px] font-bold uppercase tracking-widest">We're Here to Help</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight animate-fade-in-up" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em', lineHeight: 1.05 }}>
                            Get In <span className="text-blue-600">Touch</span>
                        </h1>
                        <p className="text-[17px] md:text-[20px] text-slate-500 font-medium max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-100">
                            Whether you're a buyer hunting parts or a yard owner ready to grow — our team responds fast.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 animate-fade-in-up delay-200">
                        {stats.map((stat, index) => (
                            <div key={index} className="p-8 rounded-2xl text-center bg-white border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.08)] hover:-translate-y-1 hover:border-blue-200 transition-all duration-300">
                                <div className="text-4xl md:text-5xl font-black mb-2 text-slate-900" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                                    {stat.value}
                                </div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── INFO CARDS ─── */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-12 relative z-10 mb-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {infoCards.map(card => (
                        card.href ? (
                            <a key={card.label} href={card.href}
                                className={`group bg-white rounded-2xl p-5 shadow-lg ${card.glow} shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100`}>
                                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                                    {card.icon}
                                </div>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                                <p className="text-[15px] font-black text-slate-900 mb-0.5 group-hover:text-blue-600 transition-colors">{card.value}</p>
                                <p className="text-[12px] text-slate-400 font-medium">{card.sub}</p>
                            </a>
                        ) : (
                            <div key={card.label}
                                className={`bg-white rounded-2xl p-5 shadow-lg ${card.glow} shadow-md border border-slate-100`}>
                                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white mb-4 shadow-sm`}>
                                    {card.icon}
                                </div>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                                <p className="text-[15px] font-black text-slate-900 mb-0.5">{card.value}</p>
                                <p className="text-[12px] text-slate-400 font-medium">{card.sub}</p>
                            </div>
                        )
                    ))}
                </div>
            </section>

            {/* ─── MAIN CONTACT FORM ─── */}
            <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-24">
                <div className="bg-white rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-100">
                    <div className="p-8 md:p-10">
                            {status === 'success' ? (
                                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center animate-fade-in">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
                                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        Message Sent! 🎉
                                    </h3>
                                    <p className="text-slate-500 font-medium max-w-sm mb-8">
                                        Thank you for reaching out. Our team will get back to you within 2 business hours.
                                    </p>
                                    <button onClick={() => setStatus('idle')}
                                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5">
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-black text-slate-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                            Send a Message
                                        </h3>
                                        <p className="text-slate-400 text-[14px] font-medium">
                                            Fill in the details below and we'll get back to you fast.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name *</label>
                                                <input
                                                    name="name"
                                                    value={form.name}
                                                    onChange={handleChange}
                                                    onFocus={() => setFocused('name')}
                                                    onBlur={() => setFocused('')}
                                                    required
                                                    placeholder="Your name"
                                                    className={inputClass('name')}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address *</label>
                                                <input
                                                    name="email"
                                                    type="email"
                                                    value={form.email}
                                                    onChange={handleChange}
                                                    onFocus={() => setFocused('email')}
                                                    onBlur={() => setFocused('')}
                                                    required
                                                    placeholder="you@example.com"
                                                    className={inputClass('email')}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Topic *</label>
                                                <select
                                                    value={activeTopic}
                                                    onChange={(e) => setActiveTopic(e.target.value)}
                                                    onFocus={() => setFocused('topic')}
                                                    onBlur={() => setFocused('')}
                                                    required
                                                    className={inputClass('topic')}
                                                >
                                                    <option value="" disabled>Select a topic</option>
                                                    {topics.map(t => (
                                                        <option key={t.id} value={t.id}>{t.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject *</label>
                                                <input
                                                    name="subject"
                                                    value={form.subject}
                                                    onChange={handleChange}
                                                    onFocus={() => setFocused('subject')}
                                                    onBlur={() => setFocused('')}
                                                    required
                                                    placeholder="Briefly describe your issue"
                                                    className={inputClass('subject')}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Message *</label>
                                            <textarea
                                                name="message"
                                                value={form.message}
                                                onChange={handleChange}
                                                onFocus={() => setFocused('message')}
                                                onBlur={() => setFocused('')}
                                                required
                                                rows={5}
                                                placeholder="How can we help you?"
                                                className={inputClass('message') + ' resize-none'}
                                            />
                                        </div>

                                        {status === 'error' && (
                                            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-red-600 text-[13px] font-semibold">{errorMsg}</p>
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={status === 'loading'}
                                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-[15px] rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                                            {status === 'loading' ? (
                                                <>
                                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Sending your message…
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                    </svg>
                                                    Send Message
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
