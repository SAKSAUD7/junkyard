import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { getFAQSchema } from '../utils/structuredData';

function FadeInSection({ children, delay = 0 }) {
    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay }}>
            {children}
        </motion.div>
    );
}

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const categories = [
        {
            name: "General",
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            questions: [
                { q: "Is Junkyards Near Me free to use?", a: "Yes! Searching for parts and connecting with vendors is completely free for buyers. We help you find the best deals without any hidden service fees." },
                { q: "Do you sell the parts directly?", a: "No, we are a directory and search engine that connects you with independent junkyards and auto salvage yards across the country. You purchase directly from the verified vendor." },
                { q: "How do I know the vendors are trusted?", a: "We verify listings and allow users to rate and review their experiences. Look for our 'Top Rated' and 'Premium Partner' badges for our most reliable vendors." }
            ]
        },
        {
            name: "Buying Parts",
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
            questions: [
                { q: "How do I get a quote?", a: "Simply use the search form on our homepage or visit a vendor's profile page. Fill out your vehicle details, and the request is sent directly to the vendor for a rapid response." },
                { q: "What payment methods are accepted?", a: "Payment methods vary by vendor. Most accept major credit cards and cash. Always verify the payment terms with the specific junkyard you are buying from." },
                { q: "Can I negotiate prices?", a: "Many vendors are open to negotiation, especially for bulk purchases or if you're picking up the part yourself. Don't hesitate to ask!" }
            ]
        },
        {
            name: "Shipping & Returns",
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
            questions: [
                { q: "Do vendors ship parts?", a: "Many listed vendors offer shipping, both locally and nationwide. Check the specific vendor's profile details or ask when requesting a quote." },
                { q: "What if the part doesn't work?", a: "Return policies are set by individual vendors. We recommend asking about warranties and return periods (typically 30-90 days) before completing your purchase." },
                { q: "How long does shipping take?", a: "Shipping times vary by vendor and location. Most domestic shipments arrive within 3-7 business days. Express shipping may be available for urgent needs." }
            ]
        }
    ];

    const toggleQuestion = (categoryIdx, questionIdx) => {
        const index = `${categoryIdx}-${questionIdx}`;
        setOpenIndex(openIndex === index ? null : index);
    };

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const allFAQs = categories.flatMap(cat => cat.questions.map(q => ({ question: q.q, answer: q.a })));
    const schema = getFAQSchema(allFAQs);

    return (
        <div className="min-h-screen" style={{ background: '#0a0b0d' }}>
            <SEO
                title="Frequently Asked Questions - Junkyard & Auto Parts Guide"
                description="Common questions about finding used auto parts, junkyard services, shipping, returns, warranties, and more. Get answers to your auto salvage questions."
                canonical="/faq"
                schema={schema}
            />
            <Navbar />

            {/* Hero */}
            <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #080909 0%, #0f1117 100%)' }}>
                <div className="absolute inset-0">
                    <img src="/images/static/car-interior-dashboard.png" alt="" loading="lazy" className="w-full h-full object-cover object-center" style={{ opacity: 0.1 }} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(8,9,9,0.6) 0%, rgba(8,9,9,0.85) 100%)' }} />
                </div>
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/3 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
                    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 mb-6" style={{ background: 'rgba(245,158,11,0.08)' }}>
                            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Help Center</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-none mb-6">
                            Frequently Asked <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Questions</span>
                        </h1>
                        <p className="text-white/50 text-base max-w-2xl mx-auto">Everything you need to know about finding and buying used auto parts through our platform.</p>
                    </motion.div>
                </div>
            </section>

            <section className="py-16" style={{ background: '#0a0b0d' }}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-12">
                        {categories.map((category, categoryIdx) => (
                            <FadeInSection key={categoryIdx} delay={categoryIdx * 0.1}>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-500">
                                        {category.icon}
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                                </div>

                                <div className="space-y-4">
                                    {category.questions.map((item, questionIdx) => {
                                        const index = `${categoryIdx}-${questionIdx}`;
                                        const isOpen = openIndex === index;

                                        return (
                                            <div key={questionIdx} className="rounded-2xl border border-white/[8%] overflow-hidden transition-all duration-300 hover:border-amber-500/30" style={{ background: '#111318' }}>
                                                <button onClick={() => toggleQuestion(categoryIdx, questionIdx)} className="w-full p-6 flex items-center justify-between text-left focus:outline-none">
                                                    <h3 className={`font-bold text-lg pr-8 transition-colors ${isOpen ? 'text-amber-400' : 'text-white'}`}>{item.q}</h3>
                                                    <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-amber-500 text-black rotate-180' : 'bg-white/5 text-white/50'}`}>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </button>
                                                <AnimatePresence>
                                                    {isOpen && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                                                            <div className="px-6 pb-6 text-white/50 leading-relaxed border-t border-white/5 pt-4">
                                                                {item.a}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </FadeInSection>
                        ))}
                    </div>

                    {/* Contact Box */}
                    <FadeInSection delay={0.4}>
                        <div className="mt-20 rounded-3xl border border-amber-500/20 p-10 text-center relative overflow-hidden" style={{ background: 'rgba(245,158,11,0.05)' }}>
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-20 blur-3xl bg-amber-500" />
                            </div>
                            <div className="relative z-10">
                                <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 text-amber-500 mb-6">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Still have questions?</h3>
                                <p className="text-white/50 mb-8 max-w-md mx-auto">Can't find the answer you're looking for? Our support team is here to help you 24/7.</p>
                                <Link to="/contact" className="inline-flex items-center gap-2 font-bold text-black px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/20" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
                                    Contact Support
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </Link>
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default FAQ;
