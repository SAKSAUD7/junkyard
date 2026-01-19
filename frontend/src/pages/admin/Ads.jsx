
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
        name: '',
        image: null,
        redirect_url: '',
        page: 'home',
        slot: 'sidebar',
        start_date: '',
        end_date: '',
        priority: 1,
        is_active: true
    });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAd) {
                await api.updateAd(token, editingAd.id, formData);
            } else {
                await api.createAd(token, formData);
            }
            setShowModal(false);
            setEditingAd(null);
            fetchAds();
        } catch (error) {
            alert('Failed to save ad');
        }
    };

    const handleEdit = (ad) => {
        setEditingAd(ad);
        setFormData({
            name: ad.name,
            redirect_url: ad.redirect_url,
            page: ad.page,
            slot: ad.slot,
            start_date: ad.start_date,
            end_date: ad.end_date || '',
            priority: ad.priority,
            is_active: ad.is_active
        });
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
                    onClick={() => { setEditingAd(null); setShowModal(true); }}
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
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
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{ad.name}</td>
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
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6">
                        <h2 className="text-xl font-bold mb-4">{editingAd ? 'Edit Ad' : 'New Ad'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Page</label>
                                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                        value={formData.page} onChange={e => setFormData({ ...formData, page: e.target.value })}>
                                        <option value="home">Home</option>
                                        <option value="all">All</option>
                                        <option value="search">Search</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Slot</label>
                                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                        value={formData.slot} onChange={e => setFormData({ ...formData, slot: e.target.value })}>
                                        <option value="sidebar">Sidebar</option>
                                        <option value="banner">Banner</option>
                                        <option value="footer">Footer</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Redirect URL</label>
                                <input type="url" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                    value={formData.redirect_url} onChange={e => setFormData({ ...formData, redirect_url: e.target.value })} />
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                                <label className="ml-2 block text-sm text-gray-900">Active</label>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
