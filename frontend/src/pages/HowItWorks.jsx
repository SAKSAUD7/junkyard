import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useCMS } from '../hooks/useCMS';

const HowItWorks = () => {
    const navigate = useNavigate();
    const { get } = useCMS('how_it_works');

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const steps = [
        {
            number: get('steps', 'step1_number', '01'),
            title: get('steps', 'step1_title', 'Tell Us What You Need'),
            description: get('steps', 'step1_desc', "Fill out our simple form with your vehicle details (make, model, year) and the specific part you're looking for. Add your contact information and location."),
            icon: (<svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>)
        },
        {
            number: get('steps', 'step2_number', '02'),
            title: get('steps', 'step2_title', 'We Notify Our Network'),
            description: get('steps', 'step2_desc', 'Your request is instantly sent to our network of verified junkyards and auto salvage yards in your area. No need to call around - we do the work for you.'),
            icon: (<svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>)
        },
        {
            number: get('steps', 'step3_number', '03'),
            title: get('steps', 'step3_title', 'Receive Free Quotes'),
            description: get('steps', 'step3_desc', 'Junkyards with your part in stock will contact you directly with pricing, availability, and shipping options. Compare offers and choose the best deal.'),
            icon: (<svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>)
        },
        {
            number: get('steps', 'step4_number', '04'),
            title: get('steps', 'step4_title', 'Order & Save'),
            description: get('steps', 'step4_desc', 'Purchase directly from the junkyard of your choice. Arrange pickup or shipping, and get your quality used part at a fraction of the cost of new.'),
            icon: (<svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>)
        }
    ];

    const benefits = [
        { title: 'Save Time', description: 'No more calling dozens of junkyards. One form reaches them all.', icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>) },
        { title: 'Save Money', description: 'Compare prices from multiple vendors to get the best deal on quality used parts.', icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>) },
        { title: 'Verified Vendors', description: 'All junkyards in our network are verified and rated by real customers.', icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>) },
        { title: '100% Free', description: 'Our service is completely free for buyers. No hidden fees, ever.', icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>) }
    ];

    return (
        <div className="bg-[#f8fafc] min-h-screen">
            <SEO
                title={get('meta', 'title', 'How It Works - Find Used Auto Parts in 4 Easy Steps')}
                description={get('meta', 'description', 'Learn how to find quality used auto parts through our network of verified junkyards. Simple 4-step process.')}
            />
            <Navbar />

            {/* Pristine Light Hero */}
            <section className="relative pt-32 pb-20 bg-white border-b border-slate-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/80 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/4" />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 bg-orange-50 border border-orange-100">
                        <span className="text-orange-500 text-[11px] font-black uppercase tracking-widest">Simple Process</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-5" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}
                        dangerouslySetInnerHTML={{ __html: get('hero', 'heading', 'How It <span class="text-blue-600">Works</span>') }}
                    />
                    <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
                        {get('hero', 'subheading', "Finding quality used auto parts has never been easier. We connect you with verified junkyards nationwide.")}
                    </p>
                </div>
            </section>

            {/* Steps Grid */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((step, index) => (
                            <div key={index} className="bg-white rounded-2xl p-7 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-lg transition-all">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: index % 2===0 ? 'rgba(37,99,235,0.08)' : 'rgba(234,88,12,0.08)' }}>
                                    <span className="font-black text-xl" style={{ color: index % 2===0 ? '#2563eb' : '#ea580c', fontFamily: "'Outfit', sans-serif" }}>{step.number}</span>
                                </div>
                                <div className="inline-flex p-2.5 rounded-xl mb-4" style={{ background: index % 2===0 ? 'rgba(37,99,235,0.06)' : 'rgba(234,88,12,0.06)' }}>
                                    {step.icon}
                                </div>
                                <h3 className="font-black text-slate-900 mb-2 text-[17px]" style={{ fontFamily: "'Outfit', sans-serif" }}>{step.title}</h3>
                                <p className="text-[14px] text-slate-500 leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-slate-900 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Why Use <span className="text-blue-600">JYNM</span>?
                        </h2>
                        <p className="text-slate-500 max-w-xl mx-auto">We make finding used auto parts simple, fast, and affordable.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-blue-50 text-blue-600 border border-blue-100">
                                    {benefit.icon}
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{benefit.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-[#f8fafc]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-blue-700 to-blue-600 rounded-3xl p-12 text-center shadow-[0_20px_60px_rgb(37,99,235,0.25)]">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {get('cta', 'heading', 'Ready to Find Your Part?')}
                        </h2>
                        <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
                            {get('cta', 'subtext', "It's 100% free and takes less than 2 minutes to submit your request.")}
                        </p>
                        <button onClick={() => navigate(get('cta', 'button_link', '/'))}
                            className="bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition shadow-md">
                            {get('cta', 'button_text', 'Submit a Free Request')} →
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default HowItWorks;
