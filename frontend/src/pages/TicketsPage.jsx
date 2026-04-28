import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { ticketsApi, usersApi } from '../services/api';
import { Plus, X, Wrench, MessageSquare, UserPlus, Pencil } from 'lucide-react';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
const CATEGORIES = ['Electrical', 'Plumbing', 'HVAC', 'IT/Network', 'Furniture', 'Cleaning', 'Safety', 'Other'];

export default function TicketsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';
  const isStaff = isAdmin || isTechnician;
  const [tickets, setTickets] = useState([]);
  const [overview, setOverview] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');
  const [newlyCreatedId, setNewlyCreatedId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comment, setComment] = useState('');
  const [formData, setFormData] = useState({
    category: 'IT/Network', description: '', priority: 'MEDIUM', location: '', preferredContact: '', resourceId: ''
  });
  const [images, setImages] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const formatCount = (value) => String(value).padStart(2, '0');

  const buildOverview = (list) => {
    const safe = Array.isArray(list) ? list : [];
    setOverview({
      total: safe.length,
      open: safe.filter(t => t.status === 'OPEN').length,
      inProgress: safe.filter(t => t.status === 'IN_PROGRESS').length,
      resolved: safe.filter(t => t.status === 'RESOLVED').length,
    });
  };

  const load = async () => {
    setLoading(true);
    try {
      let data = [];
      if (isStaff) {
        data = await ticketsApi.getAll();
        if (isTechnician) {
          // Technicians only see their assigned tickets or open unassigned tickets. Better yet, strictly assigned as per spec.
          data = Array.isArray(data) ? data.filter(t => t.assignedTechnicianId === user.id) : [];
        }
        buildOverview(data);
        if (filterStatus) {
          data = data.filter(t => t.status === filterStatus);
        }
        if (isAdmin) {
           const techList = await usersApi.getTechnicians();
           setTechnicians(Array.isArray(techList) ? techList : []);
        }
      } else {
        data = await ticketsApi.getMy();
        buildOverview(data);
      }
      const sorted = Array.isArray(data) ? [...data].sort((x, y) => (y.id || 0) > (x.id || 0) ? 1 : -1) : [];
      setTickets(sorted);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterStatus]);

  useEffect(() => {
    if (newlyCreatedId) {
      const timer = setTimeout(() => setNewlyCreatedId(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [newlyCreatedId]);

  useEffect(() => {
    if (location.state?.openForm && !showForm) {
      setShowForm(true);
      // Clear the state so it doesn't re-open on next render
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, showForm, navigate, location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (images.length > 3) {
      setError('You can upload a maximum of 3 images.');
      return;
    }

    const preferredContact = formData.preferredContact.trim();
    if (preferredContact) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\d{10}$/;
      if (!emailRegex.test(preferredContact) && !phoneRegex.test(preferredContact)) {
        setError('Preferred Contact must be a valid email or a 10-digit phone number.');
        return;
      }
    }

    try {
      const newTicket = await ticketsApi.create({ ...formData, preferredContact }, images);
      setNewlyCreatedId(newTicket.id);
      setShowForm(false);
      setFormData({ category: 'IT/Network', description: '', priority: 'MEDIUM', location: '', preferredContact: '', resourceId: '' });
      setImages([]);
      load();
    } catch (e) { setError(e.message); }
  };

  const handleStatusUpdate = async (id, status) => {
    let notes = '';
    if (status === 'RESOLVED') {
      notes = prompt('Please enter Resolution Notes (Required for Viva/Audit):') || '';
      if (!notes) {
        alert('Resolution notes are required to resolve a ticket.');
        return;
      }
    } else {
      notes = prompt('Status update notes (optional):') || '';
    }
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

  const handleEditComment = async (commentId, oldContent) => {
    const newContent = prompt('Edit your comment:', oldContent);
    if (!newContent || newContent === oldContent) return;
    try {
      await ticketsApi.editComment(selectedTicket.id, commentId, newContent);
      const updated = await ticketsApi.getById(selectedTicket.id);
      setSelectedTicket(updated);
      load();
    } catch (e) { setError(e.message); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete your comment?')) return;
    try {
      await ticketsApi.deleteComment(selectedTicket.id, commentId);
      const updated = await ticketsApi.getById(selectedTicket.id);
      setSelectedTicket(updated);
      load();
    } catch (e) { setError(e.message); }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance Tickets</h1>
          <p className="page-subtitle">{isStaff ? 'Manage all maintenance requests' : 'Lecturer/Student: view how to report an issue and create a ticket.'}</p>
        </div>
      </div>

      {error && <div className="alert-conflict" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="tickets-overview mb-3">
        <h2 className="tickets-overview__title">Tickets Overview</h2>
        <div className="tickets-overview__grid">
          <div className="tickets-overview__card tickets-overview__card--total">
            <div className="tickets-overview__label">{isTechnician ? 'Assigned To Me' : isAdmin ? 'Total Tickets' : 'My Tickets'}</div>
            <div className="tickets-overview__value">{loading ? '00' : formatCount(overview.total)}</div>
          </div>
          <div className="tickets-overview__card tickets-overview__card--new">
            <div className="tickets-overview__label">{isTechnician ? 'Total Open' : 'New Tickets'}</div>
            <div className="tickets-overview__value">{loading ? '00' : formatCount(overview.open)}</div>
          </div>
          <div className="tickets-overview__card tickets-overview__card--ongoing">
            <div className="tickets-overview__label">On-Going Tickets</div>
            <div className="tickets-overview__value">{loading ? '00' : formatCount(overview.inProgress)}</div>
          </div>
          <div className="tickets-overview__card tickets-overview__card--resolved">
            <div className="tickets-overview__label">Resolved Tickets</div>
            <div className="tickets-overview__value">{loading ? '00' : formatCount(overview.resolved)}</div>
          </div>
        </div>
      </div>

      <div className="filter-bar flex-between" style={{ marginBottom: '20px' }}>
        <div className="status-tabs" style={{ margin: 0, border: 'none' }}>
          {isStaff && ['', ...TICKET_STATUSES].map(s => (
            <button
              key={s}
              className={`status-tab ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilterStatus(s)}
              style={{ borderBottom: filterStatus === s ? '2px solid var(--primary)' : 'none' }}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} id="new-ticket-btn">
          <Plus size={16} /> Report Issue
        </button>
      </div>

      {/* Tickets Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <div style={{ marginBottom: '16px', color: 'var(--text-hint)' }}><Wrench size={48} /></div>
            <div className="empty-state-title">No tickets found</div>
            <p className="empty-state-desc">Click "Report Issue", fill in the details, then click "Submit Ticket" to create a maintenance request.</p>
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
                  <tr key={t.id} className={newlyCreatedId === t.id ? 'highlight-new' : ''}>
                    <td style={{ fontWeight: 500 }}>{t.category}</td>
                    <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</td>
                    <td><span className={`badge badge-${t.priority?.toLowerCase() || 'pending'}`}>{t.priority}</span></td>
                    <td>{t.location || '—'}</td>
                    <td><span className={`badge badge-${t.status?.toLowerCase() || 'open'}`}>{t.status?.replace(/_/g, ' ')}</span></td>
                    <td>
                      <div className="flex-gap" style={{ flexWrap: 'wrap' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openDetail(t)}>
                          <MessageSquare size={14} /> View
                        </button>
                        {isStaff && t.status !== 'CLOSED' && t.status !== 'RESOLVED' && (
                          <select
                            className="form-select"
                            style={{ padding: '4px 8px', fontSize: '11px', width: 'auto', minHeight: '26px' }}
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
                             style={{ padding: '4px 8px', fontSize: '11px', width: 'auto', minHeight: '26px', border: t.assignedTechnicianId ? '1px solid var(--border)' : '1px solid #ef4444' }}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="modal__title">Report an Issue</h2>
              <button className="btn btn-ghost btn-sm" style={{ padding: '4px', border: 'none' }} onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} required>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required placeholder="Describe the issue in detail..." />
              </div>
              <div className="form-group">
                <label className="form-label">Optional Resource ID</label>
                <input type="text" className="form-input" value={formData.resourceId} onChange={e => setFormData({ ...formData, resourceId: e.target.value })} placeholder="e.g. LAB-03" />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Contact (optional)</label>
                <input type="text" className="form-input" value={formData.preferredContact} onChange={e => setFormData({ ...formData, preferredContact: e.target.value })} placeholder="e.g. name@example.com or 0771234567" />
              </div>
              <div className="form-group">
                <label className="form-label">Images (max 3)</label>
                <input type="file" className="form-input" accept="image/*" multiple onChange={e => setImages(Array.from(e.target.files))} style={{ background: 'transparent', padding: '6px' }} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="modal__title">Ticket Details</h2>
              <button className="btn btn-ghost btn-sm" style={{ padding: '4px', border: 'none' }} onClick={() => setSelectedTicket(null)}><X size={18} /></button>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div className="flex-gap" style={{ marginBottom: '8px' }}>
                <span className={`badge badge-${selectedTicket.priority?.toLowerCase() || 'pending'}`}>{selectedTicket.priority}</span>
                <span className={`badge badge-${selectedTicket.status?.toLowerCase() || 'open'}`}>{selectedTicket.status?.replace(/_/g, ' ')}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{selectedTicket.category}</div>
              <div className="text-muted text-sm">{selectedTicket.description}</div>
              {selectedTicket.location && <div className="text-muted text-sm mt-1">📍 {selectedTicket.location}</div>}
            </div>

            {/* Detail Info */}
            <div style={{ padding: '12px', background: 'var(--primary-wash)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '12px' }}>
              {selectedTicket.reportedByUserId && (
                <div style={{ marginBottom: '8px' }}>
                  <span className="text-muted">Reported By ID:</span> {selectedTicket.reportedByUserId}
                </div>
              )}
              {selectedTicket.rejectionReason && (
                <div style={{ color: '#dc2626', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600 }}>Rejection Reason:</span> {selectedTicket.rejectionReason}
                </div>
              )}
              {selectedTicket.resolutionNotes && (
                <div style={{ color: '#16a34a' }}>
                  <span style={{ fontWeight: 600 }}>Resolution Notes:</span> {selectedTicket.resolutionNotes}
                </div>
              )}
            </div>

            {/* Comments */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>Comments ({selectedTicket.comments?.length || 0})</div>
              {selectedTicket.comments?.length > 0 ? (
                selectedTicket.comments.map((c, i) => (
                  <div key={i} style={{ 
                    padding: '12px', 
                    background: '#f8fafc', 
                    borderRadius: 'var(--radius-md)', 
                    marginBottom: '8px', 
                    fontSize: '12px',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ color: '#475569', flex: 1 }}>{c.content}</div>
                      {c.userId === user.id && (
                        <div className="flex-gap" style={{ gap: '4px' }}>
                          <button 
                            onClick={() => handleEditComment(c.id, c.content)}
                            className="btn btn-ghost btn-sm" style={{ padding: '2px', border: 'none', color: 'var(--primary)' }}
                            title="Edit My Comment"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteComment(c.id)}
                            className="btn btn-ghost btn-sm text-danger" style={{ padding: '2px', border: 'none' }}
                            title="Delete My Comment"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '6px' }}>{c.createdAt && new Date(c.createdAt).toLocaleString()}</div>
                  </div>
                ))
              ) : (
                <div className="text-muted text-sm">No comments yet.</div>
              )}
              <div className="flex-gap mt-3">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                />
                <button className="btn btn-primary" onClick={handleAddComment}>Send</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
