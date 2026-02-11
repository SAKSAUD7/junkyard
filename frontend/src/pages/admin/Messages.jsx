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
    XCircleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import Toast from '../../components/Toast';

export default function AdminMessages() {
    const { token, isAdmin, user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [filter, setFilter] = useState('all'); // all, read, unread
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
            console.error('Failed to delete message:', error);
            showToast('Failed to delete message', 'error');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmId(null);
    };

    const handleBulkDeleteClick = () => {
        setShowBulkDeleteConfirm(true);
    };

    const handleBulkDeleteConfirm = async () => {
        setShowBulkDeleteConfirm(false);

        try {
            await Promise.all(selectedIds.map(id => api.deleteContactMessage(token, id)));
            setMessages(messages.filter(m => !selectedIds.includes(m.id)));
            setSelectedIds([]);
            showToast(`${selectedIds.length} message(s) deleted`, 'success');
        } catch (error) {
            console.error('Failed to delete messages:', error);
            showToast('Failed to delete some messages', 'error');
        }
    };

    const handleBulkDeleteCancel = () => {
        setShowBulkDeleteConfirm(false);
    };

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredMessages.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredMessages.map(m => m.id));
        }
    };

    const filteredMessages = messages.filter(msg => {
        const matchesFilter = filter === 'all' ||
            (filter === 'read' && msg.is_read) ||
            (filter === 'unread' && !msg.is_read);

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
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading messages...</p>
                </div>
            </div>
        );
    }

    if (!token || !isAdmin) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <EnvelopeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
                    <p className="text-gray-600">
                        {!token ? 'Please log in to view messages.' : 'Admin access required to view messages.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Enhanced Header with Gradient */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 text-white">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <EnvelopeIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Contact Messages</h1>
                                <p className="text-indigo-100 mt-1">
                                    Manage customer inquiries and feedback
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="flex gap-3">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[100px]">
                            <div className="text-2xl font-bold">{messages.length}</div>
                            <div className="text-xs text-indigo-100">Total</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[100px]">
                            <div className="text-2xl font-bold">{messages.filter(m => !m.is_read).length}</div>
                            <div className="text-xs text-indigo-100">Unread</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl shadow-md p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3.5 top-3" />
                        <input
                            type="text"
                            placeholder="Search by name, email, subject, or message..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative">
                        <FunnelIcon className="h-5 w-5 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-11 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white cursor-pointer min-w-[150px]"
                        >
                            <option value="all">All Messages</option>
                            <option value="unread">Unread Only</option>
                            <option value="read">Read Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500 text-white rounded-lg">
                            <CheckCircleIcon className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-semibold text-indigo-900">
                            {selectedIds.length} message{selectedIds.length > 1 ? 's' : ''} selected
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleBulkDeleteClick}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 text-sm font-medium flex items-center gap-2 shadow-lg shadow-red-200 transition-all"
                        >
                            <TrashIcon className="h-4 w-4" />
                            Delete Selected
                        </button>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-all"
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Delete Confirmation */}
            {showBulkDeleteConfirm && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-xl p-4 shadow-lg animate-fade-in">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 p-2 bg-red-500 rounded-lg">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-base font-bold text-red-900 mb-1">Confirm Bulk Delete</h3>
                            <p className="text-sm text-red-700 mb-4">
                                Are you sure you want to delete {selectedIds.length} message{selectedIds.length > 1 ? 's' : ''}? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleBulkDeleteConfirm}
                                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 font-semibold shadow-md transition-all flex items-center gap-2"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                    Yes, Delete {selectedIds.length} Message{selectedIds.length > 1 ? 's' : ''}
                                </button>
                                <button
                                    onClick={handleBulkDeleteCancel}
                                    className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages List */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {filteredMessages.length === 0 ? (
                    <div className="text-center py-16">
                        <EnvelopeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages found</h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'Try adjusting your search terms' : 'No messages to display'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-4 py-4 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === filteredMessages.length && filteredMessages.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        From
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Subject
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredMessages.map((message) => (
                                    <tr
                                        key={message.id}
                                        className={`transition-all hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 ${!message.is_read ? 'bg-blue-50/30' : ''
                                            }`}
                                    >
                                        {deleteConfirmId === message.id ? (
                                            <td colSpan="6" className="px-4 py-4">
                                                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-lg p-4 animate-fade-in">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-shrink-0 p-2 bg-red-500 rounded-lg">
                                                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-red-900">
                                                                    Are you sure you want to delete this message?
                                                                </p>
                                                                <p className="text-xs text-red-700 mt-0.5">
                                                                    This action cannot be undone.
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={handleDeleteConfirm}
                                                                className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 font-semibold text-sm shadow-md transition-all flex items-center gap-2"
                                                            >
                                                                <TrashIcon className="h-4 w-4" />
                                                                Delete
                                                            </button>
                                                            <button
                                                                onClick={handleDeleteCancel}
                                                                className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm transition-all"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        ) : (
                                            <>
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(message.id)}
                                                        onChange={() => toggleSelect(message.id)}
                                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    {message.is_read ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                            <EnvelopeOpenIcon className="h-3.5 w-3.5" />
                                                            Read
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md">
                                                            <EnvelopeIcon className="h-3.5 w-3.5" />
                                                            New
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold shadow-md">
                                                            {message.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className={`text-sm font-semibold ${!message.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                                {message.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">{message.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className={`text-sm ${!message.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                        {message.subject}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                        {message.message}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-600">
                                                    {new Date(message.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleViewMessage(message)}
                                                            className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md shadow-indigo-200"
                                                            title="View message"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(message.id)}
                                                            className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all shadow-md shadow-red-200"
                                                            title="Delete message"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Message Detail Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-5 text-white">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-bold shadow-lg">
                                        {selectedMessage.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{selectedMessage.name}</h3>
                                        <p className="text-indigo-100 text-sm">{selectedMessage.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-lg transition-all"
                                >
                                    <XCircleIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                            {/* Subject */}
                            <div className="mb-6">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</label>
                                <p className="text-lg font-semibold text-gray-900 mt-1">{selectedMessage.subject}</p>
                            </div>

                            {/* Message */}
                            <div className="mb-6">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</label>
                                <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {selectedMessage.message}
                                    </p>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Received</label>
                                    <p className="text-sm text-gray-900 mt-1">
                                        {new Date(selectedMessage.created_at).toLocaleString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
                                    <p className="text-sm text-gray-900 mt-1">
                                        {selectedMessage.is_read ? (
                                            <span className="inline-flex items-center gap-1.5 text-gray-700">
                                                <EnvelopeOpenIcon className="h-4 w-4" />
                                                Read
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-indigo-600 font-semibold">
                                                <EnvelopeIcon className="h-4 w-4" />
                                                Unread
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="px-4 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    handleDeleteClick(selectedMessage.id);
                                    setSelectedMessage(null);
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 font-medium shadow-lg shadow-red-200 transition-all flex items-center gap-2"
                            >
                                <TrashIcon className="h-4 w-4" />
                                Delete Message
                            </button>
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
