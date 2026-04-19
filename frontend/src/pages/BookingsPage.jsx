import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { bookingsApi, resourcesApi } from '../services/api';
import { Plus, X, CalendarDays } from 'lucide-react';

export default function BookingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();
  const [formData, setFormData] = useState({
    resourceId: location.state?.resourceId || '', bookingDate: '', startTime: '', endTime: '', purpose: '', expectedAttendees: '',
  });

  if (user?.role === 'TECHNICIAN') {
    return (
      <div className="empty-state" style={{ marginTop: '3rem' }}>
        <div className="empty-state__icon"><CalendarDays size={48} /></div>
        <div className="empty-state__title">Access Denied</div>
        <p>Technicians do not have access to the bookings module.</p>
      </div>
    );
  }

  const load = async () => {
    setLoading(true);
    try {
      const [b, r] = await Promise.all([
        isAdmin ? bookingsApi.getAll(filter || undefined) : bookingsApi.getMy(),
        resourcesApi.getAll(),
      ]);
      setBookings(Array.isArray(b) ? b : []);
      setResources(Array.isArray(r) ? r : []);
      if ((location.state?.resourceId || location.state?.openForm) && !showForm) {
        setShowForm(true);
        // Clear state so it doesn't reopen indefinitely on other renders
        window.history.replaceState({}, document.title);
      }
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...formData,
        expectedAttendees: formData.expectedAttendees ? parseInt(formData.expectedAttendees) : null,
      };
      await bookingsApi.create(payload);
      setShowForm(false);
      setFormData({ resourceId: '', bookingDate: '', startTime: '', endTime: '', purpose: '', expectedAttendees: '' });
      load();
    } catch (e) { setError(e.message); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try { await bookingsApi.cancel(id); load(); }
    catch (e) { setError(e.message); }
  };

  const handleApprove = async (id) => {
    try { await bookingsApi.approve(id); load(); }
    catch (e) { setError(e.message); }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try { await bookingsApi.reject(id, reason); load(); }
    catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this booking permanently?')) return;
    try { await bookingsApi.delete(id); load(); }
    catch (e) { setError(e.message); }
  };

  const getResourceName = (id) => resources.find(r => r.id === id)?.name || id;

  return (
    <>
      <div className="dashboard__header">
        <h1 className="dashboard__title">Bookings</h1>
        <p className="dashboard__subtitle">{isAdmin ? 'Manage all campus bookings' : 'Your room & resource bookings'}</p>
      </div>

      {error && <div className="login-card__error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="action-bar">
        <div className="filter-group">
          {isAdmin && ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
            <button
              key={s}
              className={`btn-dashboard btn-dashboard--sm ${filter === s ? 'btn-dashboard--primary' : 'btn-dashboard--secondary'}`}
              onClick={() => setFilter(s)}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
        <button className="btn-dashboard btn-dashboard--primary" onClick={() => setShowForm(true)} id="new-booking-btn">
          <Plus size={16} /> New Booking
        </button>
      </div>

      {/* Bookings Table */}
      <div className="card">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon"><CalendarDays size={48} /></div>
            <div className="empty-state__title">No bookings yet</div>
            <p>Click "New Booking" to reserve a room or resource.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>{getResourceName(b.resourceId)}</td>
                    <td>{b.bookingDate}</td>
                    <td>{b.startTime} – {b.endTime}</td>
                    <td>{b.purpose}</td>
                    <td><span className={`badge badge--${b.status?.toLowerCase()}`}>{b.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {isAdmin && b.status === 'PENDING' && (
                          <>
                            <button className="btn-dashboard btn-dashboard--success btn-dashboard--sm" onClick={() => handleApprove(b.id)}>Approve</button>
                            <button className="btn-dashboard btn-dashboard--danger btn-dashboard--sm" onClick={() => handleReject(b.id)}>Reject</button>
                          </>
                        )}
                        {b.status === 'PENDING' && (
                          <button className="btn-dashboard btn-dashboard--secondary btn-dashboard--sm" onClick={() => handleCancel(b.id)}>Cancel</button>
                        )}
                        <button className="btn-dashboard btn-dashboard--danger btn-dashboard--sm" onClick={() => handleDelete(b.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Booking Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal__title">New Booking</h2>
              <button className="sidebar__logout" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Resource</label>
                <select className="form-select" value={formData.resourceId} onChange={e => setFormData({ ...formData, resourceId: e.target.value })} required>
                  <option value="">Select a resource...</option>
                  {resources.filter(r => r.status === 'ACTIVE').map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.type}) — {r.location}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" className="form-input" value={formData.bookingDate} onChange={e => setFormData({ ...formData, bookingDate: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" className="form-input" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" className="form-input" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Purpose</label>
                <input type="text" className="form-input" placeholder="e.g. Team meeting, Lab session" value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Expected Attendees (optional)</label>
                <input type="number" className="form-input" placeholder="e.g. 25" value={formData.expectedAttendees} onChange={e => setFormData({ ...formData, expectedAttendees: e.target.value })} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-dashboard btn-dashboard--secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-dashboard btn-dashboard--primary">Create Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
