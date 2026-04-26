import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ticketsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Wrench, Clock, CheckCircle, Activity, ArrowRight } from 'lucide-react';

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ assigned: 0, open: 0, inProgress: 0, resolved: 0 });
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const allTickets = await ticketsApi.getAll().catch(() => []);
        const ticketsArray = Array.isArray(allTickets) ? allTickets : [];

        const myAssigned = ticketsArray.filter(t => t.assignedTechnicianId === user.id);

        setStats({
          assigned: myAssigned.length,
          open: myAssigned.filter(t => t.status === 'OPEN').length,
          inProgress: myAssigned.filter(t => t.status === 'IN_PROGRESS').length,
          resolved: myAssigned.filter(t => t.status === 'RESOLVED').length,
        });

        // Show recent assigned tickets that are not closed
        const activeAssigned = myAssigned.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED');
        setAssignedTickets(activeAssigned.slice(-4).reverse());
      } catch (error) {
        console.error('Failed to load technician dashboard:', error);
      }
      setLoading(false);
    }
    load();
  }, [user?.id]);

  const cards = [
    { label: 'Assigned to Me', value: stats.assigned, icon: Wrench, color: '#3b82f6' },
    { label: 'Total Open', value: stats.open, icon: Clock, color: '#f59e0b' },
    { label: 'In Progress', value: stats.inProgress, icon: Activity, color: '#6366f1' },
    { label: 'Resolved Tickets', value: stats.resolved, icon: CheckCircle, color: '#10b981' },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name || 'Technician'} 👋</h1>
          <p className="page-subtitle">Here is your Technician overview for today.</p>
        </div>
      </div>

      <div className="card-grid mb-3">
        {cards.map((c, i) => (
          <div className="stat-card" key={i} style={{ borderTop: `3px solid ${c.color}` }}>
            <div className="flex-between">
              <div>
                <div className="stat-label">{c.label}</div>
                <div className="stat-value">
                  {loading ? '—' : c.value}
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: '8px', background: `${c.color}15` }}>
                <c.icon size={20} color={c.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {/* Critical Priority Alerts - Viva Requirement */}
        {assignedTickets.some(t => t.priority === 'CRITICAL' || t.priority === 'HIGH') && (
          <div className="card" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
            <h2 className="card-title flex-gap mb-2" style={{ color: '#dc2626' }}>
              <Activity size={16} />
              URGENT Priority Alerts
            </h2>
            <div className="card-grid">
              {assignedTickets.filter(t => t.priority === 'CRITICAL' || t.priority === 'HIGH').map(t => (
                <div key={`urgent-${t.id}`} className="ticket-card priority-critical" style={{ padding: '16px', background: '#ffffff', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex-between mb-1">
                    <div className="font-medium">{t.category}</div>
                    <span className="badge badge-rejected">URGENT</span>
                  </div>
                  <div className="text-sm text-danger mb-2">{t.description}</div>
                  <button className="btn btn-danger btn-sm mt-1" onClick={() => navigate('/technician/tickets')}>Work on Info</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Assigned Tickets Widget */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex-gap">
              <Wrench size={16} className="text-primary" />
              My Active Assigned Tickets
            </h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/technician/tickets')}
            >
              View All <ArrowRight size={12} />
            </button>
          </div>
          {loading ? (
            <div className="text-muted text-sm">Loading...</div>
          ) : assignedTickets.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">No active tickets assigned to you at the moment.</p>
            </div>
          ) : (
            <div className="card-grid">
              {assignedTickets.map(t => (
                <div key={`t-${t.id}`} className={`ticket-card priority-${t.priority?.toLowerCase() || 'medium'}`} style={{ padding: '16px', background: 'var(--primary-wash)', border: '1px solid var(--border)' }}>
                  <div className="flex-between mb-1">
                    <div className="font-medium text-sm">{t.category}</div>
                    <span className={`badge badge-${t.priority?.toLowerCase() || 'pending'}`}>{t.priority}</span>
                  </div>
                  <div className="text-sm text-muted mb-2" style={{ height: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</div>
                  <div className="flex-between mt-2">
                    <span className={`badge badge-${t.status?.toLowerCase() || 'open'}`}>{t.status?.replace(/_/g, ' ')}</span>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/technician/tickets')}>Work on Info</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
