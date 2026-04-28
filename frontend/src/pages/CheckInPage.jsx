import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingsApi, resourcesApi } from '../services/api';
import { ShieldCheck, CalendarDays, Clock, MapPin, Users, AlertTriangle, QrCode, LogIn } from 'lucide-react';

/* ── Innovation Feature: QR Code Check-In Verification Screen ─────────────── *
 * When an admin scans a booking QR code, they land here to verify the booking *
 * details and confirm the check-in with one click.                            *
 * ──────────────────────────────────────────────────────────────────────────── */
export default function CheckInPage() {
  const { token } = useParams();
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [booking, setBooking] = useState(null);
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    loadBooking();
  }, [authLoading, user]);

  const loadBooking = async () => {
    setLoading(true);
    setError('');
    try {
      const b = await bookingsApi.getByToken(token);
      setBooking(b);
      try {
        const allResources = await resourcesApi.getAll();
        const r = allResources.find(res => res.id === b.resourceId);
        setResource(r || null);
      } catch { /* resource lookup is optional */ }
    } catch (e) {
      setError(e.message || 'Booking not found');
    }
    setLoading(false);
  };

  const handleCheckIn = async () => {
    setChecking(true);
    setError('');
    try {
      const updated = await bookingsApi.checkInByToken(token);
      setBooking(updated);
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    }
    setChecking(false);
  };

  /* ── Not logged in ───────────────────────────────────────────────────────── */
  if (!authLoading && !user) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.iconCircle('#f59e0b')}>
            <LogIn size={32} color="#f59e0b" />
          </div>
          <h1 style={styles.title}>Sign In Required</h1>
          <p style={styles.subtitle}>
            You need to be signed in as an administrator to verify bookings.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  /* ── Loading ─────────────────────────────────────────────────────────────── */
  if (loading || authLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid rgba(76,167,153,0.2)', borderTopColor: '#4CA799', borderRadius: '50%', margin: '0 auto 1rem' }} />
          <p style={styles.subtitle}>Loading booking details...</p>
        </div>
      </div>
    );
  }

  /* ── Error ────────────────────────────────────────────────────────────────── */
  if (error && !booking) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.iconCircle('#ef4444')}>
            <AlertTriangle size={32} color="#ef4444" />
          </div>
          <h1 style={styles.title}>Booking Not Found</h1>
          <p style={styles.subtitle}>{error}</p>
          <Link to="/dashboard" className="btn btn-ghost" style={{ marginTop: '1rem' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  /* ── Not an admin ────────────────────────────────────────────────────────── */
  if (!isAdmin) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.iconCircle('#f59e0b')}>
            <ShieldCheck size={32} color="#f59e0b" />
          </div>
          <h1 style={styles.title}>Admin Access Required</h1>
          <p style={styles.subtitle}>
            Only administrators can verify and check-in bookings via QR code.
          </p>
          <Link to="/dashboard" className="btn btn-ghost" style={{ marginTop: '1rem' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  /* ── Already checked in ─────────────────────────────────────────────────── */
  const alreadyDone = booking.checkedIn || success;

  /* ── Not approved ────────────────────────────────────────────────────────── */
  const notApproved = booking.status !== 'APPROVED';

  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, maxWidth: '480px' }}>
        {/* Header */}
        <div style={styles.iconCircle(alreadyDone ? '#10b981' : notApproved ? '#f59e0b' : '#4CA799')}>
          {alreadyDone
            ? <ShieldCheck size={36} color="#10b981" />
            : notApproved
              ? <AlertTriangle size={36} color="#f59e0b" />
              : <QrCode size={36} color="#4CA799" />}
        </div>

        <h1 style={styles.title}>
          {alreadyDone ? 'Already Checked In ✓' : notApproved ? 'Not Eligible' : 'Verify Check-In'}
        </h1>

        {alreadyDone && (
          <div style={{ background: 'rgba(16,185,129,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '1.25rem' }}>
            <p style={{ color: '#10b981', fontSize: '0.9rem', margin: '0 0 4px', fontWeight: 500 }}>
              This booking was successfully verified.
            </p>
            {booking.checkedInAt && (
              <p style={{ color: '#059669', fontSize: '0.75rem', margin: 0 }}>
                Check-in time: {new Date(booking.checkedInAt).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {notApproved && !alreadyDone && (
          <p style={{ color: '#f59e0b', fontSize: '0.9rem', margin: '0 0 1.25rem', fontWeight: 500 }}>
            This booking has status <strong>{booking.status}</strong> and cannot be checked in.
          </p>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Booking Details Card */}
        <div style={styles.detailsCard}>
          <div style={styles.detailRow}>
            <MapPin size={16} style={styles.detailIcon} />
            <div>
              <div style={styles.detailLabel}>Resource</div>
              <div style={styles.detailValue}>{resource?.name || booking.resourceId}</div>
              {resource?.location && <div style={styles.detailSub}>{resource.location}</div>}
            </div>
          </div>
          <div style={styles.detailRow}>
            <CalendarDays size={16} style={styles.detailIcon} />
            <div>
              <div style={styles.detailLabel}>Date</div>
              <div style={styles.detailValue}>{booking.bookingDate}</div>
            </div>
          </div>
          <div style={styles.detailRow}>
            <Clock size={16} style={styles.detailIcon} />
            <div>
              <div style={styles.detailLabel}>Time</div>
              <div style={styles.detailValue}>{booking.startTime} – {booking.endTime}</div>
            </div>
          </div>
          {booking.expectedAttendees && (
            <div style={styles.detailRow}>
              <Users size={16} style={styles.detailIcon} />
              <div>
                <div style={styles.detailLabel}>Expected Attendees</div>
                <div style={styles.detailValue}>{booking.expectedAttendees}</div>
              </div>
            </div>
          )}
          <div style={{ ...styles.detailRow, borderBottom: 'none', paddingBottom: 0 }}>
            <CalendarDays size={16} style={styles.detailIcon} />
            <div>
              <div style={styles.detailLabel}>Purpose</div>
              <div style={styles.detailValue}>{booking.purpose}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '1.5rem' }}>
          {!alreadyDone && !notApproved && (
            <button
              className="btn btn-primary"
              onClick={handleCheckIn}
              disabled={checking}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.7rem 1.5rem', fontSize: '1rem' }}
            >
              {checking ? (
                <>
                  <div className="animate-spin" style={{ width: 18, height: 18, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  Confirm Check-In
                </>
              )}
            </button>
          )}
          <Link to="/dashboard" className="btn btn-ghost">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Inline Styles ─────────────────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    padding: '2rem',
  },
  card: {
    background: 'rgba(30,41,59,0.85)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '2.5rem 2rem',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
  },
  iconCircle: (color) => ({
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: `${color}18`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.25rem',
  }),
  title: {
    color: '#f1f5f9',
    fontSize: '1.4rem',
    fontWeight: 700,
    margin: '0 0 0.5rem',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    margin: 0,
    lineHeight: 1.5,
  },
  detailsCard: {
    background: 'rgba(15,23,42,0.5)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1rem 1.25rem',
    textAlign: 'left',
    marginTop: '1.25rem',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    paddingBottom: '0.75rem',
    marginBottom: '0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  detailIcon: {
    color: '#64748b',
    marginTop: '2px',
    flexShrink: 0,
  },
  detailLabel: {
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b',
    marginBottom: '2px',
  },
  detailValue: {
    color: '#e2e8f0',
    fontSize: '0.92rem',
    fontWeight: 500,
  },
  detailSub: {
    color: '#94a3b8',
    fontSize: '0.78rem',
    marginTop: '2px',
  },
};
