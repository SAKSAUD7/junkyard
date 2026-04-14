import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import BlogCard from '../../components/BlogCard';
import { blogApi } from '../../services/blogApi';

const SAMPLE_POST = {
  id: 1,
  slug: 'how-to-find-cheap-engine-replacements',
  title: 'How to Find Cheap Engine Replacements at Your Local Junkyard',
  excerpt: 'Discover pro tips for sourcing a quality used engine from salvage yards near you — saving thousands over dealer prices.',
  content: `
    <h2>Why Buy a Used Engine?</h2>
    <p>Replacing a car engine can cost anywhere from $3,000 to $10,000 at a dealership. Used engines from salvage yards typically run between $200 and $2,000 — <strong>saving you 60–90%</strong>. When sourced correctly, used engines are completely reliable for tens of thousands of miles.</p>
    
    <h2>Step 1: Know What Engine You Need</h2>
    <p>Before visiting a junkyard, you must know your car's:</p>
    <ul>
      <li><strong>Year, Make, Model, and Trim</strong> (e.g., 2015 Honda Accord EX-L)</li>
      <li><strong>Engine code</strong> (found on the door jamb sticker or VIN decoder)</li>
      <li><strong>Mileage requirements</strong> — aim for under 100,000 miles for best reliability</li>
    </ul>
    
    <h2>Step 2: Search Our Nationwide Network</h2>
    <p>Use the <a href="/browse">JYNM Browse Tool</a> to search junkyards in your state. Filter by location using your zip code and call ahead to confirm availability — inventory moves fast.</p>
    
    <h2>Step 3: Inspect the Engine Before Buying</h2>
    <p>Never buy a used engine without a proper inspection. Key things to check:</p>
    <ul>
      <li>Check for cracks in the engine block</li>
      <li>Pull the dipstick — milky oil means head gasket failure</li>
      <li>Look for rust or heavy corrosion</li>
      <li>Ask about the vehicle's history (accident damage?)</li>
      <li>Request a compression test if possible</li>
    </ul>
    
    <h2>Step 4: Negotiate the Price</h2>
    <p>Most junkyard prices are negotiable, especially if you're buying multiple parts. Research the going rate online first, then make a reasonable offer — most yards will meet you halfway.</p>
    
    <h2>Step 5: Arrange Transport Safely</h2>
    <p>Engines are heavy (300–600 lbs). Rent an engine hoist or hire a professional to load and transport it. Many junkyards offer delivery for a small fee — always worth asking.</p>
    
    <blockquote>
      <p>"The best engine we ever sourced came from a low-mileage accident car at a local junkyard — ran perfectly for another 80,000 miles." — JYNM Customer</p>
    </blockquote>
    
    <h2>Final Checklist</h2>
    <ul>
      <li>✅ Verify compatibility via VIN or engine code</li>
      <li>✅ Inspect physically before payment</li>
      <li>✅ Get a receipt with warranty terms (most offer 30–90 days)</li>
      <li>✅ Have a qualified mechanic install it</li>
    </ul>
  `,
  image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
  category: { name: 'Buying Guide', slug: 'buying-guide' },
  author: 'JYNM Editorial',
  tags: ['engine', 'junkyard', 'tips', 'buying guide'],
  is_featured: true,
  status: 'published',
  views_count: 2847,
  likes_count: 142,
  reading_time: 6,
  published_at: '2026-04-10T00:00:00Z',
  meta_title: 'How to Find Cheap Engine Replacements | JYNM Blog',
  meta_description: 'Step-by-step guide to sourcing quality used engines from junkyards. Save 60–90% vs dealer prices.',
  comments: [],
};

