import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vendorDashboard } from '../../services/vendorApi';
import { getLogoUrl } from '../../utils/imageUrl';
import { useCMS } from '../../hooks/useCMS';

const VendorDashboard = () => {
    const { get } = useCMS('vendor_portal');
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
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 animate-pulse">
            <div className="w-10 h-10 bg-slate-100 rounded-full mb-3 mx-auto"></div>
            <div className="h-8 bg-slate-100 rounded-lg w-16 mx-auto mb-2"></div>
            <div className="h-3 bg-slate-100 rounded w-20 mx-auto"></div>
        </div>
    );

    const SkeletonLead = () => (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-pulse">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <div className="h-5 bg-slate-100 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-50 mt-2">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100"></div>
                    <div className="h-3 bg-slate-100 rounded w-24"></div>
                </div>
                <div className="h-3 bg-slate-100 rounded w-16"></div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-full pb-20 md:pb-8">
                {/* Header Skeleton */}
                <div className="relative bg-white pt-4 md:pt-6 pb-6 md:pb-8 px-4 md:px-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 mb-4 md:mb-6 mt-4">
                    <div className="max-w-7xl mx-auto flex justify-between items-start">
                        <div className="flex-1">
                            <div className="h-8 bg-slate-100 rounded-lg w-48 mb-2 animate-pulse"></div>
                            <div className="h-4 bg-slate-100 rounded w-64 animate-pulse"></div>
                        </div>
                        <div className="w-12 h-12 bg-slate-100 rounded-full animate-pulse"></div>
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
                    <div className="bg-white rounded-3xl h-24 mb-6 md:mb-8 animate-pulse border border-slate-100 shadow-sm"></div>

                    {/* Recent Leads Skeleton */}
                    <div className="space-y-4">
                        <div className="h-6 bg-slate-100 rounded w-32 mb-4 animate-pulse"></div>
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
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-red-100 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Oops! Something went wrong</h3>
                    <p className="text-slate-500 mb-6 font-medium">{error}</p>
                    <button
                        onClick={loadDashboard}
                        className="w-full bg-[#1a56ff] hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-bold transition-all shadow-md"
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
            case 'new': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'contacted': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'converted': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'closed': return 'bg-slate-100 text-slate-600 border-slate-200';
            default: return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    return (
        <div className="min-h-full pb-20 md:pb-8 w-full bg-[#f8fafc]">
            {/* Pristine Light Header */}
            <div className="relative bg-white p-5 md:p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] mb-6 overflow-hidden border border-slate-100 mx-1">
                <div className="max-w-7xl mx-auto flex justify-between items-center text-slate-900 relative z-10 w-full">
                    <div className="flex-1">
                        <div className="flex items-center gap-4">
                            {/* Vendor Logo */}
                            {dashboardData?.vendor?.logo ? (
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden p-1.5 flex-shrink-0">
                                    <img
                                        src={getLogoUrl(dashboardData.vendor.logo)}
                                        alt={dashboardData.vendor.name}
                                        className="w-full h-full object-contain"
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
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm flex-shrink-0">
                                    <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            )}
                            <div className="min-w-0">
                                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>{get('dashboard', 'welcome_heading', 'Welcome Back')}</h1>
                                {dashboardData?.vendor?.name && (
                                    <p className="text-[12px] md:text-sm text-slate-500 font-medium mt-0.5 truncate">Here's what's happening with {dashboardData.vendor.name} today.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-1 sm:px-2 block w-full space-y-4 md:space-y-6">
                {/* White Grid Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                    <div className="bg-white p-4 md:p-5 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col items-center text-center hover:border-blue-200 hover:shadow-md transition-all duration-300 group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                        </div>
                        <span className="text-4xl font-extrabold text-slate-900 tabular-nums font-outfit">{dashboardData?.total_listings || 0}</span>
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-2 block">{get('dashboard', 'stat1_label', 'Total Listings')}</span>
                    </div>

                    <div className="bg-white p-4 md:p-5 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col items-center text-center hover:border-blue-200 hover:shadow-md transition-all duration-300 group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                        </div>
                        <span className="text-4xl font-extrabold text-slate-900 tabular-nums font-outfit">{dashboardData?.active_ads || 0}</span>
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-2 block">{get('dashboard', 'stat2_label', 'Active Ads')}</span>
                    </div>

                    <div className="bg-white p-4 md:p-5 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col items-center text-center hover:border-blue-200 hover:shadow-md transition-all duration-300 group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <span className="text-4xl font-extrabold text-slate-900 tabular-nums font-outfit">{dashboardData?.total_views || 0}</span>
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-2 block">{get('dashboard', 'stat3_label', 'Profile Views')}</span>
                    </div>

                    <div className="bg-white p-4 md:p-5 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col items-center text-center hover:border-emerald-200 hover:shadow-md transition-all duration-300 group">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-4xl font-extrabold text-slate-900 tabular-nums font-outfit">{dashboardData?.converted_leads || 0}</span>
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-2 block">{get('dashboard', 'stat4_label', 'Converted Leads')}</span>
                    </div>
                </div>

                {/* Account Status Card - Solid Blue Minimal Component */}
                <div className="bg-[#1a56ff] rounded-3xl p-5 md:p-6 shadow-[0_8px_30px_rgba(26,86,255,0.2)] mb-6 md:mb-8 flex justify-between items-center relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-[17px] font-bold text-white mb-2 font-outfit">{get('dashboard', 'system_status', 'System Status')}</h3>
                        <div className="flex items-center gap-2 bg-blue-900/30 w-max px-3 py-1.5 rounded-full">
                            <span className={`w-2.5 h-2.5 rounded-full ${dashboardData?.account_status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                            <span className="text-[13px] font-bold tracking-wider uppercase text-blue-50">{dashboardData?.account_status || 'Active'}</span>
                        </div>
                    </div>
                </div>

                {/* Recent Leads Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight font-outfit">{get('dashboard', 'requests_heading', 'Recent Network Requests')}</h3>
                        <Link
                            to="/vendor/leads"
                            className="text-[14px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition-colors"
                        >
                            {get('dashboard', 'view_all', 'View All')} <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {dashboardData?.recent_leads && dashboardData.recent_leads.length > 0 ? (
                            dashboardData.recent_leads.map((lead) => (
                                <Link
                                    to={`/vendor/leads/${lead.id}`}
                                    key={lead.id}
                                    className="block bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 group"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                                {lead.year} {lead.make} {lead.model}
                                            </h4>
                                            <p className="text-[14px] text-slate-500 truncate font-medium">{lead.part}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ml-2 border ${getStatusColor(lead.status)}`}>
                                            {lead.status_display}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 font-bold text-[13px] text-slate-600 flex items-center justify-center flex-shrink-0">
                                                {lead.customer_name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-[14px] text-slate-600 font-semibold truncate">{lead.customer_name}</span>
                                        </div>
                                        <span className="text-[13px] text-slate-400 font-medium flex-shrink-0">
                                            {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-12 md:py-16 bg-white rounded-3xl border border-slate-200 border-dashed">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                    <svg className="w-8 h-8 md:w-10 md:h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <p className="text-slate-900 font-bold text-[17px] mb-2 font-outfit">{get('dashboard', 'no_requests_title', 'No active requests found')}</p>
                                <p className="text-[14px] text-slate-500 font-medium">{get('dashboard', 'no_requests_sub', 'Stand by to receive incoming transmissions for your inventory.')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
