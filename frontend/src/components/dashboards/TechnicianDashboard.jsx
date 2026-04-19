import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  }, [user.id]);

  const cards = [
    { label: 'Assigned to Me', value: stats.assigned, icon: Wrench, color: '#3b82f6' },
    { label: 'Total Open', value: stats.open, icon: Clock, color: '#f59e0b' },
    { label: 'In Progress', value: stats.inProgress, icon: Activity, color: '#6366f1' },
    { label: 'Resolved Tickets', value: stats.resolved, icon: CheckCircle, color: '#10b981' },
  ];

  return (
    <>
      <div className="dashboard__header">
        <h1 className="dashboard__title">Welcome back, {user?.name || 'Technician'} 👋</h1>
        <p className="dashboard__subtitle">Here is your Technician overview for today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {cards.map((c, i) => (
          <div className="card" key={i} style={{ borderTop: `3px solid ${c.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>{c.label}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9' }}>
                  {loading ? '—' : c.value}
                </div>
              </div>
              <div style={{ padding: '0.6rem', borderRadius: '10px', background: `${c.color}15` }}>
                <c.icon size={22} color={c.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {/* Critical Priority Alerts - Viva Requirement */}
        {assignedTickets.some(t => t.priority === 'CRITICAL' || t.priority === 'HIGH') && (
          <div className="card" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} />
              URGENT Priority Alerts
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {assignedTickets.filter(t => t.priority === 'CRITICAL' || t.priority === 'HIGH').map(t => (
                <div key={`urgent-${t.id}`} style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>{t.category}</div>
                    <span className="badge badge--critical">URGENT</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#fca5a5', marginBottom: '0.75rem' }}>{t.description}</div>
                  <button className="btn-dashboard btn-dashboard--primary btn-dashboard--sm" style={{ backgroundColor: '#ef4444' }} onClick={() => navigate('/technician/tickets')}>Work on Info</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Assigned Tickets Widget */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wrench size={18} color="#3b82f6" />
              My Active Assigned Tickets
            </h2>
            <button 
              className="btn-dashboard btn-dashboard--secondary btn-dashboard--sm"
              onClick={() => navigate('/technician/tickets')}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          {loading ? (
             <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading...</div>
          ) : assignedTickets.length === 0 ? (
             <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No active tickets assigned to you at the moment.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {assignedTickets.map(t => (
                <div key={`t-${t.id}`} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t.category}</div>
                    <span className={`badge badge--${t.priority?.toLowerCase()}`}>{t.priority}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem', height: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span className={`badge badge--${t.status?.toLowerCase()}`}>{t.status?.replace(/_/g, ' ')}</span>
                     <button className="btn-dashboard btn-dashboard--primary btn-dashboard--sm" onClick={() => navigate('/technician/tickets')}>Work on Info</button>
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
