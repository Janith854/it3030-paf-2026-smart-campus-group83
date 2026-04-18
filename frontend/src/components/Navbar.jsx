import React, { useState, useEffect } from 'react';
import { Menu, X, BookOpen, Zap } from 'lucide-react';
import './Navbar.css';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Resources', href: '#resources' },
  { label: 'Booking', href: '#booking' },
  { label: 'Tickets', href: '#maintenance' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="navbar">
      <div className="container navbar__inner">
        {/* Logo */}
        <a href="#" className="navbar__logo" id="navbar-logo">
          <div className="navbar__logo-icon">
            <Zap size={18} />
          </div>
          <span className="navbar__logo-text">
            Smart<span className="navbar__logo-accent">Campus</span> Hub
          </span>
        </a>

        {/* Desktop Links */}
        <ul className="navbar__links" id="navbar-links">
          {navLinks.map(link => (
            <li key={link.label}>
              <a href={link.href} className="navbar__link" id={`nav-${link.label.toLowerCase()}`}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="navbar__cta">
          <a href="#cta" className="btn btn-primary btn-sm" id="navbar-login-btn">
            Get Started
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="navbar__toggle"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle menu"
          id="navbar-toggle"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="navbar__mobile" id="navbar-mobile">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="navbar__mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a href="#cta" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>
            Get Started
          </a>
        </div>
      )}
    </nav>
  );
}
