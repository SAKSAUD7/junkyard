import { useState, useEffect, useCallback } from 'react'
import { api } from '../../services/api'
import {
    PencilSquareIcon, PhotoIcon, MagnifyingGlassIcon,
    CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon,
    GlobeAltIcon, DocumentTextIcon, Squares2X2Icon, ServerStackIcon,
    PlusIcon, XMarkIcon
} from '@heroicons/react/24/outline'

// ─── Reusable sub-components ─────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-medium transition-all animate-fade-in ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
            {type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <ExclamationTriangleIcon className="w-5 h-5" />}
            {message}
        </div>
    )
}

function SectionToggle({ value, onChange, label }) {
    const isVisible = value === 'true' || value === true
    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <button
                onClick={() => onChange(isVisible ? 'false' : 'true')}
                className={`relative w-12 h-6 rounded-full transition-colors ${isVisible ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isVisible ? 'translate-x-6' : ''}`} />
            </button>
        </div>
    )
}

function ContentField({ item, onChange }) {
    if (item.content_type === 'boolean') {
        return <SectionToggle value={item.value} onChange={(v) => onChange(item.id, v)} label={item.label || item.key} />
    }
    if (item.content_type === 'html') {
        return (
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{item.label || item.key}</label>
                <textarea
                    rows={4}
                    value={item.value}
                    onChange={e => onChange(item.id, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500 resize-none font-mono"
                />
            </div>
        )
    }
    if (item.content_type === 'url') {
        return (
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{item.label || item.key}</label>
                <input
                    type="url"
                    value={item.value}
                    onChange={e => onChange(item.id, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                    placeholder="https://..."
                />
            </div>
        )
    }
    // default: text
    const isLong = (item.value || '').length > 100
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{item.label || item.key}</label>
            {isLong ? (
                <textarea
                    rows={3}
                    value={item.value}
                    onChange={e => onChange(item.id, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500 resize-none"
                />
            ) : (
                <input
                    type="text"
                    value={item.value}
                    onChange={e => onChange(item.id, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                />
            )}
        </div>
    )
}

// ─── Create Entry Modal ───────────────────────────────────────────────────────
function CreateEntryModal({ page, onClose, onCreated }) {
    const [form, setForm] = useState({
        section: '', key: '', value: '', content_type: 'text', label: ''
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        if (!form.section.trim() || !form.key.trim()) {
            setError('Section and Key are required.')
            return
        }
        setSaving(true)
        setError('')
        try {
            await api.cms.createContent({ ...form, page, is_active: true })
            onCreated()
            onClose()
        } catch (e) {
            setError(e?.response?.data?.detail || 'Failed to create entry.')
        } finally { setSaving(false) }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">New Content Entry</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Section *</label>
                            <input value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
                                placeholder="e.g. hero" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Key *</label>
                            <input value={form.key} onChange={e => setForm(f => ({ ...f, key: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
                                placeholder="e.g. heading" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Label</label>
                        <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
                            placeholder="Friendly display name" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Type</label>
                        <select value={form.content_type} onChange={e => setForm(f => ({ ...f, content_type: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 bg-white">
                            <option value="text">Text</option>
                            <option value="html">HTML</option>
                            <option value="url">URL</option>
                            <option value="boolean">Toggle (boolean)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Initial Value</label>
                        {form.content_type === 'html' ? (
                            <textarea rows={3} value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 font-mono resize-none" />
                        ) : (
                            <input value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" />
                        )}
                    </div>
                    {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSubmit} disabled={saving}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-60">
                        {saving && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                        {saving ? 'Creating…' : 'Create Entry'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── PAGE CMS TAB ─────────────────────────────────────────────────────────────
const PAGE_LABELS = {
    home: '🏠 Home',
    about: '📖 About',
    contact: '📞 Contact',
    browse: '🗺 Browse States',
    blog: '📰 Blog',
    vendors: '🏭 Vendors',
    faq: '❓ FAQ',
    how_it_works: '⚙️ How It Works',
    navbar: '🧭 Navbar',
    footer: '🦶 Footer',
    seo_home: '🔍 SEO – Home',
    seo_about: '🔍 SEO – About',
    seo_contact: '🔍 SEO – Contact',
    seo_browse: '🔍 SEO – Browse',
    seo_blog: '🔍 SEO – Blog',
    seo_vendors: '🔍 SEO – Vendors',
}

function PageCMSTab({ toast }) {
    const [selectedPage, setSelectedPage] = useState('home')
    const [items, setItems] = useState([])
    const [dirty, setDirty] = useState({})
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [showCreate, setShowCreate] = useState(false)

    const loadPage = useCallback(async (page) => {
        setLoading(true)
        try {
            const data = await api.cms.getAllContent({ page })
            const results = data.results || data || []
            setItems(results)
            setDirty({})
        } catch { toast('Failed to load content', 'error') }
        finally { setLoading(false) }
    }, [toast])

    useEffect(() => { loadPage(selectedPage) }, [selectedPage, loadPage])

    const handleChange = (id, value) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, value } : i))
        setDirty(prev => ({ ...prev, [id]: true }))
    }

    const handleSave = async () => {
        const updates = Object.keys(dirty).map(id => ({
            id: parseInt(id),
            value: items.find(i => i.id === parseInt(id))?.value ?? ''
        }))
        if (!updates.length) return
        setSaving(true)
        try {
            await api.cms.bulkUpdate(updates)
            setDirty({})
            toast('Changes saved successfully!')
        } catch { toast('Failed to save changes', 'error') }
        finally { setSaving(false) }
    }

    const handleSeed = async () => {
        try {
            const res = await api.cms.seedDefaults()
            toast(`Seeded ${res.seeded} entries`)
            loadPage(selectedPage)
        } catch { toast('Seed failed', 'error') }
    }

    // Group items by section
    const grouped = items.reduce((acc, item) => {
        const key = item.section
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
    }, {})

    const dirtyCount = Object.keys(dirty).length

    return (
        <>
        <div className="flex gap-6 h-full">
            {/* Page selector */}
            <div className="w-52 flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pages</p>
                    </div>
                    <div className="py-2">
                        {Object.entries(PAGE_LABELS).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedPage(key)}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedPage === key ? 'bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={handleSeed}
                    className="mt-3 w-full text-xs text-gray-500 hover:text-blue-600 py-2 flex items-center justify-center gap-1 transition-colors"
                >
                    <ArrowPathIcon className="w-3 h-3" /> Seed defaults
                </button>
            </div>

            {/* Fields */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{PAGE_LABELS[selectedPage]}</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                        >
                            <PlusIcon className="w-4 h-4" /> New Entry
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || dirtyCount === 0}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${dirtyCount > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        >
                            {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
                            {saving ? 'Saving…' : `Save${dirtyCount > 0 ? ` (${dirtyCount})` : ''}`}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : items.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                        <DocumentTextIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium mb-2">No content yet for this page</p>
                        <p className="text-sm text-gray-400">Click "Seed defaults" to populate initial content</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {Object.entries(grouped).map(([section, sectionItems]) => (
                            <div key={section} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{section.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {sectionItems.map(item => (
                                        <div key={item.id} className={dirty[item.id] ? 'ring-2 ring-blue-200 rounded-xl' : ''}>
                                            <ContentField item={item} onChange={handleChange} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        {showCreate && (
            <CreateEntryModal
                page={selectedPage}
                onClose={() => setShowCreate(false)}
                onCreated={() => { loadPage(selectedPage); toast('Entry created!') }}
            />
        )}
    </>
    )
}

// ─── MEDIA MANAGER TAB ────────────────────────────────────────────────────────
function MediaTab({ toast }) {
    const [assets, setAssets] = useState([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [copied, setCopied] = useState(null)

    const loadAssets = useCallback(async () => {
        try {
            const data = await api.cms.getMedia()
            setAssets(data.results || data || [])
        } catch { toast('Failed to load media', 'error') }
        finally { setLoading(false) }
    }, [toast])

    useEffect(() => { loadAssets() }, [loadAssets])

    const handleUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setUploading(true)
        try {
            await api.cms.uploadMedia(file)
            toast('Image uploaded!')
            loadAssets()
        } catch { toast('Upload failed', 'error') }
        finally { setUploading(false); e.target.value = '' }
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this asset?')) return
        try {
            await api.cms.deleteMedia(id)
            setAssets(prev => prev.filter(a => a.id !== id))
            toast('Asset deleted')
        } catch { toast('Delete failed', 'error') }
    }

    const copyURL = (url) => {
        navigator.clipboard.writeText(url)
        setCopied(url)
        setTimeout(() => setCopied(null), 2000)
    }

    return (
        <div>
            {/* Upload zone */}
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors mb-6">
                <PhotoIcon className="w-10 h-10 text-blue-400 mb-2" />
                <span className="text-sm font-semibold text-blue-600">{uploading ? 'Uploading…' : 'Click to upload an image'}</span>
                <span className="text-xs text-blue-400 mt-1">PNG, JPG, WebP, SVG</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>

            {loading ? (
                <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
            ) : assets.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No media uploaded yet</div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {assets.map(asset => (
                        <div key={asset.id} className="group relative rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                            <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                                {asset.resolved_url ? (
                                    <img src={asset.resolved_url} alt={asset.alt_text || asset.name} className="w-full h-full object-cover" />
                                ) : (
                                    <PhotoIcon className="w-10 h-10 text-gray-300" />
                                )}
                            </div>
                            <div className="p-2">
                                <p className="text-xs text-gray-600 truncate font-medium">{asset.name}</p>
                                <div className="flex gap-1 mt-1.5">
                                    <button
                                        onClick={() => copyURL(asset.resolved_url)}
                                        className={`flex-1 text-xs py-1 rounded-lg font-semibold transition-colors ${copied === asset.resolved_url ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                    >
                                        {copied === asset.resolved_url ? 'Copied!' : 'Copy URL'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(asset.id)}
                                        className="px-2 py-1 text-xs rounded-lg bg-red-50 text-red-500 hover:bg-red-100 font-semibold"
                                    >✕</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── SEO TAB ──────────────────────────────────────────────────────────────────
const SEO_PAGES = ['seo_home', 'seo_about', 'seo_contact', 'seo_browse', 'seo_blog', 'seo_vendors']

function SEOTab({ toast }) {
    const [selectedPage, setSelectedPage] = useState('seo_home')
    const [items, setItems] = useState([])
    const [dirty, setDirty] = useState({})
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    const loadPage = useCallback(async (page) => {
        setLoading(true)
        try {
            const data = await api.cms.getAllContent({ page })
            setItems(data.results || data || [])
            setDirty({})
        } catch { toast('Failed to load SEO data', 'error') }
        finally { setLoading(false) }
    }, [toast])

    useEffect(() => { loadPage(selectedPage) }, [selectedPage, loadPage])

    const handleChange = (id, value) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, value } : i))
        setDirty(prev => ({ ...prev, [id]: true }))
    }

    const handleSave = async () => {
        const updates = Object.keys(dirty).map(id => ({ id: parseInt(id), value: items.find(i => i.id === parseInt(id))?.value ?? '' }))
        if (!updates.length) return
        setSaving(true)
        try { await api.cms.bulkUpdate(updates); setDirty({}); toast('SEO settings saved!') }
        catch { toast('Save failed', 'error') }
        finally { setSaving(false) }
    }

    const dirtyCount = Object.keys(dirty).length

    return (
        <div className="flex gap-6">
            <div className="w-48 flex-shrink-0">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pages</p>
                    </div>
                    <div className="py-2">
                        {SEO_PAGES.map(page => (
                            <button key={page} onClick={() => setSelectedPage(page)}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedPage === page ? 'bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                                {PAGE_LABELS[page]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{PAGE_LABELS[selectedPage]}</h3>
                    <button onClick={handleSave} disabled={saving || dirtyCount === 0}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${dirtyCount > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                        {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
                        {saving ? 'Saving…' : `Save${dirtyCount > 0 ? ` (${dirtyCount})` : ''}`}
                    </button>
                </div>
                {loading ? (
                    <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        {items.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No SEO data. Click "Seed defaults" on the Pages tab first.</p>
                        ) : (
                            items.map(item => (
                                <div key={item.id} className={dirty[item.id] ? 'ring-2 ring-blue-200 rounded-xl p-1' : ''}>
                                    <ContentField item={item} onChange={handleChange} />
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── MAIN CMS PAGE ─────────────────────────────────────────────────────────────
const TABS = [
    { id: 'pages',    label: 'Pages',      icon: DocumentTextIcon,    desc: 'Edit headings, text, CTAs, section visibility' },
    { id: 'media',    label: 'Media',      icon: PhotoIcon,           desc: 'Upload & manage image assets' },
    { id: 'seo',      label: 'SEO',        icon: GlobeAltIcon,        desc: 'Meta titles, descriptions, Open Graph' },
]

export default function AdminCMS() {
    const [activeTab, setActiveTab] = useState('pages')
    const [toast, setToast] = useState(null)

    const showToast = useCallback((message, type = 'success') => setToast({ message, type }), [])

    return (
        <div className="h-full flex flex-col">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                        <PencilSquareIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Content Management System</h1>
                        <p className="text-sm text-gray-500">Edit all website content dynamically — changes reflect live on the frontend</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 pb-0">
                {TABS.map(tab => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-t-xl border-b-2 transition-all ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-700 bg-white'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
                {activeTab === 'pages' && <PageCMSTab toast={showToast} />}
                {activeTab === 'media' && <MediaTab toast={showToast} />}
                {activeTab === 'seo' && <SEOTab toast={showToast} />}
            </div>
        </div>
    )
}
