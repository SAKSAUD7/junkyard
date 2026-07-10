import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    CheckCircleIcon, 
    EnvelopeIcon, 
    EnvelopeOpenIcon,
    TrashIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function FeedbackAdmin() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewItem, setViewItem] = useState(null);

    const handleView = (item) => {
        setViewItem(item);
        if (item.status === 'unread') {
            updateStatus(item.id, 'read');
        }
    };

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/common/feedback/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Support both paginated and unpaginated responses
            setFeedbacks(res.data?.results || res.data || []);
        } catch (err) {
            console.error('Error fetching feedback:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('access_token');
            await axios.patch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/common/feedback/${id}/`, 
                { status },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            fetchFeedbacks();
        } catch (err) {
            console.error('Update failed', err);
        }
    };

    const deleteFeedback = async (id) => {
        if (!window.confirm('Delete this feedback?')) return;
        try {
            const token = localStorage.getItem('access_token');
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/common/feedback/${id}/`, 
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            fetchFeedbacks();
        } catch (err) {
            console.error('Delete failed', err);
        }
    };

    const getTopicStyle = (topic) => {
        switch(topic) {
            case 'bug': return 'bg-rose-100 text-rose-700';
            case 'find_business': return 'bg-amber-100 text-amber-700';
            case 'suggestion': return 'bg-emerald-100 text-emerald-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    const getTopicLabel = (topic) => {
        switch(topic) {
            case 'bug': return 'Bug Report';
            case 'find_business': return 'Missing Business';
            case 'suggestion': return 'Suggestion';
            default: return 'General';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>User Feedback</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage feedback, bug reports, and suggestions from site users.</p>
                </div>
                <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold border border-blue-100">
                    {feedbacks.length} Total items
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-widest text-[#6b7280] font-bold">
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Topic</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex justify-center mb-2"><div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" /></div>
                                        Loading feedback...
                                    </td>
                                </tr>
                            ) : feedbacks.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        No feedback items found.
                                    </td>
                                </tr>
                            ) : (
                                feedbacks.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-800 font-medium whitespace-pre-wrap">{item.description}</p>
                                            <p className="text-[11px] text-slate-400 mt-1">{new Date(item.created_at).toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getTopicStyle(item.topic)}`}>
                                                {getTopicLabel(item.topic)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 ${
                                                item.status === 'unread' ? 'bg-amber-100 text-amber-700' :
                                                item.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                                {item.status === 'unread' && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />}
                                                {item.status === 'resolved' && <CheckCircleIcon className="w-3.5 h-3.5" />}
                                                {item.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2.5">
                                                <button 
                                                    onClick={() => handleView(item)} 
                                                    className="w-9 h-9 flex items-center justify-center text-blue-600 bg-blue-50/80 rounded-xl hover:bg-blue-100 transition-colors group" 
                                                    title="View Details"
                                                >
                                                    <EnvelopeOpenIcon className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
                                                </button>
                                                <button 
                                                    onClick={() => updateStatus(item.id, 'resolved')} 
                                                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all group ${item.status === 'resolved' ? 'text-emerald-300 bg-emerald-50/30 cursor-not-allowed' : 'text-emerald-600 bg-emerald-50/80 hover:bg-emerald-100'}`}
                                                    disabled={item.status === 'resolved'}
                                                    title="Mark Resolved"
                                                >
                                                    <CheckCircleIcon className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
                                                </button>
                                                <button 
                                                    onClick={() => deleteFeedback(item.id)} 
                                                    className="w-9 h-9 flex items-center justify-center text-rose-500 bg-rose-50/80 rounded-xl hover:bg-rose-100 transition-colors group" 
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Feedback Modal */}
            {viewItem && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
                        <div className="px-6 py-5 bg-white border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>View Feedback</h3>
                            <button onClick={() => setViewItem(null)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 mb-0.5 rounded-full transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-5">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Topic</label>
                                <div className="text-[13px] font-bold text-slate-900">{getTopicLabel(viewItem.topic)}</div>
                            </div>
                            <div className="mb-5">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Submitted</label>
                                <div className="text-[13px] font-semibold text-slate-600">{new Date(viewItem.created_at).toLocaleString()}</div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                                <div className="p-5 bg-slate-50/80 border border-slate-100/50 rounded-2xl text-[14px] text-slate-700 whitespace-pre-wrap font-medium leading-relaxed">
                                    {viewItem.description}
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl">
                            {viewItem.status !== 'resolved' && (
                                <button 
                                    onClick={() => { updateStatus(viewItem.id, 'resolved'); setViewItem({...viewItem, status: 'resolved'}); }}
                                    className="px-5 py-2.5 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-xl hover:bg-emerald-100 transition-colors shadow-sm shadow-emerald-600/10"
                                >
                                    Mark Resolved
                                </button>
                            )}
                            <button onClick={() => setViewItem(null)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
