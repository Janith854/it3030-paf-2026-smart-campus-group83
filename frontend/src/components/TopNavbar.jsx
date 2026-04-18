import React, { useState, useEffect } from 'react';
import { Search, Bell, User, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';
import api from '../utils/api';

const TopNavbar = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-slate-100 z-40 px-8 flex items-center justify-between shadow-sm">
      {/* Search Bar */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search bookings, tickets, or facilities..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
        />
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl relative transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-4 w-4 bg-indigo-600 text-[10px] font-black text-white flex items-center justify-center rounded-full border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200"></div>

        {/* User Dropdown */}
        <div className="flex items-center gap-3 pl-2 group cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors">
          <div className="text-right hidden sm:block font-medium">
            <p className="text-sm font-bold text-slate-900 leading-none">{user?.name}</p>
            <p className="text-[10px] font-black text-indigo-500 mt-1 uppercase tracking-widest leading-none">{user?.role}</p>
          </div>
          <div className="h-9 w-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold shadow-soft">
            {user?.name?.charAt(0)}
          </div>
          <ChevronDown size={14} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </div>
      </div>

      <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </header>
  );
};

export default TopNavbar;
