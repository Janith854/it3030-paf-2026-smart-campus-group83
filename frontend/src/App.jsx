import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import { NotificationProvider } from './context/NotificationContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './pages/DashboardLayout';
// Dashboards
import UserDashboard from './components/dashboards/UserDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import TechnicianDashboard from './components/dashboards/TechnicianDashboard';
// Pages
import BookingsPage from './pages/BookingsPage';
import ResourcesPage from './pages/ResourcesPage';
import TicketsPage from './pages/TicketsPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';
const DashboardRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login', { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'TECHNICIAN') {
        navigate('/technician', { replace: true });
      } else {
        navigate('/lecturer', { replace: true });
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
            <Route path="/register" element={<RegisterPage />} />

            {/* Dashboard Routing */}
            <Route path="/dashboard" element={<DashboardRedirect />} />


            {/* Lecturer (User) Space */}
            <Route path="/lecturer" element={<DashboardLayout testRole="USER" />}>
              <Route index element={<UserDashboard />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Admin Space */}
            <Route path="/admin" element={<DashboardLayout testRole="ADMIN" />}>
              <Route index element={<AdminDashboard />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="users" element={<AdminPage />} />
            </Route>

            {/* Technician Space */}
            <Route path="/technician" element={<DashboardLayout testRole="TECHNICIAN" />}>
              <Route index element={<TechnicianDashboard />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
