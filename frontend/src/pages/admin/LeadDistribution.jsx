import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

// ─── Utility ────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const Badge = ({ children, color }) => (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${color}`}>
        {children}
    </span>
);

export default function LeadDistribution() {
    const [distributions, setDistributions] = useState([]);
    const [leads, setLeads] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignForm, setAssignForm] = useState({ lead: '', vendor: '' });
    const [assignLoading, setAssignLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterUnlocked, setFilterUnlocked] = useState('all');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [distData, leadsData, vendorsData] = await Promise.allSettled([
                api.getLeadDistributions?.() || fetch('/api/leads/distributions/').then(r => r.json()),
                api.getAdminLeads(null, { page_size: 100 }),
                api.getAdminVendors(null, { page_size: 200 }),
            ]);
            if (distData.status === 'fulfilled') setDistributions(distData.value?.results || distData.value || []);
            if (leadsData.status === 'fulfilled') setLeads(leadsData.value?.results || leadsData.value || []);
            if (vendorsData.status === 'fulfilled') setVendors(vendorsData.value?.results || vendorsData.value || []);
        } catch (e) {
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!assignForm.lead || !assignForm.vendor) return;
        setAssignLoading(true);
        try {
            await fetch('/api/leads/distributions/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
                body: JSON.stringify({ lead: assignForm.lead, vendor: assignForm.vendor }),
            });
            setShowAssignModal(false);
            setAssignForm({ lead: '', vendor: '' });
            load();
        } catch {
            setError('Failed to assign lead.');
        } finally {
            setAssignLoading(false);
        }
    };

    const handleUnassign = async (id) => {
        if (!window.confirm('Remove this lead assignment?')) return;
        await fetch(`/api/leads/distributions/${id}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
        });
        load();
    };

    const handleToggleUnlock = async (dist) => {
        await fetch(`/api/leads/distributions/${dist.id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
            body: JSON.stringify({ is_unlocked: !dist.is_unlocked }),
        });
        load();
    };

    const filtered = distributions.filter(d => {
        const q = search.toLowerCase();
        const lead = d.lead_full || d.lead_summary || {};
        const matchSearch = !q || 
            (lead.make || '').toLowerCase().includes(q) ||
            (lead.model || '').toLowerCase().includes(q) ||
            (lead.name || '').toLowerCase().includes(q) ||
            (d.vendor_name || '').toLowerCase().includes(q);
        const matchUnlock = filterUnlocked === 'all' ||
            (filterUnlocked === 'unlocked' && d.is_unlocked) ||
            (filterUnlocked === 'locked' && !d.is_unlocked);
        return matchSearch && matchUnlock;
    });

    const totalRevenue = distributions
        .filter(d => d.is_unlocked && d.price_paid)
        .reduce((s, d) => s + parseFloat(d.price_paid || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Lead Distribution</h1>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">Assign leads to vendors and manage unlock status</p>
                </div>
                <button
                    onClick={() => setShowAssignModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    Assign Lead to Vendor
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Assignments', value: distributions.length, icon: '📋', color: 'bg-blue-50 text-blue-700' },
                    { label: 'Unlocked', value: distributions.filter(d => d.is_unlocked).length, icon: '🔓', color: 'bg-emerald-50 text-emerald-700' },
                    { label: 'Pending Unlock', value: distributions.filter(d => !d.is_unlocked).length, icon: '🔒', color: 'bg-amber-50 text-amber-700' },
                    { label: 'Revenue Earned', value: `$${totalRevenue.toFixed(2)}`, icon: '💰', color: 'bg-purple-50 text-purple-700' },
                ].map(stat => (
                    <div key={stat.label} className={`${stat.color} rounded-2xl p-4 border border-white/50`}>
                        <p className="text-2xl font-black mb-1">{stat.icon} {stat.value}</p>
                        <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Search by lead, vendor, make..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <select
                    value={filterUnlocked}
                    onChange={e => setFilterUnlocked(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-400 transition-all"
                >
                    <option value="all">All Status</option>
                    <option value="unlocked">Unlocked</option>
                    <option value="locked">Locked</option>
                </select>
            </div>

            {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-xl">{error}</div>}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-4xl mb-3">📭</p>
                        <p className="font-bold text-slate-700">No assignments found</p>
                        <p className="text-sm text-slate-400 mt-1">Assign a lead to a vendor to get started</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {['Lead', 'Part & Vehicle', 'Assigned Vendor', 'Status', 'Revenue', 'Assigned', 'Actions'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map(dist => {
                                    const lead = dist.lead_full || dist.lead_summary || {};
                                    const contact = dist.lead_contact;
                                    return (
                                        <tr key={dist.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-slate-900">#{dist.lead}</p>
                                                {contact && (
                                                    <p className="text-[11px] text-slate-500 mt-0.5">{contact.name}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-slate-800">{lead.year} {lead.make} {lead.model}</p>
                                                <p className="text-[11px] text-slate-500">{lead.part} · {lead.state} {lead.zip_preview || ''}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-slate-800">{dist.vendor_name}</p>
                                                <p className="text-[11px] text-slate-400">ID: {dist.vendor}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                {dist.is_unlocked
                                                    ? <Badge color="bg-emerald-100 text-emerald-700">🔓 Unlocked</Badge>
                                                    : <Badge color="bg-amber-100 text-amber-700">🔒 Locked</Badge>
                                                }
                                            </td>
                                            <td className="px-4 py-3">
                                                {dist.price_paid
                                                    ? <span className="font-bold text-emerald-600">${parseFloat(dist.price_paid).toFixed(2)}</span>
                                                    : <span className="text-slate-400">—</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3 text-[12px] text-slate-500">{fmt(dist.assigned_at)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleToggleUnlock(dist)}
                                                        className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${dist.is_unlocked ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                                                    >
                                                        {dist.is_unlocked ? 'Lock' : 'Unlock'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleUnassign(dist.id)}
                                                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition-all"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Assign Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Assign Lead to Vendor</h2>
                            <button onClick={() => setShowAssignModal(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleAssign} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Lead</label>
                                <select
                                    value={assignForm.lead}
                                    onChange={e => setAssignForm(f => ({ ...f, lead: e.target.value }))}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-400 transition-all"
                                >
                                    <option value="">Select a lead…</option>
                                    {leads.map(l => (
                                        <option key={l.id} value={l.id}>#{l.id} — {l.year} {l.make} {l.model} — {l.part}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Vendor</label>
                                <select
                                    value={assignForm.vendor}
                                    onChange={e => setAssignForm(f => ({ ...f, vendor: e.target.value }))}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-400 transition-all"
                                >
                                    <option value="">Select a vendor…</option>
                                    {vendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.name} — {v.city}, {v.state}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">Cancel</button>
                                <button type="submit" disabled={assignLoading} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all disabled:opacity-60">
                                    {assignLoading ? 'Assigning…' : 'Assign Lead'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
