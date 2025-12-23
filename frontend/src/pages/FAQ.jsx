import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

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

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
            <Navbar />

            {/* Hero Section */}
            <div className="relative py-24 overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

                {/* Glow Effects */}
                <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full mb-8">
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <span className="text-white/90 text-sm font-semibold">HELP CENTER</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">Questions</span>
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto">
                        Everything you need to know about finding and buying used auto parts through our platform.
                    </p>
                </div>
            </div>

            {/* FAQ Content */}
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <div className="space-y-12">
                    {categories.map((category, categoryIdx) => (
                        <div key={categoryIdx} className="animate-fade-in" style={{ animationDelay: `${categoryIdx * 100}ms` }}>
                            {/* Category Header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 rounded-xl text-blue-400">
                                    {category.icon}
                                </div>
                                <h2 className="text-3xl font-bold text-white">
                                    {category.name}
                                </h2>
                            </div>

                            {/* Questions */}
                            <div className="space-y-4">
                                {category.questions.map((item, questionIdx) => {
                                    const index = `${categoryIdx}-${questionIdx}`;
                                    const isOpen = openIndex === index;

                                    return (
                                        <div
                                            key={questionIdx}
                                            className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-400/30 transition-all duration-300"
                                        >
                                            <button
                                                onClick={() => toggleQuestion(categoryIdx, questionIdx)}
                                                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                                            >
                                                <h3 className="text-lg font-bold text-white pr-8 group-hover:text-cyan-400 transition-colors">
                                                    {item.q}
                                                </h3>
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-180 bg-cyan-400/20' : ''}`}>
                                                    <svg className={`w-5 h-5 transition-colors ${isOpen ? 'text-cyan-400' : 'text-white/60'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </button>

                                            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                                                <div className="px-6 pb-5 pt-2">
                                                    <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-4"></div>
                                                    <p className="text-white/70 leading-relaxed">
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

                {/* Contact Box */}
                <div className="mt-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl"></div>
                    <div className="relative bg-dark-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
                        <div className="inline-flex p-4 bg-cyan-400/10 rounded-2xl mb-6">
                            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Still have questions?</h3>
                        <p className="text-white/60 mb-8 max-w-md mx-auto">
                            Can't find the answer you're looking for? Our support team is here to help you 24/7.
                        </p>
                        <a
                            href="/contact"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-glow transition-all duration-300 transform hover:scale-105"
                        >
                            Contact Support
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default FAQ;
