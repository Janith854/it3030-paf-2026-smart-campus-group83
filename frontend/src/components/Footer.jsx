import React from 'react';
import { Mail, Zap, Link2 } from 'lucide-react';

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);
import './Footer.css';

const links = {
  Platform: ['Features', 'Resources', 'Booking', 'Tickets', 'Dashboard'],
  Modules: ['Resource Management', 'Booking Workflow', 'Incident Tickets', 'Notifications', 'Role-Based Access'],
  Team: ['About Us', 'GitHub', 'Contact', 'Documentation'],
};

const teamMembers = [
  { name: 'Yashith', role: 'Full-Stack Developer' },
  { name: 'Team Member 2', role: 'Backend Developer' },
  { name: 'Team Member 3', role: 'UI/UX Designer' },
];

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer__top-line" />
      <div className="container">
        <div className="footer__main">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">
              <div className="footer__logo-icon"><Zap size={16} /></div>
              <span>Smart<span className="footer__logo-accent">Campus</span> Hub</span>
            </div>
            <p className="footer__brand-desc">
              A modern SaaS platform for university resource booking and maintenance management. Built for the modern campus.
            </p>
            <div className="footer__socials">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="footer__social-btn" id="footer-github" aria-label="GitHub">
                <GithubIcon />
              </a>
              <a href="mailto:contact@smartcampus.edu" className="footer__social-btn" id="footer-email" aria-label="Email">
                <Mail size={18} />
              </a>
              <a href="#" className="footer__social-btn" id="footer-linkedin" aria-label="LinkedIn">
                <Link2 size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div className="footer__col" key={section}>
              <h4 className="footer__col-title">{section}</h4>
              <ul className="footer__col-links">
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className="footer__link">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Team */}
          <div className="footer__col">
            <h4 className="footer__col-title">Our Team</h4>
            <ul className="footer__team-list">
              {teamMembers.map(m => (
                <li key={m.name} className="footer__team-member">
                  <div className="footer__team-avatar">{m.name.charAt(0)}</div>
                  <div>
                    <div className="footer__team-name">{m.name}</div>
                    <div className="footer__team-role">{m.role}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <div className="footer__bottom-divider" />
          <div className="footer__bottom-row">
            <span className="footer__copy">© 2026 Smart Campus Booking & Maintenance Hub. All rights reserved.</span>
            <span className="footer__built">Built with ⚡ for academic excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
