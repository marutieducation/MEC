'use client';

import React, { useState, useEffect } from 'react';
import { 
  CalendarDaysIcon, ClockIcon, UserGroupIcon, VideoCameraIcon, 
  CheckCircleIcon, ArrowPathIcon, XMarkIcon, PhoneIcon, 
  EnvelopeIcon, MapPinIcon, AcademicCapIcon, BuildingLibraryIcon 
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

interface CounselingRequest {
  _id: string;
  title: string;
  description: string;
  studentName: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  student?: {
    _id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
    city?: string;
    state?: string;
    country?: string;
    highestQualification?: string;
    dreamUniversity?: string;
    dreamCourse?: string;
  };
}

export default function MeetingsPage() {
  const [requests, setRequests] = useState<CounselingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<CounselingRequest | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/counseling-requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch counseling requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdateLoading(id);
    try {
      await api.put(`/admin/counseling-requests/${id}`, { status });
      await fetchRequests();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdateLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-warning/10 text-warning border-warning/20';
      case 'in_progress': return 'bg-info/10 text-info border-info/20';
      case 'resolved': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted/10 text-muted border-muted/20';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-heading tracking-tight">Counselling Meetings</h1>
          <p className="text-muted font-medium">Manage your consultation schedule and live sessions.</p>
        </div>
        <div className="flex gap-4">
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Requests', value: requests.length },
          { label: 'Resolved', value: requests.filter(r => r.status === 'resolved').length },
          { label: 'Pending', value: requests.filter(r => r.status === 'open' || r.status === 'in_progress').length }
        ].map((item) => (
          <div key={item.label} className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
            <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">{item.label}</p>
            <p className="text-3xl font-black text-heading">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-bg/20">
          <h2 className="text-lg font-bold text-heading">Counseling Requests</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchRequests}
              className="p-2 hover:bg-bg rounded-lg transition-colors text-muted"
            >
              <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="p-12 text-center text-muted font-medium">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-muted font-medium">No counseling requests found.</div>
          ) : (
            requests.map((r) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={r._id}
                className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-bg/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <UserGroupIcon className="w-6 h-6" />
                  </div>
                  <div className="cursor-pointer group/name" onClick={() => setSelectedRequest(r)}>
                    <h3 className="font-bold text-heading group-hover/name:text-primary transition-colors text-lg flex items-center gap-2">
                      {r.studentName}
                      <span className="text-[10px] bg-bg px-2 py-0.5 rounded border border-border opacity-0 group-hover/name:opacity-100 transition-opacity">View Details</span>
                    </h3>
                    <div className="flex gap-4 mt-1">
                      <p className="text-xs text-muted font-medium flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" /> Requested {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                      {r.student?.phone && (
                        <p className="text-xs text-muted font-medium">📞 {r.student.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 max-w-md px-4 py-3 bg-bg/40 rounded-xl border border-border/50">
                   <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap">{r.description}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(r.status)}`}>
                    {r.status.replace('_', ' ')}
                  </span>

                  <div className="flex items-center gap-2">
                    {r.status === 'open' && (
                      <button
                        onClick={() => handleUpdateStatus(r._id, 'in_progress')}
                        disabled={updateLoading === r._id}
                        className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        {updateLoading === r._id ? '...' : 'Take Request'}
                      </button>
                    )}
                    {(r.status === 'open' || r.status === 'in_progress') && (
                      <button
                        onClick={() => handleUpdateStatus(r._id, 'resolved')}
                        disabled={updateLoading === r._id}
                        className="px-4 py-2 bg-success text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        {updateLoading === r._id ? '...' : 'Resolve'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-surface rounded-3xl shadow-2xl border border-border overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-bg/20">
                <h2 className="text-xl font-bold text-heading">Student Dossier</h2>
                <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-bg rounded-xl transition-colors">
                  <XMarkIcon className="w-6 h-6 text-muted" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black">
                    {selectedRequest.studentName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-heading">{selectedRequest.studentName}</h3>
                    <p className="text-primary font-bold text-sm uppercase tracking-wider">Active Student</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Contact Info</p>
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-heading flex items-center gap-2">
                          <EnvelopeIcon className="w-4 h-4 text-muted" /> {selectedRequest.student?.email || 'N/A'}
                        </p>
                        <p className="text-sm font-bold text-heading flex items-center gap-2">
                          <PhoneIcon className="w-4 h-4 text-muted" /> {selectedRequest.student?.phone || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Location</p>
                      <p className="text-sm font-bold text-heading flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-muted" /> 
                        {selectedRequest.student?.city}, {selectedRequest.student?.state}
                      </p>
                      <p className="text-xs text-muted ml-6">{selectedRequest.student?.country}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Qualification</p>
                      <p className="text-sm font-bold text-heading flex items-center gap-2">
                        <AcademicCapIcon className="w-4 h-4 text-muted" /> {selectedRequest.student?.highestQualification || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Ambitions</p>
                      <p className="text-sm font-bold text-heading flex items-center gap-2 leading-tight">
                        <BuildingLibraryIcon className="w-4 h-4 text-muted shrink-0" /> {selectedRequest.student?.dreamUniversity || 'N/A'}
                      </p>
                      <p className="text-xs text-primary font-bold ml-6 mt-1">{selectedRequest.student?.dreamCourse || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-2">Requested Consultation</p>
                  <div className="p-4 bg-bg rounded-2xl border border-border/50">
                    <p className="text-sm font-medium text-heading leading-relaxed italic">
                      "{selectedRequest.description}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-8 py-4 bg-bg/50 border-t border-border flex justify-end">
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="px-6 py-2 bg-heading text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
