import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Zap, ShieldCheck } from 'lucide-react';
import './AboutSection.css';

const missionItems = [
  {
    icon: <Target size={24} />,
    title: 'Our Mission',
    desc: 'To revolutionize campus resource management through seamless, role-agnostic digital integration, empowering students, staff, and administrators alike.'
  },
  {
    icon: <Users size={24} />,
    title: 'Collaborative Ecosystem',
    desc: 'Connecting every stakeholder on campus in a single, unified platform that fosters transparency and efficiency across all university operations.'
  },
  {
    icon: <Zap size={24} />,
    title: 'Innovation First',
    desc: 'Leveraging cutting-edge technologies to solve real-world campus logistics, from room bookings to complex maintenance workflows.'
  },
  {
    icon: <ShieldCheck size={24} />,
    title: 'Reliability & Trust',
    desc: 'Built with security and uptime as core pillars, ensuring that your campus resources are always manageable and secure.'
  }
];

export default function AboutSection() {
  return (
    <section className="section section-light about-section">
      <div className="container">
        <div className="about-section__grid">
          <motion.div 
            className="about-section__content"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="section-label light">
              <span className="section-badge-dot" />
              Who We Are
            </div>
            <h2 className="section-title" style={{ color: '#0F172A' }}>
              Transforming the Modern<br />
              <span style={{ color: '#2563EB' }}>University Experience</span>
            </h2>
            <p className="section-subtitle dark">
              At Smart Campus Hub, we believe that resource management should be invisible yet indispensable. 
              Our platform bridges the gap between physical infrastructure and digital convenience, 
              providing a "single source of truth" for the entire academic community.
            </p>
            
            <div className="about-section__mission-grid">
              {missionItems.map((item, i) => (
                <div className="mission-item" key={i}>
                  <div className="mission-item__icon">{item.icon}</div>
                  <div className="mission-item__text">
                    <h4 className="mission-item__title">{item.title}</h4>
                    <p className="mission-item__desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="about-section__visual"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="about-section__image-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=1000" 
                alt="University Hub" 
                className="about-section__image"
              />
              <div className="about-section__floating-card">
                <div className="floating-card__icon"><Zap size={20} color="#fff" /></div>
                <div className="floating-card__text">
                  <strong>100% Digital</strong>
                  <span>Next-Gen Campus</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
