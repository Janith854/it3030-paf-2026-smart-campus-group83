import React, { useState } from 'react';
import axios from 'axios';
import { ChevronLeft, Send, AlertCircle, Info, MapPin, Tag } from 'lucide-react';
import { API_BASE, getAuthHeaders } from '../utils/api';
import ImageUploader from '../components/ImageUploader';
import './TicketFormPage.css';

const TicketFormPage = ({ setPage }) => {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    priority: 'LOW',
    location: '',
    preferredContact: '',
    resourceId: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      setErrorMsg('Description is required.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const data = new FormData();
      // Ticket JSON as blob
      data.append(
        "ticket",
        new Blob([JSON.stringify(formData)], { type: "application/json" })
      );
      
      // Images
      images.forEach(img => {
        data.append("images", img);
      });

      await axios.post(`${API_BASE}/tickets`, data, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Incident reported successfully!');
      setPage('tickets');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to report incident. Make sure images are < 3 and total size is reasonable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ticket-form-container">
      <div className="form-header">
        <button className="back-btn" onClick={() => setPage('tickets')}>
          <ChevronLeft size={20} />
          <span>Back to Tickets</span>
        </button>
        <h1 className="form-title">Report an Incident</h1>
        <p className="form-subtitle">Help us maintain a smart and safe campus environment.</p>
      </div>

      <div className="form-card">
        {errorMsg && (
          <div className="generic-error-msg">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="incident-form">
          <div className="form-grid">
            <div className="input-group">
              <label><Tag size={14} /> Category</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select Category...</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Furniture">Furniture</option>
                <option value="IT/Equipment">IT / Equipment</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label><AlertCircle size={14} /> Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} required>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label><MapPin size={14} /> Location / Room</label>
            <input 
              type="text" 
              name="location" 
              value={formData.location} 
              onChange={handleChange} 
              placeholder="e.g. Block B, Lab 402"
              required 
            />
          </div>

          <div className="input-group">
            <label><Info size={14} /> Description of Issue</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Describe what's wrong in detail..."
              required
              rows="4"
            ></textarea>
          </div>

          <div className="input-group">
            <label>Preferred Contact</label>
            <input 
              type="text" 
              name="preferredContact" 
              value={formData.preferredContact} 
              onChange={handleChange} 
              placeholder="Email or Phone number"
              required 
            />
          </div>

          <ImageUploader onImagesChange={setImages} />

          <button 
            type="submit" 
            className="submit-ticket-btn"
            disabled={loading}
          >
            {loading ? 'Submitting...' : (
              <>
                <Send size={18} />
                Submit Report
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketFormPage;
