import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap, LayoutDashboard, CalendarDays, Building2,
  Wrench, Bell, Users, LogOut,
} from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import './dashboard.css';

export default function DashboardLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="login-page">
        <div style={{ color: '#64748b', fontSize: '1rem' }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  const isAdmin = user.role === 'ADMIN';
  const isTechnician = user.role === 'TECHNICIAN';
  const isUser = !isAdmin && !isTechnician;

  // Determine actual base path based on role
  let correctBasePath = '/lecturer';
  if (isAdmin) correctBasePath = '/admin';
  else if (isTechnician) correctBasePath = '/technician';

  // Authorization check: if on a path not matching their role, redirect
  // (We use a simple check based on URL, or we can just rely on the correct base path)
  if (window.location.pathname.startsWith('/admin') && !isAdmin) {
    navigate(correctBasePath, { replace: true });
    return null;
  }
  if (window.location.pathname.startsWith('/technician') && !isTechnician) {
    navigate(correctBasePath, { replace: true });
    return null;
  }

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  let navItems = [
    { to: correctBasePath,              icon: LayoutDashboard, label: 'Dashboard',     end: true },
  ];

  if (isAdmin) {
    navItems.push(
      { to: `${correctBasePath}/bookings`,     icon: CalendarDays,    label: 'Bookings' },
      { to: `${correctBasePath}/resources`,    icon: Building2,       label: 'Resources' },
      { to: `${correctBasePath}/tickets`,      icon: Wrench,          label: 'Tickets' },
      { to: `${correctBasePath}/notifications`,icon: Bell,            label: 'Notifications' },
      { to: `${correctBasePath}/users`,        icon: Users,           label: 'Users & Roles' }
    );
  } else if (isTechnician) {
    navItems.push(
      { to: `${correctBasePath}/tickets`,      icon: Wrench,          label: 'Tickets' },
      { to: `${correctBasePath}/notifications`,icon: Bell,            label: 'Notifications' }
    );
  } else {
    // Regular User / Lecturer
    navItems.push(
      { to: `${correctBasePath}/bookings`,     icon: CalendarDays,    label: 'Bookings' },
      { to: `${correctBasePath}/tickets`,      icon: Wrench,          label: 'Tickets' },
      { to: `${correctBasePath}/notifications`,icon: Bell,            label: 'Notifications' }
    );
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <NavLink to="/" className="sidebar__logo">
          <div className="sidebar__logo-icon"><Zap size={16} color="#fff" /></div>
          <span>Smart<span className="sidebar__logo-accent">Campus</span></span>
        </NavLink>

        <nav className="sidebar__nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__user">
          <div className="sidebar__avatar">
            {user.picture
              ? <img src={user.picture} alt={user.name} />
              : initials}
          </div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{user.name || user.email}</div>
            <div className="sidebar__user-role">{user.role}</div>
          </div>
          <button className="sidebar__logout" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dashboard__main">
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '1rem' }}>
          <NotificationBell />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
