import React from 'react';
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
        <div className="about__content">
          <div className="section-label">
            <span className="section-badge-dot" />
            Who We Are
          </div>
          <h2 className="section-title gradient">Revolutionizing Campus<br />Operations Together</h2>
          <p className="section-subtitle">
            Smart Campus Hub is more than just a booking system. It's a comprehensive digital ecosystem that bridges the gap between campus resources and the people who use them every day. We simplify complex workflows so you can focus on what matters most: education and innovation.
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
        </div>
      </div>
    </section>
  );
}
