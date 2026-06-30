import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { blogApi } from '../../../services/blogApi';
import { 
    BookOpenIcon, 
    CheckCircleIcon, 
    PencilSquareIcon, 
    StarIcon, 
    EyeIcon, 
    CalendarIcon 
} from '@heroicons/react/24/outline';

const STATUS_BADGE = {
  published: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  draft: 'bg-amber-100 text-amber-700 border-amber-200',
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  archived: 'bg-slate-100 text-slate-700 border-slate-200',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminBlogList() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const [data, statsData] = await Promise.all([
        blogApi.adminGetPosts(params),
        blogApi.adminGetStats(),
      ]);
      setPosts(Array.isArray(data) ? data : (data.results || []));
      setStats(statsData);
    } catch (err) {
      showToast('Failed to load posts. Check backend connection.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setActionLoading(id);
    try {
      await blogApi.adminDeletePost(id);
      showToast('Article deleted successfully.');
      fetchPosts();
    } catch {
      showToast('Failed to delete article.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePublish = async (post) => {
    setActionLoading(post.id);
    try {
      if (post.status === 'published') {
        await blogApi.adminUpdatePostStatus(post.id, 'draft');
        showToast(`"${post.title}" set to draft.`);
      } else {
        await blogApi.adminUpdatePostStatus(post.id, 'published');
        showToast(`"${post.title}" published!`);
      }
      fetchPosts();
    } catch {
      showToast('Status change failed.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (post) => {
    setActionLoading(`feat-${post.id}`);
    try {
      // Assuming we patch the is_featured boolean
      await blogApi.adminUpdatePost(post.id, { is_featured: !post.is_featured });
      showToast(`Featured ${post.is_featured ? 'removed' : 'added'}.`);
      fetchPosts();
    } catch {
      showToast('Failed to update featured status.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg shadow-black/10 font-bold text-sm animate-fade-in flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Knowledge Center
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage articles, guides, and resources.</p>
        </div>
        <Link
          to="/admin-portal/blog/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition shadow-[0_8px_20px_rgb(37,99,235,0.25)]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Article
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Articles', value: stats.total, icon: <BookOpenIcon className="w-6 h-6 text-indigo-500" /> },
            { label: 'Published', value: stats.published, icon: <CheckCircleIcon className="w-6 h-6 text-emerald-500" /> },
            { label: 'Drafts', value: stats.draft, icon: <PencilSquareIcon className="w-6 h-6 text-amber-500" /> },
            { label: 'Scheduled', value: stats.scheduled, icon: <CalendarIcon className="w-6 h-6 text-blue-500" /> },
            { label: 'Featured', value: stats.featured, icon: <StarIcon className="w-6 h-6 text-yellow-500" /> },
            { label: 'Total Views', value: stats.total_views?.toLocaleString(), icon: <EyeIcon className="w-6 h-6 text-sky-500" /> },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-slate-50 rounded-xl">{s.icon}</div>
                <span className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>{s.value ?? 0}</span>
              </div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles by title, excerpt, or author..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border-none bg-slate-50/50 text-sm font-medium text-slate-900 outline-none focus:bg-slate-50 focus:ring-0 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-50/50 p-1 rounded-xl">
          {['', 'published', 'draft', 'scheduled', 'archived'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === s ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'}`}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Article Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
            <span className="font-semibold text-sm">Loading Knowledge Base...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-24 text-center px-4">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpenIcon className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Articles Found</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">
              Start building your knowledge center by creating your first article, guide, or tutorial.
            </p>
            <Link to="/admin-portal/blog/new" className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors inline-block shadow-[0_8px_20px_rgb(37,99,235,0.25)]">
              Create First Article
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Article Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Featured</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {posts.map(post => (
                  <tr key={post.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-4">
                        {post.thumbnail_url ? (
                          <img src={post.thumbnail_url} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-slate-100 shadow-sm" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
                             <BookOpenIcon className="w-6 h-6 text-slate-300" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-base leading-snug max-w-sm truncate">{post.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                {post.category_name || 'Uncategorized'}
                            </span>
                            <span className="text-xs text-slate-400 truncate max-w-[200px]">
                                {post.author_name || 'System'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <button
                        disabled={actionLoading === post.id}
                        onClick={() => handleTogglePublish(post)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-widest border transition-all hover:scale-105 ${STATUS_BADGE[post.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}
                      >
                        {actionLoading === post.id ? '...' : post.status}
                      </button>
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <button
                        onClick={() => handleToggleFeatured(post)}
                        disabled={actionLoading === `feat-${post.id}`}
                        className={`p-2 rounded-xl transition-all ${post.is_featured ? 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'}`}
                        title={post.is_featured ? 'Remove featured' : 'Mark as featured'}
                      >
                        <StarIcon className={`w-5 h-5 ${post.is_featured ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                    <td className="px-6 py-5 text-right align-middle">
                      <span className="text-slate-900 font-bold bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{post.views_count?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <div className="flex flex-col">
                        <span className="text-slate-700 font-medium text-sm">{formatDate(post.published_at || post.created_at)}</span>
                        <span className="text-xs text-slate-400">{post.published_at ? 'Published' : 'Created'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-2 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
                          title="Preview"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </Link>
                        <Link
                          to={`/admin-portal/blog/edit/${post.id}`}
                          className="p-2 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={actionLoading === post.id}
                          className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
