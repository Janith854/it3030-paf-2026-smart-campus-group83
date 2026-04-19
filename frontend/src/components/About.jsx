import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Target, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <section className="py-24 bg-white overflow-hidden" id="about">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Our Vision & Mission
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
            Bridging Campus Infrastructure <br />
            <span className="text-blue-600">with Digital Intelligence</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Smart Campus Hub is more than just a booking portal. We've built an ecosystem that solves real university logistics problems using data, automation, and role-based intelligence.
          </p>
        </div>

        {/* The Challenge vs The Solution */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div 
            className="p-8 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <AlertTriangle className="text-amber-500" /> The Challenge
            </h3>
            <ul className="space-y-4">
              {[
                'Fragmented room booking via emails and WhatsApp.',
                'Maintenance issues reported but frequently lost.',
                'Duplicate hall bookings causing event chaos.',
                'Zero real-time visibility into resource status.'
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center mt-0.5 text-amber-600 text-xs">!</div>
                  {text}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            className="p-8 rounded-3xl bg-blue-600 shadow-xl shadow-blue-200"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <CheckCircle2 className="text-blue-200" /> Our Solution
            </h3>
            <ul className="space-y-4">
              {[
                'A single, unified portal for all campus assets.',
                'Automated approval workflows with instant alerts.',
                'End-to-end ticketing with technician assignments.',
                'Live dashboards for students, staff, and admins.'
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-blue-50">
                  <CheckCircle2 className="w-5 h-5 text-blue-300 mt-0.5" />
                  {text}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Mission Pillars */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { 
              icon: <Target className="w-6 h-6" />, 
              title: "Transparency", 
              desc: "Every booking and maintenance ticket is tracked and visible to relevant stakeholders."
            },
            { 
              icon: <Zap className="w-6 h-6" />, 
              title: "Efficiency", 
              desc: "Reducing manual paperwork through automated approval routing and real-time status updates."
            },
            { 
              icon: <Activity className="w-6 h-6" />, 
              title: "Reliability", 
              desc: "Ensuring university resources are utilized to their maximum capacity without conflict."
            },
            { 
              icon: <ShieldCheck className="w-6 h-6" />, 
              title: "Security", 
              desc: "Robust OAuth integration and Role-Based Access Control for secure operations."
            }
          ].map((item, i) => (
            <div key={i} className="group p-6 rounded-2xl bg-white border border-slate-100 transition-all hover:border-blue-200 hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-slate-50 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {item.icon}
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
