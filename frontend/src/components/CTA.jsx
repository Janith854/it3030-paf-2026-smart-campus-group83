import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Zap } from 'lucide-react';
import './CTA.css';

export default function CTA() {
  const navigate = useNavigate();
  return (
    <section className="section cta" id="cta">
      <div className="cta__bg-orb cta__bg-orb--1" />
      <div className="cta__bg-orb cta__bg-orb--2" />
      <div className="container">
        <motion.div
          className="cta__card"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          id="cta-card"
        >
          <div className="cta__icon">
            <Zap size={32} />
          </div>
          <h2 className="cta__title">
            Start Managing Your Campus<br />
            <span className="cta__title-accent">Smarter Today</span>
          </h2>
          <p className="cta__subtitle">
            Join universities already using Smart Campus Hub to eliminate booking conflicts,
            accelerate maintenance, and gain full visibility over campus operations.
          </p>
          <div className="cta__actions" id="cta-actions">
            <button onClick={() => navigate('/login')} className="btn btn-primary btn-lg cta__btn-primary" id="cta-get-started">
              <BookOpen size={20} />
              Get Started Free
              <ArrowRight size={18} />
            </button>
            <a href="#features" className="btn btn-secondary btn-lg" id="cta-learn-more">
              Learn More
            </a>
          </div>
          <p className="cta__note">No credit card required · Free for academic institutions · Open source</p>
        </motion.div>
      </div>
    </section>
  );
}
