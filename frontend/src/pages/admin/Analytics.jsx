import { useState, useEffect, useContext } from 'react';
import { api } from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import {
    ChartBarIcon,
    ArrowPathIcon,
    UsersIcon,
    DocumentTextIcon,
    ArrowRightCircleIcon,
    CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const DATE_RANGES = [
    { label: '7 Days', value: 7 },
    { label: '30 Days', value: 30 },
    { label: '90 Days', value: 90 },
    { label: 'All Time', value: 0 },
];

const METRICS = [
    {
        key: 'login',
        label: 'Total Logins',
        icon: UsersIcon,
        color: 'blue',
        bg: 'bg-blue-500',
        softBg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        ring: 'ring-blue-300',
        columns: ['#', 'Email', 'User Type', 'IP Address', 'Timestamp'],
        emptyIcon: '🔐',
        emptyMsg: 'No login events in this period.'
    },
    {
        key: 'signup',
        label: 'Total Signups',
        icon: ArrowRightCircleIcon,
        color: 'emerald',
        bg: 'bg-emerald-500',
        softBg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-600',
        ring: 'ring-emerald-300',
        columns: ['#', 'Email', 'User Type', 'IP Address', 'Timestamp'],
        emptyIcon: '👤',
        emptyMsg: 'No signups in this period.'
    },
    {
        key: 'lead_submit',
        label: 'Lead Submissions',
        icon: DocumentTextIcon,
        color: 'purple',
        bg: 'bg-purple-500',
        softBg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-600',
        ring: 'ring-purple-300',
        columns: ['#', 'Email', 'User Type', 'Details', 'Timestamp'],
        emptyIcon: '📋',
        emptyMsg: 'No lead submissions in this period.'
    },
];

function formatDate(str) {
    if (!str) return '—';
    return new Date(str).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });
}

function BadgeType({ type }) {
    const styles = {
        customer: 'bg-blue-50 text-blue-700 border-blue-200',
        vendor: 'bg-amber-50 text-amber-700 border-amber-200',
        admin: 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${styles[type] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
            {type || 'unknown'}
        </span>
    );
}

function describeError(err, fallback) {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
        return 'Your session no longer has access to analytics. Sign in as an administrator.';
    }
    if (status === 404) {
        return `${fallback} (HTTP 404: this server does not expose the analytics endpoint.)`;
    }
    if (status === 429) {
        return 'Too many requests. Wait a minute and retry.';
    }
    if (status) return `${fallback} (HTTP ${status})`;
    if (err?.code === 'ERR_NETWORK') return `${fallback} The server did not respond.`;
    return `${fallback} ${err?.message || ''}`.trim();
}

