import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useCMS } from '../hooks/useCMS';

const HowItWorks = () => {
    const navigate = useNavigate();
    const { get } = useCMS('how_it_works');

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const steps = [
        {
            number: '01',
            title: 'Tell Us What You Need',
            description: 'Fill out our simple form with your vehicle details (make, model, year) and the specific part you\'re looking for. Add your contact information and location.',
            icon: (
                <svg className="w-8 h-8 text-[var(--neon-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            number: '02',
            title: 'We Connect You',
            description: 'Your request is instantly sent to our network of verified junkyards and auto salvage yards in your area. No need to call around - we do the work for you.',
            icon: (
                <svg className="w-8 h-8 text-[var(--neon-orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        },
        {
            number: '03',
            title: 'Receive Quotes Directly',
            description: 'Junkyards with your part in stock will contact you directly with pricing, availability, and shipping options. Compare offers and choose the best deal.',
            icon: (
                <svg className="w-8 h-8 text-[var(--neon-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            number: '04',
            title: 'Get Your Part',
            description: 'Purchase directly from the junkyard of your choice. Arrange pickup or shipping, and get your quality used part at a fraction of the cost of new.',
            icon: (
                <svg className="w-8 h-8 justify-center items-center text-[var(--neon-orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )
        }
    ];

    const benefits = [
        {
            title: 'Save Time',
            description: 'No more calling dozens of junkyards. One form reaches them all.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: 'Save Money',
            description: 'Compare prices from multiple vendors to get the best deal on quality used parts.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: 'Verified Vendors',
            description: 'All junkyards in our network are verified and rated by real customers.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            )
        },
        {
            title: '100% Free',
            description: 'Our service is completely free for buyers. No hidden fees, ever.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
            )
        }
    ];

    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            {/* SEO Meta Tags */}
            <SEO
                title="How It Works - Find Used Auto Parts in 4 Easy Steps"
                description="Learn how to find quality used auto parts through our network of verified junkyards. Simple 4-step process: Tell us what you need, we connect you with vendors, receive quotes, get your part."
            />

            <Navbar />

            {/* Hero Section - Cinematic Depth Car Imagery */}
            <div className="hero-depth pt-24 pb-16 flex flex-col justify-center items-center text-center" style={{ minHeight: '50vh', background: 'var(--bg-base)' }}>
                {/* PRIMARY — car crusher, sparks flying */}
                <div className="hero-bg-primary" style={{ backgroundImage: "url('/heroes/car-crusher.png')", opacity: 0.58 }} />
                {/* DEPTH — salvage yard sunset, blurred */}
                <div className="hero-bg-depth" style={{ backgroundImage: "url('/heroes/salvage-sunset.png')" }} />
                <div className="hero-overlay-base" />
                <div className="hero-vignette" />
                <div className="hero-glow-teal" />
                <div className="hero-glow-orange" />
                <div className="hero-grid" />
                <div className="hero-scanline" />
                <div className="hero-fade-bottom" />

                <div className="hero-content relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 shadow-xl" style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.4)', backdropFilter: 'blur(10px)' }}>
                        <span className="font-bold tracking-wider text-xs uppercase text-blue-300">SIMPLE PROCESS</span>
                        <span className="text-white/30">|</span>
                        <span className="text-sm font-medium text-white/70">Find parts in minutes</span>
                    </div>

                    <h1 className="font-black mb-4 tracking-tight text-white" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontFamily: "'Outfit', sans-serif", textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
                        dangerouslySetInnerHTML={{ __html: get('hero', 'heading', 'How It <span class="text-blue-400">Works</span>') }}
                    />

                    <p className="font-light max-w-2xl mx-auto mb-8 text-lg" style={{ color: 'rgba(255,255,255,0.82)', lineHeight: 1.6 }}>
                        {get('hero', 'subheading', "Finding quality used auto parts has never been easier. We connect you with verified junkyards nationwide — no more endless phone calls or wasted time.")}
                    </p>
                </div>
            </div>

            {/* Steps Grid */}
            <div className="relative pb-20 pt-8 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden lg:block absolute top-[4.5rem] left-[15%] right-[15%] h-[2px] z-0" style={{ background: 'linear-gradient(90deg, rgba(37,99,235,0.1), rgba(37,99,235,0.5), rgba(234,88,12,0.5), rgba(234,88,12,0.1))' }}></div>

                        {steps.map((step, index) => (
                            <div key={index} className="group relative z-10">
                                <div className="rounded-2xl p-6 h-full hover:-translate-y-2 transition-all duration-500 bg-white border border-slate-100" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                                    
                                    {/* Number Circle */}
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 mx-auto relative group-hover:scale-110 transition-transform duration-500" style={{ background: index % 2===0 ? 'rgba(37,99,235,0.08)' : 'rgba(234,88,12,0.08)', border: `1px solid ${index % 2===0 ? 'rgba(37,99,235,0.2)' : 'rgba(234,88,12,0.2)'}` }}>
                                        <span className="font-black text-xl" style={{ color: index % 2===0 ? '#2563eb' : '#ea580c', fontFamily: "'Outfit', sans-serif" }}>{step.number}</span>
                                    </div>

                                    {/* Content */}
                                    <div className="text-center">
                                        <div className="inline-flex p-3 rounded-xl mb-4" style={{ background: index % 2===0 ? 'rgba(37,99,235,0.06)' : 'rgba(234,88,12,0.06)', border: `1px solid ${index % 2===0 ? 'rgba(37,99,235,0.15)' : 'rgba(234,88,12,0.15)'}` }}>
                                            {step.icon}
                                        </div>
                                        <h3 className="font-black mb-3 text-base text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                            {step.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-slate-500">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Benefits Section */}
            <div className="relative py-20" style={{ background: 'var(--bg-surface)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="font-black mb-3 text-3xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Why Use <span style={{ background: 'linear-gradient(135deg, var(--neon-blue), #66e0ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>JYNM</span>?
                        </h2>
                        <p className="max-w-2xl mx-auto text-lg" style={{ color: 'var(--text-secondary)' }}>
                            We make finding used auto parts simple, fast, and affordable.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300" style={{ background: '#f8fafc', border: '1px solid rgba(37,99,235,0.08)' }}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--neon-blue)', border: '1px solid rgba(37,99,235,0.2)' }}>
                                    {benefit.icon}
                                </div>
                                <h3 className="font-bold mb-2 text-lg" style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>{benefit.title}</h3>
                                <p className="leading-relaxed text-sm" style={{ color: 'var(--text-secondary)' }}>{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl relative overflow-hidden text-center shadow-sm p-12" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #1e40af 100%)', border: '1px solid rgba(37,99,235,0.3)' }}>
                        <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', transform: 'translate(-50%,-50%)' }} />
                        <div className="relative z-10">
                            <h2 className="font-black mb-4 text-3xl md:text-4xl text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Ready to Find Your Part?</h2>
                            <p className="mb-8 max-w-2xl mx-auto text-lg text-blue-100">
                                Join thousands of satisfied customers who found their parts through our network of trusted junkyards.
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="font-bold px-8 py-4 rounded-xl shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl uppercase tracking-wide bg-white text-blue-700 hover:bg-blue-50"
                            >
                                Get Started - It's Free →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default HowItWorks;
