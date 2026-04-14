import { useState, useEffect, useCallback } from 'react';

const slides = [
    {
        img: '/images/static/car-blue-classic.png',
        accent: 'Classic American Power',
        tagline: 'Muscle Cars & Classic Parts',
        overlay: 'linear-gradient(to bottom, rgba(10,11,13,0.35) 0%, rgba(10,11,13,0.55) 50%, rgba(10,11,13,1) 100%)',
    },
    {
        img: '/images/static/car-interior-dashboard.png',
        accent: 'Premium Luxury Selection',
        tagline: 'Euro & Luxury Auto Parts',
        overlay: 'linear-gradient(to bottom, rgba(10,11,13,0.4) 0%, rgba(10,11,13,0.6) 50%, rgba(10,11,13,1) 100%)',
    },
    {
        img: '/images/static/dashboard-speedometer.jpg',
        accent: 'Performance & Speed',
        tagline: 'OEM Quality Components',
        overlay: 'linear-gradient(to bottom, rgba(10,11,13,0.3) 0%, rgba(10,11,13,0.55) 50%, rgba(10,11,13,1) 100%)',
    },
    {
        img: '/images/static/hero-garage.jpg',
        accent: 'Trusted Infrastructure',
        tagline: 'Verified Salvage Partners',
        overlay: 'linear-gradient(to bottom, rgba(10,11,13,0.35) 0%, rgba(10,11,13,0.55) 50%, rgba(10,11,13,1) 100%)',
    }
];

const AUTOPLAY_INTERVAL = 4500;

export default function HeroCarousel() {
    const [active, setActive] = useState(0);
    const [fading, setFading] = useState(false);

    const goTo = useCallback((idx) => {
        if (idx === active) return;
        setFading(true);
        setTimeout(() => {
            setActive(idx);
            setFading(false);
        }, 350);
    }, [active]);

    const next = useCallback(() => goTo((active + 1) % slides.length), [active, goTo]);
    const prev = useCallback(() => goTo((active - 1 + slides.length) % slides.length), [active, goTo]);

    useEffect(() => {
        const timer = setInterval(next, AUTOPLAY_INTERVAL);
        return () => clearInterval(timer);
    }, [next]);

    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Images — only active one visible */}
            {slides.map((slide, i) => (
                <div
                    key={i}
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{ opacity: i === active && !fading ? 1 : 0 }}
                >
                    <img
                        src={slide.img}
                        alt={slide.accent}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        className="w-full h-full object-cover object-center"
                        style={{ opacity: 0.42 }}
                    />
                    <div className="absolute inset-0" style={{ background: slide.overlay }} />
                </div>
            ))}



            {/* Navigation Arrows */}
            <button
                onClick={prev}
                aria-label="Previous slide"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
            >
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={next}
                aria-label="Next slide"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
            >
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Navigation Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        aria-label={`Slide ${i + 1}`}
                        className="transition-all duration-300 rounded-full focus:outline-none"
                        style={{
                            width: i === active ? '24px' : '8px',
                            height: '8px',
                            background: i === active ? '#f59e0b' : 'rgba(255,255,255,0.25)',
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
