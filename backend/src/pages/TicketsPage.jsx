import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Filter, Loader2, AlertCircle } from 'lucide-react';
import { API_BASE, getAuthHeaders } from '../utils/api';
import TicketCard from '../components/TicketCard';
import Navbar from '../components/Navbar';
import TicketDetailPage from './TicketDetailPage';
import './TicketsPage.css';

const TicketsPage = ({ setPage, userRole, currentUserId }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      // Determine which endpoint to use
      const endpoint = (userRole === 'ADMIN' || userRole === 'TECHNICIAN') 
        ? `${API_BASE}/tickets` 
        : `${API_BASE}/tickets/my`;

      const res = await axios.get(endpoint, {
        headers: getAuthHeaders(),
        params: filter ? { status: filter } : {}
      });

      if (Array.isArray(res.data)) {
        setTickets(res.data);
      } else {
        setTickets([]);
      }
    } catch (err) {
      setError('Could not fetch tickets. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filter, userRole]);

  if (selectedTicketId) {
    return (
      <TicketDetailPage 
        ticketId={selectedTicketId} 
        setPage={(p) => p === 'tickets' ? setSelectedTicketId(null) : setPage(p)}
        userRole={userRole}
        currentUserId={currentUserId}
      />
    );
  }

  return (
    <div className="tickets-page-root">
      <Navbar searchQuery="" setSearchQuery={() => {}} />

      <main className="tickets-content">
        <div className="tickets-header">
          <div>
            <h1 className="page-title">Service Desk</h1>
            <p className="page-subtitle">Maintenance requests and incident reports tracker.</p>
          </div>
          <button className="report-issue-btn" onClick={() => setPage('tickets-new')}>
            <Plus size={20} />
            <span>Report Incident</span>
          </button>
        </div>

        <div className="filters-bar">
          <Filter size={16} />
          <button className={filter === '' ? 'active' : ''} onClick={() => setFilter('')}>All</button>
          <button className={filter === 'OPEN' ? 'active' : ''} onClick={() => setFilter('OPEN')}>Open</button>
          <button className={filter === 'IN_PROGRESS' ? 'active' : ''} onClick={() => setFilter('IN_PROGRESS')}>In Progress</button>
          <button className={filter === 'RESOLVED' ? 'active' : ''} onClick={() => setFilter('RESOLVED')}>Resolved</button>
          <button className={filter === 'CLOSED' ? 'active' : ''} onClick={() => setFilter('CLOSED')}>Closed</button>
        </div>

        {loading ? (
          <div className="tickets-loader">
            <Loader2 className="spinner" size={40} />
            <p>Syncing tickets...</p>
          </div>
        ) : error ? (
          <div className="tickets-error">
            <AlertCircle size={24} />
            <p>{error}</p>
            <button onClick={fetchTickets}>Try Again</button>
          </div>
        ) : tickets.length > 0 ? (
          <div className="tickets-grid">
            {tickets.map(t => (
              <TicketCard 
                key={t.id} 
                ticket={t} 
                onClick={(id) => setSelectedTicketId(id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-tickets-state">
            <h2>No cases found</h2>
            <p>Everything seems to be working perfectly. No incidents match your current filter.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default TicketsPage;
