import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vendorDashboard } from '../../services/vendorApi';
import { getLogoUrl } from '../../utils/imageUrl';

const VendorDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const response = await vendorDashboard.getOverview();
            setDashboardData(response.data);
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Skeleton Loading Component
    const SkeletonCard = () => (
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full mb-3 mx-auto"></div>
            <div className="h-8 bg-gray-200 rounded-lg w-16 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20 mx-auto"></div>
        </div>
    );

    const SkeletonLead = () => (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-50 mt-2">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
                {/* Header Skeleton */}
                <div className="relative bg-gradient-to-br from-blue-600 to-teal-600 pt-4 md:pt-6 pb-6 md:pb-8 px-4 md:px-6 rounded-b-[2rem] shadow-lg mb-4 md:mb-6">
                    <div className="max-w-7xl mx-auto flex justify-between items-start">
                        <div className="flex-1">
                            <div className="h-8 bg-white/20 rounded-lg w-48 mb-2 animate-pulse"></div>
                            <div className="h-4 bg-white/20 rounded w-64 animate-pulse"></div>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full animate-pulse"></div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Stats Skeleton */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>

                    {/* Account Status Skeleton */}
                    <div className="bg-gray-200 rounded-3xl h-24 mb-6 md:mb-8 animate-pulse"></div>

                    {/* Recent Leads Skeleton */}
                    <div className="space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
                        <SkeletonLead />
                        <SkeletonLead />
                        <SkeletonLead />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-red-100 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={loadDashboard}
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Helper for status colors
    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-700';
            case 'contacted': return 'bg-amber-100 text-amber-700';
            case 'converted': return 'bg-green-100 text-green-700';
            case 'closed': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
            {/* Enhanced Header with Glassmorphism */}
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-teal-600 pt-4 md:pt-6 pb-6 md:pb-8 px-4 md:px-6 rounded-b-[2rem] shadow-xl mb-4 md:mb-6 overflow-hidden">
                {/* Animated Background Blobs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl animate-pulse delay-75"></div>

                <div className="max-w-7xl mx-auto flex justify-between items-start text-white relative z-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1.5">
                            {/* Vendor Logo */}
                            {dashboardData?.vendor?.logo ? (
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border-2 border-white/30 shadow-lg overflow-hidden">
                                    <img
                                        src={getLogoUrl(dashboardData.vendor.logo)}
                                        alt={dashboardData.vendor.name}
                                        loading="lazy"
                                        className="w-full h-full object-contain p-1.5"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = `
                                                <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            `;
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight">Welcome Back!</h1>
                                {dashboardData?.vendor?.name && (
                                    <p className="text-blue-100 text-sm font-medium">{dashboardData.vendor.name}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Enhanced Profile Avatar */}
                    <Link
                        to="/vendor/profile"
                        className="w-11 h-11 md:w-12 md:h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30 hover:border-white/60 hover:bg-white/30 transition-all cursor-pointer group active:scale-95"
                    >
                        <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Enhanced Stats Grid with Animations */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <span className="text-2xl md:text-3xl font-bold text-gray-900 tabular-nums">{dashboardData?.total_leads || 0}</span>
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Total Leads</span>
                    </div>

                    <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="text-2xl md:text-3xl font-bold text-gray-900 tabular-nums">{dashboardData?.new_leads || 0}</span>
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">New Leads</span>
                    </div>

                    <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <span className="text-2xl md:text-3xl font-bold text-gray-900 tabular-nums">{dashboardData?.contacted_leads || 0}</span>
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">In Progress</span>
                    </div>

                    <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-50 to-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-2xl md:text-3xl font-bold text-gray-900 tabular-nums">{dashboardData?.converted_leads || 0}</span>
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Converted</span>
                    </div>
                </div>

                {/* Enhanced Account Status Card */}
                <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl md:rounded-3xl p-5 md:p-6 text-white shadow-xl mb-6 md:mb-8 flex justify-between items-center relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-base md:text-lg font-bold mb-1">Account Status</h3>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${dashboardData?.account_status === 'Active' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                            <span className="text-sm font-medium text-gray-300">{dashboardData?.account_status || 'Active'}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Your account is fully operational.</p>
                    </div>
                    {/* Animated Decorative Circle */}
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="absolute -right-2 -top-2 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>
                </div>

                {/* Enhanced Recent Leads Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900">Recent Leads</h3>
                        <Link
                            to="/vendor/leads"
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
                        >
                            See All
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        {dashboardData?.recent_leads && dashboardData.recent_leads.length > 0 ? (
                            dashboardData.recent_leads.map((lead) => (
                                <Link
                                    to={`/vendor/leads/${lead.id}`}
                                    key={lead.id}
                                    className="block bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group active:scale-[0.98]"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                                {lead.year} {lead.make} {lead.model}
                                            </h4>
                                            <p className="text-sm text-gray-500 truncate">{lead.part}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2 ${getStatusColor(lead.status)}`}>
                                            {lead.status_display}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                                                {lead.customer_name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs text-gray-600 font-medium truncate">{lead.customer_name}</span>
                                        </div>
                                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                            {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-12 md:py-16 bg-white rounded-2xl md:rounded-3xl border-2 border-dashed border-gray-200">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 md:w-10 md:h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 font-semibold mb-2">No recent leads yet</p>
                                <p className="text-sm text-gray-400">New leads will appear here when customers request parts</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
