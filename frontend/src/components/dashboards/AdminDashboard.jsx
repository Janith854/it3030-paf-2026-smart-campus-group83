import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { bookingsApi, ticketsApi, resourcesApi, usersApi, notificationsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Users, Clock, Wrench, Building2, Activity, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, pendingBookings: 0, openTickets: 0, activeResources: 0, unread: 0 });
  const [recentPendingBookings, setRecentPendingBookings] = useState([]);
  const [recentOpenTickets, setRecentOpenTickets] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [usersData, bookings, tickets, resources, notifs] = await Promise.all([
          usersApi.getAll().catch(() => []),
          bookingsApi.getAll('PENDING').catch(() => []),
          ticketsApi.getAll('OPEN').catch(() => []),
          resourcesApi.getAll().catch(() => []),
          notificationsApi.getAll().catch(() => []),
        ]);

        const uArray = Array.isArray(usersData) ? usersData : [];
        const bArray = Array.isArray(bookings) ? bookings : [];
        const tArray = Array.isArray(tickets) ? tickets : [];
        const rArray = Array.isArray(resources) ? resources : [];
        const nArray = Array.isArray(notifs) ? notifs : [];

        setStats({
          totalUsers: uArray.length,
          pendingBookings: bArray.length,
          openTickets: tArray.length,
          activeResources: rArray.filter(r => r.status === 'ACTIVE').length,
          unread: nArray.filter(n => !n.isRead).length
        });

        // Take the latest 3-4 items for recent activity
        setRecentPendingBookings(bArray.slice(-4).reverse());
        setRecentOpenTickets(tArray.slice(-4).reverse());
        setRecentNotifications(nArray.slice(0, 5));
      } catch (error) {
        console.error('Failed to load admin dashboard:', error);
      }
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#3b82f6' },
    { label: 'Pending Bookings', value: stats.pendingBookings, icon: Clock, color: '#f59e0b' },
    { label: 'Open Tickets', value: stats.openTickets, icon: Wrench, color: '#ef4444' },
    { label: 'Active Resources', value: stats.activeResources, icon: Building2, color: '#10b981' },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name || 'Administrator'}</h1>
          <p className="page-subtitle">Here is your Admin overview for today.</p>
        </div>
      </div>

      <div className="card-grid mb-3">
        {cards.map((c, i) => (
          <div className="stat-card" key={i} style={{ borderTop: `3px solid ${c.color}` }}>
            <div className="flex-between">
              <div>
                <div className="stat-label">{c.label}</div>
                <div className="stat-value">
                  {loading ? '—' : c.value}
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: '8px', background: `${c.color}15` }}>
                <c.icon size={20} color={c.color} />
              </div>
            </div>
          </div>
        ))}
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
              onClick={() => navigate('/admin/bookings')}
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
                    <div className="font-medium text-sm">{b.purpose}</div>
                  </div>
                  <div className="text-sm text-muted">Date: {b.bookingDate} {b.startTime} - {b.endTime}</div>
                  <div className="mt-2">
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/bookings')}>Review</button>
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
              onClick={() => navigate('/admin/tickets')}
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
                <div key={`t-${t.id}`} className={`ticket-card priority-${t.priority?.toLowerCase() || 'medium'}`} style={{ padding: '12px', background: 'var(--primary-wash)', border: '1px solid var(--border)' }}>
                  <div className="flex-between mb-1">
                    <div className="font-medium text-sm">{t.category}</div>
                    <span className={`badge badge-${t.priority?.toLowerCase() || 'pending'}`}>{t.priority}</span>
                  </div>
                  <div className="text-sm text-muted mb-2" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</div>
                  <div>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/tickets')}>Assign</button>
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
              onClick={() => navigate('/admin/notifications')}
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
                  <div>
                    <div className={n.isRead ? 'font-medium text-sm' : 'font-bold text-sm'}>{n.title}</div>
                    <div className="text-sm text-muted mt-1">{n.message}</div>
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
