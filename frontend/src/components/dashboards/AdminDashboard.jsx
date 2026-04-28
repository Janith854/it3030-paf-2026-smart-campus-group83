import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsApi, ticketsApi, notificationsApi, usersApi, resourcesApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Clock, Wrench, Activity, ArrowRight, Users, Building2 } from 'lucide-react';
import AnalyticsDashboard from '../AnalyticsDashboard';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingBookings: 0,
    openTickets: 0,
    activeResources: 0
  });
  const [recentPendingBookings, setRecentPendingBookings] = useState([]);
  const [recentOpenTickets, setRecentOpenTickets] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [bookings, tickets, notifs, users, resources] = await Promise.all([
          bookingsApi.getAll('PENDING').catch(() => []),
          ticketsApi.getAll().catch(() => []),
          notificationsApi.getAll().catch(() => []),
          usersApi.getAll().catch(() => []),
          resourcesApi.getAll().catch(() => []),
        ]);

        const bArray = Array.isArray(bookings) ? bookings : [];
        const tArray = Array.isArray(tickets) ? tickets : [];
        const nArray = Array.isArray(notifs) ? notifs : [];
        const uArray = Array.isArray(users) ? users : [];
        const rArray = Array.isArray(resources) ? resources : [];

        const openTickets = tArray.filter(t => t.status === 'OPEN');

        setStats({
          totalUsers: uArray.length,
          pendingBookings: bArray.length,
          openTickets: openTickets.length,
          activeResources: rArray.length
        });

        // Take the latest 3-4 items for recent activity
        setRecentPendingBookings(bArray.slice(-4).reverse());
        setRecentOpenTickets(openTickets.slice(-4).reverse());
        setRecentNotifications(nArray.slice(0, 5));
      } catch (error) {
        console.error('Failed to load admin dashboard:', error);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name || 'Administrator'}</h1>
          <p className="page-subtitle">Here is your Admin overview for today.</p>
        </div>
      </div>

      <div className="summary-grid mb-3">
        {/* Total Users */}
        <div className="summary-card border-blue">
          <div className="summary-card__content">
            <div className="summary-card__label">Total Users</div>
            <div className="summary-card__value">{loading ? '--' : stats.totalUsers}</div>
          </div>
          <div className="summary-card__icon bg-blue-wash text-blue">
            <Users size={20} />
          </div>
        </div>

        {/* Pending Bookings */}
        <div className="summary-card border-orange">
          <div className="summary-card__content">
            <div className="summary-card__label">Pending Bookings</div>
            <div className="summary-card__value">{loading ? '--' : stats.pendingBookings}</div>
          </div>
          <div className="summary-card__icon bg-orange-wash text-orange">
            <Clock size={20} />
          </div>
        </div>

        {/* Open Tickets */}
        <div className="summary-card border-red">
          <div className="summary-card__content">
            <div className="summary-card__label">Open Tickets</div>
            <div className="summary-card__value">{loading ? '--' : stats.openTickets}</div>
          </div>
          <div className="summary-card__icon bg-red-wash text-red">
            <Wrench size={20} />
          </div>
        </div>

        {/* Active Resources */}
        <div className="summary-card border-green">
          <div className="summary-card__content">
            <div className="summary-card__label">Active Resources</div>
            <div className="summary-card__value">{loading ? '--' : stats.activeResources}</div>
          </div>
          <div className="summary-card__icon bg-green-wash text-green">
            <Building2 size={20} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <AnalyticsDashboard />
      </div>

      <div className="grid-3">
        {/* Pending Approvals Widget */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex-gap">
              <Clock size={16} className="text-primary" />
              Pending Bookings
            </h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/admin-dashboard/bookings')}
            >
              View All <ArrowRight size={12} />
            </button>
          </div>
          {loading ? (
            <div className="text-muted text-sm">Loading...</div>
          ) : recentPendingBookings.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">No pending bookings.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentPendingBookings.map(b => (
                <div key={`b-${b.id}`} style={{ padding: '12px', background: 'var(--primary-wash)', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex-between mb-1">
                    <div className="font-medium text-sm" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '8px' }}>{b.purpose}</div>
                  </div>
                  <div className="text-sm text-muted">Date: {b.bookingDate} {b.startTime} - {b.endTime}</div>
                  <div className="mt-2">
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin-dashboard/bookings')}>Review</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Open Tickets Widget */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex-gap">
              <Wrench size={16} className="text-danger" />
              Recent Open Tickets
            </h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/admin-dashboard/tickets')}
            >
              View All <ArrowRight size={12} />
            </button>
          </div>
          {loading ? (
            <div className="text-muted text-sm">Loading...</div>
          ) : recentOpenTickets.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">No open tickets.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentOpenTickets.map(t => (
                <div key={`t-${t.id}`} className={`ticket-card priority-${t.priority?.toLowerCase() || 'medium'}`} style={{ padding: '12px', background: 'var(--primary-wash)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div className="flex-between mb-1">
                    <div className="font-medium text-sm" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '8px' }}>{t.category}</div>
                    <span className={`badge badge-${t.priority?.toLowerCase() || 'pending'}`} style={{ flexShrink: 0 }}>{t.priority}</span>
                  </div>
                  <div className="text-sm text-muted mb-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.description}</div>
                  <div>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin-dashboard/tickets')}>Assign</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Notifications Widget */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex-gap">
              <Activity size={16} className="text-primary" />
              Recent System Alerts
            </h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/admin-dashboard/notifications')}
            >
              View All <ArrowRight size={12} />
            </button>
          </div>
          {loading ? (
            <div className="text-muted text-sm">Loading...</div>
          ) : recentNotifications.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">No recent alerts.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentNotifications.map(n => (
                <div key={`n-${n.id}`} className={n.isRead ? 'notification-item read' : 'notification-item unread'} style={{ padding: '12px', margin: 0 }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div className={n.isRead ? 'font-medium text-sm' : 'font-bold text-sm'} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</div>
                    <div className="text-sm text-muted mt-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.message}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-hint)', marginTop: '4px' }}>{n.createdAt && new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
