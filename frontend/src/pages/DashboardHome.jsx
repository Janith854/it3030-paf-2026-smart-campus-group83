import { useAuth } from '../context/AuthContext';
import UserDashboard from '../components/dashboards/UserDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import TechnicianDashboard from '../components/dashboards/TechnicianDashboard';

export default function DashboardHome() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';

  if (isAdmin) {
    return <AdminDashboard user={user} />;
  }
  
  if (isTechnician) {
    return <TechnicianDashboard user={user} />;
  }

  // Default to User Dashboard
  return <UserDashboard user={user} />;
}
