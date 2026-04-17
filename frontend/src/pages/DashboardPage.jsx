import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Ticket as TicketIcon, 
  CheckCircle, 
  Clock, 
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
      <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
        <ArrowUpRight size={14} className="mr-1" />
        {trend}
      </span>
    </div>
    <p className="text-slate-500 text-sm font-medium">{title}</p>
    <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
  </motion.div>
);

const DashboardPage = () => {
  const { user } = useAuth();

  const getRoleBasedContent = () => {
    switch(user?.role) {
      case 'ADMIN':
        return {
          title: "Administrative Overview",
          stats: [
            { title: "Total Users", value: "2,481", icon: Users, color: "bg-indigo-100 text-indigo-600", trend: "+12%" },
            { title: "Pending Bookings", value: "14", icon: Clock, color: "bg-amber-100 text-amber-600", trend: "Needs Action" },
            { title: "Active Tickets", value: "42", icon: TicketIcon, color: "bg-red-100 text-red-600", trend: "-5 slots" },
            { title: "Resource Availability", value: "88%", icon: CheckCircle, color: "bg-green-100 text-green-600", trend: "Stable" },
          ]
        };
      case 'TECHNICIAN':
        return {
          title: "Assigned Tasks",
          stats: [
            { title: "My Open Tickets", value: "8", icon: TicketIcon, color: "bg-red-100 text-red-600", trend: "High Priority" },
            { title: "Completed Today", value: "3", icon: CheckCircle, color: "bg-green-100 text-green-600", trend: "Good Pace" },
            { title: "Upcoming Inspections", value: "5", icon: Calendar, color: "bg-indigo-100 text-indigo-600", trend: "Next: 2h" },
            { title: "Response Time", value: "24m", icon: Clock, color: "bg-blue-100 text-blue-600", trend: "-10% avg" },
          ]
        };
      default: // USER
        return {
          title: "My Campus Life",
          stats: [
            { title: "My Bookings", value: "3", icon: Calendar, color: "bg-indigo-100 text-indigo-600", trend: "Next: Tomorrow" },
            { title: "Reported Issues", value: "2", icon: TicketIcon, color: "bg-amber-100 text-amber-600", trend: "1 Resolved" },
            { title: "Facility Passes", value: "Active", icon: CheckCircle, color: "bg-green-100 text-green-600", trend: "Verified" },
            { title: "Notifications", value: "5 New", icon: Clock, color: "bg-indigo-100 text-indigo-600", trend: "Unread" },
          ]
        };
    }
  };

  const content = getRoleBasedContent();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.name} 👋</h1>
          <p className="text-slate-500 font-medium">Here's what's happening on campus today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/bookings" 
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm text-sm"
          >
            My Bookings
          </Link>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 text-sm">
            <Plus size={18} /> New Request
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {content.stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Recent Activity</h3>
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View History</button>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center">
                    <Calendar size={18} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Meeting Room B Booked</p>
                    <p className="text-xs text-slate-500 mt-0.5">Approved by Admin · 2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-slate-50 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-all">
              Load More Activities
            </button>
          </div>
        </div>

        {/* Calendar / Quick Links */}
        <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <h3 className="text-xl font-bold mb-2 relative z-10">Quick Actions</h3>
          <p className="text-indigo-100 text-sm mb-6 relative z-10 opacity-80">Commonly used campus services</p>
          
          <div className="space-y-3 relative z-10">
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl transition-all border border-white/5 text-left px-4 flex justify-between items-center group">
              Report an Incident
              <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-all" />
            </button>
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl transition-all border border-white/5 text-left px-4 flex justify-between items-center group">
              View Campus Map
              <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-all" />
            </button>
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl transition-all border border-white/5 text-left px-4 flex justify-between items-center group">
              Check Lab Schedule
              <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-all" />
            </button>
          </div>

          <div className="mt-12 bg-white/10 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={18} />
              <p className="text-sm font-bold">Upcoming Event</p>
            </div>
            <p className="text-xs text-indigo-100">Annual Tech Fest 2026 starts in 3 days. Prepare your registration!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
