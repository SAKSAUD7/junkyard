import { useState, useEffect, useContext } from 'react';
import { api } from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
    UserGroupIcon,
    FireIcon,
    CalendarIcon,
    MegaphoneIcon,
    CubeIcon,
    ArrowUpIcon,
    EnvelopeIcon,
    ArrowPathIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';

// ─── Helpers ────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
}

const LEAD_TYPE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

// ─── BuildingStorefrontIcon (inline SVG, not in heroicons/outline) ────────
function BuildingStorefrontIcon(props) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
        </svg>
    );
}

export default function AdminDashboard() {
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await api.getAdminStats(token);
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch admin stats:', err);
                setError('Could not load dashboard data. Please refresh.');
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchStats();
        else setLoading(false);
    }, [token]);

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-96 gap-4">
            <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading dashboard…</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col justify-center items-center h-96 gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-rose-500" />
            </div>
            <p className="text-slate-600 font-semibold">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
                <ArrowPathIcon className="w-4 h-4" /> Retry
            </button>
        </div>
    );

    // ── Derived values from real API data
    const totalLeads = stats?.total_leads ?? 0;
    const newLeads = stats?.new_leads ?? 0;
    const activeVendors = stats?.active_vendors ?? 0;
    const totalVendors = stats?.total_vendors ?? 0;
    const totalAds = stats?.total_ads ?? 0;
    const unreadMessages = stats?.unread_messages ?? 0;
    const leadsChart = stats?.leads_trend ?? [];
    const recentActivity = stats?.recent_activity ?? [];
    const topVendors = stats?.top_vendors_by_leads ?? [];
    const leadTypeDist = (stats?.lead_type_distribution ?? []).map((d, i) => ({
        ...d,
        color: LEAD_TYPE_COLORS[i % LEAD_TYPE_COLORS.length],
    }));

    const statCards = [
        { label: 'Total Leads', value: totalLeads.toLocaleString(), icon: UserGroupIcon, bg: 'bg-indigo-500' },
        { label: 'New Leads', value: newLeads.toLocaleString(), icon: FireIcon, bg: 'bg-emerald-500' },
        { label: 'Active Vendors', value: activeVendors.toLocaleString(), icon: BuildingStorefrontIcon, bg: 'bg-orange-500' },
        { label: 'Total Vendors', value: totalVendors.toLocaleString(), icon: CubeIcon, bg: 'bg-blue-500' },
        { label: 'Unread Messages', value: unreadMessages.toLocaleString(), icon: EnvelopeIcon, bg: 'bg-purple-500' },
        { label: 'Total Ads', value: totalAds.toLocaleString(), icon: MegaphoneIcon, bg: 'bg-pink-500' },
    ];

    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    const dateRange = `${sevenDaysAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    return (
        <div className="max-w-[1600px] mx-auto space-y-6">
            {/* ── Header ────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Welcome back, {user?.username || 'Admin'}! <span className="text-2xl">👋</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Here's what's happening with your marketplace today.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 shadow-sm">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    {dateRange}
                </div>
            </div>

            {/* ── Stat Cards ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.bg}`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{stat.label}</p>
                                <p className="text-xl font-bold text-slate-900 mt-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {stat.value}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md">
                            Live data
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Charts Row ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Leads Overview — real 7-day trend */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Leads Trend</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Daily lead submissions — last 7 days</p>
                        </div>
                    </div>
                    {leadsChart.length > 0 ? (
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={leadsChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(v) => [v, 'Leads']}
                                    />
                                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                                    <Area type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)"
                                        dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6' }}
                                        activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[250px] flex flex-col items-center justify-center gap-2 text-slate-400">
                            <ChartBarIcon className="w-10 h-10" />
                            <p className="text-sm">No leads in the last 7 days</p>
                        </div>
                    )}
                </div>

                {/* Top Vendors by Leads — real data */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-base font-bold text-slate-900">Top Vendors by Leads</h2>
                        <button onClick={() => navigate('/admin-portal/vendors')} className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
                    </div>
                    {topVendors.length > 0 ? (
                        <div className="space-y-4">
                            {topVendors.map((v, i) => (
                                <div key={v.id} className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex flex-shrink-0 items-center justify-center">
                                        <BuildingStorefrontIcon className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">{v.name}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{[v.city, v.state].filter(Boolean).join(', ')}</p>
                                    </div>
                                    <span className="text-sm font-bold text-blue-600">{v.lead_count.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-300">
                            <BuildingStorefrontIcon className="w-10 h-10" />
                            <p className="text-xs text-slate-400">No vendor-lead assignments yet</p>
                        </div>
                    )}
                </div>

                {/* Lead Type Distribution — real donut */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h2 className="text-base font-bold text-slate-900 mb-2">Leads by Type</h2>
                    <p className="text-xs text-slate-400 mb-4">Breakdown by submission category</p>
                    {leadTypeDist.length > 0 ? (
                        <>
                            <div className="h-[160px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={leadTypeDist} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={2} dataKey="value" stroke="none">
                                            {leadTypeDist.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v, n) => [v.toLocaleString(), n]} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-xl font-bold text-slate-900">{totalLeads.toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Total</span>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                {leadTypeDist.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                            <span className="text-[10px] text-slate-600 font-medium truncate">{d.name}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-medium">{d.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-300">
                            <ChartBarIcon className="w-10 h-10" />
                            <p className="text-xs text-slate-400">No lead data yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Bottom Row ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Recent Leads Table — real from API */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-base font-bold text-slate-900">Recent Leads</h2>
                        <button onClick={() => navigate('/admin-portal/leads')} className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
                    </div>
                    {recentActivity.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="pb-3 text-xs font-bold text-slate-500">Name</th>
                                        <th className="pb-3 text-xs font-bold text-slate-500">Email</th>
                                        <th className="pb-3 text-xs font-bold text-slate-500">Vehicle / Part</th>
                                        <th className="pb-3 text-xs font-bold text-slate-500">Type</th>
                                        <th className="pb-3 text-xs font-bold text-slate-500 text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {recentActivity.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 text-sm font-bold text-slate-900">{row.name || '—'}</td>
                                            <td className="py-3 text-xs font-medium text-slate-500 truncate max-w-[140px]">{row.email || '—'}</td>
                                            <td className="py-3 text-xs font-medium text-slate-600">
                                                {[row.year, row.make, row.model].filter(Boolean).join(' ')}
                                                {row.part ? ` · ${row.part}` : ''}
                                            </td>
                                            <td className="py-3">
                                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${
                                                    row.lead_type === 'vendor'
                                                        ? 'bg-orange-50 text-orange-600'
                                                        : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                    {row.lead_type === 'vendor' ? 'Vendor' : 'Parts'}
                                                </span>
                                            </td>
                                            <td className="py-3 text-[10px] font-medium text-slate-400 text-right">{timeAgo(row.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-300">
                            <FireIcon className="w-8 h-8" />
                            <p className="text-sm text-slate-400">No leads yet</p>
                        </div>
                    )}
                </div>

                {/* Vendor State Distribution — real from API */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-base font-bold text-slate-900">Vendors by State</h2>
                        <button onClick={() => navigate('/admin-portal/vendors')} className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
                    </div>
                    {stats?.vendor_distribution?.length > 0 ? (
                        <div className="space-y-3">
                            {stats.vendor_distribution.slice(0, 8).map((item, i) => {
                                const max = stats.vendor_distribution[0]?.count || 1;
                                const pct = Math.round((item.count / max) * 100);
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-semibold text-slate-700">{item.state || 'Unknown'}</span>
                                            <span className="text-xs font-bold text-slate-900">{item.count.toLocaleString()}</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 rounded-full">
                                            <div
                                                className="h-1.5 bg-blue-500 rounded-full transition-all"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-300">
                            <BuildingStorefrontIcon className="w-8 h-8" />
                            <p className="text-sm text-slate-400">No vendor data yet</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
