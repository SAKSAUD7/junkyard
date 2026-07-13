import React from 'react';
import { Link } from 'react-router-dom';
import { useCMS } from '../hooks/useCMS';

const features = [
    {
        icon: <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
        bg: 'bg-blue-50',
        title: 'Verified Vendors',
        desc: 'Manual verification for all salvage yards.'
    },
    {
        icon: <svg className="w-3.5 h-3.5 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1.5 1.5 0 0110 0a1.5 1.5 0 00-.8.246A120.153 120.153 0 00-1 8c0 7.143 5.26 13.91 11 16 5.74-2.09 11-8.857 11-16a120.153 120.153 0 00-9.7-6.954zM10 16.5c-3.844-1.636-7-6.5-7-9.711A118.068 118.068 0 0110 3.32a118.068 118.068 0 017 3.47c0 3.211-3.156 8.075-7 9.711z" clipRule="evenodd" /></svg>,
        bg: 'bg-orange-50',
        title: 'Instant Quotes',
        desc: 'Real-time multi-vendor pricing instantly.'
    },
    {
        icon: <svg className="w-3.5 h-3.5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
        bg: 'bg-indigo-50',
        title: 'Quality Guaranteed',
        desc: 'Full grading & condition details included.'
    },
    {
        icon: <svg className="w-3.5 h-3.5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>,
        bg: 'bg-yellow-50',
        title: 'Best Prices',
        desc: 'Compare 6,500+ yards to save up to 80%.'
    }
];

export default function WhyChooseJynmSection() {
    const { get } = useCMS('home');
    return (
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-[0_4px_25px_rgb(0,0,0,0.03)] h-full flex flex-col justify-between">
            <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {get('why_choose', 'heading', 'Why Choose JYNM')}
                </h2>
                <p className="text-[12px] md:text-[13px] text-slate-500 font-medium mb-3">{get('why_choose', 'subheading', 'The smartest way to source parts')}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                    {features.map((f, i) => (
                        <div key={i} className="flex gap-2.5 items-start p-2.5 rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-sm transition-all bg-slate-50/50">
                            <div className={`w-7 h-7 rounded-lg ${f.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                {f.icon}
                            </div>
                            <div>
                                <h3 className="text-[13px] font-black text-slate-800 mb-0.5 font-['Outfit']">{f.title}</h3>
                                <p className="text-[11px] text-slate-500 font-medium leading-tight">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Link
                to="/junkyards"
                className="mt-4 w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all text-[12px] shadow-[0_4px_16px_rgba(37,99,235,0.25)] hover:-translate-y-0.5"
            >
                Browse Junkyards →
            </Link>
        </div>
    );
}
