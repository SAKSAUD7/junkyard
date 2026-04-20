import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { getFAQSchema } from '../utils/structuredData';
import { useCMS } from '../hooks/useCMS';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const { get } = useCMS('faq');

    const categories = [
        {
            name: "General",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            questions: [
                {
                    q: "Is Junkyards Near Me free to use?",
                    a: "Yes! Searching for parts and connecting with vendors is completely free for buyers. We help you find the best deals without any hidden service fees."
                },
                {
                    q: "Do you sell the parts directly?",
                    a: "No, we are a directory and search engine that connects you with independent junkyards and auto salvage yards across the country. You purchase directly from the verified vendor."
                },
                {
                    q: "How do I know the vendors are trusted?",
                    a: "We verify listings and allow users to rate and review their experiences. Look for our 'Top Rated' and 'Premium Partner' badges for our most reliable vendors."
                }
            ]
        },
        {
            name: "Buying Parts",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            questions: [
                {
                    q: "How do I get a quote?",
                    a: "Simply use the search form on our homepage or visit a vendor's profile page. Fill out your vehicle details, and the request is sent directly to the vendor for a rapid response."
                },
                {
                    q: "What payment methods are accepted?",
                    a: "Payment methods vary by vendor. Most accept major credit cards and cash. Always verify the payment terms with the specific junkyard you are buying from."
                },
                {
                    q: "Can I negotiate prices?",
                    a: "Many vendors are open to negotiation, especially for bulk purchases or if you're picking up the part yourself. Don't hesitate to ask!"
                }
            ]
        },
        {
            name: "Shipping & Returns",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
            ),
            questions: [
                {
                    q: "Do vendors ship parts?",
                    a: "Many listed vendors offer shipping, both locally and nationwide. Check the specific vendor's profile details or ask when requesting a quote."
                },
                {
                    q: "What if the part doesn't work?",
                    a: "Return policies are set by individual vendors. We recommend asking about warranties and return periods (typically 30-90 days) before completing your purchase."
                },
                {
                    q: "How long does shipping take?",
                    a: "Shipping times vary by vendor and location. Most domestic shipments arrive within 3-7 business days. Express shipping may be available for urgent needs."
                }
            ]
        }
    ];

    const toggleQuestion = (categoryIdx, questionIdx) => {
        const index = `${categoryIdx}-${questionIdx}`;
        setOpenIndex(openIndex === index ? null : index);
    };

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Flatten all FAQs for schema
    const allFAQs = categories.flatMap(cat =>
        cat.questions.map(q => ({
            question: q.q,
            answer: q.a
        }))
    );

    const schema = getFAQSchema(allFAQs);

    return (
        <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            {/* SEO Meta Tags */}
            <SEO
                title={get('meta', 'title', 'Frequently Asked Questions - Junkyard & Auto Parts Guide')}
                description={get('meta', 'description', 'Common questions about finding used auto parts, junkyard services, shipping, returns, warranties, and more.')}
                schema={schema}
            />

            <Navbar />

            {/* Hero Section - Cinematic Car Depth */}
            <div className="hero-depth pt-24 pb-16 flex flex-col justify-center items-center text-center" style={{ minHeight: '50vh', background: 'var(--bg-base)' }}>
                {/* PRIMARY — CMS-controlled hero image */}
                <div className="hero-bg-primary" style={{ backgroundImage: `url('${get('hero', 'bg_image', '/heroes/salvage-sunset.png')}')`, opacity: 0.6 }} />
                {/* DEPTH — aerial night junkyard, blurred */}
                <div className="hero-bg-depth" style={{ backgroundImage: "url('/heroes/aerial-night.png')" }} />
                <div className="hero-overlay-base" />
                <div className="hero-vignette" />
                <div className="hero-glow-teal" />
                <div className="hero-glow-orange" />
                <div className="hero-grid" />
                <div className="hero-scanline" />
                <div className="hero-fade-bottom" />

                <div className="hero-content relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 shadow-xl" style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.4)', backdropFilter: 'blur(10px)' }}>
                                <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                                <span className="font-bold tracking-wider text-xs uppercase text-blue-300">HELP CENTER</span>
                            </div>

                            <h1 className="font-black mb-4 tracking-tight px-2 text-white" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontFamily: "'Outfit', sans-serif", textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
                                dangerouslySetInnerHTML={{ __html: get('hero', 'heading', 'Frequently Asked <span class="text-blue-400">Questions</span>') }}
                            />
                            <p className="font-light max-w-2xl mb-8 px-2 text-lg" style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
                                {get('hero', 'subheading', 'Everything you need to know about finding and buying used auto parts through our platform.')}
                            </p>
                        </div>

                        {/* 3D GEAR SYSTEM VISUAL */}
                        <div className="hidden lg:flex items-center justify-center relative animate-fade-in-up delay-300">
                            <div className="relative w-full max-w-lg mx-auto pointer-events-none">
                                {/* Ambient glow behind the gears */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500/20 rounded-full blur-[90px]" />
                                <img 
                                    src="/3d/gear-core.png" 
                                    alt="3D Intricate Gear Assembly" 
                                    className="relative w-full h-auto"
                                    style={{ 
                                        mixBlendMode: 'screen', 
                                        animation: 'float 6s ease-in-out infinite',
                                        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.8)) contrast(1.1) brightness(1.1)'
                                    }} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions List */}
            <div className="relative max-w-4xl mx-auto px-4 py-16 z-10">
                <div className="space-y-12">
                    {categories.map((category, categoryIdx) => (
                        <div key={categoryIdx} className="animate-fade-in" style={{ animationDelay: `${categoryIdx * 100}ms` }}>
                            {/* Category Header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--neon-blue)', border: '1px solid rgba(37,99,235,0.2)' }}>
                                    {category.icon}
                                </div>
                                <h2 className="font-bold text-2xl" style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--text-primary)' }}>
                                    {category.name}
                                </h2>
                            </div>

                            {/* Questions Array */}
                            <div className="space-y-4">
                                {category.questions.map((item, questionIdx) => {
                                    const index = `${categoryIdx}-${questionIdx}`;
                                    const isOpen = openIndex === index;

                                    return (
                                        <div
                                            key={questionIdx}
                                            className="group rounded-2xl overflow-hidden transition-all duration-300"
                                            style={{ background: '#ffffff', border: `1px solid ${isOpen ? 'rgba(37,99,235,0.3)' : 'rgba(15,23,42,0.08)'}`, boxShadow: isOpen ? '0 4px 20px rgba(37,99,235,0.08)' : '0 1px 6px rgba(0,0,0,0.04)' }}
                                        >
                                            <button
                                                onClick={() => toggleQuestion(categoryIdx, questionIdx)}
                                                className="w-full flex items-center justify-between text-left p-6 transition-colors"
                                                style={{ background: isOpen ? 'rgba(37,99,235,0.05)' : 'transparent' }}
                                            >
                                                <h3 className="font-bold pr-8 transition-colors text-lg" style={{ color: isOpen ? 'var(--neon-blue)' : 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                                                    {item.q}
                                                </h3>
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} style={{ background: isOpen ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.05)' }}>
                                                    <svg className={`w-5 h-5 transition-colors`} style={{ color: isOpen ? 'var(--neon-blue)' : 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </button>

                                            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                                                <div className="p-6 pt-0 border-t" style={{ borderColor: 'rgba(37,99,235,0.1)' }}>
                                                    <div className="w-12 h-1 rounded-full mb-4 mt-4" style={{ background: 'linear-gradient(90deg, var(--neon-blue), transparent)' }}></div>
                                                    <p className="leading-relaxed text-md" style={{ color: 'var(--text-secondary)' }}>
                                                        {item.a}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Box */}
                    <div className="mt-24 relative overflow-hidden rounded-3xl p-10 text-center shadow-md" style={{ border: '1px solid rgba(37,99,235,0.15)', background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)', backdropFilter: 'blur(20px)' }}>
                    <div className="relative z-10">
                        <div className="inline-flex p-4 rounded-2xl mb-6" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="font-bold mb-3 text-2xl text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>{get('cta', 'heading', 'Still Have Questions?')}</h3>
                        <p className="mb-8 max-w-md mx-auto text-lg" style={{ color: 'var(--text-secondary)' }}>
                            {get('cta', 'subtext', "Can't find the answer you're looking for? Our support team is here to help you 24/7.")}
                        </p>
                        <a
                            href={get('cta', 'button_link', '/contact')}
                            className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 hover:scale-105"
                            style={{ background: 'var(--neon-blue)', color: 'var(--bg-base)' }}>
                            {get('cta', 'button_text', 'Contact Support')}
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default FAQ;
