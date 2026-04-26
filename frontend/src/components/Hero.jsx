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
