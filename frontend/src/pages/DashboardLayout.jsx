import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap, LayoutDashboard, CalendarDays, Building2,
  Wrench, Bell, Users, LogOut, Settings
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
  let correctBasePath = '/user-dashboard';
  if (isAdmin) correctBasePath = '/admin-dashboard';
  else if (isTechnician) correctBasePath = '/tech-dashboard';

  // Authorization guard: prevent accessing a dashboard belonging to another role
  if (window.location.pathname.startsWith('/admin-dashboard') && !isAdmin) {
    navigate(correctBasePath, { replace: true });
    return null;
  }
  if (window.location.pathname.startsWith('/tech-dashboard') && !isTechnician) {
    navigate(correctBasePath, { replace: true });
    return null;
  }
  if (window.location.pathname.startsWith('/user-dashboard') && !isUser) {
    navigate(correctBasePath, { replace: true });
    return null;
  }

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  let navItems = [
    { to: correctBasePath, icon: LayoutDashboard, label: 'Dashboard', end: true },
  ];

  if (isAdmin) {
    navItems.push(
      { to: `${correctBasePath}/bookings`, icon: CalendarDays, label: 'Bookings' },
      { to: `${correctBasePath}/resources`, icon: Building2, label: 'Resources' },
      { to: `${correctBasePath}/tickets`, icon: Wrench, label: 'Tickets' },
      { to: `${correctBasePath}/notifications`, icon: Bell, label: 'Notifications' },
      { to: `${correctBasePath}/users`, icon: Users, label: 'Users & Roles' }
    );
  } else if (isTechnician) {
    navItems.push(
      { to: `${correctBasePath}/tickets`, icon: Wrench, label: 'Tickets' },
      { to: `${correctBasePath}/notifications`, icon: Bell, label: 'Notifications' }
    );
  } else {
    // Regular User / Lecturer
    navItems.push(
      { to: `${correctBasePath}/bookings`, icon: CalendarDays, label: 'Bookings' },
      { to: `${correctBasePath}/tickets`, icon: Wrench, label: 'Tickets' },
      { to: `${correctBasePath}/notifications`, icon: Bell, label: 'Notifications' }
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <NavLink to="/" className="sidebar-logo">
          <Zap size={16} />
          <span>SmartCampus</span>
        </NavLink>

        <div className="sidebar-section-label" style={{ marginTop: '16px' }}>Main Menu</div>
        <nav>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-section-label" style={{ marginTop: '24px' }}>Account</div>
        <nav>
          <NavLink 
            to={`${correctBasePath}/preferences`} 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Settings size={16} />
            Preferences
          </NavLink>
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar" style={{ width: '28px', height: '28px' }}>
            {user.picture ? (
              <img src={user.picture} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              initials
            )}
          </div>
          <div>
            <div className="sidebar-user-name" style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || user.email}</div>
            <div className="sidebar-user-role">
              {isAdmin ? 'Administrator' : isTechnician ? 'Technician' : 'User'}
            </div>
          </div>
        </div>
      </aside>

      {/* Top Navbar */}
      <header className="dashboard-navbar">
        <div style={{ flex: 1 }}></div>
        <div className="dashboard-navbar-right">
          <NotificationBell />
          <div className="dashboard-navbar-user">
            <div className="user-avatar">
              {user.picture ? (
                <img src={user.picture} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </div>
            <div>
              <div className="user-name">{user.name || user.email}</div>
              <div className="user-role-badge">
                {isAdmin ? 'Admin' : isTechnician ? 'Tech' : 'User'}
              </div>
            </div>
            <button className="sidebar-sign-out" style={{ marginLeft: '12px' }} onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
