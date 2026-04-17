import React, { useState } from 'react';
import { Search, Bell, User, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';

const TopNavbar = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

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
          <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200"></div>

        {/* User Dropdown */}
        <div className="flex items-center gap-3 pl-2 group cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name}</p>
            <p className="text-xs text-slate-500 mt-1 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
          <div className="h-9 w-9 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl flex items-center justify-center font-bold">
            {user?.name?.charAt(0)}
          </div>
          <ChevronDown size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </div>
      </div>

      {/* Notification Slide Panel placeholder - implemented separately */}
      <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </header>
  );
};

export default TopNavbar;
