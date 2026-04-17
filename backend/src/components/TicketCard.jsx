import React from 'react';
import { Clock, MapPin, AlertCircle, CheckCircle2, MoreHorizontal, XCircle, RotateCcw } from 'lucide-react';
import './TicketCard.css';

const TicketCard = ({ ticket, onClick }) => {
  const { id, category, description, priority, status, location, createdAt } = ticket;

  const getPriorityConfig = (p) => {
    switch (p) {
      case 'CRITICAL': return { color: '#ef4444', label: 'Critical' };
      case 'HIGH': return { color: '#f97316', label: 'High' };
      case 'MEDIUM': return { color: '#f59e0b', label: 'Medium' };
      case 'LOW': default: return { color: '#10b981', label: 'Low' };
    }
  };

  const getStatusIcon = (s) => {
    switch (s) {
      case 'OPEN': return <AlertCircle size={14} className="text-blue-500" />;
      case 'IN_PROGRESS': return <MoreHorizontal size={14} className="text-amber-500" />;
      case 'RESOLVED': return <CheckCircle2 size={14} className="text-green-500" />;
      case 'CLOSED': return <RotateCcw size={14} className="text-gray-500" />;
      case 'REJECTED': return <XCircle size={14} className="text-red-500" />;
      default: return <AlertCircle size={14} />;
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <div 
      className="ticket-card" 
      style={{ borderLeftColor: config.color }}
      onClick={() => onClick(id)}
    >
      <div className="ticket-card-header">
        <span className="ticket-category">{category}</span>
        <div className="ticket-badges">
          <span className="priority-badge" style={{ backgroundColor: config.color + '15', color: config.color }}>
            {config.label}
          </span>
          <span className={`status-badge-mini status-${status.toLowerCase().replace('_', '-')}`}>
            {getStatusIcon(status)}
            {status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <h3 className="ticket-desc-title">{description?.substring(0, 60)}{description?.length > 60 ? '...' : ''}</h3>

      <div className="ticket-card-footer">
        <div className="footer-meta">
          <MapPin size={12} />
          <span>{location}</span>
        </div>
        <div className="footer-meta">
          <Clock size={12} />
          <span>{new Date(createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
