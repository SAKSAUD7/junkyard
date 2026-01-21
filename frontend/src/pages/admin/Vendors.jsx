import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import {
    MagnifyingGlassIcon,
    PencilSquareIcon,
    TrashIcon,
    PowerIcon,
    KeyIcon,
    UserCircleIcon,
    BuildingStorefrontIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    XCircleIcon,
    CheckCircleIcon,
    LinkIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

// Simple Toast Component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    const icons = {
        success: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
        error: <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />,
        info: <div className="h-5 w-5 text-blue-500">i</div>
    };

    return (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${bgColors[type] || bgColors.info} animate-in slide-in-from-right duration-300`}>
            {icons[type]}
            <p className="text-sm font-medium">{message}</p>
            <button onClick={onClose} className="ml-2 hover:opacity-70">
                <XCircleIcon className="h-4 w-4" />
            </button>
        </div>
    );
};

export default function AdminVendors() {
    const { token } = useContext(AuthContext);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalVendors, setTotalVendors] = useState(0);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'inactive'

    // Edit & Modal States
    const [editingVendor, setEditingVendor] = useState(null);
    const [creatingVendor, setCreatingVendor] = useState(false);
    const [resetCredentials, setResetCredentials] = useState(null);
    const [exporting, setExporting] = useState(false);

    // Toast State
    const [toast, setToast] = useState(null);

    // Stats State
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

    const [formData, setFormData] = useState({
        yard_id: '',
        name: '',
        description: '',
        review_snippet: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        phone: '',
        email: '',
        website: '',
        profile_url: '',
        logo: '/images/logo-placeholder.png',
        rating: '100%',
        rating_stars: 5,
        rating_percentage: 100,
        is_top_rated: false,
        is_featured: false,
        is_trusted: false,
        is_active: false
    });

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    // Initial Load & Search
    useEffect(() => {
        fetchVendors(page);
    }, [token, page, activeTab]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (page !== 1) setPage(1);
            else fetchVendors(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Stats are loaded from the API during fetchVendors
    // No need for reactive calculation here


    const fetchVendors = async (pageNo) => {
        setLoading(true);
        try {
            const params = { page: pageNo, page_size: 50, search: searchTerm };
            if (activeTab !== 'all') {
                params.is_active = activeTab === 'active';
            }
            const data = await api.getAdminVendors(token, params);
            setVendors(data.results || data);

            const count = data.count || 0;
            setTotalVendors(count);
            setTotalPages(Math.ceil(count / 50));

            // Fetch accurate stats for all vendors
            const [allVendorsData, activeVendorsData, inactiveVendorsData] = await Promise.all([
                api.getAdminVendors(token, { page_size: 1 }).catch(() => ({ count: 0 })),
                api.getAdminVendors(token, { page_size: 1, is_active: true }).catch(() => ({ count: 0 })),
                api.getAdminVendors(token, { page_size: 1, is_active: false }).catch(() => ({ count: 0 }))
            ]);

            setStats({
                total: allVendorsData.count || 0,
                active: activeVendorsData.count || 0,
                inactive: inactiveVendorsData.count || 0
            });

        } catch (error) {
            console.error('Error fetching vendors:', error);
            showToast('Failed to load vendors', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => setSearchTerm(e.target.value);

    // --- Actions ---

    const handleExport = async () => {
        setExporting(true);
        try {
            const params = {};
            if (activeTab !== 'all') params.is_active = activeTab === 'active';
            if (searchTerm) params.search = searchTerm;
            const blob = await api.exportVendors(token, params);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vendors_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showToast('Export successful!', 'success');
        } catch (error) {
            showToast('Failed to export vendors', 'error');
        } finally {
            setExporting(false);
        }
    };

    const toggleStatus = async (vendor) => {
        const action = vendor.is_active ? 'deactivate' : 'activate';
        // Only confirm for deactivation to prevent accidental shutdowns
        if (vendor.is_active && !window.confirm(`Are you sure you want to deactivate ${vendor.name}? This will revoke their portal access.`)) return;

        try {
            // Optimistic update
            setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, is_active: !v.is_active } : v));

            const response = await api.updateVendor(token, vendor.id, { is_active: !vendor.is_active });

            if (!vendor.is_active && response.credentials) {
                setResetCredentials({ vendorName: vendor.name, ...response.credentials });
                showToast(`Vendor activated! Credentials generated for ${response.credentials.username}`, 'success');
            } else if (!vendor.is_active) {
                showToast('Vendor activated successfully!', 'success');
            } else {
                showToast('Vendor deactivated.', 'info');
            }

            fetchVendors(page); // Sync to be sure
        } catch (error) {
            console.error(error);
            showToast(`Failed to ${action} vendor: ${error.message || 'Unknown error'}`, 'error');
            fetchVendors(page); // Revert
        }
    };

    const handleResetPassword = async (vendor) => {
        if (!window.confirm(`Reset password for ${vendor.name}? This will generate a new temporary password.`)) return;
        try {
            const response = await api.resetVendorPassword(token, vendor.id);
            setResetCredentials({
                vendorName: vendor.name,
                username: response.username,
                email: response.email,
                temp_password: response.temp_password
            });
            showToast('Password reset successful', 'success');
        } catch (error) {
            console.error(error);
            showToast(`Failed to reset password: ${error.message || 'Error'}`, 'error');
        }
    };

    const handleCreateClick = () => {
        setCreatingVendor(true);
        setFormData({
            yard_id: '',
            name: '',
            description: '',
            review_snippet: '',
            address: '',
            city: '',
            state: '',
            zip_code: '',
            phone: '',
            email: '',
            website: '',
            profile_url: '',
            logo: '/images/logo-placeholder.png',
            rating: '100%',
            rating_stars: 5,
            rating_percentage: 100,
            is_top_rated: false,
            is_featured: false,
            is_trusted: false,
            is_active: false
        });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.createVendor(token, formData);
            setCreatingVendor(false);
            showToast('Vendor created successfully!', 'success');
            fetchVendors(1);
            setPage(1);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            showToast(`Failed to create vendor: ${msg}`, 'error');
        }
    };

    const handleEditClick = (vendor) => {
        setEditingVendor(vendor);
        setFormData({
            name: vendor.name,
            email: vendor.email || '',
            phone: vendor.phone || '',
            address: vendor.address || '',
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
            showToast('Vendor details updated successfully', 'success');
            fetchVendors(page);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            showToast(`Failed to update vendor: ${msg}`, 'error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Header & Stats */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vendor Management</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage automotive recyclers and their portal access.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 min-w-[120px]">
                            <p className="text-xs text-gray-500 font-medium uppercase">Total</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 min-w-[120px]">
                            <p className="text-xs text-gray-500 font-medium uppercase">Active</p>
                            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 min-w-[120px]">
                            <p className="text-xs text-gray-500 font-medium uppercase">Inactive</p>
                            <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">

                    {/* Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-lg self-start">
                        {['all', 'active', 'inactive'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Search & Actions */}
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, zip..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                        <button
                            onClick={handleCreateClick}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Vendor
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap"
                        >
                            {exporting ? 'Exporting...' : 'Export CSV'}
                        </button>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[220px]">Vendor</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[150px]">Location</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[200px]">Contact Info</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[140px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">Loading vendor data...</td></tr>
                                ) : vendors.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">No vendors found.</td></tr>
                                ) : (
                                    vendors.map((vendor) => (
                                        <tr key={vendor.id} className="hover:bg-gray-50 transition-colors group">

                                            {/* Vendor Name & Username */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                                        <BuildingStorefrontIcon className="h-5 w-5" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate max-w-[180px]" title={vendor.name}>
                                                            {vendor.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5" title="Username">
                                                            <UserCircleIcon className="h-3 w-3" />
                                                            {vendor.username || "No Access"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Location */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <div className="text-sm text-gray-900 flex items-center gap-1">
                                                        <MapPinIcon className="h-3.5 w-3.5 text-gray-400" />
                                                        {vendor.city || "Unknown City"}, {vendor.state}
                                                    </div>
                                                    <span className="text-xs text-gray-400 ml-5">{vendor.zip_code}</span>
                                                </div>
                                            </td>

                                            {/* Contact */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600" title={vendor.email}>
                                                        <EnvelopeIcon className="h-3.5 w-3.5 text-gray-400" />
                                                        <span className="truncate max-w-[180px]">{vendor.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <PhoneIcon className="h-3.5 w-3.5 text-gray-400" />
                                                        <span>{vendor.phone}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${vendor.is_active
                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                    : 'bg-red-50 text-red-700 border-red-200'
                                                    }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${vendor.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    {vendor.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex justify-end items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditClick(vendor)}
                                                        className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                        title="Edit Details"
                                                    >
                                                        <PencilSquareIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleResetPassword(vendor)}
                                                        className="p-1.5 rounded-lg text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                                                        title="Reset Password"
                                                    >
                                                        <KeyIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleStatus(vendor)}
                                                        className={`p-1.5 rounded-lg transition-colors ${vendor.is_active
                                                            ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                                                            : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                                                            }`}
                                                        title={vendor.is_active ? "Deactivate Account" : "Activate Account"}
                                                    >
                                                        <PowerIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {!loading && vendors.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
                            <div className="text-sm text-gray-600">
                                Showing <span className="font-semibold">{((page - 1) * 50) + 1}</span>–<span className="font-semibold">{Math.min(page * 50, totalVendors)}</span> of <span className="font-semibold">{totalVendors}</span> vendors
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 text-gray-700 hover:bg-gray-100 disabled:hover:bg-white"
                                >
                                    Previous
                                </button>

                                <div className="hidden sm:flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (page <= 3) {
                                            pageNum = i + 1;
                                        } else if (page >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = page - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${page === pageNum
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="sm:hidden text-sm text-gray-600 px-3">
                                    Page {page} of {totalPages}
                                </div>

                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === totalPages}
                                    className="px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 text-gray-700 hover:bg-gray-100 disabled:hover:bg-white"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Modals --- */}

            {/* Create Vendor Modal */}
            {creatingVendor && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden transform transition-all scale-100">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50">
                            <h3 className="text-lg font-semibold text-gray-900">Add New Vendor</h3>
                            <button onClick={() => setCreatingVendor(false)} className="text-gray-400 hover:text-gray-500">
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <form onSubmit={handleCreate} className="space-y-6" id="create-vendor-form">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Company Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="ABC Auto Recyclers"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Legacy Yard ID</label>
                                            <input
                                                type="number"
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                                value={formData.yard_id}
                                                onChange={e => setFormData({ ...formData, yard_id: e.target.value })}
                                                placeholder="Optional"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Profile URL Slug</label>
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                                value={formData.profile_url}
                                                onChange={e => setFormData({ ...formData, profile_url: e.target.value })}
                                                placeholder="abc-auto-recyclers"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <textarea
                                                rows="3"
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Brief description of the vendor's services..."
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Review Snippet</label>
                                            <textarea
                                                rows="2"
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                                value={formData.review_snippet}
                                                onChange={e => setFormData({ ...formData, review_snippet: e.target.value })}
                                                placeholder="Featured review or testimonial..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="contact@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="(555) 123-4567"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                            <input
                                                type="url"
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                                value={formData.website}
                                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</h4>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="123 Main Street"
                                        />
                                    </div>
                                    <div className="grid grid-cols-6 gap-4">
                                        <div className="col-span-6 md:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                City <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                                value={formData.city}
                                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                placeholder="Phoenix"
                                            />
                                        </div>
                                        <div className="col-span-3 md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                State <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                maxLength="2"
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border uppercase"
                                                value={formData.state}
                                                onChange={e => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                                                placeholder="AZ"
                                            />
                                        </div>
                                        <div className="col-span-3 md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                ZIP <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                                value={formData.zip_code}
                                                onChange={e => setFormData({ ...formData, zip_code: e.target.value })}
                                                placeholder="85001"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Profile & Branding */}
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Profile & Branding</h4>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                            value={formData.logo}
                                            onChange={e => setFormData({ ...formData, logo: e.target.value })}
                                            placeholder="/images/logo-placeholder.png"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Path to vendor logo image</p>
                                    </div>
                                </div>

                                {/* Rating & Trust */}
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating & Trust Badges</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating Stars (1-5)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="5"
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                                value={formData.rating_stars}
                                                onChange={e => setFormData({ ...formData, rating_stars: parseInt(e.target.value) || 5 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating %</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                                value={formData.rating_percentage}
                                                onChange={e => setFormData({ ...formData, rating_percentage: parseInt(e.target.value) || 100 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating Text</label>
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                                value={formData.rating}
                                                onChange={e => setFormData({ ...formData, rating: e.target.value })}
                                                placeholder="100%"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={formData.is_top_rated}
                                                onChange={e => setFormData({ ...formData, is_top_rated: e.target.checked })}
                                            />
                                            <span className="text-sm text-gray-700">Top Rated</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={formData.is_featured}
                                                onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                                            />
                                            <span className="text-sm text-gray-700">Featured</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={formData.is_trusted}
                                                onChange={e => setFormData({ ...formData, is_trusted: e.target.checked })}
                                            />
                                            <span className="text-sm text-gray-700">Trusted Vendor</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</h4>
                                    <div className="flex items-center gap-3">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={formData.is_active}
                                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            <span className="ml-3 text-sm font-medium text-gray-700">
                                                {formData.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </label>
                                        <p className="text-xs text-gray-500">(Inactive vendors hidden from public)</p>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Form Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setCreatingVendor(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="create-vendor-form"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
                            >
                                Create Vendor
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingVendor && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden transform transition-all scale-100">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-900">Edit Vendor Profile</h3>
                            <button onClick={() => setEditingVendor(null)} className="text-gray-400 hover:text-gray-500">
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-6">
                            {/* Company Info */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location Info */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</h4>
                                <div className="grid grid-cols-6 gap-4">
                                    <div className="col-span-6 md:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-3 md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                            value={formData.state}
                                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-3 md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                            value={formData.zip_code}
                                            onChange={e => setFormData({ ...formData, zip_code: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingVendor(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Credentials Modal - Enhanced */}
            {resetCredentials && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform animate-in fade-in zoom-in duration-200">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <KeyIcon className="h-6 w-6 text-blue-200" />
                                Credentials Generated
                            </h2>
                            <button
                                onClick={() => setResetCredentials(null)}
                                className="text-blue-100 hover:text-white transition-colors"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                                <div className="text-blue-600 flex-shrink-0 mt-0.5">
                                    <CheckCircleIcon className="w-5 h-5" />
                                </div>
                                <p className="text-sm text-blue-800">
                                    Copy these credentials now. The password will not be visible again.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="text-center pb-2 border-b border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900">{resetCredentials.vendorName}</h3>
                                    <p className="text-sm text-gray-500">Access Credentials</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="group bg-gray-50 hover:bg-white hover:shadow-md border border-gray-200 rounded-xl p-3 transition-all cursor-pointer" onClick={() => { navigator.clipboard.writeText(resetCredentials.username); showToast('Username copied!', 'success') }}>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Username</label>
                                        <code className="text-sm font-mono text-gray-900 block break-all">{resetCredentials.username}</code>
                                    </div>

                                    <div className="group bg-gray-50 hover:bg-white hover:shadow-md border border-gray-200 rounded-xl p-3 transition-all cursor-pointer" onClick={() => { navigator.clipboard.writeText(resetCredentials.email); showToast('Email copied!', 'success') }}>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Login Email</label>
                                        <code className="text-sm font-mono text-gray-900 block break-all">{resetCredentials.email}</code>
                                    </div>

                                    <div className="group bg-yellow-50 hover:bg-yellow-50/80 border border-yellow-200 rounded-xl p-4 cursor-pointer" onClick={() => { navigator.clipboard.writeText(resetCredentials.temp_password); showToast('Password copied!', 'success') }}>
                                        <label className="text-xs font-bold text-yellow-700 uppercase tracking-wider block mb-1 flex justify-between">
                                            New Password
                                            <span className="text-[10px] bg-yellow-200/50 px-1.5 py-0.5 rounded text-yellow-800">CLICK TO COPY</span>
                                        </label>
                                        <code className="text-xl font-bold font-mono text-gray-900 block tracking-wider">{resetCredentials.temp_password}</code>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
                            <a
                                href="/vendor/login"
                                target="_blank"
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                            >
                                <LinkIcon className="h-3 w-3" />
                                Go to Vendor Login
                            </a>
                            <button
                                onClick={() => setResetCredentials(null)}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium shadow-sm transition-transform active:scale-95"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
