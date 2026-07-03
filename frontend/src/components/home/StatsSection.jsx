import React from 'react';

export default function StatsSection({ get }) {
    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-30 mt-12 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-[20px] shadow-[0_15px_40px_rgb(0,0,0,0.06)] p-6 text-center border border-slate-50 transition-transform hover:-translate-y-1">
                    <h3 className="text-3xl font-black text-blue-600 mb-1 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>{get('stats', 'value_1', '6,500+')}</h3>
                    <p className="text-[13px] font-bold text-[#1e293b]">{get('stats', 'label_1', 'Verified Vendors')}</p>
                </div>
                <div className="bg-white rounded-[20px] shadow-[0_15px_40px_rgb(0,0,0,0.06)] p-6 text-center border border-slate-50 transition-transform hover:-translate-y-1">
                    <h3 className="text-3xl font-black text-purple-600 mb-1 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>{get('stats', 'value_2', '347,000+')}</h3>
                    <p className="text-[13px] font-bold text-[#1e293b]">{get('stats', 'label_2', 'Quality Parts')}</p>
                </div>
                <div className="bg-white rounded-[20px] shadow-[0_15px_40px_rgb(0,0,0,0.06)] p-6 text-center border border-slate-50 transition-transform hover:-translate-y-1">
                    <h3 className="text-3xl font-black text-pink-500 mb-1 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>{get('stats', 'value_3', '1M+')}</h3>
                    <p className="text-[13px] font-bold text-[#1e293b]">{get('stats', 'label_3', 'Searches Completed')}</p>
                </div>
                <div className="bg-white rounded-[20px] shadow-[0_15px_40px_rgb(0,0,0,0.06)] p-6 text-center border border-slate-50 transition-transform hover:-translate-y-1">
                    <h3 className="text-3xl font-black text-orange-500 mb-1 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>{get('stats', 'value_4', '50')}</h3>
                    <p className="text-[13px] font-bold text-[#1e293b]">{get('stats', 'label_4', 'States Covered')}</p>
                </div>
                <div className="bg-white rounded-[20px] shadow-[0_15px_40px_rgb(0,0,0,0.06)] p-6 text-center border border-slate-50 transition-transform hover:-translate-y-1 md:col-span-1 col-span-2">
                    <h3 className="text-3xl font-black text-green-500 mb-1 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>{get('stats', 'value_5', '4.9/5')}</h3>
                    <p className="text-[13px] font-bold text-[#1e293b]">{get('stats', 'label_5', 'Customer Rating')}</p>
                </div>
            </div>
        </div>
    );
}
