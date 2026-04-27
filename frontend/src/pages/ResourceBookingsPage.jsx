import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingsApi, resourcesApi, usersApi } from '../services/api';
import {
  Building2, CalendarDays, Clock, User, CheckCircle2,
  XCircle, AlertCircle, ArrowLeft, ChevronDown, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_META = {
  APPROVED:  { color: '#059669', bg: '#d1fae5', label: 'Approved' },
  PENDING:   { color: '#d97706', bg: '#fef3c7', label: 'Pending'  },
  REJECTED:  { color: '#dc2626', bg: '#fee2e2', label: 'Rejected' },
  CANCELLED: { color: '#6b7280', bg: '#f3f4f6', label: 'Cancelled'},
};

export default function ResourceBookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings]     = useState([]);
  const [resources, setResources]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [users, setUsers]           = useState({});
  const [expanded, setExpanded]     = useState({});   // { resourceId: bool }
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const load = async () => {
      try {
        const [b, r, u] = await Promise.all([
          bookingsApi.getAll(),
          resourcesApi.getAll(),
          usersApi.getAll(),
        ]);
        setBookings(Array.isArray(b) ? b : []);
        setResources(Array.isArray(r) ? r : []);
        
        const userMap = {};
        if (Array.isArray(u)) {
          u.forEach(usr => { userMap[usr.id] = usr; });
        }
        setUsers(userMap);

        // Expand first resource by default
        if (r?.length) setExpanded({ [r[0].id]: true });
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  // Build a resource-keyed map of bookings
  const grouped = resources.reduce((acc, res) => {
    const resBookings = bookings.filter(b => {
      if (b.resourceId !== res.id) return false;
      if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
      return true;
    });
    if (resBookings.length > 0 || statusFilter === 'ALL') {
      acc[res.id] = { resource: res, bookings: resBookings };
    }
    return acc;
  }, {});

  const totalBookings = bookings.filter(b => statusFilter === 'ALL' || b.status === statusFilter).length;
  const approvedCount = bookings.filter(b => b.status === 'APPROVED').length;
  const pendingCount  = bookings.filter(b => b.status === 'PENDING').length;

  if (loading) return <div style={{ padding: '40px', color: '#6a8a85' }}>Loading resource bookings...</div>;

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#f0faf8', border: '1px solid #d9f0ec',
            color: '#2f9e8f', borderRadius: '10px',
            padding: '8px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a3a36', margin: 0 }}>
            Bookings by Resource
          </h1>
          <p style={{ fontSize: '13px', color: '#6a8a85', margin: '2px 0 0' }}>
            All campus bookings grouped by resource — review, approve or reject at a glance
          </p>
        </div>
      </div>

      {error && <div className="alert-conflict">{error}</div>}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Bookings', value: bookings.length, icon: <CalendarDays size={20} />, color: '#2f9e8f' },
          { label: 'Approved',       value: approvedCount,   icon: <CheckCircle2 size={20} />, color: '#059669' },
          { label: 'Pending Review', value: pendingCount,    icon: <AlertCircle size={20} />,  color: '#d97706' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#fff', border: '1px solid #eef4f2', borderRadius: '16px',
            padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: '12px',
              background: `${s.color}18`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: s.color, flexShrink: 0,
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#1a3a36' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#6a8a85', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['ALL', 'APPROVED', 'PENDING', 'REJECTED', 'CANCELLED'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '6px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
              cursor: 'pointer', border: '1.5px solid',
              background: statusFilter === s ? (STATUS_META[s]?.bg || '#f0faf8') : '#fff',
              color: statusFilter === s ? (STATUS_META[s]?.color || '#2f9e8f') : '#8fa7a3',
              borderColor: statusFilter === s ? (STATUS_META[s]?.color || '#2f9e8f') : '#d1dbd9',
              transition: 'all 0.2s ease',
            }}
          >
            {s === 'ALL' ? 'All Statuses' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#8fa7a3', alignSelf: 'center' }}>
          Showing {totalBookings} booking{totalBookings !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Resource Accordion Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.values(grouped).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#8fa7a3' }}>
            <CalendarDays size={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <div style={{ fontSize: '16px', fontWeight: 600 }}>No bookings found</div>
          </div>
        ) : (
          Object.values(grouped).map(({ resource, bookings: rBookings }) => (
            <div key={resource.id} style={{
              background: '#fff', border: '1px solid #eef4f2',
              borderRadius: '20px', overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
            }}>
              {/* Resource Header Row */}
              <button
                onClick={() => toggle(resource.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '20px 24px', background: 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: '12px',
                  background: 'rgba(47,158,143,0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#2f9e8f', flexShrink: 0,
                }}>
                  <Building2 size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a3a36' }}>{resource.name}</div>
                  <div style={{ fontSize: '12px', color: '#6a8a85', marginTop: '2px' }}>
                    {resource.type?.replace('_', ' ')} • {resource.location}
                  </div>
                </div>
                <div style={{
                  background: rBookings.length > 0 ? 'rgba(47,158,143,0.1)' : '#f3f4f6',
                  color: rBookings.length > 0 ? '#2f9e8f' : '#9ca3af',
                  padding: '4px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, flexShrink: 0,
                }}>
                  {rBookings.length} booking{rBookings.length !== 1 ? 's' : ''}
                </div>
                <div style={{ color: '#8fa7a3', marginLeft: '4px' }}>
                  {expanded[resource.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
              </button>

              {/* Expanded Booking Table */}
              {expanded[resource.id] && (
                <div style={{ borderTop: '1px solid #eef4f2' }}>
                  {rBookings.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#8fa7a3', fontSize: '14px' }}>
                      No bookings match the current filter for this resource.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f8faf9' }}>
                            {['Date', 'Time', 'Purpose', 'Attendees', 'Booked By', 'Status'].map(h => (
                              <th key={h} style={{
                                padding: '12px 20px', textAlign: 'left', fontSize: '11px',
                                fontWeight: 700, color: '#6a8a85', textTransform: 'uppercase',
                                letterSpacing: '0.5px', whiteSpace: 'nowrap',
                              }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rBookings
                            .sort((a, b) => (a.bookingDate > b.bookingDate ? -1 : 1))
                            .map((b, i) => {
                              const s = STATUS_META[b.status] || STATUS_META.PENDING;
                              return (
                                <tr key={b.id} style={{ borderTop: i > 0 ? '1px solid #f0f7f5' : 'none' }}>
                                  <td style={{ padding: '14px 20px', fontSize: '14px', color: '#1a3a36', fontWeight: 500 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <CalendarDays size={14} style={{ color: '#2f9e8f' }} />
                                      {b.bookingDate}
                                    </div>
                                  </td>
                                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#1a3a36', whiteSpace: 'nowrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <Clock size={13} style={{ color: '#6a8a85' }} />
                                      {b.startTime} – {b.endTime}
                                    </div>
                                  </td>
                                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#374151', maxWidth: '220px' }}>
                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {b.purpose}
                                    </div>
                                  </td>
                                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6a8a85', textAlign: 'center' }}>
                                    {b.expectedAttendees ?? '—'}
                                  </td>
                                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6a8a85' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <User size={13} />
                                      {users[b.userId]?.name || b.userId || 'Unknown'}
                                    </div>
                                  </td>
                                  <td style={{ padding: '14px 20px' }}>
                                    <span style={{
                                      background: s.bg, color: s.color,
                                      padding: '4px 12px', borderRadius: '8px',
                                      fontSize: '12px', fontWeight: 700,
                                    }}>{s.label}</span>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
