import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import {
    MagnifyingGlassIcon,
    XMarkIcon,
    CurrencyDollarIcon,
    TagIcon,
    TruckIcon,
    CalendarIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    SparklesIcon,
    DocumentTextIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

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
            const queryParams = {
                page: pageNo,
                page_size: 50,
            };

            if (searchTerm) {
                queryParams.search = searchTerm;
            }

            const data = await api.getPartPricing(queryParams);

            // Response data is already JSON from api service
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
            const queryParams = {};
            if (searchTerm) queryParams.search = searchTerm;

            const blob = await api.exportPartPricing(queryParams);

            // Blob is returned directly
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-5 flex justify-between items-center rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Part Pricing Details</h2>
                        <p className="text-sm text-slate-500 mt-1">Hollander #{item.hollander_number}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div>
                        <h3 className="text-lg font-bold text-[#1f2937] mb-4 flex items-center gap-2">
                            <TagIcon className="h-5 w-5 text-[#6366f1]" />
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-[#e5e7eb]">
                                <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">Hollander Number</label>
                                <p className="text-lg font-bold text-[#1f2937]">{item.hollander_number}</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-[#e5e7eb]">
                                <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">Part Name</label>
                                <p className="text-lg font-bold text-[#1f2937]">{item.part_name || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Info */}
                    <div>
                        <h3 className="text-lg font-bold text-[#1f2937] mb-4 flex items-center gap-2">
                            <TruckIcon className="h-5 w-5 text-[#10b981]" />
                            Vehicle Information
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-[#e5e7eb]">
                                <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">Make</label>
                                <p className="text-sm font-semibold text-[#1f2937]">{item.make || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-[#e5e7eb]">
                                <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">Model</label>
                                <p className="text-sm font-semibold text-[#1f2937]">{item.model || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#f9fafb] to-white rounded-xl p-4 border border-[#e5e7eb]">
                                <label className="block text-xs font-bold text-[#6b7280] mb-1 uppercase tracking-wide">Year Range</label>
                                <p className="text-sm font-semibold text-[#1f2937]">{item.year_start} - {item.year_end}</p>
                            </div>
                        </div>
                    </div>

                    {/* Prices */}
                    <div>
                        <h3 className="text-lg font-bold text-[#1f2937] mb-4 flex items-center gap-2">
                            <CurrencyDollarIcon className="h-5 w-5 text-[#f59e0b]" />
                            Pricing Information
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border-2 border-emerald-200 shadow-sm">
                                <label className="block text-xs font-bold text-emerald-700 mb-2 uppercase tracking-wide">New Price</label>
                                <p className="text-2xl font-bold text-emerald-600">
                                    {item.new_price ? `$${parseFloat(item.new_price).toFixed(2)}` : 'N/A'}
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200 shadow-sm">
                                <label className="block text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide">WOW Price</label>
                                <p className="text-2xl font-bold text-blue-600">
                                    {item.wow_price ? `$${parseFloat(item.wow_price).toFixed(2)}` : 'N/A'}
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200 shadow-sm">
                                <label className="block text-xs font-bold text-purple-700 mb-2 uppercase tracking-wide">CTS Price</label>
                                <p className="text-2xl font-bold text-purple-600">
                                    {item.cts_price ? `$${parseFloat(item.cts_price).toFixed(2)}` : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    {item.all_options && (
                        <div>
                            <h3 className="text-lg font-bold text-[#1f2937] mb-4 flex items-center gap-2">
                                <Cog6ToothIcon className="h-5 w-5 text-[#6366f1]" />
                                All Options
                            </h3>
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                                <p className="text-sm text-[#1f2937] whitespace-pre-wrap">{item.all_options}</p>
                            </div>
                        </div>
                    )}

                    {/* Individual Options */}
                    <div>
                        <h3 className="text-lg font-bold text-[#1f2937] mb-4">Individual Options</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => {
                                const optionValue = item[`option${num}`];
                                if (!optionValue) return null;
                                return (
                                    <div key={num} className="bg-white border-2 border-[#e5e7eb] p-3 rounded-xl hover:border-[#6366f1] transition-colors">
                                        <label className="text-xs font-bold text-[#6b7280] uppercase tracking-wide">Option {num}</label>
                                        <p className="text-sm text-[#1f2937] mt-1">{optionValue}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading && pricing.length === 0) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#6366f1] mx-auto mb-4"></div>
                    <p className="text-[#6b7280] font-medium">Loading pricing data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* ── Header ────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Part Pricing Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage part pricing data and Hollander numbers.</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <DocumentTextIcon className="h-4 w-4 text-slate-400" />
                        <p className="text-xs text-slate-500">Total Records</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{totalRecords.toLocaleString()}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <SparklesIcon className="h-4 w-4 text-blue-500" />
                        <p className="text-xs text-slate-500">Current Page</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{page} / {totalPages}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <TagIcon className="h-4 w-4 text-emerald-500" />
                        <p className="text-xs text-slate-500">Per Page</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">50</p>
                </div>
            </div>

            {/* Search & Export Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-[#e5e7eb]">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search by Hollander number, make, model, or part name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#6366f1] focus:border-transparent bg-white text-sm transition-all"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-[#9ca3af] absolute left-3.5 top-3" />
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2 text-sm font-semibold shadow-sm transition-all whitespace-nowrap"
                    >
                        {exporting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                                Exporting...
                            </>
                        ) : (
                            <>
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                Export CSV
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Modern Table Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#e5e7eb]">
                {loading ? (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-[#6366f1] mb-4"></div>
                        <p className="text-[#6b7280] font-medium">Loading pricing data...</p>
                    </div>
                ) : pricing.length === 0 ? (
                    <div className="text-center py-16">
                        <CurrencyDollarIcon className="h-16 w-16 mx-auto mb-4 text-[#d1d5db]" />
                        <p className="text-[#6b7280] text-lg font-medium">No pricing data found</p>
                        <p className="text-[#9ca3af] text-sm mt-1">Try adjusting your search</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-[#f9fafb] to-white border-b-2 border-[#e5e7eb]">
                                        <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Hollander #</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Make</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Model</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Part</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Year Range</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">New Price</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Options</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f3f4f6]">
                                    {pricing.map((item) => (
                                        <tr key={item.id} className="group hover:bg-slate-50 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                                                        #
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900">{item.hollander_number}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-[#1f2937] font-medium">{item.make || '-'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-[#1f2937] font-medium">{item.model || '-'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-[#6b7280]">{item.part_name || '-'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <CalendarIcon className="h-4 w-4 text-[#6b7280]" />
                                                    <span className="text-sm text-[#1f2937]">{item.year_start} - {item.year_end}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.new_price ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-semibold bg-emerald-50 text-emerald-700">
                                                        <CurrencyDollarIcon className="h-3.5 w-3.5" />
                                                        ${parseFloat(item.new_price).toFixed(2)}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-[#6b7280] max-w-xs truncate">
                                                    {item.all_options || '-'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setSelectedItem(item)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-semibold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 shadow-sm transition-all"
                                                >
                                                    <EyeIcon className="h-3.5 w-3.5" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50">
                            <div className="text-sm text-slate-500">
                                Showing <span className="font-semibold text-slate-900">{(page - 1) * 50 + 1}</span> to <span className="font-semibold text-slate-900">{Math.min(page * 50, totalRecords)}</span> of <span className="font-semibold text-slate-900">{totalRecords}</span> results
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
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
