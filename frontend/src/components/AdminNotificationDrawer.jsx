import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

/**
 * Modern slide-out drawer for Admin System Notifications
 * Replaces the previous "dropdown" approach which suffered from z-index collisions.
 */
export default function AdminNotificationDrawer({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch notifications when drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      // data.results since it's a paginated ViewSet by default
      setNotifications(data.results || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id, link) => {
    try {
      await api.markNotificationAsRead(id);
      // Optimistically update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      // Close drawer if clicking through
      if (link) {
        onClose();
        navigate(link);
      }
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'lead': return '🚗';
      case 'payment': return '💳';
      case 'feedback': return '🗣️';
      default: return '🔔';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9998]"
          />

          {/* Right Side Drawer */}
          <motion.div
            initial={{ x: '100%', boxShadow: '-10px 0 30px rgba(0,0,0,0)' }}
            animate={{ x: 0, boxShadow: '-10px 0 30px rgba(0,0,0,0.1)' }}
            exit={{ x: '100%', boxShadow: '-10px 0 30px rgba(0,0,0,0)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-[400px] bg-white z-[9999] flex flex-col border-l border-slate-200"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg">🔔</span>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Notifications</h2>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Actions */}
            {notifications.some(n => !n.is_read) && (
              <div className="px-6 py-3 border-b border-slate-100 flex justify-end">
                <button 
                  onClick={markAllAsRead}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider"
                >
                  Mark all as read
                </button>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto bg-white p-4 space-y-3">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center px-6">
                  <div className="text-4xl mb-3 opacity-50">📭</div>
                  <h3 className="text-sm font-bold text-slate-700">No new notification yet</h3>
                  <p className="text-[12px] text-slate-400 font-medium mt-1">Check back later for new notifications.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`relative p-4 rounded-xl border transition-all ${notif.is_read ? 'bg-white border-slate-100' : 'bg-blue-50/50 border-blue-100 shadow-sm'}`}
                  >
                    {!notif.is_read && (
                      <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500"></span>
                    )}
                    
                    <div className="flex gap-3">
                      <div className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-lg ${notif.is_read ? 'bg-slate-100 grayscale opacity-70' : 'bg-white shadow-sm border border-slate-100'}`}>
                        {getIconForType(notif.notification_type)}
                      </div>
                      
                      <div className="flex-1 pr-4">
                        <div className="flex items-baseline justify-between mb-1">
                          <h4 className={`text-[13px] font-bold ${notif.is_read ? 'text-slate-600' : 'text-slate-900'}`}>
                            {notif.title}
                          </h4>
                        </div>
                        <p className={`text-[12px] leading-relaxed mb-2 ${notif.is_read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                          {notif.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {new Date(notif.created_at).toLocaleDateString()}
                          </span>
                          
                          <div className="flex gap-2">
                            {notif.link && (
                              <button 
                                onClick={() => markAsRead(notif.id, notif.link)}
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest bg-blue-100/50 hover:bg-blue-100 px-3 py-1 rounded"
                              >
                                View
                              </button>
                            )}
                            {!notif.is_read && !notif.link && (
                              <button 
                                onClick={() => markAsRead(notif.id)}
                                className="text-[11px] font-bold text-slate-500 hover:text-slate-700 uppercase tracking-widest bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded transition-colors"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">JYNM Admin Portal v2.0</span>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
