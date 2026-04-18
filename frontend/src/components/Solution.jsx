import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import './Solution.css';

const solutions = [
  'Centralized booking portal — one source of truth for all campus resources',
  'Automated approval workflow with real-time status updates',
  'Structured maintenance ticketing with priority levels and technician assignment',
  'Real-time notifications via email and in-platform alerts',
  'Role-based access — User, Admin, and Technician dashboards',
  'Analytics dashboard to track usage, trends, and maintenance SLAs',
];

export default function Solution() {
  return (
    <section className="section section-light solution" id="solution">
      <div className="container">
        <div className="solution__layout">
          {/* Left: Visual */}
          <motion.div
            className="solution__visual"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            id="solution-visual"
          >
            <div className="solution__visual-card">
              <div className="solution__visual-header">
                <div className="solution__visual-dots">
                  <span /><span /><span />
                </div>
                <span>Booking Request</span>
              </div>
              <div className="solution__timeline">
                {[
                  { step: 'Request Submitted', status: 'done', time: '09:00 AM' },
                  { step: 'Admin Notified', status: 'done', time: '09:01 AM' },
                  { step: 'Under Review', status: 'done', time: '09:15 AM' },
                  { step: 'Booking Approved ✓', status: 'active', time: '09:22 AM' },
                  { step: 'Confirmation Sent', status: 'upcoming', time: 'Pending' },
                ].map((t, i) => (
                  <div key={i} className={`solution__timeline-item solution__timeline-item--${t.status}`}>
                    <div className="solution__timeline-dot" />
                    <div className="solution__timeline-content">
                      <span className="solution__timeline-step">{t.step}</span>
                      <span className="solution__timeline-time">{t.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="solution__visual-footer">
                <CheckCircle2 size={16} className="solution__approved-icon" />
                <span>Lecture Hall B — Approved by Admin</span>
              </div>
            </div>
            <div className="solution__glow" />
          </motion.div>

          {/* Right: Content */}
          <motion.div
            className="solution__content"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            id="solution-content"
          >
            <div className="section-label light">
              <span className="section-badge-dot" />
              The Solution
            </div>
            <h2 className="section-title" style={{ color: '#0F172A' }}>
              One Platform for<br />
              <span style={{ color: '#2563EB' }}>All Your Campus Needs</span>
            </h2>
            <p className="section-subtitle dark" style={{ marginBottom: 32 }}>
              Smart Campus Hub replaces fragmented spreadsheets, emails, and word-of-mouth with a unified, real-time management platform.
            </p>
            <ul className="solution__list">
              {solutions.map((s, i) => (
                <motion.li
                  key={i}
                  className="solution__list-item"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                >
                  <CheckCircle2 size={18} className="solution__check" />
                  <span>{s}</span>
                </motion.li>
              ))}
            </ul>
            <a href="#features" className="btn btn-outline" id="solution-learn-more" style={{ marginTop: 8 }}>
              Explore Features <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
