import React from 'react';
import { Layout, Calendar, Wrench, Bell, Shield, Users } from 'lucide-react';
import './Services.css';

const services = [
  {
    title: 'Resource Management',
    desc: 'Efficiently manage campus facilities, equipment, and laboratory spaces in one centralized system.',
    icon: <Layout size={24} />,
    color: '#2A9D8F'
  },
  {
    title: 'Easy Booking Flow',
    desc: 'Intuitive scheduling system for students and staff to reserve rooms and assets with real-time availability.',
    icon: <Calendar size={24} />,
    color: '#E9C46A'
  },
  {
    title: 'Maintenance Tracking',
    desc: 'Simplified incident reporting and technician assignment workflow to keep campus infrastructure running smoothly.',
    icon: <Wrench size={24} />,
    color: '#F4A261'
  },
  {
    title: 'Real-time Notifications',
    desc: 'Stay updated with instant alerts for booking approvals, maintenance updates, and campus announcements.',
    icon: <Bell size={24} />,
    color: '#E76F51'
  },
  {
    title: 'Role-Based Access',
    desc: 'Secure authentication and tailored dashboards for Admins, Technicians, and Lecturers.',
    icon: <Shield size={24} />,
    color: '#264653'
  },
  {
    title: 'Community Insights',
    desc: 'Gather feedback and analyze campus resource utilization to make data-driven management decisions.',
    icon: <Users size={24} />,
    color: '#2A9D8F'
  }
];

export default function Services() {
  return (
    <section className="services" id="services">
      <div className="container">
        <div className="section-header">
          <div className="section-label">
            <span className="section-badge-dot" />
            Our Services
          </div>
          <h2 className="section-title gradient">Comprehensive Solutions for<br />Modern Campuses</h2>
          <p className="section-subtitle">
            We provide a suite of integrated tools designed to streamline operations and enhance the campus experience for everyone.
          </p>
        </div>

        <div className="services__grid">
          {services.map((service, index) => (
            <div key={service.title} className="service-card">
              <div className="service-card__icon" style={{ '--icon-color': service.color }}>
                {service.icon}
              </div>
              <h3 className="service-card__title">{service.title}</h3>
              <p className="service-card__desc">{service.desc}</p>
              <div className="service-card__footer">
                <span className="service-card__learn">Learn More</span>
                <div className="service-card__line" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
