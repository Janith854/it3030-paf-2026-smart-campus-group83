import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { bookingsApi, resourcesApi } from '../services/api';
import { Plus, X, CalendarDays, AlertTriangle, Trash2 } from 'lucide-react';

// ── Inline confirmation / prompt dialog ─────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel = 'Confirm', confirmClass = 'btn btn-danger',
                         onConfirm, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="modal__title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
            <AlertTriangle size={20} style={{ color: 'var(--danger, #ef4444)' }} />
            {title}
          </h2>
          <button className="btn btn-ghost btn-sm" style={{ padding: '4px', border: 'none' }}
                  onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>{message}</p>
        {children}
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>Go Back</button>
          <button className={confirmClass} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Reject dialog with text input ────────────────────────────────────────────
function RejectDialog({ onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="modal__title" style={{ fontSize: '1.1rem' }}>Reject Booking</h2>
          <button className="btn btn-ghost btn-sm" style={{ padding: '4px', border: 'none' }}
                  onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="reject-reason">Reason for rejection</label>
          <textarea
            id="reject-reason"
            className="form-input"
            rows={3}
            placeholder="e.g. Resource is under maintenance on this date"
            value={reason}
            onChange={e => setReason(e.target.value)}
            style={{ resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>Go Back</button>
          <button className="btn btn-danger" disabled={!reason.trim()}
                  onClick={() => reason.trim() && onConfirm(reason.trim())}>
            Reject Booking
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
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
  const [initialResourceId] = useState(location.state?.resourceId || '');

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [confirmCancel, setConfirmCancel] = useState(null);  // booking id
  const [confirmDelete, setConfirmDelete] = useState(null);  // booking id
  const [confirmReject, setConfirmReject] = useState(null);  // booking id

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
        window.history.replaceState({}, document.title);
      }
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  // ── Action handlers (use dialog state, not browser confirm/prompt) ─────────
  const handleCancel = async () => {
    try { await bookingsApi.cancel(confirmCancel); load(); }
    catch (e) { setError(e.message); }
    finally { setConfirmCancel(null); }
  };

  const handleApprove = async (id) => {
    try { await bookingsApi.approve(id); load(); }
    catch (e) { setError(e.message); }
  };

  const handleReject = async (reason) => {
    try { await bookingsApi.reject(confirmReject, reason); load(); }
    catch (e) { setError(e.message); }
    finally { setConfirmReject(null); }
  };

  const handleDelete = async () => {
    try { await bookingsApi.delete(confirmDelete); load(); }
    catch (e) { setError(e.message); }
    finally { setConfirmDelete(null); }
  };

  const getResourceName = (id) => resources.find(r => r.id === id)?.name || id;

  // ── Context-aware empty state ─────────────────────────────────────────────
  const emptyMessage = filter
    ? `No ${filter.charAt(0) + filter.slice(1).toLowerCase()} bookings found.`
    : isAdmin
      ? 'No bookings have been made yet.'
      : 'You have no bookings yet.';
  const emptyDesc = filter
    ? 'Try selecting a different status filter above.'
    : 'Click "New Booking" to reserve a room or resource.';

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
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          id="new-booking-btn"
        >
          <Plus size={16} /> New Booking
        </button>
      </div>

      {/* Bookings Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div style={{ marginBottom: '16px', color: 'var(--text-hint)' }}><CalendarDays size={48} /></div>
            <div className="empty-state-title">{emptyMessage}</div>
            <p className="empty-state-desc">{emptyDesc}</p>
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
                    <td style={{ fontWeight: 500 }}>{getResourceName(b.resourceId)}</td>
                    <td>{b.bookingDate}</td>
                    <td>{b.startTime} &ndash; {b.endTime}</td>
                    <td>
                      {/* UX FIX #2: Show rejection reason under purpose when rejected */}
                      <div>{b.purpose}</div>
                      {b.status === 'REJECTED' && b.rejectionReason && (
                        <div style={{
                          marginTop: '4px', fontSize: '0.78rem', color: 'var(--danger, #ef4444)',
                          display: 'flex', alignItems: 'flex-start', gap: '4px'
                        }}>
                          <AlertTriangle size={12} style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span><strong>Reason:</strong> {b.rejectionReason}</span>
                        </div>
                      )}
                    </td>
                    <td><span className={`badge badge-${b.status?.toLowerCase() || 'pending'}`}>{b.status}</span></td>
                    <td>
                      <div className="flex-gap">
                        {isAdmin && b.status === 'PENDING' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => handleApprove(b.id)}>Approve</button>
                            {/* UX FIX #1: Reject uses styled dialog, not window.prompt */}
                            <button className="btn btn-danger btn-sm" onClick={() => setConfirmReject(b.id)}>Reject</button>
                          </>
                        )}
                        {/* Admin can cancel PENDING or APPROVED; users cancel own PENDING */}
                        {(isAdmin
                          ? (b.status === 'PENDING' || b.status === 'APPROVED')
                          : b.status === 'PENDING'
                        ) && (
                          /* UX FIX #1: Cancel uses styled dialog, not window.confirm */
                          <button className="btn btn-outline btn-sm" onClick={() => setConfirmCancel(b.id)}>Cancel</button>
                        )}
                        {/* UX FIX #3: Delete only shown for terminal statuses (CANCELLED/REJECTED) for users;
                            admins can delete any booking */}
                        {(isAdmin || b.status === 'CANCELLED' || b.status === 'REJECTED') && (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ border: 'none', padding: '4px', color: 'var(--danger, #ef4444)' }}
                            onClick={() => setConfirmDelete(b.id)}
                            title="Delete booking"
                          >
                            <Trash2 size={15} />
                          </button>
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

      {/* New Booking Modal */}
      {showForm && (
        <BookingModal
          resources={resources}
          initialResourceId={initialResourceId}
          onClose={() => setShowForm(false)}
          onCreated={() => { setShowForm(false); load(); }}
        />
      )}

      {/* UX FIX #1: Styled Cancel confirmation dialog */}
      {confirmCancel && (
        <ConfirmDialog
          title="Cancel Booking"
          message="Are you sure you want to cancel this booking? This action cannot be undone."
          confirmLabel="Yes, Cancel Booking"
          confirmClass="btn btn-danger"
          onConfirm={handleCancel}
          onClose={() => setConfirmCancel(null)}
        />
      )}

      {/* UX FIX #1: Styled Delete confirmation dialog */}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Booking"
          message="Are you sure you want to permanently delete this booking? It will be removed from all records."
          confirmLabel="Yes, Delete Permanently"
          confirmClass="btn btn-danger"
          onConfirm={handleDelete}
          onClose={() => setConfirmDelete(null)}
        />
      )}

      {/* UX FIX #1: Styled Reject dialog with reason input */}
      {confirmReject && (
        <RejectDialog
          onConfirm={handleReject}
          onClose={() => setConfirmReject(null)}
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
        errs.expectedAttendees = 'Must be a whole number ≥ 1.';
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
      await bookingsApi.create(payload);
      onCreated();
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
              {submitting ? 'Creating…' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
