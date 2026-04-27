import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resourcesApi } from '../services/api';
import { Plus, X, Building2, MapPin, Users, Tag, Clock, Eye } from 'lucide-react';

const TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const STATUSES = ['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE'];

const TYPE_COLORS = {
  LECTURE_HALL: 'var(--primary)', // Teal
  LAB: '#8b5cf6',                 // Violet
  MEETING_ROOM: '#f59e0b',        // Amber
  EQUIPMENT: '#ec4899'            // Pink
};

export default function ResourcesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  // Determine current base path for navigation
  let basePath = '/lecturer';
  if (user?.role === 'ADMIN') basePath = '/admin';
  else if (user?.role === 'TECHNICIAN') basePath = '/technician';
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCapacity, setFilterCapacity] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '', type: 'LECTURE_HALL', capacity: '', location: '', description: '', availabilityWindow: '',
  });

  // Removed strict isAdmin check here to allow Lecturers/Users to view resources.
  // Management actions remain guarded by isAdmin throughout the component.

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (filterLocation) params.location = filterLocation;
      if (filterCapacity) params.minCapacity = filterCapacity;
      const data = await resourcesApi.getAll(params);
      setResources(Array.isArray(data) ? data : []);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 300);
    return () => clearTimeout(timer);
  }, [filterType, filterLocation, filterCapacity]);

  const openCreate = () => {
    setEditing(null);
    setFormErrors({});
    setFormData({ name: '', type: 'LECTURE_HALL', capacity: '', location: '', description: '', availabilityWindow: '' });
    setShowForm(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    setFormErrors({});
    setFormData({ 
      name: r.name, 
      type: r.type, 
      capacity: r.capacity || '', 
      location: r.location, 
      description: r.description || '', 
      availabilityWindow: r.availabilityWindow || ''
    });
    setShowForm(true);
  };

  const validateForm = () => {
    const errors = {};

    // Name: required, 3–100 chars
    const name = formData.name.trim();
    if (!name) {
      errors.name = 'Name is required.';
    } else if (name.length < 3 || name.length > 100) {
      errors.name = 'Name must be between 3 and 100 characters.';
    }

    // Type: required (always has a value from the select, but guard just in case)
    if (!formData.type) {
      errors.type = 'Type is required.';
    }

    // Location: required, 2–100 chars, letters and spaces only
    const location = formData.location.trim();
    if (!location) {
      errors.location = 'Location is required.';
    } else if (location.length < 2 || location.length > 100) {
      errors.location = 'Location must be between 2 and 100 characters.';
    } else if (!/^[A-Za-z\s]+$/.test(location)) {
      errors.location = 'Location can only contain letters and spaces.';
    }

    // Capacity: optional, but must be a positive whole number if provided
    if (formData.capacity !== '' && formData.capacity !== null) {
      const cap = Number(formData.capacity);
      if (!Number.isInteger(cap) || cap <= 0) {
        errors.capacity = 'Capacity must be a positive whole number.';
      }
    }

    // Availability Window: required
    if (!formData.availabilityWindow.trim()) {
      errors.availabilityWindow = 'Availability Window is required.';
    }

    // Description: optional, max 500 chars
    if (formData.description.length > 500) {
      errors.description = 'Description must not exceed 500 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper: clear a single field's error on change
  const clearError = (field) =>
    setFormErrors(prev => ({ ...prev, [field]: '' }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setError('');
    try {
      const payload = { ...formData, capacity: formData.capacity ? parseInt(formData.capacity) : null };
      if (editing) {
        await resourcesApi.update(editing.id, payload);
        setSuccessMsg('Resource updated successfully');
      } else {
        await resourcesApi.create(payload);
        setSuccessMsg('Resource created successfully');
      }
      setShowForm(false);
      load();
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource?')) return;
    try { await resourcesApi.delete(id); load(); }
    catch (e) { setError(e.message); }
  };

  const handleStatusChange = async (id, status) => {
    try { await resourcesApi.updateStatus(id, status); load(); }
    catch (e) { setError(e.message); }
  };

  return (
    <>
      {/* Modern Toast Notification */}
      {successMsg && (
        <div className="toast-container">
          <div className="toast-notification">
            <div className="toast-icon-wrapper">
              <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="toast-content">
              <p className="toast-message">{successMsg}</p>
            </div>
            <button className="toast-close" onClick={() => setSuccessMsg('')}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Resources</h1>
          <p className="page-subtitle">Campus rooms, labs, and equipment</p>
        </div>
      </div>

      {!isAdmin && (
        <div className="card" style={{ marginBottom: '24px', backgroundColor: 'rgba(42, 157, 143, 0.04)', borderColor: 'rgba(42, 157, 143, 0.2)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--primary)', marginTop: '2px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </div>
            <div>
              <h3 style={{ marginBottom: '6px', color: 'var(--primary-dark)', fontSize: '14px', fontWeight: '600' }}>Guidelines for Resource Usage</h3>
              <ul style={{ margin: '0', paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                <li>Please book resources in advance through the Bookings dashboard; walk-ins are not permitted for reserved spaces.</li>
                <li>Leave the room or equipment in a clean, orderly condition after use.</li>
                <li>Return any borrowed equipment immediately following your scheduled time to avoid conflicts.</li>
                <li>If you encounter damaged equipment or facilities, please report it immediately via the Tickets page.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {error && <div className="alert-conflict" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="filter-bar flex-between" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'stretch', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div className="status-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', border: 'none', margin: 0 }}>
            {['', ...TYPES].map(t => (
              <button
                key={t}
                className={`status-tab ${filterType === t ? 'active' : ''}`}
                onClick={() => setFilterType(t)}
                style={{ borderBottom: filterType === t ? '2px solid var(--primary)' : 'none' }}
              >
                {t ? t.replace(/_/g, ' ') : 'All Types'}
              </button>
            ))}
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={openCreate} id="new-resource-btn" style={{ whiteSpace: 'nowrap', height: 'fit-content' }}>
              <Plus size={16} /> Add Resource
            </button>
          )}
        </div>
        
        <div className="flex-gap" style={{ flexWrap: 'wrap' }}>
          <div className="search-input-wrapper" style={{ flex: '1', minWidth: '200px' }}>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-hint)' }} />
              <input 
                type="text" 
                placeholder="Search by location..." 
                className="form-input" 
                style={{ paddingLeft: '36px' }}
                value={filterLocation}
                onChange={e => setFilterLocation(e.target.value)}
              />
            </div>
          </div>
          <div className="search-input-wrapper" style={{ width: '200px' }}>
            <div style={{ position: 'relative' }}>
              <Users size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-hint)' }} />
              <input 
                type="number" 
                placeholder="Min capacity..." 
                className="form-input" 
                style={{ paddingLeft: '36px' }}
                value={filterCapacity}
                onChange={e => setFilterCapacity(e.target.value)}
                min="1"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : resources.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div style={{ marginBottom: '16px', color: 'var(--text-hint)' }}><Building2 size={48} /></div>
            <div className="empty-state-title">No resources found</div>
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {resources.map(r => (
            <div className="card" key={r.id} style={{ display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.2s ease', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px', letterSpacing: '-0.3px' }}>{r.name}</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: TYPE_COLORS[r.type] || 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Tag size={12} color={TYPE_COLORS[r.type] || 'var(--primary)'} /> {r.type?.replace(/_/g, ' ')}
                  </div>
                </div>
                <span className={`badge badge-${r.status?.toLowerCase() || 'active'}`} style={{ padding: '6px 12px', fontSize: '11px' }}>{r.status?.replace(/_/g, ' ')}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(42, 157, 143, 0.1)', color: 'var(--primary)', flexShrink: 0 }}>
                    <MapPin size={16} />
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{r.location}</div>
                </div>
                
                {r.capacity && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', flexShrink: 0 }}>
                      <Users size={16} />
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}><span style={{ color: 'var(--text)', fontWeight: 600 }}>{r.capacity}</span> max capacity</div>
                  </div>
                )}
                
                {r.availabilityWindow && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', flexShrink: 0 }}>
                      <Clock size={16} />
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {r.availabilityWindow}
                    </div>
                  </div>
                )}
              </div>

              {r.description && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed var(--border)', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {r.description}
                </div>
              )}
              <div className="flex-gap" style={{ marginTop: '16px', flexWrap: 'wrap' }}>
                {isAdmin && (
                  <>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(r)}>Edit</button>
                    <select
                      className="form-select"
                      style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', minHeight: '30px' }}
                      value={r.status}
                      onChange={e => handleStatusChange(r.id, e.target.value)}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(r.id)}><X size={14} /> Delete</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="modal__title">{editing ? 'Edit Resource' : 'Add Resource'}</h2>
              <button className="btn btn-ghost btn-sm" style={{ padding: '4px', border: 'none' }} onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              {/* Name */}
              <div className="form-group">
                <label className="form-label">Name <span style={{ color: '#dc2626' }}>*</span></label>
                <input
                  type="text"
                  className={`form-input${formErrors.name ? ' form-input--error' : ''}`}
                  placeholder="e.g. Engineering Lab A"
                  value={formData.name}
                  onChange={e => { setFormData({ ...formData, name: e.target.value }); clearError('name'); }}
                />
                {formErrors.name && <span className="form-field-error">{formErrors.name}</span>}
              </div>

              {/* Type */}
              <div className="form-group">
                <label className="form-label">Type <span style={{ color: '#dc2626' }}>*</span></label>
                <select
                  className={`form-select${formErrors.type ? ' form-input--error' : ''}`}
                  value={formData.type}
                  onChange={e => { setFormData({ ...formData, type: e.target.value }); clearError('type'); }}
                >
                  {TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
                {formErrors.type && <span className="form-field-error">{formErrors.type}</span>}
              </div>

              {/* Location */}
              <div className="form-group">
                <label className="form-label">Location <span style={{ color: '#dc2626' }}>*</span></label>
                <input
                  type="text"
                  className={`form-input${formErrors.location ? ' form-input--error' : ''}`}
                  placeholder="e.g. Block B"
                  value={formData.location}
                  onChange={e => { setFormData({ ...formData, location: e.target.value }); clearError('location'); }}
                />
                {formErrors.location && <span className="form-field-error">{formErrors.location}</span>}
              </div>

              {/* Capacity */}
              <div className="form-group">
                <label className="form-label">Capacity <span className="text-muted" style={{ fontWeight: 'normal', marginLeft: '4px' }}>(optional)</span></label>
                <input
                  type="number"
                  min="1"
                  className={`form-input${formErrors.capacity ? ' form-input--error' : ''}`}
                  placeholder="e.g. 30"
                  value={formData.capacity}
                  onChange={e => { setFormData({ ...formData, capacity: e.target.value }); clearError('capacity'); }}
                />
                {formErrors.capacity && <span className="form-field-error">{formErrors.capacity}</span>}
              </div>

              {/* Availability Window */}
              <div className="form-group">
                <label className="form-label">Availability Window <span style={{ color: '#dc2626' }}>*</span></label>
                <input
                  id="availability-window-input"
                  type="text"
                  className={`form-input${formErrors.availabilityWindow ? ' form-input--error' : ''}`}
                  placeholder="e.g. Mon-Fri 8:00 AM - 5:00 PM"
                  value={formData.availabilityWindow}
                  onChange={e => { setFormData({ ...formData, availabilityWindow: e.target.value }); clearError('availabilityWindow'); }}
                />
                {formErrors.availabilityWindow && <span className="form-field-error">{formErrors.availabilityWindow}</span>}
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label flex-between">
                  <span>Description <span className="text-muted" style={{ fontWeight: 'normal', marginLeft: '4px' }}>(optional)</span></span>
                  {formData.description.length > 0 && (
                    <span style={{ color: formData.description.length > 500 ? '#dc2626' : 'var(--text-hint)', fontSize: '11px', fontWeight: 'normal' }}>
                      {formData.description.length}/500
                    </span>
                  )}
                </label>
                <textarea
                  className={`form-textarea${formErrors.description ? ' form-input--error' : ''}`}
                  placeholder="Brief description of this resource…"
                  value={formData.description}
                  onChange={e => { setFormData({ ...formData, description: e.target.value }); clearError('description'); }}
                />
                {formErrors.description && <span className="form-field-error">{formErrors.description}</span>}
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
