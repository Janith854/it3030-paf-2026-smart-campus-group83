import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Zap, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './Navbar.css';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // Call your auth context to know who is logged in

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleGetStarted = (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    // Route securely to native workspaces based on authentication role
    if (user.role === 'ADMIN') navigate('/admin');
    else if (user.role === 'TECHNICIAN') navigate('/technician');
    else navigate('/lecturer');
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="navbar">
      <div className="container navbar__inner">
        {/* Logo */}
        <a href="#" className="navbar__logo" id="navbar-logo">
          <img src={logo} alt="SmartCampus Hub" className="navbar__logo-img" />
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
          <button onClick={handleGetStarted} className="btn btn-primary btn-sm" id="navbar-login-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserIcon size={16} />
            {user ? 'My Dashboard' : 'Sign In'}
          </button>
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
          <button onClick={(e) => { setMobileOpen(false); handleGetStarted(e); }} className="btn btn-primary btn-sm">
            {hasToken ? 'Dashboard' : 'Get Started'}
          </button>
        </div>
      )}
    </nav>
  );
}
