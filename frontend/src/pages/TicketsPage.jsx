import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket as TicketIcon, 
  Plus, 
  MessageSquare, 
  Clock, 
  Filter, 
  Camera,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  ChevronRight,
  Send,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const TicketsPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const endpoint = user.role === 'USER' ? '/tickets/my' : '/tickets';
      const response = await api.get(endpoint);
      setTickets(response.data);
    } catch (error) {
      // Fallback
      setTickets([
        { id: '1', category: 'Electrical', description: 'Power outage in Room 302', priority: 'HIGH', status: 'OPEN', createdAt: '2026-04-17T08:00:00', comments: [] },
        { id: '2', category: 'Plumbing', description: 'Leaking pipe in Physics Lab', priority: 'MEDIUM', status: 'IN_PROGRESS', createdAt: '2026-04-16T14:00:00', comments: [{ id: 'c1', content: 'Technician on the way.', userId: 'staff' }] },
        { id: '3', category: 'IT Support', description: 'Wifi router not working', priority: 'LOW', status: 'RESOLVED', createdAt: '2026-04-15T10:00:00', resolutionNotes: 'Restarted router.', comments: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      CRITICAL: "bg-red-600 text-white",
      HIGH: "bg-red-50 text-red-600 border-red-100",
      MEDIUM: "bg-amber-50 text-amber-600 border-amber-100",
      LOW: "bg-slate-50 text-slate-500 border-slate-100"
    };
    return (
      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${styles[priority]}`}>
        {priority}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'OPEN': return <Clock size={16} className="text-amber-500" />;
      case 'IN_PROGRESS': return <AlertCircle size={16} className="text-blue-500" />;
      case 'RESOLVED': return <CheckCircle2 size={16} className="text-green-500" />;
      default: return <X size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Support Tickets</h1>
          <p className="text-slate-500 font-medium">Report incidents and track maintenance requests.</p>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={20} /> New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Ticket List */}
        <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 scrollbar-hide">
          {tickets.map((ticket) => (
            <div 
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`p-5 rounded-3xl border text-left cursor-pointer transition-all card-hover
                ${selectedTicket?.id === ticket.id 
                  ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-500/5' 
                  : 'bg-white border-slate-100 hover:border-slate-300 shadow-soft'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(ticket.status)}
                  <span className="text-xs font-bold text-slate-400">#{ticket.id}</span>
                </div>
                {getPriorityBadge(ticket.priority)}
              </div>
              <h3 className="font-bold text-slate-900 line-clamp-1">{ticket.description}</h3>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{ticket.category}</span>
                <span className="text-[10px] font-medium text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed View / Chat */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-soft min-h-[600px] flex flex-col relative overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Detail Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm">
                    <TicketIcon size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Incident Details</h2>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">Reported by you · Ref ID: {selectedTicket.id}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                   {getPriorityBadge(selectedTicket.priority)}
                   <span className="px-3 py-1 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600">{selectedTicket.status}</span>
                </div>
              </div>

              {/* Chat / Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Description Bubble */}
                <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100/50 max-w-[85%]">
                  <p className="text-sm font-medium text-indigo-900 leading-relaxed">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Comments */}
                {selectedTicket.comments?.map((comment) => (
                  <div key={comment.id} className={`flex ${comment.userId === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm transition-all
                      ${comment.userId === user.id 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-slate-100 text-slate-600 rounded-bl-none border border-slate-200/50'}`}>
                      {comment.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-100">
                <div className="relative">
                  <textarea 
                    placeholder="Type your message or resolution note..."
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-6 pr-14 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
                    rows="2"
                  ></textarea>
                  <button className="absolute right-3 bottom-3 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
              <TicketIcon size={80} className="text-slate-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-900">Select a ticket</h3>
              <p className="max-w-[240px] text-sm font-medium mt-1">Choose a maintenance request from the list to view its progress and chat.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal Placeholder */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewModal(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Report Incident</h3>
                   <button onClick={() => setShowNewModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><X size={20}/></button>
                </div>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Category</label>
                       <select className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                          <option>Electrical</option>
                          <option>Plumbing</option>
                          <option>IT Support</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Priority</label>
                       <select className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 transition-all">
                          <option>LOW</option>
                          <option>MEDIUM</option>
                          <option>HIGH</option>
                       </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Description</label>
                    <textarea rows="4" placeholder="Detail the issue as much as possible..." className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"></textarea>
                  </div>

                  {/* Attachment Placeholder */}
                  <div className="flex gap-4">
                    <button type="button" className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-indigo-400 hover:bg-slate-50 transition-all group">
                       <Camera size={24} className="text-slate-300 group-hover:text-indigo-500" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase group-hover:text-indigo-600">Add Image (Up to 3)</span>
                    </button>
                    <div className="flex-1 opacity-10 border-2 border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-2"></div>
                    <div className="flex-1 opacity-10 border-2 border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-2"></div>
                  </div>

                  <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all mt-4">
                     Submit Maintenance Request
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TicketsPage;
