import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import {
    XCircleIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    DocumentArrowDownIcon,
    ArrowUturnLeftIcon,
    ClockIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function ImportHistoryModal({ isOpen, onClose, onRollbackComplete }) {
    const { token } = useContext(AuthContext);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Rollback state
    const [rollingBack, setRollingBack] = useState(null); // batch ID
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchHistory(1);
        }
    }, [isOpen]);

    const fetchHistory = async (pageNo) => {
        setLoading(true);
        try {
            const data = await api.vendorImport.history(token, { page: pageNo, page_size: 10 });
            setBatches(data.results);
            setTotalCount(data.count);
            setTotalPages(data.total_pages);
            setPage(data.page);
        } catch (err) {
            console.error('Failed to fetch history:', err);
            setError('Failed to load import history');
        } finally {
            setLoading(false);
        }
    };

    const handleRollback = async (batch) => {
        if (!window.confirm(`Are you sure you want to rollback import "${batch.filename}"? This will delete created vendors and revert updated ones.`)) {
            return;
        }

        setRollingBack(batch.batch_id);
        setError(null);

        try {
            const result = await api.vendorImport.rollback(token, batch.batch_id);
            alert(`Rollback successful: ${result.stats.deleted} vendors deleted, ${result.stats.restored} restored.`);
            fetchHistory(page); // Refresh list
            if (onRollbackComplete) onRollbackComplete(result);
        } catch (err) {
            console.error('Rollback failed:', err);
            alert('Rollback failed: ' + (err.message || 'Unknown error'));
        } finally {
            setRollingBack(null);
        }
    };

    const handleDownloadError = async (batchId) => {
        try {
            const blob = await api.vendorImport.downloadErrorReport(token, batchId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `import_errors_${batchId}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Failed to download error report');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden transform transition-all scale-100 flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <ClockIcon className="h-5 w-5 text-gray-500" />
                            Import History
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">Manage previous imports and rollbacks</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <XCircleIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-0">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
                        </div>
                    ) : batches.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                            No import history found.
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & File</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {batches.map((batch) => (
                                    <tr key={batch.batch_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{batch.filename}</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(batch.created_at).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5">
                                                by {batch.uploaded_by}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${batch.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    batch.status === 'rolled_back' ? 'bg-gray-100 text-gray-800' :
                                                        batch.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {batch.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="text-xs text-gray-500 flex flex-col gap-1">
                                                <span className="text-gray-900 font-medium">{batch.total_rows} Total</span>
                                                <span className="text-green-600">{batch.valid_rows} Valid</span>
                                                {batch.invalid_rows > 0 && <span className="text-red-600">{batch.invalid_rows} Invalid</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                {batch.invalid_rows > 0 && (
                                                    <button
                                                        onClick={() => handleDownloadError(batch.batch_id)}
                                                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100"
                                                        title="Download Error Report"
                                                    >
                                                        <DocumentArrowDownIcon className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Errors</span>
                                                    </button>
                                                )}

                                                {(batch.status === 'completed' || batch.status === 'failed') && (
                                                    <button
                                                        onClick={() => handleRollback(batch)}
                                                        disabled={rollingBack === batch.batch_id}
                                                        className={`flex items-center gap-1 px-2 py-1 rounded border ${rollingBack === batch.batch_id
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : 'text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-transparent'
                                                            }`}
                                                        title="Rollback this import"
                                                    >
                                                        {rollingBack === batch.batch_id ? (
                                                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <ArrowUturnLeftIcon className="h-4 w-4" />
                                                        )}
                                                        <span className="hidden sm:inline">Rollback</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
