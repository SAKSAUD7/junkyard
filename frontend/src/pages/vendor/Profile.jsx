import { useState, useEffect } from 'react';
import { vendorProfile } from '../../services/vendorApi';
import { getLogoUrl } from '../../utils/imageUrl';

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

                <div className="max-w-7xl mx-auto flex justify-between items-start text-white relative z-10">
                    <div className="flex items-center gap-4">
                        {/* Vendor Logo */}
                        {profile?.logo ? (
                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border-2 border-white/30 shadow-lg overflow-hidden flex-shrink-0">
                                <img
                                    src={getLogoUrl(profile.logo)}
                                    alt={profile.name}
                                    loading="lazy"
                                    className="w-full h-full object-contain p-2"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = `
                                            <svg class="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        `;
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2.5 mb-1.5">
                                <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight">Yard Profile</h1>
                            </div>
                            <p className="text-blue-100/90 text-sm font-medium">Manage your business information and settings</p>
                        </div>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-white/30"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">

                {/* Status Messages */}
                {success && (
                    <div className="bg-green-50 text-green-700 px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm border border-green-100">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {success}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm border border-red-100">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Main Form Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'border-gray-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500' : 'border-transparent bg-gray-50 text-gray-800'} transition-all outline-none`}
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                                <input
                                    id="address"
                                    name="address"
                                    type="text"
                                    className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'border-gray-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500' : 'border-transparent bg-gray-50 text-gray-800'} transition-all outline-none`}
                                    value={formData.address}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                                    <input
                                        id="city"
                                        name="city"
                                        type="text"
                                        className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'border-gray-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500' : 'border-transparent bg-gray-50 text-gray-800'} transition-all outline-none`}
                                        value={formData.city}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                                    <input
                                        id="state"
                                        name="state"
                                        type="text"
                                        className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'border-gray-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500' : 'border-transparent bg-gray-50 text-gray-800'} transition-all outline-none`}
                                        value={formData.state}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required
                                        maxLength={2}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="zipcode" className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
                                    <input
                                        id="zipcode"
                                        name="zipcode"
                                        type="text"
                                        className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'border-gray-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500' : 'border-transparent bg-gray-50 text-gray-800'} transition-all outline-none`}
                                        value={formData.zipcode}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">Business Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'border-gray-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500' : 'border-transparent bg-gray-50 text-gray-800'} transition-all outline-none min-h-[120px]`}
                                    value={formData.description}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="Tell customers about your business..."
                                />
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 border border-gray-200 transition-colors"
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Rating & Stats Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Rating & Visibility
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gray-50 rounded-2xl p-4 text-center">
                            <div className="text-sm text-gray-500 font-medium mb-1">Star Rating</div>
                            <div className="text-3xl font-black text-gray-900">{profile?.rating_stars || 5} ⭐</div>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 text-center">
                            <div className="text-sm text-gray-500 font-medium mb-1">Rating %</div>
                            <div className="text-3xl font-black text-gray-900">{profile?.rating_percentage || 100}%</div>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 text-center">
                            <div className="text-sm text-gray-500 font-medium mb-2">Badges</div>
                            <div className="flex flex-wrap justify-center gap-2">
                                {profile?.is_top_rated && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Top Rated</span>
                                )}
                                {profile?.is_featured && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Featured</span>
                                )}
                                {!profile?.is_top_rated && !profile?.is_featured && (
                                    <span className="text-xs text-gray-400 italic">No badges yet</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Review Snippet */}
                {profile?.review_snippet && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            Featured Review
                        </h3>
                        <div className="bg-blue-50/50 p-6 rounded-2xl border-l-4 border-blue-500">
                            <p className="text-gray-700 italic text-lg leading-relaxed">"{profile.review_snippet}"</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center">This review snippet is displayed on your public vendor profile.</p>
                    </div>
                )}
            </div>
        </div >
    );
};

export default VendorProfile;
