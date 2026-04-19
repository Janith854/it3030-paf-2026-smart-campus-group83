import React from 'react';
import { motion } from 'framer-motion';
import { Target, Activity, ShieldCheck, Heart } from 'lucide-react';
import '../styles/components/AboutSections.css';

const missions = [
  {
    icon: <Target size={24} />,
    title: "Efficiency First",
    desc: "Maximizing the utility of every campus asset through intelligent scheduling and zero downtime."
  },
  {
    icon: <Activity size={24} />,
    title: "Data Transparency",
    desc: "Providing stakeholders with a live, 360-degree view of operational health and resource metrics."
  },
  {
    icon: <Heart size={24} />,
    title: "Student Centric",
    desc: "Designing workflows that reduce friction for students and staff, letting them focus on excellence."
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Security & Trust",
    desc: "Combining OAuth protocols and role-based access to safeguard campus data and operations."
  }
];

export default function AboutMission() {
  return (
    <section className="section-container section-container--dark">
      <div className="section-bg-orb" style={{ bottom: '-100px', right: '-100px', background: 'radial-gradient(circle, rgba(96, 165, 250, 0.05) 0%, transparent 70%)' }} />
      
      <div className="section-content">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="section-badge"
          style={{ borderColor: 'rgba(96, 165, 250, 0.2)', color: '#93C5FD' }}
        >
          <Target size={14} />
          <span>Our Mission Pillars</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="section-title"
        >
          Core Values That <br />
          <span className="section-title-gradient">Drive Innovation</span>
        </motion.h2>

        <div className="feature-grid">
          {missions.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="feature-card"
            >
              <div className="feature-icon-wrapper">
                {m.icon}
              </div>
              <h3 className="feature-card-title">{m.title}</h3>
              <p className="feature-card-desc">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
