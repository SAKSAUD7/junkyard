import React from 'react';
import { Link } from 'react-router-dom';

export default function VendorCTASection() {
    return (
        <div className="bg-[#0c1424] rounded-3xl p-5 md:p-6 border border-slate-800 shadow-[0_4px_25px_rgb(0,0,0,0.12)] h-full flex flex-col justify-between overflow-hidden relative">
            {/* Background glow */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/5 self-start mb-3 relative z-10 w-max">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.9)]"></span>
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Vendor Network Hub</span>
                </div>

                {/* Heading */}
                <h2 className="text-xl md:text-2xl font-black text-white leading-tight mb-2 relative z-10 font-['Outfit'] tracking-tight">
                    Transform Your Salvage <br />
                    <span className="text-orange-500">Business Today</span>
                </h2>

                {/* Body */}
                <p className="text-slate-400 text-[12px] md:text-[13px] font-medium leading-relaxed relative z-10">
                    Partner with <span className="text-white font-bold">JYNM</span> to dominate your local market, digitize your inventory, and receive high-converting leads on autopilot.
                </p>
            </div>

            {/* Engine Image - Smaller for tight layout */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-1 md:my-2 min-h-[80px]">
                <img 
                    src="/heroes/engine-glow-dark.png" 
                    alt="High performance engine" 
                    className="w-full h-[90px] md:h-[110px] object-contain mix-blend-screen filter drop-shadow-[0_0_20px_rgba(249,115,22,0.15)]"
                />
            </div>

            {/* Buttons */}
            <div className="flex flex-col xl:flex-row gap-2 relative z-10">
                <Link 
                    to="/add-a-yard"
                    className="inline-flex items-center justify-center bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-2 rounded-xl transition-all text-[12px] shadow-[0_4px_16px_rgba(234,88,12,0.3)] hover:-translate-y-0.5 flex-1 text-center"
                >
                    Add Junkyard
                </Link>
                <Link 
                    to="/vendor/login"
                    className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold px-4 py-2 rounded-xl transition-all text-[12px] hover:-translate-y-0.5 flex-1 text-center"
                >
                    Login
                </Link>
            </div>
        </div>
    );
}
