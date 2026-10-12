import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { getFAQSchema } from '../utils/structuredData';
import { useCMS } from '../hooks/useCMS';
import AdCarousel from '../components/AdCarousel';
import PageHero from '../components/PageHero';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');
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

    const toggleQuestion = (catIdx, qIdx) => {
        const index = `${catIdx}-${qIdx}`;
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

    // Filter categories and questions by search query and active tab
    const filteredCategories = categories.map((cat, catIdx) => {
        if (activeTab !== 'All' && cat.name !== activeTab) {
            return { ...cat, originalIdx: catIdx, questions: [] };
        }
        const matchingQuestions = cat.questions
            .map((q, qIdx) => ({ ...q, originalQIdx: qIdx }))
            .filter(q => 
                !searchQuery || 
                q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                q.a.toLowerCase().includes(searchQuery.toLowerCase())
            );
        return {
            ...cat,
            originalIdx: catIdx,
            questions: matchingQuestions
        };
    }).filter(cat => cat.questions.length > 0);

    return (
        <div className="bg-slate-50 min-h-screen text-slate-900 font-inter">
            <SEO
                title={get('meta', 'title', 'Frequently Asked Questions - Junkyard & Auto Parts Guide')}
                description={get('meta', 'description', 'Common questions about finding used auto parts, junkyard services, shipping, returns, warranties, and more.')}
                schema={schema}
            />

            <Navbar />

            {/* Dynamic Modern PageHero with Search Bar */}
            <PageHero
                page="faq"
                tag="Help Center & Knowledge Base"
                title="Frequently Asked"
                titleAccent="Questions"
                subtitle={get('hero', 'subheading', 'Everything you need to know about finding, buying, and shipping used auto parts through our platform.')}
                backgroundImage="/heroes/parts-warehouse.png"
                height="large"
            >
                {/* Modern Interactive Search Bar in Hero */}
                <div className="w-full max-w-xl mx-auto mt-2">
                    <div className="relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-white/40 ring-4 ring-white/10 transition-all focus-within:ring-blue-500/30 focus-within:border-blue-500">
                        <svg className="w-5 h-5 text-slate-400 ml-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Type to search questions (e.g. shipping, quote, warranty)..."
                            className="w-full bg-transparent px-3 py-2 text-slate-900 text-sm md:text-base font-semibold placeholder:text-slate-400 outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="px-2.5 py-1 text-xs font-bold text-slate-400 hover:text-slate-700 bg-slate-100 rounded-lg mr-1"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </PageHero>

            {/* Interactive Category Filter Pills */}
            <div className="bg-white border-b border-slate-200/80 sticky top-16 sm:top-20 z-20 backdrop-blur-md bg-white/90 shadow-xs">
                <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center gap-2 overflow-x-auto hide-scrollbar">
                    {['All', ...categories.map(c => c.name)].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 ${
                                activeTab === tab
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-[1.02]'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                    {searchQuery && (
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg shrink-0 ml-auto">
                            Filtering: "{searchQuery}"
                        </span>
                    )}
                </div>
            </div>

            <div className="bg-white">
                <AdCarousel slotGroup="carousel_1" page="faq" title="Promoted Partners" />
            </div>

            {/* Questions List */}
            <div className="relative max-w-4xl mx-auto px-4 py-12 z-10">
                {filteredCategories.length > 0 ? (
                    <div className="space-y-12">
                        {filteredCategories.map((category) => (
                            <div key={category.name}>
                                {/* Category Header */}
                                <div className="flex items-center gap-3.5 mb-6">
                                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 shadow-sm border border-blue-100 shrink-0">
                                        {category.icon}
                                    </div>
                                    <div>
                                        <h2 className="font-extrabold text-2xl md:text-3xl text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                            {category.name}
                                        </h2>
                                        <p className="text-xs font-semibold text-slate-400 mt-0.5">
                                            {category.questions.length} question{category.questions.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Questions Array */}
                                <div className="space-y-3.5">
                                    {category.questions.map((item) => {
                                        const index = `${category.originalIdx}-${item.originalQIdx}`;
                                        const isOpen = openIndex === index;

                                        return (
                                            <div
                                                key={item.originalQIdx}
                                                className={`group rounded-2xl overflow-hidden transition-all duration-300 border ${
                                                    isOpen 
                                                    ? 'bg-white border-blue-400/60 shadow-[0_8px_30px_rgba(26,86,255,0.12)] ring-2 ring-blue-500/10' 
                                                    : 'bg-white border-slate-200/70 hover:border-blue-300 hover:shadow-md'
                                                }`}
                                            >
                                                <button
                                                    onClick={() => toggleQuestion(category.originalIdx, item.originalQIdx)}
                                                    className="w-full flex items-center justify-between text-left p-5 sm:p-6 transition-all"
                                                >
                                                    <h3 className={`font-bold pr-6 text-base sm:text-lg ${isOpen ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'} transition-colors duration-200`}>
                                                        {item.q}
                                                    </h3>
                                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-blue-600 shadow-md rotate-180' : 'bg-slate-100 group-hover:bg-blue-50'}`}>
                                                        <svg className={`w-4 h-4 transition-colors ${isOpen ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </button>

                                                <div 
                                                    className={`overflow-hidden transition-all duration-300 ease-in-out px-5 sm:px-6 ${isOpen ? 'max-h-[500px] opacity-100 pb-6' : 'max-h-0 opacity-0 pb-0'}`}
                                                >
                                                    <p className="leading-relaxed text-slate-600 font-medium text-[15px] whitespace-pre-wrap">
                                                        {item.a}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">No matching questions found</h3>
                        <p className="text-sm text-slate-500 mb-6">We couldn't find any questions matching "{searchQuery}". Try a different keyword or browse all topics.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setActiveTab('All'); }}
                            className="px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

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
