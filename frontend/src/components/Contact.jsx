import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus(''), 3000);
    }, 1500);
  };

  return (
    <section className="section section-dark contact" id="contact">
      <div className="container">
        <div className="section-header">
          <div className="section-label">
            <span className="section-badge-dot" />
            Get In Touch
          </div>
          <h2 className="section-title gradient">
            We're Here to Help<br />You Succeed
          </h2>
          <p className="section-subtitle">
            Have questions about the platform or need technical assistance? Our team is available 24/7 to support your campus journey.
          </p>
        </div>

        <div className="contact__grid">
          {/* Contact Info */}
          <div className="contact__info">
            <div className="contact__info-card">
              <h3 className="contact__info-title">Contact Information</h3>
              <p className="contact__info-desc">Reach out to us through any of these channels or fill the form.</p>
              
              <div className="contact__details">
                <div className="contact__detail-item">
                  <div className="contact__detail-icon"><Mail size={20} /></div>
                  <div>
                    <div className="contact__detail-label">Email Us</div>
                    <div className="contact__detail-value">support@smartcampus.edu</div>
                  </div>
                </div>
                <div className="contact__detail-item">
                  <div className="contact__detail-icon"><Phone size={20} /></div>
                  <div>
                    <div className="contact__detail-label">Call Us</div>
                    <div className="contact__detail-value">+1 (555) 123-4567</div>
                  </div>
                </div>
                <div className="contact__detail-item">
                  <div className="contact__detail-icon"><MapPin size={20} /></div>
                  <div>
                    <div className="contact__detail-label">Visit Us</div>
                    <div className="contact__detail-value">Campus Main Admin Block, Building 01</div>
                  </div>
                </div>
              </div>

              <div className="contact__social">
                <div className="social-badge">Active Support 24/7</div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact__form-wrapper">
            <form className="contact__form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@university.edu" 
                    required 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input 
                  type="text" 
                  placeholder="How can we help?" 
                  required 
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea 
                  placeholder="Your message here..." 
                  rows="5" 
                  required 
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit" 
                className={`btn btn-primary btn-lg contact__submit ${status === 'sending' ? 'loading' : ''}`}
                disabled={status === 'sending' || status === 'success'}
              >
                {status === 'sending' ? 'Sending...' : status === 'success' ? 'Message Sent!' : (
                  <>
                    Send Message <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
