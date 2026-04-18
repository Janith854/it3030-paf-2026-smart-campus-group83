import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, UserCog, Wrench, CheckSquare, Upload, MessageSquare } from 'lucide-react';
import './Maintenance.css';

const stages = [
  {
    icon: <AlertCircle size={26} />,
    status: 'OPEN',
    title: 'Issue Reported',
    desc: 'User submits a maintenance request with description, location, priority, and optional photo upload.',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.1)',
  },
  {
    icon: <UserCog size={26} />,
    status: 'ASSIGNED',
    title: 'Technician Assigned',
    desc: 'Admin reviews the ticket, assigns a technician, and sets priority. Technician gets notified instantly.',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
  },
  {
    icon: <Wrench size={26} />,
    status: 'IN PROGRESS',
    title: 'Work Underway',
    desc: 'Technician updates the ticket with progress comments. Users can track status in real time.',
    color: '#6366F1',
    bg: 'rgba(99,102,241,0.1)',
  },
  {
    icon: <CheckSquare size={26} />,
    status: 'RESOLVED',
    title: 'Issue Closed',
    desc: 'Technician marks resolved. User receives a notification. Admin verifies and closes the ticket.',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.1)',
  },
];

const ticketSample = {
  id: '#TKT-0042',
  title: 'Projector not working in Lecture Hall A',
  priority: 'High',
  reporter: 'Dr. James Lee',
  location: 'Building A, Room 104',
  comments: [
    { author: 'Dr. James Lee', text: 'The projector fails to turn on. Tried multiple sockets.', time: '2h ago' },
    { author: 'Tech — Mark', text: 'Checked remote & bulb. Replaced fuse. Testing now.', time: '45m ago' },
    { author: 'Tech — Mark', text: 'Issue resolved. Projector fully operational.', time: '10m ago' },
  ],
};

export default function Maintenance() {
  return (
    <section className="section section-light maintenance" id="maintenance">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label light">
            <span className="section-badge-dot" style={{ background: '#2563EB' }} />
            Maintenance — Module C
          </div>
          <h2 className="section-title" style={{ color: '#0F172A' }}>
            Maintenance Tickets,<br />
            <span style={{ color: '#2563EB' }}>Tracked from Start to Fix</span>
          </h2>
          <p className="section-subtitle dark">
            Report issues, upload photos, track updates, and get notified when any campus problem is resolved.
          </p>
        </motion.div>

        {/* Workflow Stages */}
        <div className="maintenance__stages" id="maintenance-stages">
          {stages.map((s, i) => (
            <motion.div
              key={i}
              className="maintenance__stage"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              id={`stage-${s.status.toLowerCase().replace(' ', '-')}`}
            >
              <div className="maintenance__stage-line" style={{ background: s.color, opacity: i < 3 ? 1 : 0 }} />
              <div className="maintenance__stage-icon" style={{ background: s.bg, color: s.color, border: `1.5px solid ${s.color}40` }}>
                {s.icon}
              </div>
              <div className="maintenance__stage-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}>
                {s.status}
              </div>
              <h3 className="maintenance__stage-title">{s.title}</h3>
              <p className="maintenance__stage-desc">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Sample Ticket */}
        <motion.div
          className="maintenance__ticket"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          id="maintenance-ticket-sample"
        >
          <div className="maintenance__ticket-header">
            <div>
              <span className="maintenance__ticket-id">{ticketSample.id}</span>
              <h4 className="maintenance__ticket-title">{ticketSample.title}</h4>
            </div>
            <div className="maintenance__ticket-meta">
              <span className="badge badge-progress"><Wrench size={11} /> In Progress</span>
              <span className="maintenance__priority-badge">🔴 {ticketSample.priority}</span>
            </div>
          </div>
          <div className="maintenance__ticket-info">
            <span>📍 {ticketSample.location}</span>
            <span>👤 {ticketSample.reporter}</span>
            <span className="maintenance__upload-hint"><Upload size={13} /> Photo attached</span>
          </div>
          <div className="maintenance__comments">
            <div className="maintenance__comments-label">
              <MessageSquare size={14} /> Comments ({ticketSample.comments.length})
            </div>
            {ticketSample.comments.map((c, i) => (
              <div className="maintenance__comment" key={i}>
                <div className="maintenance__comment-avatar">{c.author.charAt(0)}</div>
                <div className="maintenance__comment-body">
                  <div className="maintenance__comment-author">{c.author} <span className="maintenance__comment-time">{c.time}</span></div>
                  <div className="maintenance__comment-text">{c.text}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
