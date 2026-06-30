import { Link } from 'react-router-dom';
import { SparklesIcon, FireIcon } from '@heroicons/react/24/solid';

const categoryColors = {
  'Maintenance': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Buying Guide': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'DIY': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'News': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Tips & Tricks': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
};

const defaultColors = { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BlogCard({ post, featured = false }) {
  const colors = categoryColors[post.category_name] || defaultColors;

  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        featured
          ? 'bg-white shadow-md border border-slate-100'
          : 'bg-white shadow-sm border border-slate-100 hover:border-blue-100'
      }`}
    >
      {/* Thumbnail */}
      <div className={`relative overflow-hidden ${featured ? 'h-52' : 'h-48'} bg-slate-100`}>
        {post.thumbnail_url || post.cover_image_url ? (
          <img
            src={post.thumbnail_url || post.cover_image_url}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-300 font-bold">
            JYNM KB
          </div>
        )}

        <div className="absolute top-3 left-3 flex gap-2">
            {post.is_featured && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-yellow-400 text-yellow-900 shadow-sm backdrop-blur-md">
                    <SparklesIcon className="w-3 h-3" /> Featured
                </div>
            )}
            {post.is_trending && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white shadow-sm backdrop-blur-md">
                    <FireIcon className="w-3 h-3" /> Trending
                </div>
            )}
        </div>

        {/* Reading time */}
        {post.reading_time && (
          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-slate-900/60 text-white backdrop-blur-md border border-white/10">
            {post.reading_time} min read
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Category */}
        <div className="flex items-center gap-2">
            {post.category_name && (
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${colors.bg} ${colors.text} ${colors.border}`}>
                {post.category_name}
            </span>
            )}
            {post.is_editors_pick && (
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                    👑 Editor's Pick
                </span>
            )}
        </div>

        {/* Title */}
        <h3 className={`font-black leading-snug text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 ${featured ? 'text-xl' : 'text-[17px]'}`}
          style={{ fontFamily: "'Outfit', sans-serif" }}>
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-2 flex-1 font-medium">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags_info && post.tags_info.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {post.tags_info.slice(0, 3).map(tag => (
              <span key={tag.id} className="text-xs font-semibold text-slate-400 hover:text-slate-600">
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Footer: author + date */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 text-[10px] font-black flex-shrink-0">
              {post.author_info?.name?.charAt(0).toUpperCase() || 'J'}
            </div>
            <span className="text-xs font-bold text-slate-700 truncate max-w-[100px]">{post.author_info?.name || 'System'}</span>
          </div>
          <span className="text-xs font-medium text-slate-400">{formatDate(post.published_at || post.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
