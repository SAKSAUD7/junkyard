import React from 'react';

export default function HowItWorksSection({ get }) {
    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_4px_25px_rgb(0,0,0,0.03)] text-center h-full flex flex-col">
            <h2 className="text-xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }} dangerouslySetInnerHTML={{ __html: get('how_it_works', 'heading', 'How It <span class="text-blue-600">Works</span>') }}></h2>
            <p className="text-[13px] text-slate-500 font-medium mb-8" dangerouslySetInnerHTML={{ __html: get('how_it_works', 'subheading', 'Simple steps to get the parts you need') }}></p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                {[
                    { title: get('how_it_works', 'step1_title', 'Search'), icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>, desc: get('how_it_works', 'step1_desc', 'Tell us what you need') },
                    { title: get('how_it_works', 'step2_title', 'Compare'), icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>, desc: get('how_it_works', 'step2_desc', 'Get quotes from verified junkyards') },
                    { title: get('how_it_works', 'step3_title', 'Choose'), icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" /></svg>, desc: get('how_it_works', 'step3_desc', 'Pick the best price and quality') },
                    { title: get('how_it_works', 'step4_title', 'Save'), icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>, desc: get('how_it_works', 'step4_desc', 'Save up to 80% instantly') }
                ].map((st, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="mb-3 text-blue-600">{st.icon}</div>
                        <p className="text-[14px] font-bold text-slate-900 mb-1" dangerouslySetInnerHTML={{ __html: st.title }}></p>
                        <p className="text-[11px] text-slate-500 leading-tight" dangerouslySetInnerHTML={{ __html: st.desc }}></p>
                    </div>
                ))}
            </div>
        </div>
    );
}
