'use client';

import React, { useEffect, useState } from 'react';
import {
  CalendarDaysIcon, VideoCameraIcon,
  MapPinIcon, ClockIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { api } from '@/lib/api';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students/consultations');
      const data = res.data || [];
      const formatted = data.map((item: any) => {
        const assignedName = item.assignedTo ? `${item.assignedTo.firstName} ${item.assignedTo.lastName}` : 'Admin Team';
        const isScheduled = item.status === 'in_progress' || item.status === 'resolved';
        return {
          id: item._id,
          uni: 'MEC',
          type: item.type,
          interviewer: assignedName,
          status: item.status.replace('_', ' '),
          date: item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Pending',
          time: isScheduled ? 'Scheduled' : 'TBD',
        };
      });
      setInterviews(formatted);
    } catch (err) {
      console.error('Failed to fetch consultations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await api.put(`/students/consultations/${id}/cancel`, {});
      fetchConsultations();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel consultation');
    }
  };

  const handleJoin = (item: any) => {
    if (item.status === 'in progress' || item.status === 'resolved') {
      alert('Meeting link will be provided by your admin shortly.');
    } else {
      alert('Meeting is not ready yet.');
    }
  };


  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 fade-in">
      <div>
        <h1 className="text-h1 text-heading">Interviews & Appointments</h1>
        <p className="text-body text-muted mt-1">Manage your upcoming university interviews and counsellor sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-h3 mb-4">Upcoming sessions</h2>
          {loading ? (
             <div className="p-8 border border-dashed border-border rounded-2xl text-center text-muted bg-surface">
              <p>Loading sessions...</p>
             </div>
          ) : interviews.length === 0 ? (
            <div className="p-8 border border-dashed border-border rounded-2xl text-center text-muted bg-surface">
              <CalendarDaysIcon className="w-12 h-12 mx-auto mb-3 opacity-50 text-muted" />
              <p className="font-bold text-heading">No upcoming sessions</p>
              <p className="text-[13px] mt-1">When you schedule an interview, it will appear here.</p>
            </div>
          ) : interviews.map((item) => (
            <div key={item.id} className="p-6 bg-surface border border-border rounded-2xl shadow-sm hover:border-primary transition-all group">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-info/5 border border-info/10 flex items-center justify-center text-info">
                    <VideoCameraIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-heading">{item.uni} - {item.type}</h3>
                    <p className="text-sm text-muted font-medium">With {item.interviewer}</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-info/10 text-info text-[11px] font-black uppercase tracking-wider border border-info/20">
                  {item.status}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-border pt-6">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <CalendarDaysIcon className="w-4 h-4" /> {item.date}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <ClockIcon className="w-4 h-4" /> {item.time}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted overflow-hidden">
                  <MapPinIcon className="w-4 h-4 shrink-0" /> <span className="truncate">Online</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => handleJoin(item)}
                  disabled={item.status === 'closed'}
                  className="flex-1 py-2.5 bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
                  Join Meeting
                </button>
                {item.status !== 'closed' && (
                  <button 
                    onClick={() => handleCancel(item.id)}
                    className="flex-1 py-2.5 bg-surface border border-border text-heading text-sm font-bold rounded-xl hover:bg-bg transition-all">
                    Cancel Request
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {}
        <div className="space-y-6">

           <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm">
              <h3 className="text-[14px] font-bold text-heading mb-4">Prep Checklist</h3>
              <div className="space-y-3">
                {[
                  'Test Camera & Mic',
                  'Research University Values',
                  'Prepare SOP Summary',
                  'Formal Attire Ready'
                ].map(check => (
                  <div key={check} className="flex items-center gap-3 text-sm text-muted">
                    <div className="w-4 h-4 rounded border border-border"></div> {check}
                  </div>
                ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
