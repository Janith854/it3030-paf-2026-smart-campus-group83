import React from 'react';
import { motion } from 'framer-motion';
import { User, ShieldCheck, Wrench, ArrowRight, BookOpen, Ticket, Settings, Eye, UserPlus } from 'lucide-react';
import './Roles.css';

const roles = [
  {
    icon: <User size={32} />,
    title: 'Student / Staff',
    subtitle: 'Campus User',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
    permissions: [
      { icon: <BookOpen size={15} />, text: 'Browse & book campus resources' },
      { icon: <Ticket size={15} />, text: 'Create and track maintenance tickets' },
      { icon: <Eye size={15} />, text: 'View booking & ticket history' },
      { icon: <UserPlus size={15} />, text: 'Manage personal profile & notifications' },
    ],
  },
  {
    icon: <ShieldCheck size={32} />,
    title: 'Administrator',
    subtitle: 'System Admin',
    color: '#6366F1',
    gradient: 'linear-gradient(135deg, #312e81, #6366f1)',
    popular: true,
    permissions: [
      { icon: <Settings size={15} />, text: 'Manage all campus resources (CRUD)' },
      { icon: <BookOpen size={15} />, text: 'Approve or reject booking requests' },
      { icon: <Ticket size={15} />, text: 'Assign technicians to tickets' },
      { icon: <User size={15} />, text: 'Manage users, roles, and access' },
      { icon: <Eye size={15} />, text: 'Full analytics & reporting dashboard' },
    ],
  },
  {
    icon: <Wrench size={32} />,
    title: 'Technician',
    subtitle: 'Maintenance Staff',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #78350f, #d97706)',
    permissions: [
      { icon: <Eye size={15} />, text: 'View assigned maintenance tickets' },
      { icon: <Wrench size={15} />, text: 'Update ticket status & progress' },
      { icon: <ArrowRight size={15} />, text: 'Add comments and resolution notes' },
      { icon: <BookOpen size={15} />, text: 'View resource availability context' },
    ],
  },
];

export default function Roles() {
  return (
    <section className="section section-dark roles" id="roles">
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
            Role-Based Access — Module E
          </div>
          <h2 className="section-title gradient">
            The Right Access for<br />Every Campus Role
          </h2>
          <p className="section-subtitle">
            Three carefully designed permission tiers ensure everyone has exactly what they need.
          </p>
        </motion.div>

        <div className="roles__grid" id="roles-grid">
          {roles.map((r, i) => (
            <motion.div
              key={i}
              className={`roles__card ${r.popular ? 'roles__card--popular' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              id={`role-card-${i}`}
            >
              {r.popular && <div className="roles__popular-badge">⚡ Most Powerful</div>}
              <div className="roles__card-header" style={{ background: r.gradient }}>
                <div className="roles__avatar">{r.icon}</div>
                <div>
                  <h3 className="roles__card-title">{r.title}</h3>
                  <span className="roles__card-subtitle">{r.subtitle}</span>
                </div>
              </div>
              <ul className="roles__permissions">
                {r.permissions.map((p, j) => (
                  <li key={j} className="roles__permission">
                    <span className="roles__permission-icon" style={{ color: r.color }}>{p.icon}</span>
                    <span>{p.text}</span>
                  </li>
                ))}
              </ul>
              <button className="roles__btn" style={{ borderColor: r.color, color: r.color }} id={`role-btn-${i}`}>
                Login as {r.subtitle.split(' ')[0]} <ArrowRight size={15} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
