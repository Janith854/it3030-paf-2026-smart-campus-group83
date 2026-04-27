import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import { BarChart3, Activity, ArrowRight, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [topResources, setTopResources] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('week');

  const fetchData = async (period) => {
    setLoading(true);
    try {
      const topRes = await analyticsService.getTopResources(period);
      const peakRes = await analyticsService.getPeakHours(period);
      setTopResources(topRes || []);
      setPeakHours(peakRes || []);
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeFilter);
  }, [activeFilter]);

  if (loading) return <div className="text-muted text-sm" style={{ padding: '40px' }}>Loading Analytics...</div>;

  const maxResCount = Math.max(...topResources.map(r => r.totalBookings), 1);
  const maxHourCount = Math.max(...peakHours.map(r => r.totalBookings), 1);

  const formatHour = (hour) => {
    if (hour === 0) return '12:00 AM';
    if (hour === 12) return '12:00 PM';
    return hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
  };

  const busiestHourData = [...peakHours].sort((a,b) => b.totalBookings - a.totalBookings)[0];
  const busiestHour = busiestHourData ? formatHour(busiestHourData.hour) : 'N/A';
  const avgBookings = peakHours.length > 0 
    ? (peakHours.reduce((acc, curr) => acc + curr.totalBookings, 0) / peakHours.length).toFixed(1)
    : '0.0';

  return (
    <div className="analytics-container">
      {/* Dashboard Header */}
      <div className="analytics-header" style={{ marginBottom: '24px' }}>
        <div className="header-left">
          <h2 className="analytics-title">Campus Usage Analytics</h2>
          <p className="analytics-subtitle">Track resource demand and booking activity in real time</p>
        </div>
        <div className="filter-chips">
          {[
            { label: 'Today', value: 'today' },
            { label: 'This Week', value: 'week' },
            { label: 'This Month', value: 'month' },
          ].map(({ label, value }) => (
            <button
              key={value}
              className={`filter-chip ${activeFilter === value ? 'active' : ''}`}
              onClick={() => setActiveFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="analytics-grid">
        
        {/* Top Resources Card */}
        <div className="modern-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <div className="icon-box">
                <BarChart3 size={20} />
              </div>
              <h3 className="modern-card-title">Top Requested Resources</h3>
            </div>
            <Link to="/admin-dashboard/resource-bookings" className="view-all-link">
              View all <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px' }} />
            </Link>
          </div>

          {topResources.length === 0 ? (
            <div className="empty-state" style={{ minHeight: '200px' }}>
              <p className="empty-state-title text-muted">No booking data available.</p>
            </div>
          ) : (
            <div className="ranked-list">
              {topResources.map((res, i) => (
                <div key={i} className="ranked-item">
                  <div className="item-info">
                    <div className="item-main">
                      <span className="rank-number">#{i + 1}</span>
                      <div className="item-details">
                        <span className="item-name">{res.resourceName}</span>
                        <span className="item-meta">
                          {res.type?.replace('_', ' ')} • {res.location}
                        </span>
                      </div>
                    </div>
                    <span className="item-badge">{res.totalBookings} bookings</span>
                  </div>
                  <div className="modern-progress-bg">
                    <div 
                      className="modern-progress-fill" 
                      style={{ width: `${(res.totalBookings / maxResCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Peak Hours Card */}
        <div className="modern-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <div className="icon-box">
                <Clock size={20} />
              </div>
              <h3 className="modern-card-title">Peak Booking Hours</h3>
            </div>
            <TrendingUp size={18} style={{ color: '#2f9e8f', opacity: 0.6 }} />
          </div>

          {/* Quick Stats */}
          <div className="chart-stats">
            <div className="stat-item">
              <span className="stat-label">Busiest Hour</span>
              <span className="stat-value">{busiestHour}</span>
            </div>
            <div className="stat-item" style={{ borderLeft: '1px solid #eef4f2', paddingLeft: '32px' }}>
              <span className="stat-label">Avg Bookings/Hr</span>
              <span className="stat-value">{avgBookings}</span>
            </div>
          </div>

          {peakHours.length === 0 ? (
            <div className="empty-state" style={{ minHeight: '200px' }}>
              <p className="empty-state-title text-muted">No timing data available.</p>
            </div>
          ) : (
            <div className="heatmap-container">
              {/* Group into Morning / Afternoon / Evening */}
              {[
                { label: '🌅 Morning', range: [6, 12] },
                { label: '☀️ Afternoon', range: [12, 18] },
                { label: '🌙 Evening', range: [18, 24] },
                { label: '🌃 Night', range: [0, 6] },
              ].map(({ label, range }) => {
                const slots = peakHours.filter(ph => ph.hour >= range[0] && ph.hour < range[1]);
                if (slots.length === 0) return null;
                return (
                  <div key={label} className="heatmap-group">
                    <div className="heatmap-group-label">{label}</div>
                    <div className="heatmap-slots">
                      {slots.map((ph, i) => {
                        const pct = maxHourCount > 0 ? ph.totalBookings / maxHourCount : 0;
                        const isPeak = ph.totalBookings === maxHourCount && maxHourCount > 0;
                        const intensity = pct > 0.75 ? 'high' : pct > 0.4 ? 'mid' : 'low';
                        return (
                          <div key={i} className={`heatmap-slot ${intensity} ${isPeak ? 'peak-slot' : ''}`} title={`${formatHour(ph.hour)}: ${ph.totalBookings} bookings`}>
                            <span className="slot-time">{formatHour(ph.hour)}</span>
                            <span className="slot-count">{ph.totalBookings}</span>
                            {isPeak && <span className="slot-peak-tag">PEAK</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Admin Insight */}
              <div className="admin-insight">
                <span className="insight-icon">💡</span>
                <span>Peak demand at <strong>{busiestHour}</strong>. Consider scheduling extra resources during this window.</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AnalyticsDashboard;
