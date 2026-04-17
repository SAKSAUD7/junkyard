import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../../services/api'

// ─── Page Config — matches actual website pages & components ──────────────────
const PAGES = [
  {
    id: 'home', label: 'Home Page', icon: '🏠',
    desc: 'Hero headline, CTA buttons, Trust Pillars, How It Works steps, CTA Banner',
    color: '#2563eb'
  },
  {
    id: 'about', label: 'About Page', icon: '📖',
    desc: 'Hero heading, Stats bar, Mission text & paragraphs, SEO meta',
    color: '#7c3aed'
  },
  {
    id: 'contact', label: 'Contact Page', icon: '📞',
    desc: 'Hero, Contact info (address, email, phone), SEO meta',
    color: '#059669'
  },
  {
    id: 'browse', label: 'Browse States', icon: '🗺️',
    desc: 'Hero heading & subheading on the browse-by-state page',
    color: '#0891b2'
  },
  {
    id: 'vendors', label: 'Vendors / Listings', icon: '🏪',
    desc: 'Hero heading & subheading on the all-vendors listing page',
    color: '#dc2626'
  },
  {
    id: 'blog', label: 'Blog', icon: '📝',
    desc: 'Hero heading, SEO title & meta description for blog section',
    color: '#ea580c'
  },
  {
    id: 'faq', label: 'FAQ', icon: '❓',
    desc: 'Hero heading & subheading on the FAQ page',
    color: '#ca8a04'
  },
  {
    id: 'how_it_works', label: 'How It Works', icon: '⚙️',
    desc: 'Hero heading, all 4 process step titles & descriptions',
    color: '#16a34a'
  },
  {
    id: 'navbar', label: 'Navbar (Global)', icon: '🔗',
    desc: 'Brand tagline, navigation CTA labels shown in header',
    color: '#475569'
  },
  {
    id: 'footer', label: 'Footer (Global)', icon: '🦶',
    desc: 'Brand description, phone, email, social media links',
    color: '#64748b'
  },
]

// ─── Section friendly names ────────────────────────────────────────────────────
const SECTION_META = {
  hero:          { label: 'Hero Section',        icon: '🎯', desc: 'The main banner at the top of the page' },
  meta:          { label: 'SEO & Meta Tags',     icon: '🔍', desc: 'Page title & description for search engines' },
  stats:         { label: 'Stats Bar',           icon: '📊', desc: 'Numbers displayed in the stats strip' },
  mission:       { label: 'Mission Section',     icon: '🚀', desc: 'Company mission text and paragraphs' },
  trust_pillars: { label: 'Trust Pillars',       icon: '🔒', desc: '4 trust/value cards below the hero' },
  how_it_works:  { label: 'How It Works Steps',  icon: '⚙️', desc: '3-step process cards section' },
  cta_banner:    { label: 'CTA Banner',          icon: '📣', desc: 'The blue call-to-action banner section' },
  steps:         { label: 'Process Steps',       icon: '📋', desc: 'Numbered step-by-step process' },
  info:          { label: 'Contact Info',        icon: '📍', desc: 'Address, email and phone details' },
  brand:         { label: 'Brand Info',          icon: '🏷️', desc: 'Brand description and tagline' },
  contact:       { label: 'Contact Details',     icon: '📞', desc: 'Phone & email in footer' },
  social:        { label: 'Social Media Links',  icon: '🌐', desc: 'Facebook, Twitter, Pinterest URLs' },
  cta:           { label: 'Navigation CTAs',     icon: '🔘', desc: 'Button/link labels in header' },
}

