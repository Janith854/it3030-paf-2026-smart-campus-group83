import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  MoreHorizontal,
  ChevronRight,
  Filter,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const BookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null); // For Admin review

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const endpoint = user.role === 'ADMIN' ? '/bookings' : '/bookings/my';
      const response = await api.get(endpoint);
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
      // Fallback
      setBookings([
        { id: '1', resourceName: 'Lecture Hall A', startTime: '2026-04-20T10:00:00', endTime: '2026-04-20T12:00:00', purpose: 'Web Dev Workshop', status: 'PENDING', attendees: 45 },
        { id: '2', resourceName: 'Meeting Room 2', startTime: '2026-04-18T14:30:00', endTime: '2026-04-18T16:00:00', purpose: 'Design Sprint', status: 'APPROVED', attendees: 8 },
        { id: '3', resourceName: 'Lab 04', startTime: '2026-04-17T09:00:00', endTime: '2026-04-17T11:00:00', purpose: 'Hardware Practical', status: 'REJECTED', attendees: 20 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      APPROVED: "bg-green-50 text-green-700 border-green-100",
      PENDING: "bg-amber-50 text-amber-700 border-amber-100",
      REJECTED: "bg-red-50 text-red-700 border-red-100",
      CANCELLED: "bg-slate-50 text-slate-500 border-slate-100"
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bookings</h1>
          <p className="text-slate-500 font-medium">Manage and track your facility reservation requests.</p>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={20} /> New Booking
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-slate-900">{user.role === 'ADMIN' ? 'All Requests' : 'My Reservations'}</h3>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs font-bold rounded-lg">{bookings.length}</span>
          </div>
          <button className="p-2 text-slate-500 hover:bg-white hover:shadow-sm rounded-xl transition-all">
            <Filter size={18} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Facility</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center px-12">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">Purpose</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 ">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{booking.resourceName}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Users size={12} /> {booking.attendees} People
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center px-10">
                    <div className="inline-flex flex-col items-center">
                      <p className="text-sm font-bold text-slate-700">
                        {new Date(booking.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                        {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5 hidden lg:table-cell">
                    <p className="text-sm font-medium text-slate-600 line-clamp-1">{booking.purpose}</p>
                  </td>
                  <td className="px-6 py-5">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    {user.role === 'ADMIN' && booking.status === 'PENDING' ? (
                      <button 
                        onClick={() => setSelectedBooking(booking)}
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      >
                        Review
                      </button>
                    ) : (
                      <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                        <MoreHorizontal size={20} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Booking Modal Placeholder */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowNewModal(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">New Reservation</h3>
                <form className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Resource</label>
                    <select className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                      <option>Lecture Hall A</option>
                      <option>Physics Lab 3</option>
                      <option>Meeting Room 2</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Date</label>
                      <input type="date" className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Attendees</label>
                      <input type="number" placeholder="0" className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Purpose of Booking</label>
                    <textarea rows="3" placeholder="e.g. Club meeting, study session..." className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"></textarea>
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowNewModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">Cancel</button>
                    <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all">Confirm Booking</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Review Modal Placeholder */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedBooking(null)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Review Request</h3>
              <p className="text-slate-500 text-sm mb-6">Booking for <span className="font-bold text-slate-800">{selectedBooking.resourceName}</span></p>
              
              <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Applicant Purpose</p>
                <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{selectedBooking.purpose}"</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 mb-2 block">Rejection Reason (Optional)</label>
                  <textarea rows="2" placeholder="Explain why if rejecting..." className="w-full bg-slate-50 border border-transparent rounded-2xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all resize-none"></textarea>
                </div>
                
                <div className="flex gap-3">
                  <button className="flex-1 py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 group">
                    <XCircle size={18} /> Reject
                  </button>
                  <button className="flex-1 py-4 bg-green-50 text-green-600 font-bold rounded-2xl hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-2 group">
                    <CheckCircle2 size={18} /> Approve
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingsPage;
