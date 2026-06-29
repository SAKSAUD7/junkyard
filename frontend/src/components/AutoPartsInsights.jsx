import { Link } from 'react-router-dom';

export default function AutoPartsInsights() {
    return (
        <section className="py-20 bg-[#fafbfc] border-t border-slate-100">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center mb-10">
                    <h2 className="text-[2.2rem] font-black text-slate-900 mb-2 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Auto Parts Insights
                    </h2>
                    <p className="text-[17px] font-bold text-[#1e293b]">
                        Tips, guides & industry news<br/>to save you time & money.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-[600px] mx-auto flex gap-3 mb-16">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </div>
                        <input 
                            type="text" 
                            className="w-full bg-white border border-slate-200 text-slate-900 text-[15px] rounded-full focus:ring-blue-500 focus:border-blue-500 block pl-12 p-3.5 shadow-sm" 
                            placeholder="Search articles..." 
                        />
                    </div>
                    <button className="bg-blue-600 text-white font-bold rounded-full px-8 py-3.5 hover:bg-blue-700 transition shadow-[0_4px_14px_0_rgb(37,99,235,0.39)]">
                        Search
                    </button>
                </div>

                {/* Top Section: Featured + Categories */}
                <div className="grid lg:grid-cols-[2fr_1fr] gap-10 mb-12">
                    
                    {/* Featured Article */}
                    <div className="relative bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-500 rounded-3xl overflow-hidden shadow-xl aspect-[16/9] lg:aspect-auto flex flex-col justify-end p-8 text-white group cursor-pointer border border-slate-100">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1549488344-c6b7ef142eb3?q=80&w=2070&auto=format&fit=crop')] mix-blend-overlay opacity-40 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
                        
                        <div className="absolute top-6 left-6 flex gap-2">
                            <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded">Featured</span>
                        </div>
                        <div className="absolute top-6 right-6 flex gap-2">
                            <span className="bg-fuchsia-500/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded">Maintenance</span>
                        </div>

                        <div className="relative z-10 w-[65%]">
                            <h3 className="text-3xl md:text-4xl font-black mb-3 leading-[1.1] text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                How to Find the Right<br/>Used Engine for Your Car
                            </h3>
                            <p className="text-purple-100 font-medium mb-6 text-[15px]">
                                Expert guide to save big!
                            </p>
                            <Link to="/blog/1" className="inline-flex items-center text-white font-bold hover:text-blue-200 transition-colors">
                                Read More 
                                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                            </Link>

                            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/20 text-[13px] text-purple-100 font-semibold font-mono">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    May 30, 2024
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    8 min read
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Categories List */}
                    <div className="pt-2">
                        <h3 className="text-xl font-black text-blue-600 mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>Categories</h3>
                        <div className="space-y-4">
                            {[
                                { text: 'Buying Guides', color: 'text-orange-500 bg-orange-50', icon: '🛒' },
                                { text: 'Auto Parts 101', color: 'text-blue-600 bg-blue-50', icon: '🔍' },
                                { text: 'Junkyard Tips', color: 'text-green-600 bg-green-50', icon: '♻' },
                                { text: 'Industry News', color: 'text-teal-600 bg-teal-50', icon: '📈' },
                                { text: 'Maintenance', color: 'text-blue-500 bg-blue-50', icon: '🔧' },
                                { text: 'Money-Saving Tips', color: 'text-fuchsia-600 bg-fuchsia-50', icon: '💰' },
                            ].map((cat, i) => (
                                <Link key={i} to="/blog" className="flex items-center gap-4 group">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${cat.color} group-hover:scale-110 transition-transform`}>
                                        {cat.icon}
                                    </div>
                                    <span className="font-bold text-slate-600 group-hover:text-blue-600 transition-colors text-[14px]">{cat.text}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Latest Articles */}
                <div>
                    <h3 className="text-xl font-black text-blue-600 mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>Latest Articles</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { title: '5 Signs You Need a New Transmission', date: 'May 18, 2024', read: '5 min read', img: 'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=2070&auto=format&fit=crop' },
                            { title: 'How to Verify a Used Part is Good Quality', date: 'May 15, 2024', read: '7 min read', img: 'https://images.unsplash.com/photo-1530906358829-e84b2769270f?q=80&w=1973&auto=format&fit=crop' },
                            { title: 'Top 10 Most Searched Auto Parts in 2024', date: 'May 10, 2024', read: '9 min read', img: 'https://images.unsplash.com/photo-1611082697843-1e5bfafb21a8?q=80&w=2070&auto=format&fit=crop' }
                        ].map((post, i) => (
                            <Link key={i} to="/blog" className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-1 transition-all group">
                                <div className="aspect-[16/10] overflow-hidden">
                                    <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="p-6">
                                    <h4 className="font-black text-slate-900 text-[16px] leading-[1.3] mb-4 group-hover:text-blue-600 transition-colors line-clamp-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        {post.title}
                                    </h4>
                                    <div className="flex items-center gap-3 text-[12px] text-slate-500 font-semibold font-mono">
                                        <span>{post.date}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span>{post.read}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
