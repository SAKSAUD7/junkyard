import { useState, useEffect, useContext } from 'react';
import { api } from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import {
    ChartBarIcon,
    UserGroupIcon,
    EnvelopeIcon,
    MegaphoneIcon,
    ArrowTrendingUpIcon,
    ClockIcon
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
            gradient: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-50',
            textColor: 'text-blue-600',
            onClick: () => navigate('/admin-portal/leads')
        },
        {
            label: 'New Leads',
            value: stats.new_leads,
            icon: ArrowTrendingUpIcon,
            gradient: 'from-green-500 to-green-600',
            bgLight: 'bg-green-50',
            textColor: 'text-green-600',
            onClick: () => navigate('/admin-portal/leads')
        },
        {
            label: 'Active Vendors',
            value: stats.active_vendors,
            icon: UserGroupIcon,
            gradient: 'from-purple-500 to-purple-600',
            bgLight: 'bg-purple-50',
            textColor: 'text-purple-600',
            onClick: () => navigate('/admin-portal/vendors')
        },
        {
            label: 'Unread Messages',
            value: stats.unread_messages,
            icon: EnvelopeIcon,
            gradient: 'from-orange-500 to-orange-600',
            bgLight: 'bg-orange-50',
            textColor: 'text-orange-600',
            onClick: () => navigate('/admin-portal/messages')
        },
    ];

    const quickActions = [
        {
            title: 'Create New Ad',
            description: 'Launch a new marketing campaign',
            icon: MegaphoneIcon,
            color: 'blue',
            onClick: () => navigate('/admin-portal/ads')
        },
        {
            title: 'View New Leads',
            description: 'Check recent customer requests',
            icon: ArrowTrendingUpIcon,
            color: 'green',
            onClick: () => navigate('/admin-portal/leads')
        },
        {
            title: 'Manage Vendors',
            description: 'Review vendor listings',
            icon: UserGroupIcon,
            color: 'purple',
            onClick: () => navigate('/admin-portal/vendors')
        },
        {
            title: 'Messages',
            description: 'Reply to contact inquiries',
            icon: EnvelopeIcon,
            color: 'orange',
            onClick: () => navigate('/admin-portal/messages')
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
            green: 'bg-green-50 text-green-600 hover:bg-green-100',
            purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
            orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100'
        };
        return colors[color] || colors.blue;
    };

    if (loading) return (
        <div className="flex justify-center items-center h-96">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading dashboard...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <ClockIcon className="h-4 w-4" />
                        Last updated: {new Date().toLocaleTimeString()}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <button
                            key={index}
                            onClick={stat.onClick}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-lg hover:-translate-y-1 text-left group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`${stat.bgLight} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                                </div>
                                <div className={`bg-gradient-to-br ${stat.gradient} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                                    Live
                                </div>
                            </div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                            <p className="text-4xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                        </button>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leads Trend */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Leads Trend</h3>
                            <p className="text-sm text-gray-500">Last 7 days performance</p>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <ChartBarIcon className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    {stats.leads_trend && stats.leads_trend.length > 0 ? (
                        <div className="flex-1 h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.leads_trend}>
                                    <defs>
                                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#9ca3af"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            padding: '12px'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="leads"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ fill: '#3b82f6', r: 5 }}
                                        activeDot={{ r: 7, fill: '#2563eb' }}
                                        fill="url(#colorLeads)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[280px] text-gray-400">
                            <div className="text-center">
                                <ChartBarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Loading chart data...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Vendor Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Top Vendors by State</h3>
                            <p className="text-sm text-gray-500">Active vendor distribution</p>
                        </div>
                        <div className="bg-purple-50 p-2 rounded-lg">
                            <UserGroupIcon className="h-5 w-5 text-purple-600" />
                        </div>
                    </div>
                    {stats.vendor_distribution && stats.vendor_distribution.length > 0 ? (
                        <div className="flex-1 h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.vendor_distribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis
                                        dataKey="state"
                                        stroke="#9ca3af"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            padding: '12px'
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#8b5cf6"
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[280px] text-gray-400">
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
                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Recent Leads</h3>
                            <p className="text-sm text-gray-500">Latest customer requests</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin-portal/leads')}
                            className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                        >
                            View All →
                        </button>
                    </div>
                    <div className="space-y-3">
                        {stats.recent_activity && stats.recent_activity.length > 0 ? (
                            stats.recent_activity.map((lead) => (
                                <div
                                    key={lead.id}
                                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-200"
                                    onClick={() => navigate('/admin-portal/leads')}
                                >
                                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                        {lead.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{lead.name}</p>
                                        <p className="text-xs text-gray-600 mt-0.5">
                                            {lead.make} {lead.model} • {lead.part}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(lead.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                                            lead.status === 'converted' ? 'bg-green-100 text-green-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {(lead.status || 'new').toUpperCase()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <ChartBarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-sm text-gray-500">No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                        <p className="text-sm text-gray-500">Common tasks and shortcuts</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {quickActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={index}
                                    onClick={action.onClick}
                                    className={`p-5 rounded-xl border-2 border-transparent ${getColorClasses(action.color)} text-left transition-all hover:border-current hover:shadow-md group`}
                                >
                                    <Icon className="h-6 w-6 mb-3 group-hover:scale-110 transition-transform" />
                                    <span className="block font-semibold mb-1 text-sm group-hover:translate-x-1 transition-transform">
                                        {action.title}
                                    </span>
                                    <span className="text-xs opacity-75">
                                        {action.description}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
