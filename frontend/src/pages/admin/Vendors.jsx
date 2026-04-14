import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { getLogoUrl } from '../../utils/imageUrl';
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
    ExclamationTriangleIcon,
    ArrowUpTrayIcon,
    ClockIcon,
    PlusIcon,
    ArrowDownTrayIcon,
    SparklesIcon,
    BoltIcon,
    ShieldCheckIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import ImportVendorsModal from '../../components/admin/ImportVendorsModal';
import ImportHistoryModal from '../../components/admin/ImportHistoryModal';

// Enhanced Toast Component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const config = {
        success: {
            bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
            border: 'border-emerald-200',
            text: 'text-emerald-800',
            icon: <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
        },
        error: {
            bg: 'bg-gradient-to-r from-red-50 to-rose-50',
            border: 'border-red-200',
            text: 'text-red-800',
            icon: <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
        },
        info: {
            bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            icon: <SparklesIcon className="h-5 w-5 text-blue-500" />
        }
    };

    const style = config[type] || config.info;

    return (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border-2 ${style.bg} ${style.border} ${style.text} animate-in slide-in-from-right duration-300`}>
            {style.icon}
            <p className="text-sm font-semibold">{message}</p>
            <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
                <XCircleIcon className="h-5 w-5" />
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
    const [activeTab, setActiveTab] = useState('all');

    const [editingVendor, setEditingVendor] = useState(null);
    const [creatingVendor, setCreatingVendor] = useState(false);
    const [saving, setSaving] = useState(false);
    const [resetCredentials, setResetCredentials] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    const [toast, setToast] = useState(null);
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
        trusted_vendor: false,
        is_active: false
    });

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

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

    const handleImportComplete = (result) => {
        showToast(`Import successful: ${result.stats.created} created, ${result.stats.updated} updated`, 'success');
        fetchVendors(1);
        setPage(1);
    };

    const handleRollbackComplete = (result) => {
        showToast('Rollback completed successfully', 'info');
        fetchVendors(1);
    };

    const toggleStatus = async (vendor) => {
        const action = vendor.is_active ? 'deactivate' : 'activate';
        if (vendor.is_active && !window.confirm(`Are you sure you want to deactivate ${vendor.name}? This will revoke their portal access.`)) return;

        try {
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

            fetchVendors(page);
        } catch (error) {
            console.error(error);
            showToast(`Failed to ${action} vendor: ${error.message || 'Unknown error'}`, 'error');
            fetchVendors(page);
        }
    };

    const handleResetPassword = async (vendor) => {
        // Check if vendor is active first
        if (!vendor.is_active) {
            showToast('Cannot reset password: Vendor must be activated first. Please activate the vendor and try again.', 'error');
            return;
        }

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
            // Provide user-friendly error messages
            let errorMessage = 'Failed to reset password';

            if (error.message.includes('No user account found') || error.message.includes('activate')) {
                errorMessage = 'Vendor account not found. Please activate the vendor first, then try resetting the password.';
            } else if (error.message.includes('404')) {
                errorMessage = 'Password reset endpoint not found. Please contact support.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            showToast(errorMessage, 'error');
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
            trusted_vendor: false,
            is_active: false
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, logo: file });
        }
    };

    const prepareSubmitData = (data) => {
        const submitData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'logo') {
                if (data[key] instanceof File) {
                    submitData.append('logo', data[key]);
                }
            } else if (data[key] !== null && data[key] !== undefined) {
                submitData.append(key, data[key]);
            }
        });
        return submitData;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const dataToSend = formData.logo instanceof File ? prepareSubmitData(formData) : formData;
            await api.createVendor(token, dataToSend);
            setCreatingVendor(false);
            showToast('Vendor created successfully!', 'success');
            fetchVendors(1);
            setPage(1);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            showToast(`Failed to create vendor: ${msg}`, 'error');
        } finally {
            setSaving(false);
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
            zip_code: vendor.zip_code || '',
            description: vendor.description || '',
            review_snippet: vendor.review_snippet || '',
            rating_stars: vendor.rating_stars || 5,
            rating_percentage: vendor.rating_percentage || 100,
            is_active: vendor.is_active || false,
            trusted_vendor: vendor.trusted_vendor || false
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const dataToSend = formData.logo instanceof File ? prepareSubmitData(formData) : formData;
            await api.updateVendor(token, editingVendor.id, dataToSend);
            setEditingVendor(null);
            showToast('Vendor details updated successfully', 'success');
            fetchVendors(page);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            showToast(`Failed to update vendor: ${msg}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading && vendors.length === 0) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#6366f1] mx-auto mb-4"></div>
                    <p className="text-[#6b7280] font-medium">Loading vendors...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Gradient Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#a855f7] rounded-2xl shadow-xl p-8">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>

                <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                            <BuildingStorefrontIcon className="h-8 w-8 text-slate-800" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Vendor Management</h1>
                            <p className="text-indigo-100 mt-1">
                                Manage automotive recyclers and their portal access
                            </p>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-4">
                            <div className="flex items-center gap-2 mb-1">
                                <SparklesIcon className="h-5 w-5 text-slate-800" />
                                <p className="text-xs text-indigo-100 font-medium">Total Vendors</p>
                            </div>
                            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-4">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircleIcon className="h-5 w-5 text-green-200" />
                                <p className="text-xs text-indigo-100 font-medium">Active</p>
                            </div>
                            <p className="text-3xl font-bold text-slate-800">{stats.active}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-4">
                            <div className="flex items-center gap-2 mb-1">
                                <XCircleIcon className="h-5 w-5 text-gray-200" />
                                <p className="text-xs text-indigo-100 font-medium">Inactive</p>
                            </div>
                            <p className="text-3xl font-bold text-slate-800">{stats.inactive}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Actions Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-[#e5e7eb]">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Status Filter Tabs */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-medium text-[#6b7280]">Filter:</span>
                        {['all', 'active', 'inactive'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab
                                    ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-slate-800 shadow-lg shadow-indigo-200'
                                    : 'bg-[#f9fafb] text-[#6b7280] hover:bg-[#e5e7eb]'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Search & Action Buttons */}
                    <div className="flex gap-3 w-full lg:w-auto flex-wrap">
                        <div className="relative flex-1 lg:w-64">
                            <input
                                type="text"
                                placeholder="Search vendors..."
                                className="w-full pl-11 pr-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#6366f1] focus:border-transparent bg-white text-sm transition-all"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                            <MagnifyingGlassIcon className="h-5 w-5 text-[#9ca3af] absolute left-3.5 top-3" />
                        </div>

                        <button
                            onClick={handleCreateClick}
                            className="px-4 py-2.5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-slate-800 rounded-xl hover:from-[#4f46e5] hover:to-[#7c3aed] font-medium shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <PlusIcon className="h-5 w-5" />
                            Add Vendor
                        </button>

                        <button
                            onClick={() => setShowImportModal(true)}
                            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-slate-800 rounded-xl hover:from-emerald-600 hover:to-green-600 font-medium shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <ArrowUpTrayIcon className="h-5 w-5" />
                            Import
                        </button>

                        <button
                            onClick={() => setShowHistoryModal(true)}
                            className="p-2.5 bg-white border border-[#e5e7eb] rounded-xl hover:bg-[#f9fafb] transition-all"
                            title="Import History"
                        >
                            <ClockIcon className="h-5 w-5 text-[#6b7280]" />
                        </button>

                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="px-4 py-2.5 bg-white border border-[#e5e7eb] text-[#374151] rounded-xl hover:bg-[#f9fafb] font-medium transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                        >
                            {exporting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#6366f1]"></div>
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

                {/* Results Count */}
                <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
                    <p className="text-sm text-[#6b7280]">
                        Showing <span className="font-semibold text-[#1f2937]">{((page - 1) * 50) + 1}</span>–<span className="font-semibold text-[#1f2937]">{Math.min(page * 50, totalVendors)}</span> of <span className="font-semibold text-[#1f2937]">{totalVendors}</span> vendors
                    </p>
                </div>
            </div>

            {/* Modern Table Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#e5e7eb]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-[#f9fafb] to-white border-b-2 border-[#e5e7eb]">
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Logo</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Vendor</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#6b7280] uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-[#6b7280] uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-[#6b7280] uppercase tracking-wider">Ad Plan</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-[#6b7280] uppercase tracking-wider">Leads</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-[#6b7280] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-[#6b7280] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f3f4f6]">
                            {loading ? (
                                <tr><td colSpan="9" className="px-6 py-12 text-center text-[#6b7280]">Loading vendor data...</td></tr>
                            ) : vendors.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-16 text-center">
                                        <BuildingStorefrontIcon className="h-16 w-16 mx-auto mb-4 text-[#d1d5db]" />
                                        <p className="text-[#6b7280] text-lg font-medium">No vendors found</p>
                                        <p className="text-[#9ca3af] text-sm mt-1">Try adjusting your filters</p>
                                    </td>
                                </tr>
                            ) : (
                                vendors.map((vendor) => (
                                    <tr key={vendor.id} className="group hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all">
                                        {/* Logo */}
                                        <td className="px-6 py-4">
                                            <div className="h-12 w-12 flex-shrink-0 bg-gradient-to-br from-[#f9fafb] to-white rounded-xl flex items-center justify-center overflow-hidden border-2 border-[#e5e7eb] shadow-sm">
                                                {vendor.logo ? (
                                                    <img
                                                        src={getLogoUrl(vendor.logo)}
                                                        alt=""
                                                        className="h-full w-full object-contain p-1"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <BuildingStorefrontIcon className="h-6 w-6 text-[#9ca3af]" />
                                                )}
                                            </div>
                                        </td>

                                        {/* Vendor Name & Username */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-bold text-[#1f2937] group-hover:text-[#6366f1] transition-colors">
                                                    {vendor.name}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <UserCircleIcon className="h-3.5 w-3.5 text-[#9ca3af]" />
                                                    <span className="text-xs text-[#6b7280]">{vendor.username || "No Access"}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Location */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <MapPinIcon className="h-4 w-4 text-[#6b7280]" />
                                                <div>
                                                    <p className="text-sm text-[#1f2937]">{vendor.city || "Unknown"}, {vendor.state}</p>
                                                    <p className="text-xs text-[#9ca3af]">{vendor.zip_code}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <EnvelopeIcon className="h-3.5 w-3.5 text-[#6b7280]" />
                                                    <span className="text-xs text-[#6b7280] truncate max-w-[150px]">{vendor.email || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <PhoneIcon className="h-3.5 w-3.5 text-[#6b7280]" />
                                                    <span className="text-xs text-[#6b7280]">{vendor.phone || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Description */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-[#6b7280] line-clamp-2 max-w-[200px]">
                                                {vendor.description || <span className="italic text-[#9ca3af]">No description</span>}
                                            </p>
                                        </td>

                                        {/* Rating */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <StarIcon
                                                            key={i}
                                                            className={`h-4 w-4 ${i < (vendor.rating_stars || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-semibold text-[#6b7280]">{vendor.rating_percentage || 0}%</span>
                                            </div>
                                        </td>

                                        {/* Ad Plan */}
                                        <td className="px-6 py-4 text-center">
                                            {vendor.ad_plan ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-50 to-fuchsia-50 text-fuchsia-600 border border-fuchsia-200">
                                                    {vendor.ad_plan.charAt(0).toUpperCase() + vendor.ad_plan.slice(1)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">None</span>
                                            )}
                                        </td>

                                        {/* Leads Count */}
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-br from-blue-50 to-indigo-50 text-[#6366f1] border border-blue-200 shadow-sm">
                                                {vendor.leads_count || 0}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${vendor.is_active
                                                ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200'
                                                : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200'
                                                }`}>
                                                <span className={`h-2 w-2 rounded-full ${vendor.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                                {vendor.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <button
                                                    onClick={() => handleEditClick(vendor)}
                                                    className="p-2 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-slate-800 rounded-lg hover:from-[#4f46e5] hover:to-[#7c3aed] transition-all shadow-md shadow-indigo-200"
                                                    title="Edit Details"
                                                >
                                                    <PencilSquareIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleResetPassword(vendor)}
                                                    disabled={!vendor.is_active}
                                                    className={`p-2 rounded-lg transition-all shadow-md ${vendor.is_active
                                                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-slate-800 hover:from-amber-600 hover:to-orange-600 shadow-amber-200 cursor-pointer'
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-gray-200'
                                                        }`}
                                                    title={vendor.is_active ? 'Reset Password' : 'Activate vendor first to reset password'}
                                                >
                                                    <KeyIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => toggleStatus(vendor)}
                                                    className={`p-2 rounded-lg transition-all shadow-md ${vendor.is_active
                                                        ? 'bg-gradient-to-br from-red-500 to-rose-500 text-slate-800 hover:from-red-600 hover:to-rose-600 shadow-red-200'
                                                        : 'bg-gradient-to-br from-emerald-500 to-green-500 text-slate-800 hover:from-emerald-600 hover:to-green-600 shadow-emerald-200'
                                                        }`}
                                                    title={vendor.is_active ? "Deactivate Account" : "Activate Account"}
                                                >
                                                    <PowerIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && vendors.length > 0 && (
                    <div className="px-6 py-4 border-t-2 border-[#e5e7eb] flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-[#f9fafb] to-white">
                        <div className="text-sm text-[#6b7280]">
                            Showing <span className="font-bold text-[#1f2937]">{((page - 1) * 50) + 1}</span>–<span className="font-bold text-[#1f2937]">{Math.min(page * 50, totalVendors)}</span> of <span className="font-bold text-[#1f2937]">{totalVendors}</span> vendors
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb] disabled:hover:bg-white"
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
                                            className={`px-3 py-2 text-sm font-bold rounded-xl transition-all ${page === pageNum
                                                ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-slate-800 shadow-lg shadow-indigo-200'
                                                : 'border-2 border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb]'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="sm:hidden text-sm text-[#6b7280] px-3">
                                Page {page} of {totalPages}
                            </div>

                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages}
                                className="px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb] disabled:hover:bg-white"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Vendor Modal */}
            {(creatingVendor || editingVendor) && (
                <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {creatingVendor ? 'Add New Vendor' : 'Edit Vendor'}
                            </h3>
                            <button
                                onClick={() => {
                                    setCreatingVendor(false);
                                    setEditingVendor(null);
                                }}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Vendor Name */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vendor Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter vendor name"
                                    />
                                </div>

                                {/* Address */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Street address"
                                    />
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="City"
                                    />
                                </div>

                                {/* State */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="State"
                                        maxLength={2}
                                    />
                                </div>

                                {/* ZIP Code */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ZIP Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.zip_code}
                                        onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="ZIP Code"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Phone number"
                                    />
                                </div>

                                {/* Email */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="contact@vendor.com"
                                    />
                                </div>

                                {/* Website */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="https://vendor.com"
                                    />
                                </div>

                                {/* Description */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Vendor description"
                                    />
                                </div>

                                {/* Status Toggles */}
                                <div className="col-span-2 space-y-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Active</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.trusted_vendor}
                                            onChange={(e) => setFormData({ ...formData, trusted_vendor: e.target.checked })}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Trusted Vendor</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button
                                onClick={() => {
                                    setCreatingVendor(false);
                                    setEditingVendor(null);
                                }}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={creatingVendor ? handleCreate : handleUpdate}
                                disabled={saving}
                                className="px-4 py-2 bg-indigo-600 text-slate-800 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                            >
                                {saving ? 'Saving...' : (creatingVendor ? 'Create Vendor' : 'Update Vendor')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Credentials Modal - Shows after activation or password reset */}
            {resetCredentials && (
                <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-indigo-100">
                        {/* Header */}
                        <div className="px-6 py-5 bg-gradient-to-r from-indigo-500 to-purple-600">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                    <KeyIcon className="h-6 w-6 text-slate-800" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Vendor Credentials</h3>
                                    <p className="text-indigo-100 text-sm mt-0.5">{resetCredentials.vendorName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-900">Important!</p>
                                        <p className="text-xs text-amber-700 mt-1">
                                            Save these credentials securely. The password will not be shown again.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Username */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                    Username
                                </label>
                                <div className="flex items-center justify-between gap-3">
                                    <code className="text-lg font-mono font-bold text-gray-900 break-all">
                                        {resetCredentials.username}
                                    </code>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(resetCredentials.username);
                                            showToast('Username copied!', 'success');
                                        }}
                                        className="flex-shrink-0 p-2 bg-white hover:bg-gray-50 rounded-lg border border-gray-300 transition-all"
                                        title="Copy username"
                                    >
                                        <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Temporary Password */}
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-200">
                                <label className="block text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">
                                    Temporary Password
                                </label>
                                <div className="flex items-center justify-between gap-3">
                                    <code className="text-lg font-mono font-bold text-indigo-900 break-all">
                                        {resetCredentials.temp_password}
                                    </code>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(resetCredentials.temp_password);
                                            showToast('Password copied!', 'success');
                                        }}
                                        className="flex-shrink-0 p-2 bg-white hover:bg-indigo-50 rounded-lg border-2 border-indigo-300 transition-all"
                                        title="Copy password"
                                    >
                                        <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                    Email
                                </label>
                                <p className="text-sm font-medium text-gray-900">{resetCredentials.email}</p>
                            </div>

                            {/* Portal URL */}
                            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                                <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                                    <LinkIcon className="h-4 w-4" />
                                    Vendor Portal URL
                                </label>
                                <a
                                    href="/vendor-portal"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 underline"
                                >
                                    {window.location.origin}/vendor-portal
                                </a>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setResetCredentials(null)}
                                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-slate-800 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg shadow-indigo-200 transition-all"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Vendors Modal */}
            <ImportVendorsModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImportComplete={handleImportComplete}
            />

            {/* Import History Modal */}
            <ImportHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                onRollbackComplete={handleRollbackComplete}
            />
        </div>
    );
}