export default function AdminAnalytics() {
    const { token } = useContext(AuthContext);
    const [summary, setSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [summaryError, setSummaryError] = useState(null);

    const [activeMetric, setActiveMetric] = useState(null);
    const [daysRange, setDaysRange] = useState(30);

    const [detail, setDetail] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState(null);
    const [detailPage, setDetailPage] = useState(1);
    const [detailTotal, setDetailTotal] = useState(0);
    const PAGE_SIZE = 25;

    // ── Fetch summary counts ────────────────────────────────────────────────
    const fetchSummary = async () => {
        setSummaryLoading(true);
        setSummaryError(null);
        try {
            const data = await api.getSiteAnalyticsSummary(daysRange);
            setSummary(data);
        } catch (err) {
            setSummaryError(describeError(err, 'Could not load analytics summary.'));
        } finally {
            setSummaryLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchSummary();
        else setSummaryLoading(false);
    }, [token, daysRange]);

    // ── Fetch detail rows ────────────────────────────────────────────────────
    const fetchDetail = async (eventType, page, days) => {
        if (!token || !eventType) return;
        setDetailLoading(true);
        setDetailError(null);
        try {
            const { results, total } = await api.getSiteAnalyticsEvents({
                eventType, days, page, pageSize: PAGE_SIZE,
            });
            setDetail(results);
            setDetailTotal(total);
        } catch (err) {
            setDetailError(describeError(err, 'Could not load detail data.'));
            setDetail([]);
            setDetailTotal(0);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleMetricClick = (metricKey) => {
        const newMetric = activeMetric === metricKey ? null : metricKey;
        setActiveMetric(newMetric);
        setDetailPage(1);
        if (newMetric) fetchDetail(newMetric, 1, daysRange);
    };

    useEffect(() => {
        if (activeMetric) fetchDetail(activeMetric, detailPage, daysRange);
    }, [detailPage, daysRange]);

    const totalPages = Math.ceil(detailTotal / PAGE_SIZE);
    const activeConfig = METRICS.find(m => m.key === activeMetric);

    const summaryCount = (key) => summary ? (summary[key] ?? 0).toLocaleString() : '—';
    const rangeLabel = daysRange > 0 ? `the last ${daysRange} days` : 'all time';

    return (
        <div className="max-w-[1300px] mx-auto space-y-8">
            
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Site Analytics
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5 font-medium">
                        Track key engagement events across the platform. Click a card to drill down.
                        Both the counts and the rows below cover{' '}
                        <strong className="text-slate-700">{rangeLabel}</strong>.
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Date range selector */}
                    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                        {DATE_RANGES.map(r => (
                            <button
                                key={r.value}
                                onClick={() => {
                                    setDaysRange(r.value);
                                    setDetailPage(1);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${daysRange === r.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchSummary}
                        disabled={summaryLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${summaryLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* ── Summary Cards ── */}
            {summaryError ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3">
                    <span className="text-red-500 text-xl">⚠️</span>
                    <p className="text-red-700 font-semibold text-sm">{summaryError}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {METRICS.map((metric) => {
                        const isActive = activeMetric === metric.key;
                        const Icon = metric.icon;
                        return (
                            <button
                                key={metric.key}
                                onClick={() => handleMetricClick(metric.key)}
                                className={`group text-left w-full bg-white rounded-2xl border-2 p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                                    isActive
                                        ? `${metric.border} ring-2 ${metric.ring} shadow-md`
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? metric.bg : 'bg-slate-100 group-hover:' + metric.bg} transition-colors`}>
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} transition-colors`} />
                                    </div>
                                    {isActive && (
                                        <span className={`text-[10px] font-black uppercase tracking-wider ${metric.text} ${metric.softBg} px-2 py-1 rounded-full border ${metric.border}`}>
                                            Selected
                                        </span>
                                    )}
                                </div>
                                <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">{metric.label}</p>
                                {summaryLoading ? (
                                    <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg" />
                                ) : (
                                    <p className={`text-3xl font-black ${isActive ? metric.text : 'text-slate-900'} transition-colors`}
                                       style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        {summaryCount(metric.key)}
                                    </p>
                                )}
                                <p className="text-[11px] font-medium text-slate-400 mt-1.5">
                                    {isActive ? 'Click to collapse ↑' : 'Click to view details →'}
                                </p>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* ── Detail Table ── */}
            {activeConfig && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Table header */}
                    <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${activeConfig.softBg}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeConfig.bg}`}>
                                <activeConfig.icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {activeConfig.label} — Detail View
                                </h2>
                                <p className="text-[11px] text-slate-500 font-medium">
                                    {detailTotal.toLocaleString()} records
                                    {daysRange > 0 ? ` · Last ${daysRange} days` : ' · All time'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-500">
                                {DATE_RANGES.find(r => r.value === daysRange)?.label}
                            </span>
                        </div>
                    </div>

                    {/* Table body */}
                    {detailLoading ? (
                        <div className="p-8 flex flex-col items-center gap-3">
                            <div className="w-7 h-7 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                            <p className="text-sm text-slate-500 font-medium">Loading events…</p>
                        </div>
                    ) : detailError ? (
                        <div className="p-8 flex flex-col items-center gap-3">
                            <span className="text-2xl">⚠️</span>
                            <p className="text-sm font-semibold text-red-600">{detailError}</p>
                            <button
                                onClick={() => fetchDetail(activeMetric, detailPage, daysRange)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 underline"
                            >
                                Retry
                            </button>
                        </div>
                    ) : detail.length === 0 ? (
                        <div className="p-12 flex flex-col items-center gap-3 text-center">
                            <span className="text-4xl">{activeConfig.emptyIcon}</span>
                            <p className="text-base font-bold text-slate-700">{activeConfig.emptyMsg}</p>
                            <p className="text-xs text-slate-400 font-medium">Try extending the date range above.</p>
                        </div>
                    ) : (
                        <div className="max-h-[70vh] overflow-auto overscroll-contain">
                            <table className="w-full min-w-max text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {activeConfig.columns.map((col, i) => (
                                            <th key={i} className="sticky top-0 z-10 bg-slate-50 px-5 py-3 text-left text-[11px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {detail.map((row, idx) => (
                                        <tr key={row.id || idx} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-3.5 text-[12px] font-bold text-slate-400">
                                                {(detailPage - 1) * PAGE_SIZE + idx + 1}
                                            </td>
                                            <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">
                                                {row.user_email || <span className="text-slate-400 font-normal italic">Anonymous</span>}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <BadgeType type={row.user_type} />
                                            </td>
                                            <td className="px-5 py-3.5 text-[12px] font-mono text-slate-500">
                                                {activeMetric === 'lead_submit'
                                                    ? (row.metadata?.lead_type || JSON.stringify(row.metadata || {}).slice(0, 50))
                                                    : (row.ip_address || <span className="text-slate-400 italic">—</span>)
                                                }
                                            </td>
                                            <td className="px-5 py-3.5 text-[12px] font-medium text-slate-500 whitespace-nowrap">
                                                {formatDate(row.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <p className="text-xs font-medium text-slate-500">
                                Showing {Math.min((detailPage - 1) * PAGE_SIZE + 1, detailTotal)}–{Math.min(detailPage * PAGE_SIZE, detailTotal)} of {detailTotal.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setDetailPage(p => Math.max(1, p - 1))}
                                    disabled={detailPage <= 1}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    ← Prev
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pg = Math.max(1, Math.min(totalPages - 4, detailPage - 2)) + i;
                                    return (
                                        <button
                                            key={pg}
                                            onClick={() => setDetailPage(pg)}
                                            className={`w-8 h-8 text-xs font-bold rounded-lg border transition-all ${detailPage === pg ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            {pg}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setDetailPage(p => Math.min(totalPages, p + 1))}
                                    disabled={detailPage >= totalPages}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
