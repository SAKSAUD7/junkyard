import React from 'react'

export default function SponsoredAd() {
    return (
        <div className="absolute top-4 left-4 z-30 max-w-[200px] sm:max-w-[240px] animate-fade-in">
            <div className="bg-black/60 backdrop-blur-sm border border-white/5 rounded-lg overflow-hidden p-3 shadow-lg">

                <div className="space-y-3">
                    {/* Clickable Logo Area */}
                    <a
                        href="https://www.qualityautoparts.com/iweb/index.php"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white/95 rounded p-2 hover:bg-white transition-colors"
                    >
                        <img
                            src="/images/qap_logo.png"
                            alt="Quality Auto Parts"
                            className="w-full h-auto object-contain"
                        />
                    </a>

                    {/* Minimal Content */}
                    <div className="text-center">
                        <p className="text-white/70 text-[10px] mb-2 leading-tight hidden sm:block">
                            Millions of quality used parts.
                        </p>

                        <div className="space-y-1.5">
                            <a
                                href="https://www.qualityautoparts.com/iweb/index.php"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold py-1.5 rounded transition-colors uppercase tracking-wide"
                            >
                                Order: 1-866-293-3731
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
