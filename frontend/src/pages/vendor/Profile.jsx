import { useState, useEffect, useRef } from 'react';
import { vendorProfile } from '../../services/vendorApi';
import { getLogoUrl } from '../../utils/imageUrl';
import { useCMS } from '../../hooks/useCMS';

const VendorProfile = () => {
    const { get } = useCMS('vendor_portal');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logoSaving, setLogoSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const logoInputRef = useRef(null);
    const [logoPreview, setLogoPreview] = useState(null);

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

    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // Show instant preview
        const objectUrl = URL.createObjectURL(file);
        setLogoPreview(objectUrl);
        // Auto-save the logo immediately
        setLogoSaving(true);
        setError('');
        setSuccess('');
        try {
            const fd = new FormData();
            fd.append('logo', file);
            await vendorProfile.update(fd);
            setSuccess('Logo updated! Your listing will reflect the new logo shortly.');
            loadProfile();
        } catch (err) {
            console.error("Logo upload error:", err.response?.data);
            let errMsg = 'Failed to upload logo. Please try again.';
            if (err.response?.data) {
                // If DRF returns { name: ['This field is required.'] }
                const firstError = Object.values(err.response.data)[0];
                if (Array.isArray(firstError)) {
                    errMsg = `Validation error: ${firstError[0]}`;
                } else if (typeof firstError === 'string') {
                    errMsg = firstError;
                }
            }
            setError(errMsg);
        } finally {
            setLogoSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const fd = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'logo' && formData[key] === undefined) return;
                fd.append(key, formData[key]);
            });

            await vendorProfile.update(fd);
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

    const handleDeleteLogo = async (e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to remove your logo?")) return;
        setLogoSaving(true);
        setError('');
        setSuccess('');
        try {
            const fd = new FormData();
            fd.append('logo', '');
            await vendorProfile.update(fd);
            setLogoPreview(null);
            setSuccess('Logo removed successfully.');
            loadProfile();
        } catch (err) {
            console.error("Logo removal error:", err.response?.data);
            setError('Failed to remove logo. Please try again.');
        } finally {
            setLogoSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a56ff]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 md:pb-8">
            {/* Header Section */}
            <div className="relative bg-white pt-6 md:pt-8 pb-6 md:pb-8 px-6 md:px-8 rounded-b-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 overflow-hidden border-b border-slate-100">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center text-slate-900 relative z-10 w-full gap-4 md:gap-0">
                    <div className="flex items-center gap-4">
                        {/* Vendor Logo - always clickable */}
                        <div className="flex flex-col items-center gap-1">
                            <div className="relative group cursor-pointer" onClick={() => logoInputRef.current?.click()} title="Click to change logo">
                                {logoPreview || profile?.logo ? (
                                    <div className="relative">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden flex-shrink-0">
                                            {logoSaving ? (
                                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <img
                                                    src={logoPreview || getLogoUrl(profile.logo)}
                                                    alt={profile?.name}
                                                    className="w-full h-full object-contain p-2 group-hover:opacity-60 transition-opacity"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            )}
                                        </div>
                                        {/* Delete Logo Button */}
                                        <button 
                                            onClick={handleDeleteLogo}
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:bg-red-600 transition-colors z-20"
                                            title="Remove logo"
                                        >
                                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300 flex-shrink-0">
                                        {logoSaving ? (
                                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        )}
                                    </div>
                                )}
                                {/* Camera badge */}
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#1a56ff] rounded-full flex items-center justify-center border-2 border-white shadow-sm group-hover:bg-blue-700 transition-colors">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                            </div>
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider text-center leading-tight cursor-pointer hover:text-blue-700 transition-colors" onClick={() => logoInputRef.current?.click()}>
                                {logoSaving ? 'Uploading...' : logoPreview || profile?.logo ? 'Change Logo' : 'Upload Logo'}
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5 mb-1.5">
                                <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>{get('profile', 'heading', 'Yard Profile')}</h1>
                            </div>
                            <p className="text-slate-500 font-medium">{get('profile', 'subheading', 'Manage your business information and settings')}</p>
                        </div>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-[#1a56ff] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-[0_8px_20px_rgba(26,86,255,0.25)] hover:scale-[1.02]"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit Profile
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
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'border-gray-200 bg-white focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff]' : 'border-transparent bg-gray-50 text-gray-800'} transition-all outline-none`}
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
                                    className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'border-gray-200 bg-white focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff]' : 'border-transparent bg-gray-50 text-gray-800'} transition-all outline-none`}
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
                                        className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'border-gray-200 bg-white focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff]' : 'border-transparent bg-gray-50 text-gray-800'} transition-all outline-none`}
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
                                        className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'border-gray-200 bg-white focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff]' : 'border-transparent bg-gray-50 text-gray-800'} transition-all outline-none`}
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
                                        className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'border-gray-200 bg-white focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff]' : 'border-transparent bg-gray-50 text-gray-800'} transition-all outline-none`}
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
                                    className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'border-gray-200 bg-white focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff]' : 'border-transparent bg-gray-50 text-gray-800'} transition-all outline-none min-h-[120px]`}
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
                                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1a56ff] hover:bg-blue-700 shadow-md shadow-[#1a56ff]/20 transition-all"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Rating & Stats Card */}
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-6 md:p-8">
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

                {profile?.review_snippet && (
                    <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-6 md:p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#1a56ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            Featured Review
                        </h3>
                        <div className="bg-[#1a56ff]/5 p-6 rounded-2xl border-l-4 border-[#1a56ff]">
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
