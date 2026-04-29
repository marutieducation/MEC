'use client';

import React from 'react';
import {
  ChatBubbleLeftRightIcon,
  BuildingLibraryIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const replies = [
  { id: 1, university: 'Nirma University', region: 'Ahmedabad', decision: 'Offer Issued', student: 'Sneha Gupta', time: '12m ago', message: 'The applicant meets all criteria. Conditional offer issued.' },
  { id: 2, university: 'MS University of Baroda', region: 'Vadodara', decision: 'Docs Required', student: 'Priya Sharma', time: '1h ago', message: 'Please provide the secondary transcripts for verification.' },
  { id: 3, university: 'DA-IICT', region: 'Gandhinagar', decision: 'Rejected', student: 'Rahul Kumar', time: '3h ago', message: 'The candidate does not meet the minimum eligibility score.' },
];

export default function PartnerRepliesPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-heading tracking-tight">Partner Correspondence</h1>
        <p className="text-muted font-medium">Real-time tracker of all university decisions and replies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {replies.map((r, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={r.id}
              className="bg-surface border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <BuildingLibraryIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-heading">{r.university}</h3>
                    <p className="text-xs text-muted flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3" /> {r.region}
                    </p>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                  r.decision === 'Offer Issued' ? 'bg-success/10 text-success' :
                  r.decision === 'Rejected' ? 'bg-danger/10 text-danger' :
                  'bg-warning/10 text-warning'
                }`}>
                  {r.decision}
                </span>
              </div>
              <div className="bg-bg/40 border border-border/50 rounded-2xl p-4 mb-4">
                <p className="text-sm font-medium text-heading mb-2">Message from Admissions:</p>
                <p className="text-sm text-muted italic leading-relaxed">"{r.message}"</p>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                    {r.student[0]}
                  </div>
                  <span className="text-xs font-bold text-heading">{r.student}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted font-bold tracking-tight">
                  <ClockIcon className="w-3.5 h-3.5" /> {r.time}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-[#002147] rounded-3xl p-6 shadow-xl text-white relative overflow-hidden group">
            <h3 className="text-lg font-bold mb-6 text-[#A6C8FF] relative z-10">Decision Snapshot</h3>
            <div className="space-y-4 relative z-10">
              {[
                { label: 'Offers', val: 78, color: 'bg-success' },
                { label: 'Rejections', val: 12, color: 'bg-danger' },
                { label: 'Waitlisted', val: 10, color: 'bg-warning' }
              ].map((m) => (
                <div key={m.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold tracking-wide">
                    <span>{m.label}</span>
                    <span>{m.val}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${m.color}`} style={{ width: `${m.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
               <CheckCircleIcon className="w-24 h-24" />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-muted uppercase tracking-widest mb-6">Partner Health</h3>
            <div className="space-y-6">
               {[1, 2, 3].map(i => (
                 <div key={i} className="flex items-center gap-3">
                   <div className="w-9 h-9 rounded-xl bg-bg border border-border flex items-center justify-center font-bold text-heading">U</div>
                   <div className="flex-1 min-w-0">
                     <p className="text-xs font-bold text-heading truncate">Imperial College London</p>
                     <p className="text-[10px] text-muted font-bold">Avg Response: 4h</p>
                   </div>
                   <div className="w-2 h-2 rounded-full bg-success"></div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
