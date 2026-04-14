import React, { useState, useEffect } from 'react';

const Carousel3D = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
        }, 5000); // 5 second cycle

        return () => clearInterval(timer);
    }, [items.length]);

    const handleNext = () => setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    const handlePrev = () => setCurrentIndex((prevIndex) => (prevIndex === 0 ? items.length - 1 : prevIndex - 1));

    return (
        <div className="relative w-full rounded-2xl overflow-hidden group shadow-2xl" style={{ border: '1px solid rgba(15,23,42,0.1)', background: '#0a0f1c' }}>
            {/* Images */}
            <div className="relative h-[450px] w-full" style={{ isolation: 'isolate' }}>
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                    >
                        {/* Subtle background glow mapping to image colors */}
                        <div className="absolute inset-0 z-0 bg-blue-900/20 blur-3xl mix-blend-screen" />
                        
                        <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover object-center relative z-10 transition-transform duration-[10000ms] ease-linear"
                            style={{
                                transform: index === currentIndex ? 'scale(1.05)' : 'scale(1)',
                            }}
                        />
                        
                        {/* Internal Gradient for Text Readability */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0f172a] to-transparent z-20 pointer-events-none" />
                        
                        {/* Text Content overlaying the image directly */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-30 transition-all duration-700 delay-300 transform" 
                             style={{ opacity: index === currentIndex ? 1 : 0, transform: index === currentIndex ? 'translateY(0)' : 'translateY(20px)' }}>
                            <div className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-bold uppercase tracking-wider text-blue-400" style={{ background: 'rgba(37,99,235,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(37,99,235,0.3)' }}>
                                {item.tag || 'Premium Asset'}
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {item.title}
                            </h3>
                            <p className="max-w-2xl text-slate-300 text-sm md:text-base leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10 text-white hover:bg-blue-600 backdrop-blur-md border border-white/20"
                aria-label="Previous image"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10 text-white hover:bg-blue-600 backdrop-blur-md border border-white/20"
                aria-label="Next image"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>

            {/* Indicator Dots */}
            <div className="absolute bottom-6 right-8 z-40 flex gap-2">
                {items.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`transition-all duration-300 rounded-full h-1.5 ${
                            index === currentIndex ? 'w-6 bg-blue-500 shadow-[0_0_8px_theme(colors.blue.500)]' : 'w-1.5 bg-slate-500/50 hover:bg-slate-400'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Carousel3D;
