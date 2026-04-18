import { useEffect, useState } from 'react';
import { notificationsApi } from '../services/api';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.getAll();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    try { await notificationsApi.markAsRead(id); load(); }
    catch (e) { setError(e.message); }
  };

  const markAllRead = async () => {
    try { await notificationsApi.markAllAsRead(); load(); }
    catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    try { await notificationsApi.delete(id); load(); }
    catch (e) { setError(e.message); }
  };

  const timeAgo = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <div className="dashboard__header">
        <h1 className="dashboard__title">Notifications</h1>
        <p className="dashboard__subtitle">
          {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
        </p>
      </div>

      {error && <div className="login-card__error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {unreadCount > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <button className="btn-dashboard btn-dashboard--secondary" onClick={markAllRead}>
            <CheckCheck size={16} /> Mark all as read
          </button>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon"><Bell size={48} /></div>
            <div className="empty-state__title">No notifications</div>
            <p>You'll see updates about bookings, tickets, and more here.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`notif-item ${!n.read ? 'notif-item--unread' : ''}`}>
              <div className="notif-item__body">
                <div className="notif-item__title">{n.title}</div>
                <div className="notif-item__message">{n.message}</div>
                <div className="notif-item__time">{timeAgo(n.createdAt)}</div>
              </div>
              <div className="notif-item__actions">
                {!n.read && (
                  <button
                    className="btn-dashboard btn-dashboard--secondary btn-dashboard--sm"
                    onClick={() => markRead(n.id)}
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </button>
                )}
                <button
                  className="btn-dashboard btn-dashboard--danger btn-dashboard--sm"
                  onClick={() => handleDelete(n.id)}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
