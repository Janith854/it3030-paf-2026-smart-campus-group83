import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Building2,
  Calendar,
  Ticket,
  Users,
  Search,
  Bell,
  User,
  LayoutDashboard,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Filter,
  MapPin,
  Clock,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  ShieldAlert,
  Wrench,
  Check,
  X,
  History,
  Monitor,
  School,
  Mic,
  LogOut,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE, getAuthHeaders, jsonHeaders } from '../utils/api';

const AdminDashboard = ({ setPage, user, setUser }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // --- DUMMY DATA ---

  const [buildings, setBuildings] = useState([]);
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  const stats = [
    { label: 'Total Buildings', value: buildings.length, icon: <Building2 />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Resources', value: resources.length, icon: <Zap />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Booking Requests', value: bookings.length, icon: <Calendar />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Bookings', value: bookings.filter(b => b.status === 'PENDING').length, icon: <Clock />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Open Tickets', value: tickets.filter(t => t.status === 'OPEN').length, icon: <AlertCircle />, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Total Users', value: lecturers.length + technicians.length, icon: <Users />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  useEffect(() => {
    fetch(`${API_BASE}/resources`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setResources(data);
          // Derive unique buildings from locations
          const locs = [...new Set(data.map(r => r.location))].filter(Boolean);
          setBuildings(locs.map((loc, i) => ({ 
            id: loc, 
            name: loc, 
            code: loc.substring(0, 3).toUpperCase(), 
            resources: data.filter(r => r.location === loc).length 
          })));
        }
      }).catch(console.error);

    fetch(`${API_BASE}/bookings`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => Array.isArray(data) && setBookings(data))
      .catch(console.error);

    fetch(`${API_BASE}/tickets`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => Array.isArray(data) && setTickets(data))
      .catch(console.error);

    fetch(`${API_BASE}/users/role/LECTURER`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => Array.isArray(data) && setLecturers(data))
      .catch(console.error);

    fetch(`${API_BASE}/users/role/TECHNICIAN`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => Array.isArray(data) && setTechnicians(data))
      .catch(console.error);
  }, []);

  // --- ACTIONS ---

  const handleDeleteResource = async (id) => {
    try {
      await fetch(`${API_BASE}/resources/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      setResources(resources.filter(r => r.id !== id));
      setShowDeleteModal(false);
    } catch (err) { console.error(err); }
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updated = {
      ...selectedItem,
      name: formData.get('name'),
      capacity: formData.get('capacity'),
      status: formData.get('status')
    };
    try {
      const res = await fetch(`${API_BASE}/resources/${selectedItem.id}`, {
        method: 'PUT',
        headers: jsonHeaders(),
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      setResources(resources.map(r => r.id === selectedItem.id ? data : r));
      setShowUpdateModal(false);
    } catch (err) { console.error(err); }
  };

  const handleApproveBooking = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setBookings(bookings.map(x => x.id === id ? data : x));
    } catch (err) { console.error(err); }
  };

  const handleRejectBooking = async () => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${selectedItem.id}/reject?reason=${encodeURIComponent(rejectionReason)}`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setBookings(bookings.map(x => x.id === selectedItem.id ? data : x));
      setShowRejectModal(false);
      setRejectionReason('');
    } catch (err) { console.error(err); }
  };

  const handleAssignTicket = async (ticketId, techId) => {
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}/assign?technicianId=${techId}`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setTickets(tickets.map(x => x.id === ticketId ? data : x));
    } catch (err) { console.error(err); }
  };

  const handleAddTechnician = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTech = {
      name: formData.get('name'),
      email: formData.get('email'),
      spec: formData.get('spec'),
      empId: formData.get('empId')
    };
    try {
      const res = await fetch(`${API_BASE}/technicians`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify(newTech)
      });
      const data = await res.json();
      setTechnicians([...technicians, data]);
      e.target.reset();
    } catch (err) { console.error(err); }
  };

  const removeLecturer = async (id) => {
    try {
      await fetch(`${API_BASE}/lecturers/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      setLecturers(lecturers.filter(l => l.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleApproveTech = async (id) => {
    try {
      await fetch(`${API_BASE}/technicians/${id}/status`, {
        method: 'PATCH',
        headers: jsonHeaders(),
        body: JSON.stringify("APPROVED")
      });
      setTechnicians(technicians.map(t => t.id === id ? { ...t, status: 'APPROVED' } : t));
    } catch (err) { console.error(err); }
  };

  const handleRejectTech = async (id) => {
    try {
      await fetch(`${API_BASE}/technicians/${id}/status`, {
        method: 'PATCH',
        headers: jsonHeaders(),
        body: JSON.stringify("REJECTED")
      });
      setTechnicians(technicians.map(t => t.id === id ? { ...t, status: 'REJECTED' } : t));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 flex flex-col z-30 shadow-sm">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <ShieldAlert size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Admin<span className="text-indigo-600">Portal</span></h1>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'Overview', icon: <LayoutDashboard size={18} /> },
              { id: 'Catalog', icon: <Building2 size={18} /> },
              { id: 'Bookings', icon: <Calendar size={18} /> },
              { id: 'Ticketing', icon: <Ticket size={18} /> },
              { id: 'Approve Techs', icon: <CheckCircle2 size={18} /> },
              { id: 'Users', icon: <Users size={18} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedBuilding(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-600 font-bold shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                {tab.icon}
                <span className="text-sm">{tab.id}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-gray-50 flex flex-col p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <User size={18} className="text-gray-400" />
            </div>
            <div>
              <p className="text-xs font-bold">{user || 'Admin User'}</p>
              <p className="text-[10px] text-gray-400">System Administrator</p>
            </div>
          </div>
          <button
            onClick={() => { if (setUser) setUser(null); if (setPage) setPage('login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 min-w-[400px]">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Search resources, users, tickets..." className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-all border border-gray-100 shadow-sm relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <User size={20} />
            </div>
          </div>
        </header>

        {/* Dynamic Title */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">{activeTab}</h2>
            <p className="text-sm text-gray-400 mt-1">Management dashboard for university facilities and users.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
              <History size={14} /> Log History
            </button>
            <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-indigo-100">
              Generate Report
            </button>
            <button
              onClick={() => setPage && setPage('addresources')}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
            >
              <Plus size={14} /> Add Resources
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* 1. OVERVIEW */}
            {activeTab === 'Overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                  {stats.map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-4`}>
                        {s.icon}
                      </div>
                      <p className="text-2xl font-black">{s.value}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h3 className="font-bold mb-6 flex items-center justify-between">
                      Recent Activity
                      <button className="text-indigo-600 text-[10px] uppercase font-bold tracking-widest">View All</button>
                    </h3>
                    <div className="space-y-6">
                      {[
                        { title: 'New Booking Request', desc: 'Dr. Alan Turing reserved Robotics Lab', time: '5 mins ago', color: 'bg-green-500' },
                        { title: 'Ticket Assigned', desc: 'TC-902 assigned to Tech. Robert Smith', time: '20 mins ago', color: 'bg-blue-500' },
                        { title: 'Resource Updated', desc: 'Main Meeting Room status changed', time: '1 hour ago', color: 'bg-orange-500' },
                      ].map((act, i) => (
                        <div key={i} className="flex gap-4 items-start pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                          <div className={`w-2.5 h-2.5 rounded-full mt-2 ${act.color} ring-4 ring-gray-100`}></div>
                          <div>
                            <p className="text-sm font-bold">{act.title}</p>
                            <p className="text-xs text-gray-400 mt-1">{act.desc}</p>
                            <span className="text-[10px] text-indigo-400 font-medium mt-2 block">{act.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
                      <BarChart3 size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Usage Analysis</h3>
                    <p className="text-sm text-gray-400 max-w-xs mx-auto mb-8">Detailed utility analytics will be visible once more data is aggregated.</p>
                    <div className="flex gap-4 w-full px-12">
                      <div className="flex-1 h-32 bg-gray-50 rounded-2xl flex items-end p-2 gap-1 justify-center">
                        <div className="w-4 h-1/2 bg-indigo-200 rounded-t-sm"></div>
                        <div className="w-4 h-3/4 bg-indigo-400 rounded-t-sm"></div>
                        <div className="w-4 h-1/3 bg-indigo-600 rounded-t-sm"></div>
                        <div className="w-4 h-full bg-indigo-500 rounded-t-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. CATALOG */}
            {activeTab === 'Catalog' && (
              <div className="space-y-8">
                {selectedBuilding ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-4 mb-8">
                      <button onClick={() => setSelectedBuilding(null)} className="p-2 hover:bg-white rounded-xl transition-all">
                        <ChevronRight size={20} className="rotate-180" />
                      </button>
                      <h3 className="text-xl font-bold">{selectedBuilding.name} - Resources</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {resources.filter(r => r.buildingId === selectedBuilding.id).map(r => (
                        <div key={r.id} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm group">
                          <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                              {r.type === 'Lecture Hall' ? <School size={24} /> : r.type === 'Lab Room' ? <Monitor size={24} /> : <Users size={24} />}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${r.status === 'AVAILABLE' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                              {r.status}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold mb-1">{r.name}</h4>
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-6">{r.type} | Floor {r.floor}</p>

                          <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-50 p-3 rounded-2xl text-center">
                              <p className="text-[10px] font-bold text-gray-400 mb-1">CAPACITY</p>
                              <p className="text-sm font-bold tracking-tight">{r.capacity}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-2xl text-center">
                              <p className="text-[10px] font-bold text-gray-400 mb-1">WINDOWS</p>
                              <p className="text-sm font-bold tracking-tight">{r.windows}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => { setSelectedItem(r); setShowUpdateModal(true); }}
                              className="flex-1 bg-gray-900 text-white font-bold py-3.5 rounded-2xl text-xs hover:bg-gray-800 transition-all"
                            >
                              Update Details
                            </button>
                            <button
                              onClick={() => { setSelectedItem(r); setShowDeleteModal(true); }}
                              className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {buildings.map(b => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBuilding(b)}
                        className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                      >
                        <div className="w-16 h-16 bg-gray-50 rounded-[2rem] flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all mb-8 shadow-inner">
                          <Building2 size={24} />
                        </div>
                        <h3 className="text-lg font-bold mb-1">{b.name}</h3>
                        <p className="text-xs text-gray-400 font-bold mb-10 tracking-wider">CODE: {b.code}</p>

                        <div className="flex items-center justify-between border-t border-gray-50 pt-6">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-[10px] font-bold text-gray-300">RESOURCES</p>
                              <p className="font-extrabold text-sm">{b.resources}</p>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full border border-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-all">
                            <ChevronRight size={18} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. BOOKINGS */}
            {activeTab === 'Bookings' && (
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-3">
                    <ShieldAlert size={18} className="text-indigo-600" />
                    Pending Requests
                  </h3>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-bold tracking-widest uppercase shadow-sm">Filter Status</button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold tracking-widest uppercase shadow-lg shadow-indigo-100">Export CSV</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white">
                        <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lecturer & ID</th>
                        <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resource</th>
                        <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Schedule</th>
                        <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Refer. Logic</th>
                        <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {bookings.map(b => (
                        <tr key={b.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-bold text-xs">{b.lecturer ? b.lecturer.charAt(0) : 'U'}</div>
                              <div>
                                <p className="text-sm font-bold">{b.lecturer}</p>
                                <p className="text-[10px] text-gray-400 font-medium">#{b.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-sm font-bold">{b.resource}</p>
                            <p className="text-[10px] text-gray-400">{b.building}</p>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold">{b.date}</span>
                              <span className="text-[10px] text-indigo-400 font-bold">{b.time}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-tight border ${b.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                              b.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' :
                                'bg-red-50 text-red-600 border-red-100'
                              }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2 group-hover:scale-105 transition-transform cursor-help">
                              <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase">Conflict Free</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            {b.status === 'PENDING' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproveBooking(b.id)}
                                  className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                >
                                  <Check size={16} strokeWidth={3} />
                                </button>
                                <button
                                  onClick={() => { setSelectedItem(b); setShowRejectModal(true); }}
                                  className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                >
                                  <X size={16} strokeWidth={3} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-gray-300 uppercase italic">Decision Logged</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. TICKETING */}
            {activeTab === 'Ticketing' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tickets.map(t => (
                  <div key={t.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.03] transition-transform duration-700 group-hover:scale-150 rotate-12 -mt-10 -mr-10`}>
                      <Ticket size={128} />
                    </div>

                    <div className="flex justify-between items-center mb-8 relative z-10">
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${t.priority === 'URGENT' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                        {t.priority}
                      </div>
                      <span className="text-xs font-bold text-gray-300">#{t.id}</span>
                    </div>

                    <h4 className="text-xl font-black mb-2 text-gray-900">{t.issue}</h4>
                    <p className="text-xs text-gray-400 font-bold mb-10 flex items-center gap-2">
                      <MapPin size={12} className="text-indigo-400" />
                      {t.resource}
                    </p>

                    <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <User size={14} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-300 uppercase leading-none mb-1">Lecturer</p>
                          <p className="text-xs font-bold">{t.lecturer}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <Wrench size={14} className="text-indigo-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-300 uppercase leading-none mb-1">Assigned Tech</p>
                          <p className="text-xs font-bold text-indigo-600">{t.assignedTo || 'Unassigned'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <select
                        onChange={(e) => handleAssignTicket(t.id, e.target.value)}
                        className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl text-xs outline-none cursor-pointer appearance-none px-6 shadow-xl shadow-gray-200"
                        defaultValue={t.assignedTo || ""}
                      >
                        <option value="" disabled>Assign Technician...</option>
                        {technicians.map(tech => (
                          <option key={tech.id} value={tech.name}>{tech.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                        <ChevronRight size={14} className="rotate-90" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5. APPROVE TECHS */}
            {activeTab === 'Approve Techs' && (
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                  <h3 className="font-bold flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-indigo-600" />
                    Pending Technician Requests
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white">
                        <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Technician</th>
                        <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Specialization</th>
                        <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Emp ID</th>
                        <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {technicians.filter(t => t.status === 'PENDING').map(t => (
                        <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                                <Wrench size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-bold">{t.name}</p>
                                <p className="text-xs text-gray-400">{t.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm font-medium">{t.spec}</td>
                          <td className="px-8 py-6 text-sm font-black text-gray-300">{t.empId}</td>
                          <td className="px-8 py-6">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveTech(t.id)}
                                className="px-4 py-2 bg-green-50 text-green-600 rounded-xl font-bold text-[10px] uppercase hover:bg-green-600 hover:text-white transition-all shadow-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectTech(t.id)}
                                className="px-4 py-2 bg-red-50 text-red-500 rounded-xl font-bold text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {technicians.filter(t => t.status === 'PENDING').length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-8 py-10 text-center text-gray-400 text-sm">No pending technician requests.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. USERS */}
            {activeTab === 'Users' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                  {/* Technician List */}
                  <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10">
                    <h3 className="text-xl font-bold mb-8">Registered Technicians</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {technicians.map(tech => (
                        <div key={tech.id} className="p-6 bg-gray-50/50 rounded-3xl border border-gray-50 hover:border-indigo-100 transition-all group">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                              <Wrench size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{tech.name}</p>
                              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{tech.spec}</p>
                            </div>
                          </div>
                          <div className="space-y-1 ml-16">
                            <p className="text-[10px] text-gray-400 font-medium">{tech.email}</p>
                            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{tech.empId}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lecturer Table */}
                  <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                      <h3 className="font-bold">University Lecturers</h3>
                    </div>
                    <div className="overflow-x-auto px-4 pb-4">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-white">
                            <th className="px-6 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</th>
                            <th className="px-6 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dept.</th>
                            <th className="px-6 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Emp ID</th>
                            <th className="px-6 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {lecturers.map(l => (
                            <tr key={l.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-5">
                                <p className="text-sm font-bold">{l.name}</p>
                                <p className="text-[10px] text-gray-300 font-medium">{l.email}</p>
                              </td>
                              <td className="px-6 py-5">
                                <span className="text-xs font-bold text-indigo-500">{l.dept}</span>
                              </td>
                              <td className="px-6 py-5">
                                <span className="text-xs font-black text-gray-300">{l.empId}</span>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <button onClick={() => removeLecturer(l.id)} className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 lg:sticky lg:top-8 hidden">
                  {/* "New Technician" functionality removed based on request */}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* --- MODALS --- */}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 bg-transparent">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl overflow-hidden border border-gray-100">
            <h3 className="text-xl font-bold mb-2">Rejection Reason</h3>
            <p className="text-sm text-gray-400 mb-8">Please provide a valid reason for rejecting Dr. John von Neumann's request.</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Schedule Conflict, Maintenance Scheduled..."
              className="w-full bg-gray-50 border border-gray-50 rounded-2xl p-6 outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all text-sm font-medium h-40 resize-none mb-8"
            ></textarea>
            <div className="flex gap-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-4 text-xs font-bold text-gray-400 hover:text-gray-900 transition-all"
              >
                Go Back
              </button>
              <button
                onClick={handleRejectBooking}
                disabled={!rejectionReason}
                className="flex-1 bg-red-600 text-white font-bold py-4 rounded-2xl text-xs hover:bg-red-700 transition-all shadow-xl shadow-red-100 disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Update Resource Modal */}
      {showUpdateModal && selectedItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 bg-transparent">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl border border-gray-100">
            <h3 className="text-xl font-bold mb-8">Update Resource</h3>
            <form onSubmit={handleUpdateResource} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Resource Name</label>
                <input required name="name" defaultValue={selectedItem.name} className="w-full bg-gray-50 border border-gray-50 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-bold text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Seat Capacity</label>
                <input required name="capacity" type="number" defaultValue={selectedItem.capacity} className="w-full bg-gray-50 border border-gray-50 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-bold text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Current Status</label>
                <select name="status" defaultValue={selectedItem.status} className="w-full bg-gray-50 border border-gray-50 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-bold text-sm">
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="OCCUPIED">OCCUPIED</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowUpdateModal(false)} className="flex-1 py-4 text-xs font-bold text-gray-400">Cancel</button>
                <button type="submit" className="flex-1 bg-gray-900 text-white font-bold py-4 rounded-2xl text-xs hover:bg-opacity-90 transition-all">Save Changes</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete/Remove Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 bg-transparent">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 shadow-2xl text-center border border-gray-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Permanent Action</h3>
            <p className="text-sm text-gray-400 mb-10">Are you sure you want to remove this record from the system? This cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-4 text-xs font-bold text-gray-400"
              >
                No, Keep it
              </button>
              <button
                onClick={() => handleDeleteResource(selectedItem.id)}
                className="flex-1 bg-red-600 text-white font-bold py-4 rounded-2xl text-xs shadow-xl shadow-red-100"
              >
                Yes, Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
