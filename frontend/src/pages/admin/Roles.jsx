import { useState, useEffect, useCallback } from 'react'
import {
    ShieldCheckIcon, UserPlusIcon, PencilIcon, TrashIcon,
    CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon,
    XCircleIcon, UserGroupIcon, LockClosedIcon, LockOpenIcon, KeyIcon
} from '@heroicons/react/24/outline'
import { api } from '../../services/api'

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-medium animate-fade-in ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
            {type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <ExclamationTriangleIcon className="w-5 h-5" />}
            {message}
        </div>
    )
}

// ─── Permission matrix config ─────────────────────────────────────────────────
const PERMISSIONS = [
    { key: 'can_manage_cms',              label: 'CMS',              desc: 'Edit any page content' },
    { key: 'can_manage_vendors',          label: 'Vendors',          desc: 'Edit vendor profiles' },
    { key: 'can_manage_leads',            label: 'Leads',            desc: 'View and manage leads' },
    { key: 'can_manage_ads',              label: 'Ads',              desc: 'Create and manage ads' },
    { key: 'can_manage_blog',             label: 'Blog',             desc: 'Write and publish posts' },
    { key: 'can_manage_messages',         label: 'Messages',         desc: 'Read and respond to messages' },
    { key: 'can_manage_yard_submissions', label: 'Yard Submissions', desc: 'Review yard submissions' },
    { key: 'can_manage_settings',         label: 'Settings',         desc: 'Change site settings' },
    { key: 'can_manage_roles',            label: 'Roles & Users',    desc: 'Manage staff and roles' },
    { key: 'can_view_only',              label: 'View Only',        desc: 'Read-only across all modules' },
]

// ─── Role Card ─────────────────────────────────────────────────────────────────
function RoleCard({ role, onEdit, onDelete }) {
    const activePerms = PERMISSIONS.filter(p => role[p.key])
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: role.color + '22' }}>
                        <ShieldCheckIcon className="w-5 h-5" style={{ color: role.color }} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">{role.name}</h3>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: role.color }}>
                                {role.member_count} member{role.member_count !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => onEdit(role)} className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(role)} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {activePerms.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">No permissions assigned</span>
                ) : activePerms.map(p => (
                    <span key={p.key} className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-100 text-gray-700">
                        {p.label}
                    </span>
                ))}
            </div>
        </div>
    )
}

