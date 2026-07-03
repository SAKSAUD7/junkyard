import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { api } from '../../services/api';
import { useCMSContext } from '../../contexts/CMSContext';
import {
    PencilSquareIcon, CheckIcon, MagnifyingGlassIcon,
    PhotoIcon, ArrowUpTrayIcon, LinkIcon, DocumentTextIcon,
    ChevronDownIcon, ChevronRightIcon, ExclamationTriangleIcon,
    CheckCircleIcon, ArrowPathIcon, EyeIcon, TrashIcon,
    FolderOpenIcon, GlobeAltIcon, Squares2X2Icon, BoltIcon, LinkIcon as ArrowTopRightOnSquareIcon,
    HomeIcon, InformationCircleIcon, EnvelopeIcon, MapIcon, BuildingOffice2Icon,
    BookOpenIcon, QuestionMarkCircleIcon, CogIcon, StarIcon, BookmarkIcon,
    FilmIcon, XMarkIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeSolid, InformationCircleIcon as InfoSolid, EnvelopeIcon as MailSolid,
    MapIcon as MapSolid, BuildingOffice2Icon as BuildingSolid, QuestionMarkCircleIcon as QuestionSolid,
    CogIcon as CogSolid, StarIcon as StarSolid, BookmarkIcon as BookmarkSolid,
    GlobeAltIcon as GlobeSolid, Squares2X2Icon as SquaresSolid, DocumentTextIcon as DocSolid
} from '@heroicons/react/24/solid';

// ─── Page definitions ─────────────────────────────────────────────────────────
const PAGES = [
    { key: 'home',         label: 'Home',          icon: HomeSolid,     color: 'from-blue-500 to-indigo-600',   shadow: 'shadow-blue-500/30' },
    { key: 'about',        label: 'About',         icon: InfoSolid,     color: 'from-emerald-400 to-teal-500',  shadow: 'shadow-emerald-500/30' },
    { key: 'contact',      label: 'Contact',       icon: MailSolid,     color: 'from-rose-400 to-pink-500',     shadow: 'shadow-pink-500/30' },
    { key: 'browse',       label: 'Browse States', icon: MapSolid,      color: 'from-amber-400 to-orange-500',  shadow: 'shadow-orange-500/30' },
    { key: 'vendors',      label: 'Vendors',       icon: BuildingSolid, color: 'from-purple-500 to-fuchsia-600',shadow: 'shadow-purple-500/30' },
    { key: 'faq',          label: 'FAQ',           icon: QuestionSolid, color: 'from-cyan-400 to-blue-500',    shadow: 'shadow-cyan-500/30' },
    { key: 'how_it_works', label: 'How It Works',  icon: CogSolid,      color: 'from-slate-600 to-slate-800',   shadow: 'shadow-slate-500/30' },
    { key: 'navbar',       label: 'Navbar',        icon: BookmarkSolid, color: 'from-indigo-400 to-purple-500', shadow: 'shadow-indigo-500/30' },
    { key: 'footer',       label: 'Footer',        icon: StarSolid,     color: 'from-sky-400 to-blue-600',      shadow: 'shadow-blue-500/30' },
    { key: 'global',       label: 'Universal Logo',icon: GlobeSolid,    color: 'from-teal-400 to-emerald-600',  shadow: 'shadow-teal-500/30' },
    { key: 'add_a_yard',   label: 'Add A Yard',    icon: SquaresSolid,  color: 'from-orange-400 to-red-500',    shadow: 'shadow-red-500/30' },
    { key: 'vendor_portal',label: 'Vendor Portal', icon: BuildingSolid, color: 'from-fuchsia-500 to-pink-600',  shadow: 'shadow-fuchsia-500/30' },
    { key: 'quote_request',label: 'Quote Request', icon: DocSolid,      color: 'from-green-400 to-emerald-600', shadow: 'shadow-emerald-500/30' },
];

