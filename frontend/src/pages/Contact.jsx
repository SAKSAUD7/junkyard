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
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
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
            await api.submitContact({ ...form, phone: form.phone, subject: activeTopic })
            setStatus('success')
            setForm({ name: '', email: '', phone: '', message: '' })
            setActiveTopic('')
        } catch (err) {
            setStatus('error')
            setErrorMsg(err?.response?.data?.detail || 'Something went wrong. Please try again.')
        }
    }

    const inputClass = (name) =>
        `w-full px-4 py-3 rounded-xl text-[14px] font-medium text-slate-900 placeholder-slate-400 outline-none transition-all border bg-white ${
            focused === name
                ? 'border-blue-500 ring-3 ring-blue-100 shadow-sm'
                : 'border-slate-200 hover:border-slate-300'
        }`

    return (
        <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', sans-serif" }}>
            <SEO
                title="Contact Us — JYNM | Junkyards Near Me"
                description="Get in touch with the JYNM team. Whether you're a buyer looking for parts or a yard owner wanting to list your business, we're here to help."
            />
            <Navbar />



            {/* ─── MAIN SPLIT LAYOUT ─── */}
            <section className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-16 pb-24 grid lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-20 items-start">
                 {/* LEFT COLUMN - TEXT & INFO */}
                 <div className="order-2 lg:order-1 mt-4 lg:mt-8">
                     <h2 className="text-4xl md:text-[42px] font-black text-slate-900 mb-4" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0em' }}>
                         We'd <span className="text-[#101b4d]">Love to</span>
                     </h2>
                     <p className="text-[16px] text-slate-500 mb-12 leading-relaxed max-w-md">
                         Have questions about finding a part? Need help using our platform? Our team is here to assist you 24/7.
                     </p>

                     <div className="space-y-8">
                         {/* Contact Items */}
                         <div className="flex gap-4">
                             <div className="w-11 h-11 rounded-full bg-[#ecf2ff] flex items-center justify-center flex-shrink-0 text-[#2b5aeb]">
                                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                             </div>
                             <div>
                                 <h4 className="text-[14px] font-bold text-slate-900">Call Us</h4>
                                 <p className="text-slate-500 text-[14px] mt-0.5">+1 (800) 555-1234</p>
                                 <p className="text-slate-400 text-[12px]">Mon - Sun, 8AM - 8PM</p>
                             </div>
                         </div>
                         {/* Email Us */}
                         <div className="flex gap-4">
                             <div className="w-11 h-11 rounded-full bg-[#ecf2ff] flex items-center justify-center flex-shrink-0 text-[#2b5aeb]">
                                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                             </div>
                             <div>
                                 <h4 className="text-[14px] font-bold text-slate-900">Email Us</h4>
                                 <p className="text-slate-500 text-[14px] mt-0.5">support@jynm.com</p>
                                 <p className="text-slate-400 text-[12px]">We reply within 30 mins</p>
                             </div>
                         </div>

                         {/* Head Office */}
                         <div className="flex gap-4">
                             <div className="w-11 h-11 rounded-full bg-[#ecf2ff] flex items-center justify-center flex-shrink-0 text-[#2b5aeb]">
                                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                             </div>
                             <div>
                                 <h4 className="text-[14px] font-bold text-slate-900">Head Office</h4>
                                 <p className="text-slate-500 text-[14px] mt-0.5 leading-relaxed">
                                     123 Auto Salvage Way,<br/>
                                     Phoenix, AZ 85001, United States
                                 </p>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* RIGHT COLUMN - FORM */}
                 <div className="order-1 lg:order-2 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 md:p-10 relative overflow-hidden">
                            {status === 'success' ? (
                                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center animate-fade-in">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2b5aeb] to-[#4b76f2] flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
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
                                        className="px-8 py-3 bg-[#2b5aeb] hover:bg-[#1a44c9] text-white font-black rounded-2xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5">
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-8">
                                        <h3 className="text-[26px] font-black text-[#101b4d] mb-1" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                                            Send us a Message
                                        </h3>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Full Name</label>
                                                <input
                                                    name="name"
                                                    value={form.name}
                                                    onChange={handleChange}
                                                    onFocus={() => setFocused('name')}
                                                    onBlur={() => setFocused('')}
                                                    required
                                                    className={inputClass('name')}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Email Address</label>
                                                <input
                                                    name="email"
                                                    type="email"
                                                    value={form.email}
                                                    onChange={handleChange}
                                                    onFocus={() => setFocused('email')}
                                                    onBlur={() => setFocused('')}
                                                    required
                                                    className={inputClass('email')}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Phone Number</label>
                                                <input
                                                    name="phone"
                                                    type="tel"
                                                    value={form.phone}
                                                    onChange={handleChange}
                                                    onFocus={() => setFocused('phone')}
                                                    onBlur={() => setFocused('')}
                                                    className={inputClass('phone')}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">What are you looking for?</label>
                                                <select
                                                    value={activeTopic}
                                                    onChange={(e) => setActiveTopic(e.target.value)}
                                                    onFocus={() => setFocused('topic')}
                                                    onBlur={() => setFocused('')}
                                                    required
                                                    className={inputClass('topic')}
                                                >
                                                    <option value="" disabled></option>
                                                    {topics.map(t => (
                                                        <option key={t.id} value={t.label}>{t.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Your Message</label>
                                            <textarea
                                                name="message"
                                                value={form.message}
                                                onChange={handleChange}
                                                onFocus={() => setFocused('message')}
                                                onBlur={() => setFocused('')}
                                                required
                                                rows={4}
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
                                            className="mt-2 w-full py-3.5 bg-[#2b5aeb] hover:bg-[#1a44c9] text-white font-bold text-[15px] rounded-2xl shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                                            {status === 'loading' ? 'Sending...' : 'Send Message'}
                                        </button>
                                    </form>
                                </>
                            )}
                 </div>
            </section>

            <Footer />
        </div>
    )
}
