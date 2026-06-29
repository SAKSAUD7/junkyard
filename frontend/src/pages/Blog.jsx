import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import AdCarousel from '../components/AdCarousel';

const CATEGORIES = [
    { name: 'Buying Guides', icon: '🛒', count: 12, color: 'bg-orange-50 text-orange-600 border-orange-100' },
    { name: 'Auto Parts 101', icon: '🔍', count: 8, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { name: 'Junkyard Tips', icon: '♻', count: 15, color: 'bg-green-50 text-green-600 border-green-100' },
    { name: 'Industry News', icon: '📈', count: 6, color: 'bg-teal-50 text-teal-600 border-teal-100' },
    { name: 'Maintenance', icon: '🔧', count: 10, color: 'bg-sky-50 text-sky-600 border-sky-100' },
    { name: 'Money-Saving Tips', icon: '💰', count: 9, color: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100' },
];

const LATEST_ARTICLES = [
    { title: '5 Signs You Need a New Transmission', date: 'May 18, 2024', read: '5 min', img: 'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=800&auto=format&fit=crop' },
    { title: 'How to Verify a Used Part is Good Quality', date: 'May 15, 2024', read: '7 min', img: 'https://images.unsplash.com/photo-1530906358829-e84b2769270f?q=80&w=800&auto=format&fit=crop' },
    { title: 'Top 10 Most Searched Auto Parts in 2024', date: 'May 10, 2024', read: '9 min', img: 'https://images.unsplash.com/photo-1611082697843-1e5bfafb21a8?q=80&w=800&auto=format&fit=crop' },
];

export default function Blog() {
    return (
        <div className="min-h-screen bg-[#fafbfc] text-slate-900">
            <SEO
                title="Auto Parts Insights – Tips, Guides & News | JYNM"
                description="Tips, guides, and news about finding used auto parts, navigating auto salvage yards, and DIY car repair from Junkyards Near Me."
                canonicalUrl="/blog"
            />
            <Navbar />

            {/* Light Hero */}
            <section className="relative pt-28 pb-16 bg-white border-b border-slate-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/80 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
                <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 bg-blue-50 border border-blue-100">
                        <span className="text-blue-600 text-[11px] font-black uppercase tracking-widest">Auto Parts Insights</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                        Tips, Guides &amp; <span className="text-blue-600">News</span>
                    </h1>
                    <p className="text-slate-500 text-lg font-medium">
                        Expert insights to help you buy smart and save more on used auto parts.
                    </p>
                </div>
            </section>

            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Search */}
                <div className="max-w-[560px] mx-auto flex gap-3 mb-16">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </div>
                        <input type="text" className="w-full bg-white border border-slate-200 text-slate-900 text-[15px] rounded-full focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block pl-12 p-3.5 shadow-sm placeholder-slate-400 outline-none" placeholder="Search articles..."/>
                    </div>
                    <button className="bg-blue-600 text-white font-bold rounded-full px-8 py-3.5 hover:bg-blue-700 transition shadow-[0_4px_14px_0_rgb(37,99,235,0.35)]">
                        Search
                    </button>
                </div>

                {/* Featured + Categories */}
                <div className="grid lg:grid-cols-[2fr_1fr] gap-10 mb-12">
                    {/* Featured Article */}
                    <div className="relative bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-500 rounded-3xl overflow-hidden aspect-[16/9] lg:aspect-auto flex flex-col justify-end p-8 text-white group border border-slate-100 shadow-xl min-h-[320px]">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1549488344-c6b7ef142eb3?q=80&w=2070&auto=format&fit=crop')] mix-blend-overlay opacity-40 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute top-6 left-6">
                            <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded">Featured</span>
                        </div>
                        <div className="absolute top-6 right-6">
                            <span className="bg-fuchsia-500/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded">Maintenance</span>
                        </div>
                        <div className="relative z-10 w-[55%]">
                            <h2 className="text-2xl md:text-3xl font-black mb-3 leading-[1.15]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                How to Find a Reliable Used Engine for Your Car
                            </h2>
                            <p className="text-purple-100 font-medium mb-5 text-sm">Expert guide to save big!</p>
                            <Link to="/blog/1" className="inline-flex items-center text-white font-bold hover:text-blue-200 transition-colors text-sm">
                                Read More <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                            </Link>
                            <div className="flex items-center gap-5 mt-6 pt-5 border-t border-white/20 text-[12px] text-purple-100 font-semibold">
                                <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>May 30, 2024</span>
                                <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>8 min read</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Categories + Newsletter */}
                    <div className="flex flex-col gap-6">
                        {/* Categories */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <h3 className="text-[18px] font-black text-blue-600 mb-5" style={{ fontFamily: "'Outfit', sans-serif" }}>Categories</h3>
                            <div className="space-y-3">
                                {CATEGORIES.map((cat, i) => (
                                    <Link key={i} to="/blog" className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border hover:shadow-sm transition-all ${cat.color}`}>
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-base">{cat.icon}</span>
                                            <span className="font-bold text-[13px]">{cat.name}</span>
                                        </div>
                                        <span className="text-[11px] font-black opacity-70">{cat.count}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Newsletter CTA */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                            <h3 className="font-black text-[17px] mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Get the Latest Updates</h3>
                            <p className="text-blue-100 text-[13px] mb-4">Subscribe to our newsletter for tips, guides &amp; exclusive offers</p>
                            <input type="email" placeholder="Your email address" className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 text-sm mb-3 focus:outline-none focus:border-white/50"/>
                            <button className="w-full py-2.5 bg-white text-blue-600 font-black rounded-xl hover:bg-blue-50 transition text-sm">Subscribe →</button>
                        </div>
                    </div>
                </div>

                <AdCarousel slotGroup="carousel_1" page="blog" title="Featured Partners" />

                {/* Latest Articles */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[20px] font-black text-blue-600" style={{ fontFamily: "'Outfit', sans-serif" }}>Latest Articles</h2>
                        <Link to="/blog" className="text-[13px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">View all articles →</Link>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {LATEST_ARTICLES.map((post, i) => (
                            <Link key={i} to="/blog" className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-1 transition-all group block">
                                <div className="aspect-[16/10] overflow-hidden">
                                    <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-black text-slate-900 text-[15px] leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[12px] text-slate-400 font-semibold">
                                        <span>{post.date}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"/>
                                        <span>{post.read} read</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
