import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Legacy Redirect */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />

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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
