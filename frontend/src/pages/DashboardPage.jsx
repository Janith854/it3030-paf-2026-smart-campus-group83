import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Ticket as TicketIcon, 
  CheckCircle, 
  Clock, 
  ArrowUpRight,
  Plus,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const StatCard = ({ title, value, icon: Icon, color, trend, trendColor = "text-green-600", trendBg = "bg-green-50" }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} shadow-sm`}>
        <Icon size={24} />
      </div>
      <span className={`flex items-center text-[10px] font-black ${trendColor} ${trendBg} px-2 py-1 rounded-lg uppercase tracking-wider`}>
        {trend}
      </span>
    </div>
    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{title}</p>
    <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{value}</h3>
  </motion.div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    bookings: 0,
    tickets: 0,
    notifications: 0,
    activeUsers: 0,
    pendingBookings: 0,
    openTickets: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch Notifications for Recent Activity
        const notifRes = await api.get('/notifications');
        setRecentActivity(notifRes.data.slice(0, 5));
        
        const unreadRes = await api.get('/notifications/unread-count');
        
        if (user.role === 'ADMIN') {
          const [usersRes, bookingsRes, ticketsRes] = await Promise.all([
            api.get('/users'),
            api.get('/bookings'),
            api.get('/tickets')
          ]);
          setStats({
            activeUsers: usersRes.data.length,
            pendingBookings: bookingsRes.data.filter(b => b.status === 'PENDING').length,
            openTickets: ticketsRes.data.filter(t => t.status === 'OPEN').length,
            notifications: unreadRes.data.count,
            bookings: bookingsRes.data.length,
            tickets: ticketsRes.data.length
          });
        } else if (user.role === 'TECHNICIAN') {
          const ticketsRes = await api.get('/tickets');
          const myTickets = ticketsRes.data.filter(t => t.assignedTechnicianId === user.id);
          setStats({
            tickets: myTickets.length,
            openTickets: myTickets.filter(t => t.status === 'IN_PROGRESS').length,
            notifications: unreadRes.data.count,
            resolved: myTickets.filter(t => t.status === 'RESOLVED').length
          });
        } else {
          // LECTURER
          const [bookingsRes, ticketsRes] = await Promise.all([
            api.get('/bookings/my'),
            api.get('/tickets/my')
          ]);
          setStats({
            bookings: bookingsRes.data.length,
            tickets: ticketsRes.data.length,
            notifications: unreadRes.data.count,
            upcoming: bookingsRes.data.filter(b => b.status === 'APPROVED').length
          });
        }
      } catch (error) {
        console.error('Dashboard data fetch failed', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getRoleBasedStats = () => {
    if (user.role === 'ADMIN') {
      return [
        { title: "Global Users", value: stats.activeUsers, icon: Users, color: "bg-indigo-50 text-indigo-600", trend: "Live", trendColor: "text-blue-600", trendBg: "bg-blue-50" },
        { title: "Pending Reviews", value: stats.pendingBookings, icon: Clock, color: "bg-amber-50 text-amber-600", trend: "Critical", trendColor: "text-amber-600", trendBg: "bg-amber-50" },
        { title: "Open Incidents", value: stats.openTickets, icon: TicketIcon, color: "bg-red-50 text-red-600", trend: "Active", trendColor: "text-red-600", trendBg: "bg-red-50" },
        { title: "New Alerts", value: stats.notifications, icon: AlertCircle, color: "bg-emerald-50 text-emerald-600", trend: "Unread", trendColor: "text-emerald-600", trendBg: "bg-emerald-50" },
      ];
    } else if (user.role === 'TECHNICIAN') {
       return [
        { title: "Assigned To Me", value: stats.tickets, icon: TicketIcon, color: "bg-indigo-50 text-indigo-600", trend: "Jobs", trendColor: "text-indigo-600", trendBg: "bg-indigo-50" },
        { title: "Active Repair", value: stats.openTickets, icon: Clock, color: "bg-blue-50 text-blue-600", trend: "Action", trendColor: "text-blue-600", trendBg: "bg-blue-50" },
        { title: "Resolved Tasks", value: stats.resolved || 0, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600", trend: "Points", trendColor: "text-emerald-600", trendBg: "bg-emerald-50" },
        { title: "Team Alerts", value: stats.notifications, icon: AlertCircle, color: "bg-amber-50 text-amber-600", trend: "Sync", trendColor: "text-amber-600", trendBg: "bg-amber-50" },
      ];
    } else {
      return [
        { title: "My Bookings", value: stats.bookings, icon: Calendar, color: "bg-indigo-50 text-indigo-600", trend: "Total", trendColor: "text-indigo-600", trendBg: "bg-indigo-50" },
        { title: "Support Tickets", value: stats.tickets, icon: TicketIcon, color: "bg-amber-50 text-amber-600", trend: "Active", trendColor: "text-amber-600", trendBg: "bg-amber-50" },
        { title: "Approved Slots", value: stats.upcoming || 0, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600", trend: "Ready", trendColor: "text-emerald-600", trendBg: "bg-emerald-50" },
        { title: "Unread Alerts", value: stats.notifications, icon: Clock, color: "bg-red-50 text-red-600", trend: "Action", trendColor: "text-red-600", trendBg: "bg-red-50" },
      ];
    }
  };

  const statCards = getRoleBasedStats();

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            CONTROL CENTER <span className="text-indigo-600">/</span> {user?.name?.toUpperCase()}
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Operational Hub Alpha v1.0.4</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/bookings" 
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 text-slate-700 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
          >
            Manage Data
          </Link>
          <Link 
            to="/tickets"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
          >
            <Plus size={18} strokeWidth={3} /> Submit Record
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-50 shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">System Event Log</h3>
            <Link to="/notifications" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors">Clear Log</Link>
          </div>
          <div className="p-8">
            <div className="space-y-8">
              {recentActivity.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-bold italic">No recent system events detected.</div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-5 group items-start">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-300">
                      <Calendar size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 border-b border-slate-50 pb-6 group-last:border-0">
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{activity.title}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed line-clamp-1">{activity.message}</p>
                      <span className="inline-block text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-3 bg-indigo-50 px-2 py-0.5 rounded-lg">
                        {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {recentActivity.length > 0 && (
              <button className="w-full mt-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl">
                ACCESS FULL REPOSITORY
              </button>
            )}
          </div>
        </div>

        {/* Global Quick Connect */}
        <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          
          <h3 className="text-2xl font-black mb-1 relative z-10 tracking-tighter uppercase">Quick-Connect</h3>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 relative z-10 opacity-60">System Core Shortcuts</p>
          
          <div className="space-y-4 relative z-10">
            <Link to="/tickets" className="flex w-full py-4 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all border border-white/5 px-6 justify-between items-center group">
              Report Incident
              <ArrowUpRight size={18} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </Link>
            <Link to="/facilities" className="flex w-full py-4 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all border border-white/5 px-6 justify-between items-center group">
              Reserve Lab
              <ArrowUpRight size={18} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </Link>
            <Link to="/profile" className="flex w-full py-4 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all border border-white/5 px-6 justify-between items-center group">
              Security Settings
              <ArrowUpRight size={18} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </Link>
          </div>

          <div className="mt-16 bg-white/5 rounded-[1.5rem] p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
               <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Calendar size={18} />
               </div>
               <p className="text-xs font-black uppercase tracking-widest">Global Broadcast</p>
            </div>
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase">The smart campus network will undergo maintenance at 22:00 IST. Limited connectivity expected.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
