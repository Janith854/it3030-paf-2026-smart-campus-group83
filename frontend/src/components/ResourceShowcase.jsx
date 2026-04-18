import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Wifi, Projector, BookOpen, Filter } from 'lucide-react';
import './ResourceShowcase.css';

const resources = [
  {
    name: 'Lecture Hall A',
    type: 'Hall',
    capacity: 200,
    location: 'Building A, Block 1',
    status: 'Available',
    amenities: ['Projector', 'WiFi', 'AC'],
    image: 'hall',
    color: '#3B82F6',
  },
  {
    name: 'Computer Lab 2',
    type: 'Lab',
    capacity: 50,
    location: 'Building C, Floor 2',
    status: 'Available',
    amenities: ['Computers', 'WiFi', 'Whiteboard'],
    image: 'lab',
    color: '#10B981',
  },
  {
    name: 'Seminar Room B',
    type: 'Room',
    capacity: 40,
    location: 'Building B, Floor 1',
    status: 'Booked',
    amenities: ['Projector', 'WiFi', 'Video Conf'],
    image: 'room',
    color: '#6366F1',
  },
  {
    name: 'Physics Lab',
    type: 'Lab',
    capacity: 30,
    location: 'Science Block, Floor 3',
    status: 'Available',
    amenities: ['Equipment', 'Safety Kit', 'WiFi'],
    image: 'lab2',
    color: '#F59E0B',
  },
  {
    name: 'Innovation Hub',
    type: 'Hall',
    capacity: 120,
    location: 'Main Block, Ground Floor',
    status: 'Available',
    amenities: ['Stage', 'Sound System', 'AC'],
    image: 'hub',
    color: '#38BDF8',
  },
  {
    name: 'Project Room C',
    type: 'Room',
    capacity: 15,
    location: 'Library Building, Floor 2',
    status: 'Maintenance',
    amenities: ['Whiteboard', 'WiFi', 'TV'],
    image: 'project',
    color: '#EC4899',
  },
];

const filters = ['All', 'Hall', 'Lab', 'Room'];
const colorMap = { hall: '#3B82F6', lab: '#10B981', lab2: '#F59E0B', room: '#6366F1', hub: '#38BDF8', project: '#EC4899' };

const gradients = {
  hall: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
  lab: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)',
  room: 'linear-gradient(135deg, #312e81 0%, #4338ca 50%, #6366f1 100%)',
  lab2: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #f59e0b 100%)',
  hub: 'linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 50%, #38bdf8 100%)',
  project: 'linear-gradient(135deg, #831843 0%, #db2777 50%, #ec4899 100%)',
};

export default function ResourceShowcase() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? resources
    : resources.filter(r => r.type === activeFilter);

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
            Explore lecture halls, computer labs, seminar rooms, and equipment available for booking.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="resources__filters"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          id="resources-filters"
        >
          <Filter size={16} className="resources__filter-icon" />
          {filters.map(f => (
            <button
              key={f}
              className={`resources__filter-btn ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
              id={`filter-${f.toLowerCase()}`}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Cards Grid */}
        <div className="resources__grid">
          {filtered.map((r, i) => (
            <motion.div
              key={r.name}
              className="resource-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              id={`resource-card-${i}`}
            >
              {/* Card Image Area */}
              <div className="resource-card__image" style={{ background: gradients[r.image] }}>
                <div className="resource-card__type-badge">{r.type}</div>
                <div
                  className={`resource-card__status ${
                    r.status === 'Available' ? 'available' :
                    r.status === 'Booked' ? 'booked' : 'maintenance'
                  }`}
                >
                  <span className="resource-card__status-dot" />
                  {r.status}
                </div>
                <div className="resource-card__capacity-overlay">
                  <Users size={14} />
                  <span>{r.capacity} seats</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="resource-card__body">
                <h3 className="resource-card__name">{r.name}</h3>
                <div className="resource-card__location">
                  <MapPin size={13} />
                  <span>{r.location}</span>
                </div>
                <div className="resource-card__amenities">
                  {r.amenities.map(a => (
                    <span key={a} className="resource-card__amenity">{a}</span>
                  ))}
                </div>
                <button
                  className={`resource-card__btn ${r.status !== 'Available' ? 'disabled' : ''}`}
                  disabled={r.status !== 'Available'}
                  id={`book-btn-${i}`}
                >
                  <BookOpen size={15} />
                  {r.status === 'Available' ? 'Book Now' : r.status === 'Booked' ? 'Unavailable' : 'Under Maintenance'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
