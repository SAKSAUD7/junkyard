import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vendorNotifications } from '../../services/vendorApi';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            const response = await vendorNotifications.list();
            const allNotifications = response.data.results || response.data;
            setNotifications(allNotifications.slice(0, 5)); // Show only latest 5
            setUnreadCount(allNotifications.filter(n => !n.is_read).length);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await vendorNotifications.markAsRead(id);
            loadNotifications();
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new_lead':
                return '📋';
            case 'lead_update':
                return '🔄';
            case 'system':
                return '⚙️';
            case 'account':
                return '👤';
            default:
                return '🔔';
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                    position: 'relative',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: 'var(--vendor-radius)',
                    transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--vendor-bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '0.25rem',
                        right: '0.25rem',
                        backgroundColor: 'var(--vendor-error)',
                        color: 'white',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        padding: '0.125rem 0.375rem',
                        borderRadius: '999px',
                        minWidth: '1.25rem',
                        textAlign: 'center'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setShowDropdown(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 40
                        }}
                    />

                    {/* Dropdown */}
                    <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 0.5rem)',
                        right: 0,
                        width: '360px',
                        maxHeight: '400px',
                        backgroundColor: 'var(--vendor-bg-primary)',
                        border: '1px solid var(--vendor-border)',
                        borderRadius: 'var(--vendor-radius-lg)',
                        boxShadow: 'var(--vendor-shadow-lg)',
                        zIndex: 50,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: 'var(--vendor-spacing-md)',
                            borderBottom: '1px solid var(--vendor-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                                Notifications
                            </h3>
                            <Link
                                to="/vendor/notifications"
                                onClick={() => setShowDropdown(false)}
                                style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--vendor-primary)',
                                    textDecoration: 'none'
                                }}
                            >
                                View All
                            </Link>
                        </div>

                        {/* Notifications List */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            maxHeight: '320px'
                        }}>
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => {
                                            if (!notification.is_read) {
                                                handleMarkAsRead(notification.id);
                                            }
                                            setShowDropdown(false);
                                        }}
                                        style={{
                                            padding: 'var(--vendor-spacing-md)',
                                            borderBottom: '1px solid var(--vendor-border)',
                                            cursor: 'pointer',
                                            backgroundColor: notification.is_read ? 'transparent' : 'var(--vendor-bg-tertiary)',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--vendor-bg-secondary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notification.is_read ? 'transparent' : 'var(--vendor-bg-tertiary)'}
                                    >
                                        <div style={{ display: 'flex', gap: 'var(--vendor-spacing-sm)' }}>
                                            <div style={{ fontSize: '1.5rem' }}>
                                                {getNotificationIcon(notification.notification_type)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    <h4 style={{
                                                        margin: 0,
                                                        fontSize: '0.875rem',
                                                        fontWeight: 600
                                                    }}>
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.is_read && (
                                                        <span style={{
                                                            width: '6px',
                                                            height: '6px',
                                                            backgroundColor: 'var(--vendor-primary)',
                                                            borderRadius: '50%',
                                                            marginTop: '0.25rem'
                                                        }} />
                                                    )}
                                                </div>
                                                <p style={{
                                                    margin: '0 0 0.25rem 0',
                                                    fontSize: '0.75rem',
                                                    color: 'var(--vendor-text-secondary)',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {notification.message}
                                                </p>
                                                <span style={{
                                                    fontSize: '0.625rem',
                                                    color: 'var(--vendor-text-tertiary)'
                                                }}>
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{
                                    padding: '2rem',
                                    textAlign: 'center',
                                    color: 'var(--vendor-text-secondary)'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
                                    <p style={{ margin: 0, fontSize: '0.875rem' }}>
                                        No notifications yet
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
