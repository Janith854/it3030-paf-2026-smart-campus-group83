import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../services/api';
import { Users, Shield, Trash2 } from 'lucide-react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const ROLES = ['USER', 'ADMIN', 'TECHNICIAN'];

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (!confirm(`Change this user's role to ${newRole}?`)) return;
    try {
      await usersApi.updateRole(userId, newRole);
      load();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await usersApi.delete(userId);
      load();
    } catch (e) { setError(e.message); }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="empty-state">
        <div className="empty-state__icon"><Shield size={48} /></div>
        <div className="empty-state__title">Access Denied</div>
        <p>Only admins can access this page.</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage user roles and permissions</p>
        </div>
      </div>

      <AnalyticsDashboard />
      <br />

      {error && <div className="alert-conflict" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div style={{ marginBottom: '16px', color: 'var(--text-hint)' }}><Users size={48} /></div>
            <div className="empty-state-title">No users found</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex-gap" style={{ gap: '12px' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--primary-wash)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: 600, color: 'var(--primary)', overflow: 'hidden',
                        }}>
                          {u.picture
                            ? <img src={u.picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : (u.name ? u.name[0].toUpperCase() : '?')}
                        </div>
                        <span style={{ fontWeight: 500 }}>{u.name || '—'}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td><span className={`badge badge-${u.role === 'ADMIN' ? 'approved' : u.role === 'TECHNICIAN' ? 'pending' : 'active'}`}>{u.role}</span></td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                    <td>
                      {u.id !== user.id ? (
                        <div className="flex-gap" style={{ gap: '8px' }}>
                          <select
                            className="form-select"
                            style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', minHeight: '30px' }}
                            value={u.role}
                            onChange={e => handleRoleChange(u.id, e.target.value)}
                          >
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <button
                            className="btn btn-ghost btn-sm text-danger"
                            style={{ padding: '6px', border: 'none' }}
                            onClick={() => handleDelete(u.id)}
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-hint)', fontSize: '13px' }}>You</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
