import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  completed:             { label: 'Completed',          bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  failed:                { label: 'Failed',             bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',    dot: 'bg-red-500'   },
  pending:               { label: 'Pending',            bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',  dot: 'bg-amber-400' },
  gateway_request_sent:  { label: 'Gateway Sent',       bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',   dot: 'bg-blue-400'  },
  gateway_accepted:      { label: 'Gateway Accepted',   bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',   dot: 'bg-blue-500'  },
  authorized:            { label: 'Authorized',         bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200', dot: 'bg-indigo-500'},
  captured:              { label: 'Captured',           bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',   dot: 'bg-teal-500'  },
  refunded:              { label: 'Refunded',           bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200', dot: 'bg-purple-500'},
  partial_refund:        { label: 'Partial Refund',     bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200', dot: 'bg-violet-500'},
  voided:                { label: 'Voided',             bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200',  dot: 'bg-slate-400' },
  chargeback:            { label: 'Chargeback',         bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',   dot: 'bg-rose-600'  },
  draft:                 { label: 'Draft',              bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-200',  dot: 'bg-slate-300' },
  awaiting_webhook:      { label: 'Awaiting Webhook',   bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200',   dot: 'bg-cyan-400'  },
  webhook_received:      { label: 'Webhook Received',   bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200',   dot: 'bg-cyan-500'  },
  signature_verified:    { label: 'Sig. Verified',      bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',  dot: 'bg-green-500' },
  archived:              { label: 'Archived',           bg: 'bg-slate-50',   text: 'text-slate-400',   border: 'border-slate-100',  dot: 'bg-slate-300' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { label: status, bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
      {cfg.label}
    </span>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ title, value, sub, icon, color = 'blue', loading }) {
  const gradients = {
    blue:   'from-blue-500 to-indigo-600',
    green:  'from-emerald-500 to-teal-600',
    amber:  'from-amber-400 to-orange-500',
    red:    'from-red-500 to-rose-600',
    purple: 'from-purple-500 to-violet-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradients[color]} flex items-center justify-center text-white text-2xl flex-shrink-0 shadow-lg`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
        {loading ? (
          <div className="h-7 w-24 bg-slate-100 rounded-lg animate-pulse" />
        ) : (
          <p className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>{value}</p>
        )}
        {sub && <p className="text-xs text-slate-400 mt-0.5 font-medium">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Webhook status badge ─────────────────────────────────────────────────────
const WH_CFG = {
  verified:   { bg: 'bg-emerald-50', text: 'text-emerald-700', label: '✅ Verified' },
  processed:  { bg: 'bg-blue-50',    text: 'text-blue-700',    label: '✔️ Processed' },
  received:   { bg: 'bg-amber-50',   text: 'text-amber-700',   label: '⏳ Received' },
  invalid_sig:{ bg: 'bg-red-50',     text: 'text-red-700',     label: '⛔ Invalid Sig' },
  duplicate:  { bg: 'bg-slate-50',   text: 'text-slate-500',   label: '♻️ Duplicate' },
  failed:     { bg: 'bg-red-50',     text: 'text-red-700',     label: '❌ Failed' },
};

function WbBadge({ status }) {
  const c = WH_CFG[status] || { bg: 'bg-slate-50', text: 'text-slate-500', label: status };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
}

// ─── Filter pill ──────────────────────────────────────────────────────────────
function FilterSelect({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-sm px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
      >
        <option value="">All</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Main Payments Page ───────────────────────────────────────────────────────
export default function Payments() {
  const [stats, setStats]           = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [transactions, setTransactions] = useState([]);
  const [txnLoading, setTxnLoading]   = useState(true);
  const [txnPage, setTxnPage]         = useState(1);
  const [txnTotal, setTxnTotal]       = useState(0);
  const [txnTotalPages, setTxnTotalPages] = useState(1);

  // Filters
  const [filterStatus, setFilterStatus]         = useState('');
  const [filterSource, setFilterSource]         = useState('');
  const [filterEmail, setFilterEmail]           = useState('');
  const [filterStartDate, setFilterStartDate]   = useState('');
  const [filterEndDate, setFilterEndDate]       = useState('');
  const emailTimeout = useRef(null);

  const [webhooks, setWebhooks]   = useState([]);
  const [whLoading, setWhLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('transactions');

  // ── Fetch stats ──────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await api.adminPayments.getStats();
      setStats(data);
    } catch (e) {
      console.error('Stats fetch failed:', e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch transactions ────────────────────────────────────────────────────
  const fetchTransactions = useCallback(async (page = 1, extra = {}) => {
    setTxnLoading(true);
    try {
      const params = { page, page_size: 20, ...extra };
      if (filterStatus)    params.status        = filterStatus;
      if (filterSource)    params.source_module = filterSource;
      if (filterEmail)     params.user_email    = filterEmail;
      if (filterStartDate) params.start_date    = filterStartDate;
      if (filterEndDate)   params.end_date      = filterEndDate;
      const data = await api.adminPayments.listTransactions(params);
      setTransactions(data.results || []);
      setTxnTotal(data.count || 0);
      setTxnTotalPages(data.total_pages || 1);
      setTxnPage(page);
    } catch (e) {
      console.error('Transactions fetch failed:', e);
    } finally {
      setTxnLoading(false);
    }
  }, [filterStatus, filterSource, filterEmail, filterStartDate, filterEndDate]);

  // ── Fetch webhooks ────────────────────────────────────────────────────────
  const fetchWebhooks = useCallback(async () => {
    setWhLoading(true);
    try {
      const data = await api.adminPayments.listWebhooks({ page_size: 15 });
      setWebhooks(data.results || []);
    } catch (e) {
      console.error('Webhooks fetch failed:', e);
    } finally {
      setWhLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); fetchWebhooks(); }, [fetchStats, fetchWebhooks]);
  useEffect(() => { fetchTransactions(1); }, [fetchTransactions]);

  // Debounced email filter
  const handleEmailChange = (v) => {
    setFilterEmail(v);
    clearTimeout(emailTimeout.current);
    emailTimeout.current = setTimeout(() => fetchTransactions(1), 500);
  };

  const fmtMoney = (v) => {
    if (!v && v !== 0) return '—';
    return `$${parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const fmtDateTime = (v) => v ? new Date(v).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const sourceModuleOpts = [
    { value: 'vendor_ads',      label: 'Vendor Ad Subscription' },
    { value: 'yard_submission', label: 'Yard Submission Plan' },
    { value: 'manual',          label: 'Manual / Admin' },
  ];

  const statusOpts = Object.entries(STATUS_CFG).map(([v, c]) => ({ value: v, label: c.label }));

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <span className="text-xl">💳</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Financial Portal</h1>
            <p className="text-sm text-slate-400 font-medium">Real-time payment data from Authorize.Net gateway</p>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <KpiCard
          title="Total Revenue"
          value={fmtMoney(stats?.total_revenue)}
          sub={`${stats?.completed_count ?? '—'} completed txns`}
          icon="💰" color="green" loading={statsLoading}
        />
        <KpiCard
          title="This Month"
          value={fmtMoney(stats?.this_month_revenue)}
          sub={`${stats?.this_month_count ?? '—'} transactions`}
          icon="📅" color="blue" loading={statsLoading}
        />
        <KpiCard
          title="Avg. Transaction"
          value={fmtMoney(stats?.avg_transaction)}
          sub="Completed txns avg"
          icon="📊" color="purple" loading={statsLoading}
        />
        <KpiCard
          title="Pending"
          value={stats?.pending_count ?? '—'}
          sub="Awaiting capture"
          icon="⏳" color="amber" loading={statsLoading}
        />
        <KpiCard
          title="Failed / Refunded"
          value={`${stats?.failed_count ?? '—'} / ${stats?.refunded_count ?? '—'}`}
          sub="Failed · Refunded"
          icon="↩️" color="red" loading={statsLoading}
        />
      </div>

      {/* ── Source Module Breakdown ────────────────────────────────────── */}
      {stats?.by_source_module?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <h2 className="text-sm font-bold text-slate-700 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Revenue by Source Module</h2>
          <div className="flex flex-wrap gap-4">
            {stats.by_source_module.map(s => (
              <div key={s.module} className="flex-1 min-w-[160px] bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{s.module}</p>
                <p className="text-xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>{fmtMoney(s.revenue)}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.count} transactions</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
        {[['transactions', '💳 Transactions'], ['webhooks', '🔗 Webhooks']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Transactions Tab ──────────────────────────────────────────── */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-wrap gap-4 items-end">
              <FilterSelect label="Status" options={statusOpts} value={filterStatus} onChange={v => { setFilterStatus(v); }} />
              <FilterSelect label="Source" options={sourceModuleOpts} value={filterSource} onChange={v => { setFilterSource(v); }} />
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">User Email</label>
                <input
                  type="text"
                  placeholder="Search email..."
                  value={filterEmail}
                  onChange={e => handleEmailChange(e.target.value)}
                  className="text-sm px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all w-48"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Start Date</label>
                <input
                  type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)}
                  className="text-sm px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">End Date</label>
                <input
                  type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)}
                  className="text-sm px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
              <button
                onClick={() => fetchTransactions(1)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-blue-200 self-end"
              >
                Apply
              </button>
              <button
                onClick={() => {
                  setFilterStatus(''); setFilterSource(''); setFilterEmail('');
                  setFilterStartDate(''); setFilterEndDate('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-colors self-end"
              >
                Clear
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">{txnTotal.toLocaleString()} total records</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30">
                  {['ID', 'Status', 'Amount', 'User', 'Vendor', 'Source', 'Gateway Txn ID', 'Invoice #', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {txnLoading ? (
                  Array(8).fill(0).map((_, i) => (
                    <tr key={i}>
                      {Array(9).fill(0).map((__, j) => (
                        <td key={j} className="px-4 py-3.5">
                          <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <p className="text-slate-400 font-medium">No transactions found</p>
                      <p className="text-slate-300 text-xs mt-1">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : transactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-400">#{txn.id}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={txn.status} /></td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{fmtMoney(txn.amount)}</td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-[160px] truncate">{txn.user_email || '—'}</td>
                    <td className="px-4 py-3.5 text-slate-500 max-w-[140px] truncate">{txn.vendor_name || '—'}</td>
                    <td className="px-4 py-3.5">
                      {txn.source_module
                        ? <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold rounded-full">{txn.source_module_display || txn.source_module}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-400 max-w-[130px] truncate" title={txn.transaction_id}>{txn.transaction_id || '—'}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{txn.invoice_number || '—'}</td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">{fmtDate(txn.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {txnTotalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
              <p className="text-xs text-slate-400 font-medium">
                Page {txnPage} of {txnTotalPages} ({txnTotal.toLocaleString()} records)
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={txnPage <= 1}
                  onClick={() => fetchTransactions(txnPage - 1)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(7, txnTotalPages) }, (_, i) => {
                  const p = txnPage <= 4
                    ? i + 1
                    : txnPage >= txnTotalPages - 3
                    ? txnTotalPages - 6 + i
                    : txnPage - 3 + i;
                  if (p < 1 || p > txnTotalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => fetchTransactions(p)}
                      className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors ${txnPage === p ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  disabled={txnPage >= txnTotalPages}
                  onClick={() => fetchTransactions(txnPage + 1)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Webhooks Tab ──────────────────────────────────────────────── */}
      {activeTab === 'webhooks' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-700" style={{ fontFamily: "'Outfit', sans-serif" }}>Webhook Events</h2>
              <p className="text-xs text-slate-400 mt-0.5">Latest inbound gateway notifications</p>
            </div>
            <button onClick={fetchWebhooks} className="px-4 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-500">
              ↻ Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30">
                  {['Event ID', 'Gateway', 'Event Type', 'Status', 'Txn ID', 'Received At', 'Error'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {whLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <tr key={i}>{Array(7).fill(0).map((__, j) => (
                      <td key={j} className="px-4 py-3.5"><div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" /></td>
                    ))}</tr>
                  ))
                ) : webhooks.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-16 text-center text-slate-400 font-medium">No webhook events recorded</td></tr>
                ) : webhooks.map(wh => (
                  <tr key={wh.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-400 max-w-[120px] truncate" title={wh.event_id}>{wh.event_id}</td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-600">{wh.gateway}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500 max-w-[180px] truncate">{wh.event_type}</td>
                    <td className="px-4 py-3.5"><WbBadge status={wh.status} /></td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-400">{wh.transaction_id ? `#${wh.transaction_id}` : '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap">{fmtDateTime(wh.received_at)}</td>
                    <td className="px-4 py-3.5 text-xs text-red-500 max-w-[200px] truncate">{wh.error_detail || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
