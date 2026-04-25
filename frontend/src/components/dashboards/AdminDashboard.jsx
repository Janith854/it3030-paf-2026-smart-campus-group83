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
      <div className="dashboard__header">
        <h1 className="dashboard__title">Welcome back, {user?.name || 'Administrator'} 👋</h1>
        <p className="dashboard__subtitle">Here is your Admin overview for today.</p>
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
        {/* Pending Approvals Widget */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#f59e0b" />
              Pending Bookings
            </h2>
            <button
              className="btn-dashboard btn-dashboard--secondary btn-dashboard--sm"
              onClick={() => navigate('/admin/bookings')}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          {loading ? (
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading...</div>
          ) : recentPendingBookings.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No pending bookings.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
              {recentPendingBookings.map(b => (
                <div key={`b-${b.id}`} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{b.purpose}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Date: {b.bookingDate} {b.startTime} - {b.endTime}</div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <button className="btn-dashboard btn-dashboard--primary btn-dashboard--sm" onClick={() => navigate('/admin/bookings')}>Review</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Open Tickets Widget */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wrench size={18} color="#ef4444" />
              Recent Open Tickets
            </h2>
            <button
              className="btn-dashboard btn-dashboard--secondary btn-dashboard--sm"
              onClick={() => navigate('/admin/tickets')}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          {loading ? (
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading...</div>
          ) : recentOpenTickets.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No open tickets.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
              {recentOpenTickets.map(t => (
                <div key={`t-${t.id}`} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.category}</div>
                    <span className={`badge badge--${t.priority?.toLowerCase()}`}>{t.priority}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</div>
                  <div>
                    <button className="btn-dashboard btn-dashboard--primary btn-dashboard--sm" onClick={() => navigate('/admin/tickets')}>Assign</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Notifications Widget */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="#6366f1" />
              Recent System Alerts
            </h2>
            <button
              className="btn-dashboard btn-dashboard--secondary btn-dashboard--sm"
              onClick={() => navigate('/admin/notifications')}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          {loading ? (
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading...</div>
          ) : recentNotifications.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No recent alerts.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
              {recentNotifications.map(n => (
                <div key={`n-${n.id}`} style={{ padding: '0.75rem', background: n.isRead ? 'rgba(255,255,255,0.01)' : 'rgba(99, 102, 241, 0.08)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderLeft: n.isRead ? 'none' : '3px solid #6366f1' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: n.isRead ? 500 : 700, color: n.isRead ? '#cbd5e1' : '#f8fafc' }}>{n.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem' }}>{n.message}</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.3rem' }}>{n.createdAt && new Date(n.createdAt).toLocaleString()}</div>
                    </div>
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
