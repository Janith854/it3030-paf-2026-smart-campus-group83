import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, ArrowLeft, UserPlus, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../services/api';
import './dashboard.css';

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
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: '450px' }}>
        <div className="login-card__logo">
          <div className="login-card__logo-icon">
            <Zap size={20} color="#fff" />
          </div>
          <span>Smart<span style={{ color: '#3b82f6' }}>Campus</span> Hub</span>
        </div>

        <h1 className="login-card__title">Create an Account</h1>
        <p className="login-card__subtitle">
          Join the Smart Campus network as a Lecturer/Student or Technician.
        </p>

        {error && <div className="login-card__error">{error}</div>}

        {success && (
          <div style={{
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.3)',
            color: '#34d399',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            ✅ Account created! Redirecting to sign in...
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
             <label>Full Name</label>
             <input type="text" required className="form-input" placeholder="e.g. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
             <label>Email Address</label>
             <input type="email" required className="form-input" placeholder="name@campus.edu" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
             <label>Password</label>
             <input
               type={showPassword ? 'text' : 'password'}
               required
               className="form-input"
               placeholder="Minimum 6 characters"
               value={formData.password}
               onChange={e => setFormData({...formData, password: e.target.value})}
               minLength={6}
               style={{ paddingRight: '2.8rem' }}
             />
             <button
               type="button"
               onClick={() => setShowPassword(v => !v)}
               style={{
                 position: 'absolute', right: '0.75rem', top: 'calc(50% + 10px)',
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
          <div className="form-group" style={{ marginBottom: 0 }}>
             <label>Account Type</label>
             <select className="form-select" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="USER">Lecturer / Student</option>
                <option value="TECHNICIAN">Technician</option>
             </select>
          </div>

          <button
            type="submit"
            className="btn-dashboard btn-dashboard--primary"
            style={{ padding: '0.8rem', justifyContent: 'center', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : (
              <><UserPlus size={18} /> Register Now</>
            )}
          </button>
        </form>

        <div className="login-card__divider" style={{ margin: '1.5rem 0' }}>or</div>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
          Already have an account? <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>Sign in here</Link>
        </div>

        <Link to="/" className="login-card__back" style={{ marginTop: '1.5rem' }}>
          <ArrowLeft size={16} />
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
