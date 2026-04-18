import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { ticketsApi, usersApi } from '../services/api';
import { Plus, X, Wrench, MessageSquare, UserPlus } from 'lucide-react';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
const CATEGORIES = ['Electrical', 'Plumbing', 'HVAC', 'IT/Network', 'Furniture', 'Cleaning', 'Safety', 'Other'];

export default function TicketsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';
  const isStaff = isAdmin || isTechnician;
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comment, setComment] = useState('');
  const [formData, setFormData] = useState({
    category: 'IT/Network', description: '', priority: 'MEDIUM', location: '', preferredContact: '', resourceId: ''
  });
  const [images, setImages] = useState([]);
  const location = useLocation();

  const load = async () => {
    setLoading(true);
    try {
      let data = [];
      if (isStaff) {
        data = await ticketsApi.getAll(filterStatus || undefined);
        if (isTechnician) {
          // Technicians only see their assigned tickets or open unassigned tickets. Better yet, strictly assigned as per spec.
          data = Array.isArray(data) ? data.filter(t => t.assignedTechnicianId === user.id) : [];
        }
        if (isAdmin) {
           const techList = await usersApi.getTechnicians();
           setTechnicians(Array.isArray(techList) ? techList : []);
        }
      } else {
        data = await ticketsApi.getMy();
      }
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterStatus]);

  useEffect(() => {
    if (location.state?.openForm && !showForm) {
      setShowForm(true);
      window.history.replaceState({}, document.title);
    }
  }, [location, showForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (images.length > 3) {
      setError('You can upload a maximum of 3 images.');
      return;
    }
    try {
      await ticketsApi.create(formData, images);
      setShowForm(false);
      setFormData({ category: 'IT/Network', description: '', priority: 'MEDIUM', location: '', preferredContact: '', resourceId: '' });
      setImages([]);
      load();
    } catch (e) { setError(e.message); }
  };

  const handleStatusUpdate = async (id, status) => {
    const notes = prompt('Notes (optional):') || '';
    try { await ticketsApi.updateStatus(id, status, notes); load(); }
    catch (e) { setError(e.message); }
  };

  const handleAssign = async (ticketId, techId) => {
    if (!techId) return;
    try { await ticketsApi.assign(ticketId, techId); load(); }
    catch (e) { setError(e.message); }
  };

  const openDetail = (ticket) => setSelectedTicket(ticket);

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await ticketsApi.addComment(selectedTicket.id, comment);
      setComment('');
      // Refresh the selected ticket
      const updated = await ticketsApi.getById(selectedTicket.id);
      setSelectedTicket(updated);
      load();
    } catch (e) { setError(e.message); }
  };

  return (
    <>
      <div className="dashboard__header">
        <h1 className="dashboard__title">Maintenance Tickets</h1>
        <p className="dashboard__subtitle">{isStaff ? 'Manage all maintenance requests' : 'Report and track issues'}</p>
      </div>

      {error && <div className="login-card__error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="action-bar">
        <div className="filter-group">
          {isStaff && ['', ...TICKET_STATUSES].map(s => (
            <button
              key={s}
              className={`btn-dashboard btn-dashboard--sm ${filterStatus === s ? 'btn-dashboard--primary' : 'btn-dashboard--secondary'}`}
              onClick={() => setFilterStatus(s)}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
        <button className="btn-dashboard btn-dashboard--primary" onClick={() => setShowForm(true)} id="new-ticket-btn">
          <Plus size={16} /> Report Issue
        </button>
      </div>

      {/* Tickets Table */}
      <div className="card">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon"><Wrench size={48} /></div>
            <div className="empty-state__title">No tickets found</div>
            <p>Click "Report Issue" to create a maintenance request.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.category}</td>
                    <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</td>
                    <td><span className={`badge badge--${t.priority?.toLowerCase()}`}>{t.priority}</span></td>
                    <td>{t.location || '—'}</td>
                    <td><span className={`badge badge--${t.status?.toLowerCase()}`}>{t.status?.replace(/_/g, ' ')}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button className="btn-dashboard btn-dashboard--secondary btn-dashboard--sm" onClick={() => openDetail(t)}>
                          <MessageSquare size={14} /> View
                        </button>
                        {isStaff && t.status !== 'CLOSED' && t.status !== 'RESOLVED' && (
                          <select
                            className="form-select"
                            style={{ padding: '0.3rem', fontSize: '0.72rem', width: 'auto' }}
                            value=""
                            onChange={e => { if (e.target.value) handleStatusUpdate(t.id, e.target.value); }}
                          >
                            <option value="">Status...</option>
                            {TICKET_STATUSES.filter(s => s !== t.status).map(s => (
                              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                            ))}
                          </select>
                        )}
                        {isAdmin && (
                          <select
                             className="form-select"
                             style={{ padding: '0.3rem', fontSize: '0.72rem', width: 'auto', outline: t.assignedTechnicianId ? undefined : '1px solid #ef4444' }}
                             value={t.assignedTechnicianId || ''}
                             onChange={e => handleAssign(t.id, e.target.value)}
                          >
                             <option value="">Assign...</option>
                             {technicians.map(tech => (
                               <option key={tech.id} value={tech.id}>{tech.name || tech.email}</option>
                             ))}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal__title">Report an Issue</h2>
              <button className="sidebar__logout" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category</label>
                <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select className="form-select" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} required>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-textarea" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required placeholder="Describe the issue in detail..." />
              </div>
              <div className="form-group">
                <label>Optional Resource ID</label>
                <input type="text" className="form-input" value={formData.resourceId} onChange={e => setFormData({ ...formData, resourceId: e.target.value })} placeholder="e.g. LAB-03" />
              </div>
              <div className="form-group">
                <label>Preferred Contact (optional)</label>
                <input type="text" className="form-input" value={formData.preferredContact} onChange={e => setFormData({ ...formData, preferredContact: e.target.value })} placeholder="e.g. email or phone" />
              </div>
              <div className="form-group">
                <label>Images (max 3)</label>
                <input type="file" className="form-input" accept="image/*" multiple onChange={e => setImages(Array.from(e.target.files))} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-dashboard btn-dashboard--secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-dashboard btn-dashboard--primary">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal__title">Ticket Details</h2>
              <button className="sidebar__logout" onClick={() => setSelectedTicket(null)}><X size={18} /></button>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className={`badge badge--${selectedTicket.priority?.toLowerCase()}`}>{selectedTicket.priority}</span>
                <span className={`badge badge--${selectedTicket.status?.toLowerCase()}`}>{selectedTicket.status?.replace(/_/g, ' ')}</span>
              </div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{selectedTicket.category}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{selectedTicket.description}</div>
              {selectedTicket.location && <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.25rem' }}>📍 {selectedTicket.location}</div>}
            </div>

            {/* Comments */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Comments ({selectedTicket.comments?.length || 0})</div>
              {selectedTicket.comments?.length > 0 ? (
                selectedTicket.comments.map((c, i) => (
                  <div key={i} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.82rem' }}>
                    <div style={{ color: '#94a3b8' }}>{c.content}</div>
                    <div style={{ color: '#475569', fontSize: '0.72rem', marginTop: '0.25rem' }}>{c.createdAt}</div>
                  </div>
                ))
              ) : (
                <div style={{ color: '#475569', fontSize: '0.82rem' }}>No comments yet.</div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                />
                <button className="btn-dashboard btn-dashboard--primary btn-dashboard--sm" onClick={handleAddComment}>Send</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
