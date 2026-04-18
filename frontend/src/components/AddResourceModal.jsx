import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Plus, 
  MapPin, 
  Users, 
  Activity, 
  Type, 
  Info,
  AlertCircle,
  Box,
  CheckCircle2
} from 'lucide-react';
import api from '../utils/api';

const AddResourceModal = ({ onClose, onResourceAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'LECTURE_HALL',
    capacity: '',
    location: '',
    status: 'ACTIVE',
    description: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        ...formData,
        capacity: parseInt(formData.capacity)
      };

      // POST request for Resource Creation
      const response = await api.post('/resources', payload);
      
      setSuccess(true);
      setTimeout(() => {
        onResourceAdded(response.data);
        onClose();
      }, 1500);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 403) {
          setError("Access Denied: You do not have permission to add resources. Please ensure you are logged in as an ADMIN.");
        } else {
          setError(err.response.data?.message || `Server Error (${err.response.status}): Failed to create resource.`);
        }
      } else if (err.request) {
        setError("Network Error: Could not reach the server. Please check your connection.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Plus size={28} strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Add New Resource</h3>
              <p className="text-sm font-medium text-slate-500 mt-0.5">Define a new facility or asset for the campus.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-slate-400 hover:bg-white hover:text-slate-600 rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center"
            >
              <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-2">Resource Created!</h4>
              <p className="text-slate-500 font-medium">The new resource has been added successfully.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-start gap-4 p-5 bg-red-50 border border-red-100 text-red-700 text-sm rounded-2xl font-medium animate-shake">
                  <AlertCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Resource Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Resource Name</label>
                  <div className="relative">
                    <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Main Auditorium"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-12 pr-4 bg-slate-50 border-2 border-transparent rounded-2xl py-4 text-sm font-semibold outline-none focus:border-indigo-500/10 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all" 
                    />
                  </div>
                </div>

                {/* Resource Type */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Resource Type</label>
                  <div className="relative">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                      required
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-full pl-12 pr-4 bg-slate-50 border-2 border-transparent rounded-2xl py-4 text-sm font-semibold outline-none focus:border-indigo-500/10 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all appearance-none"
                    >
                      <option value="LECTURE_HALL">Lecture Hall</option>
                      <option value="LAB">Laboratory</option>
                      <option value="MEETING_ROOM">Meeting Room</option>
                      <option value="EQUIPMENT">Equipment / Asset</option>
                    </select>
                  </div>
                </div>

                {/* Capacity */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Capacity (Pax)</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="number" 
                      required
                      min="1"
                      placeholder="Number of persons"
                      value={formData.capacity}
                      onChange={e => setFormData({...formData, capacity: e.target.value})}
                      className="w-full pl-12 pr-4 bg-slate-50 border-2 border-transparent rounded-2xl py-4 text-sm font-semibold outline-none focus:border-indigo-500/10 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all" 
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Initial Status</label>
                  <div className="relative">
                    <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                      required
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full pl-12 pr-4 bg-slate-50 border-2 border-transparent rounded-2xl py-4 text-sm font-semibold outline-none focus:border-indigo-500/10 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all appearance-none"
                    >
                      <option value="ACTIVE">Active / Available</option>
                      <option value="OUT_OF_SERVICE">Out of Service</option>
                      <option value="MAINTENANCE">Under Maintenance</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Block A, Level 2"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full pl-12 pr-4 bg-slate-50 border-2 border-transparent rounded-2xl py-4 text-sm font-semibold outline-none focus:border-indigo-500/10 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all" 
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Description (Optional)</label>
                <div className="relative">
                  <Info className="absolute left-4 top-4 text-slate-400" size={18} />
                  <textarea 
                    rows="3" 
                    placeholder="Details about the resource..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full pl-12 pr-4 bg-slate-50 border-2 border-transparent rounded-2xl py-4 text-sm font-semibold outline-none focus:border-indigo-500/10 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all resize-none"
                  ></textarea>
                </div>
              </div>
              
              <div className="pt-6 flex gap-4">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-[1.5] py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      <span>Save Resource</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AddResourceModal;
