import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, Send, Calendar, Clock, Info, Users, MapPin } from 'lucide-react';
import { API_BASE, getAuthHeaders } from '../utils/api';
import ConflictAlert from '../components/ConflictAlert';
import './BookingFormPage.css';

const BookingFormPage = ({ setPage }) => {
  const [formData, setFormData] = useState({
    resourceId: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: ''
  });

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conflictMsg, setConflictMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch resources to populate the dropdown
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await axios.get(`${API_BASE}/resources`, {
          headers: getAuthHeaders()
        });
        if (Array.isArray(res.data)) {
          setResources(res.data);
        }
      } catch (err) {
        console.error('Error fetching resources:', err);
      }
    };
    fetchResources();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear alerts on change
    setConflictMsg('');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setConflictMsg('');
    setErrorMsg('');

    try {
      await axios.post(`${API_BASE}/bookings`, formData, {
        headers: getAuthHeaders()
      });
      // Success!
      alert('Booking request submitted successfully!');
      setPage('bookings');
    } catch (err) {
      if (err.response?.status === 409) {
        setConflictMsg(err.response.data.message || 'The requested time slot is already taken.');
      } else {
        setErrorMsg(err.response?.data?.message || 'An error occurred while submitting your booking.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-container">
      <div className="form-header">
        <button className="back-btn" onClick={() => setPage('facilities')}>
          <ChevronLeft size={20} />
          <span>Back to Facilities</span>
        </button>
        <h1 className="form-title">Request New Booking</h1>
        <p className="form-subtitle">Fill in the details below to reserve a campus resource.</p>
      </div>

      <div className="form-card">
        <ConflictAlert message={conflictMsg} />
        
        {errorMsg && (
          <div className="generic-error-msg">
            <Info size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-section">
            <div className="input-group">
              <label><MapPin size={14} /> Resource to Book</label>
              <select 
                name="resourceId" 
                value={formData.resourceId} 
                onChange={handleChange}
                required
              >
                <option value="">Select a resource...</option>
                {resources.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label><Calendar size={14} /> Date</label>
              <input 
                type="date" 
                name="bookingDate" 
                value={formData.bookingDate} 
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-section grid-2">
            <div className="input-group">
              <label><Clock size={14} /> Start Time</label>
              <input 
                type="time" 
                name="startTime" 
                value={formData.startTime} 
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label><Clock size={14} /> End Time</label>
              <input 
                type="time" 
                name="endTime" 
                value={formData.endTime} 
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label><Users size={14} /> Expected Attendees</label>
            <input 
              type="number" 
              name="expectedAttendees" 
              value={formData.expectedAttendees} 
              onChange={handleChange}
              placeholder="e.g. 25"
              required
              min="1"
            />
          </div>

          <div className="input-group">
            <label><Info size={14} /> Purpose of Booking</label>
            <textarea 
              name="purpose" 
              value={formData.purpose} 
              onChange={handleChange}
              placeholder="Describe the nature of your event or meeting..."
              required
              rows="4"
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="submit-booking-btn"
            disabled={loading}
          >
            {loading ? 'Submitting...' : (
              <>
                <Send size={18} />
                Confirm Booking Request
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingFormPage;
