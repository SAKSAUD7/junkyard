import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

/**
 * User-facing Notification Drawer
 * Opens from the right — same spring-animation style as AdminNotificationDrawer.
 * USA-grade UX: auto-marks all as read on open (Instagram / Facebook style).
 */

function timeAgo(dateStr) {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = Math.floor((now - then) / 1000); // seconds
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getIconForType(type) {
    switch (type) {
        case 'lead': return '🚗';
        case 'payment': return '💳';
        case 'feedback': return '🗣️';
        case 'system': return '⚙️';
        case 'quote': return '📋';
        default: return '🔔';
    }
}

export default function UserNotificationDrawer({ isOpen, onClose, onUnreadCountChange }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getNotifications();
            setNotifications(data.results || []);
        } catch (err) {
            console.error('Failed to load notifications', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-mark all as read when drawer opens (Facebook/Instagram UX)
    useEffect(() => {
        if (!isOpen) return;
        fetchNotifications();
        // Slight delay so user sees the unread state for a moment
        const timer = setTimeout(async () => {
            try {
                await api.markAllNotificationsAsRead();
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                onUnreadCountChange?.(0);
            } catch (err) {
                console.error('Failed to auto-mark as read', err);
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [isOpen, fetchNotifications, onUnreadCountChange]);

    const dismissNotification = async (id) => {
        try {
            await api.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            // Fallback: just remove from UI
            setNotifications(prev => prev.filter(n => n.id !== id));
        }
    };

    const clearAll = async () => {
        try {
            await api.clearAllNotifications();
        } catch {
            // Fail silently — clear from UI anyway
        }
        setNotifications([]);
        onUnreadCountChange?.(0);
    };

    const handleView = (notif) => {
        onClose();
        if (notif.link) navigate(notif.link);
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <AnimatePresence>
            {isOpen && (
                <React.Fragment>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9998]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                        className="fixed top-0 right-0 bottom-0 w-full max-w-[400px] bg-white z-[9999] flex flex-col border-l border-slate-200 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/40">
                            <div className="flex items-center gap-2.5">
                                <span className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg shadow-sm">🔔</span>
                                <div>
                                    <h2 className="text-[13px] font-black text-slate-800 uppercase tracking-widest leading-none">Notifications</h2>
                                    {unreadCount > 0 && (
                                        <p className="text-[11px] text-blue-600 font-bold mt-0.5">{unreadCount} new</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="text-[11px] font-bold text-slate-500 hover:text-rose-600 uppercase tracking-wider px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                                        title="Clear all notifications"
                                    >
                                        Clear All
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto bg-white px-3 py-3 space-y-2">
                            {loading ? (
                                <div className="flex flex-col gap-3 mt-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="animate-pulse flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 bg-slate-200 rounded w-3/4" />
                                                <div className="h-2.5 bg-slate-100 rounded w-full" />
                                                <div className="h-2 bg-slate-100 rounded w-1/3" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-56 text-center px-6">
                                    <div className="text-5xl mb-4">🎉</div>
                                    <h3 className="text-sm font-black text-slate-800 mb-1">You're all caught up!</h3>
                                    <p className="text-[12px] text-slate-400 font-medium leading-relaxed">
                                        No new notifications. We'll let you know when something needs your attention.
                                    </p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`relative p-4 rounded-xl border transition-all duration-300 ${notif.is_read
                                            ? 'bg-white border-slate-100'
                                            : 'bg-blue-50/60 border-blue-100 shadow-sm'}`}
                                    >
                                        {/* Unread dot */}
                                        {!notif.is_read && (
                                            <span className="absolute top-3.5 right-10 w-2 h-2 rounded-full bg-blue-500" />
                                        )}

                                        {/* Dismiss (×) */}
                                        <button
                                            onClick={() => dismissNotification(notif.id)}
                                            className="absolute top-3 right-3 w-5 h-5 rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
                                            title="Dismiss"
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>

                                        <div className="flex gap-3 pr-4">
                                            {/* Icon */}
                                            <div className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-xl text-lg border ${notif.is_read ? 'bg-slate-50 border-slate-100 grayscale opacity-60' : 'bg-white border-blue-100 shadow-sm'}`}>
                                                {getIconForType(notif.notification_type)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-[13px] font-bold leading-snug mb-0.5 ${notif.is_read ? 'text-slate-500' : 'text-slate-900'}`}>
                                                    {notif.title}
                                                </h4>
                                                <p className={`text-[12px] leading-relaxed ${notif.is_read ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                        {timeAgo(notif.created_at)}
                                                    </span>
                                                    {notif.link && (
                                                        <button
                                                            onClick={() => handleView(notif)}
                                                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                                                        >
                                                            View →
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/80 text-center">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                                JYNM — Powered by Smart Auto Search
                            </span>
                        </div>
                    </motion.div>
                </React.Fragment>
            )}
        </AnimatePresence>
    );
}
