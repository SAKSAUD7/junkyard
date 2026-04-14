import { useState, useEffect } from 'react';
import { vendorInventory } from '../../services/vendorApi';

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

                {/* Inventory List as Cards */}
                <div className="space-y-4">
                    {inventory.length > 0 ? (
                        inventory.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${item.item_type === 'make' ? 'bg-blue-100 text-blue-700' :
                                                item.item_type === 'model' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {item.item_type}
                                            </span>
                                            {item.year_start && (
                                                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                                    {item.year_start} - {item.year_end || 'Present'}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {item.make} {item.model}
                                        </h3>
                                        {item.part_name && (
                                            <p className="text-gray-600 font-medium">{item.part_name}</p>
                                        )}
                                        {item.notes && (
                                            <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg inline-block">
                                                {item.notes}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleToggleAvailability(item)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${item.is_available
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}
                                        >
                                            {item.is_available ? 'Active' : 'Hidden'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No items yet</h3>
                            <p className="text-gray-500 mb-6">Add makes, models, or parts you support.</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                            >
                                Add First Item
                            </button>
                        </div>
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
