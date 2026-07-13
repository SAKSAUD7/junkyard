import React from 'react';
import { Link } from 'react-router-dom';

export default function CTABanner({ get }) {
    return (
        <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #1e40af 100%)' }}>
            <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 items-stretch">
                {/* Left — text content */}
                <div className="relative py-20 md:py-24 px-8 md:px-16 flex flex-col justify-center" style={{ zIndex: 1 }}>
                    <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', transform: 'translate(-50%,-50%)' }} />
                    <h2
                        style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#ffffff', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1rem' }}
                        dangerouslySetInnerHTML={{ __html: get('cta_banner', 'heading', 'Ready to Find Your <span style="background: linear-gradient(135deg, #93c5fd, #bfdbfe); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Perfect Part?</span>') }}
                    />
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '460px', marginBottom: '2rem' }}>
                        {get('cta_banner', 'subheading', 'Join thousands of mechanics and car owners who save hundreds by using JYNM to source quality used auto parts across all 50 states.')}
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                        <Link to="/quote" id="cta-get-quote-btn" className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold bg-white text-blue-600 transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/10">
                            {get('cta_banner', 'button_text', 'Get Free Quote Now')}
                        </Link>
                        <Link to="/junkyards" id="cta-browse-btn" className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-white transition-all duration-300 hover:bg-white/10 border border-white/20">
                            Browse All Vendors
                        </Link>
                    </div>
                    {/* Trust row */}
                    <div className="flex flex-wrap gap-6 mt-10 text-white/60 text-sm font-semibold">
                        <span>{get('cta_banner', 'trust_1', '✓ 6,500+ Trusted Yards')}</span>
                        <span>{get('cta_banner', 'trust_2', '✓ 50 States')}</span>
                        <span>{get('cta_banner', 'trust_3', '✓ Free to Use')}</span>
                    </div>
                </div>
                {/* Right — image */}
                <div className="hidden lg:block relative min-h-[380px]">
                    <img
                        src="/heroes/junkyard-aerial.png"
                        alt="Aerial view of a large auto salvage junkyard"
                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent" />
                    <div className="absolute bottom-8 left-8 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                        <p className="text-white font-black text-2xl">1M+</p>
                        <p className="text-white/80 text-sm font-medium">Searches completed on JYNM</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
