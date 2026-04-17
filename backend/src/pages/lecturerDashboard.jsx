import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Ticket,
  LogOut,
  Search,
  Bell,
  User,
  Plus,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  MapPin,
  Users,
  Video,
  Camera,
  Monitor,
  Zap,
  Mic,
  Cpu,
  Wifi,
  Settings2,
  School,
  Layers,
  Filter,
  Eraser,
  MessageSquare,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE, getAuthHeaders, jsonHeaders } from '../utils/api';

const StatusBadge = ({ status }) => {
  const styles = {
    'APPROVED': 'bg-green-50 text-green-600 border-green-100',
    'PENDING': 'bg-amber-50 text-amber-600 border-amber-100',
    'REJECTED': 'bg-red-50 text-red-600 border-red-100',
    'CANCELLED': 'bg-gray-50 text-gray-500 border-gray-100'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${styles[status] || styles['PENDING']}`}>
      {status}
    </span>
  );
};

const getResourceIcon = (type) => {
  switch (type?.toUpperCase()) {
    case 'LAB ROOM': return <Cpu size={24} />;
    case 'LECTURE HALL': return <BookOpen size={24} />;
    case 'MEETING ROOM': return <Zap size={24} />;
    default: return <LayoutDashboard size={24} />;
  }
};

const lecturerDashboard = ({ setPage, user, setUser }) => {
  const [activeTab, setActiveTab] = useState('Booking Resources');
  const [showSuccess, setShowSuccess] = useState(false);
  const [tickets, setTickets] = useState([]);

  // Dynamic Data
  const [myBookings, setMyBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [buildings, setBuildings] = useState([]);

  // Filter State
  const [filters, setFilters] = useState({
    buildingId: '',
    capacityRange: '',
    windowRange: '',
    hallCategory: '',
    facility: '',
    date: new Date().toISOString().split('T')[0],
    selectedSlots: []
  });

  const timeSlots = [
    '8.00 A.M- 9.00 A.M', '9.00 A.M- 10.00 A.M', '10.00 A.M- 11.00 A.M',
    '11.00 A.M- 12.00 P.M', '12.00 P.M- 1.00 P.M', '1.00 P.M- 2.00 P.M',
    '2.00 P.M- 3.00 P.M', '3.00 P.M- 4.00 P.M', '4.00 P.M- 5.00 P.M',
    '5.00 P.M- 6.00 P.M', '6.00 P.M- 7.00 P.M', '7.00 P.M- 8.00 P.M'
  ];

  // Catalog State
  const [searchQuery, setSearchQuery] = useState('');


  // Combined Filtered Resources
  const filteredResources = resources.filter(res => {
    // Search Query filter
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.type.toLowerCase().includes(searchQuery.toLowerCase());

    // Building filter
    const matchesBuilding = !filters.buildingId || res.buildingId === filters.buildingId;

    // Capacity filter
    let matchesCapacity = true;
    if (filters.capacityRange) {
      const [min, max] = filters.capacityRange.split('-').map(Number);
      matchesCapacity = res.capacity >= min && res.capacity <= max;
    }

    // Window filter
    let matchesWindow = true;
    if (filters.windowRange) {
      const [min, max] = filters.windowRange.split('-').map(Number);
      matchesWindow = res.windows >= min && res.windows <= max;
    }

    // Hall Category filter
    const matchesCategory = !filters.hallCategory || res.type === filters.hallCategory;

    // Facility filter
    const matchesFacility = !filters.facility ||
      res.features?.trim().toLowerCase() === filters.facility.trim().toLowerCase();

    return matchesSearch && matchesBuilding && matchesCapacity && matchesWindow && matchesCategory && matchesFacility;
  });


  const handleBookResource = async (res) => {
    const newBooking = {
      resource: res.name,
      date: new Date().toISOString().split('T')[0],
      time: '10:30 A.M - 12:30 P.M',
      purpose: 'For Lecture',
      status: 'PENDING',
      lecturer: user || 'Guest Lecturer'
    };
    try {
      const response = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify(newBooking)
      });
      const data = await response.json();
      setMyBookings([data, ...myBookings]);
      setActiveTab('My Bookings');
    } catch (err) { console.error(err); }
  };


  useEffect(() => {
    fetch(`${API_BASE}/bookings/my`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => Array.isArray(data) && setMyBookings(data))
      .catch(console.error);

    fetch(`${API_BASE}/resources`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setResources(data);
          // Derive unique buildings from locations
          const locs = [...new Set(data.map(r => r.location))].filter(Boolean);
          setBuildings(locs.map((loc, i) => ({ id: loc, name: loc })));
        }
      }).catch(console.error);

    fetch(`${API_BASE}/tickets/my`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => Array.isArray(data) && setTickets(data))
      .catch(console.error);
  }, []);

  const getResourceIcon = (type) => {
    if (type === 'Lecture Hall') return <School size={24} />;
    if (type === 'Lab Room') return <Monitor size={24} />;
    if (type === 'Meeting Room') return <Mic size={24} />;
    return <Zap size={24} />;
  };

  const handleCancelBooking = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setMyBookings(myBookings.map(b => b.id === id ? data : b));
    } catch (err) { console.error(err); }
  };

  const handleRaiseTicket = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTicket = {
      lecturer: formData.get('lecturer'),
      course: formData.get('course'),
      resource: formData.get('hall'),
      category: formData.get('category'),
      issue: formData.get('issueTitle'),
      issueDesc: formData.get('issueDesc'),
      priority: formData.get('priority'),
      status: 'OPEN'
    };
    try {
      const res = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify(newTicket)
      });
      const data = await res.json();
      setTickets([...tickets, data]);
      setShowSuccess(true);
      e.target.reset();
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) { console.error(err); }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      PENDING: 'bg-yellow-50 text-yellow-600 border-yellow-100',
      APPROVED: 'bg-green-50 text-green-600 border-green-100',
      REJECTED: 'bg-red-50 text-red-600 border-red-100',
      CANCELLED: 'bg-gray-50 text-gray-500 border-gray-100',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex font-sans">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 flex flex-col z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <LayoutDashboard size={20} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Lecturer Hub</h1>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'Booking Resources', icon: <BookOpen size={20} />, label: 'Booking Resources' },
              { id: 'My Bookings', icon: <Calendar size={20} />, label: 'My Bookings' },
              { id: 'My Tickets', icon: <Ticket size={20} />, label: 'My Tickets' },
              { id: 'Raise Ticket', icon: <Plus size={20} />, label: 'Raise Ticket' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                  ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }`}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-gray-50">
          <button onClick={() => { if (setUser) setUser(null); if (setPage) setPage('login'); }} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium">
            <LogOut size={20} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 p-8">
        {/* Header Area */}
        <header className="flex items-center justify-between mb-10 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100/50">
          <div className="flex items-center gap-4 bg-gray-50 px-6 py-2 rounded-2xl border border-gray-100 w-96">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search facilities or bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full py-2"
            />
          </div>

          <div className="flex items-center gap-5">
            <button className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-primary transition-all relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 bg-white border border-gray-100 p-2 pr-6 rounded-2xl shadow-sm">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <User size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">{user || 'Guest Lecturer'}</p>
                <p className="text-[10px] text-gray-400 font-medium">Senior Lecturer</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Title */}
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{activeTab}</h2>
          <p className="text-gray-500 mt-1">Manage your university resources and schedules efficiently.</p>
        </div>

        {/* Tab Content Area */}
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'Booking Resources' && (
                <div className="space-y-10">
                  <div className="mt-12 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <Filter size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Filter Resources</h3>
                      </div>
                      <button
                        onClick={() => setFilters({
                          buildingId: '',
                          capacityRange: '',
                          windowRange: '',
                          hallCategory: '',
                          facility: '',
                          date: new Date().toISOString().split('T')[0],
                          selectedSlots: []
                        })}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Eraser size={14} />
                        Clear All Filters
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                      {/* Building Filter */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Building</label>
                        <select
                          value={filters.buildingId}
                          onChange={(e) => setFilters({ ...filters, buildingId: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold appearance-none cursor-pointer"
                        >
                          <option value="">All Buildings</option>
                          {buildings.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Hall Category Filter */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Hall Category</label>
                        <select
                          value={filters.hallCategory}
                          onChange={(e) => setFilters({ ...filters, hallCategory: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold appearance-none cursor-pointer"
                        >
                          <option value="">All Categories</option>
                          <option value="Lecture Hall">Lecture Hall</option>
                          <option value="Lab Room">Lab Room</option>
                          <option value="Meeting Room">Meeting Room</option>
                        </select>
                      </div>

                      {/* Capacity Filter */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Capacity</label>
                        <select
                          value={filters.capacityRange}
                          onChange={(e) => setFilters({ ...filters, capacityRange: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold appearance-none cursor-pointer"
                        >
                          <option value="">Any Capacity</option>
                          <option value="20-30">20 - 30</option>
                          <option value="30-60">30 - 60</option>
                          <option value="60-100">60 - 100</option>
                          <option value="100-150">100 - 150</option>
                          <option value="150-200">150 - 200</option>
                        </select>
                      </div>

                      {/* Window Filter */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Windows</label>
                        <select
                          value={filters.windowRange}
                          onChange={(e) => setFilters({ ...filters, windowRange: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold appearance-none cursor-pointer"
                        >
                          <option value="">Any Windows</option>
                          <option value="5-10">5 - 10</option>
                          <option value="10-15">10 - 15</option>
                          <option value="15-20">15 - 20</option>
                        </select>
                      </div>

                      {/* Facility Filter */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Facilities</label>
                        <select
                          value={filters.facility}
                          onChange={(e) => setFilters({ ...filters, facility: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold appearance-none cursor-pointer"
                        >
                          <option value="">All Facilities</option>
                          <option value="With Multimedia Projector">Multimedia Projector</option>
                          <option value="with Recording Cameras">Recording Cameras</option>
                          <option value="with Smart Screen">Smart Screen</option>
                          <option value="with All Equipment">All Equipment</option>
                        </select>
                      </div>
                    </div>

                    {/* Date and Time Selection */}
                    <div className="mt-10 pt-10 border-t border-gray-50 flex flex-col lg:flex-row gap-10">
                      {/* Date Selection */}
                      <div className="w-full lg:w-1/4 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={14} className="text-primary" />
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Date</label>
                        </div>
                        <input
                          type="date"
                          value={filters.date}
                          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold cursor-pointer"
                        />
                      </div>

                      {/* Time Slots Selection */}
                      <div className="w-full lg:w-3/4 space-y-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-primary" />
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available Time Slots</label>
                          </div>
                          <span className="text-[10px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-full">{filters.selectedSlots.length} Selected</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                          {timeSlots.map((slot) => {
                            const isSelected = filters.selectedSlots.includes(slot);
                            return (
                              <button
                                key={slot}
                                onClick={() => {
                                  const newSlots = isSelected
                                    ? filters.selectedSlots.filter(s => s !== slot)
                                    : [...filters.selectedSlots, slot];
                                  setFilters({ ...filters, selectedSlots: newSlots });
                                }}
                                className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all group ${isSelected
                                  ? 'bg-primary border-primary shadow-lg shadow-primary/20 scale-[0.98]'
                                  : 'bg-white border-gray-100 hover:border-primary/30 hover:bg-gray-50'
                                  }`}
                              >
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected
                                  ? 'bg-white border-white'
                                  : 'bg-gray-50 border-gray-200 group-hover:border-primary/50'
                                  }`}>
                                  {isSelected && <CheckCircle2 size={12} className="text-primary" />}
                                </div>
                                <span className={`text-[11px] font-bold transition-colors ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                                  {slot}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 border-l-4 border-primary pl-4">Available Specific Resources</h3>
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-sm">{filteredResources.length} Results Found</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredResources.map((res) => (
                        <div key={res.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[5rem] -mr-8 -mt-8 group-hover:bg-primary transition-all duration-500"></div>

                          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-white transition-all mb-6 relative z-10">
                            {getResourceIcon(res.type)}
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 relative z-10">{res.name}</h3>
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-6 relative z-10">{res.type}</p>

                          <div className="flex items-center gap-6 mb-8 relative z-10">
                            <div className="flex items-center gap-2">
                              <Users size={14} className="text-primary" />
                              <span className="text-xs font-bold text-gray-600">{res.capacity} Seats</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-primary" />
                              <span className="text-xs font-bold text-gray-600">{buildings.find(b => b.id === res.buildingId)?.name || 'Main Campus'}</span>
                            </div>
                          </div>

                          {/* Resource Stats */}
                          <div className="grid grid-cols-2 gap-3 mb-8">
                            <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 flex flex-col gap-1">
                              <span className="text-[9px] font-bold text-gray-400 uppercase">Windows</span>
                              <span className="text-xs font-black text-gray-700">{res.windows} Units</span>
                            </div>
                            <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 flex flex-col gap-1">
                              <span className="text-[9px] font-bold text-gray-400 uppercase">Floor</span>
                              <span className="text-xs font-black text-gray-700">{res.floor || 'G-Floor'}</span>
                            </div>
                          </div>

                          <button
                            onClick={async () => {
                              const newBooking = {
                                resource: res.name,
                                date: new Date().toISOString().split('T')[0],
                                time: '10:30 A.M - 12:30 P.M',
                                purpose: 'For Lecture',
                                status: 'PENDING',
                                lecturer: user || 'Guest Lecturer'
                              };
                              try {
                                const response = await fetch(`${API_BASE}/bookings`, {
                                  method: 'POST',
                                  headers: jsonHeaders(),
                                  body: JSON.stringify(newBooking)
                                });
                                const data = await response.json();
                                setMyBookings([data, ...myBookings]);
                                setActiveTab('My Bookings');
                              } catch (err) { console.error(err); }
                            }}
                            className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-opacity-90 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                          >
                            <Plus size={18} />
                            Book This Hall
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. My Bookings Tab */}
              {activeTab === 'My Bookings' && (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Recent Booking Requests</h3>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-4 py-1.5 rounded-full border border-gray-100">
                      View All History
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-white">
                          <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID</th>
                          <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resource</th>
                          <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Schedule</th>
                          <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Purpose</th>
                          <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {myBookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-8 py-6 text-sm font-bold text-gray-500">{booking.id}</td>
                            <td className="px-8 py-6 text-sm font-bold text-gray-900">{booking.resource}</td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-700">{booking.date}</span>
                                <span className="text-[10px] text-gray-400 font-medium">{booking.time}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-sm font-medium text-gray-600">{booking.purpose}</td>
                            <td className="px-8 py-6 text-sm">
                              <StatusBadge status={booking.status} />
                            </td>
                            <td className="px-8 py-6">
                              {booking.status !== 'CANCELLED' ? (
                                <button
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg group-hover:scale-110"
                                  title="Cancel Booking"
                                >
                                  <X size={18} />
                                </button>
                              ) : (
                                <span className="text-gray-300 opacity-50">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {myBookings.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                      <Calendar size={48} className="text-gray-200 mb-4" />
                      <p className="text-gray-400 font-medium">No bookings found</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'My Tickets' && (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">My Maintenance Tickets</h3>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-4 py-1.5 rounded-full border border-gray-100">
                      Status Overview
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-white">
                          <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                          <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Issue</th>
                          <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resource</th>
                          <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</th>
                          <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {tickets.map((ticket) => (
                          <React.Fragment key={ticket.id}>
                            <tr className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-8 py-6 text-sm font-bold text-gray-900">
                                <div className="flex flex-col">
                                  <span className="font-bold text-gray-900">{ticket.category}</span>
                                  <span className="text-[10px] text-gray-400">{ticket.course}</span>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-sm font-medium text-gray-600">{ticket.issue}</td>
                              <td className="px-8 py-6 text-sm font-bold text-primary">{ticket.resource}</td>
                              <td className="px-8 py-6">
                                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${ticket.priority === 'Urgent' ? 'bg-red-100 text-red-600' :
                                  ticket.priority === 'High' ? 'bg-orange-100 text-orange-600' :
                                    'bg-blue-100 text-blue-600'
                                  }`}>
                                  {ticket.priority}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-sm">
                                <StatusBadge status={ticket.status} />
                              </td>
                            </tr>
                            {ticket.response && (
                              <tr className="bg-gray-50/30">
                                <td colSpan="5" className="px-8 py-4">
                                  <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm ml-4 mb-2 max-w-2xl"
                                  >
                                    <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                                      <MessageSquare size={18} />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Technician Response</p>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <div className="flex items-center gap-1">
                                          <Wrench size={10} className="text-gray-400" />
                                          <p className="text-[9px] font-bold text-gray-400">Action Taken</p>
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                                        {ticket.response}
                                      </p>
                                    </div>
                                  </motion.div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {tickets.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                      <Ticket size={48} className="text-gray-200 mb-4" />
                      <p className="text-gray-400 font-medium">No tickets found</p>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Raise Ticket Tab */}
              {activeTab === 'Raise Ticket' && (
                <div className="max-w-4xl">
                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mb-6 p-6 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-4 text-green-700 shadow-lg shadow-green-500/5"
                    >
                      <CheckCircle2 size={24} />
                      <div>
                        <p className="font-bold">Ticket Submitted Successfully!</p>
                        <p className="text-sm opacity-80">Our technical team will review it shortly within the next hour.</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Report an Issue</h3>
                        <p className="text-sm text-gray-400">Describe the problem encountered during your lecture.</p>
                      </div>
                    </div>

                    <form onSubmit={handleRaiseTicket} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Lecturer Name */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Lecturer Name</label>
                          <input
                            name="lecturer"
                            required
                            type="text"
                            defaultValue={user || "Guest Lecturer"}
                            className="bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-semibold"
                          />
                        </div>

                        {/* Lecture / Course Name */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Lecture / Course Name</label>
                          <input
                            name="course"
                            required
                            type="text"
                            placeholder="e.g. CS101 Advanced Networking"
                            className="bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-semibold"
                          />
                        </div>

                        {/* Hall / Room Name */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Hall / Room Name</label>
                          <select
                            name="hall"
                            required
                            className="bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-semibold appearance-none"
                          >
                            <option value="">Select Resource</option>
                            {resources.map(res => (
                              <option key={res.id} value={res.name}>{res.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Issue Category */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Issue Category</label>
                          <select
                            name="category"
                            required
                            className="bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-semibold appearance-none"
                          >
                            <option value="Projector Issue">Projector Issue</option>
                            <option value="Smart Screen Issue">Smart Screen Issue</option>
                            <option value="Camera Issue">Camera Issue</option>
                            <option value="Audio Issue">Audio Issue</option>
                            <option value="Network Issue">Network Issue</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Issue Title */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Issue Title</label>
                        <input
                          name="issueTitle"
                          required
                          type="text"
                          placeholder="Short summary of the issue"
                          className="bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-semibold"
                        />
                      </div>

                      {/* Issue Description */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Issue Description</label>
                        <textarea
                          name="issueDesc"
                          required
                          rows="4"
                          placeholder="Please provide details about the problem..."
                          className="bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium resize-none"
                        ></textarea>
                      </div>

                      <div className="flex items-center gap-8 border-t border-gray-50 pt-8 mt-4">
                        <div className="flex-1 flex flex-col gap-2 text-primary">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Priority Level</label>
                          <div className="flex gap-4">
                            {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                              <label key={p} className="flex-1">
                                <input type="radio" name="priority" value={p} className="hidden peer" defaultChecked={p === 'Low'} />
                                <div className="p-3 text-center rounded-2xl border border-gray-100 text-xs font-bold peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary cursor-pointer transition-all hover:bg-gray-50">
                                  {p}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="mt-6">
                          <button type="submit" className="bg-primary text-white font-bold py-4 px-12 rounded-2xl hover:bg-opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center gap-2">
                            Submit Ticket
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>


      <style dangerouslySetInnerHTML={{
        __html: `
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      ` }} />
    </div>
  );
};

export default lecturerDashboard;
