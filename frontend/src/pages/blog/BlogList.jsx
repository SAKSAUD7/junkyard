import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import BlogCard from '../../components/BlogCard';
import BlogSkeletonCard from '../../components/BlogSkeletonCard';
import { blogApi } from '../../services/blogApi';

// ─── Sample data for when the backend isn't returning posts yet ────────────
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

      // Featured (only on page 1, no filters)
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
      // Fallback to sample data when backend is unavailable
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
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <SEO
        title="Blog — Junkyard Near Me | Auto Parts Tips & Guides"
        description="Expert guides on buying used auto parts, DIY repairs, salvage yard tips, and industry news. Save money on your next repair with JYNM."
        canonicalUrl="/blog"
      />
      <Navbar />

      {/* ── HERO ── */}
      <section className="hero-depth pt-24 pb-16 flex flex-col justify-center items-center text-center" style={{ minHeight: '40vh', background: 'var(--bg-base)' }}>
        <div className="hero-bg-primary" style={{ backgroundImage: "url('/heroes/muscle-car-garage-dark.png')", opacity: 0.65 }} />
        <div className="hero-overlay-base" />
        <div className="hero-vignette" />
        <div className="hero-glow-teal" />
        <div className="hero-glow-orange" />
        <div className="hero-grid" />
        <div className="hero-scanline" />
        <div className="hero-fade-bottom" />

        <div className="hero-content relative max-w-4xl mx-auto px-6 text-center z-10 w-full">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 border shadow-xl animate-fade-in" style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] animate-pulse" />
            <span className="text-white text-[0.75rem] font-bold tracking-[0.12em] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Automotive Knowledge Base
            </span>
          </div>
          
          <h1 className="animate-fade-in-up text-white" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em', marginBottom: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            The Junkyard <span className="text-blue-400">Journal</span>
          </h1>
          <p className="animate-fade-in-up delay-100 text-white/80" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.15rem)', maxWidth: '540px', margin: '0 auto 2.5rem', lineHeight: 1.7, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            Expert guides on pulling parts, salvaging tips, and the latest news from the used auto parts industry.
          </p>

          <form onSubmit={e => { e.preventDefault(); updateFilter('search', e.target.search.value); }} className="flex gap-2 max-w-xl mx-auto animate-fade-in-up delay-200">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                name="search"
                defaultValue={searchQuery}
                placeholder="Search articles, guides, parts..."
                className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm md:text-base outline-none transition-all shadow-lg text-white"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)' }}
                onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.15)'; e.target.style.borderColor = '#60a5fa'; }}
                onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              />
            </div>
            <button type="submit" className="px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 shadow-lg" style={{ background: '#2563eb' }}>
              Search
            </button>
          </form>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* ── FEATURED SECTION ── */}
        {featuredPosts.length >= 2 && !loading && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🔥</span>
              <h2 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Featured Articles</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPosts.slice(0, 2).map(post => (
                <BlogCard key={post.id} post={post} featured />
              ))}
            </div>
          </section>
        )}

        {/* ── FILTER ROW ── */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button
            onClick={() => updateFilter('category', '')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              !activeCategory ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-200 hover:text-blue-600'
            }`}
          >
            All Articles ({usingSampleData ? SAMPLE_POSTS.length : totalCount})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => updateFilter('category', cat.slug)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat.slug ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-200 hover:text-blue-600'
              }`}
            >
              {cat.name} {cat.post_count !== undefined ? `(${cat.post_count})` : ''}
            </button>
          ))}
          {(activeCategory || searchQuery) && (
            <button onClick={() => setSearchParams({})} className="px-4 py-2 rounded-full text-sm font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-all">
              ✕ Clear Filters
            </button>
          )}
        </div>

        {/* ── SEARCH RESULT NOTICE ── */}
        {searchQuery && (
          <p className="text-slate-600 mb-6 text-sm">
            Showing results for <strong>"{searchQuery}"</strong> — {totalCount} article{totalCount !== 1 ? 's' : ''} found
          </p>
        )}

        {/* ── GRID ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <BlogSkeletonCard key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📭</p>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No articles found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your filters or search query.</p>
            <button onClick={() => setSearchParams({})} className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              View All Articles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              disabled={currentPage <= 1}
              onClick={() => updateFilter('page', String(currentPage - 1))}
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ← Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(pg => (
              <button
                key={pg}
                onClick={() => updateFilter('page', String(pg))}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${pg === currentPage ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {pg}
              </button>
            ))}
            <button
              disabled={currentPage >= totalPages}
              onClick={() => updateFilter('page', String(currentPage + 1))}
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        )}

        {/* ── NEWSLETTER CTA ── */}
        {!loading && (
          <section className="mt-20 rounded-2xl p-10 text-center" style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', color: '#fff' }}>
            <h2 className="text-3xl font-black mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Stay in the Know</h2>
            <p className="text-blue-200 mb-6 max-w-lg mx-auto">Get the latest auto parts tips, guides, and savings dropped straight to your inbox.</p>
            <form className="flex gap-2 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-300" />
              <button type="submit" className="px-6 py-3 rounded-xl font-bold text-sm bg-white text-blue-600 hover:bg-blue-50 transition-colors">
                Subscribe
              </button>
            </form>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
