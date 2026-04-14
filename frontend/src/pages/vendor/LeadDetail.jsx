import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { vendorLeads } from '../../services/vendorApi';

const VendorLeadDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadLead();
    }, [id]);

    const loadLead = async () => {
        try {
            const response = await vendorLeads.get(id);
            setLead(response.data);
        } catch (err) {
            setError('Failed to load lead details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setUpdating(true);
        setError('');
        setSuccess('');

        try {
            await vendorLeads.updateStatus(id, newStatus);
            setSuccess('Status updated successfully');
            loadLead();
        } catch (err) {
            setError('Failed to update status');
            console.error(err);
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-700';
            case 'contacted': return 'bg-amber-100 text-amber-700';
            case 'converted': return 'bg-green-100 text-green-700';
            case 'closed': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-xl font-bold text-gray-800 mb-4">Lead not found</div>
                <Link to="/vendor/leads" className="text-blue-600 font-semibold hover:underline">
                    ← Back to Leads
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
            {/* Header Section */}
            <div className="relative bg-gradient-to-br from-blue-600 to-teal-600 pt-6 pb-8 px-6 rounded-b-[2rem] shadow-lg mb-6 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10"></div>

                <div className="max-w-7xl mx-auto text-slate-800">
                    <Link to="/vendor/leads" className="inline-flex items-center gap-2 text-blue-100 hover:text-slate-800 transition-colors mb-4 text-sm font-semibold backdrop-blur-sm bg-white/10 px-3 py-1.5 rounded-lg">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Leads
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black mb-1.5 font-display tracking-tight">Lead #{lead.id}</h1>
                            <p className="text-blue-100/90 font-medium flex items-center gap-2 opacity-90">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(lead.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-black/10 backdrop-blur-md border border-slate-300 capitalize ${lead.status === 'new' ? 'bg-blue-500/90 text-slate-800' :
                            lead.status === 'contacted' ? 'bg-amber-500/90 text-slate-800' :
                                lead.status === 'converted' ? 'bg-green-500/90 text-slate-800' :
                                    'bg-gray-500/90 text-slate-800'
                            }`}>
                            {lead.status_display}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Status Messages */}
                {success && (
                    <div className="bg-green-50 text-green-700 px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm border border-green-100 mb-6 animate-in fade-in slide-in-from-top-4">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {success}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm border border-red-100 mb-6 animate-in fade-in slide-in-from-top-4">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Columns */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Vehicle Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 overflow-hidden relative">
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 012-2v0m2 0a2 2 0 012 2l0 0m-6 0a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </span>
                                <h3 className="text-xl font-bold text-gray-900">Vehicle Details</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 relative z-10">
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Vehicle</div>
                                    <div className="text-lg font-bold text-gray-900">{lead.year} {lead.make} {lead.model}</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                                    <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Requested Part</div>
                                    <div className="text-lg font-bold text-blue-900">{lead.part}</div>
                                </div>
                                {lead.options && (
                                    <div className="sm:col-span-2">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Options/Notes</div>
                                        <div className="text-base font-medium text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">{lead.options}</div>
                                    </div>
                                )}
                                {lead.hollander_number && (
                                    <div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Hollander #</div>
                                        <div className="text-base font-medium text-gray-900">{lead.hollander_number}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Customer Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </span>
                                <h3 className="text-xl font-bold text-gray-900">Customer Info</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-lg">
                                        {lead.customer_name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 text-lg">{lead.customer_name}</div>
                                        <div className="text-sm text-gray-500 font-medium">{lead.state && lead.zip ? `${lead.state}, ${lead.zip}` : lead.location || 'Location not specified'}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <a href={`mailto:${lead.customer_email}`} className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors group">
                                        <span className="w-10 h-10 rounded-full bg-white text-gray-400 group-hover:text-blue-600 flex items-center justify-center shadow-sm transition-colors">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </span>
                                        <div className="overflow-hidden">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email</div>
                                            <div className="font-semibold text-gray-900 truncate">{lead.customer_email}</div>
                                        </div>
                                    </a>

                                    {lead.customer_phone && (
                                        <a href={`tel:${lead.customer_phone}`} className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors group">
                                            <span className="w-10 h-10 rounded-full bg-white text-gray-400 group-hover:text-green-600 flex items-center justify-center shadow-sm transition-colors">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </span>
                                            <div>
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Phone</div>
                                                <div className="font-semibold text-gray-900">{lead.customer_phone}</div>
                                            </div>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Pipeline Status</h3>
                            <div className="space-y-2">
                                {[
                                    { id: 'new', label: 'New Lead', icon: '✨' },
                                    { id: 'contacted', label: 'Contacted', icon: '💬' },
                                    { id: 'converted', label: 'Converted (Won)', icon: '✅' },
                                    { id: 'closed', label: 'Closed (Lost)', icon: '❌' }
                                ].map((status) => (
                                    <button
                                        key={status.id}
                                        onClick={() => handleStatusUpdate(status.id)}
                                        disabled={updating || lead.status === status.id}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all border-2 ${lead.status === status.id
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                            : 'border-transparent bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-[1.02]'
                                            } disabled:opacity-100 disabled:cursor-default`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span>{status.icon}</span>
                                            {status.label}
                                        </span>
                                        {lead.status === status.id && (
                                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions Card */}
                        <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-lg shadow-slate-200/50 p-6 text-slate-800">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Quick Actions
                            </h3>
                            <div className="space-y-3">
                                <a
                                    href={`mailto:${lead.customer_email}?subject=Re: ${lead.year} ${lead.make} ${lead.model} - ${lead.part}`}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-slate-200 backdrop-blur-sm transition-all text-sm font-bold"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Email Customer
                                </a>
                                {lead.customer_phone && (
                                    <a
                                        href={`tel:${lead.customer_phone}`}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-slate-200 backdrop-blur-sm transition-all text-sm font-bold"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        Call Customer
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorLeadDetail;
