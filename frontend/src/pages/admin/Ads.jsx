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
    CursorArrowRaysIcon
} from '@heroicons/react/24/outline';

export default function AdminAds() {
    const { token } = useContext(AuthContext);
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAd, setEditingAd] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        redirect_url: '',
        page: 'home',
        slot: 'left_sidebar_ad',
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
        fetchAds();
    }, [token]);

    const fetchAds = async () => {
        try {
            const data = await api.getAdminAds(token);
            setAds(data.results || data);
        } catch (error) {
            console.error('Error fetching ads:', error);
        } finally {
            setLoading(false);
        }
    };

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
                slot: 'left_sidebar_ad',
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
        const positions = {
            'home-left_sidebar_ad': { label: 'Home Left', color: 'bg-[#eef2ff] text-[#6366f1]' },
            'home-right_sidebar_ad': { label: 'Home Right', color: 'bg-[#ede9fe] text-[#8b5cf6]' },
            'vendors-left_sidebar_ad': { label: 'Vendors Left', color: 'bg-[#d1fae5] text-[#10b981]' },
            'vendors-right_sidebar_ad': { label: 'Vendors Right', color: 'bg-[#fef3c7] text-[#f59e0b]' },
            'browse-left_sidebar_ad': { label: 'Browse Left', color: 'bg-[#dbeafe] text-[#1e40af]' },
            'browse-right_sidebar_ad': { label: 'Browse Right', color: 'bg-[#fce7f3] text-[#be185d]' },
        };
        const key = `${page}-${slot}`;
        return positions[key] || { label: `${page} - ${slot}`, color: 'bg-[#f3f4f6] text-[#374151]' };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#6366f1] mx-auto mb-4"></div>
                    <p className="text-[#6b7280] font-medium">Loading ads...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-[#1f2937]">Ad Management</h1>
                    <p className="text-base text-[#6b7280] mt-2">
                        {ads.length} active campaigns
                    </p>
                </div>

                <button
                    onClick={() => { setEditingAd(null); setSelectedFile(null); setFilePreview(null); setShowModal(true); }}
                    className="flex items-center px-6 py-3 bg-[#6366f1] text-slate-800 rounded-xl hover:bg-[#4f46e5] shadow-md transition-all font-medium text-base"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Ad
                </button>
            </div>

            {/* Ads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.length === 0 ? (
                    <div className="col-span-full bg-white rounded-2xl shadow-md p-12 text-center border border-[#e5e7eb]">
                        <MegaphoneIcon className="h-16 w-16 mx-auto mb-4 text-[#d1d5db]" />
                        <p className="text-[#6b7280] text-lg">No ads created yet</p>
                        <p className="text-[#9ca3af] text-base mt-2">Create your first ad campaign to get started</p>
                    </div>
                ) : (
                    ads.map((ad) => {
                        const positionBadge = getPositionBadge(ad.page, ad.slot);
                        return (
                            <div
                                key={ad.id}
                                className="bg-white rounded-2xl shadow-md overflow-hidden border border-[#e5e7eb] hover:shadow-lg transition-all group"
                            >
                                {/* Ad Preview */}
                                <div className="relative h-48 bg-gradient-to-br from-[#f9fafb] to-[#f3f4f6] flex items-center justify-center overflow-hidden">
                                    {ad.image ? (
                                        ad.image.endsWith('.mp4') ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-[#1f2937]">
                                                <VideoCameraIcon className="h-16 w-16 text-slate-800/50" />
                                                <span className="absolute bottom-3 right-3 bg-black/70 text-slate-800 text-xs px-2 py-1 rounded">Video</span>
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
                                        <div className="bg-[#f9fafb] rounded-xl p-3 border border-[#e5e7eb]">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CursorArrowRaysIcon className="h-4 w-4 text-[#6366f1]" />
                                                <span className="text-xs text-[#6b7280]">Clicks</span>
                                            </div>
                                            <p className="text-lg font-bold text-[#1f2937]">{ad.clicks || 0}</p>
                                        </div>
                                        <div className="bg-[#f9fafb] rounded-xl p-3 border border-[#e5e7eb]">
                                            <div className="flex items-center gap-2 mb-1">
                                                <ChartBarIcon className="h-4 w-4 text-[#10b981]" />
                                                <span className="text-xs text-[#6b7280]">Priority</span>
                                            </div>
                                            <p className="text-lg font-bold text-[#1f2937]">{ad.priority}</p>
                                        </div>
                                    </div>

                                    {/* Duration */}
                                    <div className="bg-[#f9fafb] rounded-xl p-3 border border-[#e5e7eb] mb-4">
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
                                            className="flex-1 px-3 py-2 bg-[#eef2ff] text-[#6366f1] rounded-xl hover:bg-[#e0e7ff] text-sm font-medium flex items-center justify-center gap-2 transition-all"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ad.id)}
                                            className="flex-1 px-3 py-2 bg-[#fee2e2] text-[#dc2626] rounded-xl hover:bg-[#fecaca] text-sm font-medium flex items-center justify-center gap-2 transition-all"
                                        >
                                            <TrashIcon className="h-4 w-4" />
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
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-[#e5e7eb] px-6 py-4 flex justify-between items-center rounded-t-2xl">
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
                                    className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#6366f1] focus:border-transparent bg-white text-sm"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter ad title"
                                />
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">Ad Media</label>
                                <div className="border-2 border-dashed border-[#e5e7eb] rounded-xl p-6 text-center hover:border-[#6366f1] transition-colors">
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
                                                className="absolute top-2 right-2 bg-[#dc2626] text-slate-800 rounded-full p-2 hover:bg-[#b91c1c] shadow-lg"
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
                                                className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#eef2ff] text-[#6366f1] rounded-xl hover:bg-[#e0e7ff] text-sm font-medium"
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
                                        className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#6366f1] focus:border-transparent bg-white text-sm"
                                        value={formData.page}
                                        onChange={e => setFormData({ ...formData, page: e.target.value })}
                                    >
                                        <option value="all">All Pages</option>
                                        <option value="home">Home Page</option>
                                        <option value="vendors">Vendors Page</option>
                                        <option value="browse">Browse Page</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#374151] mb-2">Slot</label>
                                    <select
                                        className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#6366f1] focus:border-transparent bg-white text-sm"
                                        value={formData.slot}
                                        onChange={e => setFormData({ ...formData, slot: e.target.value })}
                                    >
                                        <option value="left_sidebar_ad">Left Sidebar</option>
                                        <option value="right_sidebar_ad">Right Sidebar</option>
                                    </select>
                                </div>
                            </div>

                            {/* URL */}
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">Redirect URL</label>
                                <input
                                    type="url"
                                    required
                                    className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#6366f1] focus:border-transparent bg-white text-sm"
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
                                                    className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#6366f1] focus:border-transparent bg-white text-sm"
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
                                                    className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#6366f1] focus:border-transparent bg-white text-sm"
                                                    value={formData.end_date}
                                                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[#374151] mb-2">Priority</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#6366f1] focus:border-transparent bg-white text-sm"
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
                            <div className="bg-[#f9fafb] rounded-xl p-5 border border-[#e5e7eb]">
                                <h3 className="text-sm font-semibold text-[#1f2937] mb-4">Template Options</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#374151] mb-2">Template Style</label>
                                        <select
                                            className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#6366f1] focus:border-transparent bg-white text-sm"
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
                                            className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#6366f1] focus:border-transparent bg-white text-sm"
                                            value={formData.button_text}
                                            onChange={e => setFormData({ ...formData, button_text: e.target.value })}
                                            placeholder="Visit Website"
                                        />
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-[#6366f1] focus:ring-[#6366f1] border-[#e5e7eb] rounded"
                                                checked={formData.show_badge}
                                                onChange={e => setFormData({ ...formData, show_badge: e.target.checked })}
                                            />
                                            <span className="ml-2 text-sm text-[#374151]">Show Featured Badge</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-[#6366f1] focus:ring-[#6366f1] border-[#e5e7eb] rounded"
                                                checked={formData.is_active}
                                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                            />
                                            <span className="ml-2 text-sm text-[#374151]">Active</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e7eb]">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setSelectedFile(null); setFilePreview(null); }}
                                    className="px-5 py-2.5 border border-[#e5e7eb] rounded-xl text-[#374151] hover:bg-[#f9fafb] text-sm font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-[#6366f1] text-slate-800 rounded-xl hover:bg-[#4f46e5] text-sm font-medium shadow-md transition-all"
                                >
                                    {editingAd ? 'Update Ad' : 'Create Ad'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
