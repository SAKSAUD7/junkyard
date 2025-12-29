import React from 'react'

export default function SponsoredAd() {
    return (
        <div className="max-w-[200px] sm:max-w-[240px] animate-fade-in">
            <div className="bg-black/60 backdrop-blur-sm border border-white/5 rounded-lg overflow-hidden p-3 shadow-lg">

                <div className="space-y-3">
                    {/* Clickable Logo Area */}
                    <a
                        href="https://www.qualityautoparts.com/iweb/index.php"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white/95 rounded p-2 hover:bg-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer group relative"
                        title="Visit Quality Auto Parts"
                    >
                        <img
                            src="/images/qap_logo.png"
                            alt="Quality Auto Parts"
                            className="w-full h-auto object-contain mb-1"
                        />
                        <div className="text-center">
                            <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                                Visit Website <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                            </span>
                        </div>
                    </a>

                    {/* Minimal Content */}
                    <div className="text-center">
                        <p className="text-white/70 text-[10px] mb-2 leading-tight hidden sm:block">
                            Millions of quality used parts.
                        </p>

                        <div className="space-y-1.5">
                            <a
                                href="https://www.qualityautoparts.com/?camp=null&adg=null&source=null&gclid=null"
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
