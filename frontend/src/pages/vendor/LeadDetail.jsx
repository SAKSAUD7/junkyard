import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { vendorLeads } from '../../services/vendorApi';
import { useCMS } from '../../hooks/useCMS';

const VendorLeadDetail = () => {
    const { get } = useCMS('vendor_portal');
    const { id } = useParams();
    const navigate = useNavigate();
    const [dist, setDist] = useState(null);
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
            setDist(response.data);
        } catch (err) {
            setError('Failed to load lead details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlock = async () => {
        setUpdating(true);
        setError('');
        try {
            await vendorLeads.unlock(id);
            setSuccess('Lead unlocked successfully!');
            await loadLead();
        } catch (err) {
            setError('Failed to unlock lead.');
            console.error(err);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56ff]"></div>
            </div>
        );
    }

    if (!dist) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-xl font-bold text-gray-800 mb-4">Lead not found</div>
                <Link to="/vendor/leads" className="text-blue-600 font-semibold hover:underline">
                    ← Back to Leads
                </Link>
            </div>
        );
    }

    const lead = dist.lead_summary || {};
    const contact = dist.lead_contact;

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 md:pb-8">
            {/* Header Section */}
            <div className="relative bg-white pt-6 md:pt-8 pb-6 md:pb-8 px-6 md:px-8 rounded-b-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 overflow-hidden border-b border-slate-100">
                <div className="max-w-7xl mx-auto text-slate-900">
                    <Link to="/vendor/leads" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1a56ff] transition-colors mb-6 text-sm font-bold bg-slate-50 hover:bg-[#1a56ff]/10 px-3 py-1.5 rounded-xl border border-slate-100 hover:border-[#1a56ff]/20">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Leads
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold mb-1.5 tracking-tight text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Lead #{dist.lead}</h1>
                            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                                {new Date(dist.assigned_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm uppercase tracking-wide border ${dist.is_unlocked ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            {dist.is_unlocked ? '🔓 UNLOCKED' : '🔒 LOCKED'}
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
                        <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-6 md:p-8 overflow-hidden relative">
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <span className="w-10 h-10 rounded-xl bg-[#1a56ff]/10 text-[#1a56ff] flex items-center justify-center">
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
                                <div className="p-4 rounded-2xl bg-[#1a56ff]/5 border border-[#1a56ff]/20">
                                    <div className="text-xs font-bold text-[#1a56ff]/70 uppercase tracking-wider mb-1">Requested Part</div>
                                    <div className="text-lg font-bold text-[#1a56ff]">{lead.part}</div>
                                </div>
                                {lead.options && (
                                    <div className="sm:col-span-2">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Options/Notes</div>
                                        <div className="text-base font-medium text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">{lead.options}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Customer / Unlock Card */}
                        <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${dist.is_unlocked ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </span>
                                <h3 className="text-xl font-bold text-gray-900">Customer Info</h3>
                            </div>

                            {dist.is_unlocked && contact ? (
                                /* UNLOCKED VIEW */
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
                                            {contact.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-lg">{contact.name}</div>
                                            <div className="text-sm text-gray-500 font-medium">{contact.state && contact.zip ? `${contact.state}, ${contact.zip}` : 'Location hidden'}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <a href={`mailto:${contact.email}`} className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors group">
                                            <span className="w-10 h-10 rounded-full bg-white text-gray-400 group-hover:text-[#1a56ff] flex items-center justify-center shadow-sm transition-colors">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </span>
                                            <div className="overflow-hidden">
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email</div>
                                                <div className="font-semibold text-gray-900 truncate">{contact.email}</div>
                                            </div>
                                        </a>

                                        {contact.phone && (
                                            <a href={`tel:${contact.phone}`} className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors group">
                                                <span className="w-10 h-10 rounded-full bg-white text-gray-400 group-hover:text-green-600 flex items-center justify-center shadow-sm transition-colors">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                </span>
                                                <div>
                                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Phone</div>
                                                    <div className="font-semibold text-gray-900">{contact.phone}</div>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* LOCKED VIEW */
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">Customer Details Locked</h3>
                                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                                        Unlock this lead to instantly view the customer's full name, email, and phone number so you can reach out with a quote.
                                    </p>
                                    <button
                                        onClick={handleUnlock}
                                        disabled={updating}
                                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1a56ff] hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold transition-all shadow-[0_4px_12px_rgba(26,86,255,0.3)] disabled:opacity-75"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                        </svg>
                                        {updating ? 'Unlocking...' : 'Unlock Customer Details'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        {/* Quick Actions Card */}
                        {dist.is_unlocked && contact && (
                            <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-6 text-slate-800">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Quick Actions
                                </h3>
                                <div className="space-y-3">
                                    <a
                                        href={`mailto:${contact.email}?subject=Re: ${lead.year} ${lead.make} ${lead.model} - ${lead.part}`}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-sm font-bold text-slate-700"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Email Customer
                                    </a>
                                    {contact.phone && (
                                        <a
                                            href={`tel:${contact.phone}`}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-sm font-bold text-slate-700"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            Call Customer
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {!dist.is_unlocked && (
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-6 border border-blue-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Sell More Parts</h3>
                                <p className="text-sm text-slate-600 mb-4">
                                    Our platform connects you with active buyers in your area. Unlock this lead to make a sale today!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorLeadDetail;
