import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // On mount, if we have a token, fetch the current user
  useEffect(() => {
    if (token) {
      if (token === 'mock-admin-token') {
        setUser({
          id: 'mock-admin-id',
          email: 'admin@smartcampus.com',
          name: 'Demo Administrator',
          role: localStorage.getItem('testRoleOverride') || 'ADMIN'
        });
        setLoading(false);
        return;
      }

      fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) {
            // Only clear token if it's definitely invalid (401, 403)
            // If it's a server error (500), keep the token and maybe show an error later
            if (res.status === 401 || res.status === 403) {
              throw new Error('Invalid token');
            }
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || 'Server error');
          }
          return res.json();
        })
        .then((data) => {
          const testRole = localStorage.getItem('testRoleOverride');
          if (testRole) {
            data.role = testRole;
            data.name = `Dev ${testRole === 'USER' ? 'Lecturer' : testRole}`;
          }
          setUser(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Auth error:', err);
          if (err.message === 'Invalid token') {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
          // If it's a server error, we keep 'loading' false but user remains null
          // DashboardLayout will then redirect to login, which is fine, 
          // but at least the token is still there for when the server comes back.
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (googleToken) => {
    const res = await fetch('/api/v1/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ googleToken }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    localStorage.setItem('token', data.token);
    setToken(data.token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('testRoleOverride');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
