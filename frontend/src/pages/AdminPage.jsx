import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../services/api';
import { Users, Shield } from 'lucide-react';

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
      <div className="dashboard__header">
        <h1 className="dashboard__title">User Management</h1>
        <p className="dashboard__subtitle">Manage user roles and permissions</p>
      </div>

      {error && <div className="login-card__error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="card">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon"><Users size={48} /></div>
            <div className="empty-state__title">No users found</div>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 600, color: '#fff', overflow: 'hidden',
                        }}>
                          {u.picture
                            ? <img src={u.picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : (u.name ? u.name[0].toUpperCase() : '?')}
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.name || '—'}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td><span className={`badge badge--${u.role === 'ADMIN' ? 'approved' : u.role === 'TECHNICIAN' ? 'in_progress' : 'open'}`}>{u.role}</span></td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                    <td>
                      {u.id !== user.id ? (
                        <select
                          className="form-select"
                          style={{ padding: '0.35rem', fontSize: '0.75rem', width: 'auto' }}
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <span style={{ color: '#475569', fontSize: '0.8rem' }}>You</span>
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
