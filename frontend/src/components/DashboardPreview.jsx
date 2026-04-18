import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Ticket, CalendarCheck, Activity } from 'lucide-react';
import './DashboardPreview.css';

const stats = [
  { label: 'Total Bookings', value: '1,284', change: '+18%', icon: <CalendarCheck size={20} />, color: '#3B82F6' },
  { label: 'Active Tickets', value: '47', change: '+3 today', icon: <Ticket size={20} />, color: '#F59E0B' },
  { label: 'Resolved This Week', value: '89', change: '98.2%', icon: <Activity size={20} />, color: '#10B981' },
  { label: 'Active Users', value: '342', change: '+24', icon: <Users size={20} />, color: '#6366F1' },
];

const barData = [55, 72, 88, 62, 95, 78, 84, 91, 68, 79, 93, 86];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DashboardPreview() {
  return (
    <section className="section section-surface dashboard-preview" id="dashboard">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label light">
            <span className="section-badge-dot" style={{ background: '#2563EB' }} />
            Analytics Dashboard
          </div>
          <h2 className="section-title" style={{ color: '#0F172A' }}>
            Full Visibility Into <span style={{ color: '#2563EB' }}>Campus Operations</span>
          </h2>
          <p className="section-subtitle dark">
            Real-time analytics, booking trends, maintenance KPIs, and user activity — all in one admin view.
          </p>
        </motion.div>

        <motion.div
          className="dashboard-mockup"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          id="dashboard-mockup"
        >
          {/* Top bar */}
          <div className="dashboard-mockup__topbar">
            <div className="dashboard-mockup__dots"><span /><span /><span /></div>
            <span className="dashboard-mockup__title">
              <BarChart3 size={14} /> Admin Analytics Dashboard
            </span>
            <span className="dashboard-mockup__date">April 2026</span>
          </div>

          {/* Stat Cards */}
          <div className="dashboard-mockup__stats">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                className="dashboard-mockup__stat-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                id={`dash-stat-${i}`}
              >
                <div className="dashboard-mockup__stat-header">
                  <div className="dashboard-mockup__stat-icon" style={{ background: `${s.color}15`, color: s.color }}>
                    {s.icon}
                  </div>
                  <span className="dashboard-mockup__stat-change">
                    <TrendingUp size={12} /> {s.change}
                  </span>
                </div>
                <div className="dashboard-mockup__stat-value">{s.value}</div>
                <div className="dashboard-mockup__stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Chart */}
          <div className="dashboard-mockup__chart-section">
            <div className="dashboard-mockup__chart-header">
              <span className="dashboard-mockup__chart-title">Monthly Booking Trend</span>
              <div className="dashboard-mockup__chart-legend">
                <span className="dashboard-mockup__legend-dot" style={{ background: '#3B82F6' }} />
                <span>Bookings</span>
              </div>
            </div>
            <div className="dashboard-mockup__chart">
              {barData.map((h, i) => (
                <div key={i} className="dashboard-mockup__chart-col">
                  <div
                    className="dashboard-mockup__bar"
                    style={{ height: `${h}%` }}
                  />
                  <span className="dashboard-mockup__bar-label">{months[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent table */}
          <div className="dashboard-mockup__table">
            <div className="dashboard-mockup__table-header">Recent Bookings</div>
            {[
              { resource: 'Lecture Hall A', user: 'Dr. Sarah Chen', time: 'Today 10:00', status: 'approved' },
              { resource: 'Computer Lab 2', user: 'Prof. James Roe', time: 'Today 14:00', status: 'pending' },
              { resource: 'Seminar Room B', user: 'Ms. Priya K.', time: 'Yesterday 09:00', status: 'rejected' },
            ].map((row, i) => (
              <div className="dashboard-mockup__table-row" key={i}>
                <span className="dashboard-mockup__table-resource">{row.resource}</span>
                <span className="dashboard-mockup__table-user">{row.user}</span>
                <span className="dashboard-mockup__table-time">{row.time}</span>
                <span className={`badge badge-${row.status}`}>
                  {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
