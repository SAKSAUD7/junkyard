import { useState, useEffect } from 'react';
import { vendorNotifications } from '../../services/vendorApi';
import '../../styles/vendor.css';

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

    if (loading) {
        return <div>Loading notifications...</div>;
    }

    const filteredNotifications = getFilteredNotifications();
    const unreadCount = notifications.filter(n => !n.is_read).length;

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
                        Notifications
                        {unreadCount > 0 && (
                            <span style={{
                                marginLeft: '0.5rem',
                                fontSize: '1rem',
                                backgroundColor: 'var(--vendor-error)',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '999px',
                                fontWeight: 600
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </h1>
                    <p style={{
                        color: 'var(--vendor-text-secondary)',
                        fontSize: '0.875rem',
                        margin: 0
                    }}>
                        Stay updated with your vendor account activity
                    </p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{
                marginBottom: 'var(--vendor-spacing-lg)',
                display: 'flex',
                gap: 'var(--vendor-spacing-sm)',
                borderBottom: '1px solid var(--vendor-border)',
                paddingBottom: 'var(--vendor-spacing-sm)'
            }}>
                <button
                    onClick={() => setFilter('all')}
                    style={{
                        padding: 'var(--vendor-spacing-sm) var(--vendor-spacing-md)',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontWeight: filter === 'all' ? 600 : 400,
                        color: filter === 'all' ? 'var(--vendor-primary)' : 'var(--vendor-text-secondary)',
                        borderBottom: filter === 'all' ? '2px solid var(--vendor-primary)' : 'none',
                        marginBottom: '-1px'
                    }}
                >
                    All ({notifications.length})
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    style={{
                        padding: 'var(--vendor-spacing-sm) var(--vendor-spacing-md)',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontWeight: filter === 'unread' ? 600 : 400,
                        color: filter === 'unread' ? 'var(--vendor-primary)' : 'var(--vendor-text-secondary)',
                        borderBottom: filter === 'unread' ? '2px solid var(--vendor-primary)' : 'none',
                        marginBottom: '-1px'
                    }}
                >
                    Unread ({unreadCount})
                </button>
                <button
                    onClick={() => setFilter('read')}
                    style={{
                        padding: 'var(--vendor-spacing-sm) var(--vendor-spacing-md)',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontWeight: filter === 'read' ? 600 : 400,
                        color: filter === 'read' ? 'var(--vendor-primary)' : 'var(--vendor-text-secondary)',
                        borderBottom: filter === 'read' ? '2px solid var(--vendor-primary)' : 'none',
                        marginBottom: '-1px'
                    }}
                >
                    Read ({notifications.length - unreadCount})
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

            {/* Notifications List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vendor-spacing-md)' }}>
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className="vendor-card"
                            style={{
                                backgroundColor: notification.is_read ? 'var(--vendor-bg-primary)' : 'var(--vendor-bg-tertiary)',
                                borderLeft: notification.is_read ? 'none' : '4px solid var(--vendor-primary)',
                                cursor: 'pointer'
                            }}
                            onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                        >
                            <div style={{ display: 'flex', gap: 'var(--vendor-spacing-md)' }}>
                                <div style={{ fontSize: '2rem' }}>
                                    {getNotificationIcon(notification.notification_type)}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: 'var(--vendor-spacing-xs)'
                                    }}>
                                        <h3 style={{
                                            margin: 0,
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            color: 'var(--vendor-text-primary)'
                                        }}>
                                            {notification.title}
                                        </h3>

                                        <div style={{ display: 'flex', gap: 'var(--vendor-spacing-sm)', alignItems: 'center' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--vendor-text-secondary)'
                                            }}>
                                                {new Date(notification.created_at).toLocaleDateString()}
                                            </span>

                                            {!notification.is_read && (
                                                <span style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    backgroundColor: 'var(--vendor-primary)',
                                                    borderRadius: '50%'
                                                }} />
                                            )}
                                        </div>
                                    </div>

                                    <p style={{
                                        margin: '0 0 var(--vendor-spacing-sm) 0',
                                        color: 'var(--vendor-text-secondary)',
                                        fontSize: '0.875rem'
                                    }}>
                                        {notification.message}
                                    </p>

                                    {notification.lead_info && (
                                        <div style={{
                                            backgroundColor: 'var(--vendor-bg-secondary)',
                                            padding: 'var(--vendor-spacing-sm)',
                                            borderRadius: 'var(--vendor-radius)',
                                            fontSize: '0.875rem'
                                        }}>
                                            <strong>Lead:</strong> {notification.lead_info.vehicle} - {notification.lead_info.part}
                                        </div>
                                    )}

                                    <div style={{ marginTop: 'var(--vendor-spacing-sm)' }}>
                                        <span className={`vendor-badge ${notification.notification_type === 'new_lead' ? 'vendor-badge-info' :
                                                notification.notification_type === 'lead_update' ? 'vendor-badge-warning' :
                                                    notification.notification_type === 'system' ? 'vendor-badge-neutral' :
                                                        'vendor-badge-success'
                                            }`}>
                                            {notification.type_display}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="vendor-card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--vendor-text-primary)' }}>
                            No notifications
                        </h3>
                        <p style={{ margin: 0, color: 'var(--vendor-text-secondary)' }}>
                            {filter === 'unread'
                                ? "You're all caught up! No unread notifications."
                                : filter === 'read'
                                    ? "No read notifications yet."
                                    : "You don't have any notifications yet."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorNotifications;
