import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Users, Wrench } from 'lucide-react';
import './Problem.css';

const problems = [
  {
    icon: <AlertTriangle size={24} />,
    title: 'No Room Availability Visibility',
    desc: 'Staff waste hours checking room availability manually, leading to double-bookings and frustrated users.',
    color: '#EF4444',
  },
  {
    icon: <Clock size={24} />,
    title: 'Slow Maintenance Response',
    desc: 'Maintenance requests get lost in emails and WhatsApp groups. Issues go unresolved for days — sometimes weeks.',
    color: '#F59E0B',
  },
  {
    icon: <Users size={24} />,
    title: 'No Role-Based Access Control',
    desc: 'Everyone has access to everything — or nothing. There\'s no structured system for users, admins, or technicians.',
    color: '#6366F1',
  },
  {
    icon: <Wrench size={24} />,
    title: 'Booking Conflicts & Clashes',
    desc: 'Multiple departments book the same halls simultaneously. Conflicts are only discovered on the day — causing chaos.',
    color: '#EC4899',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

export default function Problem() {
  return (
    <section className="section section-dark problem" id="about">
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
            The Problem
          </div>
          <h2 className="section-title gradient">
            Campus Resource Management<br />Is Broken
          </h2>
          <p className="section-subtitle">
            Universities lose thousands of productive hours each year due to inefficient, outdated systems. These pain points are real.
          </p>
        </motion.div>

        <motion.div
          className="problem__grid"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {problems.map((p, i) => (
            <motion.div
              key={i}
              className="problem__card"
              variants={item}
              id={`problem-card-${i}`}
            >
              <div
                className="problem__icon"
                style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}30` }}
              >
                {p.icon}
              </div>
              <h3 className="problem__card-title">{p.title}</h3>
              <p className="problem__card-desc">{p.desc}</p>
              <div className="problem__indicator" style={{ background: p.color }} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
