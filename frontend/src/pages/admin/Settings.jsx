import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import {
    UserCircleIcon,
    ShieldCheckIcon,
    Cog6ToothIcon,
    BellIcon,
    ArrowRightOnRectangleIcon,
    KeyIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    PaintBrushIcon,
    MoonIcon,
    SunIcon,
    CheckCircleIcon,
    XCircleIcon,
    SparklesIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';

// Enhanced Toast Component
const Toast = ({ message, type, onClose }) => {
    const config = {
        success: {
            bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
            border: 'border-emerald-200',
            text: 'text-emerald-800',
            icon: <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
        },
        error: {
            bg: 'bg-gradient-to-r from-red-50 to-rose-50',
            border: 'border-red-200',
            text: 'text-red-800',
            icon: <XCircleIcon className="h-5 w-5 text-red-500" />
        }
    };

    const style = config[type] || config.success;

    return (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border-2 ${style.bg} ${style.border} ${style.text} animate-in slide-in-from-right duration-300`}>
            {style.icon}
            <p className="text-sm font-semibold">{message}</p>
            <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
                <XCircleIcon className="h-5 w-5" />
            </button>
        </div>
    );
};

export default function AdminSettings() {
    const { user, logout } = useContext(AuthContext);
    const [toast, setToast] = useState(null);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);

    // Password change modal state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Initialize dark mode from localStorage
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved === 'true';
    });

    // Apply dark mode to document when state changes
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
            showToast('Dark mode enabled', 'success');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
            if (localStorage.getItem('darkMode') !== null) {
                showToast('Dark mode disabled', 'success');
            }
        }
    }, [darkMode]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSavePreferences = () => {
        showToast('Preferences saved successfully!', 'success');
    };

    const handleChangePassword = async () => {
        // Validate passwords
        if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            showToast('Please fill in all password fields', 'error');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            showToast('New password must be at least 8 characters', 'error');
            return;
        }

        setPasswordLoading(true);
        try {
            await authService.changePassword(passwordData.oldPassword, passwordData.newPassword);
            showToast('Password changed successfully!', 'success');
            setShowPasswordModal(false);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Password change error:', error);
            const errorMessage = error.response?.data?.old_password?.[0] ||
                error.response?.data?.new_password?.[0] ||
                error.response?.data?.detail ||
                'Failed to change password. Please check your old password.';
            showToast(errorMessage, 'error');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-8">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* ── Header ────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Settings & Preferences</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your account settings and preferences.</p>
                </div>
                <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <UserCircleIcon className="h-6 w-6 text-slate-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">{user?.username || 'Admin User'}</p>
                        <p className="text-xs text-slate-500">
                            {user?.is_superuser ? 'Super Admin' : user?.user_type === 'admin' ? 'Admin' : 'Staff'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Information */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#f9fafb] to-white px-6 py-4 border-b-2 border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white border border-slate-100 rounded-lg">
                                <UserCircleIcon className="h-5 w-5 text-slate-900" />
                            </div>
                            <h3 className="text-lg font-bold text-[#1f2937]">Profile Information</h3>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Username</label>
                            <div className="px-4 py-3 bg-gradient-to-br from-[#f9fafb] to-white border-2 border-slate-100 rounded-xl text-[#1f2937] font-medium">
                                {user?.username || 'N/A'}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#6b7280] mb-2 uppercase tracking-wide flex items-center gap-2">
                                <EnvelopeIcon className="h-4 w-4" />
                                Email Address
                            </label>
                            <div className="px-4 py-3 bg-gradient-to-br from-[#f9fafb] to-white border-2 border-slate-100 rounded-xl text-[#1f2937] font-medium">
                                {user?.email || 'N/A'}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#6b7280] mb-2 uppercase tracking-wide flex items-center gap-2">
                                <ShieldCheckIcon className="h-4 w-4" />
                                Account Type
                            </label>
                            <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-slate-50 border-2 border-blue-200 rounded-xl">
                                <span className="inline-flex items-center gap-2 text-sm font-bold text-blue-600">
                                    <SparklesIcon className="h-4 w-4" />
                                    {user?.is_superuser ? 'Super Administrator' : user?.user_type === 'admin' ? 'Administrator' : 'Staff Member'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#f9fafb] to-white px-6 py-4 border-b-2 border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
                                <ShieldCheckIcon className="h-5 w-5 text-slate-900" />
                            </div>
                            <h3 className="text-lg font-bold text-[#1f2937]">Security</h3>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Password</label>
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                            <label className="block text-xs font-bold text-[#6b7280] mb-3 uppercase tracking-wide">Session Management</label>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-[#f9fafb] to-white border border-slate-100 rounded-lg">
                                    <span className="text-sm text-[#6b7280]">Last Login</span>
                                    <span className="text-sm font-semibold text-[#1f2937]">Today</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-[#f9fafb] to-white border border-slate-100 rounded-lg">
                                    <span className="text-sm text-[#6b7280]">Active Sessions</span>
                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        1 Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#f9fafb] to-white px-6 py-4 border-b-2 border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                                <BellIcon className="h-5 w-5 text-slate-900" />
                            </div>
                            <h3 className="text-lg font-bold text-[#1f2937]">Notifications</h3>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-[#f9fafb] to-white border-2 border-slate-100 rounded-xl hover:border-blue-600 transition-colors">
                            <div className="flex items-center gap-3">
                                <EnvelopeIcon className="h-5 w-5 text-[#6b7280]" />
                                <div>
                                    <p className="text-sm font-semibold text-[#1f2937]">Email Notifications</p>
                                    <p className="text-xs text-[#6b7280]">Receive updates via email</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={emailNotifications}
                                    onChange={(e) => setEmailNotifications(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#6366f1] peer-checked:to-[#8b5cf6]"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-[#f9fafb] to-white border-2 border-slate-100 rounded-xl hover:border-blue-600 transition-colors">
                            <div className="flex items-center gap-3">
                                <BellIcon className="h-5 w-5 text-[#6b7280]" />
                                <div>
                                    <p className="text-sm font-semibold text-[#1f2937]">Push Notifications</p>
                                    <p className="text-xs text-[#6b7280]">Browser notifications</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={pushNotifications}
                                    onChange={(e) => setPushNotifications(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#6366f1] peer-checked:to-[#8b5cf6]"></div>
                            </label>
                        </div>

                            <button
                                onClick={handleSavePreferences}
                                className="w-full mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-semibold shadow-sm transition-all"
                            >
                                Save Preferences
                            </button>
                    </div>
                </div>

                {/* Appearance & System */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#f9fafb] to-white px-6 py-4 border-b-2 border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-slate-500 to-pink-500 rounded-lg">
                                <PaintBrushIcon className="h-5 w-5 text-slate-900" />
                            </div>
                            <h3 className="text-lg font-bold text-[#1f2937]">Appearance</h3>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-[#f9fafb] to-white border-2 border-slate-100 rounded-xl hover:border-blue-600 transition-colors">
                            <div className="flex items-center gap-3">
                                {darkMode ? (
                                    <MoonIcon className="h-5 w-5 text-[#6b7280]" />
                                ) : (
                                    <SunIcon className="h-5 w-5 text-[#6b7280]" />
                                )}
                                <div>
                                    <p className="text-sm font-semibold text-[#1f2937]">Dark Mode</p>
                                    <p className="text-xs text-[#6b7280]">Toggle dark theme</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={darkMode}
                                    onChange={(e) => setDarkMode(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#6366f1] peer-checked:to-[#8b5cf6]"></div>
                            </label>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <label className="block text-xs font-bold text-[#6b7280] mb-3 uppercase tracking-wide">System Information</label>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-[#f9fafb] to-white border border-slate-100 rounded-lg">
                                    <span className="text-sm text-[#6b7280]">Version</span>
                                    <span className="text-sm font-semibold text-[#1f2937]">v1.0.0</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-[#f9fafb] to-white border border-slate-100 rounded-lg">
                                    <span className="text-sm text-[#6b7280]">Environment</span>
                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
                                        Development
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-red-200 overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-rose-50 px-6 py-4 border-b-2 border-red-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg">
                            <ArrowRightOnRectangleIcon className="h-5 w-5 text-slate-900" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-red-900">Danger Zone</h3>
                            <p className="text-sm text-red-700">Irreversible actions</p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-[#1f2937]">Sign Out</p>
                            <p className="text-xs text-[#6b7280] mt-1">End your current session</p>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
                        >
                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#1e40af] to-[#2563eb] px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                        <KeyIcon className="h-6 w-6 text-slate-900" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Change Password</h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                    }}
                                    className="text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    <XCircleIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            {/* Old Password */}
                            <div>
                                <label className="block text-sm font-semibold text-[#1f2937] mb-2">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.old ? 'text' : 'password'}
                                        value={passwordData.oldPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                        className="w-full px-4 py-3 pr-12 border-2 border-slate-100 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-blue-600 transition-colors"
                                    >
                                        {showPasswords.old ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-semibold text-[#1f2937] mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full px-4 py-3 pr-12 border-2 border-slate-100 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                                        placeholder="Enter new password (min 8 characters)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-blue-600 transition-colors"
                                    >
                                        {showPasswords.new ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-semibold text-[#1f2937] mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-4 transition-all outline-none ${passwordData.confirmPassword && passwordData.newPassword
                                                ? passwordData.newPassword === passwordData.confirmPassword
                                                    ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-100'
                                                    : 'border-red-500 focus:border-red-500 focus:ring-red-100'
                                                : 'border-slate-100 focus:border-blue-600 focus:ring-indigo-100'
                                            }`}
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-blue-600 transition-colors"
                                    >
                                        {showPasswords.confirm ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {/* Real-time validation feedback */}
                                {passwordData.confirmPassword && passwordData.newPassword && (
                                    <div className="mt-2">
                                        {passwordData.newPassword === passwordData.confirmPassword ? (
                                            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                                <CheckCircleIcon className="h-4 w-4" />
                                                Passwords match!
                                            </p>
                                        ) : (
                                            <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
                                                <XCircleIcon className="h-4 w-4" />
                                                Passwords do not match
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Password Requirements */}
                            <div className="bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-200 rounded-xl p-3">
                                <p className="text-xs font-semibold text-blue-600 mb-1">Password Requirements:</p>
                                <ul className="text-xs text-[#6b7280] space-y-1">
                                    <li className={`flex items-center gap-2 ${passwordData.newPassword && passwordData.newPassword.length >= 8 ? 'text-emerald-600' : ''}`}>
                                        {passwordData.newPassword && passwordData.newPassword.length >= 8 ? (
                                            <CheckCircleIcon className="h-3 w-3 text-emerald-600" />
                                        ) : (
                                            <span className="w-1 h-1 rounded-full bg-blue-600"></span>
                                        )}
                                        Minimum 8 characters {passwordData.newPassword && `(${passwordData.newPassword.length}/8)`}
                                    </li>
                                    <li className={`flex items-center gap-2 ${passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword ? 'text-emerald-600' : ''}`}>
                                        {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword ? (
                                            <CheckCircleIcon className="h-3 w-3 text-emerald-600" />
                                        ) : (
                                            <span className="w-1 h-1 rounded-full bg-blue-600"></span>
                                        )}
                                        Passwords must match
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-[#f9fafb] border-t border-slate-100 flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                    }}
                                    className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-semibold transition-all"
                                    disabled={passwordLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    disabled={passwordLoading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {passwordLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Changing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="h-4 w-4" />
                                            Change Password
                                        </>
                                    )}
                                </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
