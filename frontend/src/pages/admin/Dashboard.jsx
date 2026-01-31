import { useState, useEffect, useContext } from 'react';
import { api } from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, AreaChart, Area
} from 'recharts';
import {
    ChartBarIcon,
    UserGroupIcon,
    EnvelopeIcon,
    MegaphoneIcon,
    ArrowTrendingUpIcon,
    ClockIcon,
    SparklesIcon,
    BoltIcon,
    FireIcon,
    TrophyIcon,
    RocketLaunchIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_leads: 0,
        new_leads: 0,
        active_vendors: 0,
        total_vendors: 0,
        total_ads: 0,
        unread_messages: 0,
        vendor_distribution: [],
        leads_trend: [],
        recent_activity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.getAdminStats(token);
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchStats();
    }, [token]);

    const statCards = [
        {
            label: 'Total Leads',
            value: stats.total_leads,
            icon: ChartBarIcon,
            gradient: 'from-[#6366f1] via-[#8b5cf6] to-[#a855f7]',
            bgLight: 'from-indigo-50 to-purple-50',
            textColor: 'text-[#6366f1]',
            iconBg: 'bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]',
            shadowColor: 'shadow-indigo-200',
            trend: '+12%',
            trendIcon: ArrowTrendingUpIcon,
            onClick: () => navigate('/admin-portal/leads')
        },
        {
            label: 'New Leads',
            value: stats.new_leads,
            icon: FireIcon,
            gradient: 'from-[#10b981] via-[#059669] to-[#047857]',
            bgLight: 'from-emerald-50 to-green-50',
            textColor: 'text-[#10b981]',
            iconBg: 'bg-gradient-to-br from-[#10b981] to-[#059669]',
            shadowColor: 'shadow-emerald-200',
            trend: '+24%',
            trendIcon: BoltIcon,
            onClick: () => navigate('/admin-portal/leads')
        },
        {
            label: 'Active Vendors',
            value: stats.active_vendors,
            icon: UserGroupIcon,
            gradient: 'from-[#f59e0b] via-[#d97706] to-[#b45309]',
            bgLight: 'from-amber-50 to-orange-50',
            textColor: 'text-[#f59e0b]',
            iconBg: 'bg-gradient-to-br from-[#f59e0b] to-[#d97706]',
            shadowColor: 'shadow-amber-200',
            trend: '+8%',
            trendIcon: TrophyIcon,
            onClick: () => navigate('/admin-portal/vendors')
        },
        {
            label: 'Unread Messages',
            value: stats.unread_messages,
            icon: EnvelopeIcon,
            gradient: 'from-[#ec4899] via-[#db2777] to-[#be185d]',
            bgLight: 'from-pink-50 to-rose-50',
            textColor: 'text-[#ec4899]',
            iconBg: 'bg-gradient-to-br from-[#ec4899] to-[#db2777]',
            shadowColor: 'shadow-pink-200',
            trend: '3 new',
            trendIcon: SparklesIcon,
            onClick: () => navigate('/admin-portal/messages')
        },
    ];

    const quickActions = [
        {
            title: 'Create New Ad',
            description: 'Launch a marketing campaign',
            icon: MegaphoneIcon,
            gradient: 'from-[#6366f1] to-[#8b5cf6]',
            onClick: () => navigate('/admin-portal/ads')
        },
        {
            title: 'View New Leads',
            description: 'Check recent requests',
            icon: RocketLaunchIcon,
            gradient: 'from-[#10b981] to-[#059669]',
            onClick: () => navigate('/admin-portal/leads')
        },
        {
            title: 'Manage Vendors',
            description: 'Review vendor listings',
            icon: UserGroupIcon,
            gradient: 'from-[#f59e0b] to-[#d97706]',
            onClick: () => navigate('/admin-portal/vendors')
        },
        {
            title: 'Messages',
            description: 'Reply to inquiries',
            icon: EnvelopeIcon,
            gradient: 'from-[#ec4899] to-[#db2777]',
            onClick: () => navigate('/admin-portal/messages')
        }
    ];

    if (loading) return (
        <div className="flex justify-center items-center h-96">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#6366f1] mx-auto mb-4"></div>
                <p className="text-[#6b7280] font-medium">Loading dashboard...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-8">
            {/* Hero Header with Gradient */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#a855f7] rounded-2xl shadow-xl p-8">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>

                <div className="relative">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <SparklesIcon className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                                    <p className="text-indigo-100 mt-1 flex items-center gap-2">
                                        <ClockIcon className="h-4 w-4" />
                                        Last updated: {new Date().toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                                <p className="text-xs text-indigo-100">Total Vendors</p>
                                <p className="text-2xl font-bold text-white">{stats.total_vendors}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                                <p className="text-xs text-indigo-100">Total Ads</p>
                                <p className="text-2xl font-bold text-white">{stats.total_ads}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    const TrendIcon = stat.trendIcon;
                    return (
                        <button
                            key={index}
                            onClick={stat.onClick}
                            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 transition-all duration-300 hover:-translate-y-2 border border-[#e5e7eb] overflow-hidden"
                        >
                            {/* Gradient Background on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgLight} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                            <div className="relative">
                                {/* Icon and Trend */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`${stat.iconBg} p-3 rounded-xl shadow-lg ${stat.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
                                        <TrendIcon className={`h-3.5 w-3.5 ${stat.textColor}`} />
                                        <span className={`text-xs font-bold ${stat.textColor}`}>{stat.trend}</span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <p className="text-sm font-medium text-[#6b7280] mb-1">{stat.label}</p>
                                <p className="text-4xl font-bold text-[#1f2937] mb-2">{stat.value.toLocaleString()}</p>

                                {/* Progress Bar */}
                                <div className="w-full bg-[#f3f4f6] rounded-full h-1.5 overflow-hidden">
                                    <div className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-1000 group-hover:w-full`} style={{ width: '70%' }}></div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leads Trend - Enhanced */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#e5e7eb] hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-[#1f2937]">Leads Trend</h3>
                            <p className="text-sm text-[#6b7280] mt-1">Last 7 days performance</p>
                        </div>
                        <div className="bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] p-3 rounded-xl shadow-lg shadow-indigo-200">
                            <ChartBarIcon className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    {stats.leads_trend && stats.leads_trend.length > 0 ? (
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.leads_trend}>
                                    <defs>
                                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#9ca3af"
                                        style={{ fontSize: '12px', fontWeight: '500' }}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        style={{ fontSize: '12px', fontWeight: '500' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            padding: '12px',
                                            background: 'white'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="leads"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fill="url(#colorLeads)"
                                        dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[280px] text-[#9ca3af]">
                            <div className="text-center">
                                <ChartBarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Loading chart data...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Vendor Distribution - Enhanced */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#e5e7eb] hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-[#1f2937]">Top Vendors by State</h3>
                            <p className="text-sm text-[#6b7280] mt-1">Active vendor distribution</p>
                        </div>
                        <div className="bg-gradient-to-br from-[#f59e0b] to-[#d97706] p-3 rounded-xl shadow-lg shadow-amber-200">
                            <UserGroupIcon className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    {stats.vendor_distribution && stats.vendor_distribution.length > 0 ? (
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.vendor_distribution}>
                                    <defs>
                                        <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f59e0b" />
                                            <stop offset="100%" stopColor="#d97706" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis
                                        dataKey="state"
                                        stroke="#9ca3af"
                                        style={{ fontSize: '12px', fontWeight: '500' }}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        style={{ fontSize: '12px', fontWeight: '500' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            padding: '12px',
                                            background: 'white'
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="url(#colorBar)"
                                        radius={[12, 12, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[280px] text-[#9ca3af]">
                            <div className="text-center">
                                <UserGroupIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No vendor data available</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity - Enhanced */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#e5e7eb]">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-[#1f2937]">Recent Leads</h3>
                            <p className="text-sm text-[#6b7280] mt-1">Latest customer requests</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin-portal/leads')}
                            className="text-sm text-[#6366f1] hover:text-[#4f46e5] font-semibold hover:underline flex items-center gap-1"
                        >
                            View All →
                        </button>
                    </div>
                    <div className="space-y-3">
                        {stats.recent_activity && stats.recent_activity.length > 0 ? (
                            stats.recent_activity.map((lead) => (
                                <div
                                    key={lead.id}
                                    className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all cursor-pointer border border-transparent hover:border-indigo-100"
                                    onClick={() => navigate('/admin-portal/leads')}
                                >
                                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                                        {lead.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#1f2937] truncate">{lead.name}</p>
                                        <p className="text-xs text-[#6b7280] mt-0.5">
                                            {lead.make} {lead.model} • {lead.part}
                                        </p>
                                        <p className="text-xs text-[#9ca3af] mt-1">
                                            {new Date(lead.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-lg ${lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                                            lead.status === 'contacted' ? 'bg-amber-100 text-amber-700' :
                                                lead.status === 'converted' ? 'bg-green-100 text-green-700' :
                                                    'bg-gray-100 text-gray-700'
                                        }`}>
                                        {(lead.status || 'new').toUpperCase()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <ChartBarIcon className="h-12 w-12 mx-auto mb-3 text-[#d1d5db]" />
                                <p className="text-sm text-[#6b7280]">No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions - Enhanced */}
                <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-[#e5e7eb]">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-[#1f2937] flex items-center gap-2">
                            <BoltIcon className="h-6 w-6 text-[#6366f1]" />
                            Quick Actions
                        </h3>
                        <p className="text-sm text-[#6b7280] mt-1">Common tasks and shortcuts</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {quickActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={index}
                                    onClick={action.onClick}
                                    className="group relative p-5 rounded-xl bg-white border border-[#e5e7eb] hover:border-transparent hover:shadow-xl text-left transition-all overflow-hidden"
                                >
                                    {/* Gradient overlay on hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                                    <div className="relative">
                                        <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${action.gradient} shadow-lg mb-3 group-hover:scale-110 transition-transform`}>
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="block font-bold text-sm mb-1 text-[#1f2937] group-hover:text-white transition-colors">
                                            {action.title}
                                        </span>
                                        <span className="text-xs text-[#6b7280] group-hover:text-white/90 transition-colors">
                                            {action.description}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
