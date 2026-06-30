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
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import Toast from '../../components/Toast';

export default function AdminMessages() {
    const { token, isAdmin, user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [filter, setFilter] = useState('all'); 
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [toast, setToast] = useState(null);

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
        try {
            const data = await api.getContactMessages(token);
            const list = data.results || (Array.isArray(data) ? data : []);
            setMessages(list);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            if (error.message.includes('401')) {
                showToast('Authentication failed. Please log in again.', 'error');
            } else {
                showToast('Failed to load messages', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleViewMessage = async (message) => {
        setSelectedMessage(message);
        if (!message.is_read) {
            try {
                await api.markMessageAsRead(token, message.id);
                setMessages(messages.map(m =>
                    m.id === message.id ? { ...m, is_read: true } : m
                ));
            } catch (error) {
                console.error('Failed to mark as read:', error);
            }
        }
    };

    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

    const handleDeleteClick = (id) => {
        setDeleteConfirmId(id);
    };

    const handleDeleteConfirm = async () => {
        const id = deleteConfirmId;
        setDeleteConfirmId(null);
        try {
            await api.deleteContactMessage(token, id);
            setMessages(messages.filter(m => m.id !== id));
            showToast('Message deleted successfully', 'success');
        } catch (error) {
            showToast('Failed to delete message', 'error');
        }
    };

    const handleDeleteCancel = () => setDeleteConfirmId(null);
    const handleBulkDeleteClick = () => setShowBulkDeleteConfirm(true);
    const handleBulkDeleteCancel = () => setShowBulkDeleteConfirm(false);

    const handleBulkDeleteConfirm = async () => {
        setShowBulkDeleteConfirm(false);
        try {
            await Promise.all(selectedIds.map(id => api.deleteContactMessage(token, id)));
            setMessages(messages.filter(m => !selectedIds.includes(m.id)));
            setSelectedIds([]);
            showToast(`${selectedIds.length} message(s) deleted`, 'success');
        } catch (error) {
            showToast('Failed to delete some messages', 'error');
        }
    };

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    const toggleSelectAll = () => {
        if (selectedIds.length === filteredMessages.length) setSelectedIds([]);
        else setSelectedIds(filteredMessages.map(m => m.id));
    };

    const filteredMessages = messages.filter(msg => {
        const matchesFilter = filter === 'all' || (filter === 'read' && msg.is_read) || (filter === 'unread' && !msg.is_read);
        const matchesSearch = searchTerm === '' ||
            msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.message.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

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
        <div className="max-w-[1600px] mx-auto space-y-6">
            {/* ── Header ────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Messages</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage customer inquiries and feedback.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total</span>
                        <span className="text-lg font-bold text-slate-900">{messages.length}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Unread</span>
                        <span className="text-lg font-bold text-rose-500">{messages.filter(m => !m.is_read).length}</span>
                    </div>
                </div>
            </div>

            {/* ── Filters ───────────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                    </div>
                    <div className="relative w-40">
                        <select
                            className="w-full appearance-none pl-10 pr-8 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 text-sm text-slate-700 bg-white"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All Messages</option>
                            <option value="unread">Unread Only</option>
                            <option value="read">Read Only</option>
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
                        <span className="text-sm font-semibold text-blue-900">{selectedIds.length} messages selected</span>
                    </div>
                    <button
                        onClick={handleBulkDeleteClick}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-rose-600 rounded-md text-xs font-semibold hover:bg-rose-50 flex items-center gap-1 shadow-sm"
                    >
                        <TrashIcon className="h-3 w-3" /> Delete
                    </button>
                </div>
            )}

            {/* Bulk Delete Confirm */}
            {showBulkDeleteConfirm && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-sm">
                    <p className="text-sm font-bold text-rose-900 mb-2">Delete {selectedIds.length} messages?</p>
                    <p className="text-xs text-rose-700 mb-3">This action cannot be undone.</p>
                    <div className="flex gap-2">
                        <button onClick={handleBulkDeleteConfirm} className="px-3 py-1.5 bg-rose-600 text-white rounded-md text-xs font-semibold shadow-sm hover:bg-rose-700">Confirm Delete</button>
                        <button onClick={handleBulkDeleteCancel} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-semibold shadow-sm hover:bg-slate-50">Cancel</button>
                    </div>
                </div>
            )}

            {/* ── Table ─────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {filteredMessages.length === 0 ? (
                    <div className="text-center py-16">
                        <EnvelopeIcon className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500 text-sm">No messages found</p>
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
                                            checked={selectedIds.length === filteredMessages.length && filteredMessages.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sender</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subject</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredMessages.map((message) => {
                                    const isSelected = selectedIds.includes(message.id);
                                    return (
                                        <tr key={message.id} className={`hover:bg-slate-50/50 transition-colors ${!message.is_read ? 'bg-blue-50/10' : ''} ${isSelected ? 'bg-blue-50/30' : ''}`}>
                                            {deleteConfirmId === message.id ? (
                                                <td colSpan="6" className="px-4 py-3 bg-rose-50/50">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-semibold text-rose-700">Delete this message?</span>
                                                        <div className="flex gap-2">
                                                            <button onClick={handleDeleteConfirm} className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-semibold">Delete</button>
                                                            <button onClick={handleDeleteCancel} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded text-[10px] font-semibold">Cancel</button>
                                                        </div>
                                                    </div>
                                                </td>
                                            ) : (
                                                <>
                                                    <td className="px-4 py-3">
                                                        <input 
                                                            type="checkbox" 
                                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                            checked={isSelected}
                                                            onChange={() => toggleSelect(message.id)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {message.is_read ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500">
                                                                Read
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600">
                                                                New
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs flex-shrink-0">
                                                                {message.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm ${!message.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{message.name}</p>
                                                                <p className="text-[11px] text-slate-500">{message.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 max-w-xs">
                                                        <p className={`text-sm truncate ${!message.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{message.subject}</p>
                                                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{message.message}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-slate-500">
                                                        {new Date(message.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex gap-2 justify-end">
                                                            <button onClick={() => handleViewMessage(message)} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-semibold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 shadow-sm transition-all" title="View">
                                                                <EyeIcon className="h-3.5 w-3.5" />
                                                                View
                                                            </button>
                                                            <button onClick={() => handleDeleteClick(message.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-xs font-semibold hover:bg-rose-100 shadow-sm transition-all" title="Delete">
                                                                <TrashIcon className="h-3.5 w-3.5" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── View Modal ────────────────────────────────────────────────── */}
            {selectedMessage && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
                                    {selectedMessage.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>{selectedMessage.name}</h3>
                                    <p className="text-xs text-slate-500">{selectedMessage.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedMessage(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
                                <p className="text-base font-semibold text-slate-900">{selectedMessage.subject}</p>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Message</label>
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                        {selectedMessage.message}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6 pt-2">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Received</label>
                                    <p className="text-xs font-semibold text-slate-700">{new Date(selectedMessage.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                                    <p className="text-xs font-semibold text-slate-700">Read</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                            <button onClick={() => setSelectedMessage(null)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm">
                                Close
                            </button>
                            <button onClick={() => { handleDeleteClick(selectedMessage.id); setSelectedMessage(null); }} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 shadow-sm flex items-center gap-2">
                                <TrashIcon className="h-4 w-4" /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
