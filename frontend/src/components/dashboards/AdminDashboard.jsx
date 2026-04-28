import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsApi, ticketsApi, notificationsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Clock, Wrench, Activity, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [ticketOverview, setTicketOverview] = useState({ total: 0, newTickets: 0, ongoing: 0, resolved: 0 });
  const [recentPendingBookings, setRecentPendingBookings] = useState([]);
  const [recentOpenTickets, setRecentOpenTickets] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [bookings, tickets, notifs] = await Promise.all([
          bookingsApi.getAll('PENDING').catch(() => []),
          ticketsApi.getAll().catch(() => []),
          notificationsApi.getAll().catch(() => []),
        ]);

        const bArray = Array.isArray(bookings) ? bookings : [];
        const tArray = Array.isArray(tickets) ? tickets : [];
        const nArray = Array.isArray(notifs) ? notifs : [];

        const openTickets = tArray.filter(t => t.status === 'OPEN');

        setTicketOverview({
          total: tArray.length,
          newTickets: openTickets.length,
          ongoing: tArray.filter(t => t.status === 'IN_PROGRESS').length,
          resolved: tArray.filter(t => t.status === 'RESOLVED').length,
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

  const formatCount = (value) => String(value).padStart(2, '0');

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name || 'Administrator'}</h1>
          <p className="page-subtitle">Here is your Admin overview for today.</p>
        </div>
      </div>

      <div className="tickets-overview mb-3">
        <h2 className="tickets-overview__title">Tickets Overview</h2>
        <div className="tickets-overview__grid">
          <div className="tickets-overview__card tickets-overview__card--total">
            <div className="tickets-overview__label">Total Tickets</div>
            <div className="tickets-overview__value">{loading ? '00' : formatCount(ticketOverview.total)}</div>
          </div>
          <div className="tickets-overview__card tickets-overview__card--new">
            <div className="tickets-overview__label">New Tickets</div>
            <div className="tickets-overview__value">{loading ? '00' : formatCount(ticketOverview.newTickets)}</div>
          </div>
          <div className="tickets-overview__card tickets-overview__card--ongoing">
            <div className="tickets-overview__label">On-Going Tickets</div>
            <div className="tickets-overview__value">{loading ? '00' : formatCount(ticketOverview.ongoing)}</div>
          </div>
          <div className="tickets-overview__card tickets-overview__card--resolved">
            <div className="tickets-overview__label">Resolved Tickets</div>
            <div className="tickets-overview__value">{loading ? '00' : formatCount(ticketOverview.resolved)}</div>
          </div>
        </div>
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
                    <div className="font-medium text-sm">{b.purpose}</div>
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
                <div key={`t-${t.id}`} className={`ticket-card priority-${t.priority?.toLowerCase() || 'medium'}`} style={{ padding: '12px', background: 'var(--primary-wash)', border: '1px solid var(--border)' }}>
                  <div className="flex-between mb-1">
                    <div className="font-medium text-sm">{t.category}</div>
                    <span className={`badge badge-${t.priority?.toLowerCase() || 'pending'}`}>{t.priority}</span>
                  </div>
                  <div className="text-sm text-muted mb-2" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</div>
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
