import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  CalendarCheck, 
  Ticket, 
  Settings, 
  LogOut,
  ShieldCheck,
  Wrench
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
    { name: 'Facilities', icon: Building2, path: '/facilities', roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
    { name: 'Bookings', icon: CalendarCheck, path: '/bookings', roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
    { name: 'Maintenance', icon: Ticket, path: '/tickets', roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
  ];

  const adminItems = [
    { name: 'Role Management', icon: ShieldCheck, path: '/admin/roles', roles: ['ADMIN'] },
    { name: 'Asset Health', icon: Wrench, path: '/admin/assets', roles: ['ADMIN'] },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-xl">
          <Building2 size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight">SmartCampus</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">Main Menu</div>
        {navItems.filter(item => item.roles.includes(user?.role)).map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon size={20} className={cn("transition-colors", "group-hover:text-white")} />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}

        {user?.role === 'ADMIN' && (
          <>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mt-8 mb-2">Administration</div>
            {adminItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-indigo-400">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.name || 'Guest User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
