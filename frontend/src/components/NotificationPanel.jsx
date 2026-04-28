import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../services/api';

export default function NotificationPanel({ onClose }) {
  const { notifications, refresh } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';
  const basePath = isAdmin ? '/admin-dashboard' : (isTechnician ? '/tech-dashboard' : '/user-dashboard');

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationsApi.markAsRead(id);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationsApi.markAllAsRead();
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await notificationsApi.markAsRead(notif.id);
      refresh();
    }
    onClose();
    navigate(`${basePath}/notifications`);
  };

  const handleViewAll = (e) => {
    e.preventDefault();
    onClose();
    navigate(`${basePath}/notifications`);
  };

  const timeAgo = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const topNotifications = notifications.slice(0, 5);
  const hasUnread = notifications.some(n => !n.read);

  return (
    <div className="notification-panel">
      <div className="notif-panel-header">
        <span>Notifications</span>
        {hasUnread && (
          <button className="notif-panel-mark-btn" onClick={handleMarkAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="notif-panel-list">
        {topNotifications.length === 0 ? (
          <div className="notif-panel-empty">
            You're all caught up!
          </div>
        ) : (
          topNotifications.map(n => (
            <div 
              key={n.id} 
              className={`notif-panel-item ${!n.read ? 'unread' : ''} ${n.type === 'URGENT_PRIORITY_ALERT' ? 'urgent' : ''}`}
              onClick={() => handleNotificationClick(n)}
            >
              <div className="notif-item-title">{n.title}</div>
              <div className="notif-item-message">{n.message}</div>
              <div className="notif-item-time">{timeAgo(n.createdAt)}</div>
            </div>
          ))
        )}
      </div>

      <div className="notif-panel-footer">
        <button 
          className="notif-panel-view-all" 
          onClick={handleViewAll}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}
