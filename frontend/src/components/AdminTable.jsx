/**
 * AdminTable — Shared JYNM Admin table component.
 *
 * Usage:
 *   <AdminTable
 *     columns={[{ key: 'name', label: 'Name' }, ...]}
 *     data={rows}
 *     loading={loading}
 *     error={error}
 *     onRetry={fetchData}
 *     emptyIcon="📭"
 *     emptyTitle="No records found"
 *     pageSize={pageSize}
 *     onPageSizeChange={setPageSize}
 *     currentPage={page}
 *     totalCount={total}
 *     onPageChange={setPage}
 *     renderActions={(row) => <ActionButtons ... />}
 *   />
 */
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const PAGE_SIZES = [25, 50, 75, 100];

function Skeleton({ rows = 5, cols = 5 }) {
    return (
        <tbody>
            {Array.from({ length: rows }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                    {Array.from({ length: cols }).map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                            <div className="h-4 bg-slate-100 rounded-lg animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    );
}

export function StatusBadge({ status }) {
    const map = {
        active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        new: 'bg-blue-50 text-blue-700 border-blue-200',
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        under_review: 'bg-amber-50 text-amber-700 border-amber-200',
        draft: 'bg-slate-50 text-slate-600 border-slate-200',
        inactive: 'bg-slate-50 text-slate-500 border-slate-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
        deleted: 'bg-red-50 text-red-700 border-red-200',
        resolved: 'bg-purple-50 text-purple-700 border-purple-200',
        read: 'bg-slate-50 text-slate-500 border-slate-200',
        unread: 'bg-blue-50 text-blue-700 border-blue-200',
        contacted: 'bg-purple-50 text-purple-700 border-purple-200',
    };
    const style = status ? (map[status.toLowerCase()] || 'bg-slate-50 text-slate-600 border-slate-200') : 'bg-slate-50 text-slate-600 border-slate-200';
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${style}`}>
            {status || '—'}
        </span>
    );
}

export function ActionBtn({ onClick, color = 'blue', title, children, disabled = false }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100',
        green: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-100',
        red: 'bg-red-50 text-red-600 hover:bg-red-100 border-red-100',
        slate: 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200',
    };
    return (
        <button
            onClick={onClick}
            title={title}
            disabled={disabled}
            className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${colors[color] || colors.blue} disabled:opacity-40 disabled:cursor-not-allowed`}
        >
            {children}
        </button>
    );
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Delete', confirmColor = 'red' }) {
    if (!open) return null;
    const btnColors = {
        red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500/20',
        amber: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/20',
        blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/20',
    };
    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-red-500 text-lg">⚠️</span>
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 text-base mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</h3>
                        <p className="text-sm text-slate-500 font-medium">{message}</p>
                    </div>
                </div>
                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                    <button onClick={onConfirm} className={`px-4 py-2 text-sm font-bold text-white rounded-xl focus:ring-2 transition-colors shadow-sm ${btnColors[confirmColor] || btnColors.red}`}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminTable({
    columns = [],
    data = [],
    loading = false,
    error = null,
    onRetry,
    emptyIcon = '📭',
    emptyTitle = 'No records found',
    emptyDesc = 'Try adjusting your search or filters.',
    pageSize = 25,
    onPageSizeChange,
    currentPage = 1,
    totalCount = 0,
    onPageChange,
    renderActions,
    // Optional: override entire row render
    renderRow,
    className = '',
}) {
    const totalPages = Math.ceil(totalCount / pageSize);
    const showing = {
        from: Math.min((currentPage - 1) * pageSize + 1, totalCount),
        to: Math.min(currentPage * pageSize, totalCount),
    };

    // Page numbers to show (max 5)
    const pagesToShow = () => {
        const start = Math.max(1, Math.min(totalPages - 4, currentPage - 2));
        return Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);
    };

    return (
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
            {/* ── Top controls: page-size selector ─────────────────────────── */}
            {onPageSizeChange && (
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60">
                    <p className="text-xs font-medium text-slate-500">
                        {loading ? 'Loading…' : `${totalCount.toLocaleString()} records`}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Show</span>
                        <div className="relative">
                            <select
                                value={pageSize}
                                onChange={e => { onPageSizeChange(Number(e.target.value)); onPageChange?.(1); }}
                                className="appearance-none pl-3 pr-7 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                                {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <span className="text-xs font-bold text-slate-500">per page</span>
                    </div>
                </div>
            )}

            {/* ── Error state ───────────────────────────────────────────────── */}
            {error && (
                <div className="p-8 flex flex-col items-center gap-3">
                    <span className="text-3xl">⚠️</span>
                    <p className="text-sm font-semibold text-red-600">{error}</p>
                    {onRetry && (
                        <button onClick={onRetry} className="text-xs font-bold text-blue-600 hover:text-blue-700 underline">Retry</button>
                    )}
                </div>
            )}

            {/* ── Table ─────────────────────────────────────────────────────── */}
            {!error && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                {columns.map(col => (
                                    <th
                                        key={col.key || col.label}
                                        className={`px-5 py-3 text-left text-[11px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap ${col.className || ''}`}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                                {renderActions && (
                                    <th className="px-5 py-3 text-right text-[11px] font-black text-slate-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>

                        {loading ? (
                            <Skeleton rows={Math.min(pageSize, 6)} cols={columns.length + (renderActions ? 1 : 0)} />
                        ) : data.length === 0 ? (
                            <tbody>
                                <tr>
                                    <td colSpan={columns.length + (renderActions ? 1 : 0)}>
                                        <div className="py-16 flex flex-col items-center gap-3 text-center">
                                            <span className="text-4xl">{emptyIcon}</span>
                                            <p className="text-base font-bold text-slate-700">{emptyTitle}</p>
                                            <p className="text-xs text-slate-400 font-medium">{emptyDesc}</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody className="divide-y divide-slate-50">
                                {data.map((row, idx) =>
                                    renderRow ? renderRow(row, idx) : (
                                        <tr key={row.id || idx} className="hover:bg-slate-50/70 transition-colors">
                                            {columns.map(col => (
                                                <td key={col.key || col.label} className={`px-5 py-3.5 ${col.cellClass || ''}`}>
                                                    {col.render ? col.render(row, idx) : (
                                                        <span className="text-sm font-medium text-slate-700">
                                                            {row[col.key] ?? '—'}
                                                        </span>
                                                    )}
                                                </td>
                                            ))}
                                            {renderActions && (
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {renderActions(row, idx)}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    )
                                )}
                            </tbody>
                        )}
                    </table>
                </div>
            )}

            {/* ── Bottom pagination ─────────────────────────────────────────── */}
            {!error && !loading && totalPages > 1 && onPageChange && (
                <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
                    <p className="text-xs font-medium text-slate-500 order-2 sm:order-1">
                        Showing {showing.from.toLocaleString()}–{showing.to.toLocaleString()} of {totalCount.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1.5 order-1 sm:order-2">
                        <button
                            onClick={() => onPageChange(1)}
                            disabled={currentPage <= 1}
                            className="px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            «
                        </button>
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            ← Prev
                        </button>
                        {pagesToShow().map(pg => (
                            <button
                                key={pg}
                                onClick={() => onPageChange(pg)}
                                className={`w-8 h-8 text-xs font-bold rounded-lg border transition-all ${currentPage === pg ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                            >
                                {pg}
                            </button>
                        ))}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Next →
                        </button>
                        <button
                            onClick={() => onPageChange(totalPages)}
                            disabled={currentPage >= totalPages}
                            className="px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            »
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
