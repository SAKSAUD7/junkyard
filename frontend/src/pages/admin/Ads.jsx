
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { PlusIcon } from '@heroicons/react/24/outline';

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
        start_date: new Date().toISOString().split('T')[0], // Today's date
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
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4'];
            if (!validTypes.includes(file.type)) {
                alert('Invalid file type. Please upload JPG, PNG, WebP, or MP4 files.');
                return;
            }

            // Validate file size (10MB for images, 50MB for videos)
            const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
            if (file.size > maxSize) {
                alert(`File too large. Max size: ${file.type.startsWith('video/') ? '50MB' : '10MB'}`);
                return;
            }

            setSelectedFile(file);

            // Create preview
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
            console.log('[Admin Ads] Submitting ad:', formData);

            // Create FormData for multipart upload
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

            // Add file if selected
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
            const errorMsg = error.message || 'Failed to save ad. Check console for details.';
            alert(errorMsg);
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Ad Management</h1>
                <button
                    onClick={() => { setEditingAd(null); setSelectedFile(null); setFilePreview(null); setShowModal(true); }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Ad
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="6" className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : ads.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-4 text-center">No ads found</td></tr>
                        ) : (
                            ads.map((ad) => (
                                <tr key={ad.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{ad.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{ad.page} - {ad.slot}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {ad.start_date} to {ad.end_date || 'Forever'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ad.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {ad.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{ad.clicks}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                                        <button onClick={() => handleEdit(ad)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                        <button onClick={() => handleDelete(ad.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editingAd ? 'Edit Ad' : 'New Ad'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Media (Image or Video)</label>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,.mp4"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <p className="mt-1 text-xs text-gray-500">JPG, PNG, WebP or MP4 (max 10MB for images, 50MB for videos)</p>

                                {/* Preview */}
                                {filePreview && (
                                    <div className="mt-3 relative">
                                        {selectedFile?.type.startsWith('video/') || filePreview.endsWith('.mp4') ? (
                                            <video src={filePreview} controls className="max-w-full h-auto rounded-lg border" />
                                        ) : (
                                            <img src={filePreview} alt="Preview" className="max-w-full h-auto rounded-lg border" />
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Page</label>
                                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                        value={formData.page} onChange={e => setFormData({ ...formData, page: e.target.value })}>
                                        <option value="all">All Pages</option>
                                        <option value="home">Home Page</option>
                                        <option value="vendors">Vendors Page</option>
                                        <option value="browse">Browse Page</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Slot</label>
                                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                        value={formData.slot} onChange={e => setFormData({ ...formData, slot: e.target.value })}>
                                        <option value="left_sidebar_ad">Left Sidebar Ad</option>
                                        <option value="right_sidebar_ad">Right Sidebar Ad</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Redirect URL</label>
                                <input type="url" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                    value={formData.redirect_url} onChange={e => setFormData({ ...formData, redirect_url: e.target.value })} />
                            </div>

                            {/* Scheduling & Priority */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                        value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                                    <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                        value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                                    <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                        value={formData.priority} onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                        placeholder="0" />
                                    <p className="mt-1 text-xs text-gray-500">Higher = more priority</p>
                                </div>
                            </div>

                            {/* Template Customization */}
                            <div className="border-t pt-4 mt-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Template Customization</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Template Style</label>
                                        <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                            value={formData.template_type} onChange={e => setFormData({ ...formData, template_type: e.target.value })}>
                                            <option value="standard">Standard Template</option>
                                            <option value="minimal">Minimal Template</option>
                                            <option value="premium">Premium Template</option>
                                            <option value="compact">Compact Template</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Button Text</label>
                                        <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                            value={formData.button_text} onChange={e => setFormData({ ...formData, button_text: e.target.value })}
                                            placeholder="Visit Website" />
                                    </div>

                                    <div className="flex items-center">
                                        <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            checked={formData.show_badge} onChange={e => setFormData({ ...formData, show_badge: e.target.checked })} />
                                        <label className="ml-2 block text-sm text-gray-900">Show "Featured" Badge</label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                                <label className="ml-2 block text-sm text-gray-900">Active</label>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => { setShowModal(false); setSelectedFile(null); setFilePreview(null); }} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
