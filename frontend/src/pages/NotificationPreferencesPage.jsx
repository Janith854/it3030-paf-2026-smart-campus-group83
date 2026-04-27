import React, { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../services/api';
import './NotificationPreferencesPage.css';

const PREFERENCE_OPTIONS = [
  { key: 'bookingApproved', label: 'Booking Approved', desc: 'When admin approves your booking' },
  { key: 'bookingRejected', label: 'Booking Rejected', desc: 'When admin rejects your booking' },
  { key: 'ticketStatusChanged', label: 'Ticket Status Changed', desc: 'When your ticket status changes' },
  { key: 'newCommentOnTicket', label: 'New Comment on Ticket', desc: 'When someone comments on your ticket' },
  { key: 'technicianAssigned', label: 'Technician Assigned', desc: 'When a technician is assigned' },
  { key: 'generalAlerts', label: 'General Alerts', desc: 'System announcements' },
];

export default function NotificationPreferencesPage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const data = await usersApi.getPreferences();
        setPreferences(data);
      } catch (err) {
        console.error('Failed to fetch preferences', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const handleToggle = async (key) => {
    if (!preferences) return;
    
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    const oldPrefs = { ...preferences };
    setPreferences(newPrefs); // Optimistic update
    
    setSaving(true);
    setSaveSuccess(false);
    try {
      await usersApi.updatePreferences(newPrefs);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save preferences', err);
      // Revert on error
      setPreferences(oldPrefs);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="preferences-container" style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="preferences-container">
      <div className="preferences-header">
        <h1 className="preferences-title">Notification Preferences</h1>
        <p className="preferences-subtitle">Control how and when you receive campus updates.</p>
      </div>

      <div className="preferences-card">
        {PREFERENCE_OPTIONS.map((opt) => (
          <div className="preference-item" key={opt.key}>
            <div className="preference-info">
              <span className="preference-label">{opt.label}</span>
              <p className="preference-description">{opt.desc}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={preferences?.[opt.key] ?? true} 
                  onChange={() => handleToggle(opt.key)}
                  disabled={saving}
                />
                <span className="slider"></span>
              </label>
              <span className="toggle-status">
                {preferences?.[opt.key] ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {saveSuccess && (
        <div className="preferences-save-banner">
          <span className="save-banner-text">
            <Check size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Preferences updated successfully
          </span>
        </div>
      )}
    </div>
  );
}
