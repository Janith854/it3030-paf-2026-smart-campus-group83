import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Zap, ArrowRight } from 'lucide-react';
import '../styles/components/AboutSections.css';

export default function AboutVision() {
  return (
    <section className="section-container" id="about">
      <div className="section-bg-orb" style={{ top: '-100px', left: '-100px' }} />
      
      <div className="section-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-badge"
        >
          <Zap size={14} />
          <span>The Platform Vision</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="section-title"
        >
          Transforming Campus <br />
          <span className="section-title-gradient">Infrastructure Through Software</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="section-desc"
        >
          Smart Campus Hub is born from a simple observation: modern universities deserve modern tools. 
          We replace fragmented processes with a cohesive, data-driven ecosystem.
        </motion.p>

        <div className="comparison-grid">
          {/* Problem Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="problem-card"
          >
            <div className="card-heading problem-heading">
              <AlertCircle size={20} />
              <span>Current Inefficiencies</span>
            </div>
            <ul className="card-list">
              {[
                'Manual room booking via phone or paperwork.',
                'Difficulty tracking maintenance ticket status.',
                'Double bookings and resource conflicts.',
                'Siloed data across different departments.'
              ].map((text, i) => (
                <li key={i} className="card-list-item">
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F87171', marginTop: 8 }} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Solution Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="solution-card"
          >
            <div className="card-heading solution-heading">
              <CheckCircle2 size={20} />
              <span>Smart Hub Solution</span>
            </div>
            <ul className="card-list">
              {[
                'Single-click digital booking for all spaces.',
                'Real-time maintenance ops with mobile alerts.',
                'Automated collision detection & approvals.',
                'Unified analytics for resource optimization.'
              ].map((text, i) => (
                <li key={i} className="card-list-item">
                  <CheckCircle2 size={16} className="solution-heading" strokeWidth={3} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
