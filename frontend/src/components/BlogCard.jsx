import { Link } from 'react-router-dom';

const categoryColors = {
  'Maintenance': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Buying Guide': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'DIY': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
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
        {post.image_url ? (
          <img
            src={post.image_url}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Featured badge */}
        {post.is_featured && (
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500 text-white">
            ⭐ Featured
          </div>
        )}

        {/* Reading time */}
        {post.reading_time && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold bg-black/50 text-white backdrop-blur-sm">
            {post.reading_time} min read
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Category */}
        {post.category_name && (
          <span className={`self-start px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
            {post.category_name}
          </span>
        )}

        {/* Title */}
        <h3 className={`font-black leading-snug text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 ${featured ? 'text-xl' : 'text-base'}`}
          style={{ fontFamily: "'Outfit', sans-serif" }}>
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 flex-1">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: author + date */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {post.author?.[0]?.toUpperCase() || 'J'}
            </div>
            <span className="text-xs font-semibold text-slate-600 truncate max-w-[100px]">{post.author || 'JYNM Editorial'}</span>
          </div>
          <span className="text-xs text-slate-400">{formatDate(post.published_at || post.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
