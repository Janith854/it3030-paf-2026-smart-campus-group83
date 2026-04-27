import { useState } from 'react';
import { notificationsApi } from '../services/api';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationsPage() {
  const { notifications, unreadCount, refresh } = useNotifications();
  const [error, setError] = useState('');

  const markRead = async (id) => {
    try { 
      await notificationsApi.markAsRead(id); 
      refresh(); 
    }
    catch (e) { setError(e.message); }
  };

  const markAllRead = async () => {
    try { 
      await notificationsApi.markAllAsRead(); 
      refresh(); 
    }
    catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    try { 
      await notificationsApi.delete(id); 
      refresh(); 
    }
    catch (e) { setError(e.message); }
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

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
      </div>

      {error && <div className="alert-conflict" style={{ marginBottom: '1rem' }}>{error}</div>}

      {unreadCount > 0 && (
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline btn-sm" onClick={markAllRead}>
            <CheckCheck size={16} style={{ marginRight: '6px' }} /> Mark all as read
          </button>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div style={{ marginBottom: '16px', color: 'var(--text-hint)' }}><Bell size={48} /></div>
            <div className="empty-state-title">You're all caught up!</div>
            <p className="empty-state-desc">You have no new notifications.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n, index) => (
              <div 
                key={n.id} 
                style={{ 
                  padding: '16px', 
                  borderBottom: index < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                  background: !n.read ? (n.type === 'URGENT_PRIORITY_ALERT' ? '#fef2f2' : 'var(--primary-wash)') : 'transparent',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: !n.read ? (n.type === 'URGENT_PRIORITY_ALERT' ? '#ef4444' : 'var(--primary)') : 'transparent',
                  marginTop: '6px',
                  flexShrink: 0
                }} />
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: !n.read ? 600 : 500, color: n.type === 'URGENT_PRIORITY_ALERT' ? '#dc2626' : 'var(--text)', marginBottom: '4px' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.5 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-hint)', fontWeight: 500 }}>
                    {timeAgo(n.createdAt)}
                  </div>
                </div>

                <div className="flex-gap" style={{ flexShrink: 0 }}>
                  {!n.read && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => markRead(n.id)}
                      title="Mark as read"
                      style={{ padding: '6px', color: 'var(--primary)', border: 'none' }}
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    className="btn btn-ghost btn-sm text-danger"
                    onClick={() => handleDelete(n.id)}
                    title="Delete"
                    style={{ padding: '6px', border: 'none' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
