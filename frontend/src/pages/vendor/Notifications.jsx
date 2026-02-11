import { useState, useEffect } from 'react';
import { vendorNotifications } from '../../services/vendorApi';

const VendorNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // all, unread, read

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const response = await vendorNotifications.list();
            setNotifications(response.data.results || response.data);
        } catch (err) {
            setError('Failed to load notifications');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await vendorNotifications.markAsRead(id);
            loadNotifications();
        } catch (err) {
            setError('Failed to mark notification as read');
            console.error(err);
        }
    };

    const getFilteredNotifications = () => {
        if (filter === 'unread') {
            return notifications.filter(n => !n.is_read);
        } else if (filter === 'read') {
            return notifications.filter(n => n.is_read);
        }
        return notifications;
    };

    const getNotificationStyle = (type) => {
        switch (type) {
            case 'new_lead':
                return {
                    icon: (
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    ),
                    bg: 'bg-blue-50',
                    badge: 'bg-blue-100 text-blue-700'
                };
            case 'lead_update':
                return {
                    icon: (
                        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    ),
                    bg: 'bg-amber-50',
                    badge: 'bg-amber-100 text-amber-700'
                };
            case 'system':
                return {
                    icon: (
                        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    ),
                    bg: 'bg-gray-100',
                    badge: 'bg-gray-100 text-gray-700'
                };
            default:
                return {
                    icon: (
                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    ),
                    bg: 'bg-purple-50',
                    badge: 'bg-purple-100 text-purple-700'
                };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const filteredNotifications = getFilteredNotifications();
    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
            {/* Header Section */}
            <div className="relative bg-gradient-to-br from-blue-600 to-teal-600 pt-6 pb-8 px-6 rounded-b-[2rem] shadow-lg mb-6 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10"></div>

                <div className="max-w-7xl mx-auto text-white relative z-10">
                    <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight">Notifications</h1>
                    </div>
                    <p className="text-blue-100/90 text-sm font-medium ml-[2.875rem] flex items-center gap-2">
                        Stay updated with your activity
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                {unreadCount} new
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Filters */}
                <div className="flex justify-center mb-6">
                    <div className="inline-flex p-1 bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-gray-100">
                        {['all', 'unread', 'read'].map((filterType) => (
                            <button
                                key={filterType}
                                onClick={() => setFilter(filterType)}
                                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${filter === filterType
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    } capitalization`}
                            >
                                <span className="capitalize">{filterType}</span>
                                <span className="ml-1.5 opacity-60 text-xs">
                                    {filterType === 'all' ? notifications.length :
                                        filterType === 'unread' ? unreadCount :
                                            notifications.length - unreadCount}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm border border-red-100 mb-6">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Notifications List */}
                <div className="space-y-4">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => {
                            const style = getNotificationStyle(notification.notification_type);
                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                                    className={`relative group bg-white rounded-3xl p-5 border transition-all cursor-pointer ${notification.is_read
                                        ? 'border-gray-100 shadow-sm opacity-90'
                                        : 'border-blue-100 shadow-md ring-1 ring-blue-50'
                                        } hover:scale-[1.01]`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${style.bg}`}>
                                            {style.icon}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className={`text-base font-bold ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-xs font-medium text-gray-400 whitespace-nowrap ml-2">
                                                    {new Date(notification.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                                                {notification.message}
                                            </p>

                                            {notification.lead_info && (
                                                <div className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 012-2v0m2 0a2 2 0 012 2l0 0m-6 0a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    <span className="text-xs font-semibold text-gray-600">
                                                        {notification.lead_info.vehicle} • <span className="text-blue-600">{notification.lead_info.part}</span>
                                                    </span>
                                                </div>
                                            )}

                                            <div className="mt-3 flex items-center justify-between">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${style.badge}`}>
                                                    {notification.type_display}
                                                </span>
                                                {!notification.is_read && (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-blue-600">
                                                        Mark as read
                                                        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {!notification.is_read && (
                                        <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-white"></div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No notifications</h3>
                            <p className="text-gray-500">
                                {filter === 'unread'
                                    ? "You're all caught up!"
                                    : "You don't have any notifications of this type."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorNotifications;
