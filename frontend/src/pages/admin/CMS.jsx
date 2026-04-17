import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../services/api';
import {
    PencilSquareIcon, CheckIcon, XMarkIcon, MagnifyingGlassIcon,
    PhotoIcon, ArrowUpTrayIcon, LinkIcon, DocumentTextIcon,
    ChevronDownIcon, ChevronRightIcon, ExclamationTriangleIcon,
    CheckCircleIcon, ArrowPathIcon, EyeIcon,
} from '@heroicons/react/24/outline';

// ─── Page definitions ────────────────────────────────────────────────────────
const PAGES = [
    { key: 'home',         label: 'Home',         icon: '🏠' },
    { key: 'about',        label: 'About',         icon: 'ℹ️' },
    { key: 'contact',      label: 'Contact',        icon: '✉️' },
    { key: 'browse',       label: 'Browse States',  icon: '🗺️' },
    { key: 'vendors',      label: 'Vendors',        icon: '🏭' },
    { key: 'blog',         label: 'Blog',           icon: '📖' },
    { key: 'faq',          label: 'FAQ',            icon: '❓' },
    { key: 'how_it_works', label: 'How It Works',   icon: '⚙️' },
    { key: 'navbar',       label: 'Navbar',         icon: '📌' },
    { key: 'footer',       label: 'Footer',         icon: '🦶' },
    { key: 'global',       label: 'Global / SEO',   icon: '🌐' },
];

const CONTENT_TYPE_ICONS = {
    text:     '✏️',
    html:     '🌐',
    url:      '🔗',
    image:    '🖼️',
    textarea: '📝',
};

// ─── Toast component ─────────────────────────────────────────────────────────
function Toast({ toasts }) {
    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
            {toasts.map(t => (
                <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all animate-fade-in-up ${t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
                    {t.type === 'success' ? <CheckCircleIcon className="w-4 h-4 flex-shrink-0" /> : <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />}
                    {t.message}
                </div>
            ))}
        </div>
    );
}

