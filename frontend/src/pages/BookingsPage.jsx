import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { bookingsApi, resourcesApi } from '../services/api';
import { Plus, X, CalendarDays, AlertTriangle, Trash2, Pencil } from 'lucide-react';

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
  const [newlyCreatedId, setNewlyCreatedId] = useState(null);
  const location = useLocation();
  const [initialResourceId] = useState(location.state?.resourceId || '');

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [confirmCancel, setConfirmCancel] = useState(null);  // booking id
  const [confirmDelete, setConfirmDelete] = useState(null);  // booking id
  const [confirmReject, setConfirmReject] = useState(null);  // booking id
  const [editBooking, setEditBooking] = useState(null);       // full booking object

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

  const handleUpdate = async (id, data) => {
    try { await bookingsApi.update(id, data); load(); setEditBooking(null); }
    catch (e) { setError(e.message); }
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
                  <tr key={b.id} className={newlyCreatedId === b.id ? 'highlight-new' : ''}>
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
                        {/* Feature #12: Edit own PENDING booking */}
                        {!isAdmin && b.status === 'PENDING' && b.userId === user?.id && (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setEditBooking(b)}
                            title="Edit booking"
                          >
                            <Pencil size={13} style={{ marginRight: '3px' }} />Edit
                          </button>
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
          onCreated={(newId) => { 
            setShowForm(false); 
            setNewlyCreatedId(newId); 
            load(); 
          }}
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

      {/* Feature #12: Edit booking modal */}
      {editBooking && (
        <EditBookingModal
          booking={editBooking}
          onClose={() => setEditBooking(null)}
          onSaved={(id, data) => handleUpdate(id, data)}
        />
      )}
    </>
  );
}

