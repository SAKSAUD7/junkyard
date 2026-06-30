import { Link } from 'react-router-dom';
import { useCMS } from '../hooks/useCMS';

const parts = [
    { name: 'Complete Engines', savings: '$1,200+', searches: '15k+ this week', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { name: 'Transmissions', savings: '$800+', searches: '12k+ this week', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { name: 'Headlights / Tail Lights', savings: '$250+', searches: '20k+ this week', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { name: 'Body Panels', savings: '$400+', searches: '8k+ this week', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
    { name: 'Alternators', savings: '$150+', searches: '18k+ this week', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { name: 'Wheels & Rims', savings: '$300+', searches: '25k+ this week', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
];

export default function PopularParts() {
    const { get } = useCMS('home');
    return (
        <section className="py-16 md:py-24 bg-white border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 font-[Outfit] tracking-tight">
                            {get('popular_parts', 'heading', 'Popular Used Parts in Demand')}
                        </h2>
                        <p className="text-slate-500 font-medium text-lg">{get('popular_parts', 'subheading', 'Top searches nationwide right now.')}</p>
                    </div>
                    <Link to="/browse" className="text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1 transition-colors">
                        Browse all categories
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {parts.map((part, index) => (
                        <div key={index} className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-200 hover:shadow-[0_8px_30px_rgb(37,99,235,0.08)] transition-all duration-300 flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex justify-center items-center text-blue-600 group-hover:bg-blue-50 group-hover:scale-110 transition-all duration-300">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={part.icon} />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg mb-1">{part.name}</h3>
                                <p className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded inline-block mb-1">
                                    Avg Savings: {part.savings}
                                </p>
                                <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">{part.searches}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
