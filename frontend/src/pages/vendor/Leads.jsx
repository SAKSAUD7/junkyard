import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vendorLeads } from '../../services/vendorApi';

const VendorLeads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadLeads();
    }, [statusFilter, searchQuery]);

    const loadLeads = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (searchQuery) params.search = searchQuery;

            const response = await vendorLeads.list(params);
            setLeads(response.data.results || response.data);
        } catch (err) {
            setError('Failed to load leads');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'contacted': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'converted': return 'bg-green-100 text-green-700 border-green-200';
            case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'new':
                return (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                );
            case 'contacted':
                return (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                );
            case 'converted':
                return (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    // Skeleton Components
    const SkeletonLead = () => (
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-4 md:p-5 animate-pulse">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
            </div>
            <div className="ml-[3.25rem] border-t border-gray-50 pt-3 mt-3">
                <div className="flex gap-6">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
            {/* Enhanced Header */}
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-teal-600 pt-4 md:pt-6 pb-6 md:pb-8 px-4 md:px-6 rounded-b-[2rem] shadow-xl mb-4 md:mb-6 overflow-hidden">
                {/* Animated Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl animate-pulse delay-75"></div>

                <div className="max-w-7xl mx-auto text-slate-800 relative z-10">
                    <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-slate-300 shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight">Customer Inquiries</h1>
                    </div>
                    <p className="text-blue-50/90 text-sm font-medium ml-0 md:ml-[2.875rem]">Connect with customers looking for parts</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Enhanced Search & Filter Card */}
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg shadow-blue-900/5 p-2 mb-4 md:mb-6 flex flex-col md:flex-row gap-2 border border-gray-100">
                    <div className="flex-1 relative">
                        <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-3 md:py-3.5 rounded-xl md:rounded-2xl bg-transparent focus:bg-gray-50 outline-none transition-colors text-gray-700 placeholder-gray-400 text-sm md:text-base"
                            placeholder="Search by name, make, model, or part..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                            >
                                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <div className="md:w-52 relative">
                        <select
                            className="w-full pl-4 pr-10 py-3 md:py-3.5 rounded-xl md:rounded-2xl bg-transparent outline-none appearance-none cursor-pointer text-gray-700 font-medium text-sm md:text-base hover:bg-gray-50 transition-colors"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="new">🆕 New</option>
                            <option value="contacted">💬 In Progress</option>
                            <option value="converted">✅ Won</option>
                            <option value="closed">❌ Lost</option>
                        </select>
                        <svg className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Results Count */}
                {!loading && (
                    <div className="flex items-center justify-between mb-4 px-1">
                        <p className="text-sm text-gray-600 font-medium">
                            {leads.length} {leads.length === 1 ? 'inquiry' : 'inquiries'} found
                        </p>
                        {(statusFilter || searchQuery) && (
                            <button
                                onClick={() => {
                                    setStatusFilter('');
                                    setSearchQuery('');
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                            >
                                Clear filters
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl md:rounded-2xl flex items-center gap-3 shadow-sm border border-red-100 mb-6">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="flex-1">{error}</span>
                        <button onClick={loadLeads} className="text-red-800 hover:text-red-900 font-semibold text-sm">
                            Retry
                        </button>
                    </div>
                )}

                {/* Leads List */}
                <div className="space-y-3 md:space-y-4">
                    {loading ? (
                        <>
                            <SkeletonLead />
                            <SkeletonLead />
                            <SkeletonLead />
                            <SkeletonLead />
                        </>
                    ) : leads.length > 0 ? (
                        leads.map((lead) => (
                            <Link
                                to={`/vendor/leads/${lead.id}`}
                                key={lead.id}
                                className="block bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-4 md:p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group active:scale-[0.98]"
                            >
                                <div className="flex justify-between items-start mb-3 gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0">
                                            {lead.customer_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors truncate text-sm md:text-base">
                                                {lead.year} {lead.make} {lead.model}
                                            </h3>
                                            <p className="text-xs md:text-sm text-gray-500 font-medium truncate">{lead.customer_name}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 md:px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${getStatusColor(lead.status)}`}>
                                        {getStatusIcon(lead.status)}
                                        <span className="hidden sm:inline">{lead.status_display}</span>
                                    </span>
                                </div>

                                <div className="ml-0 md:ml-[3.25rem] border-t border-gray-50 pt-3 mt-3">
                                    <div className="flex flex-wrap gap-y-2 gap-x-4 md:gap-x-6 text-xs md:text-sm text-gray-600">
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="truncate">{lead.part}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        {(lead.state || lead.location) && (
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="truncate">{lead.state && lead.zip ? `${lead.state}, ${lead.zip}` : lead.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-12 md:py-16 bg-white rounded-2xl md:rounded-3xl border-2 border-dashed border-gray-200">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 md:w-10 md:h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">
                                {searchQuery || statusFilter ? 'No matching inquiries' : 'No inquiries yet'}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                {searchQuery || statusFilter
                                    ? 'Try adjusting your filters or search terms'
                                    : 'Wait for customers to request parts'}
                            </p>
                            {(searchQuery || statusFilter) && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setStatusFilter('');
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all text-sm"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorLeads;
