import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import BlogCard from '../../components/BlogCard';
import BlogSkeletonCard from '../../components/BlogSkeletonCard';
import { blogApi } from '../../services/blogApi';
import { useCMS } from '../../hooks/useCMS';

const SAMPLE_POSTS = [
  {
    id: 1, slug: 'how-to-find-cheap-engine-replacements',
    title: 'How to Find Cheap Engine Replacements at Your Local Junkyard',
    excerpt: 'Discover pro tips for sourcing a quality used engine from salvage yards near you — saving thousands over dealer prices.',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    category_name: 'Buying Guide', is_featured: true, author: 'JYNM Editorial',
    published_at: '2026-04-10T00:00:00Z', reading_time: 6, tags: ['engine', 'junkyard', 'tips'],
  },
  {
    id: 2, slug: 'top-10-auto-parts-you-should-buy-used',
    title: 'Top 10 Auto Parts You Should Always Buy Used (And 5 You Shouldn\'t)',
    excerpt: 'Not all used auto parts are created equal. We break down exactly what to buy used and what to avoid at all costs.',
    image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
    category_name: 'Maintenance', is_featured: true, author: 'Jake Morris',
    published_at: '2026-04-08T00:00:00Z', reading_time: 8, tags: ['parts', 'guide'],
  },
  {
    id: 3, slug: 'diy-transmission-swap-guide',
    title: 'DIY Transmission Swap: A Step-by-Step Guide for Beginners',
    excerpt: 'Swapping a transmission doesn\'t have to be intimidating. Follow our beginner-friendly guide and save $2,000+ in labor costs.',
    image_url: 'https://images.unsplash.com/photo-1617813374374-ea4aa0d37ead?w=800&q=80',
    category_name: 'DIY', is_featured: false, author: 'Sarah Chen',
    published_at: '2026-04-05T00:00:00Z', reading_time: 12, tags: ['diy', 'transmission'],
  },
  {
    id: 4, slug: 'salvage-yard-etiquette-tips',
    title: 'Salvage Yard Etiquette: What Every First-Timer Should Know',
    excerpt: 'Your first visit to a pull-it-yourself yard can be overwhelming. Here\'s how to navigate it like a pro.',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    category_name: 'Tips & Tricks', is_featured: false, author: 'JYNM Editorial',
    published_at: '2026-04-02T00:00:00Z', reading_time: 4, tags: ['junkyard', 'beginner'],
  },
  {
    id: 5, slug: 'electric-vehicle-parts-from-salvage',
    title: 'Are EV Parts Available at Salvage Yards? The Surprising Answer',
    excerpt: 'As electric vehicles age, salvage yards are seeing more EVs. We explore what\'s available and the safety considerations.',
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80',
    category_name: 'News', is_featured: false, author: 'Mike Torres',
    published_at: '2026-03-29T00:00:00Z', reading_time: 7, tags: ['ev', 'news'],
  },
  {
    id: 6, slug: 'how-to-check-used-car-parts-quality',
    title: 'How to Inspect Used Car Parts for Quality Before You Buy',
    excerpt: 'Don\'t get burned buying a bad used part. Our quality checklist will save you from costly mistakes.',
    image_url: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&q=80',
    category_name: 'Maintenance', is_featured: false, author: 'JYNM Editorial',
    published_at: '2026-03-25T00:00:00Z', reading_time: 5, tags: ['quality', 'inspection'],
  },
];

const SAMPLE_CATEGORIES = [
  { id: 1, slug: 'maintenance', name: 'Maintenance', post_count: 2 },
  { id: 2, slug: 'buying-guide', name: 'Buying Guide', post_count: 1 },
  { id: 3, slug: 'diy', name: 'DIY', post_count: 1 },
  { id: 4, slug: 'news', name: 'News', post_count: 1 },
  { id: 5, slug: 'tips-tricks', name: 'Tips & Tricks', post_count: 1 },
];

