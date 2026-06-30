import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import BlogCard from '../../components/BlogCard';
import { blogApi } from '../../services/blogApi';
import { 
    ClockIcon, 
    EyeIcon, 
    CalendarIcon, 
    ShareIcon, 
    HeartIcon as HeartIconOutline 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, CheckCircleIcon } from '@heroicons/react/24/solid';

const SAMPLE_POST = {
  id: 1,
  slug: 'how-to-find-cheap-engine-replacements',
  title: 'How to Find Cheap Engine Replacements at Your Local Junkyard',
  excerpt: 'Discover pro tips for sourcing a quality used engine from salvage yards near you — saving thousands over dealer prices.',
  blocks: [
      { id: '1', type: 'heading', level: 'h2', text: 'Why Buy a Used Engine?' },
      { id: '2', type: 'paragraph', text: 'Replacing a car engine can cost anywhere from $3,000 to $10,000 at a dealership. Used engines from salvage yards typically run between $200 and $2,000 — saving you 60–90%. When sourced correctly, used engines are completely reliable for tens of thousands of miles.' },
      { id: '3', type: 'heading', level: 'h2', text: 'Step 1: Know What Engine You Need' },
      { id: '4', type: 'paragraph', text: 'Before visiting a junkyard, you must know your car\'s requirements.' },
      { id: '5', type: 'list', style: 'bullet', items: ['Year, Make, Model, and Trim (e.g., 2015 Honda Accord EX-L)', 'Engine code (found on the door jamb sticker or VIN decoder)', 'Mileage requirements — aim for under 100,000 miles for best reliability'] },
      { id: '6', type: 'cta', title: 'Search Our Nationwide Network', description: 'Use the JYNM Browse Tool to search junkyards in your state.', buttonText: 'Browse Now', buttonLink: '/browse' },
  ],
  cover_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
  category: { name: 'Buying Guide', slug: 'buying-guide' },
  author_info: { name: 'JYNM Editorial', designation: 'Automotive Experts' },
  tags_info: [{ id: 1, name: 'engine', slug: 'engine' }, { id: 2, name: 'tips', slug: 'tips' }],
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
    thumbnail_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
    category_name: 'Maintenance', author_info: { name: 'Jake Morris' }, published_at: '2026-04-08T00:00:00Z', reading_time: 8,
  },
  {
    id: 3, slug: 'diy-transmission-swap-guide',
    title: 'DIY Transmission Swap: A Step-by-Step Guide for Beginners',
    excerpt: 'Swapping a transmission doesn\'t have to be intimidating.',
    thumbnail_url: 'https://images.unsplash.com/photo-1617813374374-ea4aa0d37ead?w=800&q=80',
    category_name: 'DIY', author_info: { name: 'Sarah Chen' }, published_at: '2026-04-05T00:00:00Z', reading_time: 12,
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
        
        // Use the prefetched related_posts if available, otherwise fetch
        if (data.related_posts_info && data.related_posts_info.length > 0) {
            setRelated(data.related_posts_info);
        } else {
            try {
                const rel = await blogApi.getRelatedPosts({ exclude: slug, category: data.category?.slug });
                setRelated(Array.isArray(rel) ? rel.slice(0, 3) : []);
            } catch {
                setRelated(SAMPLE_RELATED);
            }
        }
      } catch {
        // Use sample data on error (for demo purposes)
        setPost(slug === SAMPLE_POST.slug ? SAMPLE_POST : { ...SAMPLE_POST, slug, title: \`Article: \${slug}\` });
        setLikesCount(SAMPLE_POST.likes_count);
        setRelated(SAMPLE_RELATED);
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
      <div className="bg-slate-50 min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-32 animate-pulse">
          <div className="h-4 w-32 bg-slate-200 rounded-full mb-8" />
          <div className="h-12 bg-slate-200 rounded-2xl mb-4 w-3/4" />
          <div className="h-6 bg-slate-200 rounded-xl mb-8 w-1/2" />
          <div className="h-96 bg-slate-200 rounded-3xl mb-12" />
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className={`h-4 bg-slate-100 rounded-full mb-4 ${i % 3 === 2 ? 'w-4/5' : 'w-full'}`} />)}
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="bg-white min-h-screen font-inter">
      <SEO
        title={post.seo_title || post.meta_title || post.title}
        description={post.seo_description || post.meta_description || post.excerpt}
        canonicalUrl={post.canonical_url || `/blog/${post.slug}`}
        ogImage={post.og_image_url || post.cover_image_url}
      />
      <Navbar />

      {/* ── CLEAN WHITE HERO ── */}
      <div className="pt-32 pb-16 max-w-5xl mx-auto px-6 text-center border-b border-slate-100">
          <div className="inline-flex items-center gap-2 mb-6 text-sm font-bold">
            <Link to="/blog" className="text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Knowledge Center</Link>
            {post.category && (
                <>
                    <span className="text-slate-300">/</span>
                    <Link to={`/blog?category=${post.category.slug}`} className="text-blue-600 hover:text-blue-700 uppercase tracking-widest">{post.category.name}</Link>
                </>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {post.title}
          </h1>

          <p className="text-xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed mb-10">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-slate-500">
            <span className="flex items-center gap-2">
              <img src="https://ui-avatars.com/api/?name=JYNM+Team&background=e0e7ff&color=4f46e5" alt="Author" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
              <span className="text-slate-900">{post.author_info?.name || 'JYNM Editorial'}</span>
            </span>
            <span className="flex items-center gap-1.5"><CalendarIcon className="w-5 h-5 text-slate-400" /> {formatDate(post.published_at || post.created_at)}</span>
            <span className="flex items-center gap-1.5"><ClockIcon className="w-5 h-5 text-slate-400" /> {post.reading_time} min read</span>
          </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Cover Image */}
        {post.cover_image_url && (
            <div className="mb-16 -mx-4 sm:mx-0">
                <img src={post.cover_image_url} alt={post.title} className="w-full h-auto sm:rounded-3xl shadow-2xl shadow-slate-200/50 object-cover max-h-[600px]" />
            </div>
        )}

        <div className="grid lg:grid-cols-[1fr_240px] gap-12 lg:gap-16">
          {/* Main content */}
          <div>
            {/* Block Renderer */}
            <article className="prose prose-lg prose-slate max-w-none prose-headings:font-black prose-headings:font-['Outfit'] prose-p:leading-loose prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl">
                {post.blocks && post.blocks.length > 0 ? (
                    post.blocks.map(b => (
                        <div key={b.id} className="mb-8 group">
                            {b.type === 'heading' && React.createElement(b.level, { className: 'mt-12 mb-6 text-slate-900 tracking-tight' }, b.text)}
                            {b.type === 'paragraph' && <p className="text-slate-700">{b.text}</p>}
                            {b.type === 'image' && (
                                <figure className="my-10">
                                    <img src={b.url} alt={b.alt} className="w-full shadow-lg shadow-slate-100 border border-slate-100" />
                                    {b.caption && <figcaption className="text-center text-sm font-medium text-slate-400 mt-3">{b.caption}</figcaption>}
                                </figure>
                            )}
                            {b.type === 'list' && (
                                b.style === 'number' 
                                    ? <ol className="pl-6 space-y-3 marker:text-blue-600 marker:font-bold">{b.items.map((i, idx) => <li key={idx} className="text-slate-700 pl-2">{i}</li>)}</ol>
                                    : <ul className="pl-6 space-y-3 marker:text-blue-400">{b.items.map((i, idx) => <li key={idx} className="text-slate-700 pl-2">{i}</li>)}</ul>
                            )}
                            {b.type === 'cta' && (
                                <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl p-10 text-center text-white my-12 shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-[80px] pointer-events-none"></div>
                                    <h3 className="text-3xl font-black mb-4 text-white font-['Outfit'] relative z-10">{b.title}</h3>
                                    <p className="text-blue-100/80 mb-8 text-lg font-medium relative z-10">{b.description}</p>
                                    {b.buttonText && b.buttonLink && (
                                        <Link to={b.buttonLink} className="inline-block bg-white text-slate-900 font-bold px-8 py-3.5 rounded-xl hover:scale-105 transition-transform relative z-10 shadow-lg shadow-black/10">
                                            {b.buttonText}
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: post.content || '<p>No content available.</p>' }} />
                )}
            </article>

            {/* Tags */}
            {post.tags_info?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-slate-100">
                <span className="text-sm font-bold text-slate-400 mr-2 py-1">Tags:</span>
                {post.tags_info.map(tag => (
                  <Link
                    key={tag.id}
                    to={`/blog?tag=${tag.slug}`}
                    className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Engagement Bar */}
            <div className="flex items-center justify-between mt-12 p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-sm transition-all flex-1 justify-center ${liked ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
              >
                {liked ? <HeartIconSolid className="w-5 h-5 text-rose-500" /> : <HeartIconOutline className="w-5 h-5" />}
                {liked ? 'Liked!' : 'Helpful?'} <span className="opacity-50">({likesCount})</span>
              </button>
              
              <div className="w-[1px] h-10 bg-slate-200 mx-2"></div>
              
              <div className="flex items-center justify-center flex-1 gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Share</span>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-[#1da1f2] hover:text-white hover:border-transparent transition-all shadow-sm">
                  <span className="font-bold text-sm">𝕏</span>
                </a>
                <button onClick={() => navigator.clipboard?.writeText(shareUrl)}
                  className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white hover:border-transparent transition-all shadow-sm">
                  <ShareIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Author Block Bottom */}
            <div className="mt-12 p-8 bg-blue-50/50 rounded-3xl border border-blue-100 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                <img src="https://ui-avatars.com/api/?name=JYNM+Team&background=e0e7ff&color=4f46e5&size=128" alt="Author" className="w-20 h-20 rounded-2xl shadow-sm bg-white" />
                <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1 block">Written By</span>
                    <h4 className="text-xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {post.author_info?.name || 'JYNM Editorial Team'}
                    </h4>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                        {post.author_info?.designation || 'Automotive knowledge experts dedicated to helping you save money on auto parts, repairs, and salvage yard navigation.'}
                    </p>
                </div>
            </div>

            {/* Comments Section */}
            {post.allow_comments !== false && (
                <div className="mt-16 pt-16 border-t border-slate-100">
                <h3 className="text-2xl font-black text-slate-900 mb-8" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Discussion {post.comments?.length > 0 ? `(${post.comments.length})` : ''}
                </h3>
                
                <form onSubmit={handleCommentSubmit} className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100 space-y-5 mb-12">
                    <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2">Leave a Reply</h4>
                    <div className="grid md:grid-cols-2 gap-5">
                    <input required value={commentForm.name} onChange={e => setCommentForm({...commentForm, name: e.target.value})} placeholder="Your Name" className="w-full px-5 py-3.5 rounded-xl border-none shadow-sm text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
                    <input required type="email" value={commentForm.email} onChange={e => setCommentForm({...commentForm, email: e.target.value})} placeholder="Email Address" className="w-full px-5 py-3.5 rounded-xl border-none shadow-sm text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
                    </div>
                    <textarea required value={commentForm.content} onChange={e => setCommentForm({...commentForm, content: e.target.value})} rows={4} placeholder="What are your thoughts?" className="w-full px-5 py-4 rounded-xl border-none shadow-sm text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium" />
                    
                    <button type="submit" disabled={commentStatus === 'submitting'} className="px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 transition-colors shadow-lg shadow-slate-900/10">
                    {commentStatus === 'submitting' ? 'Posting...' : 'Post Reply'}
                    </button>
                    
                    {commentStatus === 'success' && <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100"><CheckCircleIcon className="w-5 h-5"/> Reply submitted and awaiting moderation.</div>}
                    {commentStatus === 'error' && <p className="text-red-600 text-sm font-bold">⚠️ Failed to submit. Please try again.</p>}
                </form>

                {post.comments?.length > 0 && (
                    <div className="space-y-6">
                    {post.comments.map(c => (
                        <div key={c.id} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold flex-shrink-0">
                                {c.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 bg-white p-6 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                                    <span className="text-slate-400 text-xs font-medium">{formatDate(c.created_at)}</span>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">{c.content}</p>
                            </div>
                        </div>
                    ))}
                    </div>
                )}
                </div>
            )}
          </div>

          {/* Sticky Sidebar */}
          <aside className="hidden lg:block relative">
            <div className="sticky top-32 space-y-8">
                {/* TOC / Quick Links simulated */}
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-4">In this article</h4>
                    <ul className="space-y-3 text-sm font-medium text-slate-500">
                        {post.blocks?.filter(b => b.type === 'heading').map((h, i) => (
                            <li key={i} className="hover:text-blue-600 cursor-pointer transition-colors line-clamp-1">{h.text}</li>
                        )) || <li>No sections</li>}
                    </ul>
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-between px-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><EyeIcon className="w-4 h-4"/> {post.views_count?.toLocaleString()}</span>
                    <span className="flex items-center gap-1.5"><HeartIconSolid className="w-4 h-4"/> {likesCount}</span>
                </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── RELATED POSTS ── */}
      {related.length > 0 && (
        <section className="bg-slate-50 py-24 border-t border-slate-100 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Keep Reading
                    </h2>
                    <p className="text-slate-500 font-medium">More expert guides and tips you might like.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {related.map(p => <BlogCard key={p.id} post={p} />)}
                </div>
            </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
