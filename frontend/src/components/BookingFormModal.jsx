import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, Users, FileText, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

/* Module B – Member 2 Contribution: Booking UI Component */
const BookingFormModal = ({ facility, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Compose final ISO date strings
      const startDateTime = `${formData.bookingDate}T${formData.startTime}:00`;
      const endDateTime = `${formData.bookingDate}T${formData.endTime}:00`;

      const payload = {
        resourceId: facility.id,
        resourceName: facility.name,
        bookingDate: formData.bookingDate,
        startTime: startDateTime,
        endTime: endDateTime,
        purpose: formData.purpose,
        attendees: parseInt(formData.attendees) || 0
      };

      // POST request for Booking (Requirement: POST HTTP Method)
      await api.post('/bookings', payload);
      
      // Navigate to My Bookings
      onClose();
      navigate('/bookings');
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError("Booking Conflict Found. The resource is already booked for this time period.");
      } else {
        setError(err.response?.data?.message || "Failed to create booking.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Book Facility</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">{facility.name} • {facility.location}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-white hover:text-slate-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-2xl font-medium">
                <AlertCircle size={18} className="text-red-500 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Booking Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="date" 
                  required
                  value={formData.bookingDate}
                  onChange={e => setFormData({...formData, bookingDate: e.target.value})}
                  className="w-full pl-12 pr-4 bg-slate-50 border border-transparent rounded-2xl py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Start Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="time" 
                    required
                    value={formData.startTime}
                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                    className="w-full pl-12 pr-4 bg-slate-50 border border-transparent rounded-2xl py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">End Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="time" 
                    required
                    value={formData.endTime}
                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                    className="w-full pl-12 pr-4 bg-slate-50 border border-transparent rounded-2xl py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Expected Attendees</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="number" 
                  required
                  min="1"
                  max={facility.capacity}
                  value={formData.attendees}
                  onChange={e => setFormData({...formData, attendees: e.target.value})}
                  placeholder={`Max ${facility.capacity}`} 
                  className="w-full pl-12 pr-4 bg-slate-50 border border-transparent rounded-2xl py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Purpose of Booking</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
                <textarea 
                  rows="3" 
                  required
                  value={formData.purpose}
                  onChange={e => setFormData({...formData, purpose: e.target.value})}
                  placeholder="e.g. Club meeting, study session..." 
                  className="w-full pl-12 pr-4 bg-slate-50 border border-transparent rounded-2xl py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
                ></textarea>
              </div>
            </div>
            
            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingFormModal;
