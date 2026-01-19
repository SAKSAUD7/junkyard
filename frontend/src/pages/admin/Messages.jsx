import { useState, useEffect, useContext } from 'react';
import { api } from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import {
    EnvelopeIcon,
    EnvelopeOpenIcon,
    TrashIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import Toast from '../../components/Toast';

export default function AdminMessages() {
    const { token } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [filter, setFilter] = useState('all'); // all, read, unread
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, [token]);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const data = await api.getContactMessages(token);
            const list = data.results || (Array.isArray(data) ? data : []);
            setMessages(list);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            showToast('Failed to load messages', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.markMessageAsRead(token, id);
            setMessages(messages.map(msg =>
                msg.id === id ? { ...msg, is_read: true } : msg
            ));
            showToast('Message marked as read');
        } catch (error) {
            showToast('Failed to mark message as read', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;

        try {
            await api.deleteMessage(token, id);
            setMessages(messages.filter(msg => msg.id !== id));
            showToast('Message deleted successfully');
        } catch (error) {
            showToast('Failed to delete message', 'error');
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedIds.length} selected messages?`)) return;

        try {
            await api.bulkDeleteMessages(token, selectedIds);
            setMessages(messages.filter(msg => !selectedIds.includes(msg.id)));
            setSelectedIds([]);
            showToast(`${selectedIds.length} messages deleted`);
        } catch (error) {
            showToast('Failed to delete messages', 'error');
        }
    };

    const toggleSelection = (id) => {
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {messages.length} total messages
                    </p>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                    {/* Filter Dropdown */}
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Messages</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                    </select>

                    {/* Search */}
                    <div className="relative flex-1 sm:flex-none">
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">
                        {selectedIds.length} message{selectedIds.length > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={handleBulkDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center gap-2"
                        >
                            <TrashIcon className="h-4 w-4" />
                            Delete Selected
                        </button>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Messages Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === filteredMessages.length && filteredMessages.length > 0}
                                        onChange={toggleSelectAll}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    From
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subject
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Preview
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMessages.map((msg) => (
                                <tr
                                    key={msg.id}
                                    className={`hover:bg-gray-50 ${msg.is_read ? 'opacity-60' : 'font-medium'}`}
                                >
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(msg.id)}
                                            onChange={() => toggleSelection(msg.id)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {msg.is_read ? (
                                            <EnvelopeOpenIcon className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(msg.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{msg.name}</div>
                                        <div className="text-xs text-gray-500">{msg.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {msg.subject}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                                        {msg.message}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                        <button
                                            onClick={() => setSelectedMessage(msg)}
                                            className="text-blue-600 hover:text-blue-900 font-medium"
                                            title="View Details"
                                        >
                                            <EyeIcon className="h-5 w-5 inline" />
                                        </button>
                                        {!msg.is_read && (
                                            <button
                                                onClick={() => handleMarkAsRead(msg.id)}
                                                className="text-green-600 hover:text-green-900 font-medium"
                                                title="Mark as Read"
                                            >
                                                <EnvelopeOpenIcon className="h-5 w-5 inline" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(msg.id)}
                                            className="text-red-600 hover:text-red-900 font-medium"
                                            title="Delete"
                                        >
                                            <TrashIcon className="h-5 w-5 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredMessages.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                                        No messages found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Message Details Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Message Details</h2>
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">From</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedMessage.name}</p>
                                <p className="text-sm text-gray-500">{selectedMessage.email}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Subject</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedMessage.subject}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {new Date(selectedMessage.created_at).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Message</label>
                                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                                    {selectedMessage.message}
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <a
                                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                >
                                    Reply via Email
                                </a>
                                {!selectedMessage.is_read && (
                                    <button
                                        onClick={() => {
                                            handleMarkAsRead(selectedMessage.id);
                                            setSelectedMessage(null);
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                    >
                                        Mark as Read
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        handleDelete(selectedMessage.id);
                                        setSelectedMessage(null);
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                                >
                                    Delete
                                </button>
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
