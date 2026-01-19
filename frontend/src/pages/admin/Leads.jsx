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
    XMarkIcon
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

            // Create download link
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800';
            case 'contacted': return 'bg-yellow-100 text-yellow-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            case 'converted': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {filteredLeads.length} of {leads.length} leads
                    </p>
                </div>

                <div className="flex gap-3 w-full sm:w-auto flex-wrap">
                    <button
                        onClick={handleExport}
                        disabled={exporting || filteredLeads.length === 0}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                    >
                        {exporting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Exporting...
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export CSV
                            </>
                        )}
                    </button>

                    <select
                        className="border rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                        <option value="closed">Closed</option>
                    </select>

                    <div className="relative flex-1 sm:flex-none">
                        <input
                            type="text"
                            placeholder="Search leads..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="7" className="px-6 py-10 text-center">Loading...</td></tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500">No leads found matching your criteria</td></tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status || 'new')}`}>
                                                {(lead.status || 'new').charAt(0).toUpperCase() + (lead.status || 'new').slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {lead.year} {lead.make} {lead.model}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {lead.part}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{lead.email}</div>
                                            <div className="text-xs">{lead.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                            <button
                                                onClick={() => setSelectedLead(lead)}
                                                className="text-blue-600 hover:text-blue-900 font-medium"
                                                title="View Details"
                                            >
                                                <EyeIcon className="h-5 w-5 inline" />
                                            </button>
                                            <a
                                                href={`tel:${lead.phone}`}
                                                className="text-green-600 hover:text-green-900 font-medium"
                                                title="Call"
                                            >
                                                <PhoneIcon className="h-5 w-5 inline" />
                                            </a>
                                            <a
                                                href={`mailto:${lead.email}`}
                                                className="text-purple-600 hover:text-purple-900 font-medium"
                                                title="Email"
                                            >
                                                <EnvelopeIcon className="h-5 w-5 inline" />
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Lead Details Modal */}
            {selectedLead && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Lead Details</h2>
                                <p className="text-sm text-gray-500">ID: #{selectedLead.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedLead(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status Section */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lead Status
                                </label>
                                <div className="flex gap-2">
                                    {['new', 'contacted', 'converted', 'closed'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusUpdate(selectedLead.id, status)}
                                            disabled={updatingStatus || selectedLead.status === status}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedLead.status === status
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                } disabled:opacity-50`}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                    Customer Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedLead.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            <a href={`mailto:${selectedLead.email}`} className="text-blue-600 hover:underline">
                                                {selectedLead.email}
                                            </a>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            <a href={`tel:${selectedLead.phone}`} className="text-blue-600 hover:underline">
                                                {selectedLead.phone}
                                            </a>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Location</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedLead.zipcode || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <TruckIcon className="h-5 w-5 text-gray-400" />
                                    Vehicle Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Year</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedLead.year}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Make</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedLead.make}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Model</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedLead.model}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">VIN</label>
                                        <p className="mt-1 text-sm text-gray-900 font-mono">{selectedLead.vin || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Part Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <WrenchScrewdriverIcon className="h-5 w-5 text-gray-400" />
                                    Part Request
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Part Needed</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedLead.part}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Condition</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedLead.condition || 'Any'}</p>
                                    </div>
                                </div>
                                {selectedLead.notes && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                                        <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                                            {selectedLead.notes}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Timeline */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                                    Timeline
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        <span className="text-gray-500">Created:</span>
                                        <span className="text-gray-900 font-medium">
                                            {new Date(selectedLead.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    {selectedLead.updated_at && selectedLead.updated_at !== selectedLead.created_at && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                            <span className="text-gray-500">Last Updated:</span>
                                            <span className="text-gray-900 font-medium">
                                                {new Date(selectedLead.updated_at).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-3 pt-4 border-t">
                                <a
                                    href={`tel:${selectedLead.phone}`}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium text-center flex items-center justify-center gap-2"
                                >
                                    <PhoneIcon className="h-4 w-4" />
                                    Call Customer
                                </a>
                                <a
                                    href={`mailto:${selectedLead.email}?subject=Re: ${selectedLead.part} for ${selectedLead.year} ${selectedLead.make} ${selectedLead.model}`}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium text-center flex items-center justify-center gap-2"
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
