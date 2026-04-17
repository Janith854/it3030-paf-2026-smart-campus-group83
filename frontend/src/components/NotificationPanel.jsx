import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Info, CheckCircle, AlertTriangle } from 'lucide-react';

const NotificationPanel = ({ isOpen, onClose }) => {
  const notifications = [
    { 
      id: 1, 
      title: 'Booking Approved', 
      message: 'Your request for Lecture Hall A is approved.', 
      time: '10m ago', 
      type: 'success',
      icon: CheckCircle
    },
    { 
      id: 2, 
      title: 'Ticket #1024 Updated', 
      message: 'Technician assigned to your maintenance request.', 
      time: '1h ago', 
      type: 'info',
      icon: Info
    },
    { 
      id: 3, 
      title: 'Maintenance Alert', 
      message: 'Server room B will be under maintenance tonight.', 
      time: '5h ago', 
      type: 'warning',
      icon: AlertTriangle
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-96 bg-white shadow-2xl z-[70] flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-950">Notifications</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Close notifications"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex gap-4">
                    <div className={`mt-1 h-10 w-10 shrink-0 rounded-xl flex items-center justify-center
                      ${n.type === 'success' ? 'bg-green-100 text-green-600' : 
                        n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 
                        'bg-blue-100 text-blue-600'}`}>
                      <n.icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-sm font-bold text-slate-900 truncate pr-2">{n.title}</h3>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter shrink-0">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <button className="w-full py-3 text-sm font-bold text-indigo-600 hover:bg-white hover:shadow-sm rounded-xl transition-all">
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
