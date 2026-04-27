import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, ArrowLeft, Eye, EyeOff, ShieldCheck, Wrench, User, LogIn } from 'lucide-react';
import { authApi } from '../services/api';
import './LoginPage.css';
import authIllustration from '../assets/auth-illustration.png';

export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Render official Google button on mount
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        callback: handleGoogleCallback,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'filled_black', size: 'large', width: 320 }
      );
    }
  }, []);

  useEffect(() => {
    if (user) {
      const target = user.role === 'ADMIN' ? '/admin-dashboard' 
                  : user.role === 'TECHNICIAN' ? '/tech-dashboard' 
                  : '/user-dashboard';
      navigate(target, { replace: true });
    }
  }, [user, navigate]);

  if (user) return null;

  const handleGoogleCallback = async (response) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleToken: response.credential }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Google authentication failed');
      }
      
      const data = await res.json();
      localStorage.setItem('token', data.token);
      // Google login: role determined by /me endpoint in AuthContext on reload
      window.location.href = '/dashboard';
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const setDevRole = (role) => {
    localStorage.setItem('testRoleOverride', role);
    localStorage.setItem('token', 'dev-dummy-token'); // Fake token to trigger AuthContext
    window.location.href = '/dashboard';
  };

  const handleLocalLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login({ 
        email: e.target.email.value, 
        password: e.target.password.value 
      });
      
      localStorage.setItem('token', data.token);
      localStorage.removeItem('testRoleOverride');

      // Role-based redirect using role from login response
      const role = data.user?.role;
      if (role === 'ADMIN') {
        window.location.href = '/admin-dashboard';
      } else if (role === 'TECHNICIAN') {
        window.location.href = '/tech-dashboard';
      } else {
        window.location.href = '/user-dashboard';
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-split-page">
      <div className="auth-left">
        <img src={authIllustration} alt="Smart Campus" className="auth-left__image" />
        <div className="auth-left__content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem', fontSize: '1.2rem', fontWeight: 700 }}>
            <Zap size={24} color="#fff" />
            <span>SmartCampus Hub</span>
          </div>
          <h1 className="auth-left__title">Welcome Back.</h1>
          <p className="auth-left__subtitle">
            Sign in to manage campus resources, bookings, and maintenance seamlessly.
          </p>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-card__title">Sign In</h2>
          <p className="auth-card__subtitle">Continue with Google or enter your details.</p>
          
          {error && <div className="login-card__error">{error}</div>}

          <div 
            id="google-signin-button" 
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}
          ></div>

          <div className="auth-divider">or</div>

          <form onSubmit={handleLocalLogin}>
            <label className="auth-form-label">Email Address</label>
            <input type="email" name="email" required className="auth-form-input" placeholder="example@campus.edu" />
            
            <label className="auth-form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                className="auth-form-input"
                placeholder="••••••••"
                style={{ paddingRight: '2.8rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '0.85rem',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#64748b',
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
              className="auth-btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', marginRight: '8px' }} />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn size={20} style={{ marginRight: '8px' }} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b', marginTop: '1.5rem' }}>
            Don't have an account? <Link to="/register" style={{ color: '#4CA799', textDecoration: 'none', fontWeight: 600 }}>Sign up free</Link>
          </div>

          <Link to="/" className="login-card__back" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <ArrowLeft size={16} />
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
