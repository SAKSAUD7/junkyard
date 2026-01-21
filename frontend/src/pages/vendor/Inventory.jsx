import { useState, useEffect } from 'react';
import { vendorInventory } from '../../services/vendorApi';
import '../../styles/vendor.css';

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
        return <div>Loading inventory...</div>;
    }

    return (
        <div>
            {/* Page Header */}
            <div style={{
                marginBottom: 'var(--vendor-spacing-lg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 'var(--vendor-spacing-md)',
                flexWrap: 'wrap'
            }}>
                <div style={{ flex: '1', minWidth: '200px' }}>
                    <h1 style={{
                        fontSize: 'clamp(1.25rem, 5vw, 1.875rem)',
                        fontWeight: 700,
                        color: 'var(--vendor-text-primary)',
                        margin: '0 0 0.5rem 0'
                    }}>
                        Inventory Management
                    </h1>
                    <p style={{
                        color: 'var(--vendor-text-secondary)',
                        fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                        margin: 0
                    }}>
                        Manage your supported makes, models, and parts
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="vendor-btn vendor-btn-primary"
                    style={{ whiteSpace: 'nowrap' }}
                >
                    + Add Item
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    padding: '0.75rem',
                    borderRadius: 'var(--vendor-radius)',
                    marginBottom: '1rem',
                    fontSize: '0.875rem'
                }}>
                    {error}
                </div>
            )}

            {/* Inventory Table - Desktop */}
            <div className="vendor-table-container vendor-desktop-only">
                <table className="vendor-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Make</th>
                            <th>Model</th>
                            <th>Part</th>
                            <th>Years</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.length > 0 ? (
                            inventory.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <span className="vendor-badge vendor-badge-neutral">
                                            {item.item_type}
                                        </span>
                                    </td>
                                    <td>{item.make || '-'}</td>
                                    <td>{item.model || '-'}</td>
                                    <td>{item.part_name || '-'}</td>
                                    <td>
                                        {item.year_start && item.year_end
                                            ? `${item.year_start} - ${item.year_end}`
                                            : '-'}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleToggleAvailability(item)}
                                            className={`vendor-badge ${item.is_available ? 'vendor-badge-success' : 'vendor-badge-neutral'}`}
                                            style={{ cursor: 'pointer', border: 'none' }}
                                        >
                                            {item.is_available ? 'Available' : 'Unavailable'}
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="vendor-btn vendor-btn-danger"
                                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--vendor-text-secondary)' }}>
                                    No inventory items found. Click "Add Item" to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Item Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="vendor-modal-content" style={{
                        backgroundColor: 'var(--vendor-bg-primary)',
                        borderRadius: 'var(--vendor-radius-lg)',
                        padding: 'clamp(1rem, 3vw, 2rem)',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                    }}>
                        <h2 style={{ marginTop: 0, fontSize: 'clamp(1.125rem, 3vw, 1.5rem)' }}>Add Inventory Item</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="vendor-form-group">
                                <label className="vendor-form-label" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Item Type</label>
                                <select
                                    name="item_type"
                                    className="vendor-form-select"
                                    style={{ padding: '0.625rem 0.875rem', fontSize: '0.875rem', minHeight: '2.5rem' }}
                                    value={formData.item_type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="make">Make</option>
                                    <option value="model">Model</option>
                                    <option value="part">Part</option>
                                </select>
                            </div>

                            <div className="vendor-form-group">
                                <label className="vendor-form-label" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Make</label>
                                <input
                                    name="make"
                                    type="text"
                                    className="vendor-form-input"
                                    style={{ padding: '0.625rem 0.875rem', fontSize: '0.875rem', minHeight: '2.5rem' }}
                                    value={formData.make}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {(formData.item_type === 'model' || formData.item_type === 'part') && (
                                <div className="vendor-form-group">
                                    <label className="vendor-form-label" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Model</label>
                                    <input
                                        name="model"
                                        type="text"
                                        className="vendor-form-input"
                                        style={{ padding: '0.625rem 0.875rem', fontSize: '0.875rem', minHeight: '2.5rem' }}
                                        value={formData.model}
                                        onChange={handleChange}
                                        required={formData.item_type !== 'make'}
                                    />
                                </div>
                            )}

                            {formData.item_type === 'part' && (
                                <div className="vendor-form-group">
                                    <label className="vendor-form-label" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Part Name</label>
                                    <input
                                        name="part_name"
                                        type="text"
                                        className="vendor-form-input"
                                        style={{ padding: '0.625rem 0.875rem', fontSize: '0.875rem', minHeight: '2.5rem' }}
                                        value={formData.part_name}
                                        onChange={handleChange}
                                        required={formData.item_type === 'part'}
                                    />
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                                <div className="vendor-form-group">
                                    <label className="vendor-form-label" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Year Start</label>
                                    <input
                                        name="year_start"
                                        type="number"
                                        className="vendor-form-input"
                                        style={{ padding: '0.625rem 0.875rem', fontSize: '0.875rem', minHeight: '2.5rem' }}
                                        value={formData.year_start}
                                        onChange={handleChange}
                                        min="1900"
                                        max="2100"
                                    />
                                </div>

                                <div className="vendor-form-group">
                                    <label className="vendor-form-label" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Year End</label>
                                    <input
                                        name="year_end"
                                        type="number"
                                        className="vendor-form-input"
                                        style={{ padding: '0.625rem 0.875rem', fontSize: '0.875rem', minHeight: '2.5rem' }}
                                        value={formData.year_end}
                                        onChange={handleChange}
                                        min="1900"
                                        max="2100"
                                    />
                                </div>
                            </div>

                            <div className="vendor-form-group">
                                <label className="vendor-form-label" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Notes</label>
                                <textarea
                                    name="notes"
                                    className="vendor-form-textarea"
                                    style={{ padding: '0.625rem 0.875rem', fontSize: '0.875rem', minHeight: '80px' }}
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </div>

                            <div className="vendor-form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        name="is_available"
                                        type="checkbox"
                                        checked={formData.is_available}
                                        onChange={handleChange}
                                    />
                                    <span className="vendor-form-label" style={{ margin: 0, fontSize: '0.875rem' }}>Available</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="vendor-btn vendor-btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="vendor-btn vendor-btn-primary"
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
