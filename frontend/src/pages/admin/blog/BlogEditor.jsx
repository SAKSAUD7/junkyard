import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { blogApi } from '../../../services/blogApi';
import BlockBuilder from './BlockBuilder';
import { 
    ChevronLeftIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const EMPTY_POST = {
  title: '', slug: '', excerpt: '', 
  blocks: [], // Replaced 'content'
  cover_image_url: '', thumbnail_url: '',
  category: null, author: null, tags: [], 
  status: 'draft', 
  is_featured: false, is_trending: false, is_editors_pick: false,
  seo_title: '', seo_description: '', canonical_url: '', og_image_url: '',
  reading_time: 5, allow_comments: true,
};

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_POST);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('blocks'); // 'basic' | 'blocks' | 'seo' | 'publish'
  const [previewMode, setPreviewMode] = useState(false);
  
  // Fast creation states
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
        const [cats, auths, tagsRes] = await Promise.all([
            blogApi.adminGetCategories(),
            blogApi.adminGetAuthors(),
            blogApi.adminGetTags(),
        ]);
        
        setCategories(Array.isArray(cats) ? cats : (cats.results || []));
        setAuthors(Array.isArray(auths) ? auths : (auths.results || []));
        setAvailableTags(Array.isArray(tagsRes) ? tagsRes : (tagsRes.results || []));

        if (isEdit) {
          const data = await blogApi.adminGetPost(id);
          setForm({
            ...EMPTY_POST,
            ...data,
            category: data.category?.id || data.category || null,
            author: data.author?.id || data.author || null,
            tags: Array.isArray(data.tags) ? data.tags.map(t => typeof t === 'object' ? t.id : t) : [],
            blocks: data.blocks || [],
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

  const toggleTag = (tagId) => {
      if (form.tags.includes(tagId)) {
          set('tags', form.tags.filter(t => t !== tagId));
      } else {
          set('tags', [...form.tags, tagId]);
      }
  };

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
    if (!form.title.trim()) { showToast('Title is required.', 'error'); setActiveTab('basic'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        status: statusOverride || form.status,
        category: form.category || null,
        author: form.author || null,
        seo_title: form.seo_title || form.title,
      };
      
      if (isEdit) {
        await blogApi.adminUpdatePost(id, payload);
        showToast('Article updated successfully!');
      } else {
        const created = await blogApi.adminCreatePost(payload);
        showToast('Article created! Redirecting...');
        setTimeout(() => navigate(`/admin-portal/blog/edit/${created.id}`), 1500);
      }
    } catch (err) {
      showToast('Save failed. Check required fields.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-3 animate-fade-in ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}>
          <CheckCircleIcon className="w-5 h-5" />
          {toast.msg}
        </div>
      )}

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin-portal/blog" className="p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-black text-slate-900 text-lg leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {form.title || 'Untitled Article'}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{isEdit ? 'Edit Mode' : 'Creation Mode'}</span>
                {isEdit && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${form.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {form.status}
                    </span>
                )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
          <button onClick={() => setPreviewMode(!previewMode)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${previewMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}>
            Preview
          </button>
          <button onClick={() => handleSave('draft')} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200/50 transition-all disabled:opacity-50">
            {saving ? '...' : 'Save Draft'}
          </button>
          <button onClick={() => handleSave(form.status === 'published' ? null : 'published')} disabled={saving} className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50">
            {form.status === 'published' ? 'Update Live' : 'Publish Now'}
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        
        {/* Navigation Tabs */}
        {!previewMode && (
            <div className="flex gap-2 border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
                {[
                    { id: 'basic', label: 'Basic Info' },
                    { id: 'blocks', label: 'Content Builder' },
                    { id: 'seo', label: 'SEO & Meta' },
                    { id: 'publish', label: 'Publishing' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        )}

        {previewMode ? (
          /* ── PREVIEW MODE (Simulated Renderer) ── */
          <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100 max-w-4xl mx-auto">
            <div className="mb-10 text-center space-y-4">
                <span className="text-sm font-bold text-blue-600 tracking-widest uppercase">Knowledge Base</span>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {form.title || 'Untitled Article'}
                </h1>
                {form.excerpt && <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">{form.excerpt}</p>}
            </div>
            {form.cover_image_url && (
              <img src={form.cover_image_url} alt="" className="w-full h-[400px] object-cover rounded-2xl mb-12 shadow-lg" />
            )}
            
            <div className="prose prose-lg prose-slate max-w-none prose-headings:font-black prose-headings:font-['Outfit']">
                {form.blocks.length === 0 && <p className="text-slate-400 text-center">No content blocks added yet.</p>}
                {form.blocks.map(b => (
                    <div key={b.id} className="mb-6">
                        {b.type === 'heading' && React.createElement(b.level, { className: 'mt-8 mb-4' }, b.text || '[Empty Heading]')}
                        {b.type === 'paragraph' && <p>{b.text || '[Empty Paragraph]'}</p>}
                        {b.type === 'image' && (
                            <figure className="my-8">
                                <img src={b.url} alt={b.alt} className="rounded-2xl" />
                                {b.caption && <figcaption className="text-center text-sm text-slate-500 mt-2">{b.caption}</figcaption>}
                            </figure>
                        )}
                        {b.type === 'list' && (
                            b.style === 'number' 
                                ? <ol className="list-decimal pl-6 space-y-2">{b.items.map((i, idx) => <li key={idx}>{i}</li>)}</ol>
                                : <ul className="list-disc pl-6 space-y-2">{b.items.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
                        )}
                        {b.type === 'cta' && (
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white my-10 shadow-xl shadow-blue-900/20">
                                <h3 className="text-2xl font-black mb-2 text-white">{b.title}</h3>
                                <p className="text-blue-100 mb-6">{b.description}</p>
                                {b.buttonText && <button className="bg-white text-blue-900 font-bold px-8 py-3 rounded-xl">{b.buttonText}</button>}
                            </div>
                        )}
                    </div>
                ))}
            </div>
          </div>
        ) : (
          /* ── EDITOR MODE ── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                
                {/* ── BASIC INFO ── */}
                <div className={activeTab === 'basic' ? 'block space-y-6' : 'hidden'}>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                        <input
                            value={form.title}
                            onChange={e => set('title', e.target.value)}
                            placeholder="Article Title..."
                            className="w-full text-4xl font-black text-slate-900 outline-none placeholder-slate-200 border-none bg-transparent mb-4"
                            style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}
                        />
                        <textarea
                            value={form.excerpt}
                            onChange={e => set('excerpt', e.target.value)}
                            rows={3}
                            placeholder="A short, compelling summary of the article..."
                            className="w-full text-xl text-slate-500 outline-none placeholder-slate-300 resize-none leading-relaxed"
                        />
                    </div>
                    
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Hero Media</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cover Image URL</label>
                                <input value={form.cover_image_url} onChange={e => set('cover_image_url', e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder="https://..." />
                                {form.cover_image_url && <img src={form.cover_image_url} className="mt-3 w-full h-32 object-cover rounded-xl" />}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Thumbnail URL (Optional)</label>
                                <input value={form.thumbnail_url} onChange={e => set('thumbnail_url', e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Defaults to Cover Image" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── CONTENT BUILDER ── */}
                <div className={activeTab === 'blocks' ? 'block' : 'hidden'}>
                    <BlockBuilder 
                        blocks={form.blocks} 
                        onChange={(newBlocks) => set('blocks', newBlocks)} 
                    />
                </div>

                {/* ── SEO ── */}
                <div className={activeTab === 'seo' ? 'block space-y-6' : 'hidden'}>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">SEO Title</label>
                            <input value={form.seo_title} onChange={e => set('seo_title', e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder={form.title || "Meta title..."} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Meta Description</label>
                            <textarea value={form.seo_description} onChange={e => set('seo_description', e.target.value)} rows={3} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none resize-none" placeholder="Meta description..." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Canonical URL</label>
                            <input value={form.canonical_url} onChange={e => set('canonical_url', e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Leave blank to use default" />
                        </div>
                    </div>
                </div>

            </div>

            {/* Sidebar (Always visible unless preview mode) */}
            <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Author</label>
                        <select value={form.author || ''} onChange={e => set('author', e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none">
                            <option value="">— Select Author —</option>
                            {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                        <select value={form.category || ''} onChange={e => set('category', e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none mb-2">
                            <option value="">— Select Category —</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="flex gap-2">
                            <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="New Category..." className="flex-1 bg-slate-50 border-none rounded-lg px-3 py-2 text-sm outline-none" />
                            <button onClick={handleAddCategory} disabled={addingCat || !newCatName} className="px-3 py-2 bg-blue-100 text-blue-700 font-bold text-xs rounded-lg uppercase tracking-wider disabled:opacity-50">+ Add</button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tags</label>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map(tag => (
                                <button 
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${form.tags.includes(tag.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Highlights</h4>
                    
                    <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-sm font-bold text-slate-700">⭐ Featured Article</span>
                        <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-sm font-bold text-slate-700">🔥 Trending</span>
                        <input type="checkbox" checked={form.is_trending} onChange={e => set('is_trending', e.target.checked)} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <span className="text-sm font-bold text-slate-700">👑 Editor's Pick</span>
                        <input type="checkbox" checked={form.is_editors_pick} onChange={e => set('is_editors_pick', e.target.checked)} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                    </label>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
