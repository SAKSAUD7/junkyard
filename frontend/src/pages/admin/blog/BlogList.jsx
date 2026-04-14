import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { blogApi } from '../../../services/blogApi';

const STATUS_BADGE = {
  published: 'bg-green-100 text-green-700 border-green-200',
  draft: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminBlogList() {
  const navigate = useNavigate();
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
      showToast('Post deleted successfully.');
      fetchPosts();
    } catch {
      showToast('Failed to delete post.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePublish = async (post) => {
    setActionLoading(post.id);
    try {
      if (post.status === 'published') {
        await blogApi.adminDraftPost(post.id);
        showToast(`"${post.title}" set to draft.`);
      } else {
        await blogApi.adminPublishPost(post.id);
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
      await blogApi.adminFeaturePost(post.id);
      showToast(`Featured ${post.is_featured ? 'removed' : 'added'}.`);
      fetchPosts();
    } catch {
      showToast('Failed to update featured status.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg font-semibold text-sm animate-fade-in ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Blog Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Create, edit, publish and manage blog posts</p>
        </div>
        <Link
          to="/admin-portal/blog/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Post
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total', value: stats.total, icon: '📝' },
            { label: 'Published', value: stats.published, icon: '✅' },
            { label: 'Draft', value: stats.draft, icon: '📋' },
            { label: 'Featured', value: stats.featured, icon: '⭐' },
            { label: 'Total Views', value: stats.total_views?.toLocaleString(), icon: '👁' },
            { label: 'Total Likes', value: stats.total_likes?.toLocaleString(), icon: '❤️' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-black text-slate-900">{s.value ?? 0}</div>
              <div className="text-xs text-slate-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {['', 'published', 'draft'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200'}`}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Post Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-slate-500 font-semibold mb-4">No posts found</p>
            <Link to="/admin-portal/blog/new" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              Create First Post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Post</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Featured</th>
                  <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Views</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {posts.map(post => (
                  <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {post.image_url ? (
                          <img src={post.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate max-w-xs">{post.title}</p>
                          <p className="text-xs text-slate-400 truncate max-w-xs">/blog/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-600 text-xs">{post.category_name || '—'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        disabled={actionLoading === post.id}
                        onClick={() => handleTogglePublish(post)}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all hover:opacity-80 ${STATUS_BADGE[post.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}
                      >
                        {actionLoading === post.id ? '...' : post.status}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(post)}
                        disabled={actionLoading === `feat-${post.id}`}
                        className={`text-lg hover:scale-110 transition-transform ${post.is_featured ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
                        title={post.is_featured ? 'Remove featured' : 'Mark as featured'}
                      >
                        ⭐
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-slate-600 font-medium">{post.views_count?.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-500 text-xs">{formatDate(post.published_at || post.created_at)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"
                          title="Preview"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </Link>
                        <Link
                          to={`/admin-portal/blog/edit/${post.id}`}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={actionLoading === post.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
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
