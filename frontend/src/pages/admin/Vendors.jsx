
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function AdminVendors() {
    const { token } = useContext(AuthContext);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingVendor, setEditingVendor] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        zip_code: ''
    });

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalVendors, setTotalVendors] = useState(0);

    const [statusFilter, setStatusFilter] = useState('all');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchVendors(page);
    }, [token, page, statusFilter]); // Re-fetch when page OR status changes

    const fetchVendors = async (pageNo) => {
        setLoading(true);
        try {
            const params = { page: pageNo, search: searchTerm };
            if (statusFilter !== 'all') {
                params.is_active = statusFilter === 'active';
            }
            const data = await api.getAdminVendors(token, params);
            setVendors(data.results || data);
            setTotalVendors(data.count || 0);
            setTotalPages(Math.ceil((data.count || 0) / 100)); // Assuming default page size is 100
        } catch (error) {
            console.error('Error fetching vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        if (page !== 1) setPage(1);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchVendors(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const params = {};
            if (statusFilter !== 'all') params.is_active = statusFilter === 'active';
            if (searchTerm) params.search = searchTerm;

            const blob = await api.exportVendors(token, params);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vendors_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Show success message (you can add toast notification here)
            alert('Vendors exported successfully!');
        } catch (error) {
            alert('Failed to export vendors');
        } finally {
            setExporting(false);
        }
    };


    const toggleStatus = async (vendor) => {
        if (!window.confirm(`Are you sure you want to ${vendor.is_active ? 'deactivate' : 'activate'} this vendor?`)) return;
        try {
            await api.updateVendor(token, vendor.id, { is_active: !vendor.is_active });
            fetchVendors(page);
        } catch (error) {
            alert('Failed to update vendor status');
        }
    };

    const handleEditClick = (vendor) => {
        setEditingVendor(vendor);
        setFormData({
            name: vendor.name,
            email: vendor.email || '',
            phone: vendor.phone || '',
            city: vendor.city || '',
            state: vendor.state || '',
            zip_code: vendor.zip_code || ''
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.updateVendor(token, editingVendor.id, formData);
            setEditingVendor(null);
            fetchVendors(page);
        } catch (error) {
            alert('Failed to update vendor details');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>

                <div className="flex gap-3 w-full sm:w-auto flex-wrap">
                    <button
                        onClick={handleExport}
                        disabled={exporting || vendors.length === 0}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                    >
                        {exporting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Exporting...
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export CSV
                            </>
                        )}
                    </button>

                    <select
                        className="border rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1); // Reset to page 1 on filter change
                        }}
                    >
                        <option value="all">All Vendors</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <div className="relative flex-1 sm:flex-none">
                        <input
                            type="text"
                            placeholder="Search vendors..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : vendors.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-4 text-center">No vendors found</td></tr>
                        ) : (
                            vendors.map((vendor) => (
                                <tr key={vendor.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{vendor.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {vendor.city}, {vendor.state} {vendor.zip_code}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>{vendor.email}</div>
                                        <div className="text-xs">{vendor.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vendor.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {vendor.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-3">
                                        <button
                                            onClick={() => handleEditClick(vendor)}
                                            className="text-blue-600 hover:text-blue-900 font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(vendor)}
                                            className={`${vendor.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                        >
                                            {vendor.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span> ({totalVendors} total users)
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${page === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${page === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingVendor && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Edit Vendor</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700">City</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">State</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                        value={formData.state}
                                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Zip</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                        value={formData.zip_code}
                                        onChange={e => setFormData({ ...formData, zip_code: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setEditingVendor(null)}
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
