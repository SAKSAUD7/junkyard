import { useCMS } from '../hooks/useCMS';

const savingsData = [
    { part: 'Complete Engine Assy', vehicle: '2018 Ford F-150 5.0L', msrp: '$4,200', jynm: '$1,850', savings: '$2,350', time: '12 Mins' },
    { part: 'Automatic Transmission', vehicle: '2020 Honda Civic CVT', msrp: '$3,100', jynm: '$950', savings: '$2,150', time: '8 Mins' },
    { part: 'Front Bumper Cover', vehicle: '2021 Toyota Camry', msrp: '$450', jynm: '$180', savings: '$270', time: '5 Mins' },
    { part: 'LED Headlight Assy (L)', vehicle: '2019 Jeep Grand Cherokee', msrp: '$1,100', jynm: '$450', savings: '$650', time: '15 Mins' },
    { part: 'Catalytic Converter', vehicle: '2017 Chevy Silverado 1500', msrp: '$1,600', jynm: '$650', savings: '$950', time: '10 Mins' }
];

export default function RealSavingsTable() {
    const { get } = useCMS('home');
    return (
        <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 font-[Outfit] tracking-tight">
                        {get('real_savings', 'heading', 'Real Savings. Real Results.')}
                    </h2>
                    <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
                        {get('real_savings', 'subheading', 'See recent matches from our network. Stop overpaying at dealerships and let salvage yards compete for your business.')}
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 uppercase tracking-widest text-[10px] font-black text-slate-500">
                                    <th className="px-6 py-5 rounded-tl-2xl">Auto Part</th>
                                    <th className="px-6 py-5">Vehicle</th>
                                    <th className="px-6 py-5">Dealer MSRP</th>
                                    <th className="px-6 py-5">JYNM Price</th>
                                    <th className="px-6 py-5 text-green-600 px-bg-green-50">Savings</th>
                                    <th className="px-6 py-5 rounded-tr-2xl">Time to Match</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {savingsData.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5 font-bold text-slate-900 text-sm">{row.part}</td>
                                        <td className="px-6 py-5 font-medium text-slate-600 text-sm">{row.vehicle}</td>
                                        <td className="px-6 py-5 font-medium text-slate-400 line-through text-sm">{row.msrp}</td>
                                        <td className="px-6 py-5 font-bold text-blue-600 text-sm">{row.jynm}</td>
                                        <td className="px-6 py-5">
                                            <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-md text-sm">
                                                {row.savings}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 font-semibold text-slate-500 text-sm flex items-center gap-1.5">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {row.time}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}
