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

  const [isRegistering, setIsRegistering] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  });

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
  }, [isRegistering]);

  // If already logged in, redirect to the correct role-based dashboard
  if (user) {
    if (user.role === 'ADMIN') navigate('/admin-dashboard', { replace: true });
    else if (user.role === 'TECHNICIAN') navigate('/tech-dashboard', { replace: true });
    else navigate('/user-dashboard', { replace: true });
    return null;
  }

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

  const handleLocalLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // In LoginPage we only use the form if not using google
      const email = e.target.email.value;
      const password = e.target.password.value;
      const res = await authApi.login({ email, password });
      
      if (res.token) {
         // Token logic is handled inside authApi or AuthContext usually, but here we redirect based on role
         // The AuthProvider detects localStorage change or we just reload
         window.location.href = '/'; 
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await authApi.register(formData);
      setSuccessMsg('Account created! You can now sign in.');
      setIsRegistering(false);
      setFormData({ name: '', email: '', password: '', role: 'USER' });
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
          <h2 className="auth-card__title">{isRegistering ? 'Create Account' : 'Sign In'}</h2>
          <p className="auth-card__subtitle">
            {isRegistering ? 'Join as a Lecturer/Student or Technician.' : 'Continue with Google or enter your details.'}
          </p>
          
          {error && <div className="login-card__error">{error}</div>}
          {successMsg && <div className="login-card__success" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1rem' }}>{successMsg}</div>}

          {!isRegistering && (
            <>
              <div 
                id="google-signin-button" 
                style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}
              ></div>
              <div className="auth-divider">or</div>
            </>
          )}

          {isRegistering ? (
            <form onSubmit={handleRegister}>
              <label className="auth-form-label">Full Name</label>
              <input type="text" required className="auth-form-input" placeholder="e.g. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              
              <label className="auth-form-label">Email Address</label>
              <input type="email" required className="auth-form-input" placeholder="name@campus.edu" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              
              <label className="auth-form-label">Password</label>
              <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="auth-form-input"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  minLength={6}
                  style={{ marginBottom: 0, paddingRight: '2.8rem' }}
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

              <label className="auth-form-label">Account Type</label>
              <select className="auth-form-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ appearance: 'auto', backgroundColor: '#f8fafc', color: '#0f172a' }}>
                <option value="USER">Lecturer / Student</option>
                <option value="TECHNICIAN">Technician</option>
              </select>

              <button
                type="submit"
                className="auth-btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Register Now'}
              </button>
            </form>
          ) : (
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
          )}

          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b', marginTop: '1.5rem' }}>
            {isRegistering ? (
              <>Already have an account? <button onClick={() => { setIsRegistering(false); setError(''); }} style={{ color: '#4CA799', textDecoration: 'none', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign in here</button></>
            ) : (
              <>Don't have an account? <button onClick={() => { setIsRegistering(true); setError(''); }} style={{ color: '#4CA799', textDecoration: 'none', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign up free</button></>
            )}
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
