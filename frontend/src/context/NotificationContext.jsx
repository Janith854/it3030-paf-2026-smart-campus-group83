import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationsApi } from '../services/api';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await notificationsApi.getAll();
      setNotifications(Array.isArray(data) ? data : []);
      
      const countData = await notificationsApi.getUnreadCount();
      setUnreadCount(countData?.count || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications]);

  const refresh = () => {
    fetchNotifications();
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
}
