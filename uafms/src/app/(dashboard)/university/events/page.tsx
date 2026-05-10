'use client';

import React from 'react';
import { CalendarDaysIcon, PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function EventsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-heading tracking-tight">University Events</h1>
          <p className="text-sm text-muted font-bold mt-1">Manage webinars, campus tours and orientation sessions</p>
        </div>
        <button className="h-12 px-6 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
           <PlusIcon className="w-5 h-5" /> Schedule Event
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-16 bg-surface rounded-[40px] border border-border shadow-sm text-center flex flex-col items-center justify-center space-y-6"
      >
        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
           <SparklesIcon className="w-12 h-12" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-heading">Events Management is Coming Soon</h3>
          <p className="text-muted font-medium mt-2 max-w-md mx-auto leading-relaxed">
            We are building a powerful scheduling engine that will allow you to connect directly with prospective students via webinars and interactive sessions.
          </p>
        </div>
        <div className="pt-4">
           <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/5 text-primary text-[11px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20">
              Feature Roadmap Q3 2026
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50 pointer-events-none">
         {[1,2,3].map(i => (
           <div key={i} className="p-8 bg-surface border border-border rounded-[32px] space-y-4">
              <div className="w-full h-40 bg-bg rounded-2xl animate-pulse" />
              <div className="h-6 bg-bg rounded-lg w-3/4 animate-pulse" />
              <div className="h-4 bg-bg rounded-lg w-1/2 animate-pulse" />
           </div>
         ))}
      </div>
    </div>
  );
}
