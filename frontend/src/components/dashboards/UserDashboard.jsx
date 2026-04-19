import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { bookingsApi, ticketsApi, notificationsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CalendarDays, Wrench, Bell, Plus, Activity } from 'lucide-react';

export default function UserDashboard({ user }) {
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
      <div className="dashboard__header">
        <h1 className="dashboard__title">Welcome back, {user?.name || 'User'} 👋</h1>
        <p className="dashboard__subtitle">Here is your campus overview for today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {cards.map((c, i) => (
          <div className="card" key={i} style={{ borderTop: `3px solid ${c.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>{c.label}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9' }}>
                  {loading ? '—' : c.value}
                </div>
              </div>
              <div style={{ padding: '0.6rem', borderRadius: '10px', background: `${c.color}15` }}>
                <c.icon size={22} color={c.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="#3b82f6" />
            Quick Actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              className="btn-dashboard btn-dashboard--primary"
              style={{ justifyContent: 'center', width: '100%', padding: '0.8rem' }}
              onClick={() => navigate('/lecturer/bookings', { state: { openForm: true } })}
            >
              <Plus size={18} /> New Booking
            </button>
            <button
              className="btn-dashboard btn-dashboard--secondary"
              style={{ justifyContent: 'center', width: '100%', padding: '0.8rem' }}
              onClick={() => navigate('/lecturer/tickets', { state: { openForm: true } })}
            >
              <Wrench size={18} /> Report an Incident
            </button>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarDays size={18} color="#10b981" />
            Recent Activity
          </h2>
          {loading ? (
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading recent activity...</div>
          ) : recentBookings.length === 0 && recentTickets.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No recent activity to show.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
              {recentNotifications.map(n => (
                <div key={`n-${n.id}`} style={{ padding: '0.75rem', background: n.isRead ? 'rgba(255,255,255,0.01)' : 'rgba(99, 102, 241, 0.08)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderLeft: n.isRead ? 'none' : '3px solid #6366f1' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ marginTop: '0.2rem' }}>
                      <Bell size={14} color={n.isRead ? '#64748b' : '#6366f1'} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: n.isRead ? 500 : 700, color: n.isRead ? '#cbd5e1' : '#f8fafc' }}>{n.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem' }}>{n.message}</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.3rem' }}>{n.createdAt && new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
              {recentBookings.map(b => (
                <div key={`b-${b.id}`} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Booking - {b.purpose}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.bookingDate} {b.startTime}</div>
                  </div>
                  <span className={`badge badge--${b.status?.toLowerCase()}`}>{b.status}</span>
                </div>
              ))}
              {recentTickets.map(t => (
                <div key={`t-${t.id}`} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Ticket - {t.category}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Priority: {t.priority}</div>
                  </div>
                  <span className={`badge badge--${t.status?.toLowerCase()}`}>{t.status?.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
