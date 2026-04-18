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
  ArrowRight,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const BookingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState(null); // For Admin review
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const endpoint = user.role === 'ADMIN' ? '/bookings' : '/bookings/my';
      const response = await api.get(endpoint);
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
      // Fallback
      setBookings([
        { id: '1', resourceName: 'Lecture Hall A', startTime: '2026-04-20T10:00:00', endTime: '2026-04-20T12:00:00', purpose: 'Web Dev Workshop', status: 'PENDING', attendees: 45, userName: 'John Doe' },
        { id: '2', resourceName: 'Meeting Room 2', startTime: '2026-04-18T14:30:00', endTime: '2026-04-18T16:00:00', purpose: 'Design Sprint', status: 'APPROVED', attendees: 8, userName: 'Jane Smith' },
        { id: '3', resourceName: 'Lab 04', startTime: '2026-04-17T09:00:00', endTime: '2026-04-17T11:00:00', purpose: 'Hardware Practical', status: 'REJECTED', attendees: 20, userName: 'Bob Wilson', rejectionReason: 'Lab already booked for maintenance.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await api.patch(`/bookings/${id}/approve`);
      fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      console.error('Approve failed', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setActionLoading(true);
    try {
      await api.patch(`/bookings/${id}/reject?reason=${encodeURIComponent(rejectionReason)}`);
      fetchBookings();
      setSelectedBooking(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Reject failed', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      fetchBookings();
    } catch (error) {
      console.error('Cancel failed', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Admin: Delete this booking record permanently?")) return;
    try {
      await api.delete(`/bookings/${id}`);
      fetchBookings();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const filteredBookings = bookings.filter(b => 
    activeTab === 'ALL' || b.status === activeTab
  );

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
          <h1 className="text-3xl font-bold text-slate-900">Reservations</h1>
          <p className="text-slate-500 font-medium">Manage and track resource booking requests across campus.</p>
        </div>
        {user.role !== 'ADMIN' && (
          <button 
            onClick={() => navigate('/facilities')}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus size={20} /> New Request
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all
              ${activeTab === tab 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-slate-900">
              {user.role === 'ADMIN' ? 'All Facility Requests' : 'My Project Sessions'}
            </h3>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs font-bold rounded-lg">{filteredBookings.length}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <Calendar size={14} /> Live View
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Resource & User</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Schedule</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hidden lg:table-cell">Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 ">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/50 transition-all group border-b border-slate-50 last:border-0">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                        <Plus size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{booking.resourceName}</p>
                        <p className="text-xs font-medium text-slate-400 mt-0.5">
                          {user.role === 'ADMIN' ? `by ${booking.userName || 'Unknown User'}` : `${booking.attendees} Attendees`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-center">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-black text-slate-500 mb-1">
                        {new Date(booking.startTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </span>
                      <p className="text-sm font-bold text-slate-700">
                        {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5 hidden lg:table-cell">
                    <p className="text-xs font-medium text-slate-500 max-w-xs">{booking.purpose}</p>
                    {booking.rejectionReason && (
                      <div className="mt-2 flex items-start gap-1.5 text-[10px] text-red-500 font-bold italic">
                        <AlertCircle size={10} className="mt-0.5" /> Noted: {booking.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.role === 'ADMIN' && booking.status === 'PENDING' && (
                        <button 
                          onClick={() => {
                            setSelectedBooking(booking);
                            setRejectionReason('');
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                        >
                          Review Request
                        </button>
                      )}
                      
                      {/* Non-admin Cancel Logic */}
                      {user.role !== 'ADMIN' && (booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                        <button 
                          onClick={() => handleCancel(booking.id)}
                          className="px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                          Cancel
                        </button>
                      )}

                      {/* Admin Delete Logic */}
                      {user.role === 'ADMIN' && (
                        <button 
                          onClick={() => handleDelete(booking.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Booking Modal handled by redirect to Facilities */}

      {/* Admin Review Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedBooking(null)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 leading-tight">Review Requested Provision</h3>
                  <p className="text-sm font-medium text-slate-400 mt-1">Application ID: {selectedBooking.id}</p>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Session Purpose</p>
                  <p className="text-sm font-medium text-slate-700 italic">"{selectedBooking.purpose}"</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Resource</p>
                    <p className="text-sm font-bold text-slate-700">{selectedBooking.resourceName}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expected</p>
                    <p className="text-sm font-bold text-slate-700">{selectedBooking.attendees} People</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 mb-2 block">Decision Note (Required for Rejection)</label>
                  <textarea 
                    rows="3" 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide context or feedback for the applicant..." 
                    className="w-full bg-slate-50 border border-transparent rounded-2xl py-3.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-100 transition-all resize-none"
                  ></textarea>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    disabled={actionLoading}
                    onClick={() => handleReject(selectedBooking.id)}
                    className="flex-1 py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {actionLoading ? 'Wait...' : <><XCircle size={18} /> Deny Request</>}
                  </button>
                  <button 
                    disabled={actionLoading}
                    onClick={() => handleApprove(selectedBooking.id)}
                    className="flex-1 py-4 bg-green-50 text-green-600 font-bold rounded-2xl hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {actionLoading ? 'Wait...' : <><CheckCircle2 size={18} /> Approve</>}
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
