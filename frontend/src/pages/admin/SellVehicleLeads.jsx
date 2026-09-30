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
import { api } from '../../services/api';

export default function AdminSellVehicleLeads() {
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
        if (token) fetchLeads();
    }, [token]);

    const fetchLeads = async () => {
        try {
            const data = await api.getAdminSellLeads(token);
            setLeads(data.results || data);
        } catch (error) {
            console.error('Error fetching sell vehicle leads:', error);
            showToast('Failed to load sell vehicle leads', 'error');
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

            const blob = await api.exportSellLeads(token, params);
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sell_vehicle_leads_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showToast('Leads exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            showToast('Failed to export leads', 'error');
        } finally {
            setExporting(false);
        }
    };

    const handleStatusUpdate = async (leadId, newStatus) => {
        setUpdatingStatus(true);
        try {
            await api.updateSellLead(token, leadId, { status: newStatus });
            
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
            (lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lead.phone || '').includes(searchTerm) ||
            (lead.make || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lead.model || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusConfig = (status) => {
        const configs = {
            new: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'New', icon: FireIcon, glow: '' },
            contacted: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Contacted', icon: ChatBubbleLeftRightIcon, glow: '' },
            in_progress: { bg: 'bg-purple-50', text: 'text-purple-600', label: 'In Progress', icon: BoltIcon, glow: '' },
            quote_sent: { bg: 'bg-green-50', text: 'text-green-600', label: 'Quote Sent', icon: CheckCircleIcon, glow: '' },
            converted: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Converted', icon: SparklesIcon, glow: '' },
            closed: { bg: 'bg-slate-50', text: 'text-slate-600', label: 'Closed', icon: XMarkIcon, glow: '' }
        };
        return configs[status] || configs.new;
    };

    const getStatusStats = () => {
        return {
            total: leads.length,
            new: leads.filter(l => l.status === 'new').length,
            contacted: leads.filter(l => l.status === 'contacted').length,
            in_progress: leads.filter(l => l.status === 'in_progress').length,
            quote_sent: leads.filter(l => l.status === 'quote_sent').length,
            converted: leads.filter(l => l.status === 'converted').length,
            closed: leads.filter(l => l.status === 'closed').length
        };
    };

    const stats = getStatusStats();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-[#6b7280] font-medium">Loading sell vehicle leads...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* ── Header ────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Sell Vehicle Leads</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage prospects looking to sell their vehicles directly to you.</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <SparklesIcon className="h-4 w-4 text-slate-400" />
                        <p className="text-xs text-slate-500">Total</p>
                    </div>
                    <p className="text-xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <FireIcon className="h-4 w-4 text-blue-500" />
                        <p className="text-xs text-slate-500">New</p>
                    </div>
                    <p className="text-xl font-bold text-slate-900">{stats.new}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <ChatBubbleLeftRightIcon className="h-4 w-4 text-amber-500" />
                        <p className="text-xs text-slate-500">Contacted</p>
                    </div>
                    <p className="text-xl font-bold text-slate-900">{stats.contacted}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <BoltIcon className="h-4 w-4 text-purple-500" />
                        <p className="text-xs text-slate-500">In Progress</p>
                    </div>
                    <p className="text-xl font-bold text-slate-900">{stats.in_progress}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <p className="text-xs text-slate-500">Quote Sent</p>
                    </div>
                    <p className="text-xl font-bold text-slate-900">{stats.quote_sent}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <XMarkIcon className="h-4 w-4 text-slate-400" />
                        <p className="text-xs text-slate-500">Closed</p>
                    </div>
                    <p className="text-xl font-bold text-slate-900">{stats.closed}</p>
                </div>
            </div>

            {/* Filters Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Status Filter Tabs */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <FunnelIcon className="h-5 w-5 text-[#6b7280]" />
                        <span className="text-sm font-medium text-[#6b7280]">Filter:</span>
                        {['all', 'new', 'contacted', 'in_progress', 'quote_sent', 'closed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${statusFilter === status
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </button>
                        ))}
                    </div>

                    {/* Search and Export */}
                    <div className="flex gap-3 lg:ml-auto">
                        <div className="relative flex-1 lg:w-64">
                            <input
                                type="text"
                                placeholder="Search Name, Email, Vehicle..."
                                className="w-full pl-11 pr-4 py-2.5 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <MagnifyingGlassIcon className="h-5 w-5 text-[#9ca3af] absolute left-3.5 top-3" />
                        </div>

                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2 text-sm font-semibold shadow-sm transition-all whitespace-nowrap"
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
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-[#6b7280]">
                        Showing <span className="font-semibold text-[#1f2937]">{filteredLeads.length}</span> of <span className="font-semibold text-[#1f2937]">{leads.length}</span> vehicle leads
                    </p>
                </div>
            </div>

            {/* Modern Table Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-[#f9fafb] to-white border-b-2 border-slate-100">
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Vehicle</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Condition</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f3f4f6]">
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center">
                                        <TruckIcon className="h-16 w-16 mx-auto mb-4 text-[#d1d5db]" />
                                        <p className="text-[#6b7280] text-lg font-medium">No leads found</p>
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
                                            className="group hover:bg-slate-50 transition-all"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
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
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg ${statusConfig.bg} ${statusConfig.text} ${statusConfig.glow}`}>
                                                    <StatusIcon className="h-3.5 w-3.5" />
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold shadow-sm flex-shrink-0">
                                                        {(lead.name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-[#1f2937] truncate max-w-[150px]">{lead.name}</p>
                                                        <div className="flex items-center gap-1 text-[11px] text-[#6b7280]">
                                                            <EnvelopeIcon className="h-3 w-3" />
                                                            <span className="truncate max-w-[130px]">{lead.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-slate-800">{lead.year} {lead.make}</p>
                                                <p className="text-xs text-slate-500 font-medium">{lead.model}</p>
                                                <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">
                                                    VIN: {lead.vin || <span className="text-slate-300 italic">NOT PROVIDED</span>}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPinIcon className="h-4 w-4 text-[#6b7280]" />
                                                    <div>
                                                        <span className="text-sm font-semibold text-[#1f2937] block">{lead.city || 'N/A'}, {lead.state || 'N/A'}</span>
                                                        <span className="text-xs text-slate-500">{lead.zip_code}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2 mb-1">
                                                    {lead.starts ? (
                                                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">Starts</span>
                                                    ) : (
                                                        <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold border border-red-100">No Start</span>
                                                    )}
                                                    {lead.has_title ? (
                                                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">Title</span>
                                                    ) : (
                                                        <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-100">No Title</span>
                                                    )}
                                                </div>
                                                {lead.transportation_required && (
                                                    <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-100">Needs Tow</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedLead(lead)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-semibold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 shadow-sm transition-all"
                                                        title="View Details"
                                                    >
                                                        <EyeIcon className="h-3.5 w-3.5" />
                                                        View
                                                    </button>
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-4xl w-full my-8 shadow-2xl relative">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-5 flex justify-between items-center rounded-t-2xl z-10">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Vehicle Lead Details</h2>
                                <p className="text-sm text-slate-500 mt-1">Lead ID: #{selectedLead.id} • Submitted: {new Date(selectedLead.created_at).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => setSelectedLead(null)}
                                className="text-slate-600 hover:text-slate-900 transition-colors p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status Section */}
                            <div>
                                <label className="block text-sm font-bold text-[#374151] mb-3 uppercase tracking-wide">
                                    Pipeline Status
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {['new', 'contacted', 'in_progress', 'quote_sent', 'converted', 'closed'].map((status) => {
                                        const config = getStatusConfig(status);
                                        const StatusIcon = config.icon;
                                        return (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusUpdate(selectedLead.id, status)}
                                                disabled={updatingStatus || selectedLead.status === status}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedLead.status === status
                                                        ? `${config.bg} ${config.text} border border-transparent shadow-sm ring-2 ring-blue-500 ring-offset-2`
                                                        : 'bg-white border border-slate-200 text-[#6b7280] hover:bg-slate-50'
                                                    } disabled:opacity-70`}
                                            >
                                                <StatusIcon className="h-4 w-4" />
                                                {config.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column: Vehicle & Condition */}
                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                           <TruckIcon className="w-16 h-16"/>
                                        </div>
                                        <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10"><span className="text-lg">🚗</span> Vehicle Specs</h3>
                                        <div className="grid grid-cols-2 gap-4 relative z-10 text-sm">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Make</p>
                                                <p className="font-bold text-slate-900">{selectedLead.make || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Model</p>
                                                <p className="font-bold text-slate-900">{selectedLead.model || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Year</p>
                                                <p className="font-bold text-slate-900">{selectedLead.year || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Trim</p>
                                                <p className="font-bold text-slate-900">{selectedLead.trim || 'N/A'}</p>
                                            </div>
                                            <div className="col-span-2 mt-2">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">VIN / Chassis</p>
                                                <p className="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg inline-block uppercase tracking-widest">{selectedLead.vin || 'NOT PROVIDED'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2"><span className="text-lg">📋</span> Condition Report</h3>
                                        
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                            <div className="text-slate-500 font-semibold tracking-wide text-xs uppercase">Mileage</div>
                                            <div className="font-bold text-slate-800 text-right">{selectedLead.mileage || 'N/A'}</div>
                                            
                                            <div className="text-slate-500 font-semibold tracking-wide text-xs uppercase">Body Damage</div>
                                            <div className="font-bold text-slate-800 text-right">{selectedLead.body_damage || 'None'}</div>
                                            
                                            <div className="text-slate-500 font-semibold tracking-wide text-xs uppercase">Location</div>
                                            <div className="font-bold text-slate-800 text-right">{selectedLead.city}, {selectedLead.state}</div>
                                            
                                            <div className="col-span-2 h-px bg-slate-100 my-1"></div>

                                            <div className="col-span-2 grid grid-cols-2 gap-2 mt-1">
                                                <div className={`p-2 rounded-lg text-xs font-bold flex justify-between items-center ${selectedLead.drivable ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                    <span>Drivable</span> {selectedLead.drivable ? 'Yes' : 'No'}
                                                </div>
                                                <div className={`p-2 rounded-lg text-xs font-bold flex justify-between items-center ${selectedLead.starts ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                    <span>Starts</span> {selectedLead.starts ? 'Yes' : 'No'}
                                                </div>
                                                <div className={`p-2 rounded-lg text-xs font-bold flex justify-between items-center ${selectedLead.has_title ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                                    <span>Has Title</span> {selectedLead.has_title ? 'Yes' : 'No'}
                                                </div>
                                                <div className={`p-2 rounded-lg text-xs font-bold flex justify-between items-center ${selectedLead.has_keys ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    <span>Keys</span> {selectedLead.has_keys ? 'Yes' : 'No'}
                                                </div>
                                            </div>

                                            {selectedLead.transportation_required || selectedLead.engine_issue || selectedLead.transmission_issue ? (
                                                <div className="col-span-2 bg-amber-50 rounded-xl p-3 mt-2 border border-amber-100">
                                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                        <FireIcon className="w-3 h-3" /> Issues / Requirements
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {selectedLead.transportation_required && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded">Needs Towing</span>}
                                                        {selectedLead.engine_issue && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded">Engine Problems</span>}
                                                        {selectedLead.transmission_issue && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded">Transmission Problems</span>}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Customer Info & Notes */}
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl shadow-sm text-white">
                                        <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2"><span className="text-lg">👤</span> Customer Info</h3>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                                                <p className="font-bold text-lg">{selectedLead.name}</p>
                                            </div>
                                            
                                            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phone</p>
                                                    <p className="font-semibold text-slate-200">{selectedLead.phone}</p>
                                                </div>
                                                <a href={`tel:${selectedLead.phone}`} className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/30 transition-colors">
                                                    <PhoneIcon className="w-4 h-4"/>
                                                </a>
                                            </div>
                                            
                                            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email</p>
                                                    <p className="font-semibold text-slate-200 text-sm truncate max-w-[150px]">{selectedLead.email}</p>
                                                </div>
                                                <a href={`mailto:${selectedLead.email}`} className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/30 transition-colors">
                                                    <EnvelopeIcon className="w-4 h-4"/>
                                                </a>
                                            </div>

                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ZIP Code</p>
                                                <p className="font-semibold text-slate-200">{selectedLead.zip_code}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedLead.description && (
                                        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100/50 shadow-sm">
                                            <h3 className="text-[11px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2"><span className="text-lg">💬</span> Customer Notes</h3>
                                            <p className="text-sm font-medium text-amber-900/80 leading-relaxed italic border-l-2 border-amber-200 pl-3 py-1">
                                                "{selectedLead.description}"
                                            </p>
                                        </div>
                                    )}
                                </div>
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
