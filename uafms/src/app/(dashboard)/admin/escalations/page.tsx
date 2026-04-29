'use client';

import React from 'react';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  AcademicCapIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const escalations = [
  { id: 1, type: 'Document Mismatch', student: 'Sarah Jones', priority: 'Urgent', status: 'Pending', time: '2h ago', assignedTo: 'Super Admin' },
  { id: 2, type: 'Payment Delay', student: 'Vikki Malhotra', priority: 'High', status: 'In Review', time: '5h ago', assignedTo: 'Finance' },
  { id: 3, type: 'Profile Verification', student: 'Rahul K.', priority: 'Medium', status: 'Resolved', time: '1d ago', assignedTo: 'Counsellor A' },
];

export default function EscalationsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-heading tracking-tight">Escalation Tower</h1>
          <p className="text-muted font-medium">Resolve critical barriers in the application lifecycle.</p>
        </div>
        <div className="flex items-center gap-4 bg-danger/5 border border-danger/10 p-4 rounded-2xl">
          <ExclamationTriangleIcon className="w-8 h-8 text-danger opacity-50" />
          <div>
            <p className="text-xs font-black text-danger uppercase tracking-widest">Active Alerts</p>
            <p className="text-xl font-black text-heading">12 Critical</p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-border bg-bg/20 flex items-center justify-between">
          <h2 className="text-lg font-bold text-heading">Incident Logs</h2>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-white border border-border rounded-xl text-xs font-bold shadow-sm">All Records</button>
            <button className="px-4 py-2 text-xs font-bold text-muted hover:text-heading transition-colors">Only Urgent</button>
          </div>
        </div>
        <div className="divide-y divide-border">
          {escalations.map((e, i) => (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={e.id}
              className="px-8 py-6 flex items-center justify-between hover:bg-bg/50 transition-colors group"
            >
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  e.priority === 'Urgent' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                }`}>
                  <ExclamationTriangleIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                      e.priority === 'Urgent' ? 'bg-danger text-white' : 'bg-warning text-heading'
                    }`}>
                      {e.priority}
                    </span>
                    <h3 className="font-bold text-heading">{e.type}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted font-medium">
                    <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> {e.student}</span>
                    <span className="flex items-center gap-1"><ShieldCheckIcon className="w-3 h-3" /> Assigned: {e.assignedTo}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-1.5 text-xs text-muted font-bold tracking-tight">
                  <ClockIcon className="w-3.5 h-3.5" /> {e.time}
                </div>
                <button className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  e.status === 'Resolved'
                    ? 'bg-bg text-muted border border-border'
                    : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105'
                }`}>
                  {e.status === 'Resolved' ? 'View Root Cause' : 'Take Action'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
