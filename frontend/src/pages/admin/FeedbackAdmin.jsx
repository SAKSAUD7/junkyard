import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    CheckCircleIcon,
    EnvelopeIcon,
    EnvelopeOpenIcon,
    TrashIcon,
    XMarkIcon,
    EyeIcon,
    ArrowPathIcon,
    FunnelIcon,
} from '@heroicons/react/24/outline';
import AdminTable, { ActionBtn, StatusBadge, ConfirmDialog } from '../../components/AdminTable';

const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000');

const TOPIC_LABELS = {
    find_business: "Can't find a business",
    bug: 'Report a bug',
    suggestion: 'Feature suggestion',
    general: 'General feedback',
};

function formatDate(str) {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function FeedbackAdmin() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewItem, setViewItem] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(25);

    const fetchFeedbacks = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('access_token');
            const params = new URLSearchParams({ page, page_size: pageSize });
            if (filterStatus) params.append('status', filterStatus);
            const res = await axios.get(`${API}/api/common/feedback/?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFeedbacks(res.data?.results || res.data || []);
            setTotal(res.data?.count ?? (res.data?.results?.length ?? res.data?.length ?? 0));
        } catch (err) {
            setError('Failed to load feedback.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFeedbacks(); }, [page, pageSize, filterStatus]);

    const handleView = (item) => {
        setViewItem(item);
        if (item.status === 'unread') updateStatus(item.id, 'read');
    };

    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('access_token');
            await axios.patch(`${API}/api/common/feedback/${id}/`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFeedbacks();
        } catch (err) { console.error('Update failed', err); }
    };

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem('access_token');
            await axios.delete(`${API}/api/common/feedback/${deleteTarget}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeleteTarget(null);
            fetchFeedbacks();
        } catch (err) { console.error('Delete failed', err); }
    };

    const COLUMNS = [
        {
            key: 'topic', label: 'Topic',
            render: (row) => <span className="font-semibold text-slate-800 text-sm">{TOPIC_LABELS[row.topic] || row.topic}</span>
        },
        {
            key: 'description', label: 'Message',
            render: (row) => (
                <span className="text-sm text-slate-600 line-clamp-2 max-w-xs font-medium">{row.description}</span>
            )
        },
        {
            key: 'status', label: 'Status',
            render: (row) => <StatusBadge status={row.status} />
        },
        {
            key: 'created_at', label: 'Date',
            render: (row) => <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{formatDate(row.created_at)}</span>
        },
    ];

    const unreadCount = feedbacks.filter(f => f.status === 'unread').length;

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        User Feedback
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5 font-medium">
                        {unreadCount > 0 ? `${unreadCount} unread submission${unreadCount > 1 ? 's' : ''}` : 'All feedback reviewed'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                        {['', 'unread', 'read', 'resolved'].map(s => (
                            <button
                                key={s}
                                onClick={() => { setFilterStatus(s); setPage(1); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
                            </button>
                        ))}
                    </div>
                    <button onClick={fetchFeedbacks} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                        <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <AdminTable
                columns={COLUMNS}
                data={feedbacks}
                loading={loading}
                error={error}
                onRetry={fetchFeedbacks}
                emptyIcon="💬"
                emptyTitle="No feedback submissions"
                emptyDesc="When users submit feedback, it will appear here."
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                currentPage={page}
                totalCount={total}
                onPageChange={setPage}
                renderActions={(row) => (
                    <>
                        <ActionBtn color="blue" title="View Details" onClick={() => handleView(row)}>
                            <EyeIcon className="w-4 h-4" />
                        </ActionBtn>
                        {row.status === 'unread' && (
                            <ActionBtn color="green" title="Mark as Read" onClick={() => updateStatus(row.id, 'read')}>
                                <EnvelopeOpenIcon className="w-4 h-4" />
                            </ActionBtn>
                        )}
                        {row.status !== 'resolved' && (
                            <ActionBtn color="amber" title="Mark Resolved" onClick={() => updateStatus(row.id, 'resolved')}>
                                <CheckCircleIcon className="w-4 h-4" />
                            </ActionBtn>
                        )}
                        <ActionBtn color="red" title="Delete" onClick={() => setDeleteTarget(row.id)}>
                            <TrashIcon className="w-4 h-4" />
                        </ActionBtn>
                    </>
                )}
            />

            {/* View Modal */}
            {viewItem && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setViewItem(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-slate-900 text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Feedback #{viewItem.id}
                            </h3>
                            <button onClick={() => setViewItem(null)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-500 w-20">Topic</span>
                                <span className="text-sm font-semibold text-slate-800">{TOPIC_LABELS[viewItem.topic] || viewItem.topic}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-500 w-20">Status</span>
                                <StatusBadge status={viewItem.status} />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-500 w-20">Date</span>
                                <span className="text-sm text-slate-600">{formatDate(viewItem.created_at)}</span>
                            </div>
                            <div className="mt-3">
                                <p className="text-xs font-bold text-slate-500 mb-1.5">Message</p>
                                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 font-medium leading-relaxed border border-slate-100">
                                    {viewItem.description}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-5">
                            {viewItem.status !== 'resolved' && (
                                <button onClick={() => { updateStatus(viewItem.id, 'resolved'); setViewItem(null); }}
                                    className="flex-1 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors">
                                    Mark Resolved
                                </button>
                            )}
                            <button onClick={() => { setDeleteTarget(viewItem.id); setViewItem(null); }}
                                className="px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete Feedback"
                message="This will permanently delete this feedback submission. This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
                confirmLabel="Delete Feedback"
            />
        </div>
    );
}
