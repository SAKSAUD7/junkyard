import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../../services/api'

// ─── Page config — icons + labels matching the actual website pages ───────────
const PAGES = [
  { id: 'home',         label: 'Home',          icon: '🏠', desc: 'Hero, Trust Pillars, How It Works, CTA Banner' },
  { id: 'about',        label: 'About',         icon: '📖', desc: 'Hero, Stats, Mission sections' },
  { id: 'contact',      label: 'Contact',       icon: '📞', desc: 'Hero, Contact Info (address, email, phone)' },
  { id: 'browse',       label: 'Browse States', icon: '🗺️', desc: 'Hero heading & subheading' },
  { id: 'vendors',      label: 'Vendors',       icon: '🏪', desc: 'Hero heading & subheading' },
  { id: 'blog',         label: 'Blog',          icon: '📝', desc: 'Hero, SEO metadata' },
  { id: 'faq',          label: 'FAQ',           icon: '❓', desc: 'Hero heading & subheading' },
  { id: 'how_it_works', label: 'How It Works',  icon: '⚙️', desc: 'Hero, 4 process steps' },
  { id: 'navbar',       label: 'Navbar',        icon: '🔗', desc: 'Brand tagline, Support label' },
  { id: 'footer',       label: 'Footer',        icon: '🦶', desc: 'Brand description, Contact info, Social URLs' },
]

// ─── Section display names ────────────────────────────────────────────────────
const SECTION_LABELS = {
  hero:         '🎯 Hero Section',
  meta:         '🔍 SEO / Meta',
  stats:        '📊 Stats Bar',
  mission:      '🎯 Mission Section',
  trust_pillars:'🔒 Trust Pillars',
  how_it_works: '⚙️ How It Works Steps',
  cta_banner:   '📣 CTA Banner',
  steps:        '📋 Process Steps',
  info:         '📍 Contact Info',
  brand:        '🏷️ Brand Info',
  contact:      '📞 Contact Details',
  social:       '🌐 Social Media Links',
  cta:          '🔘 CTA Buttons',
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white text-sm font-semibold animate-fade-in ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      <span className="text-lg">{type === 'success' ? '✓' : '✕'}</span>
      {message}
    </div>
  )
}

