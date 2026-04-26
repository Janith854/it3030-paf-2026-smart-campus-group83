import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, ArrowLeft, UserPlus, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../services/api';
import './dashboard.css';
import authIllustration from '../assets/auth-illustration.png';

export default function RegisterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  });

  if (user) {
    if (user.role === 'ADMIN') navigate('/admin', { replace: true });
    else if (user.role === 'TECHNICIAN') navigate('/technician', { replace: true });
    else navigate('/lecturer', { replace: true });
    return null;
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.register(formData);

      // Registration successful — do NOT auto-login; redirect to sign-in
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);

    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-split-page">
      <div className="auth-left">
        <div className="auth-left__content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem', fontSize: '1.2rem', fontWeight: 700 }}>
            <Zap size={24} color="#fff" />
            <span>SmartCampus Hub</span>
          </div>
          <h1 className="auth-left__title">Join the Network.</h1>
          <p className="auth-left__subtitle">
            Create an account to manage resources, maintenance, and explore the campus ecosystem.
          </p>
          <img src={authIllustration} alt="Smart Campus" className="auth-left__image" />
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-card__title">Create Account</h2>
          <p className="auth-card__subtitle">Join as a Lecturer/Student or Technician.</p>
          
          {error && <div className="login-card__error">{error}</div>}

          {success && (
            <div style={{
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#34d399',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              ✅ Account created! Redirecting to sign in...
            </div>
          )}

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
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}
            >
              {loading ? 'Creating Account...' : (
                <><UserPlus size={18} /> Register Now</>
              )}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
            Already have an account? <Link to="/login" style={{ color: '#4CA799', textDecoration: 'none', fontWeight: 600 }}>Sign in here</Link>
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