export default function BlogList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { get } = useCMS('blog');
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [usingSampleData, setUsingSampleData] = useState(false);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const activeCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage };
      if (activeCategory) params.category = activeCategory;
      if (searchQuery) params.search = searchQuery;
      
      const [postsData, catData] = await Promise.all([
        blogApi.getPosts(params),
        blogApi.getCategories(),
      ]);
      
      const results = postsData.results || postsData;
      setPosts(Array.isArray(results) ? results : []);
      setTotalCount(postsData.count || results.length);
      setTotalPages(postsData.total_pages || Math.ceil((postsData.count || results.length) / 9));
      setCategories(Array.isArray(catData) ? catData : catData.results || []);
      setUsingSampleData(false);

      if (currentPage === 1 && !activeCategory && !searchQuery) {
        try {
          const featured = await blogApi.getFeaturedPosts();
          setFeaturedPosts(Array.isArray(featured) ? featured : []);
        } catch {
          setFeaturedPosts(SAMPLE_POSTS.filter(p => p.is_featured).slice(0, 2));
        }
      } else {
        setFeaturedPosts([]);
      }
    } catch {
      setUsingSampleData(true);
      let filtered = [...SAMPLE_POSTS];
      if (activeCategory) filtered = filtered.filter(p => p.category_name?.toLowerCase().replace(/\s+/g, '-') === activeCategory);
      if (searchQuery) filtered = filtered.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
      setPosts(filtered);
      setTotalCount(filtered.length);
      setTotalPages(1);
      setCategories(SAMPLE_CATEGORIES);
      setFeaturedPosts(currentPage === 1 && !activeCategory && !searchQuery ? SAMPLE_POSTS.filter(p => p.is_featured) : []);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeCategory, searchQuery]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-inter">
      <SEO
        title={get('meta', 'title', 'Blog — Junkyard Near Me | Auto Parts Tips & Guides')}
        description={get('meta', 'description', 'Expert guides on buying used auto parts, DIY repairs, salvage yard tips, and industry news. Save money on your next repair with JYNM.')}
        canonicalUrl="/blog"
      />
      <Navbar />

      {/* Clean Light Hero */}
      <div className="pt-32 pb-20 overflow-hidden relative border-b border-slate-100 bg-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-50/80 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-orange-50/80 rounded-full blur-[60px] pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 text-center text-slate-900">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 bg-slate-50 border border-slate-200">
            <span className="text-blue-600 text-xs font-bold uppercase tracking-wider">Automotive Knowledge Base</span>
          </div>
          <h1 className="font-black mb-6 text-5xl md:text-6xl" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
            {get('hero', 'heading', 'The Junkyard')} <br className="md:hidden" />
            <span className="text-blue-600">
              {get('hero', 'heading_accent', 'Journal')}
            </span>
          </h1>
          <p className="leading-relaxed text-lg max-w-2xl mx-auto text-slate-600 font-medium">
            {get('hero', 'subheading', 'Expert guides on pulling parts, salvaging tips, and the latest news from the used auto parts industry.')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Featured Overlay Card (Top Full Width if present) */}
        {featuredPosts.length > 0 && !loading && currentPage === 1 && !activeCategory && !searchQuery && (
          <section className="mb-16">
            <h2 className="text-2xl font-black text-slate-900 mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>Editor's Picks</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {featuredPosts.map((post, idx) => (
                <Link 
                    to={`/blog/${post.slug}`} 
                    key={post.id} 
                    className={`group relative overflow-hidden rounded-3xl ${idx === 0 ? 'lg:col-span-2 aspect-[21/9] md:aspect-[21/7]' : 'aspect-video'} bg-slate-900 shadow-xl transition-all duration-300 hover:shadow-blue-900/20 hover:-translate-y-1 block`}
                >
                    <img 
                      src={post.image_url || post.thumbnail_url || post.cover_image_url} 
                      alt={post.title} 
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 flex flex-col justify-end p-8 md:p-12">
                        {post.category_name && (
                            <span className="self-start px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md mb-4 uppercase tracking-widest">
                                {post.category_name}
                            </span>
                        )}
                        <h3 className={`font-black text-white leading-tight ${idx === 0 ? 'text-3xl md:text-5xl' : 'text-2xl'} mb-4`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {post.title}
                        </h3>
                        {post.excerpt && idx === 0 && (
                            <p className="text-slate-300 text-lg md:text-xl font-medium max-w-3xl line-clamp-2 md:line-clamp-none">
                                {post.excerpt}
                            </p>
                        )}
                    </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 2/3 and 1/3 Split Layout Main Container */}
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
          
          {/* Left Column (2/3): Articles Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
                <h2 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {activeCategory ? `Category: ${categories.find(c => c.slug === activeCategory)?.name || activeCategory}` : 'Latest Articles'}
                </h2>
                <span className="text-slate-500 font-bold text-sm bg-slate-100 px-3 py-1 rounded-lg">
                    {usingSampleData ? SAMPLE_POSTS.length : totalCount} Posts
                </span>
            </div>
            
            {loading ? (
              <div className="grid md:grid-cols-2 gap-8">
                {Array.from({ length: 4 }).map((_, i) => <BlogSkeletonCard key={i} />)}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                <p className="text-5xl mb-4">📭</p>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No articles found</h3>
                <p className="text-slate-500 mb-6 font-medium">Try adjusting your filters or search query.</p>
                <button onClick={() => setSearchParams({})} className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  View All Articles
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {posts.map(post => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}

            {/* Pagination inside 2/3 column */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 pt-8 border-t border-slate-200">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => updateFilter('page', String(currentPage - 1))}
                  className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Back
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(pg => (
                  <button
                    key={pg}
                    onClick={() => updateFilter('page', String(pg))}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${pg === currentPage ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => updateFilter('page', String(currentPage + 1))}
                  className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </div>

          {/* Right Column (1/3): Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Search Widget */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                <h3 className="font-black text-slate-900 text-lg mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Search</h3>
                <form onSubmit={e => { e.preventDefault(); updateFilter('search', e.target.search.value); }} className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                        name="search"
                        defaultValue={searchQuery}
                        placeholder="Search posts..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
                    />
                </form>
                {searchQuery && (
                    <button onClick={() => updateFilter('search', '')} className="mt-3 text-sm text-blue-600 font-bold hover:underline">
                        Clear Search
                    </button>
                )}
            </div>

            {/* Categories Widget */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                <h3 className="font-black text-slate-900 text-lg mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Categories</h3>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => updateFilter('category', '')}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        !activeCategory ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100 hover:text-slate-900'
                        }`}
                    >
                        <span>All Categories</span>
                        <span className="bg-white px-2 py-0.5 rounded-lg text-xs border border-slate-200 shadow-sm">{usingSampleData ? SAMPLE_POSTS.length : totalCount}</span>
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => updateFilter('category', cat.slug)}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeCategory === cat.slug ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            <span>{cat.name}</span>
                            {cat.post_count !== undefined && (
                                <span className={`px-2 py-0.5 rounded-lg text-xs shadow-sm ${activeCategory === cat.slug ? 'bg-white border text-blue-600 border-blue-100' : 'bg-white border text-slate-500 border-slate-200'}`}>{cat.post_count}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Newsletter Side Widget */}
            <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-orange-100">
                    <span className="text-xl">📩</span>
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Weekly Updates</h3>
                <p className="text-slate-600 text-sm font-medium mb-4">Get the best DIY guides and parts deals sent to your inbox.</p>
                <form onSubmit={e => e.preventDefault()} className="space-y-2">
                    <input type="email" placeholder="Email address" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-blue-500 text-center" />
                    <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Subscribe</button>
                </form>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
