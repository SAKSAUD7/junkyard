import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../services/api';
import { useCMSContext } from '../../contexts/CMSContext';
import {
    PencilSquareIcon, CheckIcon, MagnifyingGlassIcon,
    PhotoIcon, ArrowUpTrayIcon, LinkIcon, DocumentTextIcon,
    ChevronDownIcon, ChevronRightIcon, ExclamationTriangleIcon,
    CheckCircleIcon, ArrowPathIcon, EyeIcon, TrashIcon,
    FolderOpenIcon, GlobeAltIcon, Squares2X2Icon,
} from '@heroicons/react/24/outline';

// ─── Page definitions ─────────────────────────────────────────────────────────
const PAGES = [
    { key: 'home',         label: 'Home',          icon: '🏠' },
    { key: 'about',        label: 'About',          icon: 'ℹ️' },
    { key: 'contact',      label: 'Contact',        icon: '✉️' },
    { key: 'browse',       label: 'Browse States',  icon: '🗺️' },
    { key: 'vendors',      label: 'Vendors',        icon: '🏭' },
    { key: 'blog',         label: 'Blog',           icon: '📖' },
    { key: 'faq',          label: 'FAQ',            icon: '❓' },
    { key: 'how_it_works', label: 'How It Works',   icon: '⚙️' },
    { key: 'navbar',       label: 'Navbar',         icon: '📌' },
    { key: 'footer',       label: 'Footer',         icon: '🦶' },
    { key: 'global',       label: 'Global / SEO',   icon: '🌐' },
    { key: 'add_a_yard',   label: 'Add A Yard',     icon: '🏗️' },
    { key: 'vendor_portal',label: 'Vendor Portal',  icon: '💼' },
];

const TYPE_META = {
    text:     { label: 'Text',     color: 'bg-slate-100 text-slate-600',    icon: '✏️' },
    textarea: { label: 'Textarea', color: 'bg-green-100 text-green-700',    icon: '📝' },
    html:     { label: 'HTML',     color: 'bg-blue-100 text-blue-700',      icon: '🌐' },
    url:      { label: 'URL',      color: 'bg-cyan-100 text-cyan-700',      icon: '🔗' },
    image:    { label: 'Image',    color: 'bg-purple-100 text-purple-700',  icon: '🖼️' },
    boolean:  { label: 'Boolean',  color: 'bg-orange-100 text-orange-700',  icon: '🔘' },
    json:     { label: 'JSON',     color: 'bg-yellow-100 text-yellow-700',  icon: '{ }' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getToken = () =>
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token') || '';

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-medium
                        pointer-events-auto animate-fade-in-up
                        ${t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-red-600' : 'bg-indigo-600'}`}
                >
                    {t.type === 'success'
                        ? <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                        : <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />}
                    {t.message}
                </div>
            ))}
        </div>
    );
}

