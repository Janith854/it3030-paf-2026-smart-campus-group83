import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resourcesApi } from '../services/api';
import {
  ArrowLeft, Building2, MapPin, Users, Tag, Clock,
  FileText, Calendar, RefreshCw,
} from 'lucide-react';

export default function ResourceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResource = async () => {
      setLoading(true);
      try {
        const data = await resourcesApi.getById(id);
        setResource(data);
      } catch (e) {
        setError(e.message || 'Failed to load resource');
      }
      setLoading(false);
    };
    fetchResource();
  }, [id]);

  if (loading) {
    return (
      <div className="empty-state" style={{ marginTop: '3rem' }}>
        Loading resource details...
      </div>
    );
  }

  if (error) {
    return (
      <>
        <button className="btn-dashboard btn-dashboard--secondary" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="login-card__error">{error}</div>
      </>
    );
  }

  if (!resource) return null;

  const statusClass = resource.status?.toLowerCase();

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <>
      {/* Back button */}
      <button
        className="btn btn-outline"
        onClick={() => navigate(-1)}
        style={{ marginBottom: '24px' }}
      >
        <ArrowLeft size={16} /> Back to Resources
      </button>

      {/* Header */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: 'var(--radius-md)', 
            background: 'var(--primary-wash)', color: 'var(--primary)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <Building2 size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>{resource.name}</h1>
            <div style={{ marginTop: '4px' }}>
              <span className={`badge badge-${statusClass || 'active'}`}>{resource.status?.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '8px' }}><Tag size={18} /></div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-hint)', marginBottom: '4px' }}>Type</div>
          <div style={{ fontWeight: 500, color: 'var(--text)' }}>{resource.type?.replace(/_/g, ' ')}</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '8px' }}><MapPin size={18} /></div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-hint)', marginBottom: '4px' }}>Location</div>
          <div style={{ fontWeight: 500, color: 'var(--text)' }}>{resource.location}</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '8px' }}><Users size={18} /></div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-hint)', marginBottom: '4px' }}>Capacity</div>
          <div style={{ fontWeight: 500, color: 'var(--text)' }}>{resource.capacity ?? '—'}</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '8px' }}><Clock size={18} /></div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-hint)', marginBottom: '4px' }}>Availability Window</div>
          <div style={{ fontWeight: 500, color: 'var(--text)' }}>{resource.availabilityWindow || '—'}</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '8px' }}><Calendar size={18} /></div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-hint)', marginBottom: '4px' }}>Created</div>
          <div style={{ fontWeight: 500, color: 'var(--text)' }}>{formatDate(resource.createdAt)}</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '8px' }}><RefreshCw size={18} /></div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-hint)', marginBottom: '4px' }}>Last Updated</div>
          <div style={{ fontWeight: 500, color: 'var(--text)' }}>{formatDate(resource.updatedAt)}</div>
        </div>
      </div>

      {/* Description */}
      {resource.description && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <FileText size={16} color="var(--primary)" /> Description
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{resource.description}</p>
        </div>
      )}

      {/* Resource ID */}
      <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-hint)' }}>
        Resource ID: <code style={{ background: 'var(--border)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text)' }}>{resource.id}</code>
      </div>
    </>
  );
}
