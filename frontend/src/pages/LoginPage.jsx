import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import './dashboard.css';

export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect
  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          callback: async (response) => {
            try {
              const res = await fetch('/api/v1/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ googleToken: response.credential }),
              });
              if (!res.ok) throw new Error('Login failed');
              const data = await res.json();
              localStorage.setItem('token', data.token);
              window.location.href = '/dashboard';
            } catch (e) {
              setError(e.message);
              setLoading(false);
            }
          },
        });
        window.google.accounts.id.prompt();
      } else {
        setError('Google Sign-In not loaded. Use Dev Login below to test.');
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleLocalLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e.target.email.value, password: e.target.password.value })
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Login failed');
      }
      
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.removeItem('testRoleOverride'); // Clean up old hacks
      
      // We must decode JWT, fetch user profile, or simply redirect to home to let AuthContext route us
      window.location.href = '/';
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__logo">
          <div className="login-card__logo-icon">
            <Zap size={20} color="#fff" />
          </div>
          <span>Smart<span style={{ color: '#3b82f6' }}>Campus</span> Hub</span>
        </div>

        <h1 className="login-card__title">Welcome Back</h1>
        <p className="login-card__subtitle">
          Sign in to manage campus resources, bookings, and maintenance
        </p>

        {error && <div className="login-card__error">{error}</div>}

        <form onSubmit={handleLocalLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', width: '100%' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
             <input type="email" name="email" required className="form-input" placeholder="Email Address" />
          </div>
          <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
             <input
               type={showPassword ? 'text' : 'password'}
               name="password"
               required
               className="form-input"
               placeholder="Password"
               style={{ paddingRight: '2.8rem' }}
             />
             <button
               type="button"
               onClick={() => setShowPassword(v => !v)}
               style={{
                 position: 'absolute', right: '0.75rem', top: '50%',
                 transform: 'translateY(-50%)', background: 'none',
                 border: 'none', cursor: 'pointer', color: '#64748b',
                 display: 'flex', alignItems: 'center', padding: 0
               }}
               tabIndex={-1}
               aria-label={showPassword ? 'Hide password' : 'Show password'}
             >
               {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
             </button>
          </div>
          <button
            type="submit"
            className="btn-dashboard btn-dashboard--primary"
            style={{ padding: '0.8rem', justifyContent: 'center', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="login-card__divider" style={{ margin: '1.5rem 0' }}>or continue with</div>

        <button
          className="login-card__google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
          id="login-google-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b', marginTop: '1.5rem' }}>
          Don't have an account? <Link to="/register" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>Register here</Link>
        </div>

        <Link to="/" className="login-card__back" style={{ marginTop: '1.5rem' }}>
          <ArrowLeft size={16} />
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