// ─── Image Upload Field ───────────────────────────────────────────────────────
function ImageField({ entry, value, onChange, onSave, saving, dirty }) {
    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(value || '');

    useEffect(() => { setPreview(value || ''); }, [value]);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { alert('File must be under 10MB'); return; }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', file.name.replace(/\.[^/.]+$/, ''));
            const baseURL = import.meta.env.VITE_API_URL || '';
            const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
            const res = await fetch(`${baseURL}/api/cms/admin/media/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            const url = data.file || data.url || data.file_url || '';
            setPreview(url);
            onChange(entry.id, url);
        } catch (err) {
            alert('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="space-y-3">
            {/* URL input */}
            <div className="flex items-center gap-2">
                <input
                    type="url"
                    value={value || ''}
                    onChange={e => onChange(entry.id, e.target.value)}
                    placeholder="https://... or upload below"
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
                <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all disabled:opacity-50"
                >
                    {uploading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ArrowUpTrayIcon className="w-4 h-4" />}
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
                {dirty && (
                    <button onClick={() => onSave(entry.id)} disabled={saving}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-all disabled:opacity-50">
                        {saving ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : <CheckIcon className="w-3 h-3" />}
                    </button>
                )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

            {/* Preview */}
            {preview && (
                <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50" style={{ maxHeight: 180 }}>
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-44 object-cover"
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white text-xs bg-black/50 px-2 py-1 rounded-full transition-all">
                            {preview.split('/').pop()}
                        </span>
                    </div>
                </div>
            )}
            {!preview && (
                <div
                    onClick={() => fileRef.current?.click()}
                    className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-slate-300 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                >
                    <PhotoIcon className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500">Click to upload an image</span>
                    <span className="text-xs text-slate-400 mt-1">PNG, JPG, WebP up to 10MB</span>
                </div>
            )}
        </div>
    );
}

// ─── HTML Preview Field ───────────────────────────────────────────────────────
function HtmlField({ value, onChange, entryId, onSave, saving, dirty }) {
    const [showPreview, setShowPreview] = useState(false);
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <button onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                    <EyeIcon className="w-3.5 h-3.5" />
                    {showPreview ? 'Edit' : 'Preview HTML'}
                </button>
            </div>
            {showPreview ? (
                <div
                    className="min-h-[2.5rem] px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
                    dangerouslySetInnerHTML={{ __html: value || '' }}
                />
            ) : (
                <textarea
                    value={value || ''}
                    onChange={e => onChange(entryId, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono resize-y"
                    placeholder="HTML content..."
                />
            )}
            {dirty && (
                <div className="flex justify-end">
                    <button onClick={() => onSave(entryId)} disabled={saving}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-all">
                        {saving ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : <CheckIcon className="w-3 h-3" />}
                        Save
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Single Field Row ─────────────────────────────────────────────────────────
function FieldRow({ entry, localValues, dirtyIds, savingIds, onValueChange, onSave }) {
    const value = localValues[entry.id] ?? entry.value ?? '';
    const dirty = dirtyIds.has(entry.id);
    const saving = savingIds.has(entry.id);

    const inputClass = "w-full px-3 py-2 text-sm rounded-lg bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all";

    return (
        <div className={`p-4 rounded-xl border transition-all ${dirty ? 'border-amber-300 bg-amber-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base flex-shrink-0" title={entry.content_type}>
                        {CONTENT_TYPE_ICONS[entry.content_type] || '✏️'}
                    </span>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">{entry.label || entry.key}</p>
                        <p className="text-xs text-slate-400 font-mono">{entry.section} → {entry.key}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {dirty && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Unsaved changes" />}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        entry.content_type === 'image'    ? 'bg-purple-100 text-purple-700' :
                        entry.content_type === 'html'     ? 'bg-blue-100 text-blue-700' :
                        entry.content_type === 'url'      ? 'bg-cyan-100 text-cyan-700' :
                        entry.content_type === 'textarea' ? 'bg-green-100 text-green-700' :
                                                            'bg-slate-100 text-slate-600'
                    }`}>{entry.content_type}</span>
                </div>
            </div>

            {/* Field input by type */}
            {entry.content_type === 'image' ? (
                <ImageField
                    entry={entry} value={value}
                    onChange={onValueChange} onSave={onSave}
                    saving={saving} dirty={dirty}
                />
            ) : entry.content_type === 'html' ? (
                <HtmlField
                    value={value} onChange={onValueChange}
                    entryId={entry.id} onSave={onSave}
                    saving={saving} dirty={dirty}
                />
            ) : entry.content_type === 'textarea' ? (
                <div className="space-y-2">
                    <textarea
                        value={value}
                        onChange={e => onValueChange(entry.id, e.target.value)}
                        rows={3}
                        className={inputClass + ' resize-y'}
                        placeholder={entry.label || entry.key}
                    />
                    {dirty && (
                        <div className="flex justify-end">
                            <button onClick={() => onSave(entry.id)} disabled={saving}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium">
                                {saving ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : <CheckIcon className="w-3 h-3" />}Save
                            </button>
                        </div>
                    )}
                </div>
            ) : entry.content_type === 'url' ? (
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="url"
                            value={value}
                            onChange={e => onValueChange(entry.id, e.target.value)}
                            className={inputClass + ' pl-8'}
                            placeholder="https://..."
                        />
                    </div>
                    {value && <a href={value} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition-all flex items-center">Open</a>}
                    {dirty && (
                        <button onClick={() => onSave(entry.id)} disabled={saving}
                            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm flex items-center gap-1">
                            {saving ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <CheckIcon className="w-3.5 h-3.5" />}
                        </button>
                    )}
                </div>
            ) : (
                /* text (default) */
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={value}
                        onChange={e => onValueChange(entry.id, e.target.value)}
                        className={inputClass + ' flex-1'}
                        placeholder={entry.label || entry.key}
                    />
                    {dirty && (
                        <button onClick={() => onSave(entry.id)} disabled={saving}
                            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm flex items-center gap-1">
                            {saving ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <CheckIcon className="w-3.5 h-3.5" />}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Section Accordion ────────────────────────────────────────────────────────
function SectionAccordion({ sectionName, entries, localValues, dirtyIds, savingIds, onValueChange, onSave, onSaveSection }) {
    const [open, setOpen] = useState(true);
    const dirtyCount = entries.filter(e => dirtyIds.has(e.id)).length;

    return (
        <div className="border border-slate-200 rounded-2xl overflow-hidden mb-4">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {open ? <ChevronDownIcon className="w-4 h-4 text-slate-500" /> : <ChevronRightIcon className="w-4 h-4 text-slate-500" />}
                    <span className="font-semibold text-slate-800 capitalize">{sectionName.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-slate-400 font-mono">{entries.length} fields</span>
                    {dirtyCount > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                            {dirtyCount} unsaved
                        </span>
                    )}
                </div>
                {dirtyCount > 0 && (
                    <button
                        onClick={e => { e.stopPropagation(); onSaveSection(entries.filter(en => dirtyIds.has(en.id)).map(en => en.id)); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
                    >
                        <CheckIcon className="w-3 h-3" />
                        Save Section
                    </button>
                )}
            </button>

            {open && (
                <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {entries.map(entry => (
                        <div key={entry.id} className={entry.content_type === 'image' || entry.content_type === 'textarea' || entry.content_type === 'html' ? 'lg:col-span-2' : ''}>
                            <FieldRow
                                entry={entry}
                                localValues={localValues}
                                dirtyIds={dirtyIds}
                                savingIds={savingIds}
                                onValueChange={onValueChange}
                                onSave={onSave}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main CMS Component ───────────────────────────────────────────────────────
export default function CMS() {
    const [activePage, setActivePage] = useState('home');
    const [allEntries, setAllEntries] = useState([]);   // entries for current page
    const [loading, setLoading]       = useState(true);
    const [localValues, setLocalValues] = useState({});  // { id: value }
    const [dirtyIds, setDirtyIds]     = useState(new Set());
    const [savingIds, setSavingIds]   = useState(new Set());
    const [search, setSearch]         = useState('');
    const [toasts, setToasts]         = useState([]);
    const [seeding, setSeeding]       = useState(false);

    // ── Toast helper ──────────────────────────────────────────────────────
    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    // ── Load page content ─────────────────────────────────────────────────
    const loadPage = useCallback(async (page) => {
        setLoading(true);
        setDirtyIds(new Set());
        setSearch('');
        try {
            const data = await api.cms.getAllContent({ page });
            const entries = Array.isArray(data) ? data : (data.results || []);
            setAllEntries(entries);
            const vals = {};
            entries.forEach(e => { vals[e.id] = e.value ?? ''; });
            setLocalValues(vals);
        } catch (err) {
            addToast('Failed to load content. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => { loadPage(activePage); }, [activePage, loadPage]);

    // ── Value change (marks dirty) ────────────────────────────────────────
    const handleValueChange = useCallback((id, val) => {
        setLocalValues(prev => ({ ...prev, [id]: val }));
        setDirtyIds(prev => new Set([...prev, id]));
    }, []);

    // ── Save single field ─────────────────────────────────────────────────
    const handleSave = useCallback(async (id) => {
        setSavingIds(prev => new Set([...prev, id]));
        try {
            await api.cms.updateContent(id, { value: localValues[id] });
            setDirtyIds(prev => { const n = new Set(prev); n.delete(id); return n; });
            addToast('Saved successfully ✓');
        } catch (err) {
            addToast('Save failed. Please try again.', 'error');
        } finally {
            setSavingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
        }
    }, [localValues, addToast]);

    // ── Save multiple fields ──────────────────────────────────────────────
    const handleSaveMultiple = useCallback(async (ids) => {
        const updates = ids.map(id => ({ id, value: localValues[id] }));
        ids.forEach(id => setSavingIds(prev => new Set([...prev, id])));
        try {
            await api.cms.bulkUpdate(updates);
            setDirtyIds(prev => { const n = new Set(prev); ids.forEach(id => n.delete(id)); return n; });
            addToast(`Saved ${ids.length} field${ids.length > 1 ? 's' : ''} ✓`);
        } catch {
            addToast('Save failed. Please try again.', 'error');
        } finally {
            ids.forEach(id => setSavingIds(prev => { const n = new Set(prev); n.delete(id); return n; }));
        }
    }, [localValues, addToast]);

    // ── Save All ──────────────────────────────────────────────────────────
    const handleSaveAll = () => {
        const ids = [...dirtyIds];
        if (!ids.length) return;
        handleSaveMultiple(ids);
    };

    // ── Seed defaults ─────────────────────────────────────────────────────
    const handleSeed = async () => {
        setSeeding(true);
        try {
            await api.cms.seedDefaults();
            addToast('Default content seeded ✓');
            loadPage(activePage);
        } catch {
            addToast('Seed failed', 'error');
        } finally {
            setSeeding(false);
        }
    };

    // ── Group by section ──────────────────────────────────────────────────
    const filteredEntries = allEntries.filter(e => {
        if (!search) return true;
        const term = search.toLowerCase();
        return (
            (e.label || '').toLowerCase().includes(term) ||
            e.key.toLowerCase().includes(term) ||
            e.section.toLowerCase().includes(term) ||
            (e.value || '').toLowerCase().includes(term)
        );
    });

    const sections = filteredEntries.reduce((acc, entry) => {
        if (!acc[entry.section]) acc[entry.section] = [];
        acc[entry.section].push(entry);
        return acc;
    }, {});

    const totalDirty = dirtyIds.size;
    const currentPageDef = PAGES.find(p => p.key === activePage);

    return (
        <div className="flex h-full bg-slate-50 font-['Inter',sans-serif]" style={{ minHeight: 0 }}>
            <Toast toasts={toasts} />

            {/* ── Sidebar ── */}
            <aside className="w-56 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 overflow-y-auto">
                <div className="px-4 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <PencilSquareIcon className="w-5 h-5 text-indigo-600" />
                        <span className="font-bold text-slate-800 text-sm">Content Manager</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Edit all website content</p>
                </div>
                <nav className="flex-1 p-2">
                    {PAGES.map(page => (
                        <button
                            key={page.key}
                            onClick={() => setActivePage(page.key)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all mb-0.5 ${
                                activePage === page.key
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <span className="text-base">{page.icon}</span>
                            <span className="truncate">{page.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Seed button */}
                <div className="p-3 border-t border-slate-100">
                    <button onClick={handleSeed} disabled={seeding}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all disabled:opacity-50">
                        {seeding ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <ArrowPathIcon className="w-3.5 h-3.5" />}
                        Seed Defaults
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Header */}
                <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0">
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <span className="text-xl">{currentPageDef?.icon}</span>
                            {currentPageDef?.label} Content
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {allEntries.length} fields
                            {totalDirty > 0 && <span className="ml-2 text-amber-600 font-semibold">· {totalDirty} unsaved changes</span>}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search fields..."
                                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl w-52 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                            />
                        </div>

                        {/* Save All */}
                        {totalDirty > 0 && (
                            <button
                                onClick={handleSaveAll}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-200 transition-all"
                            >
                                <CheckIcon className="w-4 h-4" />
                                Save All ({totalDirty})
                            </button>
                        )}
                    </div>
                </div>

                {/* Content area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <ArrowPathIcon className="w-8 h-8 text-indigo-400 animate-spin" />
                            <p className="text-sm text-slate-500">Loading content...</p>
                        </div>
                    ) : allEntries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                            <DocumentTextIcon className="w-12 h-12 text-slate-300" />
                            <div>
                                <p className="text-slate-600 font-semibold text-lg">No content yet</p>
                                <p className="text-slate-400 text-sm mt-1">Click "Seed Defaults" in the sidebar to populate this page with default content.</p>
                            </div>
                            <button onClick={handleSeed} disabled={seeding}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all">
                                {seeding ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ArrowPathIcon className="w-4 h-4" />}
                                Seed Default Content
                            </button>
                        </div>
                    ) : Object.keys(sections).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 gap-2 text-center">
                            <MagnifyingGlassIcon className="w-8 h-8 text-slate-300" />
                            <p className="text-slate-500 text-sm">No fields matching "{search}"</p>
                            <button onClick={() => setSearch('')} className="text-indigo-600 text-xs hover:underline">Clear search</button>
                        </div>
                    ) : (
                        Object.entries(sections).map(([sectionName, entries]) => (
                            <SectionAccordion
                                key={sectionName}
                                sectionName={sectionName}
                                entries={entries}
                                localValues={localValues}
                                dirtyIds={dirtyIds}
                                savingIds={savingIds}
                                onValueChange={handleValueChange}
                                onSave={handleSave}
                                onSaveSection={handleSaveMultiple}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