const SAMPLE_RELATED = [
  {
    id: 2, slug: 'top-10-auto-parts-you-should-buy-used',
    title: 'Top 10 Auto Parts You Should Always Buy Used',
    excerpt: 'Not all used auto parts are created equal. We break down exactly what to buy used.',
    image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
    category_name: 'Maintenance', author: 'Jake Morris', published_at: '2026-04-08T00:00:00Z', reading_time: 8,
  },
  {
    id: 3, slug: 'diy-transmission-swap-guide',
    title: 'DIY Transmission Swap: A Step-by-Step Guide for Beginners',
    excerpt: 'Swapping a transmission doesn\'t have to be intimidating.',
    image_url: 'https://images.unsplash.com/photo-1617813374374-ea4aa0d37ead?w=800&q=80',
    category_name: 'DIY', author: 'Sarah Chen', published_at: '2026-04-05T00:00:00Z', reading_time: 12,
  },
];

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', content: '' });
  const [commentStatus, setCommentStatus] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPost = async () => {
      setLoading(true);
      try {
        const data = await blogApi.getPost(slug);
        setPost(data);
        setLikesCount(data.likes_count || 0);
        // Related posts
        try {
          const rel = await blogApi.getRelatedPosts({ exclude: slug, category: data.category?.slug });
          setRelated(Array.isArray(rel) ? rel.slice(0, 3) : []);
        } catch {
          setRelated(SAMPLE_RELATED);
        }
      } catch {
        // Use sample data
        if (slug === SAMPLE_POST.slug) {
          setPost(SAMPLE_POST);
          setLikesCount(SAMPLE_POST.likes_count);
          setRelated(SAMPLE_RELATED);
        } else {
          // Show the sample post anyway for demo
          setPost({ ...SAMPLE_POST, slug });
          setLikesCount(SAMPLE_POST.likes_count);
          setRelated(SAMPLE_RELATED);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikesCount(c => c + 1);
    try { await blogApi.likePost(slug); } catch { /* offline graceful */ }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentStatus('submitting');
    try {
      await blogApi.submitComment(slug, commentForm);
      setCommentStatus('success');
      setCommentForm({ name: '', email: '', content: '' });
    } catch {
      setCommentStatus('error');
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (loading) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-24 animate-pulse">
          <div className="h-4 w-32 bg-slate-200 rounded mb-8" />
          <div className="h-10 bg-slate-200 rounded mb-4 w-3/4" />
          <div className="h-6 bg-slate-200 rounded mb-8 w-1/2" />
          <div className="h-80 bg-slate-200 rounded-2xl mb-10" />
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className={`h-4 bg-slate-100 rounded mb-3 ${i % 3 === 2 ? 'w-4/5' : 'w-full'}`} />)}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
        <Navbar />
        <div className="text-center py-32">
          <p className="text-6xl mb-4">📄</p>
          <h2 className="text-2xl font-bold text-slate-700 mb-4">Article Not Found</h2>
          <Link to="/blog" className="text-blue-600 font-semibold hover:underline">← Back to Blog</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <SEO
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        canonicalUrl={`/blog/${post.slug}`}
        ogImage={post.image_url}
      />
      <Navbar />

      {/* ── HERO BANNER ── */}
      <div className="relative w-full overflow-hidden" style={{ height: '420px', background: '#0f172a' }}>
        {post.image_url && (
          <img src={post.image_url} alt={post.title} className="absolute inset-0 w-full h-full object-cover opacity-50" />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.9) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>›</span>
            <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
            <span>›</span>
            {post.category && (
              <>
                <Link to={`/blog?category=${post.category.slug}`} className="hover:text-white transition-colors">{post.category.name}</Link>
                <span>›</span>
              </>
            )}
            <span className="text-slate-300 truncate max-w-xs">{post.title}</span>
          </nav>

          {post.category && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-4" style={{ background: '#2563eb' }}>
              {post.category.name}
            </span>
          )}

          <h1 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {post.title}
          </h1>
          <div className="flex items-center flex-wrap gap-4 text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {post.author?.[0]?.toUpperCase() || 'J'}
              </div>
              {post.author}
            </span>
            <span>•</span>
            <span>{formatDate(post.published_at || post.created_at)}</span>
            <span>•</span>
            <span>📖 {post.reading_time} min read</span>
            <span>•</span>
            <span>👁 {post.views_count?.toLocaleString()} views</span>
          </div>
        </div>
      </div>

      {/* ── CONTENT + SIDEBAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[1fr_320px] gap-12">
          {/* Main content */}
          <div>
            {/* Article body */}
            <article
              className="prose prose-slate max-w-none bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-100"
              style={{ lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {post.tags.map(tag => (
                  <Link
                    key={tag}
                    to={`/blog?search=${tag}`}
                    className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Like + Share bar */}
            <div className="flex items-center justify-between mt-8 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${liked ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'}`}
              >
                ❤️ {liked ? 'Liked!' : 'Like'} · {likesCount}
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-500">Share:</span>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#1da1f2] hover:text-white transition-all text-xs font-bold">𝕏</a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#1877f2] hover:text-white transition-all text-xs font-bold">f</a>
                <button onClick={() => navigator.clipboard?.writeText(shareUrl)}
                  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 10h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-12">
              <h3 className="text-xl font-black text-slate-900 mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                💬 Comments {post.comments?.length > 0 ? `(${post.comments.length})` : ''}
              </h3>
              {post.comments?.length > 0 && (
                <div className="space-y-4 mb-8">
                  {post.comments.map(c => (
                    <div key={c.id} className="p-5 bg-white rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                          {c.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800 text-sm">{c.name}</span>
                        <span className="text-slate-400 text-xs">• {formatDate(c.created_at)}</span>
                      </div>
                      <p className="text-slate-600 text-sm">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleCommentSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-900">Leave a Comment</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <input required value={commentForm.name} onChange={e => setCommentForm({...commentForm, name: e.target.value})} placeholder="Your Name *" className="px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  <input required type="email" value={commentForm.email} onChange={e => setCommentForm({...commentForm, email: e.target.value})} placeholder="Email address *" className="px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <textarea required value={commentForm.content} onChange={e => setCommentForm({...commentForm, content: e.target.value})} rows={4} placeholder="Write your comment..." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                <button type="submit" disabled={commentStatus === 'submitting'} className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors">
                  {commentStatus === 'submitting' ? 'Submitting...' : 'Post Comment'}
                </button>
                {commentStatus === 'success' && <p className="text-green-600 text-sm font-semibold">✅ Comment submitted! Awaiting approval.</p>}
                {commentStatus === 'error' && <p className="text-red-600 text-sm">⚠️ Failed to submit. Please try again.</p>}
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Author Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-black">
                  {post.author?.[0]?.toUpperCase() || 'J'}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{post.author}</p>
                  <p className="text-xs text-slate-500">JYNM Editorial Team</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Expert advice on used auto parts, salvage yards, and DIY car repair from the JYNM editorial team.</p>
            </div>

            {/* Quick Action */}
            <div className="rounded-2xl p-6 text-white text-center" style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)' }}>
              <p className="text-2xl mb-2">🔍</p>
              <h4 className="font-black mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Find Parts Near You</h4>
              <p className="text-blue-200 text-xs mb-4">Browse 1,000+ verified salvage yards nationwide.</p>
              <Link to="/browse" className="block w-full py-2.5 rounded-xl font-bold text-sm bg-white text-blue-600 hover:bg-blue-50 transition-colors text-center">
                Browse Junkyards →
              </Link>
            </div>

            {/* Article Stats */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-900 text-sm mb-4">Article Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5">👁 Views</span>
                  <span className="font-bold text-slate-800">{post.views_count?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5">❤️ Likes</span>
                  <span className="font-bold text-slate-800">{likesCount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5">📖 Read time</span>
                  <span className="font-bold text-slate-800">{post.reading_time} min</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5">📅 Published</span>
                  <span className="font-bold text-slate-800 text-xs">{formatDate(post.published_at)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── RELATED POSTS ── */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-black text-slate-900 mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map(p => <BlogCard key={p.id} post={p} />)}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
