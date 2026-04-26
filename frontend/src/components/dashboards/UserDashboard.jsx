import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { bookingsApi, ticketsApi, notificationsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CalendarDays, Wrench, Bell, Plus, Activity } from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ bookings: 0, tickets: 0, unread: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [bookings, tickets, notifs] = await Promise.all([
          bookingsApi.getMy().catch(() => []),
          ticketsApi.getMy().catch(() => []),
          notificationsApi.getAll().catch(() => []),
        ]);

        const bArray = Array.isArray(bookings) ? bookings : [];
        const tArray = Array.isArray(tickets) ? tickets : [];
        const nArray = Array.isArray(notifs) ? notifs : [];

        setStats({
          bookings: bArray.length,
          tickets: tArray.length,
          unread: nArray.filter(n => !n.isRead).length
        });

        setRecentBookings(bArray.slice(-4).reverse());
        setRecentTickets(tArray.slice(-3).reverse());
        setRecentNotifications(nArray.slice(0, 5)); // Latest 5 notifications
      } catch (error) {
        console.error('Failed to load user dashboard:', error);
      }
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { label: 'My Bookings', value: stats.bookings, icon: CalendarDays, color: '#3b82f6' },
    { label: 'Reported Issues', value: stats.tickets, icon: Wrench, color: '#f59e0b' },
    { label: 'Unread Alerts', value: stats.unread, icon: Bell, color: '#6366f1' },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name || 'Lecturer / Student'} 👋</h1>
          <p className="page-subtitle">Here is your campus overview for today.</p>
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

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex-gap">
              <Activity size={16} className="text-primary" />
              Quick Actions
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              className="btn btn-primary btn-full"
              onClick={() => navigate('/lecturer/bookings', { state: { openForm: true } })}
            >
              <Plus size={16} /> New Booking
            </button>
            <button
              className="btn btn-outline btn-full"
              onClick={() => navigate('/lecturer/tickets', { state: { openForm: true } })}
            >
              <Wrench size={16} /> Report an Incident
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex-gap">
              <CalendarDays size={16} className="text-success" />
              Recent Activity
            </h2>
          </div>
          {loading ? (
            <div className="text-muted text-sm">Loading recent activity...</div>
          ) : recentBookings.length === 0 && recentTickets.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">No recent activity to show.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
              {recentNotifications.map(n => (
                <div key={`n-${n.id}`} className={n.isRead ? 'notification-item read' : 'notification-item unread'} style={{ padding: '12px', margin: 0 }}>
                  <div className="flex-gap" style={{ alignItems: 'flex-start' }}>
                    <div style={{ marginTop: '2px' }}>
                      <Bell size={14} className={n.isRead ? 'text-muted' : 'text-primary'} />
                    </div>
                    <div>
                      <div className={n.isRead ? 'font-medium text-sm' : 'font-bold text-sm'}>{n.title}</div>
                      <div className="text-sm text-muted mt-1">{n.message}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-hint)', marginTop: '4px' }}>{n.createdAt && new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
              {recentBookings.map(b => (
                <div key={`b-${b.id}`} style={{ padding: '12px', background: 'var(--primary-wash)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} className="flex-between">
                  <div>
                    <div className="font-medium text-sm">Booking - {b.purpose}</div>
                    <div className="text-sm text-muted">{b.bookingDate} {b.startTime}</div>
                  </div>
                  <span className={`badge badge-${b.status?.toLowerCase() || 'pending'}`}>{b.status}</span>
                </div>
              ))}
              {recentTickets.map(t => (
                <div key={`t-${t.id}`} className={`ticket-card priority-${t.priority?.toLowerCase() || 'medium'} flex-between`} style={{ padding: '12px', background: 'var(--primary-wash)', border: '1px solid var(--border)' }}>
                  <div>
                    <div className="font-medium text-sm">Ticket - {t.category}</div>
                    <div className="text-sm text-muted">Priority: {t.priority}</div>
                  </div>
                  <span className={`badge badge-${t.status?.toLowerCase() || 'open'}`}>{t.status?.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
