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
            const backendError = error.response?.data?.error || error.message || '';
            let errorMessage = 'Failed to reset password';

            if (backendError.includes('No user account found') || backendError.includes('activate')) {
                errorMessage = 'Vendor account not found. Please activate the vendor first, then try resetting the password.';
            } else {
                errorMessage = backendError;
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
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-[#6b7280] font-medium">Loading vendors...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* ── Header ────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Vendor Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage automotive recyclers and their portal access.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total</span>
                        <span className="text-lg font-bold text-slate-900">{stats.total}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Active</span>
                        <span className="text-lg font-bold text-emerald-500">{stats.active}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Inactive</span>
                        <span className="text-lg font-bold text-slate-400">{stats.inactive}</span>
                    </div>
                </div>
            </div>

            {/* Filters & Actions Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Status Filter Tabs */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-medium text-[#6b7280]">Filter:</span>
                        {['all', 'active', 'inactive'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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
                                className="w-full pl-11 pr-4 py-2.5 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-sm transition-all"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                            <MagnifyingGlassIcon className="h-5 w-5 text-[#9ca3af] absolute left-3.5 top-3" />
                        </div>

                        <button
                            onClick={handleCreateClick}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-sm transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <PlusIcon className="h-5 w-5" />
                            Add Vendor
                        </button>

                        <button
                            onClick={() => setShowImportModal(true)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-semibold shadow-sm transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <ArrowUpTrayIcon className="h-5 w-5" />
                            Import
                        </button>

                        <button
                            onClick={() => setShowHistoryModal(true)}
                            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                            title="Import History"
                        >
                            <ClockIcon className="h-5 w-5 text-[#6b7280]" />
                        </button>

                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50 shadow-sm"
                        >
                            {exporting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
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
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-[#6b7280]">
                        Showing <span className="font-semibold text-[#1f2937]">{((page - 1) * 50) + 1}</span>–<span className="font-semibold text-[#1f2937]">{Math.min(page * 50, totalVendors)}</span> of <span className="font-semibold text-[#1f2937]">{totalVendors}</span> vendors
                    </p>
                </div>
            </div>

            {/* Modern Table Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Logo</th>
                                <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vendor</th>
                                <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ad Plan</th>
                                <th className="px-6 py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">Leads</th>
                                <th className="px-6 py-3 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
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
                                    <tr key={vendor.id} className="group hover:bg-slate-50 transition-colors">
                                        {/* Logo */}
                                        <td className="px-6 py-4">
                                            <div className="h-12 w-12 flex-shrink-0 bg-gradient-to-br from-[#f9fafb] to-white rounded-xl flex items-center justify-center overflow-hidden border-2 border-slate-100 shadow-sm">
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
                                                <p className="text-sm font-bold text-[#1f2937] group-hover:text-blue-600 transition-colors">
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
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-slate-50 to-fuchsia-50 text-fuchsia-600 border border-fuchsia-200">
                                                    {vendor.ad_plan.charAt(0).toUpperCase() + vendor.ad_plan.slice(1)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">None</span>
                                            )}
                                        </td>

                                        {/* Leads Count */}
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 border border-blue-200 shadow-sm">
                                                {vendor.leads_count || 0}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${vendor.is_active
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-rose-50 text-rose-600'
                                                    }`}>
                                                    {vendor.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                                {vendor.trusted_vendor && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-600">
                                                        <StarIcon className="h-3 w-3 text-amber-500" />
                                                        Trusted
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                {/* Edit */}
                                                <button
                                                    onClick={() => handleEditClick(vendor)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-semibold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 shadow-sm transition-all"
                                                    title="Edit Vendor"
                                                >
                                                    <PencilSquareIcon className="h-3.5 w-3.5" />
                                                    Edit
                                                </button>

                                                {/* Reset Password */}
                                                <button
                                                    onClick={() => handleResetPassword(vendor)}
                                                    disabled={!vendor.is_active}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold border shadow-sm transition-all ${
                                                        vendor.is_active
                                                            ? 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700'
                                                            : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                                    }`}
                                                    title={vendor.is_active ? 'Reset Password' : 'Activate vendor first'}
                                                >
                                                    <KeyIcon className="h-3.5 w-3.5" />
                                                    Reset PW
                                                </button>

                                                {/* Activate / Deactivate */}
                                                <button
                                                    onClick={() => toggleStatus(vendor)}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold border shadow-sm transition-all ${
                                                        vendor.is_active
                                                            ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                                                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                                    }`}
                                                    title={vendor.is_active ? 'Deactivate' : 'Activate'}
                                                >
                                                    <PowerIcon className="h-3.5 w-3.5" />
                                                    {vendor.is_active ? 'Deactivate' : 'Activate'}
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
                    <div className="px-6 py-4 border-t-2 border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-[#f9fafb] to-white">
                        <div className="text-sm text-[#6b7280]">
                            Showing <span className="font-bold text-[#1f2937]">{((page - 1) * 50) + 1}</span>–<span className="font-bold text-[#1f2937]">{Math.min(page * 50, totalVendors)}</span> of <span className="font-bold text-[#1f2937]">{totalVendors}</span> vendors
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-slate-100 text-[#374151] hover:bg-[#f9fafb] disabled:hover:bg-white"
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
                                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-slate-900 shadow-sm shadow-blue-200'
                                                : 'border-2 border-slate-100 text-[#374151] hover:bg-[#f9fafb]'
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
                                className="px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-slate-100 text-[#374151] hover:bg-[#f9fafb] disabled:hover:bg-white"
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
                    <div className="bg-white rounded-xl shadow-sm w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-slate-50">
                            <h3 className="text-lg font-semibold text-slate-900">
                                {creatingVendor ? 'Add New Vendor' : 'Edit Vendor'}
                            </h3>
                            <button
                                onClick={() => {
                                    setCreatingVendor(false);
                                    setEditingVendor(null);
                                }}
                                className="text-gray-400 hover:text-slate-400"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Vendor Name */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Vendor Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter vendor name"
                                    />
                                </div>

                                {/* Address */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Street address"
                                    />
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="City"
                                    />
                                </div>

                                {/* State */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="State"
                                        maxLength={2}
                                    />
                                </div>

                                {/* ZIP Code */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        ZIP Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.zip_code}
                                        onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="ZIP Code"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Phone number"
                                    />
                                </div>

                                {/* Email */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="contact@vendor.com"
                                    />
                                </div>

                                {/* Website */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="https://vendor.com"
                                    />
                                </div>

                                {/* Description */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Vendor description"
                                    />
                                </div>

                                {/* Status Toggles */}
                                <div className="col-span-2 space-y-3">
                                    {/* Active Toggle */}
                                    <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${formData.is_active ? 'bg-emerald-100' : 'bg-gray-200'}`}>
                                                <CheckCircleIcon className={`h-5 w-5 ${formData.is_active ? 'text-emerald-600' : 'text-gray-400'}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">Active</p>
                                                <p className="text-xs text-slate-400">Vendor is visible on the platform</p>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                className="sr-only"
                                            />
                                            <div
                                                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                                className={`w-11 h-6 rounded-full transition-all duration-300 cursor-pointer flex items-center px-0.5 ${formData.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                            >
                                                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${formData.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    </label>

                                    {/* Trusted Vendor Toggle — Premium Card */}
                                    <label
                                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${formData.trusted_vendor
                                            ? 'border-indigo-300 bg-gradient-to-r from-blue-50 to-slate-50 shadow-sm shadow-indigo-100'
                                            : 'border-slate-100 bg-gray-50 hover:border-blue-200 hover:bg-indigo-50/30'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${formData.trusted_vendor ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm shadow-blue-200' : 'bg-gray-200'}`}>
                                                <StarIcon className={`h-5 w-5 ${formData.trusted_vendor ? 'text-slate-900 fill-white' : 'text-gray-400'}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                    Trusted Vendor
                                                    {formData.trusted_vendor && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-blue-200">
                                                            ✓ Featured on Homepage
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {formData.trusted_vendor
                                                        ? 'Shown in the "Trusted Salvage Yards" section on the home page'
                                                        : 'Enable to show this vendor on the homepage trusted section'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="relative ml-4 flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={formData.trusted_vendor}
                                                onChange={(e) => setFormData({ ...formData, trusted_vendor: e.target.checked })}
                                                className="sr-only"
                                            />
                                            <div
                                                onClick={() => setFormData({ ...formData, trusted_vendor: !formData.trusted_vendor })}
                                                className={`w-12 h-6 rounded-full transition-all duration-300 cursor-pointer flex items-center px-0.5 ${formData.trusted_vendor ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-300'}`}
                                            >
                                                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${formData.trusted_vendor ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
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
                                className="px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={creatingVendor ? handleCreate : handleUpdate}
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-slate-900 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
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
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-blue-100">
                        {/* Header */}
                        <div className="px-6 py-5 bg-gradient-to-r from-blue-500 to-purple-600">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                    <KeyIcon className="h-6 w-6 text-slate-900" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Vendor Credentials</h3>
                                    <p className="text-blue-200 text-sm mt-0.5">{resetCredentials.vendorName}</p>
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
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-slate-100">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                                    Username
                                </label>
                                <div className="flex items-center justify-between gap-3">
                                    <code className="text-lg font-mono font-bold text-slate-900 break-all">
                                        {resetCredentials.username}
                                    </code>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(resetCredentials.username);
                                            showToast('Username copied!', 'success');
                                        }}
                                        className="flex-shrink-0 p-2 bg-white hover:bg-gray-50 rounded-lg border border-slate-200 transition-all"
                                        title="Copy username"
                                    >
                                        <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Temporary Password */}
                            <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-4 border-2 border-blue-200">
                                <label className="block text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">
                                    Temporary Password
                                </label>
                                <div className="flex items-center justify-between gap-3">
                                    <code className="text-lg font-mono font-bold text-blue-900 break-all">
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
                                        <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-slate-100">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                                    Email
                                </label>
                                <p className="text-sm font-medium text-slate-900">{resetCredentials.email}</p>
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
                        <div className="px-6 py-4 bg-gray-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setResetCredentials(null)}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-slate-900 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-sm shadow-blue-200 transition-all"
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
