import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import {
    MagnifyingGlassIcon,
    EyeIcon,
    PhoneIcon,
    EnvelopeIcon,
    XMarkIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import Toast from '../../components/Toast';

export default function AdminLeads() {
    const { token } = useContext(AuthContext);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState(null);
    const [toast, setToast] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        fetchLeads();
    }, [token]);

    const fetchLeads = async () => {
        try {
            const data = await api.getAdminLeads(token);
            setLeads(data.results || data);
        } catch (error) {
            console.error('Error fetching leads:', error);
            showToast('Failed to load leads', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (searchTerm) params.search = searchTerm;

            const blob = await api.exportLeads(token, params);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showToast('Leads exported successfully');
        } catch (error) {
            showToast('Failed to export leads', 'error');
        } finally {
            setExporting(false);
        }
    };

    const handleStatusUpdate = async (leadId, newStatus) => {
        setUpdatingStatus(true);
        try {
            await api.updateLead(token, leadId, { status: newStatus });
            setLeads(leads.map(lead =>
                lead.id === leadId ? { ...lead, status: newStatus } : lead
            ));
            if (selectedLead && selectedLead.id === leadId) {
                setSelectedLead({ ...selectedLead, status: newStatus });
            }
            showToast(`Lead status updated to ${newStatus}`);
        } catch (error) {
            showToast('Failed to update lead status', 'error');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm) ||
            lead.make.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusConfig = (status) => {
        switch (status) {
            case 'new': return { bg: 'bg-blue-50', text: 'text-blue-600', label: 'New' };
            case 'contacted': return { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Contacted' };
            case 'closed': return { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Closed' };
            case 'converted': return { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Converted' };
            default: return { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Unknown' };
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredLeads.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredLeads.map(l => l.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-6">
            {/* ── Header ────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Leads Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage and track customer part requests.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        disabled={exporting || filteredLeads.length === 0}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Export CSV
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-sm transition-all">
                        + Add Lead
                    </button>
                </div>
            </div>

            {/* ── Filters ───────────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search leads..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                    </div>
                    <div className="relative w-40">
                        <select
                            className="w-full appearance-none pl-10 pr-8 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 text-sm text-slate-700 bg-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="converted">Converted</option>
                            <option value="closed">Closed</option>
                        </select>
                        <FunnelIcon className="h-4 w-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* ── Bulk Actions ──────────────────────────────────────────────── */}
            {selectedIds.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-900">{selectedIds.length} leads selected</span>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-semibold hover:bg-slate-50">Assign to...</button>
                        <button className="px-3 py-1.5 bg-white border border-slate-200 text-rose-600 rounded-md text-xs font-semibold hover:bg-rose-50">Delete</button>
                    </div>
                </div>
            )}

            {/* ── Table ─────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {filteredLeads.length === 0 ? (
                    <div className="text-center py-16">
                        <MagnifyingGlassIcon className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500 text-sm">No leads found matching your criteria</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-4 py-3 w-10">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedIds.length === filteredLeads.length && filteredLeads.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vehicle / Part</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLeads.map((lead) => {
                                    const statusConfig = getStatusConfig(lead.status || 'new');
                                    const isSelected = selectedIds.includes(lead.id);
                                    return (
                                        <tr key={lead.id} className={`hover:bg-slate-50/50 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}>
                                            <td className="px-4 py-3">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(lead.id)}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs flex-shrink-0">
                                                        {lead.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{lead.name}</p>
                                                        <p className="text-[11px] text-slate-500">{lead.zipcode || 'No ZIP'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-xs font-medium text-slate-700">{lead.email}</p>
                                                <p className="text-[11px] text-slate-500">{lead.phone}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-xs font-bold text-slate-900">{lead.year} {lead.make} {lead.model}</p>
                                                <p className="text-[11px] text-slate-500">{lead.part}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-md ${statusConfig.bg} ${statusConfig.text}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500">
                                                {new Date(lead.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => setSelectedLead(lead)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-semibold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 shadow-sm transition-all"
                                                >
                                                    <EyeIcon className="h-3.5 w-3.5" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Modal (Cleaned up) ────────────────────────────────────────── */}
            {selectedLead && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Lead #{selectedLead.id}</h2>
                                <p className="text-xs text-slate-500">Submitted {new Date(selectedLead.created_at).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setSelectedLead(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
                            {/* Status Change */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Update Status</label>
                                <div className="flex flex-wrap gap-2">
                                    {['new', 'contacted', 'converted', 'closed'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusUpdate(selectedLead.id, status)}
                                            disabled={updatingStatus || selectedLead.status === status}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border ${
                                                selectedLead.status === status
                                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Customer */}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Details</label>
                                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase">Name</p>
                                            <p className="text-sm font-semibold text-slate-900">{selectedLead.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase">Email</p>
                                            <a href={`mailto:${selectedLead.email}`} className="text-sm font-semibold text-blue-600">{selectedLead.email}</a>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase">Phone</p>
                                            <a href={`tel:${selectedLead.phone}`} className="text-sm font-semibold text-blue-600">{selectedLead.phone}</a>
                                        </div>
                                    </div>
                                </div>

                                {/* Vehicle */}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Vehicle & Part</label>
                                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase">Vehicle</p>
                                            <p className="text-sm font-semibold text-slate-900">{selectedLead.year} {selectedLead.make} {selectedLead.model}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase">Requested Part</p>
                                            <p className="text-sm font-semibold text-slate-900">{selectedLead.part}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase">Hollander No.</p>
                                            <p className="text-sm font-mono text-slate-700">{selectedLead.hollander_number || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedLead.notes && (
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Notes</label>
                                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                                        <p className="text-sm text-slate-700">{selectedLead.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                            <a href={`tel:${selectedLead.phone}`} className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 text-center hover:bg-slate-50 shadow-sm">
                                Call Customer
                            </a>
                            <a href={`mailto:${selectedLead.email}`} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold text-center hover:bg-blue-700 shadow-sm">
                                Send Email
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
