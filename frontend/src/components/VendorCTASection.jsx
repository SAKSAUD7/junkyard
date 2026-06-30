import React from 'react';
import { Link } from 'react-router-dom';

export default function VendorCTASection() {
    return (
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-[0_2px_16px_rgb(0,0,0,0.04)] h-full flex flex-col justify-between overflow-hidden relative">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-50 pointer-events-none"></div>

            <div className="relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-100 bg-blue-50 mb-4 w-max">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Vendor Network Hub</span>
                </div>

                {/* Heading */}
                <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-3 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Grow Your Salvage <br />
                    <span className="text-blue-600">Business Today</span>
                </h2>

                {/* Body */}
                <p className="text-slate-500 text-[13px] font-medium leading-relaxed mb-5">
                    Partner with <span className="text-slate-800 font-bold">JYNM</span> to dominate your local market, digitize your inventory, and receive high-converting leads on autopilot.
                </p>

                {/* Feature pills */}
                <div className="flex flex-col gap-2 mb-5">
                    {['✓ Get qualified leads daily', '✓ Free listing setup', '✓ Trusted by 1,000+ yards'].map((item) => (
                        <span key={item} className="text-[12px] font-semibold text-slate-600">{item}</span>
                    ))}
                </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col xl:flex-row gap-2 relative z-10">
                <Link
                    to="/add-a-yard"
                    className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all text-[13px] shadow-[0_4px_16px_rgba(37,99,235,0.25)] hover:-translate-y-0.5 flex-1 text-center"
                >
                    Add Junkyard
                </Link>
                <Link
                    to="/vendor/login"
                    className="inline-flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold px-4 py-2.5 rounded-xl transition-all text-[13px] hover:-translate-y-0.5 flex-1 text-center"
                >
                    Login
                </Link>
            </div>
        </div>
    );
}