/* ── Edit Booking Modal ────────────────────────────────────────────────────── */
function EditBookingModal({ booking, onClose, onSaved }) {
  const [purpose, setPurpose] = useState(booking.purpose || '');
  const [expectedAttendees, setExpectedAttendees] = useState(
    booking.expectedAttendees != null ? String(booking.expectedAttendees) : ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const purposeError = purpose.trim().length > 0 && purpose.trim().length < 5
    ? 'Purpose must be at least 5 characters.'
    : purpose.trim().length > 200
      ? 'Purpose cannot exceed 200 characters.'
      : '';

  const attendeesError = expectedAttendees !== '' && (
    !Number.isInteger(Number(expectedAttendees)) || Number(expectedAttendees) < 1
  ) ? 'Must be a whole number ≥ 1.' : '';

  const canSubmit = !purposeError && !attendeesError && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      await onSaved(booking.id, {
        purpose: purpose.trim() || undefined,
        expectedAttendees: expectedAttendees !== '' ? parseInt(expectedAttendees) : undefined,
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="modal__title">Edit Booking</h2>
          <button className="btn btn-ghost btn-sm" style={{ padding: '4px', border: 'none' }}
                  onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        {error && <div className="alert-conflict" style={{ marginBottom: '1rem' }}>{error}</div>}

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Only <strong>Purpose</strong> and <strong>Expected Attendees</strong> can be updated on a pending booking.
          To change the date, time, or resource, please cancel and create a new booking.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label flex-between" htmlFor="edit-purpose">
              Purpose
              <span className="text-muted" style={{ fontWeight: 'normal', fontSize: '11px' }}>{purpose.length}/200</span>
            </label>
            <input
              id="edit-purpose"
              type="text"
              className={`form-input${purposeError ? ' form-input--error' : ''}`}
              value={purpose}
              maxLength={200}
              onChange={e => setPurpose(e.target.value)}
            />
            {purposeError && <span className="form-field-error">{purposeError}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-attendees">
              Expected Attendees
              <span className="text-muted" style={{ fontWeight: 'normal', marginLeft: '4px' }}>(optional)</span>
            </label>
            <input
              id="edit-attendees"
              type="number"
              className={`form-input${attendeesError ? ' form-input--error' : ''}`}
              min={1}
              max={9999}
              value={expectedAttendees}
              onChange={e => setExpectedAttendees(e.target.value)}
            />
            {attendeesError && <span className="form-field-error">{attendeesError}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
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
  // Unique Feature: two-step time selection via timeline
  const [timeSelectStep, setTimeSelectStep] = useState('start'); // 'start' | 'end'

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

  // Unique Feature: timeline click handler — two-step start → end selection
  const handleTimelineSelect = (time) => {
    if (timeSelectStep === 'start') {
      handleChange('startTime', time);
      setForm(f => ({ ...f, startTime: time, endTime: '' }));
      touch('startTime');
      setTimeSelectStep('end');
    } else {
      if (time > form.startTime) {
        handleChange('endTime', time);
        touch('endTime');
        setTimeSelectStep('start');
      } else {
        // Clicked before current start — reset and treat as new start
        setForm(f => ({ ...f, startTime: time, endTime: '' }));
        touch('startTime');
      }
    }
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

          {/* ── Unique Feature: Availability Timeline ──────────────────────── */}
          <AvailabilityTimeline
            resourceId={form.resourceId}
            date={form.bookingDate}
            startTime={form.startTime}
            endTime={form.endTime}
            selectStep={timeSelectStep}
            onTimeSelect={handleTimelineSelect}
          />

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

/* ── Unique Feature: Availability Timeline Component ─────────────────────────
 * Renders a visual day bar (07:00–22:00) showing booked slots for the
 * selected resource + date. Clicking a free zone auto-fills start/end times.
 * ─────────────────────────────────────────────────────────────────────────── */
function AvailabilityTimeline({ resourceId, date, startTime, endTime, selectStep, onTimeSelect }) {
  const START_HOUR = 7;
  const END_HOUR = 22;
  const TOTAL_MINS = (END_HOUR - START_HOUR) * 60;

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const barRef = useRef(null);

  useEffect(() => {
    if (!resourceId || !date) { setSlots([]); return; }
    setLoading(true);
    bookingsApi.getAvailability(resourceId, date)
      .then(s => setSlots(Array.isArray(s) ? s : []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [resourceId, date]);

  const toMins = (t) => {
    if (!t) return null;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const toTime = (mins) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };
  const pct = (mins) => `${Math.max(0, Math.min(100, ((mins - START_HOUR * 60) / TOTAL_MINS) * 100))}%`;
  const wPct = (sm, em) => `${Math.max(0, ((em - sm) / TOTAL_MINS) * 100)}%`;

  const isBooked = (mins) => slots.some(s => {
    const sm = toMins(s.startTime), em = toMins(s.endTime);
    return sm !== null && em !== null && mins >= sm && mins < em;
  });

  const getMinsFromEvent = (e) => {
    const rect = barRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const raw = START_HOUR * 60 + ratio * TOTAL_MINS;
    return Math.round(raw / 30) * 30; // snap to 30-min grid
  };

  const handleMouseMove = (e) => {
    const mins = getMinsFromEvent(e);
    setHoverTime(toTime(Math.min(mins, END_HOUR * 60)));
  };
  const handleClick = (e) => {
    const mins = getMinsFromEvent(e);
    if (isBooked(mins)) return;
    onTimeSelect(toTime(Math.min(mins, END_HOUR * 60)));
  };

  const startMins = toMins(startTime);
  const endMins = toMins(endTime);
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  if (!resourceId || !date) return null;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
          📅 Availability — click a free slot to set {selectStep === 'start' ? 'start' : 'end'} time
        </span>
        {hoverTime && (
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: '99px' }}>
            {hoverTime}
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ height: '52px', borderRadius: '10px', background: 'var(--surface-variant, #f0f0f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', color: 'var(--text-hint)' }}>
          Checking availability…
        </div>
      ) : (
        <>
          {/* ── Timeline bar ── */}
          <div
            ref={barRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverTime(null)}
            onClick={handleClick}
            title="Click to select time"
            style={{
              position: 'relative', height: '52px',
              background: 'linear-gradient(90deg, rgba(134,239,172,0.25), rgba(74,222,128,0.15))',
              borderRadius: '10px', cursor: 'crosshair', overflow: 'hidden',
              border: '1.5px solid var(--border, #e2e8f0)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            {/* Hour grid lines */}
            {hours.map(h => (
              <div key={h} style={{
                position: 'absolute', left: `${((h - START_HOUR) / (END_HOUR - START_HOUR)) * 100}%`,
                top: 0, bottom: 0, width: '1px',
                background: h % 2 === 0 ? 'rgba(0,0,0,0.10)' : 'rgba(0,0,0,0.04)',
              }} />
            ))}

            {/* Booked slots */}
            {slots.map((s, i) => {
              const sm = toMins(s.startTime), em = toMins(s.endTime);
              if (sm == null || em == null) return null;
              const isApproved = s.status === 'APPROVED';
              return (
                <div key={i}
                  title={`${isApproved ? 'Approved' : 'Pending'}: ${s.startTime} – ${s.endTime}`}
                  style={{
                    position: 'absolute', left: pct(sm), width: wPct(sm, em),
                    top: '5px', bottom: '5px',
                    background: isApproved
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                      : 'linear-gradient(135deg, #f97316, #ea580c)',
                    borderRadius: '6px', cursor: 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 700, color: '#fff',
                    overflow: 'hidden', whiteSpace: 'nowrap', padding: '0 4px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  {s.startTime}–{s.endTime}
                </div>
              );
            })}

            {/* Selected range highlight */}
            {startMins != null && endMins != null && endMins > startMins && (
              <div style={{
                position: 'absolute', left: pct(startMins), width: wPct(startMins, endMins),
                top: '3px', bottom: '3px',
                background: 'rgba(99,102,241,0.35)',
                border: '2px solid #6366f1',
                borderRadius: '7px', pointerEvents: 'none',
                backdropFilter: 'blur(2px)',
              }} />
            )}

            {/* Start time anchor line */}
            {startMins != null && (
              <div style={{
                position: 'absolute', left: pct(startMins),
                top: 0, bottom: 0, width: '2.5px',
                background: '#6366f1', borderRadius: '2px',
                pointerEvents: 'none',
                boxShadow: '0 0 6px rgba(99,102,241,0.6)',
              }} />
            )}

            {/* Hover cursor line */}
            {hoverTime && (
              <div style={{
                position: 'absolute',
                left: pct(toMins(hoverTime)),
                top: 0, bottom: 0, width: '1.5px',
                background: 'rgba(99,102,241,0.5)',
                pointerEvents: 'none',
              }} />
            )}
          </div>

          {/* Hour labels */}
          <div style={{ position: 'relative', height: '18px', marginTop: '3px' }}>
            {hours.filter(h => h % 3 === 0 || h === START_HOUR || h === END_HOUR).map(h => (
              <span key={h} style={{
                position: 'absolute',
                left: `${((h - START_HOUR) / (END_HOUR - START_HOUR)) * 100}%`,
                transform: 'translateX(-50%)',
                fontSize: '10px', color: 'var(--text-hint)',
              }}>
                {h}:00
              </span>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'inline-block' }} />
              Approved
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(135deg,#f97316,#ea580c)', display: 'inline-block' }} />
              Pending
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(99,102,241,0.35)', border: '2px solid #6366f1', display: 'inline-block' }} />
              Your selection
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(90deg,rgba(134,239,172,0.4),rgba(74,222,128,0.2))', display: 'inline-block' }} />
              Free
            </span>
          </div>
        </>
      )}
    </div>
  );
}
