import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  Search, 
  MapPin, 
  Users as CapacityIcon, 
  Filter, 
  Building2,
  Wrench,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import BookingFormModal from '../components/BookingFormModal';
import AddResourceModal from '../components/AddResourceModal';

const FacilitiesPage = () => {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
        { id: '1', name: 'Main Auditorium', type: 'LECTURE_HALL', capacity: 500, location: 'Block A, Level 1', status: 'ACTIVE' },
        { id: '2', name: 'Advanced Computing Lab', type: 'LAB', capacity: 60, location: 'Block B, Level 3', status: 'ACTIVE' },
        { id: '3', name: 'Executive Board Room', type: 'MEETING_ROOM', capacity: 20, location: 'Admin Block, Level 4', status: 'ACTIVE' },
        { id: '4', name: 'Sony DSLR Camera Kit', type: 'EQUIPMENT', capacity: 1, location: 'Media Unit', status: 'ACTIVE' },
        { id: '5', name: 'General Chemistry Lab', type: 'LAB', capacity: 40, location: 'Block C, Level 2', status: 'OUT_OF_SERVICE' },
        { id: '6', name: 'Mini Lecture Theater', type: 'LECTURE_HALL', capacity: 150, location: 'Block B, Level 1', status: 'ACTIVE' },
        { id: '7', name: 'Robotics & AI Lab', type: 'LAB', capacity: 30, location: 'Block E, Level 2', status: 'ACTIVE' },
        { id: '8', name: 'EPSON 4K Projector', type: 'EQUIPMENT', capacity: 1, location: 'IT Dept', status: 'ACTIVE' },
        { id: '9', name: 'Collaborative Study Space', type: 'MEETING_ROOM', capacity: 50, location: 'Library, Level 2', status: 'ACTIVE' },
        { id: '10', name: 'Physics Research Lab', type: 'LAB', capacity: 25, location: 'Block C, Level 3', status: 'ACTIVE' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFacilities = facilities.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeFilter === 'ALL' || f.type === activeFilter;
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    
    let matchesCapacity = true;
    if (capacityFilter === 'small') matchesCapacity = f.capacity <= 20;
    else if (capacityFilter === 'medium') matchesCapacity = f.capacity > 20 && f.capacity <= 100;
    else if (capacityFilter === 'large') matchesCapacity = f.capacity > 100;

    return matchesSearch && matchesCategory && matchesStatus && matchesCapacity;
  });

  const categories = [
    { label: 'All Resources', value: 'ALL' },
    { label: 'Lecture Halls', value: 'LECTURE_HALL' },
    { label: 'Labs', value: 'LAB' },
    { label: 'Meeting Rooms', value: 'MEETING_ROOM' },
    { label: 'Equipment', value: 'EQUIPMENT' },
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campus Facilities</h1>
          <p className="text-slate-500 font-medium mt-1">Explore and book available resources across the campus.</p>
        </div>
        
        {user?.role === 'ADMIN' && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} strokeWidth={3} />
            <span>Add Resource</span>
          </button>
        )}
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
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all appearance-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          <select 
            value={capacityFilter}
            onChange={(e) => setCapacityFilter(e.target.value)}
            className="w-full md:w-auto px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all appearance-none"
          >
            <option value="">Any Capacity</option>
            <option value="small">Small (&le;20)</option>
            <option value="medium">Medium (21-100)</option>
            <option value="large">Large (&gt;100)</option>
          </select>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
            />
          </div>
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

                <button 
                  onClick={() => facility.status === 'ACTIVE' && setSelectedFacility(facility)}
                  className={`w-full py-4 rounded-2xl font-bold transition-all shadow-md
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

      <AnimatePresence>
        {selectedFacility && (
          <BookingFormModal 
            facility={selectedFacility} 
            onClose={() => setSelectedFacility(null)} 
          />
        )}
        
        {isAddModalOpen && (
          <AddResourceModal 
            onClose={() => setIsAddModalOpen(false)}
            onResourceAdded={(newRes) => {
              setFacilities([newRes, ...facilities]);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacilitiesPage;
