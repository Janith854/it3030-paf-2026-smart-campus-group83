import React from 'react';
import { AlertTriangle } from 'lucide-react';
import './ConflictAlert.css';

const ConflictAlert = ({ message }) => {
  if (!message) return null;

  return (
    <div className="conflict-alert-container">
      <div className="conflict-alert-icon">
        <AlertTriangle size={24} />
      </div>
      <div className="conflict-alert-content">
        <h4>Time Slot Conflict</h4>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default ConflictAlert;
