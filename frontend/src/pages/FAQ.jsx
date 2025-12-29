import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FAQ = () => {
    const categories = [
        {
            name: "General",
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
            questions: [
                {
                    q: "How do I get a quote?",
                    a: "Simply use the search form on our homepage or visit a vendor's profile page. Fill out your vehicle details, and the request is sent directly to the vendor for a rapid response."
                },
                {
                    q: "What payment methods are accepted?",
                    a: "Payment methods vary by vendor. Most accept major credit cards and cash. Always verify the payment terms with the specific junkyard you are buying from."
                }
            ]
        },
        {
            name: "Shipping & Returns",
            questions: [
                {
                    q: "Do vendors ship parts?",
                    a: "Many listed vendors offer shipping, both locally and nationwide. Check the specific vendor's profile details or ask when requesting a quote."
                },
                {
                    q: "What if the part doesn't work?",
                    a: "Return policies are set by individual vendors. We recommend asking about warranties and return periods (typically 30-90 days) before completing your purchase."
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
            <Navbar />

            {/* Hero Section */}
            <div className="relative py-24 text-center">
                <div className="absolute inset-0 bg-blue-500/5 blur-[100px] pointer-events-none"></div>

                <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
                    Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Questions</span>
                </h1>
                <p className="text-white/60 text-lg max-w-2xl mx-auto px-4">
                    Everything you need to know about finding and buying used auto parts through our platform.
                </p>
            </div>

            {/* FAQ Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <div className="space-y-12">
                    {categories.map((category, idx) => (
                        <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></span>
                                {category.name}
                            </h2>
                            <div className="grid gap-6">
                                {category.questions.map((item, qIdx) => (
                                    <div
                                        key={qIdx}
                                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                                    >
                                        <h3 className="text-lg font-bold text-white mb-3">
                                            {item.q}
                                        </h3>
                                        <p className="text-white/70 leading-relaxed">
                                            {item.a}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Box */}
                <div className="mt-16 bg-dark-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Still have questions?</h3>
                    <p className="text-white/60 mb-6">Can't find the answer you're looking for? Our team is here to help.</p>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                    >
                        Contact Support
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default FAQ;
