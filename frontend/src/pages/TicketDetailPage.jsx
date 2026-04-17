import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, Clock, MapPin, User, Shield, CheckCircle2, AlertCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { API_BASE, getAuthHeaders } from '../utils/api';
import CommentSection from '../components/CommentSection';
import './TicketDetailPage.css';

const TicketDetailPage = ({ ticketId, setPage, userRole, currentUserId }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resNotes, setResNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchTicket = async () => {
    try {
      const resp = await axios.get(`${API_BASE}/tickets/${ticketId}`, {
        headers: getAuthHeaders()
      });
      setTicket(resp.data);
      if (resp.data.resolutionNotes) setResNotes(resp.data.resolutionNotes);
    } catch (err) {
      alert('Failed to load ticket details.');
      setPage('tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === 'RESOLVED' && !resNotes.trim()) {
      alert('Resolution notes are required to resolve a ticket.');
      return;
    }

    setIsUpdating(true);
    try {
      const resp = await axios.patch(
        `${API_BASE}/tickets/${ticketId}/status`,
        null,
        {
          params: { status: newStatus, notes: resNotes },
          headers: getAuthHeaders()
        }
      );
      setTicket(resp.data);
      alert(`Ticket status updated to ${newStatus}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="detail-loader">Searching records...</div>;
  if (!ticket) return null;

  const canUpdateStatus = userRole === 'TECHNICIAN' || userRole === 'ADMIN';
  const isAdmin = userRole === 'ADMIN';

  return (
    <div className="ticket-detail-container">
      <div className="detail-header">
        <button className="back-btn" onClick={() => setPage('tickets')}>
          <ChevronLeft size={20} />
          <span>Back to Grid</span>
        </button>
        <div className="header-main">
          <h1 className="detail-title">{ticket.category}</h1>
          <div className="status-pill big" data-status={ticket.status}>
            {ticket.status.replace('_', ' ')}
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-info-main">
          <div className="info-card">
            <h2 className="info-card-title">Problem Description</h2>
            <p className="ticket-description-text">{ticket.description}</p>
            
            {ticket.imageAttachments && ticket.imageAttachments.length > 0 && (
              <div className="attachments-section">
                <h3 className="sub-title">Attachments</h3>
                <div className="images-gallery">
                  {ticket.imageAttachments.map((img, idx) => (
                    <a key={idx} href={`${API_BASE.replace('/api/v1', '')}/uploads/${img}`} target="_blank" rel="noreferrer">
                      <img src={`${API_BASE.replace('/api/v1', '')}/uploads/${img}`} alt="Ticket attachment" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <CommentSection 
            ticketId={ticket.id} 
            comments={ticket.comments} 
            currentUserId={currentUserId}
            onCommentUpdate={(updatedTicket) => setTicket(updatedTicket)}
          />
        </div>

        <div className="detail-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-title">Case Metadata</h3>
            <div className="meta-list">
              <div className="meta-row">
                <AlertCircle size={16} />
                <div className="meta-content">
                  <label>Priority</label>
                  <span className={`prio-val prio-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                </div>
              </div>
              <div className="meta-row">
                <MapPin size={16} />
                <div className="meta-content">
                  <label>Location</label>
                  <span>{ticket.location}</span>
                </div>
              </div>
              <div className="meta-row">
                <Clock size={16} />
                <div className="meta-content">
                  <label>Reported On</label>
                  <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="meta-row">
                <User size={16} />
                <div className="meta-content">
                  <label>Reported By</label>
                  <span>{ticket.reportedByUserId}</span>
                </div>
              </div>
              <div className="meta-row border-t">
                <Shield size={16} />
                <div className="meta-content">
                  <label>Assigned Technician</label>
                  <span>{ticket.assignedTechnicianId || 'Unassigned'}</span>
                </div>
              </div>
            </div>
          </div>

          {(canUpdateStatus || isAdmin) && (
            <div className="sidebar-card action-card">
              <h3 className="sidebar-title">Manage Ticket</h3>
              
              <div className="action-inputs">
                <label>Resolution / Rejection Notes</label>
                <textarea 
                  value={resNotes}
                  onChange={(e) => setResNotes(e.target.value)}
                  placeholder="Mandatory for RESOLVED or REJECTED..."
                ></textarea>
              </div>

              <div className="action-buttons">
                {ticket.status === 'OPEN' && canUpdateStatus && (
                  <button className="btn-prog" onClick={() => handleStatusUpdate('IN_PROGRESS')} disabled={isUpdating}>
                    <MoreHorizontal size={14} /> Start Progress
                  </button>
                )}
                {ticket.status === 'IN_PROGRESS' && canUpdateStatus && (
                  <button className="btn-res" onClick={() => handleStatusUpdate('RESOLVED')} disabled={isUpdating}>
                    <CheckCircle2 size={14} /> Resolve Ticket
                  </button>
                )}
                {ticket.status === 'RESOLVED' && isAdmin && (
                  <button className="btn-close" onClick={() => handleStatusUpdate('CLOSED')} disabled={isUpdating}>
                    <CheckCircle2 size={14} /> Close Case
                  </button>
                )}
                {ticket.status === 'OPEN' && isAdmin && (
                  <button className="btn-rej" onClick={() => handleStatusUpdate('REJECTED')} disabled={isUpdating}>
                    <XCircle size={14} /> Reject Ticket
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