// ─── Type badge ────────────────────────────────────────────────────────────────
function TypeBadge({ type }) {
  const map = {
    text: { label: 'Text', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    html: { label: 'HTML', bg: '#fdf4ff', color: '#7c3aed', border: '#e9d5ff' },
    url:  { label: 'URL',  bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    boolean: { label: 'Toggle', bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  }
  const s = map[type] || map.text
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {s.label}
    </span>
  )
}

// ─── Single Field Editor ──────────────────────────────────────────────────────
function FieldRow({ item, onChange }) {
  const dirty = item.isDirty
  const isLong = item.content_type === 'html' || (item.value || '').length > 80

  return (
    <div style={{
      padding: '1rem 1.25rem',
      borderBottom: '1px solid #f1f5f9',
      background: dirty ? '#fffbeb' : 'transparent',
      borderLeft: dirty ? '3px solid #f59e0b' : '3px solid transparent',
      transition: 'all 0.2s'
    }}>
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', flex: 1 }}>
          {item.label || item.key}
        </span>
        <TypeBadge type={item.content_type} />
        {dirty && (
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#d97706', background: '#fef3c7', padding: '0.1rem 0.4rem', borderRadius: '9999px' }}>
            CHANGED
          </span>
        )}
      </div>

      {/* Input */}
      {item.content_type === 'boolean' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => onChange(item.id, item.value === 'true' ? 'false' : 'true')}
            style={{
              position: 'relative', width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: item.value === 'true' ? '#2563eb' : '#d1d5db', transition: 'background 0.2s'
            }}
          >
            <span style={{ position: 'absolute', top: '2px', left: '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'transform 0.2s', transform: item.value === 'true' ? 'translateX(20px)' : 'none' }} />
          </button>
          <span style={{ fontSize: '0.85rem', color: item.value === 'true' ? '#16a34a' : '#6b7280', fontWeight: 600 }}>
            {item.value === 'true' ? '✓ Visible' : '✗ Hidden'}
          </span>
        </div>
      ) : item.content_type === 'url' ? (
        <input
          type="text"
          value={item.value || ''}
          onChange={e => onChange(item.id, e.target.value)}
          style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1.5px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.85rem', fontFamily: 'monospace', outline: 'none', background: '#fafafa', color: '#1e293b', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = '#2563eb'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          placeholder="https://..."
        />
      ) : isLong ? (
        <textarea
          value={item.value || ''}
          onChange={e => onChange(item.id, e.target.value)}
          rows={item.content_type === 'html' ? 4 : 3}
          style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1.5px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.85rem', outline: 'none', background: '#fafafa', color: '#1e293b', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6, fontFamily: item.content_type === 'html' ? 'monospace' : 'inherit', transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = '#2563eb'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          placeholder={item.content_type === 'html' ? 'HTML content (e.g. <span style="color:red">text</span>)...' : 'Enter text...'}
        />
      ) : (
        <input
          type="text"
          value={item.value || ''}
          onChange={e => onChange(item.id, e.target.value)}
          style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1.5px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none', background: '#fafafa', color: '#1e293b', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = '#2563eb'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />
      )}

      {item.content_type === 'html' && (
        <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.35rem' }}>
          💡 HTML tags are supported — e.g. &lt;span style="color:#2563eb"&gt;Blue Text&lt;/span&gt;
        </p>
      )}
    </div>
  )
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ section, items, onChange, pageColor }) {
  const [collapsed, setCollapsed] = useState(false)
  const meta = SECTION_META[section] || { label: section.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), icon: '📁', desc: '' }
  const dirtyCount = items.filter(i => i.isDirty).length

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', marginBottom: '1rem' }}>
      {/* Section Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: 'linear-gradient(to right, #fafafa, #fff)', border: 'none', cursor: 'pointer', borderBottom: collapsed ? 'none' : '1px solid #f3f4f6', textAlign: 'left' }}
      >
        <div style={{ width: '36px', height: '36px', borderRadius: '0.625rem', background: `${pageColor}12`, border: `1.5px solid ${pageColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
          {meta.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>{meta.label}</span>
            {dirtyCount > 0 && (
              <span style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 800, padding: '0.1rem 0.5rem' }}>
                {dirtyCount} changed
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.15rem' }}>{meta.desc} · {items.length} field{items.length !== 1 ? 's' : ''}</p>
        </div>
        <span style={{ color: '#9ca3af', fontSize: '0.85rem', transition: 'transform 0.2s', display: 'inline-block', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▼</span>
      </button>

      {/* Fields */}
      {!collapsed && (
        <div>
          {items.map(item => (
            <FieldRow key={item.id} item={item} onChange={onChange} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  const isSuccess = type === 'success'
  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.875rem 1.25rem', borderRadius: '0.875rem',
      background: isSuccess ? '#064e3b' : '#7f1d1d',
      border: `1px solid ${isSuccess ? '#065f46' : '#991b1b'}`,
      color: '#fff', fontSize: '0.875rem', fontWeight: 600,
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      animation: 'slideIn 0.3s ease'
    }}>
      <span style={{ fontSize: '1.1rem' }}>{isSuccess ? '✓' : '✕'}</span>
      {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '0 0.25rem', fontSize: '1rem', marginLeft: '0.25rem' }}>✕</button>
    </div>
  )
}

// ─── Session Expired Banner ───────────────────────────────────────────────────
function SessionExpiredBanner() {
  return (
    <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '1rem', padding: '2rem', textAlign: 'center', margin: '2rem' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔐</div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#92400e', marginBottom: '0.5rem' }}>Session Expired</h3>
      <p style={{ color: '#78350f', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        Your login session has expired. Please sign in again to manage CMS content.
      </p>
      <a
        href="/admin/login"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#d97706', color: '#fff', padding: '0.625rem 1.5rem', borderRadius: '0.625rem', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}
      >
        🔑 Sign In Again
      </a>
    </div>
  )
}

// ─── Main CMS ─────────────────────────────────────────────────────────────────
export default function CMS() {
  const [selectedPageId, setSelectedPageId] = useState('home')
  const [allItems, setAllItems]     = useState([])
  const [dirtyMap, setDirtyMap]     = useState({})
  const [loading, setLoading]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [seeding, setSeeding]       = useState(false)
  const [toast, setToast]           = useState(null)
  const [search, setSearch]         = useState('')
  const [authError, setAuthError]   = useState(false)

  const showToast = useCallback((msg, type = 'success') => setToast({ message: msg, type }), [])
  const selectedPage = PAGES.find(p => p.id === selectedPageId)

  // ── Load page content ─────────────────────────────────────────────
  const loadPage = useCallback(async (pageId) => {
    setLoading(true)
    setDirtyMap({})
    setAuthError(false)
    try {
      const token = localStorage.getItem('access_token')
      if (!token) { setAuthError(true); setLoading(false); return }
      const data = await api.cms.getAllContent({ page: pageId })
      setAllItems(Array.isArray(data) ? data : (data.results || []))
    } catch (e) {
      const status = e?.response?.status
      if (status === 401 || status === 403) {
        setAuthError(true)
      } else {
        showToast('Failed to load content. Try refreshing.', 'error')
      }
      setAllItems([])
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { loadPage(selectedPageId) }, [selectedPageId, loadPage])

  // ── Field change ──────────────────────────────────────────────────
  const handleChange = useCallback((id, value) => {
    setDirtyMap(prev => ({ ...prev, [id]: value }))
  }, [])

  // ── Save all dirty ────────────────────────────────────────────────
  const handleSave = async () => {
    const updates = Object.entries(dirtyMap).map(([id, value]) => ({ id: parseInt(id), value }))
    if (!updates.length) { showToast('No changes to save'); return }
    setSaving(true)
    try {
      await api.cms.bulkUpdate(updates)
      setAllItems(prev => prev.map(item =>
        dirtyMap[item.id] !== undefined ? { ...item, value: dirtyMap[item.id] } : item
      ))
      setDirtyMap({})
      showToast(`✓ Saved ${updates.length} field${updates.length > 1 ? 's' : ''} — changes are now live!`)
    } catch (e) {
      showToast('Save failed. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Seed defaults ─────────────────────────────────────────────────
  const handleSeed = async () => {
    setSeeding(true)
    try {
      const result = await api.cms.seedDefaults()
      showToast(`✓ Seeded ${result.seeded ?? 'all'} default entries!`)
      await loadPage(selectedPageId)
    } catch (e) {
      showToast('Seed failed — check your login', 'error')
    } finally {
      setSeeding(false)
    }
  }

  // ── Discard changes ───────────────────────────────────────────────
  const handleDiscard = () => {
    setDirtyMap({})
    showToast('Changes discarded')
  }

  // ── Merge dirty values into items ─────────────────────────────────
  const displayItems = allItems.map(item => ({
    ...item,
    value: dirtyMap[item.id] !== undefined ? dirtyMap[item.id] : item.value,
    isDirty: dirtyMap[item.id] !== undefined,
  }))

  const filtered = search.trim()
    ? displayItems.filter(i =>
        (i.label || i.key || '').toLowerCase().includes(search.toLowerCase()) ||
        (i.section || '').toLowerCase().includes(search.toLowerCase()) ||
        (i.value || '').toLowerCase().includes(search.toLowerCase())
      )
    : displayItems

  // Group by section
  const sections = filtered.reduce((acc, item) => {
    const sec = item.section || 'general'
    if (!acc[sec]) acc[sec] = []
    acc[sec].push(item)
    return acc
  }, {})

  const dirtyCount  = Object.keys(dirtyMap).length
  const totalFields = allItems.length

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* ══ TOP HEADER ══ */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '0.625rem', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>✏️</div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', fontFamily: "'Outfit', sans-serif", lineHeight: 1.2 }}>
              Content Management System
            </h1>
            <p style={{ fontSize: '0.73rem', color: '#6b7280', marginTop: '0.1rem' }}>
              Edit website content — changes go live immediately after saving
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {dirtyCount > 0 && (
            <span style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', borderRadius: '9999px', padding: '0.3rem 0.75rem', fontSize: '0.775rem', fontWeight: 700 }}>
              {dirtyCount} unsaved
            </span>
          )}
          <button
            onClick={handleSeed}
            disabled={seeding}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.625rem', border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {seeding ? '⏳' : '🌱'} {seeding ? 'Seeding…' : 'Seed Defaults'}
          </button>
          {dirtyCount > 0 && (
            <button
              onClick={handleDiscard}
              style={{ padding: '0.5rem 1rem', borderRadius: '0.625rem', border: '1.5px solid #fca5a5', background: '#fff', color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Discard
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || dirtyCount === 0}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: '0.625rem', border: 'none',
              background: dirtyCount > 0 ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#e5e7eb',
              color: dirtyCount > 0 ? '#fff' : '#9ca3af',
              fontSize: '0.85rem', fontWeight: 700, cursor: dirtyCount > 0 ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              boxShadow: dirtyCount > 0 ? '0 4px 12px rgba(37,99,235,0.35)' : 'none'
            }}
          >
            {saving ? '⏳' : '💾'} {saving ? 'Saving…' : dirtyCount > 0 ? `Save ${dirtyCount} Change${dirtyCount > 1 ? 's' : ''}` : 'No Changes'}
          </button>
        </div>
      </div>

      {/* ══ MAIN LAYOUT ══ */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── LEFT SIDEBAR — Pages ── */}
        <div style={{ width: '220px', flexShrink: 0, background: '#fff', borderRight: '1px solid #e5e7eb', overflowY: 'auto', padding: '0.75rem' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: '0.5rem', marginBottom: '0.5rem', marginTop: '0.25rem' }}>PAGES</p>
          {PAGES.map(page => {
            const isActive = selectedPageId === page.id
            return (
              <button
                key={page.id}
                onClick={() => { setSelectedPageId(page.id); setSearch('') }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.6rem 0.75rem', borderRadius: '0.625rem', border: 'none',
                  cursor: 'pointer', textAlign: 'left', marginBottom: '0.15rem',
                  background: isActive ? `${page.color}12` : 'transparent',
                  color: isActive ? page.color : '#4b5563',
                  transition: 'all 0.15s'
                }}
              >
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{page.icon}</span>
                <span style={{ fontSize: '0.83rem', fontWeight: isActive ? 700 : 500, flex: 1 }}>{page.label}</span>
                {isActive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: page.color, flexShrink: 0 }} />}
              </button>
            )
          })}
        </div>

        {/* ── RIGHT CONTENT PANEL ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>

          {/* Page Tab Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                <span style={{ width: '32px', height: '32px', borderRadius: '0.5rem', background: `${selectedPage?.color}15`, border: `1.5px solid ${selectedPage?.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                  {selectedPage?.icon}
                </span>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>
                  {selectedPage?.label}
                </h2>
                {totalFields > 0 && (
                  <span style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem' }}>
                    {totalFields} fields
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#6b7280', paddingLeft: '2.5rem' }}>{selectedPage?.desc}</p>
            </div>

            {/* Search Box */}
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', color: '#9ca3af', pointerEvents: 'none' }}>🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search fields…"
                style={{ paddingLeft: '2rem', paddingRight: '0.75rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', border: '1.5px solid #e5e7eb', borderRadius: '0.625rem', fontSize: '0.825rem', outline: 'none', width: '190px', background: '#fff', color: '#374151' }}
              />
            </div>
          </div>

          {/* ── States ── */}
          {authError ? (
            <SessionExpiredBanner />
          ) : loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', color: '#6b7280' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.875rem' }}>Loading content…</p>
            </div>
          ) : allItems.length === 0 ? (
            <div style={{ background: '#fff', border: '2px dashed #e5e7eb', borderRadius: '1.25rem', padding: '3.5rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📭</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem', fontFamily: "'Outfit', sans-serif" }}>
                No content for "{selectedPage?.label}"
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', maxWidth: '360px', margin: '0 auto 1.5rem' }}>
                Click <strong>Seed Defaults</strong> to populate this page with all the editable fields from the website.
              </p>
              <button
                onClick={handleSeed}
                disabled={seeding}
                style={{ padding: '0.7rem 1.75rem', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
              >
                {seeding ? '⏳ Seeding…' : '🌱 Seed Defaults Now'}
              </button>
            </div>
          ) : Object.keys(sections).length === 0 && search ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
              <p style={{ fontWeight: 600 }}>No fields match "<em>{search}</em>"</p>
            </div>
          ) : (
            <div>
              {Object.entries(sections).map(([section, items]) => (
                <SectionCard
                  key={section}
                  section={section}
                  items={items}
                  onChange={handleChange}
                  pageColor={selectedPage?.color || '#2563eb'}
                />
              ))}
            </div>
          )}

          {/* ── Sticky Save Footer ── */}
          {dirtyCount > 0 && (
            <div style={{
              position: 'sticky', bottom: '1rem', padding: '0.875rem 1.25rem',
              background: '#1e3a8a', borderRadius: '0.875rem', marginTop: '1.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
              boxShadow: '0 8px 32px rgba(30,58,138,0.4)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ fontSize: '1.1rem' }}>✏️</span>
                <span style={{ color: '#bfdbfe', fontSize: '0.875rem', fontWeight: 600 }}>
                  <strong style={{ color: '#fff' }}>{dirtyCount} unsaved change{dirtyCount > 1 ? 's' : ''}</strong>
                  {' '}on {selectedPage?.label}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleDiscard}
                  style={{ padding: '0.45rem 1rem', borderRadius: '0.5rem', border: '1.5px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#93c5fd', fontWeight: 600, fontSize: '0.825rem', cursor: 'pointer' }}
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ padding: '0.45rem 1.25rem', borderRadius: '0.5rem', border: 'none', background: '#fff', color: '#1e3a8a', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  {saving ? '⏳ Saving…' : '💾 Save & Publish'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  )
}
