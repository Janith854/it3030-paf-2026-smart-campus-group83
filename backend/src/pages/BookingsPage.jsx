import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CalendarDays, Loader2, Info } from 'lucide-react';
import { API_BASE, getAuthHeaders } from '../utils/api';
import BookingCard from '../components/BookingCard';
import Navbar from '../components/Navbar';
import './BookingsPage.css';

const BookingsPage = ({ setPage }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/bookings/my`, {
        headers: getAuthHeaders()
      });
      if (Array.isArray(res.data)) {
        setBookings(res.data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Could not load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await axios.patch(`${API_BASE}/bookings/${id}/cancel`, {}, {
        headers: getAuthHeaders()
      });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  return (
    <div className="bookings-page-root">
       <Navbar searchQuery="" setSearchQuery={() => {}} />
       
       <main className="bookings-content">
          <div className="bookings-header">
            <div>
              <h1 className="page-title">My Bookings</h1>
              <p className="page-subtitle">Manage your campus resource reservations and track their status.</p>
            </div>
            <button className="new-booking-btn" onClick={() => setPage('booking-new')}>
              <Plus size={20} />
              <span>New Booking</span>
            </button>
          </div>

          {loading ? (
            <div className="bookings-loader">
              <Loader2 className="spinner" size={40} />
              <p>Fetching your reservations...</p>
            </div>
          ) : error ? (
            <div className="bookings-error">
              <Info size={24} />
              <p>{error}</p>
              <button onClick={fetchBookings}>Retry</button>
            </div>
          ) : bookings.length > 0 ? (
            <div className="bookings-grid">
              {bookings.map(b => (
                <BookingCard 
                  key={b.id} 
                  booking={b} 
                  onCancel={handleCancel} 
                />
              ))}
            </div>
          ) : (
            <div className="empty-bookings-state">
              <div className="empty-icon">
                <CalendarDays size={48} />
              </div>
              <h2>No bookings yet</h2>
              <p>You haven't requested any resource bookings yet. Start by exploring our facilities!</p>
              <button onClick={() => setPage('facilities')}>
                Browse Facilities
              </button>
            </div>
          )}
       </main>
    </div>
  );
};

export default BookingsPage;
