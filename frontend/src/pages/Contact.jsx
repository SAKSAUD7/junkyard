import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { api } from '../services/api'
import { useCMS } from '../hooks/useCMS'


export default function Contact() {
    const { get } = useCMS('contact')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
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
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
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
        <div className="bg-[#f8faff] min-h-screen font-inter relative overflow-hidden">
            <SEO
                title={get('meta', 'title', 'Contact Us - Get Help Finding Auto Parts')}
                description={get('meta', 'description', "Contact Junkyards Near Me for support. We're here to help connect you with the right salvage yard.")}
            />

            <Navbar />

            {/* Background Decorations */}
            <div className="absolute top-20 right-[10%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-10 left-[5%] w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-[80px] pointer-events-none" />

            {/* Main Content Area */}
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10 flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                
                {/* Left Side - Text & Icons */}
                <div className="flex-1 w-full lg:max-w-md">
                    <h1 className="text-[44px] font-black text-slate-900 leading-tight mb-4 tracking-tight">
                        Get in Touch
                    </h1>
                    <p className="text-[16px] text-slate-500 font-medium mb-12 max-w-md leading-relaxed">
                        We're here to help you find the right part or answer any questions.
                    </p>

                    <div className="space-y-8">
                        {/* Call */}
                        <div className="flex gap-5 items-start group">
                            <div className="w-12 h-12 bg-blue-100/60 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0 border border-blue-200/50 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-[15px] mb-0.5">Call Us</h3>
                                <p className="text-[#64748b] font-medium text-[14px]">+1 (800) 555-1234</p>
                                <p className="text-[#94a3b8] text-[13px]">Mon - Sun, 8AM - 8PM</p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex gap-5 items-start group">
                            <div className="w-12 h-12 bg-blue-100/60 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0 border border-blue-200/50 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-[15px] mb-0.5">Email Us</h3>
                                <p className="text-[#64748b] font-medium text-[14px]">support@jynm.com</p>
                                <p className="text-[#94a3b8] text-[13px]">We reply within 30 mins</p>
                            </div>
                        </div>

                        {/* Live Chat */}
                        <div className="flex gap-5 items-start group">
                            <div className="w-12 h-12 bg-blue-100/60 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0 border border-blue-200/50 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" /></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-[15px] mb-0.5">Live Chat</h3>
                                <p className="text-[#64748b] font-medium text-[14px]">Available 24/7</p>
                                <p className="text-[#94a3b8] text-[13px]">Get instant help</p>
                            </div>
                        </div>

                        {/* Head Office */}
                        <div className="flex gap-5 items-start group">
                            <div className="w-12 h-12 bg-blue-100/60 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0 border border-blue-200/50 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-[15px] mb-0.5">Head Office</h3>
                                <p className="text-[#64748b] font-medium text-[14px] max-w-[200px]">123 Auto Drive, Dallas, TX 75201</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form Card */}
                <div className="flex-1 w-full max-w-lg">
                    <div className="bg-white rounded-[24px] p-8 md:p-10 shadow-[0_15px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 relative z-10 w-full ml-auto">
                        <h2 className="text-[22px] font-black text-slate-900 mb-8 tracking-tight">
                            Send us a Message
                        </h2>

                        {isSuccess && (
                            <div className="mb-6 bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-bold border border-emerald-100">
                                Message sent successfully! We'll reply soon.
                            </div>
                        )}
                        {isError && (
                            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
                                Error sending message. Please try again.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[12px] font-bold text-slate-600 mb-2">Full Name</label>
                                <input
                                    type="text" name="name" value={formData.name} onChange={handleChange} required
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 placeholder-[#94a3b8] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[14px] font-medium transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-[12px] font-bold text-slate-600 mb-2">Email Address</label>
                                <input
                                    type="email" name="email" value={formData.email} onChange={handleChange} required
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 placeholder-[#94a3b8] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[14px] font-medium transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-[12px] font-bold text-slate-600 mb-2">Phone Number</label>
                                <input
                                    type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 placeholder-[#94a3b8] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[14px] font-medium transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-[12px] font-bold text-slate-600 mb-2">What are you looking for?</label>
                                <select 
                                    name="subject" 
                                    value={formData.subject} 
                                    onChange={handleChange} 
                                    required
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-[#94a3b8] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[14px] font-medium transition-colors appearance-none cursor-pointer"
                                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1.5 1.5L6 6L10.5 1.5\' stroke=\'%2394A3B8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                                >
                                    <option value="" disabled hidden></option>
                                    <option value="part_inquiry" className="text-slate-900">Part Inquiry</option>
                                    <option value="vendor_support" className="text-slate-900">Vendor Support</option>
                                    <option value="general" className="text-slate-900">General Question</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[12px] font-bold text-slate-600 mb-2">Your Message</label>
                                <textarea
                                    name="message" value={formData.message} onChange={handleChange} required rows={4}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 placeholder-[#94a3b8] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[14px] font-medium transition-colors resize-none"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-[#f97316] text-white font-bold rounded-lg px-4 py-3.5 hover:bg-[#ea580c] transition-colors disabled:opacity-50 mt-4 shadow-sm text-[15px]"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
