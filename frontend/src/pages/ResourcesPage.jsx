import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { resourcesApi } from '../services/api';
import { Plus, X, Building2, MapPin, Users, Tag } from 'lucide-react';

const TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const STATUSES = ['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE'];

export default function ResourcesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', type: 'LECTURE_HALL', capacity: '', location: '', description: '',
  });

  // Removed strict isAdmin check here to allow Lecturers/Users to view resources.
  // Management actions remain guarded by isAdmin throughout the component.

  const load = async () => {
    setLoading(true);
    try {
      const data = await resourcesApi.getAll(filterType ? { type: filterType } : {});
      setResources(Array.isArray(data) ? data : []);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterType]);

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: '', type: 'LECTURE_HALL', capacity: '', location: '', description: '' });
    setShowForm(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    setFormData({ name: r.name, type: r.type, capacity: r.capacity || '', location: r.location, description: r.description || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...formData, capacity: formData.capacity ? parseInt(formData.capacity) : null };
      if (editing) {
        await resourcesApi.update(editing.id, payload);
      } else {
        await resourcesApi.create(payload);
      }
      setShowForm(false);
      load();
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
      <div className="dashboard__header">
        <h1 className="dashboard__title">Resources</h1>
        <p className="dashboard__subtitle">Campus rooms, labs, and equipment</p>
      </div>

      {error && <div className="login-card__error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="action-bar">
        <div className="filter-group">
          {['', ...TYPES].map(t => (
            <button
              key={t}
              className={`btn-dashboard btn-dashboard--sm ${filterType === t ? 'btn-dashboard--primary' : 'btn-dashboard--secondary'}`}
              onClick={() => setFilterType(t)}
            >
              {t ? t.replace(/_/g, ' ') : 'All'}
            </button>
          ))}
        </div>
        {isAdmin && (
          <button className="btn-dashboard btn-dashboard--primary" onClick={openCreate} id="new-resource-btn">
            <Plus size={16} /> Add Resource
          </button>
        )}
      </div>

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : resources.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state__icon"><Building2 size={48} /></div>
            <div className="empty-state__title">No resources found</div>
          </div>
        </div>
      ) : (
        <div className="resource-grid">
          {resources.map(r => (
            <div className="resource-card" key={r.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div className="resource-card__name">{r.name}</div>
                <span className={`badge badge--${r.status?.toLowerCase()}`}>{r.status?.replace(/_/g, ' ')}</span>
              </div>
              <div className="resource-card__detail"><Tag size={14} /> {r.type?.replace(/_/g, ' ')}</div>
              <div className="resource-card__detail"><MapPin size={14} /> {r.location}</div>
              {r.capacity && <div className="resource-card__detail"><Users size={14} /> Capacity: {r.capacity}</div>}
              {r.description && <div className="resource-card__detail" style={{ color: '#64748b', marginTop: '0.5rem' }}>{r.description}</div>}
              {isAdmin && (
                <div className="resource-card__actions">
                  <button className="btn-dashboard btn-dashboard--secondary btn-dashboard--sm" onClick={() => openEdit(r)}>Edit</button>
                  <select
                    className="form-select"
                    style={{ padding: '0.35rem', fontSize: '0.75rem', width: 'auto' }}
                    value={r.status}
                    onChange={e => handleStatusChange(r.id, e.target.value)}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                  <button className="btn-dashboard btn-dashboard--danger btn-dashboard--sm" onClick={() => handleDelete(r.id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal__title">{editing ? 'Edit Resource' : 'Add Resource'}</h2>
              <button className="sidebar__logout" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select className="form-select" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} required>
                  {TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" className="form-input" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Capacity (optional)</label>
                <input type="number" className="form-input" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea className="form-textarea" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-dashboard btn-dashboard--secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-dashboard btn-dashboard--primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
