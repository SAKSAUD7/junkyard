import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { getHowToSchema } from '../utils/structuredData';
import { useCMS } from '../hooks/useCMS';
import PageHero from '../components/PageHero';

export default function HowItWorks() {
    const navigate = useNavigate();
    const { get } = useCMS('how_it_works');
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const steps = [
        {
            number: '01',
            tag: 'Request',
            title: get('steps', 'step1_title', 'Tell Us What You Need'),
            description: get('steps', 'step1_desc', "Enter your vehicle's Year, Make, Model, and the exact part needed. Add your location or zip code so we can pinpoint suppliers closest to you."),
            badge: 'Instant 60s Form',
            icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            ),
            features: ['Make & Model Auto-matcher', 'VIN lookup enabled', 'Nationwide coverage']
        },
        {
            number: '02',
            tag: 'Dispatch',
            title: get('steps', 'step2_title', 'We Notify Our Network'),
            description: get('steps', 'step2_desc', 'Your part request is dispatched instantly across hundreds of vetted salvage yards and dismantlers. No need to call dozens of shops.'),
            badge: 'Automated Broadcast',
            icon: (
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            features: ['Real-time inventory lookup', 'Verified yard credentials', 'Zero spam guarantee']
        },
        {
            number: '03',
            tag: 'Compare',
            title: get('steps', 'step3_title', 'Receive Free Quotes'),
            description: get('steps', 'step3_desc', 'Junkyards with verified inventory reply with competitive pricing, condition photos, mileage, warranty details, and shipping options.'),
            badge: 'Direct Responses',
            icon: (
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            features: ['Transparent parts pricing', 'Grade A/B condition metrics', 'Warranty protection']
        },
        {
            number: '04',
            tag: 'Save',
            title: get('steps', 'step4_title', 'Order & Save Up to 80%'),
            description: get('steps', 'step4_desc', 'Pick the offer that matches your budget. Lock in local pickup or direct freight delivery straight to your home or mechanic.'),
            badge: 'Final Delivery',
            icon: (
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
                </svg>
            ),
            features: ['Direct payment security', 'Local pickup or freight', 'Save up to 80% vs OEM']
        }
    ];

    const trustStats = [
        { value: '50 States', label: 'Nationwide Network', desc: 'Over 1,200 active dismantlers' },
        { value: '80%', label: 'Average Savings', desc: 'Compared to dealer list prices' },
        { value: '< 2 Mins', label: 'Quote Turnaround', desc: 'Fast digital dispatch system' },
        { value: '100% Free', label: 'Zero Buyer Fees', desc: 'Direct connection, no markups' }
    ];

    const comparisonRows = [
        { metric: 'Time to source parts', jynm: 'Under 5 minutes online', traditional: '2-4 hours calling yards', dealer: '1-2 weeks backorder' },
        { metric: 'Price comparison', jynm: 'Multiple competitive quotes', traditional: 'Only the yard you call', dealer: 'Full retail markup' },
        { metric: 'Verified yards & warranty', jynm: 'Yes, pre-vetted network', traditional: 'Varies wildly', dealer: 'High price warranty' },
        { metric: 'Direct delivery options', jynm: 'Local pickup or freight', traditional: 'Self pull / pick only', dealer: 'Dealer counter pickup' },
        { metric: 'Platform fee for buyers', jynm: '$0 completely free', traditional: 'Free (heavy time cost)', dealer: 'None ($$$ parts)' }
    ];

    return (
        <div className="bg-slate-50 min-h-screen font-inter text-slate-900 selection:bg-blue-600 selection:text-white">
            <SEO
                title={get('meta', 'title', 'How It Works - Find Used Auto Parts in 4 Easy Steps | JYNM')}
                description={get('meta', 'description', 'Learn how to find quality used auto parts through our network of verified junkyards. Simple 4-step process.')}
                schema={getHowToSchema()}
            />
            <Navbar />

            {/* Dynamic Vivid Hero */}
            <PageHero
                page="how_it_works"
                tag="Simple & Transparent Process"
                title="How It"
                titleAccent="Works"
                subtitle={get('hero', 'subheading', "Finding quality used auto parts has never been easier. We connect your request with verified junkyards and auto recyclers nationwide.")}
                backgroundImage="/heroes/mechanic-parts.png"
                height="large"
            >
                <div className="flex flex-wrap items-center justify-center gap-4 mt-3">
                    <button
                        onClick={() => navigate('/quote')}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5 text-sm md:text-base cursor-pointer"
                    >
                        <span>Request Parts Free</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                    <button
                        onClick={() => navigate('/sell-your-car')}
                        className="px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/25 backdrop-blur-md transition-all text-sm md:text-base cursor-pointer"
                    >
                        Sell Your Car for Cash →
                    </button>
                </div>
            </PageHero>

            {/* Trust Stats Ribbon */}
            <div className="relative -mt-8 z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 border border-slate-200/80 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                    {trustStats.map((stat, i) => (
                        <div key={i} className="pt-4 lg:pt-0 first:pt-0 px-3">
                            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stat.value}</span>
                            </p>
                            <p className="text-sm font-extrabold text-slate-800 mt-1">{stat.label}</p>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">{stat.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Innovative Interactive Step Process */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-black uppercase tracking-widest mb-4">
                            Step-By-Step Walkthrough
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            From Search to Your Doorstep in <span className="text-blue-600">4 Simple Steps</span>
                        </h2>
                        <p className="text-slate-500 text-base sm:text-lg mt-3 font-medium">
                            No endless calling, junkyard scavenging, or sketchy classifieds. Our digital network handles the sourcing for you.
                        </p>
                    </div>

                    {/* Step Cards Grid with Interactive Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                        {steps.map((step, index) => {
                            const isSelected = activeStep === index;
                            return (
                                <div
                                    key={index}
                                    onClick={() => setActiveStep(index)}
                                    className={`relative bg-white rounded-3xl p-7 border transition-all duration-300 flex flex-col cursor-pointer group ${
                                        isSelected
                                            ? 'border-blue-500 shadow-2xl shadow-blue-600/15 ring-2 ring-blue-500/20 -translate-y-2'
                                            : 'border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md hover:-translate-y-1'
                                    }`}
                                >
                                    {/* Step Header */}
                                    <div className="flex items-center justify-between mb-5">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner transition-colors ${
                                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600'
                                        }`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                                            {step.number}
                                        </div>
                                        <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                                            isSelected ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-400'
                                        }`}>
                                            {step.tag}
                                        </span>
                                    </div>

                                    {/* Icon & Title */}
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                                        isSelected ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                                    }`}>
                                        {step.icon}
                                    </div>

                                    <h3 className="font-black text-slate-900 mb-2.5 text-lg group-hover:text-blue-600 transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        {step.title}
                                    </h3>
                                    
                                    <p className="text-[13px] text-slate-500 leading-relaxed font-medium mb-5 flex-1">
                                        {step.description}
                                    </p>

                                    {/* Feature Badges */}
                                    <div className="pt-4 border-t border-slate-100 space-y-2">
                                        {step.features.map((feat, fIdx) => (
                                            <div key={fIdx} className="flex items-center gap-2 text-[12px] font-bold text-slate-600">
                                                <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span>{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Marketplace Comparison Table */}
            <section className="py-20 bg-white border-y border-slate-200/80">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-black uppercase tracking-widest mb-3">
                            The Smarter Way
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Why Car Owners Choose <span className="text-blue-600">JYNM</span>
                        </h2>
                        <p className="text-slate-500 text-base mt-2">See how our automated network compares to the outdated alternatives.</p>
                    </div>

                    <div className="overflow-x-auto rounded-3xl border border-slate-200 shadow-md">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80">
                                    <th className="p-4 sm:p-5 font-bold text-slate-500 uppercase tracking-wider text-xs">Feature</th>
                                    <th className="p-4 sm:p-5 font-black text-blue-600 text-base bg-blue-50/70 border-x border-blue-100">
                                        JYNM Platform ⚡
                                    </th>
                                    <th className="p-4 sm:p-5 font-bold text-slate-600">Traditional Calling</th>
                                    <th className="p-4 sm:p-5 font-bold text-slate-600">Dealership OEM</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {comparisonRows.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 sm:p-5 font-extrabold text-slate-800">{row.metric}</td>
                                        <td className="p-4 sm:p-5 font-extrabold text-blue-700 bg-blue-50/30 border-x border-blue-100">
                                            ✓ {row.jynm}
                                        </td>
                                        <td className="p-4 sm:p-5 text-slate-500 font-medium">{row.traditional}</td>
                                        <td className="p-4 sm:p-5 text-slate-500 font-medium">{row.dealer}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* High-Impact CTA Banner */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-10 sm:p-14 text-center shadow-2xl shadow-blue-900/20">
                        {/* Decorative background glow */}
                        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10">
                            <span className="inline-block text-xs font-black uppercase tracking-[0.25em] text-blue-200 bg-white/10 px-4 py-1.5 rounded-full mb-4">
                                Zero Obligation • 100% Free
                            </span>
                            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {get('cta', 'heading', 'Ready to Find Your Auto Part?')}
                            </h2>
                            <p className="text-blue-100 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
                                {get('cta', 'subtext', "Submit your vehicle details in under 2 minutes and let verified dismantlers nationwide send you their best offers.")}
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <button
                                    onClick={() => navigate('/quote')}
                                    className="bg-white text-blue-700 font-black px-9 py-4 rounded-2xl hover:bg-blue-50 transition shadow-xl shadow-black/10 text-base cursor-pointer hover:scale-105 active:scale-95"
                                >
                                    {get('cta', 'button_text', 'Submit Free Quote Request')} →
                                </button>
                                <button
                                    onClick={() => window.dispatchEvent(new CustomEvent('jynm:open-add-yard'))}
                                    className="bg-white/10 hover:bg-white/20 text-white font-bold px-7 py-4 rounded-2xl border border-white/20 backdrop-blur transition text-base cursor-pointer"
                                >
                                    Are you a Yard? List Here
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
