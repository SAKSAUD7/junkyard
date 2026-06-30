import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { getFAQSchema } from '../utils/structuredData';
import { useCMS } from '../hooks/useCMS';
import AdCarousel from '../components/AdCarousel';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const { get } = useCMS('faq');

    const categories = [
        {
            name: "General",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            questions: [
                {
                    q: "Is Junkyards Near Me free to use?",
                    a: "Yes! Searching for parts and connecting with vendors is completely free for buyers. We help you find the best deals without any hidden service fees."
                },
                {
                    q: "Do you sell the parts directly?",
                    a: "No, we are a directory and search engine that connects you with independent junkyards and auto salvage yards across the country. You purchase directly from the verified vendor."
                },
                {
                    q: "How do I know the vendors are trusted?",
                    a: "We verify listings and allow users to rate and review their experiences. Look for our 'Top Rated' and 'Premium Partner' badges for our most reliable vendors."
                }
            ]
        },
        {
            name: "Buying Parts",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            questions: [
                {
                    q: "How do I get a quote?",
                    a: "Simply use the search form on our homepage or visit a vendor's profile page. Fill out your vehicle details, and the request is sent directly to the vendor for a rapid response."
                },
                {
                    q: "What payment methods are accepted?",
                    a: "Payment methods vary by vendor. Most accept major credit cards and cash. Always verify the payment terms with the specific junkyard you are buying from."
                },
                {
                    q: "Can I negotiate prices?",
                    a: "Many vendors are open to negotiation, especially for bulk purchases or if you're picking up the part yourself. Don't hesitate to ask!"
                }
            ]
        },
        {
            name: "Shipping & Returns",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
            ),
            questions: [
                {
                    q: "Do vendors ship parts?",
                    a: "Many listed vendors offer shipping, both locally and nationwide. Check the specific vendor's profile details or ask when requesting a quote."
                },
                {
                    q: "What if the part doesn't work?",
                    a: "Return policies are set by individual vendors. We recommend asking about warranties and return periods (typically 30-90 days) before completing your purchase."
                },
                {
                    q: "How long does shipping take?",
                    a: "Shipping times vary by vendor and location. Most domestic shipments arrive within 3-7 business days. Express shipping may be available for urgent needs."
                }
            ]
        }
    ];

    const toggleQuestion = (categoryIdx, questionIdx) => {
        const index = `${categoryIdx}-${questionIdx}`;
        setOpenIndex(openIndex === index ? null : index);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const allFAQs = categories.flatMap(cat =>
        cat.questions.map(q => ({
            question: q.q,
            answer: q.a
        }))
    );

    const schema = getFAQSchema(allFAQs);

    return (
        <div className="bg-slate-50 min-h-screen text-slate-900 font-inter">
            <SEO
                title={get('meta', 'title', 'Frequently Asked Questions - Junkyard & Auto Parts Guide')}
                description={get('meta', 'description', 'Common questions about finding used auto parts, junkyard services, shipping, returns, warranties, and more.')}
                schema={schema}
            />

            <Navbar />

            {/* Clean Light Hero */}
            <section className="relative pt-28 pb-14 bg-white border-b border-slate-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] opacity-60 pointer-events-none translate-x-1/3 -translate-y-1/4" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-50 rounded-full blur-[80px] opacity-40 pointer-events-none -translate-x-1/3 translate-y-1/4" />

                <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 bg-blue-50 border border-blue-100">
                            <span className="text-blue-600 text-[12px] font-bold uppercase tracking-widest">Help Center</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Frequently Asked <span className="text-blue-600">Questions</span>
                        </h1>
                        <p className="text-[17px] text-slate-500 font-medium max-w-2xl mx-auto mb-2 leading-relaxed">
                            Everything you need to know about finding and buying used auto parts through our platform.
                        </p>
                    </div>
                </div>
            </section>

            <div className="bg-white">
                <AdCarousel slotGroup="carousel_1" page="faq" title="Promoted Partners" />
            </div>

            {/* Questions List */}
            <div className="relative max-w-4xl mx-auto px-4 py-16 z-10">
                <div className="space-y-12">
                    {categories.map((category, categoryIdx) => (
                        <div key={categoryIdx}>
                            {/* Category Header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
                                    {category.icon}
                                </div>
                                <h2 className="font-bold text-2xl text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {category.name}
                                </h2>
                            </div>

                            {/* Questions Array */}
                            <div className="space-y-4">
                                {category.questions.map((item, questionIdx) => {
                                    const index = `${categoryIdx}-${questionIdx}`;
                                    const isOpen = openIndex === index;

                                    return (
                                        <div
                                            key={questionIdx}
                                            className="group rounded-2xl overflow-hidden transition-all duration-300 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200"
                                        >
                                            <button
                                                onClick={() => toggleQuestion(categoryIdx, questionIdx)}
                                                className={`w-full flex items-center justify-between text-left p-6 transition-colors ${isOpen ? 'bg-blue-50/50' : 'bg-transparent'}`}
                                            >
                                                <h3 className={`font-bold pr-8 transition-colors text-lg ${isOpen ? 'text-blue-600' : 'text-slate-900'}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                    {item.q}
                                                </h3>
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-180 bg-blue-100' : 'bg-slate-100'}`}>
                                                    <svg className={`w-5 h-5 transition-colors ${isOpen ? 'text-blue-600' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </button>

                                            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                                                <div className="p-6 pt-0 border-t border-slate-100 bg-white">
                                                    <p className="leading-relaxed text-slate-600 font-medium whitespace-pre-wrap mt-4">
                                                        {item.a}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="mt-24 rounded-3xl p-10 text-center border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="inline-flex p-4 rounded-full mb-6 bg-blue-50 text-blue-600">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="font-bold mb-3 text-2xl text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Still Have Questions?</h3>
                    <p className="mb-8 max-w-md mx-auto text-lg text-slate-600 font-medium">
                        Can't find the answer you're looking for? Our support team is here to help you 24/7.
                    </p>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-600/30">
                        Contact Support
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </div>
            </div>

            <div className="bg-white">
                <AdCarousel slotGroup="carousel_5" page="faq" title="More Partners" />
            </div>

            <Footer />
        </div>
    );
};

export default FAQ;
