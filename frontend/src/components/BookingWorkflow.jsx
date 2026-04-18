import React from 'react';
import { motion } from 'framer-motion';
import { Search, Send, CheckCircle, XCircle, Clock, CalendarCheck } from 'lucide-react';
import './BookingWorkflow.css';

const steps = [
  {
    icon: <Search size={28} />,
    number: '01',
    title: 'Browse & Select',
    desc: 'Search available resources by type, capacity, date, and time. Filter to find the perfect space.',
    color: '#3B82F6',
  },
  {
    icon: <Send size={28} />,
    number: '02',
    title: 'Submit Request',
    desc: 'Fill in your booking details — purpose, time slot, and any special requirements. Submit in seconds.',
    color: '#6366F1',
  },
  {
    icon: <Clock size={28} />,
    number: '03',
    title: 'Admin Reviews',
    desc: 'Your request enters the queue. The admin receives a real-time notification and reviews the details.',
    color: '#F59E0B',
  },
  {
    icon: <CalendarCheck size={28} />,
    number: '04',
    title: 'Confirmed & Use',
    desc: 'Once approved, you receive an instant notification. Your room is locked in — just show up and go.',
    color: '#10B981',
  },
];

const statuses = [
  { label: 'Pending', icon: <Clock size={16} />, colorClass: 'pending', desc: 'Awaiting admin review', count: 12 },
  { label: 'Approved', icon: <CheckCircle size={16} />, colorClass: 'approved', desc: 'Confirmed bookings', count: 84 },
  { label: 'Rejected', icon: <XCircle size={16} />, colorClass: 'rejected', desc: 'Declined requests', count: 7 },
];

export default function BookingWorkflow() {
  return (
    <section className="section section-dark booking" id="booking">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">
            <span className="section-badge-dot" />
            Booking Workflow — Module B
          </div>
          <h2 className="section-title gradient">
            Book Any Resource<br />in 4 Simple Steps
          </h2>
          <p className="section-subtitle">
            Our structured workflow ensures zero conflicts, full transparency, and instant notifications at every stage.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="booking__steps"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {steps.map((s, i) => (
            <motion.div
              key={i}
              className="booking__step"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              id={`booking-step-${i}`}
            >
              <div className="booking__step-number" style={{ color: s.color }}>
                {s.number}
              </div>
              <div className="booking__step-icon" style={{ background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}30` }}>
                {s.icon}
              </div>
              <h3 className="booking__step-title">{s.title}</h3>
              <p className="booking__step-desc">{s.desc}</p>
              {i < steps.length - 1 && <div className="booking__step-connector" />}
            </motion.div>
          ))}
        </motion.div>

        {/* Status Section */}
        <motion.div
          className="booking__statuses"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          id="booking-statuses"
        >
          <h3 className="booking__statuses-title">Live Booking Status</h3>
          <div className="booking__status-cards">
            {statuses.map((s, i) => (
              <div className="booking__status-card" key={i} id={`status-card-${s.label.toLowerCase()}`}>
                <div className={`booking__status-icon badge-${s.colorClass}`}>{s.icon}</div>
                <div className="booking__status-count">{s.count}</div>
                <div className={`booking__status-label badge badge-${s.colorClass}`}>
                  <span className="booking__status-dot" />
                  {s.label}
                </div>
                <div className="booking__status-desc">{s.desc}</div>
              </div>
            ))}
          </div>

          {/* Mini booking preview */}
          <div className="booking__preview" id="booking-preview">
            <div className="booking__preview-header">
              <span className="booking__preview-title">Recent Booking Requests</span>
              <span className="badge badge-pending"><Clock size={11} /> Live</span>
            </div>
            {[
              { room: 'Lecture Hall A', user: 'Dr. Sarah Chen', time: '10:00 - 12:00', status: 'approved' },
              { room: 'Computer Lab 2', user: 'Prof. James Roe', time: '14:00 - 16:00', status: 'pending' },
              { room: 'Seminar Room B', user: 'Ms. Priya Kumar', time: '09:00 - 10:30', status: 'rejected' },
            ].map((b, i) => (
              <div className="booking__preview-row" key={i}>
                <div className="booking__preview-avatar">{b.user.charAt(0)}</div>
                <div className="booking__preview-info">
                  <span className="booking__preview-room">{b.room}</span>
                  <span className="booking__preview-user">{b.user} · {b.time}</span>
                </div>
                <span className={`badge badge-${b.status}`}>
                  {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