const TYPE_META = {
    text:     { label: 'Text',     color: 'bg-slate-100 text-slate-600',    icon: <PencilSquareIcon className="w-5 h-5" /> },
    textarea: { label: 'Textarea', color: 'bg-green-100 text-green-700',    icon: <DocumentTextIcon className="w-5 h-5" /> },
    html:     { label: 'Visual',   color: 'bg-blue-100 text-blue-700',      icon: <Squares2X2Icon className="w-5 h-5" /> },
    url:      { label: 'URL',      color: 'bg-cyan-100 text-cyan-700',      icon: <LinkIcon className="w-5 h-5" /> },
    image:    { label: 'Image',    color: 'bg-purple-100 text-purple-700',  icon: <PhotoIcon className="w-5 h-5" /> },
    video:    { label: 'Video',    color: 'bg-pink-100 text-pink-700',      icon: <FilmIcon className="w-5 h-5" /> },
    boolean:  { label: 'Toggle',   color: 'bg-orange-100 text-orange-700',  icon: <CheckCircleIcon className="w-5 h-5" /> },
    json:     { label: 'JSON',     color: 'bg-yellow-100 text-yellow-700',  icon: <DocumentTextIcon className="w-5 h-5" /> },
};

// Helper: detect if a key / value looks like a video field
const isVideoField = (entry) => {
    const key = (entry.key || '').toLowerCase();
    const label = (entry.label || '').toLowerCase();
    const val  = (entry.value || '').toLowerCase();
    return (
        key.includes('video') ||
        label.includes('video') ||
        val.endsWith('.mp4') ||
        val.endsWith('.webm') ||
        val.endsWith('.mov') ||
        val.endsWith('.ogg')
    );
};

// Helper: detect if a key / value looks like an image field (beyond content_type='image')
const isImageUrlField = (entry) => {
    const key = (entry.key || '').toLowerCase();
    const label = (entry.label || '').toLowerCase();
    return (
        key.includes('image') ||
        key.includes('photo') ||
        key.includes('logo') ||
        label.includes('image') ||
        label.includes('photo') ||
        label.includes('logo')
    );
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-slate-900 text-sm font-medium
                        pointer-events-auto animate-fade-in-up
                        ${t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}
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
                        <div className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 bg-black/70 text-slate-900 text-xs font-semibold px-4 py-2 rounded-full">
                            <ArrowUpTrayIcon className="w-4 h-4" />
                            Click to replace
                        </div>
                    </div>
                    {/* Uploading overlay */}
                    {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                            <ArrowPathIcon className="w-8 h-8 text-slate-900 animate-spin" />
                            <div className="w-40 bg-white/20 rounded-full h-1.5">
                                <div
                                    className="bg-indigo-400 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <span className="text-slate-900 text-xs font-medium">{uploadProgress}%</span>
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
                            <span className="text-sm font-medium text-blue-600">Uploading… {uploadProgress}%</span>
                            <div className="w-32 bg-indigo-200 rounded-full h-1 mt-2">
                                <div
                                    className="bg-blue-600 h-1 rounded-full transition-all"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-3">
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
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-indigo-700
                        disabled:opacity-50 text-slate-900 text-sm font-semibold transition-all flex-shrink-0
                        shadow-sm shadow-blue-200"
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
                            disabled:opacity-50 text-slate-900 text-sm font-semibold transition-all flex-shrink-0
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
                        className="text-xs text-blue-600 hover:underline flex-shrink-0"
                        onClick={e => e.stopPropagation()}
                    >
                        Open ↗
                    </a>
                </div>
            )}
        </div>
    );
}

