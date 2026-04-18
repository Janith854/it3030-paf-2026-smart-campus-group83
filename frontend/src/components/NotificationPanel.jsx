import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Bell, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  Wrench, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import api from '../utils/api';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
    
    // Polling logic: 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all read', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BOOKING_APPROVED': return { icon: CheckCircle, color: 'bg-green-100 text-green-600' };
      case 'BOOKING_REJECTED': return { icon: AlertCircle, color: 'bg-red-100 text-red-600' };
      case 'TICKET_ASSIGNED': return { icon: Wrench, color: 'bg-blue-100 text-blue-600' };
      case 'TICKET_STATUS_CHANGED': return { icon: Info, color: 'bg-indigo-100 text-indigo-600' };
      case 'TICKET_COMMENT_ADDED': return { icon: MessageSquare, color: 'bg-amber-100 text-amber-600' };
      default: return { icon: Bell, color: 'bg-slate-100 text-slate-600' };
    }
  };

  const getTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full max-w-sm bg-white shadow-2xl z-[70] flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                  <Bell size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-950">Alert Center</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Close notifications"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                   <Bell size={40} className="mb-4 opacity-20" />
                   <p className="text-sm font-medium">All caught up!</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const { icon: Icon, color } = getNotificationIcon(n.type);
                  return (
                    <div 
                      key={n.id} 
                      onClick={() => !n.read && handleMarkAsRead(n.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden
                        ${n.read 
                          ? 'bg-white border-slate-100 opacity-60' 
                          : 'bg-indigo-50/30 border-indigo-100 shadow-sm hover:shadow-md'}`}
                    >
                      {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}
                      <div className="flex gap-4">
                        <div className={`mt-0.5 h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${color} shadow-sm`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <h3 className={`text-sm font-bold truncate pr-2 ${n.read ? 'text-slate-600' : 'text-slate-900'}`}>{n.title}</h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter shrink-0">{getTimeAgo(n.createdAt)}</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-medium">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <button 
                onClick={handleMarkAllRead}
                className="w-full py-4 bg-white border border-slate-200 text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:border-indigo-200 shadow-sm rounded-xl transition-all"
              >
                Mark all as read
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
