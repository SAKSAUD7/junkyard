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
        <div className="bg-slate-800/50 p-5 rounded-3xl shadow-sm border border-slate-700/50 animate-pulse">
            <div className="w-10 h-10 bg-slate-700 rounded-full mb-3 mx-auto"></div>
            <div className="h-8 bg-slate-700 rounded-lg w-16 mx-auto mb-2"></div>
            <div className="h-3 bg-slate-700 rounded w-20 mx-auto"></div>
        </div>
    );

    const SkeletonLead = () => (
        <div className="bg-slate-800/40 p-4 rounded-2xl shadow-sm border border-slate-700/30 animate-pulse">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <div className="h-5 bg-slate-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-20 bg-slate-700 rounded-full"></div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-700 mt-2">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-700"></div>
                    <div className="h-3 bg-slate-700 rounded w-24"></div>
                </div>
                <div className="h-3 bg-slate-700 rounded w-16"></div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-full pb-20 md:pb-8">
                {/* Header Skeleton */}
                <div className="relative bg-gradient-to-br from-slate-800 to-indigo-900/40 pt-4 md:pt-6 pb-6 md:pb-8 px-4 md:px-6 rounded-b-[2rem] shadow-lg mb-4 md:mb-6 border border-slate-700/50">
                    <div className="max-w-7xl mx-auto flex justify-between items-start">
                        <div className="flex-1">
                            <div className="h-8 bg-slate-700/50 rounded-lg w-48 mb-2 animate-pulse"></div>
                            <div className="h-4 bg-slate-700/50 rounded w-64 animate-pulse"></div>
                        </div>
                        <div className="w-12 h-12 bg-slate-700/50 rounded-full animate-pulse"></div>
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
                    <div className="bg-slate-800/50 rounded-3xl h-24 mb-6 md:mb-8 animate-pulse border border-slate-700/50"></div>

                    {/* Recent Leads Skeleton */}
                    <div className="space-y-4">
                        <div className="h-6 bg-slate-700 rounded w-32 mb-4 animate-pulse"></div>
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
            <div className="min-h-full flex items-center justify-center p-4">
                <div className="bg-slate-800/80 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-xl border border-red-500/20 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Oops! Something went wrong</h3>
                    <p className="text-slate-300 mb-6">{error}</p>
                    <button
                        onClick={loadDashboard}
                        className="w-full bg-indigo-600/20 border border-indigo-500/50 text-indigo-400 py-3 px-6 rounded-xl font-semibold hover:bg-indigo-500 hover:text-white active:scale-95 transition-all"
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
            case 'new': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            case 'contacted': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'converted': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'closed': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="min-h-full pb-20 md:pb-8 w-full">
            {/* Enhanced Header with Glassmorphism */}
            <div className="relative bg-gradient-to-br from-indigo-600/20 via-slate-800/80 to-violet-900/30 backdrop-blur-xl border border-white/5 pt-4 md:pt-6 pb-6 md:pb-8 px-4 md:px-6 rounded-[2rem] shadow-2xl mb-4 md:mb-6 overflow-hidden">
                {/* Animated Background Blobs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-2xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-500/20 rounded-full -ml-12 -mb-12 blur-xl animate-pulse delay-75"></div>

                <div className="max-w-7xl mx-auto flex justify-between items-start text-white relative z-10 w-full">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1.5">
                            {/* Vendor Logo */}
                            {dashboardData?.vendor?.logo ? (
                                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700 shadow-xl overflow-hidden">
                                    <img
                                        src={getLogoUrl(dashboardData.vendor.logo)}
                                        alt={dashboardData.vendor.name}
                                        className="w-full h-full object-contain p-1.5"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = `
                                                <svg class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            `;
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 shadow-lg">
                                    <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white drop-shadow-md">Command Center</h1>
                                {dashboardData?.vendor?.name && (
                                    <p className="text-slate-300 text-sm font-medium">{dashboardData.vendor.name}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Enhanced Profile Avatar */}
                    <Link
                        to="/vendor/profile"
                        className="w-11 h-11 md:w-12 md:h-12 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:border-indigo-400 hover:bg-white/10 transition-all cursor-pointer group active:scale-95 shadow-xl"
                    >
                        <svg className="w-6 h-6 text-indigo-300 group-hover:scale-110 group-hover:text-white transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-1 sm:px-2 block w-full space-y-6">
                {/* Advanced Stat Glass Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
                    <div className="bg-slate-800/40 backdrop-blur-lg p-5 rounded-3xl border border-slate-700 flex flex-col items-center text-center hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:-translate-y-1 hover:border-indigo-500/50 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                        </div>
                        <span className="text-3xl font-bold text-white tabular-nums drop-shadow-md">{dashboardData?.total_listings || 0}</span>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Total Listings</span>
                    </div>

                    <div className="bg-slate-800/40 backdrop-blur-lg p-5 rounded-3xl border border-slate-700 flex flex-col items-center text-center hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:-translate-y-1 hover:border-violet-500/50 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-violet-500/10 text-violet-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                        </div>
                        <span className="text-3xl font-bold text-white tabular-nums drop-shadow-md">{dashboardData?.active_ads || 0}</span>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Active Ads</span>
                    </div>

                    <div className="bg-slate-800/40 backdrop-blur-lg p-5 rounded-3xl border border-slate-700 flex flex-col items-center text-center hover:shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:-translate-y-1 hover:border-amber-500/50 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <span className="text-3xl font-bold text-white tabular-nums drop-shadow-md">{dashboardData?.total_views || 0}</span>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Profile Views</span>
                    </div>

                    <div className="bg-slate-800/40 backdrop-blur-lg p-5 rounded-3xl border border-slate-700 flex flex-col items-center text-center hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:-translate-y-1 hover:border-emerald-500/50 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-3xl font-bold text-white tabular-nums drop-shadow-md">{dashboardData?.converted_leads || 0}</span>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Converted</span>
                    </div>
                </div>

                {/* Cyberpunk Account Status Card */}
                <div className="bg-gradient-to-r from-slate-800 via-slate-800/80 to-slate-900 rounded-3xl p-6 border border-slate-700 shadow-2xl mb-8 flex justify-between items-center relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold text-white mb-1">System Operation</h3>
                        <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(7ade80,0.8)] ${dashboardData?.account_status === 'Active' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                            <span className="text-sm font-bold tracking-widest uppercase text-slate-300">{dashboardData?.account_status || 'Active'}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-2">All external hooks operational.</p>
                    </div>
                    {/* Animated Decorative Assets */}
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="absolute right-10 -top-10 w-24 h-24 bg-violet-500/10 rounded-full blur-xl"></div>
                </div>

                {/* Enhanced Recent Leads Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h3 className="text-xl font-bold text-white tracking-tight">Recent Network Requests</h3>
                        <Link
                            to="/vendor/leads"
                            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group transition-colors"
                        >
                            View All Data <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        {dashboardData?.recent_leads && dashboardData.recent_leads.length > 0 ? (
                            dashboardData.recent_leads.map((lead) => (
                                <Link
                                    to={`/vendor/leads/${lead.id}`}
                                    key={lead.id}
                                    className="block bg-slate-800/40 p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-slate-700 hover:border-slate-500 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:-translate-y-0.5 transition-all duration-300 group active:scale-[0.98]"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                                                {lead.year} {lead.make} {lead.model}
                                            </h4>
                                            <p className="text-sm text-slate-400 truncate">{lead.part}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2 border ${getStatusColor(lead.status)}`}>
                                            {lead.status_display}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <div className="w-7 h-7 rounded-full bg-slate-700 font-black shadow-inner flex items-center justify-center text-xs text-slate-300 flex-shrink-0">
                                                {lead.customer_name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs text-slate-300 font-medium truncate">{lead.customer_name}</span>
                                        </div>
                                        <span className="text-xs text-slate-500 font-mono flex-shrink-0">
                                            {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-12 md:py-16 bg-slate-800/20 rounded-2xl md:rounded-3xl border-2 border-dashed border-slate-700/50">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                                    <svg className="w-8 h-8 md:w-10 md:h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <p className="text-slate-300 font-semibold mb-2">No active network requests intercepted yet</p>
                                <p className="text-sm text-slate-500">Stand by to receive incoming transmissions for your inventory.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
