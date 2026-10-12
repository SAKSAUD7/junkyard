import { useState, useEffect, useContext } from 'react';
import { api } from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import {
    EnvelopeIcon,
    EnvelopeOpenIcon,
    TrashIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    XMarkIcon,
    CheckCircleIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Toast from '../../components/Toast';
import AdminTable, { ActionBtn, StatusBadge, ConfirmDialog } from '../../components/AdminTable';

export default function AdminMessages() {
    const { token, isAdmin } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [filter, setFilter] = useState('all'); 
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [toast, setToast] = useState(null);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [showBulkConfirm, setShowBulkConfirm] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    useEffect(() => {
        if (token && isAdmin) {
            fetchMessages();
        } else {
            setLoading(false);
        }
    }, [token, isAdmin]);

    const fetchMessages = async () => {
        if (!token) {
            setLoading(false);
            showToast('Please log in to view messages', 'error');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await api.getContactMessages(token);
            const list = data.results || (Array.isArray(data) ? data : []);
            setMessages(list);
        } catch (err) {
            console.error('Failed to fetch messages:', err);
            setError('Failed to load messages. Please try again.');
            showToast('Failed to load messages', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewMessage = async (message) => {
        setSelectedMessage(message);
        if (!message.is_read) {
            try {
                await api.markMessageAsRead(token, message.id);
                setMessages(prev => prev.map(m =>
                    m.id === message.id ? { ...m, is_read: true } : m
                ));
            } catch (err) {
                console.error('Failed to mark as read:', err);
            }
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTargetId) return;
        const id = deleteTargetId;
        setDeleteTargetId(null);
        try {
            await api.deleteContactMessage(token, id);
            setMessages(prev => prev.filter(m => m.id !== id));
            setSelectedIds(prev => prev.filter(i => i !== id));
            showToast('Message deleted successfully', 'success');
        } catch (err) {
            showToast('Failed to delete message', 'error');
        }
    };

    const handleBulkDeleteConfirm = async () => {
        setShowBulkConfirm(false);
        try {
            await Promise.all(selectedIds.map(id => api.deleteContactMessage(token, id)));
            setMessages(prev => prev.filter(m => !selectedIds.includes(m.id)));
            setSelectedIds([]);
            showToast(`${selectedIds.length} message(s) deleted`, 'success');
        } catch (err) {
            showToast('Failed to delete some messages', 'error');
        }
    };

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const filteredMessages = messages.filter(msg => {
        const matchesFilter = filter === 'all' || (filter === 'read' && msg.is_read) || (filter === 'unread' && !msg.is_read);
        const term = searchTerm.toLowerCase();
        const matchesSearch = searchTerm === '' ||
            (msg.name && msg.name.toLowerCase().includes(term)) ||
            (msg.email && msg.email.toLowerCase().includes(term)) ||
            (msg.subject && msg.subject.toLowerCase().includes(term)) ||
            (msg.message && msg.message.toLowerCase().includes(term));
        return matchesFilter && matchesSearch;
    });

    const paginatedMessages = filteredMessages.slice((page - 1) * pageSize, page * pageSize);

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedMessages.length && paginatedMessages.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedMessages.map(m => m.id));
        }
    };

    const columns = [
        {
            key: 'select',
            label: (
                <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={paginatedMessages.length > 0 && selectedIds.length === paginatedMessages.length}
                    onChange={toggleSelectAll}
                />
            ),
            className: 'w-10',
            render: (row) => (
                <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => toggleSelect(row.id)}
                />
            )
        },
        {
            key: 'is_read',
            label: 'Status',
            render: (row) => (
                <StatusBadge status={row.is_read ? 'read' : 'unread'} />
            )
        },
        {
            key: 'name',
            label: 'Sender',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs flex-shrink-0">
                        {(row.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className={`text-sm ${!row.is_read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                            {row.name || 'Anonymous'}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">{row.email || '—'}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'subject',
            label: 'Subject & Excerpt',
            render: (row) => (
                <div className="max-w-xs md:max-w-md">
                    <p className={`text-sm truncate ${!row.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {row.subject || '(No Subject)'}
                    </p>
                    <p className="text-[12px] text-slate-500 truncate mt-0.5">
                        {row.message}
                    </p>
                </div>
            )
        },
        {
            key: 'created_at',
            label: 'Date',
            render: (row) => (
                <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                    {row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </span>
            )
        }
    ];

    if (!token || !isAdmin) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <EnvelopeIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
                    <p className="text-sm text-slate-500 mt-1">Admin access required to view messages.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-6">
            {/* ── Header ────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Messages
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5 font-medium">Manage customer inquiries and contact submissions.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total</span>
                            <span className="text-base font-black text-slate-900">{messages.length}</span>
                        </div>
                        <div className="w-px h-5 bg-slate-200"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Unread</span>
                            <span className="text-base font-black text-rose-600">{messages.filter(m => !m.is_read).length}</span>
                        </div>
                    </div>
                    <button
                        onClick={fetchMessages}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-colors"
                        title="Refresh"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* ── Filter & Search Toolbar ────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search by sender, email, subject, message..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                        <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                className="appearance-none pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:border-blue-400 shadow-sm cursor-pointer"
                                value={filter}
                                onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                            >
                                <option value="all">All Messages</option>
                                <option value="unread">Unread Only</option>
                                <option value="read">Read Only</option>
                            </select>
                            <FunnelIcon className="h-4 w-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bulk Actions Bar ────────────────────────────────────────── */}
            {selectedIds.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-bold text-blue-900">{selectedIds.length} message(s) selected</span>
                    </div>
                    <button
                        onClick={() => setShowBulkConfirm(true)}
                        className="px-3.5 py-1.5 bg-white border border-rose-200 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-50 flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                        <TrashIcon className="h-4 w-4" /> Delete Selected
                    </button>
                </div>
            )}

            {/* ── AdminTable Component ─────────────────────────────────────── */}
            <AdminTable
                columns={columns}
                data={paginatedMessages}
                loading={loading}
                error={error}
                onRetry={fetchMessages}
                emptyIcon="✉️"
                emptyTitle="No messages found"
                emptyDesc={searchTerm || filter !== 'all' ? 'Try clearing your filters or search keywords.' : 'No contact messages have been submitted yet.'}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                currentPage={page}
                totalCount={filteredMessages.length}
                onPageChange={setPage}
                renderActions={(row) => (
                    <>
                        <ActionBtn color="blue" title="View Message" onClick={() => handleViewMessage(row)}>
                            <EyeIcon className="w-4 h-4" />
                        </ActionBtn>
                        <ActionBtn color="red" title="Delete Message" onClick={() => setDeleteTargetId(row.id)}>
                            <TrashIcon className="w-4 h-4" />
                        </ActionBtn>
                    </>
                )}
            />

            {/* ── View Modal ────────────────────────────────────────────────── */}
            {selectedMessage && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[400]">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                                    {(selectedMessage.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        {selectedMessage.name || 'Anonymous Sender'}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-mono">{selectedMessage.email || 'No email'}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedMessage(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-5">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
                                <p className="text-base font-bold text-slate-900">{selectedMessage.subject || '(No Subject)'}</p>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Message Body</label>
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                                        {selectedMessage.message}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6 pt-2">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date Received</label>
                                    <p className="text-xs font-semibold text-slate-700">
                                        {selectedMessage.created_at ? new Date(selectedMessage.created_at).toLocaleString() : '—'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Status</label>
                                    <StatusBadge status="read" />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex justify-end gap-3">
                            <button onClick={() => setSelectedMessage(null)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 shadow-sm transition-colors">
                                Close
                            </button>
                            <button 
                                onClick={() => {
                                    setDeleteTargetId(selectedMessage.id);
                                    setSelectedMessage(null);
                                }} 
                                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 shadow-sm flex items-center gap-2 transition-colors"
                            >
                                <TrashIcon className="h-4 w-4" /> Delete Message
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Single Delete Confirm Dialog ─────────────────────────────── */}
            <ConfirmDialog
                open={!!deleteTargetId}
                title="Delete Message"
                message="Are you sure you want to delete this message? This action cannot be undone."
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteTargetId(null)}
                confirmLabel="Delete Message"
            />

            {/* ── Bulk Delete Confirm Dialog ──────────────────────────────── */}
            <ConfirmDialog
                open={showBulkConfirm}
                title="Delete Selected Messages"
                message={`Are you sure you want to permanently delete ${selectedIds.length} selected message(s)? This action cannot be undone.`}
                onConfirm={handleBulkDeleteConfirm}
                onCancel={() => setShowBulkConfirm(false)}
                confirmLabel={`Delete ${selectedIds.length} Messages`}
            />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
