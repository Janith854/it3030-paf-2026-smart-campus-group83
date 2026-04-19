import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Ticket, Bell, Shield, Database, BarChart3 } from 'lucide-react';
import './Features.css';

const features = [
  {
    icon: <Database size={28} />,
    module: 'Module A',
    title: 'Resource Management',
    desc: 'Centralized catalogue of all campus resources — lecture halls, labs, equipment, and more. Full CRUD with capacity, location, and availability status.',
    color: '#3B82F6',
    tags: ['Catalogue', 'CRUD', 'Availability'],
  },
  {
    icon: <Calendar size={28} />,
    module: 'Module B',
    title: 'Booking Workflow',
    desc: 'End-to-end booking system with automated approval routing. Track status from Pending → Approved or Rejected with full audit trail.',
    color: '#10B981',
    tags: ['Approval', 'Status Tracking', 'Calendar'],
  },
  {
    icon: <Ticket size={28} />,
    module: 'Module C',
    title: 'Incident Ticketing',
    desc: 'Structured maintenance ticketing with priority levels, image attachments, comments, and technician assignment. Track Open → In Progress → Resolved.',
    color: '#F59E0B',
    tags: ['Tickets', 'Priority', 'Assignment'],
  },
  {
    icon: <Bell size={28} />,
    module: 'Module D',
    title: 'Smart Notifications',
    desc: 'Real-time alerts for booking approvals, ticket updates, comments, and system events. Keep every stakeholder fully informed.',
    color: '#6366F1',
    tags: ['Real-time', 'Alerts', 'Email + In-App'],
  },
  {
    icon: <Shield size={28} />,
    module: 'Module E',
    title: 'Role-Based Access',
    desc: 'Three-tier access model: Users book and report, Admins approve and manage, Technicians resolve. Secure OAuth login integration.',
    color: '#EC4899',
    tags: ['OAuth', 'RBAC', 'Secure'],
  },
  {
    icon: <BarChart3 size={28} />,
    module: 'Module F',
    title: 'Analytics Dashboard',
    desc: 'Visual insights into booking patterns, resource utilization, ticket resolution times, and system-wide performance metrics.',
    color: '#38BDF8',
    tags: ['Analytics', 'Reports', 'KPIs'],
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Features() {
  return (
    <section className="section section-dark features" id="services">
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
            Platform Features
          </div>
          <h2 className="section-title gradient">
            Every Module You Need,<br />Built Right In
          </h2>
          <p className="section-subtitle">
            Smart Campus Hub covers every aspect of campus resource management — directly mapped to system modules.
          </p>
        </motion.div>

        <motion.div
          className="features__grid"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="features__card"
              variants={item}
              id={`feature-card-${i}`}
            >
              <div className="features__card-top">
                <div
                  className="features__icon"
                  style={{ background: `${f.color}18`, color: f.color, border: `1px solid ${f.color}30` }}
                >
                  {f.icon}
                </div>
                <span className="features__module-badge" style={{ color: f.color, background: `${f.color}12`, border: `1px solid ${f.color}25` }}>
                  {f.module}
                </span>
              </div>
              <h3 className="features__card-title">{f.title}</h3>
              <p className="features__card-desc">{f.desc}</p>
              <div className="features__tags">
                {f.tags.map(t => (
                  <span key={t} className="features__tag">{t}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
