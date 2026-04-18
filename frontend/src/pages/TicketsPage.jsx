import React, { useState, useEffect, useRef } from 'react';
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
  X,
  User as UserIcon,
  ShieldCheck,
  Wrench,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const TicketsPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Create Ticket State
  const [newTicket, setNewTicket] = useState({
    category: 'Electrical',
    priority: 'MEDIUM',
    description: '',
    location: '',
    preferredContact: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);

  // Resolution/Notes State
  const [statusNote, setStatusNote] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
    if (user.role === 'ADMIN') {
      fetchTechnicians();
    }
  }, [user.role]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const endpoint = user.role === 'LECTURER' ? '/tickets/my' : '/tickets';
      const response = await api.get(endpoint);
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await api.get('/users/technicians');
      setTechnicians(response.data);
    } catch (error) {
      console.error('Failed to fetch technicians', error);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedImages.length + files.length > 3) {
      alert("Maximum 3 images allowed");
      return;
    }
    setSelectedImages([...selectedImages, ...files]);
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('ticket', new Blob([JSON.stringify(newTicket)], { type: 'application/json' }));
      selectedImages.forEach((img) => formData.append('images', img));

      await api.post('/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setShowNewModal(false);
      setNewTicket({ category: 'Electrical', priority: 'MEDIUM', description: '', location: '', preferredContact: '' });
      setSelectedImages([]);
      fetchTickets();
    } catch (error) {
      console.error('Failed to create ticket', error);
      alert(error.response?.data?.message || "Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (ticketId, nextStatus) => {
    if ((nextStatus === 'RESOLVED' || nextStatus === 'REJECTED') && !statusNote.trim()) {
      alert("Status update requires notes/reason.");
      return;
    }

    setSubmitting(true);
    try {
      await api.patch(`/tickets/${ticketId}/status?status=${nextStatus}&notes=${encodeURIComponent(statusNote)}`);
      setStatusNote('');
      fetchTickets();
      // Update selected ticket in view
      const updated = await api.get(`/tickets/${ticketId}`);
      setSelectedTicket(updated.data);
    } catch (error) {
      console.error('Status update failed', error);
      alert(error.response?.data?.message || "Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async (ticketId, techId) => {
    try {
      await api.patch(`/tickets/${ticketId}/assign?technicianId=${techId}`);
      fetchTickets();
      const updated = await api.get(`/tickets/${ticketId}`);
      setSelectedTicket(updated.data);
    } catch (error) {
      console.error('Assignment failed', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setSubmitting(true);
    try {
      await api.post(`/tickets/${selectedTicket.id}/comments?content=${encodeURIComponent(commentText)}`);
      setCommentText('');
      const updated = await api.get(`/tickets/${selectedTicket.id}`);
      setSelectedTicket(updated.data);
      fetchTickets();
    } catch (error) {
      console.error('Comment failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      CRITICAL: "bg-red-600 text-white shadow-red-200",
      HIGH: "bg-red-50 text-red-600 border-red-100",
      MEDIUM: "bg-amber-50 text-amber-600 border-amber-100",
      LOW: "bg-indigo-50 text-indigo-500 border-indigo-100"
    };
    return (
      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-wider ${styles[priority]}`}>
        {priority}
      </span>
    );
  };

  const getStatusDisplay = (status) => {
    const maps = {
      OPEN: { color: 'text-amber-500', bg: 'bg-amber-50', icon: Clock, label: 'Waiting' },
      IN_PROGRESS: { color: 'text-blue-500', bg: 'bg-blue-50', icon: AlertCircle, label: 'Active' },
      RESOLVED: { color: 'text-green-500', bg: 'bg-green-50', icon: CheckCircle2, label: 'Resolved' },
      CLOSED: { color: 'text-slate-500', bg: 'bg-slate-50', icon: ShieldCheck, label: 'Archived' },
      REJECTED: { color: 'text-red-500', bg: 'bg-red-50', icon: X, label: 'Rejected' },
    };
    const config = maps[status] || maps.OPEN;
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bg} ${config.color} text-[10px] font-black uppercase border border-current/10`}>
        <config.icon size={12} strokeWidth={3} /> {config.label}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Maintenance Hub</h1>
          <p className="text-slate-500 font-medium">Issue reporting & facility maintenance tracking system.</p>
        </div>
        {user.role === 'LECTURER' && (
          <button 
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus size={20} /> Report Incident
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Ticket List Panel */}
        <div className="lg:col-span-4 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-bold">Scanning records...</div>
          ) : tickets.length === 0 ? (
            <div className="bg-slate-50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
               <TicketIcon size={40} className="mx-auto text-slate-300 mb-4" />
               <p className="text-sm font-bold text-slate-400">No active tickets found.</p>
            </div>
          ) : (
            tickets.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map((ticket) => (
              <motion.div 
                layout
                key={ticket.id}
                onClick={() => {
                   setSelectedTicket(ticket);
                   setStatusNote('');
                }}
                className={`p-5 rounded-3xl border text-left cursor-pointer transition-all relative group
                  ${selectedTicket?.id === ticket.id 
                    ? 'bg-white border-indigo-500 shadow-2xl shadow-indigo-500/10' 
                    : 'bg-white border-slate-100 hover:border-slate-300 shadow-soft'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 font-mono">#{ticket.id?.substring(tick.id.length-6) || 'ID'}</span>
                    {getPriorityBadge(ticket.priority)}
                  </div>
                  {getStatusDisplay(ticket.status)}
                </div>
                <h3 className="font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors uppercase text-sm tracking-tight">{ticket.description}</h3>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-indigo-50 flex items-center justify-center">
                       <Wrench size={12} className="text-indigo-500" />
                    </div>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{ticket.category}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Detailed Investigation Panel */}
        <div className="lg:col-span-8 bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/50 min-h-[640px] flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Investigation Header */}
              <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/30">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200/50 flex items-center justify-center text-indigo-600 shadow-sm">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Incident Investigation</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Resource Ref: {selectedTicket.id}</span>
                      <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{selectedTicket.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                   {/* Admin Assign Dropdown */}
                   {user.role === 'ADMIN' && selectedTicket.status === 'OPEN' && (
                     <div className="relative group w-full md:w-auto">
                       <select 
                         onChange={(e) => handleAssign(selectedTicket.id, e.target.value)}
                         className="w-full md:w-48 pl-3 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500 appearance-none shadow-sm cursor-pointer"
                       >
                         <option value="">Assign Tech</option>
                         {technicians.map(t => (
                           <option key={t.id} value={t.id}>{t.name}</option>
                         ))}
                       </select>
                       <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                     </div>
                   )}
                   
                   {getPriorityBadge(selectedTicket.priority)}
                </div>
              </div>

              {/* Scrollable Context Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Description & Impact */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Case Description</h4>
                  <div className="bg-slate-50 rounded-[1.5rem] p-6 border border-slate-100">
                    <p className="text-slate-700 font-medium leading-relaxed">
                      {selectedTicket.description}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-4 pt-6 border-t border-slate-200/50">
                       <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-100 shadow-sm text-[10px] font-bold text-slate-500 uppercase">
                          <ImageIcon size={12} /> View Attachments
                       </div>
                       <span className="text-[10px] font-bold text-slate-400 uppercase mt-2 italic px-1">Location: {selectedTicket.location || 'Site Wide'}</span>
                    </div>
                  </div>
                </div>

                {/* Image Attachments */}
                {selectedTicket.imageAttachments?.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 pb-4">
                    {selectedTicket.imageAttachments.map((img, i) => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group relative">
                        <img src={`http://localhost:8081/api/v1/uploads/${img}`} alt="Evidence" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Resolution History */}
                {(selectedTicket.resolutionNotes || selectedTicket.rejectionReason) && (
                  <div className={`p-6 rounded-2xl border ${selectedTicket.status === 'REJECTED' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                    <h5 className={`text-[10px] font-black uppercase tracking-widest mb-2 ${selectedTicket.status === 'REJECTED' ? 'text-red-500' : 'text-green-600'}`}>
                      {selectedTicket.status === 'REJECTED' ? 'REJECTION REPORT' : 'RESOLUTION NOTES'}
                    </h5>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                      "{selectedTicket.resolutionNotes || selectedTicket.rejectionReason}"
                    </p>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-8 space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 text-center">Communication Log</h4>
                  {selectedTicket.comments?.map((comment) => (
                    <div key={comment.id} className={`flex ${comment.userId === user.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-4 rounded-2xl text-xs font-bold leading-relaxed shadow-sm
                        ${comment.userId === user.id 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-slate-100 text-slate-600 rounded-bl-none border border-slate-200/50'}`}>
                        {comment.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Console */}
              <div className="p-8 bg-white border-t border-slate-100 space-y-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                {/* Tech/Admin Status Controls */}
                {((user.role === 'TECHNICIAN' && selectedTicket.assignedTechnicianId === user.id) || user.role === 'ADMIN') && 
                 selectedTicket.status !== 'CLOSED' && selectedTicket.status !== 'RESOLVED' && (
                  <div className="space-y-4 pb-2">
                    <textarea 
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="Add resolution notes or rejection reason..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none uppercase"
                      rows="2"
                    ></textarea>
                    <div className="flex gap-2">
                      {selectedTicket.status === 'OPEN' && user.role === 'TECHNICIAN' && (
                        <button 
                          onClick={() => handleStatusUpdate(selectedTicket.id, 'IN_PROGRESS')}
                          className="flex-1 py-3 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                          Begin Investigation
                        </button>
                      )}
                      {selectedTicket.status === 'IN_PROGRESS' && user.role === 'TECHNICIAN' && (
                        <button 
                          onClick={() => handleStatusUpdate(selectedTicket.id, 'RESOLVED')}
                          className="flex-1 py-3 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                        >
                          Publish Resolution
                        </button>
                      )}
                      {user.role === 'ADMIN' && (
                        <button 
                          onClick={() => handleStatusUpdate(selectedTicket.id, 'REJECTED')}
                          className="flex-1 py-3 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all"
                        >
                          Deny Ticket
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Close Logic */}
                {user.role === 'ADMIN' && selectedTicket.status === 'RESOLVED' && (
                   <button 
                    onClick={() => handleStatusUpdate(selectedTicket.id, 'CLOSED')}
                    className="w-full py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl"
                  >
                    Close Case File
                  </button>
                )}

                {/* Global Comment Input */}
                {selectedTicket.status !== 'CLOSED' && (
                  <form onSubmit={handleAddComment} className="relative group">
                    <input 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Send a secure message to the assigned team..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] py-5 px-8 pr-16 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-200 transition-all placeholder:text-slate-300"
                    />
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:rotate-12 disabled:opacity-50"
                    >
                      <Send size={20} />
                    </button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
              <div className="h-40 w-40 rounded-[3rem] bg-slate-50 flex items-center justify-center text-slate-200 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-10 scale-0 group-hover:scale-150 transition-all duration-700 rounded-full"></div>
                 <TicketIcon size={80} className="relative z-10 transition-transform group-hover:-rotate-12 duration-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-8 uppercase">Dispatch Console</h3>
              <p className="max-w-[280px] text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest leading-relaxed">System Ready. Select an incident record from the sidebar to begin processing.</p>
            </div>
          )}
        </div>
      </div>

      {/* NEW TICKET MODAL */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                   <div>
                     <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Global Issue Report</h3>
                     <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mt-2">New Maintenance Record Entry</p>
                   </div>
                   <button onClick={() => setShowNewModal(false)} className="p-3 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"><X size={24}/></button>
                </div>
                
                <form onSubmit={handleCreateTicket} className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Facility Domain</label>
                     <select 
                       value={newTicket.category}
                       onChange={e => setNewTicket({...newTicket, category: e.target.value})}
                       className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-black uppercase outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                     >
                        <option>Electrical</option>
                        <option>Plumbing</option>
                        <option>IT Infrastructure</option>
                        <option>Furniture / Assets</option>
                        <option>Security / Access</option>
                        <option>Other</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Threat Level</label>
                     <select 
                       value={newTicket.priority}
                       onChange={e => setNewTicket({...newTicket, priority: e.target.value})}
                       className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-black uppercase outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-mono"
                     >
                        <option>LOW</option>
                        <option>MEDIUM</option>
                        <option>HIGH</option>
                        <option>CRITICAL</option>
                     </select>
                  </div>

                  <div className="col-span-2 space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Primary Location / Room</label>
                     <input 
                       required
                       value={newTicket.location}
                       onChange={e => setNewTicket({...newTicket, location: e.target.value})}
                       placeholder="e.g. Block C, Level 4, Room 402"
                       className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                     />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Situation Briefing</label>
                    <textarea 
                      required
                      rows="4" 
                      value={newTicket.description}
                      onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                      placeholder="Describe the incident in technical detail..." 
                      className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
                    ></textarea>
                  </div>

                  <div className="col-span-2 space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Evidence Capture (Up to 3)</label>
                    <div className="flex gap-4">
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current.click()}
                        className="h-20 w-20 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center hover:border-indigo-400 transition-all text-slate-400 hover:text-indigo-600 bg-slate-50/50"
                      >
                         <Camera size={24} />
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        multiple 
                        accept="image/*" 
                        onChange={handleImageChange}
                      />
                      {selectedImages.map((img, i) => (
                        <div key={i} className="h-20 w-20 rounded-2xl overflow-hidden relative group">
                          <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="Preview"/>
                          <button 
                            type="button"
                            onClick={() => setSelectedImages(selectedImages.filter((_, idx) => idx !== i))}
                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                             <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="col-span-2 py-5 bg-indigo-600 text-white font-black uppercase tracking-[0.25em] rounded-2xl hover:bg-slate-900 shadow-2xl shadow-indigo-200 transition-all mt-6 disabled:opacity-50"
                  >
                     {submitting ? 'Transmitting...' : 'Authorize Submission'}
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