// ─── Video Upload / Preview Field ─────────────────────────────────────────────
function VideoField({ entry, value, onChange, onSave, saving, dirty }) {
    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [preview, setPreview] = useState(value || '');

    useEffect(() => { setPreview(value || ''); }, [value]);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const MAX = 200 * 1024 * 1024; // 200 MB
        if (file.size > MAX) { setUploadError(`File too large (${(file.size/1024/1024).toFixed(0)} MB). Max 200 MB.`); e.target.value=''; return; }
        const ALLOWED = ['video/mp4','video/webm','video/ogg','video/quicktime'];
        if (!ALLOWED.includes(file.type)) { setUploadError('Unsupported format. Use MP4, WebM, OGG, or MOV.'); e.target.value=''; return; }
        setUploadError(''); setUploading(true); setUploadProgress(0);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', file.name.replace(/\.[^/.]+$/, ''));
            const baseURL = import.meta.env.VITE_API_URL || '';
            const videoUrl = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded/ev.total)*100)); };
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try { const d = JSON.parse(xhr.responseText); const u = d.resolved_url||d.url||d.file||''; if (!u) reject(new Error('No URL returned')); else resolve(u); }
                        catch { reject(new Error('Invalid response')); }
                    } else reject(new Error(`Upload failed (HTTP ${xhr.status})`));
                };
                xhr.onerror = () => reject(new Error('Network error'));
                xhr.open('POST', `${baseURL}/api/cms/admin/media/`);
                xhr.setRequestHeader('Authorization', `Bearer ${getToken()}`);
                xhr.send(formData);
            });
            setPreview(videoUrl);
            onChange(entry.id, videoUrl);
        } catch (err) { setUploadError(err.message); }
        finally { setUploading(false); setUploadProgress(0); e.target.value=''; }
    };

    const handleRemove = () => { setPreview(''); setUploadError(''); onChange(entry.id, ''); };

    return (
        <div className="space-y-3">
            <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime" onChange={handleUpload} className="hidden" />

            {preview ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 bg-black group">
                    <video
                        key={preview}
                        src={preview}
                        controls
                        className="w-full max-h-72 object-contain"
                    />
                    {uploading && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
                            <ArrowPathIcon className="w-8 h-8 text-white animate-spin" />
                            <div className="w-40 bg-white/20 rounded-full h-1.5">
                                <div className="bg-indigo-400 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                            </div>
                            <span className="text-white text-xs font-medium">{uploadProgress}%</span>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    onClick={() => !uploading && fileRef.current?.click()}
                    className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                        uploading ? 'border-pink-400 bg-pink-50' : 'border-slate-300 bg-slate-50 hover:border-pink-400 hover:bg-pink-50'
                    }`}
                    style={{ minHeight: 140 }}
                >
                    {uploading ? (
                        <>
                            <ArrowPathIcon className="w-8 h-8 text-pink-500 animate-spin mb-2" />
                            <span className="text-sm font-medium text-pink-600">Uploading… {uploadProgress}%</span>
                            <div className="w-32 bg-pink-200 rounded-full h-1 mt-2">
                                <div className="bg-pink-500 h-1 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center mb-3">
                                <FilmIcon className="w-6 h-6 text-pink-500" />
                            </div>
                            <span className="text-sm font-semibold text-slate-600">No video — click to upload</span>
                            <span className="text-xs text-slate-400 mt-1">MP4 · WebM · MOV · max 200 MB</span>
                        </>
                    )}
                </div>
            )}

            {/* Current URL (editable) */}
            <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    value={preview}
                    onChange={e => { setPreview(e.target.value); onChange(entry.id, e.target.value); }}
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg bg-white border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all font-mono"
                    placeholder="/Video/filename.mp4 or https://…"
                />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading || saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold transition-all shadow-sm shadow-pink-200 disabled:opacity-50">
                    {uploading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ArrowUpTrayIcon className="w-4 h-4" />}
                    {uploading ? `Uploading ${uploadProgress}%` : preview ? 'Replace Video' : 'Upload Video'}
                </button>
                {preview && !uploading && (
                    <button type="button" onClick={handleRemove} disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold transition-all disabled:opacity-50">
                        <TrashIcon className="w-4 h-4" /> Remove
                    </button>
                )}
                {dirty && (
                    <button type="button" onClick={() => onSave(entry.id)} disabled={saving || uploading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50">
                        {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                )}
            </div>
            {uploadError && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 font-medium">{uploadError}</p>
                </div>
            )}
        </div>
    );
}

// ─── JSON Editor Field ──────────────────────────────────────────────────────────
function JsonField({ value, onChange, entryId, onSave, saving, dirty }) {
    const [jsonError, setJsonError] = useState('');
    const [localString, setLocalString] = useState('');

    // Format gracefully on mount/value change from parent
    useEffect(() => {
        try {
            const parsed = typeof value === 'string' ? JSON.parse(value) : value;
            setLocalString(JSON.stringify(parsed, null, 2));
            setJsonError('');
        } catch {
            setLocalString(value || '');
            if (value) setJsonError('Invalid JSON format');
        }
    }, [value]);

    const handleChange = (newVal) => {
        setLocalString(newVal);
        try {
            JSON.parse(newVal);
            setJsonError('');
            onChange(entryId, newVal); // Pass raw string to parent
        } catch (e) {
            setJsonError(e.message);
            onChange(entryId, newVal); // Still mark dirty, but parent will save broken string
        }
    };

    const handleFormat = () => {
        try {
            const parsed = JSON.parse(localString);
            const formatted = JSON.stringify(parsed, null, 2);
            setLocalString(formatted);
            onChange(entryId, formatted);
            setJsonError('');
        } catch (e) {
            setJsonError('Cannot format: ' + e.message);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <button
                    onClick={handleFormat}
                    className="text-xs font-semibold text-blue-600 hover:text-indigo-800 transition-colors"
                >
                    {'{ }'} Pretty Print Format
                </button>
                {dirty && (
                    <button
                        onClick={() => !jsonError && onSave(entryId)}
                        disabled={saving || !!jsonError}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700
                            text-slate-900 text-xs font-semibold disabled:opacity-50 transition-all"
                    >
                        {saving ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : <CheckIcon className="w-3 h-3" />}
                        Save JSON
                    </button>
                )}
            </div>
            <textarea
                value={localString}
                onChange={e => handleChange(e.target.value)}
                rows={8}
                className={`w-full px-3 py-2.5 text-sm rounded-lg bg-slate-800 text-green-400 font-mono resize-y focus:outline-none focus:ring-2 border-2 ${
                    jsonError ? 'border-red-500 focus:ring-red-200' : 'border-slate-700 focus:ring-blue-500'
                }`}
                placeholder="{ ... }"
                spellCheck={false}
            />
            {jsonError && (
                <p className="text-xs text-red-500 font-medium">⚠️ {jsonError}</p>
            )}
        </div>
    );
}

// ─── HTML Rich Text Field ───────────────────────────────────────────────────────
const QUILL_MODULES = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'clean']
    ],
};

function HtmlField({ value, onChange, entryId, onSave, saving, dirty }) {
    // Memoize modules and formats to prevent ReactQuill from re-registering
    // on every render, which is what triggers the findDOMNode warning.
    const quillModules = useMemo(() => QUILL_MODULES, []);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Visual Editor</span>
                {dirty && (
                    <button
                        onClick={() => onSave(entryId)}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700
                            text-white text-xs font-semibold disabled:opacity-50 transition-all shadow-sm"
                    >
                        {saving ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : <CheckIcon className="w-3 h-3" />}
                        Save Content
                    </button>
                )}
            </div>
            
            <div className={`rounded-lg overflow-hidden bg-white transition-all ${
                dirty ? 'border-2 border-indigo-300 ring-2 ring-indigo-50 shadow-sm' : 'border border-slate-200'
            }`}>
                <ReactQuill 
                    theme="snow" 
                    value={value || ''} 
                    onChange={(content) => onChange(entryId, content)}
                    modules={quillModules}
                    className="min-h-[150px] custom-quill"
                    preserveWhitespace
                />
            </div>
        </div>
    );
}

// ─── Single Field Row ─────────────────────────────────────────────────────────
function FieldRow({ entry, localValues, dirtyIds, savingIds, onValueChange, onSave }) {
    const value   = localValues[entry.id] ?? entry.value ?? '';
    const dirty   = dirtyIds.has(entry.id);
    const saving  = savingIds.has(entry.id);
    const typeMeta = TYPE_META[entry.content_type] || TYPE_META.text;

    const inputClass = `w-full px-4 py-3 text-sm rounded-lg bg-white border transition-all outline-none shadow-sm
        ${dirty
            ? 'border-indigo-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
            : 'border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10'}`;

    return (
        <div className="mb-2 relative">
            {/* Label Row */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-slate-400" title={entry.content_type}>
                        {typeMeta.icon}
                    </span>
                    <label className="text-sm font-semibold text-slate-800">
                        {entry.label || entry.key}
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono tracking-wider px-2 bg-slate-100 rounded-md">
                        {entry.key}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {dirty && (
                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            Unsaved
                        </span>
                    )}
                </div>
            </div>

            {/* Field input by content type */}
            <div className="relative">
                {(entry.content_type === 'image' || (entry.content_type !== 'url' && isImageUrlField(entry))) ? (
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

                ) : entry.content_type === 'json' ? (
                    <JsonField
                        value={value}
                        onChange={onValueChange}
                        entryId={entry.id}
                        onSave={onSave}
                        saving={saving}
                        dirty={dirty}
                    />

                ) : entry.content_type === 'textarea' ? (
                    <div className="space-y-3">
                        <textarea
                            value={value}
                            onChange={e => onValueChange(entry.id, e.target.value)}
                            rows={4}
                            className={inputClass + ' resize-y'}
                            placeholder={entry.label || entry.key}
                        />
                        {dirty && (
                            <div className="flex justify-end">
                                <button
                                    onClick={() => onSave(entry.id)}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700
                                        text-white text-xs font-semibold disabled:opacity-50 transition-all shadow-sm"
                                >
                                    {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
                                    Save
                                </button>
                            </div>
                        )}
                    </div>

                ) : (entry.content_type === 'url' && isVideoField(entry)) ? (
                    <VideoField
                        entry={entry}
                        value={value}
                        onChange={onValueChange}
                        onSave={onSave}
                        saving={saving}
                        dirty={dirty}
                    />

                ) : entry.content_type === 'url' ? (
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="url"
                                value={value}
                                onChange={e => onValueChange(entry.id, e.target.value)}
                                className={inputClass + ' pl-9'}
                                placeholder="https://… or /path/to/file"
                            />
                        </div>
                        {value && (
                            <a href={value} target="_blank" rel="noreferrer"
                                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold transition-all flex items-center">
                                Open ↗
                            </a>
                        )}
                        {dirty && (
                            <button onClick={() => onSave(entry.id)} disabled={saving}
                                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 text-sm font-semibold disabled:opacity-50 transition-all shadow-sm">
                                {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
                                Save
                            </button>
                        )}
                    </div>

                ) : entry.content_type === 'boolean' ? (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <span className="text-sm font-semibold text-slate-700">
                            {value === 'true' || value === true ? '✅ Visible' : '🚫 Hidden'}
                        </span>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onValueChange(entry.id, value === 'true' ? 'false' : 'true')}
                                className={`relative w-12 h-6 rounded-full transition-all ${
                                    value === 'true' ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                            >
                                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                                    value === 'true' ? 'left-7' : 'left-1'
                                }`} />
                            </button>
                            {dirty && (
                                <button
                                    onClick={() => onSave(entry.id)}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700
                                        text-white text-xs font-semibold disabled:opacity-50 transition-all shadow-sm"
                                >
                                    {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
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
                                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700
                                    text-white flex items-center gap-1.5 text-sm font-semibold disabled:opacity-50 transition-all flex-shrink-0 shadow-sm"
                            >
                                {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
                                Save
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Section Card ────────────────────────────────────────────────────────
function SectionAccordion({ sectionName, entries, localValues, dirtyIds, savingIds, onValueChange, onSave, onSaveSection }) {
    const dirtyCount = entries.filter(e => dirtyIds.has(e.id)).length;

    return (
        <div className="bg-white border border-slate-200 rounded-xl mb-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">
            {/* Section header */}
            <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="font-extrabold text-slate-900 text-lg capitalize tracking-tight">
                        {sectionName.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold px-2 py-1 bg-slate-200/50 rounded-md">
                        {entries.length} field{entries.length !== 1 ? 's' : ''}
                    </span>
                    {dirtyCount > 0 && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-bold shadow-sm">
                            {dirtyCount} unsaved
                        </span>
                    )}
                </div>
                {dirtyCount > 0 && (
                    <button
                        onClick={() => {
                            onSaveSection(entries.filter(en => dirtyIds.has(en.id)).map(en => en.id));
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700
                            text-white text-sm font-semibold transition-all shadow-md flex-shrink-0"
                    >
                        <CheckIcon className="w-4 h-4" />
                        Save All Changes
                    </button>
                )}
            </div>

            <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-8">
                {(() => {
                    // Group fields intelligently
                    const grouped = [];
                    const usedIds = new Set();

                    entries.forEach(entry => {
                        if (usedIds.has(entry.id)) return;
                        
                        let pair = null;
                        if (entry.key.startsWith('label_')) {
                            const suffix = entry.key.replace('label_', '');
                            pair = entries.find(e => e.key === `value_${suffix}`);
                        } else if (entry.key.startsWith('value_')) {
                            const suffix = entry.key.replace('value_', '');
                            pair = entries.find(e => e.key === `label_${suffix}`);
                        } else if (entry.key.includes('_title')) {
                            const base = entry.key.replace('_title', '');
                            pair = entries.find(e => e.key === `${base}_desc`);
                        } else if (entry.key.includes('_desc')) {
                            const base = entry.key.replace('_desc', '');
                            pair = entries.find(e => e.key === `${base}_title`);
                        }
                        
                        if (pair && !usedIds.has(pair.id)) {
                            const first = (entry.key.includes('label') || entry.key.includes('title')) ? entry : pair;
                            const second = first.id === entry.id ? pair : entry;
                            grouped.push({ type: 'pair', items: [first, second] });
                            usedIds.add(first.id);
                            usedIds.add(second.id);
                        } else {
                            grouped.push({ type: 'single', item: entry });
                            usedIds.add(entry.id);
                        }
                    });

                    return grouped.map((group, idx) => {
                        if (group.type === 'pair') {
                            const isWide = group.items.some(e => e.content_type === 'textarea' || e.content_type === 'html' || e.content_type === 'image');
                            return (
                                <div key={`pair-${idx}`} className={`grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-5 bg-slate-50/50 border border-slate-200/60 rounded-xl xl:col-span-2 relative`}>
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-300 rounded-l-xl"></div>
                                    <div className="md:col-span-2">
                                        <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest ml-2">Paired Group</h4>
                                    </div>
                                    <div className={isWide && group.items[0].content_type === 'textarea' ? 'md:col-span-2' : ''}>
                                        <FieldRow entry={group.items[0]} localValues={localValues} dirtyIds={dirtyIds} savingIds={savingIds} onValueChange={onValueChange} onSave={onSave} />
                                    </div>
                                    <div className={isWide && group.items[1].content_type === 'textarea' ? 'md:col-span-2' : ''}>
                                        <FieldRow entry={group.items[1]} localValues={localValues} dirtyIds={dirtyIds} savingIds={savingIds} onValueChange={onValueChange} onSave={onSave} />
                                    </div>
                                </div>
                            );
                        } else {
                            const entry = group.item;
                            return (
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
                            );
                        }
                    });
                })()}
            </div>
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
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        <FolderOpenIcon className="w-5 h-5 text-blue-600" />
                        Media Library
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">{assets.length} file{assets.length !== 1 ? 's' : ''} stored</p>
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
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700
                            disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-sm"
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
                        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center">
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
                                    className="group relative rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-sm transition-all"
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
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-900
                                                text-xs font-semibold hover:bg-slate-100 transition-all"
                                        >
                                            {copied === url ? <CheckIcon className="w-3.5 h-3.5 text-emerald-600" /> : <LinkIcon className="w-3.5 h-3.5" />}
                                            {copied === url ? 'Copied!' : 'Copy URL'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(asset.id, asset.name)}
                                            disabled={deleting === asset.id}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-slate-900
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
    const [activePage, setActivePage] = useState('dashboard');
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

    useEffect(() => { if (tab === 'content' && activePage !== 'dashboard') loadPage(activePage); }, [activePage, tab, loadPage]);

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
            if (activePage !== 'dashboard') loadPage(activePage);
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
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 overflow-y-auto">
                <div className="px-5 py-5 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/30">
                        <PencilSquareIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="font-extrabold text-slate-900 text-base block leading-tight">JYNM Admin</span>
                        <span className="text-xs text-slate-400 font-medium">Content Manager</span>
                    </div>
                </div>

                <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
                    {/* OVERVIEW */}
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Overview</h3>
                        <nav className="space-y-0.5">
                            <button onClick={() => { setActivePage('dashboard'); setTab('content'); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${activePage === 'dashboard' && tab === 'content' ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-500/20' : 'text-slate-600 hover:bg-slate-100 font-medium'}`}>
                                <GlobeAltIcon className="w-4 h-4 flex-shrink-0" /> Website Content
                            </button>
                        </nav>
                    </div>

                    {/* PAGES */}
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Pages</h3>
                        <nav className="space-y-0.5">
                            {PAGES.filter(p => !['navbar','footer','global'].includes(p.key)).map(page => (
                                <button
                                    key={page.key}
                                    onClick={() => { setActivePage(page.key); setTab('content'); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${activePage === page.key && tab === 'content' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:bg-slate-100 font-medium'}`}
                                >
                                    {(() => { const Icon = page.icon; return <span className={`flex-shrink-0 ${activePage === page.key && tab === 'content' ? 'text-indigo-600' : 'text-slate-400'}`}><Icon className="w-4 h-4" /></span>; })()}
                                    {page.label}
                                    {activePage === page.key && tab === 'content' && dirtyIds.size > 0 && (
                                        <span className="ml-auto w-2 h-2 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* GLOBAL */}
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Global Settings</h3>
                        <nav className="space-y-0.5">
                            {PAGES.filter(p => ['navbar','footer','global'].includes(p.key)).map(page => (
                                <button
                                    key={page.key}
                                    onClick={() => { setActivePage(page.key); setTab('content'); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${activePage === page.key && tab === 'content' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:bg-slate-100 font-medium'}`}
                                >
                                    {(() => { const Icon = page.icon; return <span className={`flex-shrink-0 ${activePage === page.key && tab === 'content' ? 'text-indigo-600' : 'text-slate-400'}`}><Icon className="w-4 h-4" /></span>; })()}
                                    {page.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Seed button */}
                <div className="p-3 border-t border-slate-100">
                    <button onClick={handleSeed} disabled={seeding} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700 transition-all disabled:opacity-50">
                        {seeding ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ArrowPathIcon className="w-4 h-4" />} Seed Defaults
                    </button>
                </div>
            </aside>

            {/* ── Main Panel ──────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {tab === 'media' ? (
                    <MediaLibrary onToast={addToast} />
                ) : activePage === 'dashboard' ? (
                    <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
                        <div className="max-w-6xl mx-auto">
                            <div className="mb-8">
                                <h1 className="text-3xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>CMS Dashboard</h1>
                                <p className="text-slate-500">Manage all website content from one place</p>
                            </div>


                            
                            <div className="mb-10">
                                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <DocumentTextIcon className="w-4 h-4" /> Pages
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {PAGES.filter(p => !['navbar','footer','global'].includes(p.key)).map(page => {
                                        const Icon = page.icon;
                                        return (
                                        <button key={page.key} onClick={() => setActivePage(page.key)} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1.5 transition-all text-left flex flex-col group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                                            <div className="flex justify-between items-start mb-5 w-full relative z-10">
                                                <span className={`bg-gradient-to-br ${page.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${page.shadow} group-hover:scale-110 transition-transform duration-300`}>
                                                    <Icon className="w-7 h-7" />
                                                </span>
                                                <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md uppercase tracking-wider">Active</span>
                                            </div>
                                            <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>{page.label}</h3>
                                            <p className="text-xs text-slate-400 font-mono">/{page.key.replace('_', '-')}</p>
                                        </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Squares2X2Icon className="w-4 h-4" /> Content Collections
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {PAGES.filter(p => ['navbar','footer','global'].includes(p.key)).map(page => {
                                        const Icon = page.icon;
                                        return (
                                        <button key={page.key} onClick={() => setActivePage(page.key)} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-lg hover:border-indigo-200 hover:-translate-y-1 transition-all text-left flex items-center gap-4 group">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${page.color} flex items-center justify-center text-white shadow-md ${page.shadow} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-base mb-0.5 group-hover:text-indigo-600 transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>{page.label}</h3>
                                                <p className="text-xs text-slate-400 truncate">Manage {page.label.toLowerCase()}</p>
                                            </div>
                                        </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Editor Header */}
                        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0 z-10 relative">
                            <div>
                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    <button onClick={() => setActivePage('dashboard')} className="hover:text-blue-600 transition-colors">Dashboard</button>
                                    <ChevronRightIcon className="w-3 h-3" />
                                    <span className="text-slate-600">{currentPage?.label}</span>
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {currentPage && (() => { const Icon = currentPage.icon; return <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br ${currentPage.color} text-white flex-shrink-0`}><Icon className="w-4 h-4" /></span>; })()}
                                    {currentPage?.label} Content
                                </h1>
                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                    <span>{allEntries.length} fields</span>
                                    {totalDirty > 0 && (
                                        <span className="inline-flex items-center gap-1.5 text-indigo-600 font-bold">
                                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                            {totalDirty} unsaved change{totalDirty > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap justify-end">
                                {/* Type filter chips */}
                                {contentTypes.length > 2 && (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {contentTypes.map(t => {
                                            const meta = TYPE_META[t];
                                            const isActive = typeFilter === t;
                                            return (
                                                <button
                                                    key={t}
                                                    onClick={() => setTypeFilter(t)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                                                        isActive
                                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                                            : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                                                    }`}
                                                >
                                                    {t === 'all' ? 'All' : (meta?.label || t)}
                                                </button>
                                            );
                                        })}
                                    </div>
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
                                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700
                                            text-white text-sm font-bold shadow-md shadow-indigo-500/20 transition-all"
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
                                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center">
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
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-indigo-700
                                            text-slate-900 text-sm font-semibold transition-all shadow-sm shadow-blue-200"
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
                                        className="text-blue-600 text-xs hover:underline font-medium"
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
