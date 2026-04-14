import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import {
    MagnifyingGlassIcon,
    EyeIcon,
    PhoneIcon,
    EnvelopeIcon,
    CalendarIcon,
    TruckIcon,
    XMarkIcon,
    SparklesIcon,
    ArrowDownTrayIcon,
    FunnelIcon,
    UserCircleIcon,
    MapPinIcon,
    ClockIcon,
    CheckCircleIcon,
    ChatBubbleLeftRightIcon,
    BoltIcon,
    FireIcon
} from '@heroicons/react/24/outline';
import Toast from '../../components/Toast';

export default function AdminVendorLeads() {
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
        fetchVendorLeads();
    }, [token]);

    const fetchVendorLeads = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/vendor-leads/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setLeads(data.results || data);
        } catch (error) {
            console.error('Error fetching vendor leads:', error);
            showToast('Failed to load vendor leads', 'error');
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
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/vendor-leads/export_csv/?${params}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vendor_leads_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showToast('Vendor leads exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            showToast('Failed to export vendor leads', 'error');
        } finally {
            setExporting(false);
        }
    };

    const handleStatusUpdate = async (leadId, newStatus) => {
        setUpdatingStatus(true);
        try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/vendor-leads/${leadId}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            setLeads(leads.map(lead =>
                lead.id === leadId ? { ...lead, status: newStatus } : lead
            ));
            if (selectedLead && selectedLead.id === leadId) {
                setSelectedLead({ ...selectedLead, status: newStatus });
            }
            showToast(`Vendor lead status updated to ${newStatus}`);
        } catch (error) {
            showToast('Failed to update vendor lead status', 'error');
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
        const configs = {
            new: {
                bg: 'bg-gradient-to-r from-blue-400 to-blue-600',
                text: 'text-slate-800',
                label: 'New',
                icon: FireIcon,
                glow: 'shadow-lg shadow-blue-200'
            },
            contacted: {
                bg: 'bg-gradient-to-r from-amber-400 to-orange-500',
                text: 'text-slate-800',
                label: 'Contacted',
                icon: ChatBubbleLeftRightIcon,
                glow: 'shadow-lg shadow-amber-200'
            },
            converted: {
                bg: 'bg-gradient-to-r from-emerald-400 to-green-500',
                text: 'text-slate-800',
                label: 'Converted',
                icon: CheckCircleIcon,
                glow: 'shadow-lg shadow-emerald-200'
            },
            closed: {
                bg: 'bg-gradient-to-r from-gray-400 to-gray-600',
                text: 'text-slate-800',
                label: 'Closed',
                icon: XMarkIcon,
                glow: 'shadow-lg shadow-gray-200'
            }
        };
        return configs[status] || configs.new;
    };

    const getStatusStats = () => {
        return {
            total: leads.length,
            new: leads.filter(l => l.status === 'new').length,
            contacted: leads.filter(l => l.status === 'contacted').length,
            converted: leads.filter(l => l.status === 'converted').length,
            closed: leads.filter(l => l.status === 'closed').length
        };
    };

    const stats = getStatusStats();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#6366f1] mx-auto mb-4"></div>
                    <p className="text-[#6b7280] font-medium">Loading vendor leads...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Gradient Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#a855f7] rounded-2xl shadow-xl p-8">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>

                <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                            <TruckIcon className="h-8 w-8 text-slate-800" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Vendor Leads Management</h1>
                            <p className="text-indigo-100 mt-1">
                                Track and manage customer inquiries to vendors
                            </p>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                            <div className="flex items-center gap-2 mb-1">
                                <SparklesIcon className="h-4 w-4 text-slate-800" />
                                <p className="text-xs text-indigo-100">Total</p>
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                            <div className="flex items-center gap-2 mb-1">
                                <FireIcon className="h-4 w-4 text-blue-200" />
                                <p className="text-xs text-indigo-100">New</p>
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{stats.new}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                            <div className="flex items-center gap-2 mb-1">
                                <ChatBubbleLeftRightIcon className="h-4 w-4 text-amber-200" />
                                <p className="text-xs text-indigo-100">Contacted</p>
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{stats.contacted}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircleIcon className="h-4 w-4 text-green-200" />
                                <p className="text-xs text-indigo-100">Converted</p>
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{stats.converted}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                            <div className="flex items-center gap-2 mb-1">
                                <XMarkIcon className="h-4 w-4 text-gray-200" />
                                <p className="text-xs text-indigo-100">Closed</p>
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{stats.closed}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-[#e5e7eb]">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Status Filter Tabs */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <FunnelIcon className="h-5 w-5 text-[#6b7280]" />
                        <span className="text-sm font-medium text-[#6b7280]">Filter:</span>
                        {['all', 'new', 'contacted', 'converted', 'closed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === status
                                        ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-slate-800 shadow-lg shadow-indigo-200'
                                        : 'bg-[#f9fafb] text-[#6b7280] hover:bg-[#e5e7eb]'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Search and Export */}
                    <div className="flex gap-3 lg:ml-auto">
                        <div className="relative flex-1 lg:w-64">
                            <input
                                type="text"
                                placeholder="Search leads..."
                                className="w-full pl-11 pr-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#6366f1] focus:border-transparent bg-white text-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <MagnifyingGlassIcon className="h-5 w-5 text-[#9ca3af] absolute left-3.5 top-3" />
                        </div>

                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-slate-800 rounded-xl hover:from-emerald-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg shadow-emerald-200 transition-all whitespace-nowrap"
                        >
                            {exporting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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

                {/* Results Count */}
                <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
                    <p className="text-sm text-[#6b7280]">
                        Showing <span className="font-semibold text-[#1f2937]">{filteredLeads.length}</span> of <span className="font-semibold text-[#1f2937]">{leads.length}</span> vendor leads
                    </p>
                </div>
            </div>

            {/* Modern Table Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#e5e7eb]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-[#f9fafb] to-white border-b-2 border-[#e5e7eb]">
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Vehicle</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f3f4f6]">
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center">
                                        <TruckIcon className="h-16 w-16 mx-auto mb-4 text-[#d1d5db]" />
                                        <p className="text-[#6b7280] text-lg font-medium">No vendor leads found</p>
                                        <p className="text-[#9ca3af] text-sm mt-1">Try adjusting your filters</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => {
                                    const statusConfig = getStatusConfig(lead.status || 'new');
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <tr
                                            key={lead.id}
                                            className="group hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="h-4 w-4 text-[#6b7280]" />
                                                    <span className="text-sm text-[#6b7280]">
                                                        {new Date(lead.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg ${statusConfig.bg} ${statusConfig.text} ${statusConfig.glow}`}>
                                                    <StatusIcon className="h-3.5 w-3.5" />
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-slate-800 font-bold shadow-md">
                                                        {lead.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-[#1f2937]">{lead.name}</p>
                                                        <p className="text-xs text-[#6b7280]">ID: #{lead.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <TruckIcon className="h-4 w-4 text-[#6b7280]" />
                                                    <span className="text-sm text-[#1f2937]">
                                                        {lead.year} {lead.make} {lead.model}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPinIcon className="h-4 w-4 text-[#6b7280]" />
                                                    <span className="text-sm text-[#1f2937]">{lead.state}, {lead.zip}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <EnvelopeIcon className="h-3.5 w-3.5 text-[#6b7280]" />
                                                        <span className="text-xs text-[#6b7280]">{lead.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <PhoneIcon className="h-3.5 w-3.5 text-[#6b7280]" />
                                                        <span className="text-xs text-[#6b7280]">{lead.phone}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedLead(lead)}
                                                        className="p-2 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-slate-800 rounded-lg hover:from-[#4f46e5] hover:to-[#7c3aed] transition-all shadow-md shadow-indigo-200"
                                                        title="View Details"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </button>
                                                    <a
                                                        href={`tel:${lead.phone}`}
                                                        className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 text-slate-800 rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all shadow-md shadow-emerald-200"
                                                        title="Call"
                                                    >
                                                        <PhoneIcon className="h-4 w-4" />
                                                    </a>
                                                    <a
                                                        href={`mailto:${lead.email}`}
                                                        className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 text-slate-800 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md shadow-purple-200"
                                                        title="Email"
                                                    >
                                                        <EnvelopeIcon className="h-4 w-4" />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Enhanced Lead Details Modal */}
            {selectedLead && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-6 py-5 flex justify-between items-center rounded-t-2xl">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Vendor Lead Details</h2>
                                <p className="text-sm text-indigo-100">ID: #{selectedLead.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedLead(null)}
                                className="text-slate-600 hover:text-slate-800 transition-colors p-2 hover:bg-white/10 rounded-lg"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status Section */}
                            <div>
                                <label className="block text-sm font-bold text-[#374151] mb-3 uppercase tracking-wide">
                                    Lead Status
                                </label>
                                <div className="flex gap-3 flex-wrap">
                                    {['new', 'contacted', 'converted', 'closed'].map((status) => {
                                        const config = getStatusConfig(status);
                                        const StatusIcon = config.icon;
                                        return (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusUpdate(selectedLead.id, status)}
                                                disabled={updatingStatus || selectedLead.status === status}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedLead.status === status
                                                        ? `${config.bg} ${config.text} ${config.glow}`
                                                        : 'bg-[#f9fafb] border border-[#e5e7eb] text-[#6b7280] hover:bg-[#e5e7eb]'
                                                    } disabled:opacity-50`}
                                            >
                                                <StatusIcon className="h-4 w-4" />
                                                {config.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div>
                                <h3 className="text-lg font-bold text-[#1f2937] mb-4 flex items-center gap-2">
                                    <UserCircleIcon className="h-5 w-5 text-[#6366f1]" />
                                    Customer Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-[#e5e7eb]">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">Name</label>
                                        <p className="text-sm font-semibold text-[#1f2937]">{selectedLead.name}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-[#e5e7eb]">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">Email</label>
                                        <a href={`mailto:${selectedLead.email}`} className="text-sm font-semibold text-[#6366f1] hover:underline">
                                            {selectedLead.email}
                                        </a>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-[#e5e7eb]">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">Phone</label>
                                        <a href={`tel:${selectedLead.phone}`} className="text-sm font-semibold text-[#6366f1] hover:underline">
                                            {selectedLead.phone}
                                        </a>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-[#e5e7eb]">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">Location</label>
                                        <p className="text-sm font-semibold text-[#1f2937]">{selectedLead.state}, {selectedLead.zip}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Information */}
                            <div>
                                <h3 className="text-lg font-bold text-[#1f2937] mb-4 flex items-center gap-2">
                                    <TruckIcon className="h-5 w-5 text-[#10b981]" />
                                    Vehicle Information
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-[#e5e7eb]">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">Year</label>
                                        <p className="text-sm font-semibold text-[#1f2937]">{selectedLead.year}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-[#e5e7eb]">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">Make</label>
                                        <p className="text-sm font-semibold text-[#1f2937]">{selectedLead.make}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-[#e5e7eb]">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">Model</label>
                                        <p className="text-sm font-semibold text-[#1f2937]">{selectedLead.model}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div>
                                <h3 className="text-lg font-bold text-[#1f2937] mb-4 flex items-center gap-2">
                                    <ClockIcon className="h-5 w-5 text-[#f59e0b]" />
                                    Timeline
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                                        <div className="w-2 h-2 bg-[#6366f1] rounded-full animate-pulse"></div>
                                        <span className="text-[#6b7280] font-medium">Created:</span>
                                        <span className="text-[#1f2937] font-semibold">
                                            {new Date(selectedLead.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    {selectedLead.updated_at && selectedLead.updated_at !== selectedLead.created_at && (
                                        <div className="flex items-center gap-3 text-sm bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                                            <div className="w-2 h-2 bg-[#10b981] rounded-full"></div>
                                            <span className="text-[#6b7280] font-medium">Last Updated:</span>
                                            <span className="text-[#1f2937] font-semibold">
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
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-slate-800 rounded-xl hover:from-emerald-600 hover:to-green-600 text-sm font-bold text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all"
                                >
                                    <PhoneIcon className="h-4 w-4" />
                                    Call Customer
                                </a>
                                <a
                                    href={`mailto:${selectedLead.email}?subject=Re: Vendor Inquiry for ${selectedLead.year} ${selectedLead.make} ${selectedLead.model}`}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-slate-800 rounded-xl hover:from-[#4f46e5] hover:to-[#7c3aed] text-sm font-bold text-center flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all"
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
