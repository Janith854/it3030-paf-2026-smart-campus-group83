import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShieldAlert, BookOpen, ChevronLeft } from 'lucide-react';
import { API_BASE, getAuthHeaders } from '../utils/api';
import ResourceCard from '../components/ResourceCard';
import ResourceFilter from '../components/ResourceFilter';
import Navbar from '../components/Navbar';

const FacilitiesPage = ({ setPage }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Local state to figure out user role. 
  // In a real app this info is in a global Context, 
  // but we derive from token if available, or just mock fallback to non-admin.
  const [userRole, setUserRole] = useState('user');

  const [filters, setFilters] = useState({
    location: '',
    type: '',
    minCapacity: ''
  });

  useEffect(() => {
    // Quick role check from token or simple default
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role?.toLowerCase() || 'user');
      } catch (e) {
        setUserRole('user');
      }
    }
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.minCapacity) queryParams.append('minCapacity', filters.minCapacity);

      const response = await axios.get(`${API_BASE}/resources/filter?${queryParams.toString()}`, {
        headers: getAuthHeaders()
      });

      // Crucial: crash prevention check
      if (Array.isArray(response.data)) {
        setResources(response.data);
      } else {
        setResources([]);
      }
    } catch (err) {
      console.error('Fetch Resources Error:', err);
      setError('Failed to load facilities. Please try again later.');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when component mounts or filters change
  useEffect(() => {
    // Use a small debounce for typing in the location/capacity inputs
    const timeoutId = setTimeout(() => {
      fetchResources();
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [filters]);

  const handleBook = (id) => {
    // Navigate to booking modal or page
    alert(`Initiating booking for resource ID: ${id}`);
  };

  const handleEdit = (resource) => {
    if (userRole !== 'admin') return;
    alert(`Opening Edit Modal for ${resource.name}`);
  };

  const handleDelete = async (id) => {
    if (userRole !== 'admin') return;
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      await axios.delete(`${API_BASE}/resources/${id}`, {
        headers: getAuthHeaders()
      });
      fetchResources();
    } catch (err) {
      alert('Failed to delete resource.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar searchQuery="" setSearchQuery={() => {}} />

      <main className="max-w-7xl mx-auto w-full px-8 py-10 flex-1">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <button 
              onClick={() => setPage('landing')}
              className="flex items-center gap-2 text-teal-600 hover:text-teal-800 transition-colors mb-4 text-sm font-bold bg-teal-50 px-3 py-1.5 rounded-full w-fit"
            >
              <ChevronLeft size={16} /> Back to Hub
            </button>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Facilities &amp; Assets</h1>
            <p className="text-gray-500 text-sm">Browse, filter, and book smart campus resources seamlessly.</p>
          </div>

          {userRole === 'admin' && (
            <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md">
              + New Resource
            </button>
          )}
        </div>

        {/* Filter Section */}
        <ResourceFilter filters={filters} onFilterChange={setFilters} />

        {/* Content Section */}
        {error ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center justify-center gap-3 font-bold"
          >
            <ShieldAlert size={24} />
            {error}
          </motion.div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-60">
            <svg className="animate-spin h-10 w-10 text-teal-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-gray-500 font-bold tracking-widest text-sm uppercase">Loading Resources...</p>
          </div>
        ) : resources.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {resources.map((res) => (
              <ResourceCard 
                key={res.id} 
                resource={res} 
                userRole={userRole} 
                onBook={handleBook}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen size={24} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">No resources found</h3>
            <p className="text-gray-400 text-sm">Try adjusting your filters or search terms.</p>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default FacilitiesPage;
