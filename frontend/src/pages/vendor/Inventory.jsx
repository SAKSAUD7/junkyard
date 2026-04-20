import { useState, useEffect } from 'react';
import { vendorInventory } from '../../services/vendorApi';
import { EmptyState } from '../../components/vendor/UIElements';

const VendorInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const [formData, setFormData] = useState({
        item_type: 'make',
        make: '',
        model: '',
        part_name: '',
        year_start: '',
        year_end: '',
        is_available: true,
        notes: '',
    });

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            const response = await vendorInventory.list();
            setInventory(response.data.results || response.data);
        } catch (err) {
            setError('Failed to load inventory');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await vendorInventory.create(formData);
            setShowAddModal(false);
            setFormData({
                item_type: 'make',
                make: '',
                model: '',
                part_name: '',
                year_start: '',
                year_end: '',
                is_available: true,
                notes: '',
            });
            loadInventory();
        } catch (err) {
            setError('Failed to add inventory item');
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await vendorInventory.delete(id);
                loadInventory();
            } catch (err) {
                setError('Failed to delete item');
                console.error(err);
            }
        }
    };

    const handleToggleAvailability = async (item) => {
        try {
            await vendorInventory.update(item.id, {
                ...item,
                is_available: !item.is_available,
            });
            loadInventory();
        } catch (err) {
            setError('Failed to update availability');
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
            {/* Header Section */}
            <div className="relative bg-gradient-to-br from-blue-600 to-teal-600 pt-6 pb-8 px-6 rounded-b-[2rem] shadow-lg mb-6 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10"></div>

                <div className="max-w-7xl mx-auto flex justify-between items-start text-slate-800 relative z-10">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1.5">
                            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-slate-300">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight">Inventory</h1>
                        </div>
                        <p className="text-blue-100/90 text-sm font-medium ml-[2.875rem]">Manage your parts and stock levels</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-slate-800 px-4 py-2 rounded-xl font-bold flex items-center gap-2 border border-slate-300 transition-all hover:scale-105 shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="hidden sm:inline">Add Item</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm border border-red-100 mb-6">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Inventory Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {inventory.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="vendor-table w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Years</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {inventory.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${item.item_type === 'make' ? 'bg-blue-100 text-blue-700' :
                                                    item.item_type === 'model' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {item.item_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{item.make} {item.model}</div>
                                                {item.part_name && <div className="text-sm text-slate-500 mt-1">{item.part_name}</div>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                                {item.year_start ? `${item.year_start} - ${item.year_end || 'Present'}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleToggleAvailability(item)}
                                                    title={item.is_available ? "Hide Item from Public" : "Make Item Public"}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${item.is_available
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                        }`}
                                                >
                                                    {item.is_available ? 'Active' : 'Hidden'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    title="Delete Inventory Item"
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState 
                            title="No items yet"
                            description="Add makes, models, or parts you support to match with incoming leads."
                            actionText="Add First Item"
                            onAction={() => setShowAddModal(true)}
                        />
                    )}
                </div>
            </div>

            {/* Add Item Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200 p-6 md:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold font-display text-gray-900">Add Inventory Item</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Item Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['make', 'model', 'part'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, item_type: type })}
                                            className={`py-2 rounded-xl text-sm font-bold capitalize transition-all border-2 ${formData.item_type === type
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-transparent bg-gray-50 text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Make</label>
                                <input
                                    name="make"
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g. Toyota"
                                    value={formData.make}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {(formData.item_type === 'model' || formData.item_type === 'part') && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Model</label>
                                    <input
                                        name="model"
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g. Camry"
                                        value={formData.model}
                                        onChange={handleChange}
                                        required={formData.item_type !== 'make'}
                                    />
                                </div>
                            )}

                            {formData.item_type === 'part' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Part Name</label>
                                    <input
                                        name="part_name"
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g. Alternator"
                                        value={formData.part_name}
                                        onChange={handleChange}
                                        required={formData.item_type === 'part'}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Year Start</label>
                                    <input
                                        name="year_start"
                                        type="number"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="YYYY"
                                        value={formData.year_start}
                                        onChange={handleChange}
                                        min="1900"
                                        max="2100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Year End</label>
                                    <input
                                        name="year_end"
                                        type="number"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="YYYY"
                                        value={formData.year_end}
                                        onChange={handleChange}
                                        min="1900"
                                        max="2100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                                <textarea
                                    name="notes"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[80px]"
                                    placeholder="Additional details..."
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </div>

                            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                <input
                                    name="is_available"
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={formData.is_available}
                                    onChange={handleChange}
                                />
                                <span className="text-sm font-semibold text-gray-700">Available immediately</span>
                            </label>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 border border-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-800 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
                                >
                                    Add Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorInventory;
