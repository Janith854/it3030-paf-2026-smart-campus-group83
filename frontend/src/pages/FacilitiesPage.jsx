import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Users as CapacityIcon, 
  Filter, 
  MoreVertical,
  Building2,
  Wrench,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../utils/api';

const FacilitiesPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const response = await api.get('/resources');
      setFacilities(response.data);
    } catch (error) {
      console.error('Failed to fetch facilities', error);
      // Fallback data for demonstration if backend is not seeded
      setFacilities([
        { id: 1, name: 'Lecture Hall A', type: 'LECTURE_HALL', capacity: 250, location: 'Building 01, Level 2', status: 'ACTIVE' },
        { id: 2, name: 'Physics Lab 3', type: 'LAB', capacity: 40, location: 'Science Block, Level 1', status: 'ACTIVE' },
        { id: 3, name: 'Main Auditorium', type: 'LECTURE_HALL', capacity: 1000, location: 'Cultural Center', status: 'MAINTENANCE' },
        { id: 4, name: 'Meeting Room 204', type: 'MEETING_ROOM', capacity: 12, location: 'Library, Level 2', status: 'ACTIVE' },
        { id: 5, name: 'Design Studio', type: 'EQUIPMENT', capacity: 25, location: 'Arts Wing, Level 3', status: 'OUT_OF_SERVICE' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFacilities = facilities.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeFilter === 'ALL' || f.type === activeFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { label: 'All Resources', value: 'ALL' },
    { label: 'Lecture Halls', value: 'LECTURE_HALL' },
    { label: 'Labs', value: 'LAB' },
    { label: 'Meeting Rooms', value: 'MEETING_ROOM' },
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
          <CheckCircle2 size={12} /> Active
        </span>;
      case 'MAINTENANCE':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
          <Wrench size={12} /> Maintenance
        </span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-100">
          <AlertCircle size={12} /> Out of Service
        </span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Campus Facilities</h1>
        <p className="text-slate-500 font-medium mt-1">Explore and book available resources across the campus.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-soft flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveFilter(cat.value)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all
                ${activeFilter === cat.value 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredFacilities.map((facility, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={facility.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden group hover:border-indigo-200 transition-all card-hover"
            >
              {/* Card Header/Image placeholder */}
              <div className="h-48 bg-slate-100 relative">
                <div className="absolute top-4 left-4">
                  {getStatusBadge(facility.status)}
                </div>
                <div className="h-full flex items-center justify-center opacity-20">
                  <Building2 size={80} className="text-slate-400" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-tight">
                      {facility.name}
                    </h3>
                    <p className="text-xs font-bold text-indigo-500 mt-1 uppercase tracking-widest">{facility.type.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-slate-500">
                    <MapPin size={16} />
                    <span className="text-sm font-medium">{facility.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <CapacityIcon size={16} />
                    <span className="text-sm font-medium">Capacity: {facility.capacity} pax</span>
                  </div>
                </div>

                <button className={`w-full py-4 rounded-2xl font-bold transition-all shadow-md
                  ${facility.status === 'ACTIVE' 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/10' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                  {facility.status === 'ACTIVE' ? 'Book Now' : 'Currently Unavailable'}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredFacilities.length === 0 && !loading && (
        <div className="text-center py-20 px-8">
          <div className="bg-slate-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Filter size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No facilities found</h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto font-medium">Try adjusting your search filters or browse other categories.</p>
        </div>
      )}
    </div>
  );
};

export default FacilitiesPage;
