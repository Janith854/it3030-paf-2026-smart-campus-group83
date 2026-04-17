import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Bell,
  User,
  Search,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  X,
  Send,
  LogOut,
  LayoutDashboard,
  History,
  Filter,
  AlertTriangle,
  CheckCheck,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE, getAuthHeaders, jsonHeaders } from '../utils/api';

// Priority and Status configs remain same...

const priorityConfig = {
  URGENT: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', dot: 'bg-red-500' },
  HIGH: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', dot: 'bg-orange-500' },
  MEDIUM: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100', dot: 'bg-yellow-400' },
  LOW: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', dot: 'bg-green-500' },
};

const statusConfig = {
  OPEN: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', icon: <AlertCircle size={12} /> },
  'IN PROGRESS': { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100', icon: <Loader2 size={12} /> },
  RESOLVED: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', icon: <CheckCheck size={12} /> },
};

// ─── Main Component ────────────────────────────────────────────────────────────
const TechnicianDashboard = ({ setPage, user, setUser }) => {
  const [activeTab, setActiveTab] = useState('Requests');
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/tickets`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => Array.isArray(data) && setRequests(data))
      .catch(console.error);
  }, []);

  // Stats
  const openCount = requests.filter(r => r.status === 'OPEN').length;
  const inProgressCount = requests.filter(r => r.status === 'IN PROGRESS').length;
  const resolvedCount = requests.filter(r => r.status === 'RESOLVED').length;
  const urgentCount = requests.filter(r => r.priority === 'URGENT' && r.status !== 'RESOLVED').length;

  // Helper to get date and time from MongoDB ObjectId
  const getTicketDate = (id) => {
    try {
      if (id && id.length === 24) {
        const timestamp = parseInt(id.substring(0, 8), 16) * 1000;
        const dateObj = new Date(timestamp);
        return {
          time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })
        };
      }
    } catch (e) {}
    return { time: '--:--', date: '---' };
  };

  // Filtered list
  const filteredRequests = requests.filter(r => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (r.resource || '').toLowerCase().includes(q) ||
      (r.issue || '').toLowerCase().includes(q) ||
      (r.lecturer || '').toLowerCase().includes(q) ||
      (r.id || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Tab counts for display
  const tabRequests = activeTab === 'Requests'
    ? filteredRequests.filter(r => r.status !== 'RESOLVED')
    : filteredRequests.filter(r => r.status === 'RESOLVED');

  // Open response modal
  const openRespond = (req) => {
    setSelectedRequest(req);
    setResponseText(req.response || '');
    setShowResponseModal(true);
  };

  // Submit response
  const handleSubmitResponse = async () => {
    if (!responseText.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/tickets/${selectedRequest.id}/status?status=IN_PROGRESS&notes=${encodeURIComponent(responseText)}`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? data : r));
      setShowResponseModal(false);
      setShowSuccessBanner(true);
      setTimeout(() => setShowSuccessBanner(false), 3000);
    } catch (err) { console.error(err); }
  };

  // Mark as resolved
  const handleMarkResolved = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/tickets/${id}/status?status=RESOLVED`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setRequests(prev => prev.map(r => r.id === id ? data : r));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans text-gray-800">

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 flex flex-col z-30 shadow-sm">
        <div className="p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-200">
              <Wrench size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Tech<span className="text-teal-600">Portal</span>
            </h1>
          </div>

          {/* Nav */}
          <nav className="space-y-2">
            {[
              { id: 'Requests', icon: <AlertCircle size={18} />, label: 'Requests' },
              { id: 'History', icon: <History size={18} />, label: 'History' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-teal-50 text-teal-600 font-bold shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                {tab.icon}
                <span className="text-sm">{tab.label}</span>
                {tab.id === 'Requests' && openCount > 0 && (
                  <span className="ml-auto bg-teal-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {openCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Profile footer */}
        <div className="mt-auto border-t border-gray-50">
          <div className="p-8 flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white">
              <User size={18} />
            </div>
            <div>
              <p className="text-xs font-bold">{user || 'Tech. Robert Smith'}</p>
              <p className="text-[10px] text-gray-400">Network Administrator</p>
            </div>
          </div>
          <div className="px-8 pb-8">
            <button onClick={() => { if (setUser) setUser(null); if (setPage) setPage('login'); }} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium">
              <LogOut size={18} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="flex-1 ml-64 p-8">

        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 min-w-[380px]">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by location, issue, lecturer..."
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-teal-600 transition-all border border-gray-100 shadow-sm relative">
              <Bell size={20} />
              {urgentCount > 0 && (
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>
            <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-100">
              <User size={20} />
            </div>
          </div>
        </header>

        {/* Success Banner */}
        <AnimatePresence>
          {showSuccessBanner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-5 bg-teal-50 border border-teal-100 rounded-2xl flex items-center gap-4 text-teal-700 shadow-lg shadow-teal-500/5"
            >
              <CheckCircle2 size={22} />
              <div>
                <p className="font-bold text-sm">Response Submitted!</p>
                <p className="text-xs opacity-75">The ticket has been updated to "In Progress".</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'Open', value: openCount, icon: <AlertCircle size={20} />, bg: 'bg-blue-50', text: 'text-blue-600' },
            { label: 'In Progress', value: inProgressCount, icon: <Loader2 size={20} />, bg: 'bg-yellow-50', text: 'text-yellow-600' },
            { label: 'Resolved', value: resolvedCount, icon: <CheckCheck size={20} />, bg: 'bg-green-50', text: 'text-green-600' },
            { label: 'Urgent', value: urgentCount, icon: <AlertTriangle size={20} />, bg: 'bg-red-50', text: 'text-red-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-11 h-11 ${s.bg} ${s.text} rounded-2xl flex items-center justify-center mb-4`}>
                {s.icon}
              </div>
              <p className="text-2xl font-black mb-1">{s.value}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            {['Requests', 'History'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-100'
                  : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-3">
            <Filter size={14} className="text-gray-400" />
            <div className="flex gap-2">
              {['ALL', 'OPEN', 'IN PROGRESS'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${filterStatus === f
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-white border border-gray-100 text-gray-400 hover:border-gray-300'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Requests Table ──────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Page Title */}
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold tracking-tight">
                {activeTab === 'Requests' ? 'Maintenance Requests' : 'Resolved History'}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {activeTab === 'Requests'
                  ? 'Review and respond to issues reported by lecturers.'
                  : 'All resolved maintenance tickets you have handled.'}
              </p>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[1024px]">
                  {/* Table header */}
                  <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/40 grid grid-cols-12 gap-4">
                <div className="col-span-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID</div>
                <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</div>
                <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Issue</div>
                <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lecturer</div>
                <div className="col-span-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</div>
                <div className="col-span-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</div>
                <div className="col-span-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</div>
                <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-50">
                {tabRequests.length === 0 ? (
                  <div className="py-24 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mb-4 text-gray-300">
                      <Wrench size={28} />
                    </div>
                    <p className="text-gray-400 font-bold text-sm">No requests found</p>
                    <p className="text-gray-300 text-xs mt-1">Try adjusting your filters</p>
                  </div>
                ) : (
                  tabRequests.map((req) => {
                    const pStyle = priorityConfig[req.priority] || priorityConfig.LOW;
                    const sStyle = statusConfig[req.status] || statusConfig.OPEN;
                    const { time, date } = req.time ? req : getTicketDate(req.id);
                    return (
                      <div
                        key={req.id}
                        className="px-8 py-5 grid grid-cols-12 gap-4 items-center hover:bg-gray-50/60 transition-colors group"
                      >
                        {/* ID */}
                        <div className="col-span-1">
                          <span className="text-xs font-black text-gray-400" title={req.id}>
                            #{req.id?.substring(req.id.length - 6) || req.id}
                          </span>
                        </div>

                        {/* Location */}
                        <div className="col-span-2">
                          <div className="flex items-start gap-1.5">
                            <MapPin size={12} className="text-teal-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-bold text-gray-900 leading-tight">{req.resource || 'Unknown Location'}</p>
                              <p className="text-[10px] text-gray-400">{req.building || 'Campus'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Issue */}
                        <div className="col-span-2">
                          <p className="text-sm font-bold text-gray-700">{req.issue}</p>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">{(req.issueDesc || req.description || '').substring(0, 38)}…</p>
                        </div>

                        {/* Lecturer */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-bold text-[10px] shrink-0">
                              {(req.lecturer || 'U').charAt(0)}
                            </div>
                            <p className="text-xs font-bold text-gray-700 leading-tight">{req.lecturer}</p>
                          </div>
                        </div>

                        {/* Time */}
                        <div className="col-span-1">
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock size={12} className="shrink-0" />
                            <span className="text-[10px] font-bold">{time}</span>
                          </div>
                          <p className="text-[10px] text-gray-300 ml-4">{date}</p>
                        </div>

                        {/* Priority */}
                        <div className="col-span-1">
                          <span className={`inline-flex items-center whitespace-nowrap gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${pStyle.dot}`} />
                            {req.priority}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="col-span-1">
                          <span className={`inline-flex items-center whitespace-nowrap gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}>
                            {sStyle.icon}
                            {req.status}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          {req.status !== 'RESOLVED' && (
                            <>
                              <button
                                onClick={() => openRespond(req)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-all shadow-md shadow-teal-100 group-hover:scale-105"
                              >
                                <MessageSquare size={13} />
                                Respond
                              </button>
                              {req.response && (
                                <button
                                  onClick={() => handleMarkResolved(req.id)}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-600 border border-green-100 rounded-xl text-xs font-bold hover:bg-green-600 hover:text-white transition-all"
                                >
                                  <CheckCircle2 size={13} />
                                  Resolve
                                </button>
                              )}
                            </>
                          )}
                          {req.status === 'RESOLVED' && (
                            <span className="text-[10px] font-bold text-gray-300 uppercase italic tracking-widest">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
                </div>
              </div>
            </div>

            {/* Response preview cards (for responded requests) */}
            {activeTab === 'Requests' && tabRequests.some(r => r.response) && (
              <div className="mt-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Your Responses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tabRequests.filter(r => r.response && r.status !== 'RESOLVED').map(req => {
                    const pStyle = priorityConfig[req.priority] || priorityConfig.LOW;
                    return (
                      <div key={req.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex gap-5">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${pStyle.bg} ${pStyle.text}`}>
                          <Wrench size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-bold">{req.issue}</p>
                            <span className="text-[10px] font-bold text-gray-400">#{req.id}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 mb-3 flex items-center gap-1">
                            <MapPin size={10} className="text-teal-500" /> {req.resource || req.location}
                          </p>
                          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-50">
                            <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                              <Send size={10} /> Your Response
                            </p>
                            <p className="text-xs text-gray-700 font-medium leading-relaxed">{req.response}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Response Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showResponseModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl border border-gray-100"
            >
              {/* Modal header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                    <Wrench size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{selectedRequest.issue}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} className="text-teal-500" />
                      {selectedRequest.resource || selectedRequest.location} · {selectedRequest.building || 'Campus'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Issue details */}
              <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Issue Description</p>
                <p className="text-sm text-gray-700 font-medium leading-relaxed">{selectedRequest.issueDesc || selectedRequest.description}</p>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <User size={12} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-600">{selectedRequest.lecturer}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-600">{selectedRequest.time || getTicketDate(selectedRequest.id).time}</span>
                  </div>
                  <span className={`ml-auto px-2.5 py-1 rounded-full text-[10px] font-black border ${(priorityConfig[selectedRequest.priority] || priorityConfig.LOW).bg
                    } ${(priorityConfig[selectedRequest.priority] || priorityConfig.LOW).text
                    } ${(priorityConfig[selectedRequest.priority] || priorityConfig.LOW).border
                    }`}>
                    {selectedRequest.priority}
                  </span>
                </div>
              </div>

              {/* Response textarea */}
              <div className="mb-6">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                  Your Response / Action Taken
                </label>
                <textarea
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  placeholder="Describe the steps you are taking or have taken to fix the issue..."
                  rows={5}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all text-sm font-medium resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="flex-1 py-4 text-xs font-bold text-gray-400 hover:text-gray-700 transition-all rounded-2xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitResponse}
                  disabled={!responseText.trim()}
                  className="flex-1 bg-teal-600 text-white font-bold py-4 rounded-2xl text-xs hover:bg-teal-700 transition-all shadow-xl shadow-teal-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  Submit Response
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Scrollbar styles */}
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

export default TechnicianDashboard;
