import { useState, useEffect } from 'react';
import { vendorProfile } from '../../services/vendorApi';
import '../../styles/vendor.css';

const VendorProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        zipcode: '',
        description: '',
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await vendorProfile.get();
            setProfile(response.data);
            setFormData({
                name: response.data.name || '',
                address: response.data.address || '',
                city: response.data.city || '',
                state: response.data.state || '',
                zipcode: response.data.zipcode || '',
                description: response.data.description || '',
            });
        } catch (err) {
            setError('Failed to load profile');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            await vendorProfile.update(formData);
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
            loadProfile();
        } catch (err) {
            setError('Failed to update profile');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: profile.name || '',
            address: profile.address || '',
            city: profile.city || '',
            state: profile.state || '',
            zipcode: profile.zipcode || '',
            description: profile.description || '',
        });
    };

    if (loading) {
        return <div>Loading profile...</div>;
    }

    return (
        <div>
            {/* Page Header */}
            <div style={{
                marginBottom: 'var(--vendor-spacing-xl)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '1.875rem',
                        fontWeight: 700,
                        color: 'var(--vendor-text-primary)',
                        margin: '0 0 0.5rem 0'
                    }}>
                        Vendor Profile
                    </h1>
                    <p style={{
                        color: 'var(--vendor-text-secondary)',
                        fontSize: '0.875rem',
                        margin: 0
                    }}>
                        Manage your business information and settings
                    </p>
                </div>

                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="vendor-btn vendor-btn-primary"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div style={{
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    padding: '0.75rem',
                    borderRadius: 'var(--vendor-radius)',
                    marginBottom: '1rem',
                    fontSize: '0.875rem'
                }}>
                    {success}
                </div>
            )}

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

            {/* Profile Form */}
            <div className="vendor-card">
                <form onSubmit={handleSubmit}>
                    <div className="vendor-form-group">
                        <label className="vendor-form-label" htmlFor="name">
                            Business Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            className="vendor-form-input"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="vendor-form-group">
                        <label className="vendor-form-label" htmlFor="address">
                            Address
                        </label>
                        <input
                            id="address"
                            name="address"
                            type="text"
                            className="vendor-form-input"
                            value={formData.address}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 'var(--vendor-spacing-md)'
                    }}>
                        <div className="vendor-form-group">
                            <label className="vendor-form-label" htmlFor="city">
                                City
                            </label>
                            <input
                                id="city"
                                name="city"
                                type="text"
                                className="vendor-form-input"
                                value={formData.city}
                                onChange={handleChange}
                                disabled={!isEditing}
                                required
                            />
                        </div>

                        <div className="vendor-form-group">
                            <label className="vendor-form-label" htmlFor="state">
                                State
                            </label>
                            <input
                                id="state"
                                name="state"
                                type="text"
                                className="vendor-form-input"
                                value={formData.state}
                                onChange={handleChange}
                                disabled={!isEditing}
                                required
                                maxLength={2}
                            />
                        </div>

                        <div className="vendor-form-group">
                            <label className="vendor-form-label" htmlFor="zipcode">
                                ZIP Code
                            </label>
                            <input
                                id="zipcode"
                                name="zipcode"
                                type="text"
                                className="vendor-form-input"
                                value={formData.zipcode}
                                onChange={handleChange}
                                disabled={!isEditing}
                                required
                            />
                        </div>
                    </div>

                    <div className="vendor-form-group">
                        <label className="vendor-form-label" htmlFor="description">
                            Business Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            className="vendor-form-textarea"
                            value={formData.description}
                            onChange={handleChange}
                            disabled={!isEditing}
                            rows={5}
                            placeholder="Tell customers about your business..."
                        />
                    </div>

                    {isEditing && (
                        <div style={{
                            display: 'flex',
                            gap: 'var(--vendor-spacing-md)',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="vendor-btn vendor-btn-secondary"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="vendor-btn vendor-btn-primary"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Rating Info (Read-only) */}
            <div className="vendor-card" style={{ marginTop: 'var(--vendor-spacing-xl)' }}>
                <h3 className="vendor-card-title">Rating & Visibility</h3>
                <div className="vendor-card-body">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 'var(--vendor-spacing-lg)',
                        marginTop: 'var(--vendor-spacing-md)'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--vendor-text-secondary)', marginBottom: '0.25rem' }}>
                                Star Rating
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                {profile?.rating_stars || 5} ⭐
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--vendor-text-secondary)', marginBottom: '0.25rem' }}>
                                Rating Percentage
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                {profile?.rating_percentage || 100}%
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--vendor-text-secondary)', marginBottom: '0.25rem' }}>
                                Badges
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {profile?.is_top_rated && (
                                    <span className="vendor-badge vendor-badge-success">Top Rated</span>
                                )}
                                {profile?.is_featured && (
                                    <span className="vendor-badge vendor-badge-info">Featured</span>
                                )}
                                {!profile?.is_top_rated && !profile?.is_featured && (
                                    <span style={{ fontSize: '0.875rem', color: 'var(--vendor-text-secondary)' }}>
                                        No badges yet
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorProfile;
