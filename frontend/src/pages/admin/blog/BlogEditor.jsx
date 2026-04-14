import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { blogApi } from '../../../services/blogApi';

const EMPTY_POST = {
  title: '', slug: '', excerpt: '', content: '', image_url: '',
  category: null, author: 'JYNM Editorial', tags: [], status: 'draft', is_featured: false,
  meta_title: '', meta_description: '',
};

export default function BlogEditor() {
  const { id } = useParams(); // undefined = create, exists = edit
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_POST);
  const [categories, setCategories] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'seo' | 'settings'
  const [previewMode, setPreviewMode] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const cats = await blogApi.adminGetCategories();
        setCategories(Array.isArray(cats) ? cats : (cats.results || []));
        if (isEdit) {
          const data = await blogApi.adminGetPost(id);
          setForm({
            ...EMPTY_POST,
            ...data,
            category: data.category?.id || data.category || null,
            tags: Array.isArray(data.tags) ? data.tags : [],
          });
        }
      } catch (err) {
        showToast('Failed to load editor data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEdit]);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      set('tags', [...form.tags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag) => set('tags', form.tags.filter(t => t !== tag));

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setAddingCat(true);
    try {
      const cat = await blogApi.adminCreateCategory({ name: newCatName.trim() });
      setCategories(prev => [...prev, cat]);
      set('category', cat.id);
      setNewCatName('');
      showToast('Category created!');
    } catch {
      showToast('Failed to create category.', 'error');
    } finally {
      setAddingCat(false);
    }
  };

  const handleSave = async (statusOverride = null) => {
    if (!form.title.trim()) { showToast('Title is required.', 'error'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        status: statusOverride || form.status,
        category: form.category || null,
        meta_title: form.meta_title || form.title,
      };
      if (isEdit) {
        await blogApi.adminUpdatePost(id, payload);
        showToast('Post updated successfully!');
      } else {
        const created = await blogApi.adminCreatePost(payload);
        showToast('Post created! Redirecting...');
        setTimeout(() => navigate(`/admin-portal/blog/edit/${created.id}`), 1500);
      }
    } catch (err) {
      showToast('Save failed. Check your connection and try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg font-semibold text-sm animate-fade-in ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/admin-portal/blog" className="text-slate-400 hover:text-slate-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <span className="font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {isEdit ? 'Edit Post' : 'New Post'}
          </span>
          {isEdit && (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${form.status === 'published' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
              {form.status}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreviewMode(!previewMode)} className="px-3 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            {previewMode ? '✏️ Edit' : '👁 Preview'}
          </button>
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : '💾 Save Draft'}
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving ? 'Publishing...' : form.status === 'published' ? '✅ Update' : '🚀 Publish'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {previewMode ? (
          /* ── PREVIEW MODE ── */
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-100">
            {form.image_url && (
              <img src={form.image_url} alt={form.title} className="w-full h-64 object-cover rounded-xl mb-6" />
            )}
            <h1 className="text-4xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {form.title || <span className="text-slate-300">No title yet...</span>}
            </h1>
            {form.excerpt && <p className="text-slate-500 text-lg mb-6 border-l-4 border-blue-500 pl-4">{form.excerpt}</p>}
            <article
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: form.content || '<p class="text-slate-300">No content yet...</p>' }}
            />
          </div>
        ) : (
          /* ── EDITOR MODE ── */
          <>
            {/* Title */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <input
                value={form.title}
                onChange={e => {
                  set('title', e.target.value);
                  // Auto-generate meta_title if it wasn't manually set
                  if (!form.meta_title || form.meta_title === form.title) {
                    set('meta_title', e.target.value);
                  }
                }}
                placeholder="Post title..."
                className="w-full text-2xl font-black text-slate-900 outline-none placeholder-slate-300 border-none bg-transparent"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              />
              {form.slug && (
                <p className="text-xs text-slate-400 mt-2">/blog/<strong>{form.slug}</strong></p>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-xl border border-slate-100 p-1 shadow-sm w-fit">
              {['content', 'seo', 'settings'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'content' && (
              <div className="space-y-4">
                {/* Excerpt */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Excerpt / Summary</label>
                  <textarea
                    value={form.excerpt}
                    onChange={e => set('excerpt', e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Short summary shown in blog cards (max 500 chars)..."
                    className="w-full text-slate-700 outline-none placeholder-slate-300 resize-none text-sm leading-relaxed"
                  />
                  <p className="text-xs text-slate-400 mt-1">{form.excerpt.length}/500</p>
                </div>

                {/* Thumbnail */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hero Image URL</label>
                  <input
                    value={form.image_url}
                    onChange={e => set('image_url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {form.image_url && (
                    <img src={form.image_url} alt="preview" className="mt-3 h-32 w-full object-cover rounded-xl" onError={e => e.target.style.display='none'} />
                  )}
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Content (HTML Supported)</label>
                    <div className="flex flex-wrap gap-1">
                      {['<h2>', '<h3>', '<p>', '<ul>', '<li>', '<strong>', '<blockquote>', '<a href="#">'].map(tag => (
                        <button
                          key={tag}
                          onClick={() => set('content', form.content + tag)}
                          className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={form.content}
                    onChange={e => set('content', e.target.value)}
                    rows={24}
                    placeholder="Write your blog content here... HTML is supported for rich formatting."
                    className="w-full px-6 py-4 text-slate-700 text-sm leading-relaxed outline-none resize-y font-mono"
                    style={{ minHeight: '400px' }}
                  />
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
                <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">SEO Settings</h2>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">SEO Title <span className="text-slate-400 font-normal">(defaults to post title)</span></label>
                  <input
                    value={form.meta_title}
                    onChange={e => set('meta_title', e.target.value)}
                    maxLength={300}
                    placeholder="SEO Title..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className={`text-xs mt-1 ${form.meta_title.length > 60 ? 'text-orange-500' : 'text-slate-400'}`}>
                    {form.meta_title.length}/60 chars (target: 50–60)
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Meta Description</label>
                  <textarea
                    value={form.meta_description}
                    onChange={e => set('meta_description', e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="Compelling description for search engines..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className={`text-xs mt-1 ${form.meta_description.length > 160 ? 'text-orange-500' : 'text-slate-400'}`}>
                    {form.meta_description.length}/160 chars (target: 120–160)
                  </div>
                </div>
                {/* Google preview */}
                {(form.meta_title || form.title) && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 mb-2">Google Preview</p>
                    <p className="text-blue-600 text-base font-medium truncate">{form.meta_title || form.title}</p>
                    <p className="text-green-700 text-xs mb-1">{window.location.origin}/blog/{form.slug || 'post-slug'}</p>
                    <p className="text-slate-600 text-sm line-clamp-2">{form.meta_description || form.excerpt || 'No description set.'}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
                <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Post Settings</h2>

                {/* Author */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Author Name</label>
                  <input
                    value={form.author}
                    onChange={e => set('author', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Category</label>
                  <div className="flex gap-2">
                    <select
                      value={form.category || ''}
                      onChange={e => set('category', e.target.value || null)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">— No Category —</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* Add new category inline */}
                  <div className="flex gap-2 mt-2">
                    <input
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                      placeholder="New category name..."
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handleAddCategory} disabled={addingCat || !newCatName.trim()} className="px-3 py-2 rounded-lg text-sm font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50">
                      + Add
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                        #{tag}
                        <button onClick={() => removeTag(tag)} className="text-blue-400 hover:text-blue-700 ml-0.5 font-bold">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add tag and press Enter..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={addTag} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors">
                      Add
                    </button>
                  </div>
                </div>

                {/* Featured toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">⭐ Featured Post</p>
                    <p className="text-xs text-slate-500 mt-0.5">Show in the featured section on the blog listing.</p>
                  </div>
                  <button
                    onClick={() => set('is_featured', !form.is_featured)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${form.is_featured ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_featured ? 'translate-x-5' : ''}`} />
                  </button>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Status</label>
                  <div className="flex gap-2">
                    {['draft', 'published'].map(s => (
                      <button
                        key={s}
                        onClick={() => set('status', s)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all capitalize ${form.status === s ? (s === 'published' ? 'bg-green-600 text-white border-green-600' : 'bg-yellow-500 text-white border-yellow-500') : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                      >
                        {s === 'draft' ? '📋 Draft' : '✅ Published'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
