import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, AlertCircle, ChevronDown, Sparkles, Shield, Clock } from 'lucide-react';
import './Hero.css';

const stats = [
  { value: '500+', label: 'Rooms Booked', icon: <BookOpen size={16} /> },
  { value: '98%', label: 'Uptime', icon: <Shield size={16} /> },
  { value: '2min', label: 'Avg Response', icon: <Clock size={16} /> },
];

export default function Hero() {
  const navigate = useNavigate();
  return (
    <section className="hero" id="home">
      {/* Background Effects */}
      <div className="hero__bg-orbs">
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__orb hero__orb--3" />
      </div>
      <div className="hero__grid-overlay" />

      <div className="container hero__content">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hero__badge"
          id="hero-badge"
        >
          <Sparkles size={14} />
          <span>Smart Campus Management Platform</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="hero__title"
          id="hero-title"
        >
          Manage Campus
          <br />
          <span className="hero__title-gradient">Resources Smarter</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="hero__subtitle"
          id="hero-subtitle"
        >
          Book rooms, manage assets, and report maintenance issues —
          all in one modern platform built for universities.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="hero__actions"
          id="hero-actions"
        >
          <button onClick={() => navigate('/dashboard/bookings')} className="btn btn-primary btn-lg" id="hero-book-btn">
            <BookOpen size={20} />
            Book Resource
            <ArrowRight size={18} />
          </button>
          <button onClick={() => navigate('/dashboard/tickets')} className="btn btn-secondary btn-lg" id="hero-report-btn">
            <AlertCircle size={20} />
            Report Issue
          </button>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="hero__stats"
          id="hero-stats"
        >
          {stats.map((s, i) => (
            <div className="hero__stat" key={i}>
              <div className="hero__stat-icon">{s.icon}</div>
              <div>
                <div className="hero__stat-value">{s.value}</div>
                <div className="hero__stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="hero__dashboard"
          id="hero-dashboard"
        >
          <div className="hero__dashboard-bar">
            <div className="hero__dashboard-dots">
              <span /><span /><span />
            </div>
            <span className="hero__dashboard-url">smartcampus.edu/dashboard</span>
          </div>
          <div className="hero__dashboard-body">
            {/* Sidebar */}
            <div className="hero__db-sidebar">
              <div className="hero__db-sidebar-logo">
                <Sparkles size={14} />
                <span>SCHub</span>
              </div>
              {['Dashboard', 'Bookings', 'Tickets', 'Resources', 'Users'].map((item, i) => (
                <div className={`hero__db-sidebar-item ${i === 0 ? 'active' : ''}`} key={item}>{item}</div>
              ))}
            </div>
            {/* Main */}
            <div className="hero__db-main">
              <div className="hero__db-header">
                <span>Welcome to Smart Campus Hub 👋</span>
                <div className="hero__db-notif-badge">3</div>
              </div>
              <div className="hero__db-cards">
                {[
                  { label: 'Total Bookings', value: '128', color: '#3B82F6', change: '+12%' },
                  { label: 'Active Tickets', value: '24', color: '#F59E0B', change: '+3' },
                  { label: 'Resolved', value: '196', color: '#10B981', change: '98%' },
                  { label: 'Resources', value: '42', color: '#6366F1', change: 'Active' },
                ].map((c, i) => (
                  <div className="hero__db-card" key={i} style={{ '--card-color': c.color }}>
                    <div className="hero__db-card-label">{c.label}</div>
                    <div className="hero__db-card-value">{c.value}</div>
                    <div className="hero__db-card-change">{c.change}</div>
                  </div>
                ))}
              </div>
              <div className="hero__db-chart">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                  <div className="hero__db-bar" key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="hero__scroll-hint"
        >
          <ChevronDown size={20} className="hero__scroll-icon" />
        </motion.div>
      </div>
    </section>
  );
}
