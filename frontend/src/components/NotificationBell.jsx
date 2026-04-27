import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import NotificationPanel from './NotificationPanel';
import './NotificationBell.css'; // We'll create this or inline styles

export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close panel if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="notification-bell-container" ref={containerRef}>
      <button 
        className={`notification-bell-btn ${unreadCount > 0 ? 'has-notifications' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle notifications"
      >
        <Bell size={20} className="bell-icon" />
        {unreadCount > 0 && (
          <span className="modern-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationPanel onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}
