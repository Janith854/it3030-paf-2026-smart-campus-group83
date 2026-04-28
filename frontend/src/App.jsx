import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import { NotificationProvider } from './context/NotificationContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
// Dashboards
import UserDashboard from './components/dashboards/UserDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import TechnicianDashboard from './components/dashboards/TechnicianDashboard';
// Pages
import BookingsPage from './pages/BookingsPage';
import ResourcesPage from './pages/ResourcesPage';
import ResourceDetailsPage from './pages/ResourceDetailsPage';
import TicketsPage from './pages/TicketsPage';
import NotificationsPage from './pages/NotificationsPage';
import NotificationPreferencesPage from './pages/NotificationPreferencesPage';
import AdminPage from './pages/AdminPage';
import ResourceBookingsPage from './pages/ResourceBookingsPage';
const DashboardRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login', { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin-dashboard', { replace: true });
      } else if (user.role === 'TECHNICIAN') {
        navigate('/tech-dashboard', { replace: true });
      } else {
        navigate('/user-dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return <div style={{ padding: '2rem', color: '#64748b' }}>Loading your workspace...</div>;
};


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Navigate to="/login" replace />} />

            {/* Dashboard Routing — role-based redirect */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* ── User (Lecturer/Student) Dashboard ─────────────────────── */}
            <Route path="/user-dashboard" element={<DashboardLayout />}>
              <Route index element={<UserDashboard />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="resources/:id" element={<ResourceDetailsPage />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="preferences" element={<NotificationPreferencesPage />} />
            </Route>
            {/* Legacy alias */}
            <Route path="/lecturer/*" element={<Navigate to="/user-dashboard" replace />} />

            {/* ── Admin Dashboard ────────────────────────────────────────── */}
            <Route path="/admin-dashboard" element={<DashboardLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="resources/:id" element={<ResourceDetailsPage />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="users" element={<AdminPage />} />
              <Route path="preferences" element={<NotificationPreferencesPage />} />
              <Route path="resource-bookings" element={<ResourceBookingsPage />} />
            </Route>
            {/* Legacy alias */}
            <Route path="/admin/*" element={<Navigate to="/admin-dashboard" replace />} />

            {/* ── Technician Dashboard ───────────────────────────────────── */}
            <Route path="/tech-dashboard" element={<DashboardLayout />}>
              <Route index element={<TechnicianDashboard />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="preferences" element={<NotificationPreferencesPage />} />
            </Route>
            {/* Legacy alias */}
            <Route path="/technician/*" element={<Navigate to="/tech-dashboard" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
