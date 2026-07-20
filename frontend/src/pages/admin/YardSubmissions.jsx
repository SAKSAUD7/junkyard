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
    
    // Direct Email state
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');

    const getMediaUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000')}${url.startsWith('/') ? '' : '/'}${url}`;
    };

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
                `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000')}/api/yard-submissions/`,
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
                `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000')}/api/yard-submissions/${submissionId}/approve/`,
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
                `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000')}/api/yard-submissions/${submissionId}/reject/`,
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

    const handleSendEmail = async () => {
        try {
            setActionLoading(true);
            const token = localStorage.getItem('access_token');
            await axios.post(
                `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000')}/api/yard-submissions/${selectedSubmission.id}/send_email/`,
                { subject: emailSubject, body: emailBody },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            setToast({ message: 'Email sent successfully!', type: 'success' });
            setShowEmailModal(false);
            setEmailSubject('');
            setEmailBody('');
        } catch (err) {
            console.error('Error sending email:', err);
            setToast({ message: 'Failed to send email', type: 'error' });
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
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Created</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Vendor</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Actions</th>
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
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 font-bold shadow-sm overflow-hidden shrink-0">
                                                        {submission.logo ? (
                                                            <img src={getMediaUrl(submission.logo)} alt={submission.business_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            submission.business_name.charAt(0).toUpperCase()
                                                        )}
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
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                                                    submission.subscription_plan === 'featured' ? 'bg-amber-100 text-amber-700' :
                                                    submission.subscription_plan === 'free' ? 'bg-slate-100 text-slate-600' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {submission.subscription_plan || 'free'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                                                    submission.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    submission.payment_status === 'none' ? 'bg-slate-100 text-slate-600' :
                                                    submission.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {submission.payment_status || 'none'}
                                                </span>
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
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedSubmission(submission); }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    View
                                                </button>
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

                        {/* ── Redesigned Modal Header ── */}
                        <div className="sticky top-0 z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-t-2xl px-6 py-6">
                            <div className="flex items-start justify-between gap-4">
                                {/* Left – business identity */}
                                <div className="flex items-center gap-4 min-w-0">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-slate-900 text-2xl font-black shadow-lg overflow-hidden border border-white/20">
                                        {selectedSubmission.logo ? (
                                            <img src={getMediaUrl(selectedSubmission.logo)} alt={selectedSubmission.business_name} className="w-full h-full object-cover" />
                                        ) : (
                                            selectedSubmission.business_name?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-xl font-black text-white truncate">{selectedSubmission.business_name}</h2>
                                        <p className="text-slate-400 text-sm mt-0.5">
                                            ID #{selectedSubmission.id} &nbsp;·&nbsp; {selectedSubmission.city}, {selectedSubmission.state}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            {/* Status badge */}
                                            {(() => {
                                                const sc = getStatusBadge(selectedSubmission.status);
                                                const SI = sc.icon;
                                                return (
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full ${sc.bg} ${sc.text}`}>
                                                        <SI className="h-3 w-3" /> {sc.label}
                                                    </span>
                                                );
                                            })()}
                                            {/* Plan badge */}
                                            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full capitalize ${
                                                selectedSubmission.subscription_plan === 'featured' ? 'bg-amber-100 text-amber-700' :
                                                selectedSubmission.subscription_plan === 'free' ? 'bg-slate-100 text-slate-600' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {selectedSubmission.subscription_plan || 'free'} plan
                                            </span>
                                            {/* Payment badge */}
                                            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full capitalize ${
                                                selectedSubmission.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                                selectedSubmission.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {selectedSubmission.payment_status || 'pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right – action buttons + close */}
                                <div className="flex-shrink-0 flex items-center gap-2">
                                    {selectedSubmission.created_vendor && (
                                        <a
                                            href={`/vendors/${selectedSubmission.created_vendor}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors border border-white/20"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            View Listing
                                        </a>
                                    )}
                                    {selectedSubmission.status === 'pending' && (
                                        <button
                                            onClick={() => handleApprove(selectedSubmission.id)}
                                            disabled={actionLoading}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            <CheckIcon className="w-3.5 h-3.5" />
                                            {actionLoading ? '...' : 'Approve'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedSubmission(null)}
                                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors border border-white/20"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
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
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-slate-700">{selectedSubmission.email}</span>
                                            <button 
                                                onClick={() => {
                                                    setEmailSubject(`Regarding your submission: ${selectedSubmission.business_name}`);
                                                    setShowEmailModal(true);
                                                }}
                                                className="px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-[11px] font-bold transition-colors"
                                            >
                                                Send direct email
                                            </button>
                                        </div>
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
                                <h3 className="text-lg font-bold text-[#1f2937] mb-4">Services, Inventory & Description</h3>
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-slate-100">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Services / Parts</label>
                                        <p className="text-sm text-[#1f2937] whitespace-pre-wrap">{selectedSubmission.services}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-slate-100">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Brands Supported</label>
                                        <p className="text-sm text-[#1f2937] whitespace-pre-wrap">{selectedSubmission.brands || 'None specified'}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-slate-100">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Inventory / Part Categories</label>
                                        <p className="text-sm text-[#1f2937] whitespace-pre-wrap">{selectedSubmission.parts_categories || 'None specified'}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-slate-100">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Description</label>
                                        <p className="text-sm text-[#1f2937] whitespace-pre-wrap">{selectedSubmission.description || 'No description provided.'}</p>
                                    </div>
                                    {selectedSubmission.images && selectedSubmission.images.length > 0 && (
                                        <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-slate-100">
                                            <label className="block text-xs font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Yard Photos</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {selectedSubmission.images.map((img, idx) => {
                                                    const mediaUrl = getMediaUrl(img.url || img);
                                                    return (
                                                        <a key={idx} href={mediaUrl} target="_blank" rel="noopener noreferrer">
                                                            <img src={mediaUrl} alt={`Yard Photo ${idx+1}`} className="w-full h-24 object-cover rounded-lg border shadow-sm hover:scale-105 transition-transform" />
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Subscription Info */}
                            <div>
                                <h3 className="text-lg font-bold text-[#1f2937] mb-4 flex items-center gap-2">
                                    <SparklesIcon className="h-5 w-5 text-indigo-600" />
                                    Plan & Payment
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-slate-100 flex flex-col items-center">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Subscription Plan</label>
                                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize ${
                                            selectedSubmission.subscription_plan === 'free' ? 'bg-slate-100 text-slate-700' :
                                            selectedSubmission.subscription_plan === 'featured' ? 'bg-amber-100 text-amber-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {selectedSubmission.subscription_plan || 'free'}
                                        </span>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-slate-100 flex flex-col items-center">
                                        <label className="block text-xs font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Payment Status</label>
                                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize ${
                                            selectedSubmission.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                            selectedSubmission.payment_status === 'none' ? 'bg-slate-100 text-slate-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                            {selectedSubmission.payment_status || 'none'}
                                        </span>
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

            {/* Direct Email Modal */}
            {showEmailModal && selectedSubmission && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
                        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-white">Send Email to {selectedSubmission.business_name}</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-[#6b7280] text-sm">
                                This email will be sent securely via our system directly to <strong>{selectedSubmission.email}</strong>.
                            </p>
                            <div>
                                <label className="block text-sm font-bold text-[#374151] mb-2 uppercase tracking-wide">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#374151] mb-2 uppercase tracking-wide">
                                    Message Body
                                </label>
                                <textarea
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm font-medium text-slate-700"
                                    rows="6"
                                    placeholder="Type your message here..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowEmailModal(false);
                                        setEmailSubject('');
                                        setEmailBody('');
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-[#f9fafb] text-[#6b7280] rounded-xl hover:bg-[#e5e7eb] font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendEmail}
                                    disabled={actionLoading || !emailSubject || !emailBody}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-bold shadow-sm shadow-blue-200 transition-all disabled:opacity-50"
                                >
                                    {actionLoading ? 'Sending...' : 'Send Message'}
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
