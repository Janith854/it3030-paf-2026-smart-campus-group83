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
  const [newlyCreatedId, setNewlyCreatedId] = useState(null);
  const location = useLocation();
  const [initialResourceId] = useState(location.state?.resourceId || '');

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
      const sorted = Array.isArray(b) ? [...b].sort((x, y) => (y.id || 0) > (x.id || 0) ? 1 : -1) : [];
      setBookings(sorted);
      setResources(Array.isArray(r) ? r : []);
      if ((location.state?.resourceId || location.state?.openForm) && !showForm) {
        setShowForm(true);
        window.history.replaceState({}, document.title);
      }
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => {
    if (newlyCreatedId) {
      const timer = setTimeout(() => setNewlyCreatedId(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [newlyCreatedId]);

  useEffect(() => { load(); }, [filter]);

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
      <div className="page-header">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="page-subtitle">{isAdmin ? 'Manage all campus bookings' : 'Your room & resource bookings'}</p>
        </div>
      </div>

      {error && <div className="alert-conflict">{error}</div>}

      <div className="filter-bar flex-between" style={{ marginBottom: '20px' }}>
        <div className="status-tabs" style={{ margin: 0, border: 'none' }}>
          {isAdmin && ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
            <button
              key={s}
              className={`status-tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
              style={{ borderBottom: filter === s ? '2px solid var(--primary)' : 'none' }}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
        {!isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            id="new-booking-btn"
          >
            <Plus size={16} /> New Booking
          </button>
        )}
      </div>

      {/* Bookings Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div style={{ marginBottom: '16px', color: 'var(--text-hint)' }}><CalendarDays size={48} /></div>
            <div className="empty-state-title">No bookings yet</div>
            <p className="empty-state-desc">
              {isAdmin 
                ? 'There are no bookings matching your current filter.' 
                : 'Click "New Booking" to reserve a room or resource.'}
            </p>
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
                  <tr key={b.id} className={newlyCreatedId === b.id ? 'highlight-new' : ''}>
                    <td style={{ fontWeight: 500 }}>{getResourceName(b.resourceId)}</td>
                    <td>{b.bookingDate}</td>
                    <td>{b.startTime} &ndash; {b.endTime}</td>
                    <td>{b.purpose}</td>
                    <td><span className={`badge badge-${b.status?.toLowerCase() || 'pending'}`}>{b.status}</span></td>
                    <td>
                      <div className="flex-gap">
                        {isAdmin && b.status === 'PENDING' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => handleApprove(b.id)}>Approve</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleReject(b.id)}>Reject</button>
                          </>
                        )}
                        {b.status === 'PENDING' && (
                          <button className="btn btn-outline btn-sm" onClick={() => handleCancel(b.id)}>Cancel</button>
                        )}
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(b.id)}><X size={14} /> Delete</button>
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
        <BookingModal
          resources={resources}
          initialResourceId={initialResourceId}
          onClose={() => setShowForm(false)}
          onCreated={(newId) => { 
            setShowForm(false); 
            setNewlyCreatedId(newId); 
            load(); 
          }}
        />
      )}
    </>
  );
}

/* ── Isolated modal with its own validation state ─────────────────────────── */
function BookingModal({ resources, initialResourceId, onClose, onCreated }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    resourceId: initialResourceId || '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
  });

  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  /* ── Validation rules ── */
  const validate = (f) => {
    const errs = {};

    if (!f.resourceId)
      errs.resourceId = 'Please select a resource.';

    if (!f.bookingDate) {
      errs.bookingDate = 'Please choose a date.';
    } else if (f.bookingDate < todayStr) {
      errs.bookingDate = 'Booking date cannot be in the past.';
    }

    if (!f.startTime)
      errs.startTime = 'Please set a start time.';

    if (!f.endTime) {
      errs.endTime = 'Please set an end time.';
    } else if (f.startTime && f.endTime <= f.startTime) {
      errs.endTime = 'End time must be after start time.';
    }

    if (!f.purpose.trim()) {
      errs.purpose = 'Purpose is required.';
    } else if (f.purpose.trim().length < 5) {
      errs.purpose = 'Purpose must be at least 5 characters.';
    } else if (f.purpose.trim().length > 200) {
      errs.purpose = 'Purpose cannot exceed 200 characters.';
    }

    if (f.expectedAttendees !== '') {
      const n = Number(f.expectedAttendees);
      if (!Number.isInteger(n) || n < 1) {
        errs.expectedAttendees = 'Must be a whole number \u2265 1.';
      } else if (n > 9999) {
        errs.expectedAttendees = 'Cannot exceed 9\u202f999 attendees.';
      }
    }

    return errs;
  };

  const errors = validate(form);
  const isValid = Object.keys(errors).length === 0;

  const touch = (field) => setTouched(t => ({ ...t, [field]: true }));

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    touch(field);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mark every field touched so all errors appear
    setTouched({
      resourceId: true,
      bookingDate: true,
      startTime: true,
      endTime: true,
      purpose: true,
      expectedAttendees: true,
    });
    if (!isValid) return;

    setSubmitting(true);
    setServerError('');
    try {
      const payload = {
        ...form,
        expectedAttendees: form.expectedAttendees ? parseInt(form.expectedAttendees) : null,
      };
      const newBooking = await bookingsApi.create(payload);
      onCreated(newBooking.id);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `form-input${touched[field] && errors[field] ? ' form-input--error' : ''}`;

  const selectClass = (field) =>
    `form-select${touched[field] && errors[field] ? ' form-input--error' : ''}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="modal__title">New Booking</h2>
          <button className="btn btn-ghost btn-sm" style={{ padding: '4px', border: 'none' }} onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        {serverError && (
          <div className="alert-conflict" style={{ marginBottom: '1rem' }}>{serverError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Resource */}
          <div className="form-group">
            <label className="form-label" htmlFor="bk-resource">Resource</label>
            <select
              id="bk-resource"
              className={selectClass('resourceId')}
              value={form.resourceId}
              onChange={e => handleChange('resourceId', e.target.value)}
              onBlur={() => touch('resourceId')}
            >
              <option value="">Select a resource...</option>
              {resources.filter(r => r.status === 'ACTIVE').map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.type}) &mdash; {r.location}</option>
              ))}
            </select>
            {touched.resourceId && errors.resourceId && (
              <span className="form-field-error">{errors.resourceId}</span>
            )}
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="bk-date">Date</label>
            <input
              id="bk-date"
              type="date"
              className={inputClass('bookingDate')}
              value={form.bookingDate}
              min={todayStr}
              onChange={e => handleChange('bookingDate', e.target.value)}
              onBlur={() => touch('bookingDate')}
            />
            {touched.bookingDate && errors.bookingDate && (
              <span className="form-field-error">{errors.bookingDate}</span>
            )}
          </div>

          {/* Start / End Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="bk-start">Start Time</label>
              <input
                id="bk-start"
                type="time"
                className={inputClass('startTime')}
                value={form.startTime}
                onChange={e => handleChange('startTime', e.target.value)}
                onBlur={() => touch('startTime')}
              />
              {touched.startTime && errors.startTime && (
                <span className="form-field-error">{errors.startTime}</span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="bk-end">End Time</label>
              <input
                id="bk-end"
                type="time"
                className={inputClass('endTime')}
                value={form.endTime}
                onChange={e => handleChange('endTime', e.target.value)}
                onBlur={() => touch('endTime')}
              />
              {touched.endTime && errors.endTime && (
                <span className="form-field-error">{errors.endTime}</span>
              )}
            </div>
          </div>

          {/* Purpose */}
          <div className="form-group">
            <label className="form-label flex-between" htmlFor="bk-purpose">
              Purpose
              <span className="text-muted" style={{ fontWeight: 'normal', fontSize: '11px' }}>{form.purpose.length}/200</span>
            </label>
            <input
              id="bk-purpose"
              type="text"
              className={inputClass('purpose')}
              placeholder="e.g. Team meeting, Lab session"
              value={form.purpose}
              maxLength={200}
              onChange={e => handleChange('purpose', e.target.value)}
              onBlur={() => touch('purpose')}
            />
            {touched.purpose && errors.purpose && (
              <span className="form-field-error">{errors.purpose}</span>
            )}
          </div>

          {/* Expected Attendees */}
          <div className="form-group">
            <label className="form-label" htmlFor="bk-attendees">
              Expected Attendees
              <span className="text-muted" style={{ fontWeight: 'normal', marginLeft: '4px' }}>(optional)</span>
            </label>
            <input
              id="bk-attendees"
              type="number"
              className={inputClass('expectedAttendees')}
              placeholder="e.g. 25"
              min={1}
              max={9999}
              value={form.expectedAttendees}
              onChange={e => handleChange('expectedAttendees', e.target.value)}
              onBlur={() => touch('expectedAttendees')}
            />
            {touched.expectedAttendees && errors.expectedAttendees && (
              <span className="form-field-error">{errors.expectedAttendees}</span>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating\u2026' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
