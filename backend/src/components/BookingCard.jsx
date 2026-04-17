import React from 'react';
import { Calendar, Clock, MapPin, Trash2, CheckCircle2, XCircle, AlertCircle, RotateCcw } from 'lucide-react';
import './BookingCard.css';

const BookingCard = ({ booking, onCancel }) => {
  const { id, resourceId, bookingDate, startTime, endTime, purpose, status, rejectionReason } = booking;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'APPROVED':
        return { 
          icon: <CheckCircle2 size={16} />, 
          className: 'status-approved', 
          label: 'Approved' 
        };
      case 'REJECTED':
        return { 
          icon: <XCircle size={16} />, 
          className: 'status-rejected', 
          label: 'Rejected' 
        };
      case 'CANCELLED':
        return { 
          icon: <RotateCcw size={16} />, 
          className: 'status-cancelled', 
          label: 'Cancelled' 
        };
      case 'PENDING':
      default:
        return { 
          icon: <AlertCircle size={16} />, 
          className: 'status-pending', 
          label: 'Pending' 
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div className="booking-card">
      <div className="booking-card-header">
        <div className="resource-pill">
          <MapPin size={14} />
          <span>{resourceId}</span>
        </div>
        <div className={`status-badge ${statusConfig.className}`}>
          {statusConfig.icon}
          <span>{statusConfig.label}</span>
        </div>
      </div>

      <div className="booking-card-body">
        <h3 className="booking-purpose">{purpose}</h3>
        
        <div className="booking-meta">
          <div className="meta-item">
            <Calendar size={14} />
            <span>{bookingDate}</span>
          </div>
          <div className="meta-item">
            <Clock size={14} />
            <span>{startTime.substring(0, 5)} - {endTime.substring(0, 5)}</span>
          </div>
        </div>

        {status === 'REJECTED' && rejectionReason && (
          <div className="rejection-note">
            <strong>Reason:</strong> {rejectionReason}
          </div>
        )}
      </div>

      <div className="booking-card-footer">
        {(status === 'PENDING' || status === 'APPROVED') && (
          <button 
            className="cancel-booking-btn"
            onClick={() => onCancel(id)}
          >
            <Trash2 size={16} />
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
