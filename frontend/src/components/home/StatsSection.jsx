import React from 'react';

export default function StatsSection({ get }) {
    const stats = [
        {
            value: get ? get('stats', 'value_1', '6,500+') : '6,500+',
            label: get ? get('stats', 'label_1', 'Verified Vendors') : 'Verified Vendors',
            color: 'text-blue-600',
            bg: 'bg-blue-50/60'
        },
        {
            value: get ? get('stats', 'value_2', '347,000+') : '347,000+',
            label: get ? get('stats', 'label_2', 'Quality Parts') : 'Quality Parts',
            color: 'text-indigo-600',
            bg: 'bg-indigo-50/60'
        },
        {
            value: get ? get('stats', 'value_3', '1M+') : '1M+',
            label: get ? get('stats', 'label_3', 'Searches Completed') : 'Searches Completed',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50/60'
        },
        {
            value: get ? get('stats', 'value_4', '50') : '50',
            label: get ? get('stats', 'label_4', 'States Covered') : 'States Covered',
            color: 'text-orange-500',
            bg: 'bg-orange-50/60'
        },
        {
            value: get ? get('stats', 'value_5', '4.9/5') : '4.9/5',
            label: get ? get('stats', 'label_5', 'Customer Rating') : 'Customer Rating',
            color: 'text-amber-500',
            bg: 'bg-amber-50/60'
        }
    ];

    return (
        <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10 mb-6">
            {/* Desktop: 5-card grid */}
            <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {stats.map((s, idx) => (
                    <div 
                        key={idx} 
                        className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 sm:p-5 text-center border border-slate-100 hover:border-slate-200 transition-all hover:-translate-y-0.5"
                    >
                        <h3 
                            className={`text-2xl sm:text-3xl font-black ${s.color} mb-1 tracking-tight`} 
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            {s.value}
                        </h3>
                        <p className="text-xs sm:text-[13px] font-bold text-slate-700">
                            {s.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Mobile: Horizontal scrollable badge ribbon with snap */}
            <div className="sm:hidden flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-4 px-4 snap-x">
                {stats.map((s, idx) => (
                    <div 
                        key={idx} 
                        className="flex-shrink-0 snap-center bg-white rounded-xl shadow-sm border border-slate-200/80 px-3.5 py-2.5 flex items-center gap-2.5"
                    >
                        <span 
                            className={`text-base font-black ${s.color} leading-none`} 
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            {s.value}
                        </span>
                        <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap leading-tight">
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}
