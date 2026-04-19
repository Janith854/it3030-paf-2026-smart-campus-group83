import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, CalendarRange, Wrench, ArrowRight, MapPin, Users, Zap, Search, LayoutGrid, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resourcesApi } from '../services/api';

const mainServices = [
  {
    icon: <Building2 className="w-8 h-8" />,
    title: "Resource Catalogue",
    desc: "A centralized digital directory of every lecture hall, computer lab, and equipment on campus.",
    color: "blue",
    features: ["Real-time availability", "Location mapping", "Category filtering"]
  },
  {
    icon: <CalendarRange className="w-8 h-8" />,
    title: "Instant Bookings",
    desc: "Seamless approval workflows that eliminate double-bookings and manual scheduling conflicts.",
    color: "emerald",
    features: ["Instant confirmation", "Conflict detection", "Recurring events"]
  },
  {
    icon: <Wrench className="w-8 h-8" />,
    title: "Maintenance Tracker",
    desc: "Digital ticketing system for reporting and resolving campus issues with real-time tracking.",
    color: "amber",
    features: ["Technician assignment", "Image attachments", "Status updates"]
  }
];

export default function Services() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await resourcesApi.getAll();
        setResources(Array.isArray(data) ? data.filter(r => r.status === 'ACTIVE').slice(0, 3) : []);
      } catch (e) {
        console.error("Failed to fetch resources in Services section", e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <section className="relative py-32 bg-[#0a0f1d] text-white overflow-hidden" id="services">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6"
            >
              <Sparkles className="w-3 h-3" />
              Platform Capabilities
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-black mb-8 tracking-tighter leading-tight"
            >
              Advanced <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-emerald-400 to-teal-400">Campus Services</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-400 leading-relaxed"
            >
              Industrial-grade tools designed for the modern academic environment. 
              Our suite of services ensures Every resource is utilized, every issue is fixed, and every booking is seamless.
            </motion.p>
          </div>
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onClick={() => navigate('/login')}
            className="group flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5"
          >
            Launch System <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Core Pillars */}
        <div className="grid lg:grid-cols-3 gap-8 mb-32">
          {mainServices.map((s, i) => (
            <motion.div 
              key={i}
              className="relative p-8 rounded-[2rem] bg-slate-900/40 border border-slate-800 hover:border-blue-500/30 transition-all group overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
            >
              {/* Decorative Corner Icon */}
              <div className={`absolute -top-4 -right-4 w-24 h-24 bg-${s.color}-500/5 rounded-full blur-2xl group-hover:bg-${s.color}-500/10 transition-colors`} />
              
              <div className={`w-16 h-16 rounded-2xl bg-${s.color}-500/10 text-${s.color}-400 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                {s.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{s.title}</h3>
              <p className="text-slate-400 text-base leading-relaxed mb-8">{s.desc}</p>
              
              <ul className="space-y-3">
                {s.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-sm text-slate-500 group-hover:text-slate-300 transition-colors">
                    <div className={`w-1.5 h-1.5 rounded-full bg-${s.color}-500/40`} />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Live Preview Container */}
        <div className="relative p-10 md:p-16 rounded-[3.5rem] bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                  Real-time Data
                </div>
                <h4 className="text-3xl font-bold">Campus Directory</h4>
              </div>
              <p className="text-slate-400">Previewing live resource availability from the central database.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold transition-all flex items-center gap-2"
              >
                <Search className="w-4 h-4" /> Search Resources
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
              >
                Full Access <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-80 rounded-3xl bg-slate-800/50 animate-pulse border border-slate-700/50" />
              ))
            ) : resources.length > 0 ? (
              resources.map((r, i) => (
                <motion.div 
                  key={r.id}
                  className="group relative bg-[#060c1a] rounded-3xl overflow-hidden border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col h-full shadow-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="relative h-44 bg-linear-to-br from-blue-600 to-indigo-900 p-8 flex flex-col justify-end overflow-hidden">
                    {/* Abstract background pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    
                    <div className="relative z-10">
                      <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 mb-3">
                        {r.type}
                      </span>
                      <h5 className="text-2xl font-black leading-tight truncate">{r.name}</h5>
                      <div className="flex items-center gap-2 text-blue-200/80 text-sm mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {r.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Capacity</span>
                        <div className="flex items-center gap-2 text-slate-200 font-bold">
                          <Users className="w-3.5 h-3.5 text-blue-400" />
                          {r.capacity || 'N/A'}
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status</span>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xs uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ACTIVE
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => navigate('/login')}
                      className="mt-auto w-full py-4 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white text-sm font-black transition-all border border-slate-800 hover:border-blue-500 group/btn shadow-sm"
                    >
                      <span className="flex items-center justify-center gap-2">
                        View Schedule <Zap className="w-4 h-4 group-hover/btn:fill-current" />
                      </span>
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-20 bg-slate-900/30 rounded-[2.5rem] border-2 border-dashed border-slate-800">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-10 h-10 text-slate-600" />
                </div>
                <h5 className="text-xl font-bold text-slate-400 mb-2">Inventory Syncing</h5>
                <p className="text-slate-600 max-w-xs mx-auto">Connecting to the global campus asset registry. Please check back shortly.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
