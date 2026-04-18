import React from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle2, AlertCircle, MessageSquare, Clock } from 'lucide-react';
import './Notifications.css';

const notifications = [
  {
    type: 'success',
    icon: <CheckCircle2 size={18} />,
    title: 'Booking Approved',
    body: 'Your booking for Lecture Hall A on Apr 8, 10:00 AM has been approved by Admin.',
    time: '2 minutes ago',
    color: '#10B981',
  },
  {
    type: 'info',
    icon: <MessageSquare size={18} />,
    title: 'Ticket Comment Added',
    body: 'Tech Mark added a comment on ticket #TKT-0042: "Projector issue resolved."',
    time: '15 minutes ago',
    color: '#3B82F6',
  },
  {
    type: 'warning',
    icon: <AlertCircle size={18} />,
    title: 'Booking Pending Review',
    body: 'Your request for Computer Lab 2 is under review. Estimated decision: 30 min.',
    time: '1 hour ago',
    color: '#F59E0B',
  },
  {
    type: 'success',
    icon: <CheckCircle2 size={18} />,
    title: 'Ticket Resolved',
    body: 'Ticket #TKT-0039 (AC not working, Room 302) has been marked as Resolved.',
    time: '2 hours ago',
    color: '#10B981',
  },
  {
    type: 'info',
    icon: <Bell size={18} />,
    title: 'New Resource Available',
    body: 'Innovation Hub (cap. 120) has been added to the resource catalogue.',
    time: '1 day ago',
    color: '#6366F1',
  },
];

export default function NotificationsSection() {
  return (
    <section className="section section-dark notifications" id="notifications">
      <div className="container">
        <div className="notifications__layout">
          {/* Left Content */}
          <motion.div
            className="notifications__content"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            id="notifications-content"
          >
            <div className="section-label">
              <span className="section-badge-dot" />
              Notifications — Module D
            </div>
            <h2 className="section-title gradient">
              Stay Informed at<br />Every Step
            </h2>
            <p className="section-subtitle" style={{ marginBottom: 32 }}>
              Real-time notifications for every event — booking approvals, ticket updates, comments, and system alerts delivered instantly.
            </p>
            <div className="notifications__features">
              {[
                { icon: <Bell size={18} />, text: 'In-app real-time alerts' },
                { icon: <CheckCircle2 size={18} />, text: 'Booking status updates' },
                { icon: <MessageSquare size={18} />, text: 'Ticket comment notifications' },
                { icon: <Clock size={18} />, text: 'Reminder alerts before bookings' },
              ].map((f, i) => (
                <div key={i} className="notifications__feature-item">
                  <span className="notifications__feature-icon">{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Notification Feed */}
          <motion.div
            className="notifications__feed"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            id="notifications-feed"
          >
            <div className="notifications__feed-header">
              <Bell size={16} />
              <span>Notification Center</span>
              <span className="notifications__feed-count">5 new</span>
            </div>
            <div className="notifications__list">
              {notifications.map((n, i) => (
                <motion.div
                  key={i}
                  className="notifications__item"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  id={`notification-${i}`}
                >
                  <div
                    className="notifications__item-icon"
                    style={{ background: `${n.color}18`, color: n.color, border: `1px solid ${n.color}25` }}
                  >
                    {n.icon}
                  </div>
                  <div className="notifications__item-body">
                    <div className="notifications__item-title">{n.title}</div>
                    <div className="notifications__item-text">{n.body}</div>
                    <div className="notifications__item-time">
                      <Clock size={11} /> {n.time}
                    </div>
                  </div>
                  <div className="notifications__item-dot" style={{ background: n.color }} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