// ─── Single field editor ──────────────────────────────────────────────────────
function FieldEditor({ item, onChange, isDirty }) {
  const isLong = item.content_type === 'html' || item.content_type === 'text' && (item.value || '').length > 80

  return (
    <div className={`group relative p-4 rounded-xl border transition-all duration-200 ${isDirty ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
      {isDirty && (
        <span className="absolute top-3 right-3 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
          Modified
        </span>
      )}
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
        {item.label || item.key}
      </label>

      {item.content_type === 'boolean' ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => onChange(item.id, item.value === 'true' ? 'false' : 'true')}
            className={`relative w-12 h-6 rounded-full transition-colors ${item.value === 'true' ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.value === 'true' ? 'translate-x-6' : ''}`} />
          </button>
          <span className="text-sm text-gray-600">{item.value === 'true' ? 'Visible' : 'Hidden'}</span>
        </div>
      ) : item.content_type === 'url' ? (
        <input
          type="text"
          value={item.value || ''}
          onChange={e => onChange(item.id, e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono bg-gray-50"
          placeholder="https://..."
        />
      ) : isLong ? (
        <textarea
          rows={item.content_type === 'html' ? 4 : 3}
          value={item.value || ''}
          onChange={e => onChange(item.id, e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
          placeholder={item.content_type === 'html' ? 'HTML content...' : 'Text content...'}
        />
      ) : (
        <input
          type="text"
          value={item.value || ''}
          onChange={e => onChange(item.id, e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      )}

      {item.content_type === 'html' && (
        <p className="text-xs text-gray-400 mt-1">💡 HTML tags supported (e.g. &lt;span style="color: red"&gt;text&lt;/span&gt;)</p>
      )}
    </div>
  )
}

// ─── Main CMS Component ───────────────────────────────────────────────────────
export default function CMS() {
  const [selectedPage, setSelectedPage] = useState('home')
  const [allItems, setAllItems] = useState([])  // all items for current page
  const [dirtyMap, setDirtyMap] = useState({})  // { id: newValue } for unsaved changes
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), [])

  // ── Load items for selected page ──────────────────────────────────
  const loadPage = useCallback(async (page) => {
    setLoading(true)
    setDirtyMap({})
    try {
      const data = await api.cms.getAllContent({ page })
      const items = (data.results || data || [])
      setAllItems(items)
    } catch (e) {
      showToast('Failed to load content — check your login', 'error')
      setAllItems([])
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { loadPage(selectedPage) }, [selectedPage, loadPage])

  // ── Field change handler ──────────────────────────────────────────
  const handleChange = useCallback((id, value) => {
    setDirtyMap(prev => ({ ...prev, [id]: value }))
  }, [])

  // ── Save all dirty fields ─────────────────────────────────────────
  const handleSave = async () => {
    const updates = Object.entries(dirtyMap).map(([id, value]) => ({ id: parseInt(id), value }))
    if (updates.length === 0) { showToast('No changes to save'); return }
    setSaving(true)
    try {
      await api.cms.bulkUpdate(updates)
      // Apply changes to local state
      setAllItems(prev => prev.map(item =>
        dirtyMap[item.id] !== undefined ? { ...item, value: dirtyMap[item.id] } : item
      ))
      setDirtyMap({})
      showToast(`✓ Saved ${updates.length} field${updates.length > 1 ? 's' : ''} successfully!`)
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
      showToast(`✓ Seeded ${result.seeded} new entries!`)
      await loadPage(selectedPage)
    } catch (e) {
      showToast('Seed failed', 'error')
    } finally {
      setSeeding(false)
    }
  }

  // ── Group items by section ────────────────────────────────────────
  const itemsWithDirty = allItems.map(item => ({
    ...item,
    value: dirtyMap[item.id] !== undefined ? dirtyMap[item.id] : item.value,
    isDirty: dirtyMap[item.id] !== undefined,
  }))

  const filtered = search
    ? itemsWithDirty.filter(i =>
        (i.label || i.key).toLowerCase().includes(search.toLowerCase()) ||
        (i.value || '').toLowerCase().includes(search.toLowerCase())
      )
    : itemsWithDirty

  const sections = filtered.reduce((acc, item) => {
    const sec = item.section || 'general'
    if (!acc[sec]) acc[sec] = []
    acc[sec].push(item)
    return acc
  }, {})

  const dirtyCount = Object.keys(dirtyMap).length
  const currentPageConfig = PAGES.find(p => p.id === selectedPage)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* ── Top Header ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1.25rem 2rem' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
              Content Management System
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
              Edit all website content — changes reflect live on the frontend
            </p>
          </div>
          <div className="flex items-center gap-3">
            {dirtyCount > 0 && (
              <span style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '9999px', padding: '0.3rem 0.9rem', fontSize: '0.8rem', fontWeight: 700 }}>
                {dirtyCount} unsaved change{dirtyCount > 1 ? 's' : ''}
              </span>
            )}
            <button
              onClick={handleSeed}
              disabled={seeding}
              style={{ padding: '0.6rem 1.2rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {seeding ? '⏳ Seeding...' : '🌱 Seed Defaults'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || dirtyCount === 0}
              style={{
                padding: '0.6rem 1.6rem', borderRadius: '0.75rem', border: 'none',
                background: dirtyCount > 0 ? '#2563eb' : '#94a3b8',
                color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: dirtyCount > 0 ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              {saving ? '⏳ Saving...' : `💾 Save Changes${dirtyCount > 0 ? ` (${dirtyCount})` : ''}`}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 85px)' }}>

        {/* ── Left Sidebar: Page List ── */}
        <div style={{ width: '260px', flexShrink: 0, background: '#fff', borderRight: '1px solid #e2e8f0', overflowY: 'auto', padding: '1rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>
            Pages
          </p>
          {PAGES.map(page => (
            <button
              key={page.id}
              onClick={() => { setSelectedPage(page.id); setSearch('') }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 0.75rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer',
                marginBottom: '0.25rem', textAlign: 'left', transition: 'all 0.15s',
                background: selectedPage === page.id ? '#eff6ff' : 'transparent',
                color: selectedPage === page.id ? '#2563eb' : '#475569',
              }}
              onMouseEnter={e => { if (selectedPage !== page.id) e.currentTarget.style.background = '#f8fafc' }}
              onMouseLeave={e => { if (selectedPage !== page.id) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: '1.1rem' }}>{page.icon}</span>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: selectedPage === page.id ? 700 : 500 }}>
                  {page.label}
                </div>
              </div>
              {selectedPage === page.id && (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />
              )}
            </button>
          ))}
        </div>

        {/* ── Right Content Area ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>

          {/* Page Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {currentPageConfig?.icon} {currentPageConfig?.label}
                </h2>
                <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.2rem' }}>
                  {currentPageConfig?.desc}
                </p>
              </div>
              {/* Search within page */}
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.9rem' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search fields..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: '2.2rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', border: '1.5px solid #e2e8f0', borderRadius: '0.75rem', fontSize: '0.85rem', outline: 'none', width: '220px', background: '#fff' }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: '#94a3b8' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
              <p>Loading content...</p>
            </div>
          ) : allItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '1.5rem', border: '2px dashed #e2e8f0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>No content yet for this page</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Click "Seed Defaults" to populate with the website's initial content.
              </p>
              <button
                onClick={handleSeed}
                disabled={seeding}
                style={{ padding: '0.75rem 2rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
              >
                {seeding ? '⏳ Seeding...' : '🌱 Seed Defaults Now'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {Object.entries(sections).map(([section, items]) => (
                <div key={section} style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  {/* Section Header */}
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', fontFamily: "'Outfit', sans-serif" }}>
                      {SECTION_LABELS[section] || `📁 ${section.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                      {items.length} field{items.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  {/* Fields */}
                  <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '0.75rem' }}>
                    {items.map(item => (
                      <FieldEditor
                        key={item.id}
                        item={item}
                        onChange={handleChange}
                        isDirty={item.isDirty}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {Object.keys(sections).length === 0 && search && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
                  <p>No fields match "{search}"</p>
                </div>
              )}
            </div>
          )}

          {/* Bottom Save Bar (sticky when dirty) */}
          {dirtyCount > 0 && (
            <div style={{
              position: 'sticky', bottom: '1rem', padding: '1rem 1.5rem', background: '#1e3a8a',
              borderRadius: '1rem', marginTop: '2rem', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', boxShadow: '0 8px 32px rgba(30,58,138,0.35)'
            }}>
              <span style={{ color: '#bfdbfe', fontWeight: 600, fontSize: '0.875rem' }}>
                ✏️ You have <strong style={{ color: '#fff' }}>{dirtyCount} unsaved change{dirtyCount > 1 ? 's' : ''}</strong>
              </span>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => { setDirtyMap({}); }}
                  style={{ padding: '0.5rem 1.2rem', borderRadius: '0.625rem', border: '1.5px solid rgba(255,255,255,0.25)', background: 'transparent', color: '#bfdbfe', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ padding: '0.5rem 1.5rem', borderRadius: '0.625rem', border: 'none', background: '#fff', color: '#1e3a8a', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  {saving ? '⏳ Saving...' : '💾 Save Now'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.3s ease; }
      `}</style>
    </div>
  )
}
