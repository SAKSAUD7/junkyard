import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
    { name: 'James R.', location: 'Houston, TX', role: 'Auto Mechanic', img: '/images/uploads/client_image_1.png', rating: 5, text: 'Found a perfect OEM transmission for my F-150 in under 10 minutes. The search tool is incredible and the junkyard responded same day!' },
    { name: 'Maria G.', location: 'Los Angeles, CA', role: 'Car Enthusiast', img: '/images/uploads/client_image_2.png', rating: 5, text: 'I saved over $800 on a replacement engine block. JYNM connected me with a verified yard that had exactly what I needed.' },
    { name: 'Derek T.', location: 'Chicago, IL', role: 'Fleet Manager', img: '/images/uploads/client_image_3.png', rating: 5, text: 'We manage 40+ vehicles and JYNM is our go-to for parts sourcing. Huge network and great pricing compared to dealers.' },
    { name: 'Priya S.', location: 'Phoenix, AZ', role: 'DIY Restorer', img: '/images/uploads/client_image_4.png', rating: 5, text: 'Restoring a 1972 Chevelle and I found a matching dashboard through JYNM. The vintage parts selection is unmatched.' },
    { name: 'Carlos M.', location: 'Miami, FL', role: 'Shop Owner', img: '/images/uploads/client_image_5.png', rating: 5, text: 'As a shop owner I deal with parts daily. JYNM cuts my sourcing time in half. The quality of vendors is consistently excellent.' },
    { name: 'Sandra L.', location: 'Dallas, TX', role: 'Truck Owner', img: '/images/uploads/client_image_6.png', rating: 5, text: 'Needed a rear bumper for my Ram 1500 at 8pm — found three options within 20 miles by morning. Unbelievable speed!' },
    { name: 'Kevin P.', location: 'Atlanta, GA', role: 'Body Shop Tech', img: '/images/uploads/client_image_7.png', rating: 5, text: 'The verified junkyard ratings give me confidence. I\'ve never received a wrong or damaged part through a JYNM referral.' },
    { name: 'Aisha B.', location: 'Detroit, MI', role: 'Auto Student', img: '/images/uploads/client_image_8.png', rating: 5, text: 'Learning auto repair and JYNM makes affordable parts accessible. Great for people starting out in the industry!' },
];

const AUTOPLAY_MS = 5000;
const VISIBLE = 3; // cards visible at once (desktop)

function StarRating({ count }) {
    return (
        <div className="flex gap-0.5 mb-3">
            {Array.from({ length: count }).map((_, i) => (
                <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

export default function TestimonialsCarousel() {
    const [startIdx, setStartIdx] = useState(0);
    const [direction, setDirection] = useState(1);

    const count = testimonials.length;

    const next = useCallback(() => {
        setDirection(1);
        setStartIdx(i => (i + 1) % count);
    }, [count]);

    const prev = useCallback(() => {
        setDirection(-1);
        setStartIdx(i => (i - 1 + count) % count);
    }, [count]);

    useEffect(() => {
        const t = setInterval(next, AUTOPLAY_MS);
        return () => clearInterval(t);
    }, [next]);

    // Get 3 visible cards (wrap around)
    const visibleCards = Array.from({ length: VISIBLE }, (_, i) => testimonials[(startIdx + i) % count]);

    return (
        <section className="py-20 relative overflow-hidden" style={{ background: '#111827' }}>
            {/* Subtle background */}
            <div className="absolute inset-0 pointer-events-none">
                <img src="/images/static/car-interior-dashboard.png" alt="" className="w-full h-full object-cover opacity-[0.06]" loading="lazy" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #111827 0%, rgba(17,24,39,0.85) 50%, #111827 100%)' }} />
                <div className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full opacity-8 blur-[100px]" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">What Our Users Say</p>
                    <h2 className="text-3xl md:text-4xl font-black text-white">
                        Trusted by <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Thousands</span>
                    </h2>
                    <p className="text-white/40 text-sm mt-2 max-w-xl mx-auto">Real customers, real savings, real parts — across all 55+ states.</p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {visibleCards.map((t, i) => (
                        <AnimatePresence key={`${startIdx}-${i}`} mode="wait">
                            <motion.div
                                initial={{ opacity: 0, x: direction * 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -direction * 40 }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                className="rounded-2xl border border-white/[10%] p-6 flex flex-col relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300"
                                style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}
                            >
                                {/* Quote icon */}
                                <svg className="w-8 h-8 text-amber-400/20 mb-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                </svg>
                                <StarRating count={t.rating} />
                                <p className="text-white/70 text-sm leading-relaxed flex-1 mb-5">{t.text}</p>
                                <div className="flex items-center gap-3 mt-auto border-t border-white/[8%] pt-4">
                                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-amber-500/30">
                                        <img src={t.img} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">{t.name}</p>
                                        <p className="text-white/40 text-xs">{t.role} · {t.location}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button onClick={prev} aria-label="Previous"
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 focus:outline-none"
                        style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
                        <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex gap-1.5">
                        {testimonials.map((_, i) => (
                            <button key={i} onClick={() => { setDirection(i > startIdx ? 1 : -1); setStartIdx(i); }} aria-label={`Testimonial ${i + 1}`}
                                className="rounded-full transition-all duration-300 focus:outline-none"
                                style={{ width: i === startIdx ? '20px' : '6px', height: '6px', background: i === startIdx ? '#f59e0b' : 'rgba(255,255,255,0.2)' }}
                            />
                        ))}
                    </div>
                    <button onClick={next} aria-label="Next"
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 focus:outline-none"
                        style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
                        <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
}
