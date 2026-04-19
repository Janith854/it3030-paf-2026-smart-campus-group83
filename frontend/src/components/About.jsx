import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Target, Zap, AlertTriangle, CheckCircle2, Globe, Cpu, Users2, Rocket } from 'lucide-react';

export default function About() {
  return (
    <section className="relative py-32 bg-[#060c1a] text-white overflow-hidden" id="about">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            The Future of Campus Operations
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black mb-8 tracking-tighter leading-[1.1]"
          >
            Digital Mastery for <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-400 to-emerald-400 sm:whitespace-nowrap">Modern Universities</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            We've engineered a sophisticated layer of intelligence that sits atop standard campus infrastructure, 
            transforming fragmented manual processes into a cohesive, data-driven ecosystem.
          </motion.p>
        </div>

        {/* Narrative Section: The Transformation */}
        <div className="grid lg:grid-cols-12 gap-12 items-center mb-32">
          <motion.div 
            className="lg:col-span-5 space-y-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="p-1 rounded-2xl bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700/50">
              <div className="p-8 bg-[#0a0f1d] rounded-xl">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-amber-500">
                  <AlertTriangle className="w-6 h-6" /> Legacy Chaos
                </h3>
                <div className="space-y-6">
                  {[
                    { title: "Manual Scheduling", desc: "WhatsApp threads and messy spreadsheets leading to double bookings." },
                    { title: "Ghost Assets", desc: "No central database for equipment, making resource discovery impossible." },
                    { title: "Siloed Reporting", desc: "Maintenance requests lost in email chains with no accountability." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="w-1 h-full bg-slate-800 group-hover:bg-amber-500/50 transition-colors" />
                      <div>
                        <h4 className="font-bold text-slate-200 group-hover:text-amber-500 transition-colors">{item.title}</h4>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-2 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Rocket className="w-8 h-8 text-blue-500 animate-bounce" />
            </div>
          </div>

          <motion.div 
            className="lg:col-span-5 space-y-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="p-1 rounded-2xl bg-linear-to-br from-blue-500/50 to-indigo-500/50 border border-blue-400/30">
              <div className="p-8 bg-[#0a0f1d] rounded-xl">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-blue-400">
                  <CheckCircle2 className="w-6 h-6" /> Our Intelligence
                </h3>
                <div className="space-y-6">
                  {[
                    { title: "Automated Workflows", desc: "Rule-based approval systems that eliminate human error instantly." },
                    { title: "Unified Catalog", desc: "A single source of truth for every square inch of campus property." },
                    { title: "Real-time Audits", desc: "Transparent tracking from issue reporting to technician sign-off." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="w-1 h-full bg-slate-800 group-hover:bg-blue-500 transition-colors" />
                      <div>
                        <h4 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{item.title}</h4>
                        <p className="text-sm text-slate-400/70">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bento Grid: Mission Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
          {/* Main Feature - Transparency */}
          <motion.div 
            className="md:col-span-2 md:row-span-2 p-10 rounded-[2.5rem] bg-linear-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/20 hover:border-blue-500/40 transition-all flex flex-col justify-end group"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <Globe className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-black mb-4 group-hover:text-blue-400 transition-colors">Radical Transparency</h3>
            <p className="text-slate-400 text-lg leading-relaxed">
              We break down institutional silos by providing a shared digital twin of campus operations, 
              visible to students, staff, and administrators alike.
            </p>
          </motion.div>

          {/* Efficiency Card */}
          <motion.div 
            className="md:col-span-2 md:row-span-1 p-8 rounded-[2.5rem] bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-8 group"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Automated Efficiency</h3>
              <p className="text-slate-500 text-sm">Reducing manual overhead by 85% through smart routing.</p>
            </div>
          </motion.div>

          {/* Reliability Card */}
          <motion.div 
            className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all group lg:col-span-1"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Cpu className="w-10 h-10 text-emerald-400 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold mb-2">Resilient Systems</h3>
            <p className="text-slate-500 text-xs leading-relaxed">99.9% uptime for campus asset availability tracking.</p>
          </motion.div>

          {/* Security Card */}
          <motion.div 
            className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all group lg:col-span-1"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <ShieldCheck className="w-10 h-10 text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold mb-2">Enterprise Trust</h3>
            <p className="text-slate-500 text-xs leading-relaxed">RBAC protocols ensuring data sovereignty at every level.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
