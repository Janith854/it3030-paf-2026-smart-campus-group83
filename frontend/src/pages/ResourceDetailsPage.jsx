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
        className="btn-dashboard btn-dashboard--secondary"
        onClick={() => navigate(-1)}
        style={{ marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} /> Back to Resources
      </button>

      {/* Header */}
      <div className="resource-detail">
        <div className="resource-detail__header">
          <div className="resource-detail__icon">
            <Building2 size={28} />
          </div>
          <div>
            <h1 className="resource-detail__name">{resource.name}</h1>
            <span className={`badge badge--${statusClass}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>
              {resource.status?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="resource-detail__grid">
          <div className="resource-detail__card">
            <div className="resource-detail__card-icon"><Tag size={18} /></div>
            <div className="resource-detail__card-label">Type</div>
            <div className="resource-detail__card-value">{resource.type?.replace(/_/g, ' ')}</div>
          </div>

          <div className="resource-detail__card">
            <div className="resource-detail__card-icon"><MapPin size={18} /></div>
            <div className="resource-detail__card-label">Location</div>
            <div className="resource-detail__card-value">{resource.location}</div>
          </div>

          <div className="resource-detail__card">
            <div className="resource-detail__card-icon"><Users size={18} /></div>
            <div className="resource-detail__card-label">Capacity</div>
            <div className="resource-detail__card-value">{resource.capacity ?? '—'}</div>
          </div>

          <div className="resource-detail__card">
            <div className="resource-detail__card-icon"><Clock size={18} /></div>
            <div className="resource-detail__card-label">Availability Window</div>
            <div className="resource-detail__card-value">{resource.availabilityWindow || '—'}</div>
          </div>

          <div className="resource-detail__card">
            <div className="resource-detail__card-icon"><Calendar size={18} /></div>
            <div className="resource-detail__card-label">Created</div>
            <div className="resource-detail__card-value">{formatDate(resource.createdAt)}</div>
          </div>

          <div className="resource-detail__card">
            <div className="resource-detail__card-icon"><RefreshCw size={18} /></div>
            <div className="resource-detail__card-label">Last Updated</div>
            <div className="resource-detail__card-value">{formatDate(resource.updatedAt)}</div>
          </div>
        </div>

        {/* Description */}
        {resource.description && (
          <div className="resource-detail__section">
            <div className="resource-detail__section-title">
              <FileText size={16} /> Description
            </div>
            <p className="resource-detail__description">{resource.description}</p>
          </div>
        )}

        {/* Resource ID */}
        <div className="resource-detail__id">
          Resource ID: <code>{resource.id}</code>
        </div>
      </div>
    </>
  );
}
