import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Users as CapacityIcon, 
  Filter, 
  Building2,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  Eye,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const FacilitiesPage = () => {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [minCapacity, setMinCapacity] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [viewingResource, setViewingResource] = useState(null);
  const [newResource, setNewResource] = useState({
    name: '',
    type: 'LECTURE_HALL',
    capacity: 10,
    location: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/resources');
      setFacilities(response.data);
    } catch (error) {
      console.error('Failed to fetch facilities', error);
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

  const handleCreateResource = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/resources', newResource);
      setFacilities([...facilities, response.data]);
      alert('Resource created successfully!');
      setShowAddModal(false);
      setNewResource({
        name: '',
        type: 'LECTURE_HALL',
        capacity: 10,
        location: '',
        status: 'ACTIVE'
      });
    } catch (error) {
      console.error('Failed to create resource', error);
      alert(error.response?.data?.message || 'Failed to create resource');
    }
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    if (!editingResource) return;
    try {
      const response = await api.put(`/resources/${editingResource.id}`, newResource);
      setFacilities(facilities.map(f => f.id === editingResource.id ? response.data : f));
      alert('Resource updated successfully!');
      setEditingResource(null);
      setShowAddModal(false);
      setNewResource({
        name: '',
        type: 'LECTURE_HALL',
        capacity: 10,
        location: '',
        status: 'ACTIVE'
      });
    } catch (error) {
      console.error('Failed to update resource', error);
      alert(error.response?.data?.message || 'Failed to update resource');
    }
  };

  const handleDeleteResource = async (id) => {
    console.log('Attempting to delete resource with ID:', id);
    if (window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      try {
        await api.delete(`/resources/${id}`);
        setFacilities(facilities.filter(f => f.id !== id));
        alert('Resource deleted successfully!');
      } catch (error) {
        console.error('Failed to delete resource', error);
        alert(error.response?.data?.message || 'Failed to delete resource. Please check if you have Admin permissions.');
      }
    }
  };

  const openEditModal = (facility) => {
    setEditingResource(facility);
    setNewResource({
      name: facility.name,
      type: facility.type,
      capacity: facility.capacity,
      location: facility.location,
      status: facility.status
    });
    setShowAddModal(true);
  };

  const filteredFacilities = facilities.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = f.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesCategory = activeFilter === 'ALL' || f.type === activeFilter;
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    const matchesCapacity = minCapacity === '' || f.capacity >= parseInt(minCapacity);
    return matchesSearch && matchesLocation && matchesCategory && matchesStatus && matchesCapacity;
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
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campus Facilities</h1>
          <p className="text-slate-500 font-medium mt-1">Explore and book available resources across the campus.</p>
          {user?.role !== 'ADMIN' && (
            <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-semibold">
              <AlertCircle size={14} />
              Note: You are logged in as {user?.role}. Only Administrators can Edit or Delete resources.
            </div>
          )}
        </div>
        {user?.role === 'ADMIN' && (
          <button 
            onClick={() => {
              setEditingResource(null);
              setNewResource({ name: '', type: 'LECTURE_HALL', capacity: 10, location: '', status: 'ACTIVE' });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus size={20} /> Add Resource
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-soft space-y-4">
        {/* Filter Buttons */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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
          
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('card')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${viewMode === 'card' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500'}`}
            >
              Cards
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500'}`}
            >
              Table
            </button>
          </div>
        </div>

        {/* Advanced Filters & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
            />
          </div>
          <div className="relative md:col-span-1">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
            </select>
          </div>
          <div>
            <input
              type="number"
              placeholder="Min Capacity"
              value={minCapacity}
              onChange={(e) => setMinCapacity(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && facilities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
          <h3 className="text-lg font-bold text-slate-900">Loading resources...</h3>
          <p className="text-slate-500 text-sm">Please wait while we fetch the campus facilities.</p>
        </div>
      )}

      {/* Card View */}
      {!loading && viewMode === 'card' && (
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

                  <div className="flex gap-2">
                    <button className={`flex-1 py-4 rounded-2xl font-bold transition-all shadow-md
                      ${facility.status === 'ACTIVE' 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/10' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                      {facility.status === 'ACTIVE' ? 'Book Now' : 'Unavailable'}
                    </button>
                    <button 
                      onClick={() => setViewingResource(facility)}
                      className="px-4 py-2 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    {user?.role === 'ADMIN' && (
                      <>
                        <button 
                          onClick={() => openEditModal(facility)}
                          className="px-4 py-2 bg-slate-50 text-indigo-600 rounded-2xl hover:bg-indigo-50 transition-all"
                          title="Edit Resource"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteResource(facility.id)}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-2xl hover:bg-red-50 transition-all"
                          title="Delete Resource"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Table View */}
      {!loading && viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Location</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Capacity</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFacilities.map((facility) => (
                  <tr key={facility.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5 font-bold text-slate-900">{facility.name}</td>
                    <td className="px-6 py-5 text-sm text-slate-600">{facility.type.replace('_', ' ')}</td>
                    <td className="px-6 py-5 text-sm text-slate-600">{facility.location}</td>
                    <td className="px-6 py-5 text-sm text-slate-600">{facility.capacity} pax</td>
                    <td className="px-6 py-5">{getStatusBadge(facility.status)}</td>
                    <td className="px-6 py-5 text-right flex gap-2 justify-end">
                      <button 
                        onClick={() => setViewingResource(facility)}
                        className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-600 hover:text-white transition-all"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {user?.role === 'ADMIN' && (
                        <>
                          <button 
                            onClick={() => openEditModal(facility)}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                            title="Edit Resource"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteResource(facility.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                            title="Delete Resource"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredFacilities.length === 0 && !loading && (
        <div className="text-center py-20 px-8">
          <div className="bg-slate-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Filter size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No facilities found</h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto font-medium">Try adjusting your search filters or browse other categories.</p>
        </div>
      )}

      {/* View Resource Modal */}
      <AnimatePresence>
        {viewingResource && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setViewingResource(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="h-40 bg-indigo-600 relative overflow-hidden flex items-center justify-center">
                <Building2 size={64} className="text-white/20" />
                <div className="absolute top-6 left-6">
                  {getStatusBadge(viewingResource.status)}
                </div>
                <button 
                  onClick={() => setViewingResource(null)}
                  className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight mb-1">{viewingResource.name}</h3>
                <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-6">{viewingResource.type.replace('_', ' ')}</p>

                <div className="space-y-4 bg-slate-50 p-6 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600"><MapPin size={24} /></div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Location</p>
                      <p className="text-slate-900 font-semibold">{viewingResource.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600"><CapacityIcon size={24} /></div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Capacity</p>
                      <p className="text-slate-900 font-semibold">{viewingResource.capacity} Person(s)</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3 flex-col sm:flex-row">
                  <button 
                    onClick={() => setViewingResource(null)}
                    className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    Close Document
                  </button>
                  <button 
                    disabled={viewingResource.status !== 'ACTIVE'}
                    className={`w-full py-4 font-bold rounded-2xl transition-all ${
                      viewingResource.status === 'ACTIVE'
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/20'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {viewingResource.status === 'ACTIVE' ? 'Book Resource' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Resource Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">{editingResource ? 'Edit Resource' : 'Add New Resource'}</h3>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form className="space-y-5" onSubmit={editingResource ? handleUpdateResource : handleCreateResource}>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Resource Name</label>
                    <input 
                      type="text"
                      required
                      value={newResource.name}
                      onChange={(e) => setNewResource({...newResource, name: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="e.g., Lecture Hall A"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Type</label>
                      <select 
                        value={newResource.type}
                        onChange={(e) => setNewResource({...newResource, type: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      >
                        <option value="LECTURE_HALL">Lecture Hall</option>
                        <option value="LAB">Lab</option>
                        <option value="MEETING_ROOM">Meeting Room</option>
                        <option value="EQUIPMENT">Equipment</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Capacity</label>
                      <input 
                        type="number"
                        min="1"
                        value={newResource.capacity}
                        onChange={(e) => setNewResource({...newResource, capacity: parseInt(e.target.value)})}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Location</label>
                    <input 
                      type="text"
                      required
                      value={newResource.location}
                      onChange={(e) => setNewResource({...newResource, location: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="e.g., Building 01, Level 2"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Status</label>
                    <select 
                      value={newResource.status}
                      onChange={(e) => setNewResource({...newResource, status: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="OUT_OF_SERVICE">Out of Service</option>
                    </select>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all"
                    >
                      {editingResource ? 'Update Resource' : 'Add Resource'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacilitiesPage;
