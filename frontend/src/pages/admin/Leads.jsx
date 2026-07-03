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
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState(null);
    const [toast, setToast] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    
    // Vendor Assignment State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [vendors, setVendors] = useState([]);
    const [assigning, setAssigning] = useState(false);
    const [vendorSearch, setVendorSearch] = useState('');

    // Hollander Editing State
    const [editingLeadVariants, setEditingLeadVariants] = useState(null);
    const [loadingVariants, setLoadingVariants] = useState(false);
    const [editingLeadId, setEditingLeadId] = useState(null);

    useEffect(() => {
        fetchLeads();
        
        // Auto-refresh leads every 10 seconds
        const intervalId = setInterval(() => {
            fetchLeads(false); // Pass false to indicate background fetch (no loading spinner)
        }, 10000);
        
        return () => clearInterval(intervalId);
    }, [token]);

    const fetchLeads = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const data = await api.getAdminLeads(token);
            setLeads(data.results || data);
        } catch (error) {
            console.error('Error fetching leads:', error);
            if (showLoading) showToast('Failed to load leads', 'error');
        } finally {
            if (showLoading) setLoading(false);
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

    const handleEditHollander = async (lead) => {
        setLoadingVariants(true);
        setEditingLeadVariants(null);
        setEditingLeadId(lead.id);
        
        try {
            // 1. Get Make ID
            const makes = await api.getMakes();
            const makeObj = makes.find(m => (m.makeName || m.make_name || '').toLowerCase() === (lead.make || '').toLowerCase());
            if (!makeObj) throw new Error(`Make "${lead.make}" not found in database.`);

            // 2. Get Bulk Data
            const makeIdToUse = makeObj.makeID || makeObj.make_id;
            const bulk = await api.getVehicleDataBulk(makeIdToUse);
            const modelObj = bulk.models.find(m => (m.modelName || m.model_name || '').toLowerCase() === (lead.model || '').toLowerCase());
            if (!modelObj) throw new Error(`Model "${lead.model}" not found for ${lead.make}.`);

            // 3. Get Parts for Year
            const yearParts = modelObj.parts[lead.year];
            if (!yearParts) throw new Error(`No parts catalog for ${lead.year} ${lead.make} ${lead.model}.`);

            // 4. Find the Specific Part
            const partObj = yearParts.find(p => (p.partName || p.part_name || '').toLowerCase() === (lead.part || '').toLowerCase());
            if (!partObj) throw new Error(`Part "${lead.part}" not found for this vehicle.`);

            if (partObj.variants && partObj.variants.length > 0) {
                setEditingLeadVariants(partObj.variants);
            } else {
                throw new Error("No Hollander variants exist for this exact part in the database.");
            }
        } catch (error) {
            showToast(error.message, 'error');
            setEditingLeadId(null);
        } finally {
            setLoadingVariants(false);
        }
    };

    const handleSaveHollander = async (leadId, variant) => {
        try {
            await api.updateLead(token, leadId, {
                hollander_number: variant.hollander_number,
                options: variant.options || ''
            });
            showToast('Lead updated successfully');
            setEditingLeadId(null);
            setEditingLeadVariants(null);
            
            // Update local state to reflect change instantly
            setLeads(prev => prev.map(l => {
                if (l.id === leadId) {
                    return { ...l, hollander_number: variant.hollander_number, options: variant.options || '' };
                }
                return l;
            }));
            
            // If the currently viewed lead is the one we updated, update it too
            if (selectedLead && selectedLead.id === leadId) {
                setSelectedLead(prev => ({ ...prev, hollander_number: variant.hollander_number, options: variant.options || '' }));
            }
        } catch (error) {
            showToast('Failed to update lead', 'error');
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm) ||
            lead.make.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

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

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} leads?`)) return;
        try {
            await Promise.all(selectedIds.map(id => api.deleteLead(token, id)));
            setSelectedIds([]);
            fetchLeads();
            showToast(`Deleted ${selectedIds.length} leads successfully`, 'success');
        } catch (error) {
            showToast('Failed to delete some leads', 'error');
        }
    };

    const handleOpenAssignModal = async () => {
        setShowAssignModal(true);
        if (vendors.length === 0) {
            try {
                const data = await api.getAdminVendors(token, { limit: 100 });
                setVendors(data.results || data);
            } catch (err) {
                console.error('Failed to load vendors', err);
            }
        }
    };

    const handleAssignToVendor = async (vendorId) => {
        setAssigning(true);
        try {
            await Promise.all(selectedIds.map(id => api.updateLead(token, id, { vendor: vendorId })));
            setSelectedIds([]);
            setShowAssignModal(false);
            fetchLeads();
            showToast(`Successfully assigned ${selectedIds.length} leads to vendor!`, 'success');
        } catch (error) {
            showToast('Failed to assign some leads', 'error');
        } finally {
            setAssigning(false);
        }
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
                </div>
            </div>

            {/* ── Filters ───────────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <div className="relative max-w-md">
                    <input
                        type="text"
                        placeholder="Search leads, vendors, messages..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
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
                        <button onClick={handleOpenAssignModal} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-semibold hover:bg-slate-50 transition-colors">Assign to...</button>
                        <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-white border border-slate-200 text-rose-600 rounded-md text-xs font-semibold hover:bg-rose-50 transition-colors">Delete</button>
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
                                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLeads.map((lead) => {
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
                                                        <p className="text-[11px] text-slate-500">
                                                            {lead.state && lead.zip
                                                                ? `${lead.state} ${lead.zip}`
                                                                : lead.zip || lead.state || 'No location'
                                                            }
                                                        </p>
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

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-5">
                            <div className="space-y-4">

                                {/* Customer Details */}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Details</label>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase">Name</p>
                                                <p className="text-sm font-semibold text-slate-900">{selectedLead.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase">Phone</p>
                                                <a href={`tel:${selectedLead.phone}`} className="text-sm font-semibold text-blue-600">{selectedLead.phone}</a>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[10px] text-slate-500 uppercase">Email</p>
                                                <a href={`mailto:${selectedLead.email}`} className="text-sm font-semibold text-blue-600">{selectedLead.email}</a>
                                            </div>
                                            {(selectedLead.state || selectedLead.zip) && (
                                                <>
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 uppercase">State</p>
                                                        <p className="text-sm font-semibold text-slate-900">{selectedLead.state || '—'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 uppercase">ZIP Code</p>
                                                        <p className="text-sm font-semibold text-slate-900">{selectedLead.zip || '—'}</p>
                                                    </div>
                                                </>
                                            )}
                                            {selectedLead.lead_type && (
                                                <div className="col-span-2">
                                                    <p className="text-[10px] text-slate-500 uppercase">Lead Type</p>
                                                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                                        {selectedLead.lead_type === 'vendor' ? 'Junkyard Vendor' : 'Quality Auto Parts'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Vehicle & Part */}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Vehicle &amp; Part</label>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <p className="text-[10px] text-slate-500 uppercase">Vehicle</p>
                                                <p className="text-sm font-bold text-slate-900">{selectedLead.year} {selectedLead.make} {selectedLead.model}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[10px] text-slate-500 uppercase">Requested Part</p>
                                                <p className="text-sm font-semibold text-slate-900">{selectedLead.part || '—'}</p>
                                            </div>
                                            {selectedLead.options && (
                                                <div className="col-span-2">
                                                    <p className="text-[10px] text-slate-500 uppercase mb-1">Part Options / Specs</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {selectedLead.options.split(',').map((opt, i) => (
                                                            <span key={i} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                                {opt.replace(/^\(|\)$/g, '').trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="col-span-2">
                                                <p className="text-[10px] text-slate-500 uppercase mb-1">Hollander Interchange No.</p>
                                                {selectedLead.hollander_number && selectedLead.hollander_number !== 'N/A' && selectedLead.hollander_number !== 'Not Found' ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-bold text-sm">
                                                            <CheckCircleIcon className="w-4 h-4" />
                                                            {selectedLead.hollander_number}
                                                        </span>
                                                        <button 
                                                            onClick={() => handleEditHollander(selectedLead)}
                                                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline px-2 py-1"
                                                        >
                                                            Change
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 font-mono font-bold text-sm">
                                                            Unresolved
                                                        </span>
                                                        <button 
                                                            onClick={() => handleEditHollander(selectedLead)}
                                                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline px-2 py-1 bg-blue-50 rounded"
                                                        >
                                                            Resolve Manually
                                                        </button>
                                                    </div>
                                                )}
                                                
                                                {/* Show Candidates if available (from new progressive question engine) */}
                                                {selectedLead.hollander_candidates && selectedLead.hollander_candidates.length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="text-[10px] text-rose-500 uppercase font-bold mb-1 flex items-center gap-1">
                                                            <span>⚠️</span> Needs Manual Disambiguation ({selectedLead.hollander_candidates.length} variants found)
                                                        </p>
                                                        <div className="bg-rose-50 border border-rose-100 rounded-lg p-2 max-h-[120px] overflow-y-auto">
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {selectedLead.hollander_candidates.map(hn => (
                                                                    <span key={hn} className="px-2 py-1 bg-white border border-rose-200 rounded text-rose-700 font-mono text-[11px] font-bold shadow-sm">
                                                                        {hn}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                                
                                                {/* Variant Picker UI */}
                                                {editingLeadId === selectedLead.id && (
                                                    <div className="mt-3 p-3 bg-white border border-blue-200 rounded-xl shadow-sm">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-[11px] font-bold text-blue-900 uppercase">Select Correct Part Variant</span>
                                                            <button onClick={() => setEditingLeadId(null)} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="w-4 h-4" /></button>
                                                        </div>
                                                        {loadingVariants ? (
                                                            <p className="text-xs text-slate-500 animate-pulse">Loading database variations...</p>
                                                        ) : editingLeadVariants ? (
                                                            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                                                                {editingLeadVariants.map((v, idx) => (
                                                                    <button 
                                                                        key={idx}
                                                                        onClick={() => handleSaveHollander(selectedLead.id, v)}
                                                                        className="w-full text-left p-2 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-colors group flex items-start gap-3"
                                                                    >
                                                                        <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] font-bold rounded group-hover:bg-blue-100 group-hover:text-blue-700">
                                                                            {v.hollander_number}
                                                                        </span>
                                                                        <span className="text-[11px] text-slate-600 flex-1 leading-snug">
                                                                            {v.options ? v.options.replace(/^\(|\)$/g, '').trim() : 'Base Part (No Specific Options)'}
                                                                        </span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-red-500">Failed to load variations.</p>
                                                        )}
                                                    </div>
                                                )}
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

            {/* ── Assign Vendor Modal ───────────────────────────────────────── */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4 z-[9999]">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Assign Leads</h3>
                                <p className="text-sm text-slate-500">Select a vendor for {selectedIds.length} lead(s)</p>
                            </div>
                            <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-5">
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    placeholder="Search vendors..."
                                    value={vendorSearch}
                                    onChange={(e) => setVendorSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 text-sm"
                                />
                                <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                            </div>
                            <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-100 rounded-lg p-2 bg-slate-50">
                                {vendors.filter(v => v.name?.toLowerCase().includes(vendorSearch.toLowerCase())).map(vendor => (
                                    <button
                                        key={vendor.id}
                                        onClick={() => handleAssignToVendor(vendor.id)}
                                        disabled={assigning}
                                        className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-colors group flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="font-semibold text-sm text-slate-900 group-hover:text-blue-700">{vendor.name}</p>
                                            <p className="text-xs text-slate-500">{vendor.city}, {vendor.state}</p>
                                        </div>
                                        <div className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Assign</div>
                                    </button>
                                ))}
                                {vendors.length === 0 && <p className="text-center text-slate-500 text-sm py-4">Loading vendors...</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
