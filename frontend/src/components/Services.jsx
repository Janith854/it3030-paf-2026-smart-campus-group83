import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, CalendarRange, Wrench, ArrowRight, MapPin, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resourcesApi } from '../services/api';

const mainServices = [
  {
    icon: <Building2 className="w-8 h-8" />,
    title: "Resource Catalogue",
    desc: "A centralized digital directory of every lecture hall, computer lab, and equipment on campus.",
    color: "blue"
  },
  {
    icon: <CalendarRange className="w-8 h-8" />,
    title: "Instant Bookings",
    desc: "Seamless approval workflows that eliminate double-bookings and manual scheduling conflicts.",
    color: "emerald"
  },
  {
    icon: <Wrench className="w-8 h-8" />,
    title: "Maintenance Tracker",
    desc: "Digital ticketing system for reporting and resolving campus issues with real-time tracking.",
    color: "amber"
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
    <section className="py-24 bg-[#0a0f1d] text-white overflow-hidden" id="services">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Core Capabilities
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight leading-loose">
              Advanced <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">Campus Services</span>
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              We provide the tools necessary to manage a growing campus infrastructure with surgical precision. 
              Our role-agnostic services are used by students, faculty, and operations teams daily.
            </p>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 transition-colors"
          >
            Access Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Pillars */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {mainServices.map((s, i) => (
            <div key={i} className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 transition-all group">
              <div className={`w-16 h-16 rounded-2xl bg-${s.color}-500/10 text-${s.color}-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {s.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* 3-Card Preview Section */}
        <div className="pt-16 border-t border-slate-800">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h4 className="text-2xl font-bold mb-2">Live Availability</h4>
              <p className="text-slate-500 text-sm italic">Recently active campus resources ready for booking</p>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
            >
              Browse Catalogue <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-64 rounded-3xl bg-slate-900 animate-pulse border border-slate-800" />
              ))
            ) : resources.length > 0 ? (
              resources.map((r, i) => (
                <motion.div 
                  key={r.id}
                  className="group relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 hover:border-blue-500/40 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="h-40 bg-linear-to-br from-blue-600 to-indigo-700 p-6 flex flex-col justify-end">
                    <span className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">
                      {r.type}
                    </span>
                    <h5 className="text-xl font-bold truncate">{r.name}</h5>
                    <div className="flex items-center gap-2 text-blue-200 text-sm mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {r.location}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Users className="w-4 h-4" />
                        {r.capacity ? `${r.capacity} Seats` : 'Variable'}
                      </div>
                      <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Active
                      </span>
                    </div>
                    <button 
                      onClick={() => navigate('/login')}
                      className="w-full py-3 rounded-xl bg-slate-800 hover:bg-blue-600 text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
                    >
                      Check Availability <Zap className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                <p className="text-slate-500">Resource data unavailable in preview mode.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
