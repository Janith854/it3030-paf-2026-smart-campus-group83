import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';

const AnalyticsDashboard = () => {
  const [topResources, setTopResources] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const topRes = await analyticsService.getTopResources();
        const peakRes = await analyticsService.getPeakHours();
        setTopResources(topRes);
        setPeakHours(peakRes);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading Analytics...</div>;

  const maxResCount = Math.max(...topResources.map(r => r.totalBookings), 1);
  const maxHourCount = Math.max(...peakHours.map(r => r.totalBookings), 1);

  return (
    <div style={{ padding: '24px', fontFamily: '"Inter", sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>
        Campus Usage Analytics
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Top Resources Card */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '20px' }}>
            Top Requested Resources
          </h3>
          {topResources.map((res, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px', color: '#4B5563', fontWeight: '500' }}>Resource ID: {res.resourceId}</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>{res.totalBookings}</span>
              </div>
              <div style={{ background: '#E5E7EB', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${(res.totalBookings / maxResCount) * 100}%`, 
                  background: 'linear-gradient(90deg, #4F46E5 0%, #3B82F6 100%)', 
                  height: '100%',
                  borderRadius: '4px',
                  transition: 'width 1s ease-in-out'
                }}></div>
              </div>
            </div>
          ))}
          {topResources.length === 0 && <p style={{ color: '#6B7280', fontSize: '14px' }}>No booking data available.</p>}
        </div>

        {/* Peak Hours Card */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '20px' }}>
            Peak Booking Hours
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '220px', gap: '12px', marginTop: '20px', borderBottom: '2px solid #E5E7EB' }}>
            {peakHours.map((ph, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>{ph.totalBookings}</span>
                <div style={{ 
                  width: '100%', 
                  background: 'linear-gradient(180deg, #10B981 0%, #34D399 100%)', 
                  height: `${(ph.totalBookings / maxHourCount) * 180}px`,
                  borderRadius: '4px 4px 0 0',
                  minHeight: ph.totalBookings > 0 ? '4px' : '0',
                  transition: 'height 1s ease-in-out'
                }}></div>
                <span style={{ fontSize: '10px', color: '#6B7280', marginTop: '8px', transform: 'rotate(-45deg)', transformOrigin: 'top left' }}>
                  {ph.hour}:00
                </span>
              </div>
            ))}
            {peakHours.length === 0 && <p style={{ alignSelf: 'center', margin: 'auto', color: '#6B7280', fontSize: '14px' }}>No timing data available.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
