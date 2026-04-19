import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Users, Wifi, Projector, BookOpen, Filter } from 'lucide-react';
import { resourcesApi } from '../services/api';
import './ResourceShowcase.css';

const gradients = {
  LECTURE_HALL: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
  LAB: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)',
  MEETING_ROOM: 'linear-gradient(135deg, #312e81 0%, #4338ca 50%, #6366f1 100%)',
  EQUIPMENT: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #f59e0b 100%)',
  DEFAULT: 'linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 50%, #38bdf8 100%)',
};

const MAP_TYPE_LABEL = {
  LECTURE_HALL: 'Hall',
  LAB: 'Lab',
  MEETING_ROOM: 'Room',
  EQUIPMENT: 'Equip'
};

const filterTabs = [
  { id: '', label: 'All' },
  { id: 'LECTURE_HALL', label: 'Hall' },
  { id: 'LAB', label: 'Lab' },
  { id: 'MEETING_ROOM', label: 'Room' }
];

export default function ResourceShowcase() {
  const [activeFilter, setActiveFilter] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchResources = async () => {
      try {
        const data = await resourcesApi.getAll();
        if (mounted) {
          setResources(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error('Failed to fetch resources:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchResources();
    return () => { mounted = false; };
  }, []);

  const handleBook = (id) => {
    const token = localStorage.getItem('token');
    const testRole = localStorage.getItem('testRoleOverride') || 'USER';
    if (token) {
      if (testRole === 'ADMIN') {
        navigate('/admin/bookings', { state: { resourceId: id } });
      } else {
        navigate('/lecturer/bookings', { state: { resourceId: id } });
      }
    } else {
      navigate('/login');
    }
  };

  let filtered = !activeFilter
    ? resources
    : resources.filter(r => r.type === activeFilter);

  if (searchLocation.trim()) {
    filtered = filtered.filter(r => r.location?.toLowerCase().includes(searchLocation.toLowerCase()));
  }
  if (minCapacity) {
    filtered = filtered.filter(r => r.capacity >= parseInt(minCapacity, 10));
  }

  // If we have fewer than 6, maybe we fallback or just show empty? Real data handles it.

  return (
    <section className="section section-surface resources" id="resources">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label light">
            <span className="section-badge-dot" style={{ background: '#2563EB' }} />
            Resource Catalogue
          </div>
          <h2 className="section-title" style={{ color: '#0F172A' }}>
            Browse Available <span style={{ color: '#2563EB' }}>Campus Spaces</span>
          </h2>
          <p className="section-subtitle dark">
            Explore lecture halls, computer labs, seminar rooms, and equipment available for booking. {loading && "(Loading...)"}
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          className="resources__filters"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          id="resources-filters"
          style={{ flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={16} className="resources__filter-icon" />
            {filterTabs.map(f => (
              <button
                key={f.id}
                className={`resources__filter-btn ${activeFilter === f.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(f.id)}
                id={`filter-${f.label.toLowerCase()}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Search location..." 
              value={searchLocation} 
              onChange={e => setSearchLocation(e.target.value)} 
              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.9rem', outline: 'none' }}
            />
            <input 
              type="number" 
              placeholder="Min seats" 
              value={minCapacity} 
              onChange={e => setMinCapacity(e.target.value)} 
              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.9rem', outline: 'none', width: '100px' }}
            />
          </div>
        </motion.div>

        {/* Cards Grid */}
        <div className="resources__grid">
          {filtered.map((r, i) => {
            const isAvailable = r.status === 'ACTIVE';
            const displayStatus = isAvailable ? 'Available' : (r.status === 'MAINTENANCE' ? 'Maintenance' : 'Unavailable');
            
            // Dummy amenities based on type since backend just has description
            const defaultAmenities = r.type === 'LAB' ? ['WiFi', 'Computers'] : ['WiFi', 'AC', 'Projector'];

            return (
              <motion.div
                key={r.id}
                className="resource-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                id={`resource-card-${i}`}
              >
                {/* Card Image Area */}
                <div className="resource-card__image" style={{ background: gradients[r.type] || gradients.DEFAULT }}>
                  <div className="resource-card__type-badge">{MAP_TYPE_LABEL[r.type] || r.type}</div>
                  <div
                    className={`resource-card__status ${
                      isAvailable ? 'available' :
                      r.status === 'OUT_OF_SERVICE' ? 'booked' : 'maintenance'
                    }`}
                  >
                    <span className="resource-card__status-dot" />
                    {displayStatus}
                  </div>
                  {r.capacity && (
                    <div className="resource-card__capacity-overlay">
                      <Users size={14} />
                      <span>{r.capacity} seats</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="resource-card__body">
                  <h3 className="resource-card__name">{r.name}</h3>
                  <div className="resource-card__location">
                    <MapPin size={13} />
                    <span>{r.location}</span>
                  </div>
                  <div className="resource-card__amenities">
                    {defaultAmenities.map(a => (
                      <span key={a} className="resource-card__amenity">{a}</span>
                    ))}
                  </div>
                  {/* Additional info via description */}
                  {r.description && <div style={{fontSize: '0.8rem', color: '#64748b', marginBottom: '10px'}}>{r.description.length > 50 ? r.description.substring(0, 50)+'...' : r.description}</div>}
                  
                  <button
                    className={`resource-card__btn ${!isAvailable ? 'disabled' : ''}`}
                    disabled={!isAvailable}
                    id={`book-btn-${i}`}
                    onClick={() => handleBook(r.id)}
                  >
                    <BookOpen size={15} />
                    {displayStatus === 'Available' ? 'Book Now' : displayStatus === 'Unavailable' ? 'Unavailable' : 'Under Maintenance'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            No resources found.
          </div>
        )}
      </div>
    </section>
  );
}