// ─── Role Edit Drawer ─────────────────────────────────────────────────────────
function RoleDrawer({ role, onClose, onSave }) {
    const [form, setForm] = useState({
        name: role?.name || '',
        description: role?.description || '',
        color: role?.color || '#6366f1',
        ...Object.fromEntries(PERMISSIONS.map(p => [p.key, role ? !!role[p.key] : false]))
    })
    const [saving, setSaving] = useState(false)

    const handleSubmit = async () => {
        if (!form.name.trim()) return
        setSaving(true)
        try { await onSave(form) } finally { setSaving(false) }
    }

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative ml-auto w-full max-w-lg bg-white h-full shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">{role ? 'Edit Role' : 'Create Role'}</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><XCircleIcon className="w-5 h-5 text-gray-500" /></button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Role Name *</label>
                        <input
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm"
                            placeholder="e.g. Content Editor"
                        />
                    </div>
                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            rows={2}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm resize-none"
                            placeholder="What can this role do?"
                        />
                    </div>
                    {/* Color */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Badge Color</label>
                        <div className="flex items-center gap-3">
                            <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5" />
                            <span className="text-sm font-mono text-gray-600">{form.color}</span>
                            <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ background: form.color }}>Preview</span>
                        </div>
                    </div>
                    {/* Permissions */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Permissions</label>
                        <div className="space-y-2">
                            {PERMISSIONS.map(perm => (
                                <label key={perm.key} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={!!form[perm.key]}
                                        onChange={e => setForm(f => ({ ...f, [perm.key]: e.target.checked }))}
                                        className="w-4 h-4 accent-blue-600"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-800">{perm.label}</p>
                                        <p className="text-xs text-gray-500">{perm.desc}</p>
                                    </div>
                                    {form[perm.key] ? <LockOpenIcon className="w-4 h-4 text-blue-500" /> : <LockClosedIcon className="w-4 h-4 text-gray-300" />}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-gray-200">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={saving}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                        {saving && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                        {saving ? 'Saving…' : (role ? 'Save Changes' : 'Create Role')}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Create Staff Modal ────────────────────────────────────────────────────────
function CreateStaffModal({ roles, onClose, onCreate }) {
    const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '', role_id: roles[0]?.id || '' })
    const [saving, setSaving] = useState(false)

    const handleSubmit = async () => {
        if (!form.email || !form.role_id) return
        setSaving(true)
        try { await onCreate(form) } finally { setSaving(false) }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Create Staff Member</h2>
                <p className="text-sm text-gray-500 mb-6">A new user account will be created and manually assigned a role.</p>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Email *</label>
                        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm"
                            placeholder="staff@example.com" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Password</label>
                        <input type="text" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm"
                            placeholder="Leave blank for a random password" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">First Name</label>
                            <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Last Name</label>
                            <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Assign Role *</label>
                        <select value={form.role_id} onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm bg-white">
                            <option value="">Select a role</option>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={saving}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                        {saving && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                        {saving ? 'Creating…' : 'Create Staff'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Reset Password Modal ──────────────────────────────────────────────────────
function ResetPasswordModal({ member, onClose, onReset }) {
    const [password, setPassword] = useState('')
    const [saving, setSaving] = useState(false)

    const handleSubmit = async () => {
        if (!password || password.length < 6) return
        setSaving(true)
        try { await onReset(member.id, password) } finally { setSaving(false) }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Reset Password</h2>
                <p className="text-sm text-gray-500 mb-6">Enter a new password for <span className="font-semibold text-gray-700">{member.user?.email}</span></p>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">New Password *</label>
                        <input type="text" value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm"
                            placeholder="Minimum 6 characters" />
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={saving || password.length < 6}
                        className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                        {saving && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                        {saving ? 'Saving…' : 'Reset Password'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── ROLES TAB ────────────────────────────────────────────────────────────────
function RolesTab({ toast }) {
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingRole, setEditingRole] = useState(null)
    const [showDrawer, setShowDrawer] = useState(false)

    const loadRoles = useCallback(async () => {
        try {
            const data = await api.rbac.getRoles()
            setRoles(data.results || data || [])
        } catch { toast('Failed to load roles', 'error') }
        finally { setLoading(false) }
    }, [toast])

    useEffect(() => { loadRoles() }, [loadRoles])

    const handleSeed = async () => {
        try { await api.rbac.seedRoles(); toast('Default roles seeded!'); loadRoles() }
        catch { toast('Seed failed', 'error') }
    }

    const handleSave = async (form) => {
        try {
            if (editingRole?.id) {
                await api.rbac.updateRole(editingRole.id, form)
                toast('Role updated!')
            } else {
                await api.rbac.createRole(form)
                toast('Role created!')
            }
            setShowDrawer(false)
            setEditingRole(null)
            loadRoles()
        } catch { toast('Save failed', 'error') }
    }

    const handleDelete = async (role) => {
        if (!confirm(`Delete role "${role.name}"? Members must be reassigned first.`)) return
        try { await api.rbac.deleteRole(role.id); toast('Role deleted'); loadRoles() }
        catch (e) {
            const msg = e?.response?.data?.error || 'Delete failed'
            toast(msg, 'error')
        }
    }

    return (
        <div>
            {showDrawer && (
                <RoleDrawer role={editingRole} onClose={() => { setShowDrawer(false); setEditingRole(null) }} onSave={handleSave} />
            )}
            <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">{roles.length} role{roles.length !== 1 ? 's' : ''} defined</p>
                <div className="flex gap-2">
                    <button onClick={handleSeed} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">
                        <ArrowPathIcon className="w-4 h-4" /> Seed Defaults
                    </button>
                    <button onClick={() => { setEditingRole(null); setShowDrawer(true) }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">
                        <ShieldCheckIcon className="w-4 h-4" /> New Role
                    </button>
                </div>
            </div>
            {loading ? (
                <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {roles.map(role => (
                        <RoleCard key={role.id} role={role}
                            onEdit={(r) => { setEditingRole(r); setShowDrawer(true) }}
                            onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── STAFF TAB ─────────────────────────────────────────────────────────────────
function StaffTab({ toast }) {
    const [staff, setStaff] = useState([])
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [resetMemberModal, setResetMemberModal] = useState(null)

    const loadData = useCallback(async () => {
        try {
            const [staffData, rolesData] = await Promise.all([api.rbac.getStaff(), api.rbac.getRoles()])
            setStaff(staffData.results || staffData || [])
            setRoles(rolesData.results || rolesData || [])
        } catch { toast('Failed to load staff', 'error') }
        finally { setLoading(false) }
    }, [toast])

    useEffect(() => { loadData() }, [loadData])

    const handleCreate = async (form) => {
        try {
            await api.rbac.inviteStaff({ ...form, role_id: parseInt(form.role_id) })
            toast('Staff account created!')
            setShowCreate(false)
            loadData()
        } catch (e) {
            toast(e?.response?.data?.error || 'Staff creation failed', 'error')
        }
    }

    const handleResetPassword = async (memberId, password) => {
        try {
            await api.rbac.resetStaffPassword(memberId, { new_password: password })
            toast('Password reset successfully!')
            setResetMemberModal(null)
        } catch (e) {
            toast(e?.response?.data?.error || 'Password reset failed', 'error')
        }
    }

    const handleToggleActive = async (member) => {
        try {
            await api.rbac.updateStaff(member.id, { is_active: !member.is_active })
            toast(member.is_active ? 'Member deactivated' : 'Member activated')
            loadData()
        } catch { toast('Update failed', 'error') }
    }

    const handleRoleChange = async (member, roleId) => {
        try {
            await api.rbac.updateStaff(member.id, { role_id: parseInt(roleId) })
            toast('Role updated')
            loadData()
        } catch { toast('Update failed', 'error') }
    }

    const handleDelete = async (member) => {
        if (!confirm(`Remove ${member.user?.email} from staff?`)) return
        try { await api.rbac.deleteStaff(member.id); toast('Staff removed'); loadData() }
        catch { toast('Delete failed', 'error') }
    }

    return (
        <div>
            {showCreate && <CreateStaffModal roles={roles} onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
            {resetMemberModal && <ResetPasswordModal member={resetMemberModal} onClose={() => setResetMemberModal(null)} onReset={handleResetPassword} />}
            
            <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">{staff.length} staff member{staff.length !== 1 ? 's' : ''}</p>
                <button onClick={() => setShowCreate(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors">
                    <UserPlusIcon className="w-4 h-4" /> Create Staff Account
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Staff Member</th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Invited By</th>
                                <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {staff.length === 0 ? (
                                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">No staff members yet. Invite someone to get started.</td></tr>
                            ) : staff.map(member => (
                                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                {(member.user?.first_name || member.user?.email || 'U')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {[member.user?.first_name, member.user?.last_name].filter(Boolean).join(' ') || '—'}
                                                </p>
                                                <p className="text-xs text-gray-500">{member.user?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <select
                                            value={member.role?.id || ''}
                                            onChange={e => handleRoleChange(member, e.target.value)}
                                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white outline-none focus:border-blue-500 cursor-pointer"
                                        >
                                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${member.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${member.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                            {member.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-gray-500">{member.invited_by_email || '—'}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleToggleActive(member)}
                                                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${member.is_active ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                                                {member.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button onClick={() => setResetMemberModal(member)}
                                                title="Reset Password"
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                                                <KeyIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(member)}
                                                title="Remove Staff"
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                                <TrashIcon className="w-4 h-4" />
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
    )
}

// ─── MAIN ROLES PAGE ──────────────────────────────────────────────────────────
const TABS = [
    { id: 'roles', label: 'Roles', icon: ShieldCheckIcon },
    { id: 'staff', label: 'Staff Members', icon: UserGroupIcon },
]

export default function AdminRoles() {
    const [activeTab, setActiveTab] = useState('roles')
    const [toast, setToast] = useState(null)
    const showToast = useCallback((message, type = 'success') => setToast({ message, type }), [])

    return (
        <div className="h-full flex flex-col">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-200">
                        <ShieldCheckIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
                        <p className="text-sm text-gray-500">Manage staff access levels and permissions across the admin portal</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {TABS.map(tab => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm rounded-t-xl border-b-2 transition-all ${activeTab === tab.id
                                ? 'border-violet-600 text-violet-700 bg-white'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Tab content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
                {activeTab === 'roles' && <RolesTab toast={showToast} />}
                {activeTab === 'staff' && <StaffTab toast={showToast} />}
            </div>
        </div>
    )
}
