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



        {/* Bento Grid: Mission Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(200px,auto)] text-left">
          {/* Main Feature - Transparency */}
          <motion.div 
            className="md:col-span-2 lg:row-span-2 p-10 rounded-3xl bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/20 hover:border-blue-500/40 transition-all flex flex-col justify-between group relative overflow-hidden"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Background Glow */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-500/30 transition-colors" />
            
            <div className="w-16 h-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <Globe className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-3xl font-black mb-4 group-hover:text-blue-400 transition-colors relative z-10">Radical Transparency</h3>
              <p className="text-slate-400 text-lg leading-relaxed relative z-10">
                We break down institutional silos by providing a shared digital twin of campus operations, 
                visible to students, staff, and administrators alike.
              </p>
            </div>
          </motion.div>

          {/* Efficiency Card */}
          <motion.div 
            className="md:col-span-2 p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-6 group"
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
              <h3 className="text-xl font-bold mb-2 text-slate-100">Automated Efficiency</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Reducing manual overhead by 85% through smart, automated rule-based routing.</p>
            </div>
          </motion.div>

          {/* Reliability Card */}
          <motion.div 
            className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2 text-slate-100">Resilient Systems</h3>
              <p className="text-slate-400 text-sm leading-relaxed">99.9% uptime for continuous campus asset tracking.</p>
            </div>
          </motion.div>

          {/* Security Card */}
          <motion.div 
            className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2 text-slate-100">Enterprise Trust</h3>
              <p className="text-slate-400 text-sm leading-relaxed">RBAC protocols ensuring robust data sovereignty.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
