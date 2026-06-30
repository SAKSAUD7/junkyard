import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    MagnifyingGlassIcon,
    XMarkIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    BuildingOfficeIcon,
    MapPinIcon,
    CalendarIcon,
    DocumentTextIcon,
    FunnelIcon,
    SparklesIcon,
    CheckIcon
} from '@heroicons/react/24/outline';

// Toast notification component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className={`fixed bottom-8 right-8 ${bgColor} text-slate-900 px-6 py-4 rounded-xl shadow-sm z-50 animate-fade-in`}>
            <p className="font-medium">{message}</p>
        </div>
    );
};

export default function YardSubmissions() {
    const [submissions, setSubmissions] = useState([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [rejectNotes, setRejectNotes] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    useEffect(() => {
        filterSubmissions();
    }, [submissions, statusFilter, searchTerm]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/yard-submissions/`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            // Handle paginated response - extract results array
            const data = response.data.results || response.data || [];
            setSubmissions(Array.isArray(data) ? data : []);
            setError('');
        } catch (err) {
            console.error('Error fetching submissions:', err);
            setError('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    const filterSubmissions = () => {
        let filtered = submissions;

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(sub => sub.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(sub =>
                sub.business_name.toLowerCase().includes(search) ||
                sub.city.toLowerCase().includes(search) ||
                sub.state.toLowerCase().includes(search) ||
                sub.email.toLowerCase().includes(search) ||
                sub.contact_name.toLowerCase().includes(search)
            );
        }

        setFilteredSubmissions(filtered);
    };

    const handleApprove = async (submissionId) => {
        if (!confirm('Are you sure you want to approve this submission? This will create a new vendor.')) {
            return;
        }

        try {
            setActionLoading(true);
            const token = localStorage.getItem('access_token');
            await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/yard-submissions/${submissionId}/approve/`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setToast({ message: 'Submission approved successfully!', type: 'success' });
            setSelectedSubmission(null);
            fetchSubmissions();
        } catch (err) {
            console.error('Error approving submission:', err);
            setToast({ message: err.response?.data?.error || 'Failed to approve submission', type: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (submissionId) => {
        try {
            setActionLoading(true);
            const token = localStorage.getItem('access_token');
            await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/yard-submissions/${submissionId}/reject/`,
                { notes: rejectNotes },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setToast({ message: 'Submission rejected', type: 'success' });
            setSelectedSubmission(null);
            setShowRejectModal(false);
            setRejectNotes('');
            fetchSubmissions();
        } catch (err) {
            console.error('Error rejecting submission:', err);
            setToast({ message: 'Failed to reject submission', type: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const toggleSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredSubmissions.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredSubmissions.map(s => s.id));
        }
    };

    const getStatusBadge = (status) => {
        const configs = {
            pending: {
                bg: 'bg-amber-50',
                text: 'text-amber-600',
                label: 'Pending Review',
                icon: ClockIcon,
                glow: ''
            },
            approved: {
                bg: 'bg-emerald-50',
                text: 'text-emerald-600',
                label: 'Approved',
                icon: CheckCircleIcon,
                glow: ''
            },
            rejected: {
                bg: 'bg-rose-50',
                text: 'text-rose-600',
                label: 'Rejected',
                icon: XCircleIcon,
                glow: ''
            }
        };
        return configs[status] || configs.pending;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-[#6b7280] font-medium">Loading submissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ── Header ────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Yard Submissions</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage and review new yard applications.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                        <SparklesIcon className="h-5 w-5 text-slate-400" />
                        <div>
                            <p className="text-sm font-bold text-slate-900">{filteredSubmissions.length}</p>
                            <p className="text-xs text-slate-500">Total</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                        <ClockIcon className="h-5 w-5 text-amber-500" />
                        <div>
                            <p className="text-sm font-bold text-slate-900">{filteredSubmissions.filter(s => s.status === 'pending').length}</p>
                            <p className="text-xs text-slate-500">Pending</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
                {/* Status Tabs */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <FunnelIcon className="h-5 w-5 text-[#6b7280]" />
                    <span className="text-sm font-medium text-[#6b7280]">Filter:</span>
                    {['all', 'pending', 'approved', 'rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${statusFilter === status
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by business name, contact, city, state, or email..."
                        className="w-full pl-11 pr-4 py-3 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="h-5 w-5 text-[#9ca3af] absolute left-3.5 top-3.5" />
                </div>
            </div>

            {/* Modern Table Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
                {/* Action Bar */}
                <div className="bg-gradient-to-r from-[#f9fafb] to-[#f3f4f6] px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[#6b7280]">Bulk Actions:</span>
                        <select className="bg-white border border-slate-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all">
                            <option>Select action...</option>
                            <option>Approve selected</option>
                            <option>Reject selected</option>
                        </select>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm">
                            Apply
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-100">
                            <span className="text-sm">
                                <span className="font-semibold text-blue-600">{selectedIds.length}</span>
                                <span className="text-[#6b7280]"> of </span>
                                <span className="font-semibold text-[#1f2937]">{filteredSubmissions.length}</span>
                                <span className="text-[#6b7280]"> selected</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-[#f9fafb] to-white border-b-2 border-slate-100">
                                <th className="px-6 py-4 text-left w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === filteredSubmissions.length && filteredSubmissions.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-[#d1d5db] text-blue-600 focus:ring-blue-600 focus:ring-offset-0 cursor-pointer"
                                    />
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Business Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Created</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Vendor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f3f4f6]">
                            {filteredSubmissions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center">
                                        <DocumentTextIcon className="h-16 w-16 mx-auto mb-4 text-[#d1d5db]" />
                                        <p className="text-[#6b7280] text-lg font-medium">No submissions found</p>
                                        <p className="text-[#9ca3af] text-sm mt-1">Try adjusting your filters</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredSubmissions.map((submission) => {
                                    const statusConfig = getStatusBadge(submission.status);
                                    const StatusIcon = statusConfig.icon;
                                    const isSelected = selectedIds.includes(submission.id);

                                    return (
                                        <tr
                                            key={submission.id}
                                            className={`group hover:bg-slate-50 transition-all cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''
                                                }`}
                                            onClick={(e) => {
                                                if (e.target.type !== 'checkbox') {
                                                    setSelectedSubmission(submission);
                                                }
                                            }}
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelection(submission.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-4 h-4 rounded border-[#d1d5db] text-blue-600 focus:ring-blue-600 focus:ring-offset-0 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 font-bold shadow-sm">
                                                        {submission.business_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-[#1f2937]">{submission.business_name}</p>
                                                        <p className="text-xs text-[#6b7280]">ID: #{submission.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-[#1f2937]">{submission.contact_name}</p>
                                                <p className="text-xs text-[#6b7280]">{submission.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPinIcon className="h-4 w-4 text-[#6b7280]" />
                                                    <span className="text-sm text-[#1f2937]">{submission.city}, {submission.state}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg ${statusConfig.bg} ${statusConfig.text} ${statusConfig.glow}`}>
                                                    <StatusIcon className="h-3.5 w-3.5" />
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <CalendarIcon className="h-4 w-4 text-[#6b7280]" />
                                                    <span className="text-sm text-[#6b7280]">
                                                        {new Date(submission.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {submission.created_vendor ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium">
                                                        <CheckIcon className="h-3 w-3" />
                                                        #{submission.created_vendor}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-[#9ca3af]">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="bg-gradient-to-r from-[#f9fafb] to-[#f3f4f6] px-6 py-4 border-t border-slate-100">
                    <p className="text-sm text-[#6b7280]">
                        Showing <span className="font-semibold text-[#1f2937]">{filteredSubmissions.length}</span> submission{filteredSubmissions.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedSubmission && !showRejectModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-5 flex justify-between items-center rounded-t-2xl">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Submission Details</h2>
                                <p className="text-sm text-slate-500 mt-1">ID: #{selectedSubmission.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="text-slate-600 hover:text-slate-900 transition-colors p-2 hover:bg-white/10 rounded-lg"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                {(() => {
                                    const statusConfig = getStatusBadge(selectedSubmission.status);
                                    const StatusIcon = statusConfig.icon;
                                    return (
                                        <span className={`inline-flex items-center gap-2 px-5 py-2.5 text-base font-bold rounded-xl ${statusConfig.bg} ${statusConfig.text} ${statusConfig.glow}`}>
                                            <StatusIcon className="h-5 w-5" />
                                            {statusConfig.label}
                                        </span>
                                    );
                                })()}
                            </div>

                            {/* Business Information */}
                            <div>
                                <h3 className="text-lg font-bold text-[#1f2937] mb-4 flex items-center gap-2">
                                    <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                                    Business Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-slate-100">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">Business Name</label>
                                        <p className="text-sm font-semibold text-[#1f2937]">{selectedSubmission.business_name}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-slate-100">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">Contact Name</label>
                                        <p className="text-sm font-semibold text-[#1f2937]">{selectedSubmission.contact_name}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-slate-100">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">Email</label>
                                        <a href={`mailto:${selectedSubmission.email}`} className="text-sm font-semibold text-blue-600 hover:underline">
                                            {selectedSubmission.email}
                                        </a>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-slate-100">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">Phone</label>
                                        <a href={`tel:${selectedSubmission.phone}`} className="text-sm font-semibold text-blue-600 hover:underline">
                                            {selectedSubmission.phone}
                                        </a>
                                    </div>
                                    {selectedSubmission.website && (
                                        <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-slate-100 col-span-2">
                                            <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">Website</label>
                                            <a href={selectedSubmission.website} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline">
                                                {selectedSubmission.website}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <h3 className="text-lg font-bold text-[#1f2937] mb-4 flex items-center gap-2">
                                    <MapPinIcon className="h-5 w-5 text-[#10b981]" />
                                    Location
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-slate-100 col-span-2">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">Address</label>
                                        <p className="text-sm font-semibold text-[#1f2937]">{selectedSubmission.address}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-slate-100">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">City</label>
                                        <p className="text-sm font-semibold text-[#1f2937]">{selectedSubmission.city}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-slate-100">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">State</label>
                                        <p className="text-sm font-semibold text-[#1f2937]">{selectedSubmission.state}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-slate-100">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">ZIP Code</label>
                                        <p className="text-sm font-semibold text-[#1f2937]">{selectedSubmission.zip_code}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Services & Description */}
                            <div>
                                <h3 className="text-lg font-bold text-[#1f2937] mb-4">Services & Description</h3>
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-slate-100">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Services</label>
                                        <p className="text-sm text-[#1f2937] whitespace-pre-wrap">{selectedSubmission.services}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-slate-100">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Brands</label>
                                        <p className="text-sm text-[#1f2937] whitespace-pre-wrap">{selectedSubmission.brands}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-slate-100">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Description</label>
                                        <p className="text-sm text-[#1f2937] whitespace-pre-wrap">{selectedSubmission.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div>
                                <h3 className="text-lg font-bold text-[#1f2937] mb-4 flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5 text-[#f59e0b]" />
                                    Timeline
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl p-4 border border-blue-100">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                        <span className="text-[#6b7280] font-medium">Submitted:</span>
                                        <span className="text-[#1f2937] font-semibold">
                                            {new Date(selectedSubmission.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    {selectedSubmission.reviewed_at && (
                                        <div className="flex items-center gap-3 text-sm bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                                            <div className="w-2 h-2 bg-[#10b981] rounded-full"></div>
                                            <span className="text-[#6b7280] font-medium">Reviewed:</span>
                                            <span className="text-[#1f2937] font-semibold">
                                                {new Date(selectedSubmission.reviewed_at).toLocaleString()}
                                            </span>
                                            {selectedSubmission.reviewed_by && (
                                                <span className="text-[#6b7280]">by {selectedSubmission.reviewed_by}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Admin Actions */}
                            {selectedSubmission.status === 'pending' && (
                                <div className="flex gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => handleApprove(selectedSubmission.id)}
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <CheckIcon className="w-4 h-4" />
                                        {actionLoading ? 'Processing...' : 'Approve & Create Vendor'}
                                    </button>
                                    <button
                                        onClick={() => setShowRejectModal(true)}
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 text-sm font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                        Reject Submission
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedSubmission && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
                        <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-rose-500 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-slate-900">Reject Submission</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-[#6b7280]">
                                Are you sure you want to reject this submission from <strong className="text-[#1f2937]">{selectedSubmission.business_name}</strong>?
                            </p>
                            <div>
                                <label className="block text-sm font-bold text-[#374151] mb-2 uppercase tracking-wide">
                                    Rejection Notes (Optional)
                                </label>
                                <textarea
                                    value={rejectNotes}
                                    onChange={(e) => setRejectNotes(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#ef4444] focus:border-transparent resize-none"
                                    rows="4"
                                    placeholder="Provide a reason for rejection..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectNotes('');
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-[#f9fafb] text-[#6b7280] rounded-xl hover:bg-[#e5e7eb] font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleReject(selectedSubmission.id)}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-slate-900 rounded-xl hover:from-red-600 hover:to-rose-600 font-bold shadow-sm shadow-red-200 transition-all disabled:opacity-50"
                                >
                                    {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
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
