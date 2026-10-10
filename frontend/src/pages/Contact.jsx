import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { api } from '../services/api'
import JYNMSelect from '../components/JYNMSelect'
import PageHero from '../components/PageHero'

// Floating animated orb background
function Orb({ className }) {
    return (
        <div className={`absolute rounded-full blur-[100px] pointer-events-none mix-blend-multiply opacity-50 ${className}`} />
    )
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
        value: 'contact@junkyardsnearme.com',
        sub: 'Typical response: 15 mins',
        href: 'mailto:contact@junkyardsnearme.com',
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
            
            // Auto-reset form after 5 seconds
            setTimeout(() => {
                setStatus('idle')
                setForm({ name: '', email: '', phone: '', message: '' })
                setActiveTopic('')
            }, 5000)
            
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



            {/* ─── NEW PAGE HERO ─── */}
            <PageHero
                page="contact"
                tag="24/7 Nationwide Support"
                title="How can we"
                titleAccent="help you?"
                subtitle="Whether you're looking for a rare auto part, need help with your vendor account, or want to partner with us, our USA-based team is ready to assist."
                backgroundImage="https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?auto=format&fit=crop&q=80&w=1920"
                height="large"
            />

            {/* ─── SPLIT LAYOUT FORM & INFO CARDS (OVERLAPPING HERO) ─── */}
            <div className="relative bg-slate-50 pb-24">
                
                {/* Premium Background Elements */}
                <Orb className="top-0 left-0 w-[600px] h-[600px] bg-blue-200/40 -translate-x-1/2 -translate-y-1/4 animate-pulse duration-10000" />
                <Orb className="bottom-0 right-0 w-[500px] h-[500px] bg-indigo-200/40 translate-x-1/4 translate-y-1/4" />
                
                <section className="relative z-20 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 -mt-24 grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-24 items-start">
                    
                    {/* LEFT COLUMN - PREMIUM INFO BOARDS */}
                    <div className="order-2 lg:order-1 flex flex-col space-y-6 pt-4 lg:pt-0">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            {/* Contact Items Re-imagined */}
                            <div className="p-6 bg-white rounded-3xl border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mb-5 shadow-lg shadow-blue-500/30">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                </div>
                                <h4 className="text-[16px] font-black text-slate-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Call Us Directly</h4>
                                <a href="tel:18662933731" className="text-blue-600 font-bold text-[15px] hover:underline">1-866-293-3731</a>
                                <p className="text-slate-400 text-[12px] font-medium mt-0.5">Mon–Sat: 9AM – 7PM EST</p>
                            </div>

                            <div className="p-6 bg-white rounded-3xl border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white mb-5 shadow-lg shadow-emerald-500/30">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <h4 className="text-[16px] font-black text-slate-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Email Support</h4>
                                <a href="mailto:contact@junkyardsnearme.com" className="text-emerald-600 font-bold text-[14px] hover:underline break-all overflow-wrap-anywhere leading-snug block">contact@junkyardsnearme.com</a>
                                <p className="text-slate-400 text-[12px] font-medium mt-0.5">Typical response under 2 hours</p>
                            </div>
                        </div>

                        {/* Head Office Inline */}
                        <div className="flex items-center gap-4 px-6 py-5 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-900/10">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div>
                                <h4 className="text-[13px] font-black uppercase text-slate-400 tracking-wider mb-0.5">Corporate HQ</h4>
                                <p className="text-[15px] font-bold">Nationwide Operations, USA</p>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="mt-6 flex items-center gap-3">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Follow Us</span>
                            <div className="flex items-center gap-2">
                                {/* Facebook */}
                                <a href="https://www.facebook.com/JunkYardsNearMe" target="_blank" rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                                    aria-label="Facebook">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </a>
                                {/* Twitter / X */}
                                <a href="https://x.com/junkyardsnearme" target="_blank" rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"
                                    aria-label="X (Twitter)">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                </a>
                                {/* Pinterest */}
                                <a href="https://www.pinterest.com/junkyardsnearme" target="_blank" rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm"
                                    aria-label="Pinterest">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
                                </a>
                                {/* WhatsApp */}
                                <a href="https://wa.me/18662933731?text=Hi!%20I%20need%20help%20with%20an%20auto%20part." target="_blank" rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all shadow-sm"
                                    aria-label="WhatsApp">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.487"/></svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - PREMIUM FORM */}
                    <div className="order-1 lg:order-2 w-full lg:max-w-[540px] ml-auto relative">
                        {/* Decorative glow behind form */}
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-[32px] transform rotate-1 scale-[1.02] opacity-20 blur-xl"></div>
                        
                        <div className="bg-white rounded-[32px] shadow-[0_20px_60px_rgb(0,0,0,0.08)] border border-slate-100 p-8 sm:p-10 relative overflow-hidden backdrop-blur-3xl z-10">
                            {status === 'success' ? (
                                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center animate-fade-in">
                                    <div className="mb-6 flex justify-center">
                                        <div className="w-16 h-16 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center p-2">
                                            <img src="/logo.png" alt="JYNM Logo" className="w-full h-full object-contain" onError={e => { e.target.style.display = 'none'; }} />
                                        </div>
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2b5aeb] to-[#4b76f2] flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        Message Received
                                    </h3>
                                    <p className="text-slate-500 font-medium max-w-sm mb-8">
                                        Thanks for reaching out! We've got your message and our team will get back to you shortly.
                                    </p>
                                    <button onClick={() => setStatus('idle')}
                                        className="px-8 py-3 bg-[#2b5aeb] hover:bg-[#1a44c9] text-white font-black rounded-2xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5">
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-8">
                                        <h3 className="text-[28px] font-black text-slate-900 mb-2 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                            Send a Message
                                        </h3>
                                        <p className="text-[14px] text-slate-500 font-medium">
                                            Fill out the form below and we'll be in touch ASAP.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {/* Glowing Focus Inputs */}
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
                                                <JYNMSelect
                                                    label="What are you looking for?"
                                                    placeholder="Select a topic..."
                                                    options={topics.map(t => t.label)}
                                                    value={activeTopic}
                                                    onChange={setActiveTopic}
                                                    required
                                                />
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

                                        <div className="mt-2 pt-2">
                                            <button
                                                type="submit"
                                                disabled={status === 'loading'}
                                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-[15px] rounded-xl shadow-[0_8px_20px_rgba(79,70,229,0.25)] hover:shadow-[0_12px_28px_rgba(79,70,229,0.35)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                                            >
                                                {status === 'loading' ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                        Sending...
                                                    </span>
                                                ) : 'Send Message'}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    )
}