// ─── Image Upload Field ───────────────────────────────────────────────────────
// Handles: preview existing image, upload from device, replace, remove, save.
// NEVER uses blob URLs — only real server-returned paths are stored.
function ImageField({ entry, value, onChange, onSave, saving, dirty }) {
    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    // preview always mirrors the real committed server URL
    const [preview, setPreview] = useState(value || '');

    // Sync preview when parent reloads value from server
    useEffect(() => { setPreview(value || ''); }, [value]);

    // ── Upload from device ────────────────────────────────────────────────────
    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX = 10 * 1024 * 1024; // 10 MB
        if (file.size > MAX) {
            setUploadError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.`);
            e.target.value = '';
            return;
        }

        const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];
        if (!ALLOWED.includes(file.type)) {
            setUploadError('Unsupported format. Use PNG, JPG, WebP, GIF, or SVG.');
            e.target.value = '';
            return;
        }

        setUploadError('');
        setUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', file.name.replace(/\.[^/.]+$/, ''));

            const baseURL = import.meta.env.VITE_API_URL || '';

            // Use XHR so we get upload progress
            const imageUrl = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        setUploadProgress(Math.round((e.loaded / e.total) * 100));
                    }
                };
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            // ✅ Correct priority: resolved_url → url → file
                            const url = data.resolved_url || data.url || data.file || '';
                            if (!url) reject(new Error('Server returned no image URL'));
                            else resolve(url);
                        } catch {
                            reject(new Error('Invalid server response'));
                        }
                    } else {
                        reject(new Error(`Upload failed (HTTP ${xhr.status})`));
                    }
                };
                xhr.onerror = () => reject(new Error('Network error during upload'));
                xhr.open('POST', `${baseURL}/api/cms/admin/media/`);
                xhr.setRequestHeader('Authorization', `Bearer ${getToken()}`);
                xhr.send(formData);
            });

            // Update immediately with real server URL — no blob
            setPreview(imageUrl);
            onChange(entry.id, imageUrl);  // marks field dirty
        } catch (err) {
            setUploadError(err.message);
        } finally {
            setUploading(false);
            setUploadProgress(0);
            e.target.value = '';
        }
    };

    // ── Remove / clear ────────────────────────────────────────────────────────
    const handleRemove = () => {
        setPreview('');
        setUploadError('');
        onChange(entry.id, '');  // marks dirty → user presses Save to persist
    };

    const inputClass = 'w-full px-3 py-2 text-sm rounded-lg bg-white border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all';

    return (
        <div className="space-y-3">
            {/* Hidden file picker — device only, no URL input */}
            <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                onChange={handleUpload}
                className="hidden"
            />

            {/* ── 1. PREVIEW ───────────────────────────────────────────────── */}
            {preview ? (
                <div
                    className="relative group rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 cursor-pointer"
                    style={{ minHeight: 160, maxHeight: 240 }}
                    onClick={() => !uploading && fileRef.current?.click()}
                    title="Click to replace image"
                >
                    <img
                        src={preview}
                        alt="Current image"
                        className="w-full object-cover"
                        style={{ maxHeight: 240 }}
                        onError={e => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                        }}
                    />
                    {/* Error fallback */}
                    <div className="hidden absolute inset-0 items-center justify-center flex-col gap-2 text-slate-400 bg-slate-100">
                        <PhotoIcon className="w-8 h-8" />
                        <span className="text-sm">Image could not load</span>
                        <span className="text-xs font-mono break-all px-4 text-center">{preview}</span>
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center pointer-events-none">
                        <div className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 bg-black/70 text-white text-xs font-semibold px-4 py-2 rounded-full">
                            <ArrowUpTrayIcon className="w-4 h-4" />
                            Click to replace
                        </div>
                    </div>
                    {/* Uploading overlay */}
                    {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                            <ArrowPathIcon className="w-8 h-8 text-white animate-spin" />
                            <div className="w-40 bg-white/20 rounded-full h-1.5">
                                <div
                                    className="bg-indigo-400 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <span className="text-white text-xs font-medium">{uploadProgress}%</span>
                        </div>
                    )}
                </div>
            ) : (
                /* ── Empty drop zone ── */
                <div
                    onClick={() => !uploading && fileRef.current?.click()}
                    className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all
                        ${uploading
                            ? 'border-indigo-400 bg-indigo-50'
                            : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50'
                        }`}
                    style={{ minHeight: 140 }}
                >
                    {uploading ? (
                        <>
                            <ArrowPathIcon className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                            <span className="text-sm font-medium text-indigo-600">Uploading… {uploadProgress}%</span>
                            <div className="w-32 bg-indigo-200 rounded-full h-1 mt-2">
                                <div
                                    className="bg-indigo-500 h-1 rounded-full transition-all"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-3">
                                <PhotoIcon className="w-6 h-6 text-indigo-500" />
                            </div>
                            <span className="text-sm font-semibold text-slate-600">No image — click to upload</span>
                            <span className="text-xs text-slate-400 mt-1">PNG · JPG · WebP · GIF · SVG · max 10 MB</span>
                        </>
                    )}
                </div>
            )}

            {/* ── 2. ACTION BUTTONS: Upload/Replace · Remove · Save ──────── */}
            <div className="flex items-center gap-2 flex-wrap">
                {/* Upload / Replace */}
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading || saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700
                        disabled:opacity-50 text-white text-sm font-semibold transition-all flex-shrink-0
                        shadow-sm shadow-indigo-200"
                >
                    {uploading
                        ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        : <ArrowUpTrayIcon className="w-4 h-4" />}
                    {uploading ? `Uploading ${uploadProgress}%` : preview ? 'Replace Image' : 'Upload Image'}
                </button>

                {/* Remove — only when image exists */}
                {preview && !uploading && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200
                            bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700
                            text-sm font-semibold transition-all flex-shrink-0"
                    >
                        <TrashIcon className="w-4 h-4" />
                        Remove
                    </button>
                )}

                {/* Save — only when dirty */}
                {dirty && (
                    <button
                        type="button"
                        onClick={() => onSave(entry.id)}
                        disabled={saving || uploading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700
                            disabled:opacity-50 text-white text-sm font-semibold transition-all flex-shrink-0
                            shadow-sm shadow-emerald-200"
                    >
                        {saving
                            ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
                            : <CheckIcon className="w-4 h-4" />}
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                )}
            </div>

            {/* ── 3. ERROR ─────────────────────────────────────────────────── */}
            {uploadError && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 font-medium">{uploadError}</p>
                </div>
            )}

            {/* ── 4. CURRENT URL (read-only hint, shown when saved) ─────── */}
            {preview && !dirty && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                    <GlobeAltIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-xs text-slate-400 font-mono truncate" title={preview}>
                        {preview}
                    </span>
                    <a
                        href={preview}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-600 hover:underline flex-shrink-0"
                        onClick={e => e.stopPropagation()}
                    >
                        Open ↗
                    </a>
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
                <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                >
                    <EyeIcon className="w-3.5 h-3.5" />
                    {showPreview ? 'Switch to Editor' : 'Preview HTML'}
                </button>
                {dirty && (
                    <button
                        onClick={() => onSave(entryId)}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700
                            text-white text-xs font-semibold disabled:opacity-50 transition-all"
                    >
                        {saving ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : <CheckIcon className="w-3 h-3" />}
                        Save
                    </button>
                )}
            </div>
            {showPreview ? (
                <div
                    className="min-h-[4rem] px-3 py-2.5 text-sm rounded-lg border-2 border-indigo-100 bg-white prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: value || '<em class="text-slate-400">No HTML content</em>' }}
                />
            ) : (
                <textarea
                    value={value || ''}
                    onChange={e => onChange(entryId, e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 text-sm rounded-lg bg-white border border-slate-200
                        focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none
                        transition-all font-mono resize-y"
                    placeholder="Enter HTML content…"
                />
            )}
        </div>
    );
}

// ─── Single Field Row ─────────────────────────────────────────────────────────
function FieldRow({ entry, localValues, dirtyIds, savingIds, onValueChange, onSave }) {
    const value   = localValues[entry.id] ?? entry.value ?? '';
    const dirty   = dirtyIds.has(entry.id);
    const saving  = savingIds.has(entry.id);
    const typeMeta = TYPE_META[entry.content_type] || TYPE_META.text;

    const inputClass = `w-full px-3 py-2.5 text-sm rounded-lg bg-white border transition-all outline-none
        ${dirty
            ? 'border-amber-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
            : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'}`;

    return (
        <div className={`rounded-xl border-2 transition-all duration-200
            ${dirty
                ? 'border-amber-300 bg-amber-50/40 shadow-sm shadow-amber-100'
                : 'border-slate-100 bg-white hover:border-slate-200'}`}
        >
            {/* Field header */}
            <div className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-2">
                <div className="flex items-start gap-2.5 min-w-0">
                    <span className="text-lg flex-shrink-0 mt-0.5" title={entry.content_type}>
                        {typeMeta.icon}
                    </span>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 leading-tight">
                            {entry.label || entry.key}
                        </p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {entry.section} › {entry.key}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {dirty && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Unsaved
                        </span>
                    )}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${typeMeta.color}`}>
                        {typeMeta.label}
                    </span>
                </div>
            </div>

            {/* Field input by content type */}
            <div className="px-4 pb-4">
                {entry.content_type === 'image' ? (
                    <ImageField
                        entry={entry}
                        value={value}
                        onChange={onValueChange}
                        onSave={onSave}
                        saving={saving}
                        dirty={dirty}
                    />

                ) : entry.content_type === 'html' ? (
                    <HtmlField
                        value={value}
                        onChange={onValueChange}
                        entryId={entry.id}
                        onSave={onSave}
                        saving={saving}
                        dirty={dirty}
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
                                <button
                                    onClick={() => onSave(entry.id)}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700
                                        text-white text-xs font-semibold disabled:opacity-50 transition-all"
                                >
                                    {saving ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : <CheckIcon className="w-3 h-3" />}
                                    Save
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
                                placeholder="https://…"
                            />
                        </div>
                        {value && (
                            <a
                                href={value}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-all flex items-center"
                            >
                                Open ↗
                            </a>
                        )}
                        {dirty && (
                            <button
                                onClick={() => onSave(entry.id)}
                                disabled={saving}
                                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700
                                    text-white flex items-center gap-1.5 text-sm disabled:opacity-50 transition-all"
                            >
                                {saving ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <CheckIcon className="w-3.5 h-3.5" />}
                                Save
                            </button>
                        )}
                    </div>

                ) : entry.content_type === 'boolean' ? (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">
                            {value === 'true' || value === true ? '✅ Visible' : '🚫 Hidden'}
                        </span>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onValueChange(entry.id, value === 'true' ? 'false' : 'true')}
                                className={`relative w-11 h-6 rounded-full transition-all ${
                                    value === 'true' ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                            >
                                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                                    value === 'true' ? 'left-6' : 'left-1'
                                }`} />
                            </button>
                            {dirty && (
                                <button
                                    onClick={() => onSave(entry.id)}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700
                                        text-white text-xs font-semibold disabled:opacity-50 transition-all"
                                >
                                    {saving ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : <CheckIcon className="w-3 h-3" />}
                                    Save
                                </button>
                            )}
                        </div>
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
                            <button
                                onClick={() => onSave(entry.id)}
                                disabled={saving}
                                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700
                                    text-white flex items-center gap-1.5 text-sm font-semibold disabled:opacity-50 transition-all flex-shrink-0"
                            >
                                {saving ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <CheckIcon className="w-3.5 h-3.5" />}
                                Save
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Section Accordion ────────────────────────────────────────────────────────
function SectionAccordion({ sectionName, entries, localValues, dirtyIds, savingIds, onValueChange, onSave, onSaveSection }) {
    const [open, setOpen] = useState(true);
    const dirtyCount = entries.filter(e => dirtyIds.has(e.id)).length;
    const imageCount = entries.filter(e => e.content_type === 'image').length;

    return (
        <div className="border border-slate-200 rounded-2xl overflow-hidden mb-4 shadow-sm">
            {/* Accordion header */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-3 min-w-0">
                    {open
                        ? <ChevronDownIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        : <ChevronRightIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                    <span className="font-bold text-slate-800 capitalize">
                        {sectionName.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400 font-mono">
                            {entries.length} field{entries.length !== 1 ? 's' : ''}
                        </span>
                        {imageCount > 0 && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-600 font-medium">
                                {imageCount} 🖼️
                            </span>
                        )}
                        {dirtyCount > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                                {dirtyCount} unsaved
                            </span>
                        )}
                    </div>
                </div>
                {dirtyCount > 0 && (
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            onSaveSection(entries.filter(en => dirtyIds.has(en.id)).map(en => en.id));
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700
                            text-white text-xs font-semibold transition-all shadow-sm flex-shrink-0"
                    >
                        <CheckIcon className="w-3 h-3" />
                        Save Section ({dirtyCount})
                    </button>
                )}
            </button>

            {open && (
                <div className="p-4 border-t border-slate-100 grid grid-cols-1 xl:grid-cols-2 gap-3 bg-slate-50/50">
                    {entries.map(entry => (
                        <div
                            key={entry.id}
                            className={
                                entry.content_type === 'image' ||
                                entry.content_type === 'textarea' ||
                                entry.content_type === 'html'
                                    ? 'xl:col-span-2'
                                    : ''
                            }
                        >
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

// ─── Media Library Tab ────────────────────────────────────────────────────────
function MediaLibrary({ onToast }) {
    const [assets, setAssets]       = useState([]);
    const [loading, setLoading]     = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting]   = useState(null);
    const [copied, setCopied]       = useState(null);
    const fileRef = useRef(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.cms.getMedia();
            setAssets(Array.isArray(data) ? data : (data.results || []));
        } catch {
            onToast('Failed to load media library', 'error');
        } finally {
            setLoading(false);
        }
    }, [onToast]);

    useEffect(() => { load(); }, [load]);

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setUploading(true);
        let success = 0;
        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) { onToast(`${file.name} is too large (max 10MB)`, 'error'); continue; }
            try {
                await api.cms.uploadMedia(file, file.name.replace(/\.[^/.]+$/, ''));
                success++;
            } catch { onToast(`Failed to upload ${file.name}`, 'error'); }
        }
        if (success) { onToast(`${success} file${success > 1 ? 's' : ''} uploaded ✓`); load(); }
        setUploading(false);
        e.target.value = '';
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        setDeleting(id);
        try {
            await api.cms.deleteMedia(id);
            setAssets(prev => prev.filter(a => a.id !== id));
            onToast('Deleted ✓');
        } catch { onToast('Delete failed', 'error'); }
        finally { setDeleting(null); }
    };

    const copyUrl = (url) => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(url);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FolderOpenIcon className="w-5 h-5 text-indigo-600" />
                        Media Library
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">{assets.length} file{assets.length !== 1 ? 's' : ''} stored</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleUpload}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700
                            disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-200"
                    >
                        {uploading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ArrowUpTrayIcon className="w-4 h-4" />}
                        {uploading ? 'Uploading…' : 'Upload Images'}
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-48 gap-3">
                        <ArrowPathIcon className="w-6 h-6 text-indigo-400 animate-spin" />
                        <span className="text-slate-500 text-sm">Loading media…</span>
                    </div>
                ) : assets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <PhotoIcon className="w-8 h-8 text-slate-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-slate-600 font-semibold">No media yet</p>
                            <p className="text-slate-400 text-sm mt-1">Upload images using the button above</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                        {assets.map(asset => {
                            const url = asset.resolved_url || asset.url || asset.file || '';
                            return (
                                <div
                                    key={asset.id}
                                    className="group relative rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all"
                                >
                                    {/* Preview */}
                                    <div className="aspect-square bg-slate-100 overflow-hidden">
                                        {url ? (
                                            <img
                                                src={url}
                                                alt={asset.name}
                                                className="w-full h-full object-cover"
                                                onError={e => { e.target.src = ''; e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-400"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>'; }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <PhotoIcon className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                        <button
                                            onClick={() => copyUrl(url)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-800
                                                text-xs font-semibold hover:bg-slate-100 transition-all"
                                        >
                                            {copied === url ? <CheckIcon className="w-3.5 h-3.5 text-emerald-600" /> : <LinkIcon className="w-3.5 h-3.5" />}
                                            {copied === url ? 'Copied!' : 'Copy URL'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(asset.id, asset.name)}
                                            disabled={deleting === asset.id}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white
                                                text-xs font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
                                        >
                                            {deleting === asset.id
                                                ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                                                : <TrashIcon className="w-3.5 h-3.5" />}
                                            Delete
                                        </button>
                                    </div>

                                    {/* Name */}
                                    <div className="px-2 py-1.5 border-t border-slate-100">
                                        <p className="text-xs text-slate-600 font-medium truncate" title={asset.name}>
                                            {asset.name}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(asset.uploaded_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main CMS Component ───────────────────────────────────────────────────────
export default function CMS() {
    const { invalidatePage } = useCMSContext();
    const [tab, setTab]           = useState('content'); // 'content' | 'media'
    const [activePage, setActivePage] = useState('home');
    const [allEntries, setAllEntries] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [localValues, setLocalValues] = useState({});
    const [dirtyIds, setDirtyIds] = useState(new Set());
    const [savingIds, setSavingIds] = useState(new Set());
    const [search, setSearch]     = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [toasts, setToasts]     = useState([]);
    const [seeding, setSeeding]   = useState(false);

    // ── Toast ─────────────────────────────────────────────────────────────────
    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    // ── Load page ─────────────────────────────────────────────────────────────
    const loadPage = useCallback(async (page) => {
        setLoading(true);
        setDirtyIds(new Set());
        setSearch('');
        setTypeFilter('all');
        try {
            const data = await api.cms.getAllContent({ page });
            const entries = Array.isArray(data) ? data : (data.results || []);
            setAllEntries(entries);
            const vals = {};
            entries.forEach(e => { vals[e.id] = e.value ?? ''; });
            setLocalValues(vals);
        } catch {
            addToast('Failed to load content. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => { if (tab === 'content') loadPage(activePage); }, [activePage, tab, loadPage]);

    // ── Value change ──────────────────────────────────────────────────────────
    const handleValueChange = useCallback((id, val) => {
        setLocalValues(prev => ({ ...prev, [id]: val }));
        setDirtyIds(prev => new Set([...prev, id]));
    }, []);

    // ── Save single ───────────────────────────────────────────────────────────
    const handleSave = useCallback(async (id) => {
        setSavingIds(prev => new Set([...prev, id]));
        try {
            await api.cms.updateContent(id, { value: localValues[id] });
            setDirtyIds(prev => { const n = new Set(prev); n.delete(id); return n; });
            invalidatePage(activePage);
            addToast('Saved ✓');
        } catch {
            addToast('Save failed', 'error');
        } finally {
            setSavingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
        }
    }, [localValues, addToast, invalidatePage, activePage]);

    // ── Save multiple ─────────────────────────────────────────────────────────
    const handleSaveMultiple = useCallback(async (ids) => {
        const updates = ids.map(id => ({ id, value: localValues[id] }));
        ids.forEach(id => setSavingIds(prev => new Set([...prev, id])));
        try {
            await api.cms.bulkUpdate(updates);
            setDirtyIds(prev => { const n = new Set(prev); ids.forEach(id => n.delete(id)); return n; });
            invalidatePage(activePage);
            addToast(`${ids.length} field${ids.length > 1 ? 's' : ''} saved ✓`);
        } catch {
            addToast('Save failed', 'error');
        } finally {
            ids.forEach(id => setSavingIds(prev => { const n = new Set(prev); n.delete(id); return n; }));
        }
    }, [localValues, addToast, invalidatePage, activePage]);

    const handleSaveAll = () => { const ids = [...dirtyIds]; if (ids.length) handleSaveMultiple(ids); };

    // ── Seed ──────────────────────────────────────────────────────────────────
    const handleSeed = async () => {
        setSeeding(true);
        try {
            await api.cms.seedDefaults();
            addToast('Default content seeded ✓');
            loadPage(activePage);
        } catch { addToast('Seed failed', 'error'); }
        finally { setSeeding(false); }
    };

    // ── Filter + group ────────────────────────────────────────────────────────
    const filtered = allEntries.filter(e => {
        if (typeFilter !== 'all' && e.content_type !== typeFilter) return false;
        if (!search) return true;
        const t = search.toLowerCase();
        return (
            (e.label || '').toLowerCase().includes(t) ||
            e.key.toLowerCase().includes(t) ||
            e.section.toLowerCase().includes(t) ||
            (e.value || '').toLowerCase().includes(t)
        );
    });

    const sections = filtered.reduce((acc, e) => {
        (acc[e.section] = acc[e.section] || []).push(e);
        return acc;
    }, {});

    const totalDirty = dirtyIds.size;
    const currentPage = PAGES.find(p => p.key === activePage);
    const contentTypes = ['all', ...new Set(allEntries.map(e => e.content_type))];

    return (
        <div className="flex h-full bg-slate-50 font-['Inter',sans-serif]" style={{ minHeight: 0 }}>
            <Toast toasts={toasts} />

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside className="w-60 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 overflow-y-auto">
                {/* Logo */}
                <div className="px-4 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
                            <PencilSquareIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <span className="font-extrabold text-slate-800 text-sm">Content Manager</span>
                            <p className="text-xs text-slate-400">Edit site content</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-3 gap-1.5 border-b border-slate-100">
                    <button
                        onClick={() => setTab('content')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all
                            ${tab === 'content' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        <Squares2X2Icon className="w-3.5 h-3.5" />
                        Pages
                    </button>
                    <button
                        onClick={() => setTab('media')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all
                            ${tab === 'media' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        <PhotoIcon className="w-3.5 h-3.5" />
                        Media
                    </button>
                </div>

                {/* Page nav — only in content tab */}
                {tab === 'content' && (
                    <nav className="flex-1 p-2">
                        {PAGES.map(page => (
                            <button
                                key={page.key}
                                onClick={() => setActivePage(page.key)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all mb-0.5
                                    ${activePage === page.key
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                        : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                <span className="text-base">{page.icon}</span>
                                <span className="truncate">{page.label}</span>
                            </button>
                        ))}
                    </nav>
                )}

                {/* Seed button */}
                {tab === 'content' && (
                    <div className="p-3 border-t border-slate-100">
                        <button
                            onClick={handleSeed}
                            disabled={seeding}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium
                                bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all disabled:opacity-50"
                        >
                            {seeding ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <ArrowPathIcon className="w-3.5 h-3.5" />}
                            Seed Defaults
                        </button>
                    </div>
                )}
            </aside>

            {/* ── Main Panel ──────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {tab === 'media' ? (
                    <MediaLibrary onToast={addToast} />
                ) : (
                    <>
                        {/* Header */}
                        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0">
                            <div>
                                <h1 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                                    <span className="text-xl">{currentPage?.icon}</span>
                                    {currentPage?.label} Content
                                </h1>
                                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                                    <span>{allEntries.length} fields</span>
                                    {totalDirty > 0 && (
                                        <span className="text-amber-600 font-semibold">
                                            · {totalDirty} unsaved change{totalDirty > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap justify-end">
                                {/* Type filter */}
                                {contentTypes.length > 2 && (
                                    <select
                                        value={typeFilter}
                                        onChange={e => setTypeFilter(e.target.value)}
                                        className="px-3 py-2 text-xs border border-slate-200 rounded-xl text-slate-600 outline-none
                                            focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white capitalize cursor-pointer"
                                    >
                                        {contentTypes.map(t => (
                                            <option key={t} value={t}>{t === 'all' ? 'All types' : t}</option>
                                        ))}
                                    </select>
                                )}
                                {/* Search */}
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search fields…"
                                        className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl w-48
                                            focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                    />
                                </div>
                                {/* Save All */}
                                {totalDirty > 0 && (
                                    <button
                                        onClick={handleSaveAll}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700
                                            text-white text-sm font-extrabold shadow-md shadow-emerald-200 transition-all"
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
                                    <p className="text-sm text-slate-500">Loading content…</p>
                                </div>
                            ) : allEntries.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 gap-5 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                                        <DocumentTextIcon className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-700 font-bold text-lg">No content for this page</p>
                                        <p className="text-slate-400 text-sm mt-1">
                                            Click "Seed Defaults" in the sidebar to populate with default content.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleSeed}
                                        disabled={seeding}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700
                                            text-white text-sm font-semibold transition-all shadow-md shadow-indigo-200"
                                    >
                                        {seeding ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ArrowPathIcon className="w-4 h-4" />}
                                        Seed Default Content
                                    </button>
                                </div>
                            ) : Object.keys(sections).length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 gap-3 text-center">
                                    <MagnifyingGlassIcon className="w-8 h-8 text-slate-300" />
                                    <p className="text-slate-500 text-sm">
                                        No fields matching <strong>"{search}"</strong>
                                        {typeFilter !== 'all' && ` with type "${typeFilter}"`}
                                    </p>
                                    <button
                                        onClick={() => { setSearch(''); setTypeFilter('all'); }}
                                        className="text-indigo-600 text-xs hover:underline font-medium"
                                    >
                                        Clear filters
                                    </button>
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
                    </>
                )}
            </div>
        </div>
    );
}
