import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Users, BarChart } from 'lucide-react';
import './AboutSection.css';

const features = [
  {
    icon: <ShieldCheck size={20} />,
    title: 'Secure & Reliable',
    desc: 'Advanced security for campus data.'
  },
  {
    icon: <Zap size={20} />,
    title: 'Lightning Fast',
    desc: 'Real-time booking and updates.'
  },
  {
    icon: <Users size={20} />,
    title: 'Community Focused',
    desc: 'Built for students and staff.'
  },
  {
    icon: <BarChart size={20} />,
    title: 'Smart Analytics',
    desc: 'Data-driven resource management.'
  }
];

export default function AboutSection() {
  return (
    <section className="about" id="about">
      <div className="container about__inner">
        <div className="about__grid">
          <motion.div 
            className="about__content"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="section-label">
              <span className="section-badge-dot" />
              Who We Are
            </div>
            <h2 className="section-title gradient">Revolutionizing Campus<br />Operations Together</h2>
            <p className="section-subtitle">
              Smart Campus Hub is more than just a booking system. It's a comprehensive digital ecosystem that bridges the gap between campus resources and the people who use them every day.
            </p>

            <div className="about__features">
              {features.map((f, i) => (
                <div className="about__feature-item" key={i}>
                  <div className="about__feature-icon">{f.icon}</div>
                  <div>
                    <h4 className="about__feature-title">{f.title}</h4>
                    <p className="about__feature-desc">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="about__visual"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="about__image-container">
              <img 
                src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=1000" 
                alt="Modern University Building" 
                className="about__image"
              />
              <div className="about__floating-badge">
                <div className="floating-badge__icon"><Zap size={20} /></div>
                <div>
                  <div className="floating-badge__title">100% Digital</div>
                  <div className="floating-badge__subtitle">Next-Gen Campus</div>
                </div>
              </div>
              <div className="about__floating-stats">
                <div className="stats-circle">98%</div>
                <div className="stats-label">Efficiency Boost</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
