import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import {
    MagnifyingGlassIcon,
    EyeIcon,
    PhoneIcon,
    EnvelopeIcon,
    CalendarIcon,
    TruckIcon,
    WrenchScrewdriverIcon,
    XMarkIcon,
    FunnelIcon,
    ArrowDownTrayIcon
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
            case 'new': return { bg: 'bg-[#dbeafe]', text: 'text-[#1e40af]', label: 'New' };
            case 'contacted': return { bg: 'bg-[#fef3c7]', text: 'text-[#92400e]', label: 'Contacted' };
            case 'closed': return { bg: 'bg-[#f3f4f6]', text: 'text-[#374151]', label: 'Closed' };
            case 'converted': return { bg: 'bg-[#d1fae5]', text: 'text-[#065f46]', label: 'Converted' };
            default: return { bg: 'bg-[#f3f4f6]', text: 'text-[#374151]', label: 'Unknown' };
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#6366f1] mx-auto mb-4"></div>
                    <p className="text-[#6b7280] font-medium">Loading leads...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-7">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-[#1f2937]">Leads Management</h1>
                    <p className="text-base text-[#6b7280] mt-2">
                        {filteredLeads.length} of {leads.length} leads
                    </p>
                </div>

                <div className="flex gap-3 w-full sm:w-auto flex-wrap">
                    <button
                        onClick={handleExport}
                        disabled={exporting || filteredLeads.length === 0}
                        className="px-5 py-2.5 bg-[#10b981] text-slate-800 rounded-xl hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium flex items-center gap-2 shadow-md transition-all"
                    >
                        {exporting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Exporting...
                            </>
                        ) : (
                            <>
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                Export CSV
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-[#e5e7eb]">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search by name, email, phone, or vehicle..."
                            className="w-full pl-11 pr-4 py-3 border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#6366f1] focus:border-transparent bg-white text-base"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-[#9ca3af] absolute left-3.5 top-3.5" />
                    </div>

                    {/* Status Filter */}
                    <div className="relative sm:w-52">
                        <select
                            className="w-full appearance-none pl-11 pr-10 py-3 border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#6366f1] focus:border-transparent bg-white text-base font-medium text-[#374151]"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="converted">Converted</option>
                            <option value="closed">Closed</option>
                        </select>
                        <FunnelIcon className="h-5 w-5 text-[#9ca3af] absolute left-3.5 top-3.5 pointer-events-none" />
                        <svg className="h-4 w-4 text-[#9ca3af] absolute right-3 top-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Leads Grid */}
            <div className="grid grid-cols-1 gap-5">
                {filteredLeads.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-[#e5e7eb]">
                        <MagnifyingGlassIcon className="h-16 w-16 mx-auto mb-4 text-[#d1d5db]" />
                        <p className="text-[#6b7280] text-lg">No leads found matching your criteria</p>
                    </div>
                ) : (
                    filteredLeads.map((lead) => {
                        const statusConfig = getStatusConfig(lead.status || 'new');
                        return (
                            <div
                                key={lead.id}
                                className="bg-white rounded-2xl shadow-md p-7 border border-[#e5e7eb] hover:shadow-lg transition-all group"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center text-slate-800 font-bold text-xl shadow-md">
                                            {lead.name.charAt(0)}
                                        </div>
                                    </div>

                                    {/* Lead Info */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {/* Customer */}
                                        <div>
                                            <p className="text-sm font-medium text-[#9ca3af] mb-1.5">Customer</p>
                                            <p className="text-base font-semibold text-[#1f2937]">{lead.name}</p>
                                            <p className="text-sm text-[#6b7280] mt-1">{lead.email}</p>
                                            <p className="text-sm text-[#6b7280]">{lead.phone}</p>
                                        </div>

                                        {/* Vehicle */}
                                        <div>
                                            <p className="text-xs font-medium text-[#9ca3af] mb-1">Vehicle</p>
                                            <p className="text-sm font-semibold text-[#1f2937]">
                                                {lead.year} {lead.make}
                                            </p>
                                            <p className="text-xs text-[#6b7280]">{lead.model}</p>
                                        </div>

                                        {/* Part */}
                                        <div>
                                            <p className="text-xs font-medium text-[#9ca3af] mb-1">Part Needed</p>
                                            <p className="text-sm font-semibold text-[#1f2937]">{lead.part}</p>
                                            <p className="text-xs text-[#6b7280]">
                                                {new Date(lead.created_at).toLocaleDateString()}
                                            </p>
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <p className="text-xs font-medium text-[#9ca3af] mb-1">Status</p>
                                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex lg:flex-col gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => setSelectedLead(lead)}
                                            className="flex-1 lg:flex-none px-4 py-2 bg-[#eef2ff] text-[#6366f1] rounded-xl hover:bg-[#e0e7ff] text-sm font-medium flex items-center justify-center gap-2 transition-all"
                                            title="View Details"
                                        >
                                            <EyeIcon className="h-4 w-4" />
                                            <span className="hidden sm:inline">View</span>
                                        </button>
                                        <a
                                            href={`tel:${lead.phone}`}
                                            className="flex-1 lg:flex-none px-4 py-2 bg-[#d1fae5] text-[#10b981] rounded-xl hover:bg-[#a7f3d0] text-sm font-medium flex items-center justify-center gap-2 transition-all"
                                            title="Call"
                                        >
                                            <PhoneIcon className="h-4 w-4" />
                                            <span className="hidden sm:inline">Call</span>
                                        </a>
                                        <a
                                            href={`mailto:${lead.email}`}
                                            className="flex-1 lg:flex-none px-4 py-2 bg-[#ede9fe] text-[#8b5cf6] rounded-xl hover:bg-[#ddd6fe] text-sm font-medium flex items-center justify-center gap-2 transition-all"
                                            title="Email"
                                        >
                                            <EnvelopeIcon className="h-4 w-4" />
                                            <span className="hidden sm:inline">Email</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Lead Details Modal */}
            {selectedLead && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-[#e5e7eb] px-6 py-4 flex justify-between items-center rounded-t-2xl">
                            <div>
                                <h2 className="text-xl font-semibold text-[#1f2937]">Lead Details</h2>
                                <p className="text-sm text-[#6b7280]">ID: #{selectedLead.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedLead(null)}
                                className="text-[#9ca3af] hover:text-[#6b7280] transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status Section */}
                            <div className="bg-[#f9fafb] rounded-xl p-5 border border-[#e5e7eb]">
                                <label className="block text-sm font-medium text-[#374151] mb-3">
                                    Lead Status
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {['new', 'contacted', 'converted', 'closed'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusUpdate(selectedLead.id, status)}
                                            disabled={updatingStatus || selectedLead.status === status}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedLead.status === status
                                                ? 'bg-[#6366f1] text-slate-800 shadow-md'
                                                : 'bg-white border border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb]'
                                                } disabled:opacity-50`}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-[#1f2937] mb-4 flex items-center gap-2">
                                    <EnvelopeIcon className="h-5 w-5 text-[#6366f1]" />
                                    Customer Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#f9fafb] rounded-xl p-4 border border-[#e5e7eb]">
                                        <label className="block text-xs font-medium text-[#6b7280] mb-1">Name</label>
                                        <p className="text-sm font-semibold text-[#1f2937]">{selectedLead.name}</p>
                                    </div>
                                    <div className="bg-[#f9fafb] rounded-xl p-4 border border-[#e5e7eb]">
                                        <label className="block text-xs font-medium text-[#6b7280] mb-1">Email</label>
                                        <a href={`mailto:${selectedLead.email}`} className="text-sm font-semibold text-[#6366f1] hover:underline">
                                            {selectedLead.email}
                                        </a>
                                    </div>
                                    <div className="bg-[#f9fafb] rounded-xl p-4 border border-[#e5e7eb]">
                                        <label className="block text-xs font-medium text-[#6b7280] mb-1">Phone</label>
                                        <a href={`tel:${selectedLead.phone}`} className="text-sm font-semibold text-[#6366f1] hover:underline">
                                            {selectedLead.phone}
                                        </a>
                                    </div>
                                    <div className="bg-[#f9fafb] rounded-xl p-4 border border-[#e5e7eb]">
                                        <label className="block text-xs font-medium text-[#6b7280] mb-1">Location</label>
                                        <p className="text-sm font-semibold text-[#1f2937]">{selectedLead.zipcode || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-[#1f2937] mb-4 flex items-center gap-2">
                                    <TruckIcon className="h-5 w-5 text-[#10b981]" />
                                    Vehicle Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#f9fafb] rounded-xl p-4 border border-[#e5e7eb]">
                                        <label className="block text-xs font-medium text-[#6b7280] mb-1">Year</label>
                                        <p className="text-sm font-semibold text-[#1f2937]">{selectedLead.year}</p>
                                    </div>
                                    <div className="bg-[#f9fafb] rounded-xl p-4 border border-[#e5e7eb]">
                                        <label className="block text-xs font-medium text-[#6b7280] mb-1">Make</label>
                                        <p className="text-sm font-semibold text-[#1f2937]">{selectedLead.make}</p>
                                    </div>
                                    <div className="bg-[#f9fafb] rounded-xl p-4 border border-[#e5e7eb]">
                                        <label className="block text-xs font-medium text-[#6b7280] mb-1">Model</label>
                                        <p className="text-sm font-semibold text-[#1f2937]">{selectedLead.model}</p>
                                    </div>
                                    <div className="bg-[#f9fafb] rounded-xl p-4 border border-[#e5e7eb]">
                                        <label className="block text-xs font-medium text-[#6b7280] mb-1">VIN</label>
                                        <p className="text-sm font-semibold text-[#1f2937] font-mono">{selectedLead.vin || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Part Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-[#1f2937] mb-4 flex items-center gap-2">
                                    <WrenchScrewdriverIcon className="h-5 w-5 text-[#8b5cf6]" />
                                    Part Request
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#f9fafb] rounded-xl p-4 border border-[#e5e7eb]">
                                        <label className="block text-xs font-medium text-[#6b7280] mb-1">Part Needed</label>
                                        <p className="text-sm font-semibold text-[#1f2937]">{selectedLead.part}</p>
                                    </div>
                                    <div className="bg-[#f9fafb] rounded-xl p-4 border border-[#e5e7eb]">
                                        <label className="block text-xs font-medium text-[#6b7280] mb-1">Condition</label>
                                        <p className="text-sm font-semibold text-[#1f2937]">{selectedLead.condition || 'Any'}</p>
                                    </div>
                                    <div className="bg-[#f9fafb] rounded-xl p-4 border border-[#e5e7eb] col-span-2">
                                        <label className="block text-xs font-medium text-[#6b7280] mb-1">Hollander Number</label>
                                        <p className="text-sm font-semibold text-[#1f2937]">{selectedLead.hollander_number || 'NA'}</p>
                                    </div>
                                </div>
                                {selectedLead.notes && (
                                    <div className="mt-4 bg-[#f9fafb] rounded-xl p-4 border border-[#e5e7eb]">
                                        <label className="block text-xs font-medium text-[#6b7280] mb-2">Additional Notes</label>
                                        <p className="text-sm text-[#1f2937] whitespace-pre-wrap">
                                            {selectedLead.notes}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Timeline */}
                            <div>
                                <h3 className="text-lg font-semibold text-[#1f2937] mb-4 flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5 text-[#f59e0b]" />
                                    Timeline
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm bg-[#f9fafb] rounded-xl p-4 border border-[#e5e7eb]">
                                        <div className="w-2 h-2 bg-[#6366f1] rounded-full"></div>
                                        <span className="text-[#6b7280]">Created:</span>
                                        <span className="text-[#1f2937] font-medium">
                                            {new Date(selectedLead.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    {selectedLead.updated_at && selectedLead.updated_at !== selectedLead.created_at && (
                                        <div className="flex items-center gap-3 text-sm bg-[#f9fafb] rounded-xl p-4 border border-[#e5e7eb]">
                                            <div className="w-2 h-2 bg-[#10b981] rounded-full"></div>
                                            <span className="text-[#6b7280]">Last Updated:</span>
                                            <span className="text-[#1f2937] font-medium">
                                                {new Date(selectedLead.updated_at).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-3 pt-4 border-t border-[#e5e7eb]">
                                <a
                                    href={`tel:${selectedLead.phone}`}
                                    className="flex-1 px-4 py-3 bg-[#10b981] text-slate-800 rounded-xl hover:bg-[#059669] text-sm font-medium text-center flex items-center justify-center gap-2 shadow-md transition-all"
                                >
                                    <PhoneIcon className="h-4 w-4" />
                                    Call Customer
                                </a>
                                <a
                                    href={`mailto:${selectedLead.email}?subject=Re: ${selectedLead.part} for ${selectedLead.year} ${selectedLead.make} ${selectedLead.model}`}
                                    className="flex-1 px-4 py-3 bg-[#6366f1] text-slate-800 rounded-xl hover:bg-[#4f46e5] text-sm font-medium text-center flex items-center justify-center gap-2 shadow-md transition-all"
                                >
                                    <EnvelopeIcon className="h-4 w-4" />
                                    Send Email
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
