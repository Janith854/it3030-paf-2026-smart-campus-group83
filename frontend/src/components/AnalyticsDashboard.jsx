import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import { BarChart3, Activity } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [topResources, setTopResources] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const topRes = await analyticsService.getTopResources();
        const peakRes = await analyticsService.getPeakHours();
        setTopResources(topRes || []);
        setPeakHours(peakRes || []);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-muted text-sm" style={{ padding: '20px' }}>Loading Analytics...</div>;

  const maxResCount = Math.max(...topResources.map(r => r.totalBookings), 1);
  const maxHourCount = Math.max(...peakHours.map(r => r.totalBookings), 1);

  return (
    <>
      <div className="page-header" style={{ marginTop: '2rem' }}>
        <div>
          <h2 className="page-title">Campus Usage Analytics</h2>
          <p className="page-subtitle">Visual overview of resource utilization</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Top Resources Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex-gap">
              <BarChart3 size={16} className="text-primary" />
              Top Requested Resources
            </h2>
          </div>
          {topResources.length === 0 ? (
            <div className="empty-state" style={{ minHeight: '150px' }}>
              <p className="empty-state-title text-muted">No booking data available.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
              {topResources.map((res, i) => (
                <div key={i}>
                  <div className="flex-between mb-1">
                    <span className="font-medium text-sm">Resource ID: {res.resourceId}</span>
                    <span className="badge badge-active">{res.totalBookings} Bookings</span>
                  </div>
                  <div style={{ background: 'var(--primary-wash)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${(res.totalBookings / maxResCount) * 100}%`, 
                      background: 'var(--primary)', 
                      height: '100%',
                      transition: 'width 1s ease-in-out'
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Peak Hours Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex-gap">
              <Activity size={16} className="text-primary" />
              Peak Booking Hours
            </h2>
          </div>
          {peakHours.length === 0 ? (
             <div className="empty-state" style={{ minHeight: '150px' }}>
               <p className="empty-state-title text-muted">No timing data available.</p>
             </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '8px', marginTop: '20px', borderBottom: '1px solid var(--border)' }}>
              {peakHours.map((ph, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                  <span className="text-sm font-medium" style={{ marginBottom: '4px' }}>{ph.totalBookings}</span>
                  <div style={{ 
                    width: '100%', 
                    background: 'var(--primary)', 
                    height: `${(ph.totalBookings / maxHourCount) * 140}px`,
                    borderRadius: '4px 4px 0 0',
                    minHeight: ph.totalBookings > 0 ? '4px' : '0',
                    transition: 'height 1s ease-in-out'
                  }}></div>
                  <span className="text-muted" style={{ fontSize: '11px', marginTop: '4px' }}>
                    {ph.hour}:00
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default AnalyticsDashboard;
