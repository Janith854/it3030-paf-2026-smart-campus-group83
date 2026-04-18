import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Shield, Zap, Users, BarChart3 } from 'lucide-react';
import './Benefits.css';

const benefits = [
  {
    icon: <Clock size={28} />,
    title: 'Save Hours Every Week',
    desc: 'Eliminate manual room coordination. Automated workflows cut administrative overhead by up to 70%.',
    stat: '70%',
    statLabel: 'Time Saved',
    color: '#3B82F6',
  },
  {
    icon: <Shield size={28} />,
    title: 'Zero Double-Bookings',
    desc: 'Real-time conflict detection and approval workflows ensure every booking is valid and clashing-free.',
    stat: '100%',
    statLabel: 'Conflict Free',
    color: '#10B981',
  },
  {
    icon: <Zap size={28} />,
    title: 'Faster Maintenance Fixes',
    desc: 'Structured ticketing with direct technician assignment reduces average maintenance resolution time.',
    stat: '3x',
    statLabel: 'Faster Response',
    color: '#F59E0B',
  },
  {
    icon: <TrendingUp size={28} />,
    title: 'Full Transparency',
    desc: 'Every stakeholder can track the status of bookings and tickets in real time — no more chasing emails.',
    stat: '360°',
    statLabel: 'Visibility',
    color: '#6366F1',
  },
  {
    icon: <Users size={28} />,
    title: 'Role-Appropriate Access',
    desc: 'Secure, role-based permissions ensure users only see and do what they\'re authorized for.',
    stat: '3',
    statLabel: 'Access Tiers',
    color: '#EC4899',
  },
  {
    icon: <BarChart3 size={28} />,
    title: 'Data-Driven Decisions',
    desc: 'Analytics dashboards reveal usage patterns and bottlenecks so admins can optimize campus resources.',
    stat: '∞',
    statLabel: 'Insights',
    color: '#38BDF8',
  },
];

export default function Benefits() {
  return (
    <section className="section section-light benefits" id="benefits">
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
            Why Smart Campus Hub
          </div>
          <h2 className="section-title" style={{ color: '#0F172A' }}>
            Real Benefits, <span style={{ color: '#2563EB' }}>Measurable Impact</span>
          </h2>
          <p className="section-subtitle dark">
            Stop firefighting campus resource chaos. Start running an institution that operates like a well-oiled machine.
          </p>
        </motion.div>

        <div className="benefits__grid">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              className="benefits__card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.09 }}
              id={`benefit-card-${i}`}
            >
              <div className="benefits__card-top">
                <div className="benefits__icon" style={{ background: `${b.color}12`, color: b.color, border: `1px solid ${b.color}25` }}>
                  {b.icon}
                </div>
                <div className="benefits__stat-pill" style={{ background: `${b.color}12`, color: b.color }}>
                  <span className="benefits__stat-value">{b.stat}</span>
                  <span className="benefits__stat-label">{b.statLabel}</span>
                </div>
              </div>
              <h3 className="benefits__card-title">{b.title}</h3>
              <p className="benefits__card-desc">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
