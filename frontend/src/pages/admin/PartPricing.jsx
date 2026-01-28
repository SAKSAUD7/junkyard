import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function AdminPartPricing() {
    const { token } = useContext(AuthContext);
    const [pricing, setPricing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [selectedItem, setSelectedItem] = useState(null);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchPricing(page);
    }, [token, page]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (page !== 1) setPage(1);
            else fetchPricing(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchPricing = async (pageNo) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pageNo,
                page_size: 50,
            });

            if (searchTerm) {
                params.append('search', searchTerm);
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/api/part-pricing/?${params}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch pricing data');

            const data = await response.json();
            setPricing(data.results || []);
            setTotalRecords(data.count || 0);
            setTotalPages(Math.ceil((data.count || 0) / 50));
        } catch (error) {
            console.error('Error fetching pricing:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/api/part-pricing/export_csv/?${params}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `part_pricing_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data');
        } finally {
            setExporting(false);
        }
    };

    const DetailModal = ({ item, onClose }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Part Pricing Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Hollander Number</label>
                            <p className="text-lg font-semibold text-gray-900">{item.hollander_number}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Part Name</label>
                            <p className="text-lg font-semibold text-gray-900">{item.part_name || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Make</label>
                            <p className="text-gray-900">{item.make || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Model</label>
                            <p className="text-gray-900">{item.model || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Year Range</label>
                            <p className="text-gray-900">{item.year_start} - {item.year_end}</p>
                        </div>
                    </div>

                    {/* Prices */}
                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                            <label className="text-sm font-medium text-gray-500">New Price</label>
                            <p className="text-lg font-bold text-green-600">
                                {item.new_price ? `$${parseFloat(item.new_price).toFixed(2)}` : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">WOW Price</label>
                            <p className="text-lg font-bold text-blue-600">
                                {item.wow_price ? `$${parseFloat(item.wow_price).toFixed(2)}` : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">CTS Price</label>
                            <p className="text-lg font-bold text-purple-600">
                                {item.cts_price ? `$${parseFloat(item.cts_price).toFixed(2)}` : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Options */}
                    {item.all_options && (
                        <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">Options</label>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-900 whitespace-pre-wrap">{item.all_options}</p>
                            </div>
                        </div>
                    )}

                    {/* Individual Options */}
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => {
                            const optionValue = item[`option${num}`];
                            if (!optionValue) return null;
                            return (
                                <div key={num} className="border border-gray-200 p-2 rounded">
                                    <label className="text-xs font-medium text-gray-500">Option {num}</label>
                                    <p className="text-sm text-gray-900">{optionValue}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Part Pricing</h1>
                <p className="text-gray-600 mt-1">Manage part pricing data and Hollander numbers</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm font-medium text-gray-500">Total Records</div>
                    <div className="text-3xl font-bold text-gray-900 mt-2">{totalRecords.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm font-medium text-gray-500">Current Page</div>
                    <div className="text-3xl font-bold text-blue-600 mt-2">{page} / {totalPages}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm font-medium text-gray-500">Records per Page</div>
                    <div className="text-3xl font-bold text-green-600 mt-2">50</div>
                </div>
            </div>

            {/* Search and Export */}
            <div className="bg-white rounded-lg shadow mb-6 p-4">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Hollander number, make, model, or part name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                    >
                        {exporting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Exporting...
                            </>
                        ) : (
                            <>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export CSV
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Loading pricing data...</p>
                    </div>
                ) : pricing.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No pricing data found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hollander #</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Make</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year Range</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pricing.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {item.hollander_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.make || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.model || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{item.part_name || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.year_start} - {item.year_end}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                                {item.new_price ? `$${parseFloat(item.new_price).toFixed(2)}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                {item.all_options || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => setSelectedItem(item)}
                                                    className="text-blue-600 hover:text-blue-900 font-medium"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(page - 1) * 50 + 1}</span> to{' '}
                                        <span className="font-medium">{Math.min(page * 50, totalRecords)}</span> of{' '}
                                        <span className="font-medium">{totalRecords}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                            Page {page} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Detail Modal */}
            {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
        </div>
    );
}
