import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import {
    PlusIcon,
    MegaphoneIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    PhotoIcon,
    VideoCameraIcon,
    ChartBarIcon,
    CalendarIcon,
    CursorArrowRaysIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';

export default function AdminAds() {
    const { token } = useContext(AuthContext);
    const [ads, setAds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [slotFilter, setSlotFilter] = useState('all');
    const [planFilter, setPlanFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPlansModal, setShowPlansModal] = useState(false);
    const [plansLoading, setPlansLoading] = useState(false);
    const [adPlans, setAdPlans] = useState([]);
    const [adPlansRecordId, setAdPlansRecordId] = useState(null);
    const [editingAd, setEditingAd] = useState(null);
    const [fetchError, setFetchError] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        redirect_url: '',
        page: 'home',
        slot: 'carousel_1',
        template_type: 'standard',
        button_text: 'Visit Website',
        show_badge: true,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        priority: 1,
        is_active: true
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);

    useEffect(() => {
        const storedToken = token || localStorage.getItem('access_token');
        if (storedToken) {
            fetchAds();
        } else {
            setLoading(false);
            setFetchError('session_expired');
        }
    }, [token]);

    const fetchAds = async () => {
        try {
            setFetchError(null);
            const data = await api.getAdminAds(token);
            setAds(data.results || data);
        } catch (error) {
            console.error('Error fetching ads:', error);
            const status = error?.response?.status;
            if (status === 403 || status === 401) {
                setFetchError('session_expired');
            } else {
                setFetchError('generic');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAdPlans = async () => {
        setPlansLoading(true);
        try {
            const data = await api.cms.getAllContent({ cms_page: 'vendor_portal' });
            const results = data.results || data;
            const plansRecord = results.find(item => item.key === 'ad_plans');
            if (plansRecord && plansRecord.value) {
                setAdPlansRecordId(plansRecord.id);
                try {
                    setAdPlans(JSON.parse(plansRecord.value));
                } catch (e) {
                    setAdPlans([]);
                }
            } else {
                setAdPlansRecordId(null);
                setAdPlans([
                    { id: 'premium', name: 'Premium', price: 99 },
                    { id: 'standard', name: 'Standard', price: 49 },
                    { id: 'compact', name: 'Compact', price: 29 },
                    { id: 'minimal', name: 'Minimal', price: 19 }
                ]);
            }
        } catch (e) {
            console.error('Failed to fetch ad plans:', e);
        } finally {
            setPlansLoading(false);
        }
    };

    const handleSavePlans = async () => {
        try {
            const payloadValue = JSON.stringify(adPlans);
            if (adPlansRecordId) {
                await api.cms.updateContent(adPlansRecordId, { value: payloadValue });
            } else {
                await api.cms.createContent({
                    page: 'vendor_portal',
                    key: 'ad_plans',
                    value: payloadValue,
                    type: 'json'
                });
            }
            setShowPlansModal(false);
        } catch (error) {
            console.error('Error saving ad plans:', error);
            alert('Failed to save subscription plans.');
        }
    };

    const SLOT_GROUPS = [
        { key: 'all',            label: 'All Slots',             color: 'bg-slate-700 text-white',               dimColor: 'bg-slate-50 text-slate-600 border border-slate-200',        match: () => true },
        { key: 'strip_top',      label: 'Strip — Top',           color: 'bg-orange-500 text-white',              dimColor: 'bg-orange-50 text-orange-600 border border-orange-200',     match: (s) => s === 'strip_top' },
        { key: 'strip_bottom',   label: 'Strip — Bottom',        color: 'bg-teal-500 text-white',                dimColor: 'bg-teal-50 text-teal-600 border border-teal-200',           match: (s) => s === 'strip_bottom' },
        { key: 'strip_home_mid', label: 'Strip — Home Middle',   color: 'bg-sky-500 text-white',                 dimColor: 'bg-sky-50 text-sky-600 border border-sky-200',             match: (s) => s === 'strip_home_mid' },
        { key: 'carousel_1',     label: 'Carousel 1 (Top)',       color: 'bg-blue-600 text-white',                dimColor: 'bg-blue-50 text-blue-600 border border-blue-200',           match: (s) => s === 'carousel_1' },
        { key: 'carousel_2',     label: 'Carousel 2',             color: 'bg-violet-600 text-white',              dimColor: 'bg-violet-50 text-violet-600 border border-violet-200',     match: (s) => s === 'carousel_2' },
        { key: 'carousel_3',     label: 'Carousel 3 (Middle)',    color: 'bg-emerald-600 text-white',             dimColor: 'bg-emerald-50 text-emerald-600 border border-emerald-200', match: (s) => s === 'carousel_3' },
        { key: 'carousel_4',     label: 'Carousel 4',             color: 'bg-amber-500 text-white',               dimColor: 'bg-amber-50 text-amber-600 border border-amber-200',        match: (s) => s === 'carousel_4' },
        { key: 'carousel_5',     label: 'Carousel 5 (Bottom)',    color: 'bg-pink-600 text-white',                dimColor: 'bg-pink-50 text-pink-600 border border-pink-200',           match: (s) => s === 'carousel_5' },
    ];

    const PLAN_GROUPS = [
        { key: 'all',      label: 'All Plans', icon: '🗂',  color: 'bg-slate-700 text-white',              dimColor: 'bg-slate-50 text-slate-600 border border-slate-200' },
        { key: 'premium',  label: 'Premium',   icon: '👑',  color: 'bg-gradient-to-r from-slate-800 to-slate-900 text-white', dimColor: 'bg-slate-100 text-slate-700 border border-slate-300' },
        { key: 'standard', label: 'Standard',  icon: '⭐',  color: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white', dimColor: 'bg-blue-50 text-blue-700 border border-blue-200' },
        { key: 'compact',  label: 'Compact',   icon: '🔶',  color: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white', dimColor: 'bg-amber-50 text-amber-700 border border-amber-200' },
        { key: 'minimal',  label: 'Minimal',   icon: '⬜',  color: 'bg-slate-400 text-white',              dimColor: 'bg-slate-50 text-slate-500 border border-slate-200' },
    ];

    const activeSlotGroup = SLOT_GROUPS.find(g => g.key === slotFilter) || SLOT_GROUPS[0];

    const filteredAds = ads.filter(ad => {
        const matchesSearch = !searchTerm ||
            ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ad.page?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ad.slot?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSlot = activeSlotGroup.match(ad.slot);
        const matchesPlan = planFilter === 'all' || (ad.template_type || '').toLowerCase() === planFilter;
        return matchesSearch && matchesSlot && matchesPlan;
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4'];
            if (!validTypes.includes(file.type)) {
                alert('Invalid file type. Please upload JPG, PNG, WebP, or MP4 files.');
                return;
            }

            const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
            if (file.size > maxSize) {
                alert(`File too large. Max size: ${file.type.startsWith('video/') ? '50MB' : '10MB'}`);
                return;
            }

            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('redirect_url', formData.redirect_url);
            submitData.append('page', formData.page);
            submitData.append('slot', formData.slot);
            submitData.append('template_type', formData.template_type);
            submitData.append('button_text', formData.button_text);
            submitData.append('show_badge', formData.show_badge);
            submitData.append('is_active', formData.is_active);

            if (formData.start_date) submitData.append('start_date', formData.start_date);
            if (formData.end_date) submitData.append('end_date', formData.end_date);
            if (formData.priority) submitData.append('priority', formData.priority);

            if (selectedFile) {
                submitData.append('image', selectedFile);
            }

            if (editingAd) {
                await api.updateAd(token, editingAd.id, submitData);
            } else {
                await api.createAd(token, submitData);
            }
            setShowModal(false);
            setEditingAd(null);
            setFormData({
                title: '',
                redirect_url: '',
                page: 'home',
                slot: 'carousel_1',
                template_type: 'standard',
                button_text: 'Visit Website',
                show_badge: true,
                start_date: '',
                end_date: '',
                priority: 1,
                is_active: true
            });
            setSelectedFile(null);
            setFilePreview(null);
            fetchAds();
        } catch (error) {
            console.error('[Admin Ads] Save error:', error);
            const errorDetail = error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message;
            alert(errorDetail || 'Failed to save ad. Check console for details.');
        }
    };

    const handleEdit = (ad) => {
        setEditingAd(ad);
        setFormData({
            title: ad.title,
            redirect_url: ad.redirect_url,
            page: ad.page,
            slot: ad.slot,
            template_type: ad.template_type || 'standard',
            button_text: ad.button_text || 'Visit Website',
            show_badge: ad.show_badge !== undefined ? ad.show_badge : true,
            start_date: ad.start_date,
            end_date: ad.end_date || '',
            priority: ad.priority,
            is_active: ad.is_active
        });
        if (ad.image) {
            setFilePreview(ad.image);
        }
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this ad?')) return;
        try {
            await api.deleteAd(token, id);
            fetchAds();
        } catch (error) {
            alert('Failed to delete ad');
        }
    };

    const getPositionBadge = (page, slot) => {
        if (slot === 'strip_top')      return { label: `${page} Strip Top`,    color: 'bg-orange-50 text-orange-600' };
        if (slot === 'strip_bottom')   return { label: `${page} Strip Bottom`, color: 'bg-teal-50 text-teal-600' };
        if (slot === 'strip_home_mid') return { label: 'Home Strip Mid',        color: 'bg-sky-50 text-sky-600' };
        if (slot === 'carousel_1')     return { label: 'Carousel 1 (Top)',      color: 'bg-blue-50 text-blue-600' };
        if (slot === 'carousel_2')     return { label: 'Carousel 2',            color: 'bg-violet-50 text-violet-600' };
        if (slot === 'carousel_3')     return { label: 'Carousel 3 (Mid)',      color: 'bg-emerald-50 text-emerald-600' };
        if (slot === 'carousel_4')     return { label: 'Carousel 4',            color: 'bg-amber-50 text-amber-600' };
        if (slot === 'carousel_5')     return { label: 'Carousel 5 (Bottom)',   color: 'bg-pink-50 text-pink-600' };
        return { label: `${page} - ${slot}`, color: 'bg-slate-50 text-slate-600' };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-[#6b7280] font-medium">Loading ads...</p>
                </div>
            </div>
        );
    }

    if (fetchError === 'session_expired') {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 max-w-md">
                    <svg className="w-12 h-12 text-amber-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Session Expired or Unauthorized</h3>
                    <p className="text-sm text-slate-500 mb-6">Your admin session has expired or you don't have permission to manage ads. Please log in again.</p>
                    <a href="/admin/login" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all">
                        Sign In Again
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ── Header ────────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Ad Management</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {ads.length} active campaigns
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 sm:min-w-[240px]">
                        <input
                            type="text"
                            placeholder="Search ads by title, page, slot..."
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <MegaphoneIcon className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                    <button
                        onClick={() => { fetchAdPlans(); setShowPlansModal(true); }}
                        className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 text-sm font-semibold transition-all flex items-center gap-2"
                    >
                        Subscription Plans
                    </button>
                    <button
                        onClick={() => { setEditingAd(null); setSelectedFile(null); setFilePreview(null); setShowModal(true); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Create Ad
                    </button>
                </div>
            </div>

            {/* ── Filter Bar ───────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">

                {/* Slot filter row */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <FunnelIcon className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter by Slot</span>
                        {slotFilter !== 'all' && (
                            <button onClick={() => setSlotFilter('all')} className="ml-auto text-blue-500 hover:text-blue-700 font-semibold flex items-center gap-1 text-xs">
                                <XMarkIcon className="h-3 w-3" /> Clear
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {SLOT_GROUPS.map(group => {
                            const count = group.key === 'all'
                                ? ads.filter(a => planFilter === 'all' || (a.template_type || '').toLowerCase() === planFilter).length
                                : ads.filter(a => group.match(a.slot) && (planFilter === 'all' || (a.template_type || '').toLowerCase() === planFilter)).length;
                            const isActive = slotFilter === group.key;
                            return (
                                <button
                                    key={group.key}
                                    onClick={() => setSlotFilter(group.key)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                                        isActive ? group.color + ' shadow-sm scale-105' : group.dimColor + ' hover:opacity-80'
                                    }`}
                                >
                                    {group.label}
                                    <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                                        isActive ? 'bg-white/25 text-inherit' : 'bg-slate-200 text-slate-500'
                                    }`}>{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100" />

                {/* Plan filter row */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-slate-400 text-sm">💎</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter by Plan</span>
                        {planFilter !== 'all' && (
                            <button onClick={() => setPlanFilter('all')} className="ml-auto text-blue-500 hover:text-blue-700 font-semibold flex items-center gap-1 text-xs">
                                <XMarkIcon className="h-3 w-3" /> Clear
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {PLAN_GROUPS.map(plan => {
                            const count = plan.key === 'all'
                                ? ads.filter(a => activeSlotGroup.match(a.slot)).length
                                : ads.filter(a => (a.template_type || '').toLowerCase() === plan.key && activeSlotGroup.match(a.slot)).length;
                            const isActive = planFilter === plan.key;
                            return (
                                <button
                                    key={plan.key}
                                    onClick={() => setPlanFilter(plan.key)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                                        isActive ? plan.color + ' shadow-sm scale-105' : plan.dimColor + ' hover:opacity-80'
                                    }`}
                                >
                                    <span>{plan.icon}</span>
                                    {plan.label}
                                    <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                                        isActive ? 'bg-white/20 text-inherit' : 'bg-slate-200 text-slate-500'
                                    }`}>{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* Ads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAds.length === 0 ? (
                    <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center border border-slate-100">
                        <MegaphoneIcon className="h-16 w-16 mx-auto mb-4 text-[#d1d5db]" />
                        <p className="text-[#6b7280] text-lg">No ads found</p>
                        <p className="text-[#9ca3af] text-base mt-2">Adjust your search or create a new ad.</p>
                    </div>
                ) : (
                    filteredAds.map((ad) => {
                        const positionBadge = getPositionBadge(ad.page, ad.slot);
                        return (
                            <div
                                key={ad.id}
                                className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 hover:shadow-sm transition-all group"
                            >
                                {/* Ad Preview */}
                                <div className="relative h-48 bg-gradient-to-br from-[#f9fafb] to-[#f3f4f6] flex items-center justify-center overflow-hidden">
                                    {ad.image ? (
                                        ad.image.endsWith('.mp4') ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-[#1f2937]">
                                                <VideoCameraIcon className="h-16 w-16 text-slate-900/50" />
                                                <span className="absolute bottom-3 right-3 bg-black/70 text-slate-900 text-xs px-2 py-1 rounded">Video</span>
                                            </div>
                                        ) : (
                                            <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                                        )
                                    ) : (
                                        <div className="text-center">
                                            <PhotoIcon className="h-16 w-16 mx-auto text-[#d1d5db] mb-2" />
                                            <p className="text-sm text-[#9ca3af]">No media</p>
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ad.is_active ? 'bg-[#d1fae5] text-[#065f46]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>
                                            {ad.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    {/* Position Badge */}
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${positionBadge.color}`}>
                                            {positionBadge.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Ad Info */}
                                <div className="p-5">
                                    <h3 className="text-lg font-semibold text-[#1f2937] mb-2 truncate">{ad.title}</h3>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-[#f9fafb] rounded-xl p-3 border border-slate-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CursorArrowRaysIcon className="h-4 w-4 text-blue-600" />
                                                <span className="text-xs text-[#6b7280]">Clicks</span>
                                            </div>
                                            <p className="text-lg font-bold text-[#1f2937]">{ad.clicks || 0}</p>
                                        </div>
                                        <div className="bg-[#f9fafb] rounded-xl p-3 border border-slate-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <ChartBarIcon className="h-4 w-4 text-[#10b981]" />
                                                <span className="text-xs text-[#6b7280]">Priority</span>
                                            </div>
                                            <p className="text-lg font-bold text-[#1f2937]">{ad.priority}</p>
                                        </div>
                                    </div>

                                    {/* Duration */}
                                    <div className="bg-[#f9fafb] rounded-xl p-3 border border-slate-100 mb-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CalendarIcon className="h-4 w-4 text-[#f59e0b]" />
                                            <span className="text-xs text-[#6b7280]">Duration</span>
                                        </div>
                                        <p className="text-sm text-[#1f2937]">
                                            {ad.start_date} → {ad.end_date || 'Forever'}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(ad)}
                                            className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                                        >
                                            <PencilIcon className="h-3 w-3" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ad.id)}
                                            className="flex-1 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                                        >
                                            <TrashIcon className="h-3 w-3" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center rounded-t-2xl">
                            <div>
                                <h2 className="text-xl font-semibold text-[#1f2937]">{editingAd ? 'Edit Ad' : 'Create New Ad'}</h2>
                                <p className="text-sm text-[#6b7280]">Configure your ad campaign</p>
                            </div>
                            <button
                                onClick={() => { setShowModal(false); setSelectedFile(null); setFilePreview(null); }}
                                className="text-[#9ca3af] hover:text-[#6b7280] transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">Ad Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-sm"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter ad title"
                                />
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">Ad Media</label>
                                <div className="border-2 border-dashed border-slate-100 rounded-xl p-6 text-center hover:border-blue-600 transition-colors">
                                    {filePreview ? (
                                        <div className="relative">
                                            {selectedFile?.type.startsWith('video/') || filePreview.endsWith('.mp4') ? (
                                                <video src={filePreview} controls className="max-w-full h-auto rounded-lg mx-auto" />
                                            ) : (
                                                <img src={filePreview} alt="Preview" className="max-w-full h-auto rounded-lg mx-auto" />
                                            )}
                                            <button
                                                type="button"
                                                onClick={handleRemoveFile}
                                                className="absolute top-2 right-2 bg-[#dc2626] text-slate-900 rounded-full p-2 hover:bg-[#b91c1c] shadow-sm"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <PhotoIcon className="h-12 w-12 mx-auto text-[#9ca3af] mb-3" />
                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.webp,.mp4"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="file-upload"
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 text-sm font-medium"
                                            >
                                                Choose File
                                            </label>
                                            <p className="mt-2 text-xs text-[#6b7280]">JPG, PNG, WebP or MP4 (max 10MB for images, 50MB for videos)</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Position */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-2">Page</label>
                                    <select
                                        className="w-full px-4 py-2.5 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-sm"
                                        value={formData.page}
                                        onChange={e => setFormData({ ...formData, page: e.target.value })}
                                    >
                                        <option value="all">All Pages</option>
                                        <option value="home">Home Page</option>
                                        <option value="vendors">Vendors Page</option>
                                        <option value="browse">Browse Page</option>
                                        <option value="about">About Page</option>
                                        <option value="contact">Contact Page</option>
                                        <option value="blog">Blog Page</option>
                                        <option value="faq">FAQ Page</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-2">Slot</label>
                                    <select
                                        className="w-full px-4 py-2.5 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-sm"
                                        value={formData.slot}
                                        onChange={e => setFormData({ ...formData, slot: e.target.value })}
                                    >
                                        {/* Strip Slots (horizontal banner) */}
                                        <optgroup label="Strip Slots (Horizontal Banner)">
                                            <option value="strip_top">Strip — Top (below hero)</option>
                                            <option value="strip_bottom">Strip — Bottom (before footer)</option>
                                            <option value="strip_home_mid">Strip — Home Middle</option>
                                        </optgroup>
                                        {/* Carousel Slots */}
                                        <optgroup label="Carousel Sliders (Multiple Ads)">
                                            <option value="carousel_1">Carousel Slider 1 (Top)</option>
                                            <option value="carousel_2">Carousel Slider 2</option>
                                            <option value="carousel_3">Carousel Slider 3 (Middle)</option>
                                            <option value="carousel_4">Carousel Slider 4</option>
                                            <option value="carousel_5">Carousel Slider 5 (Bottom)</option>
                                        </optgroup>
                                    </select>
                                </div>
                            </div>

                            {/* URL */}
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">Redirect URL</label>
                                <input
                                    type="url"
                                    required
                                    className="w-full px-4 py-2.5 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-sm"
                                    value={formData.redirect_url}
                                    onChange={e => setFormData({ ...formData, redirect_url: e.target.value })}
                                    placeholder="https://example.com"
                                />
                            </div>

                            {/* Scheduling */}
                            <div className="grid grid-cols-3 gap-4">
                                {(() => {
                                    const today = new Date().toISOString().split('T')[0];
                                    return (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-[#374151] mb-2">Start Date</label>
                                                <input
                                                    type="date"
                                                    min={today}
                                                    className="w-full px-4 py-2.5 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-sm"
                                                    value={formData.start_date}
                                                    onChange={e => {
                                                        const newStart = e.target.value;
                                                        const updates = { start_date: newStart };
                                                        if (formData.end_date && newStart > formData.end_date) {
                                                            updates.end_date = '';
                                                        }
                                                        setFormData({ ...formData, ...updates });
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[#374151] mb-2">End Date</label>
                                                <input
                                                    type="date"
                                                    min={formData.start_date || today}
                                                    className="w-full px-4 py-2.5 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-sm"
                                                    value={formData.end_date}
                                                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[#374151] mb-2">Priority</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-4 py-2.5 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-sm"
                                                    value={formData.priority}
                                                    onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                                    placeholder="0"
                                                />
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Template Options */}
                            <div className="bg-[#f9fafb] rounded-xl p-5 border border-slate-100">
                                <h3 className="text-sm font-semibold text-[#1f2937] mb-4">Template Options</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#374151] mb-2">Template Style</label>
                                        <select
                                            className="w-full px-4 py-2.5 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-sm"
                                            value={formData.template_type}
                                            onChange={e => setFormData({ ...formData, template_type: e.target.value })}
                                        >
                                            <option value="standard">Standard</option>
                                            <option value="minimal">Minimal</option>
                                            <option value="premium">Premium</option>
                                            <option value="compact">Compact</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#374151] mb-2">Button Text</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-sm"
                                            value={formData.button_text}
                                            onChange={e => setFormData({ ...formData, button_text: e.target.value })}
                                            placeholder="Visit Website"
                                        />
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-slate-100 rounded"
                                                checked={formData.show_badge}
                                                onChange={e => setFormData({ ...formData, show_badge: e.target.checked })}
                                            />
                                            <span className="ml-2 text-sm text-[#374151]">Show Featured Badge</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-slate-100 rounded"
                                                checked={formData.is_active}
                                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                            />
                                            <span className="ml-2 text-sm text-[#374151]">Active</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setSelectedFile(null); setFilePreview(null); }}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-semibold shadow-sm transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-sm transition-all"
                                >
                                    {editingAd ? 'Update Ad' : 'Create Ad'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Subscription Plans Modal */}
            {showPlansModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
                            <div>
                                <h2 className="text-xl font-semibold text-[#1f2937]">Subscription Plans</h2>
                                <p className="text-sm text-[#6b7280]">Edit prices for vendor ad plans</p>
                            </div>
                            <button
                                onClick={() => setShowPlansModal(false)}
                                className="text-[#9ca3af] hover:text-[#6b7280] transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            {plansLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {adPlans.map((plan, idx) => (
                                        <div key={plan.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex items-center gap-4">
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{plan.name} Plan</label>
                                                <p className="text-xs text-slate-400">ID: {plan.id}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1">Price ($/mo)</label>
                                                <input
                                                    type="number"
                                                    value={plan.price}
                                                    onChange={e => {
                                                        const newPlans = [...adPlans];
                                                        newPlans[idx].price = Number(e.target.value);
                                                        setAdPlans(newPlans);
                                                    }}
                                                    className="w-32 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 text-sm font-semibold"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => setShowPlansModal(false)}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-semibold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSavePlans}
                                disabled={plansLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
                            >
                                Save Plans
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
