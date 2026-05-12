'use client';

import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  DocumentMagnifyingGlassIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ApplicantsPage() {
  const { user } = useAuth();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isDocsLoading, setIsDocsLoading] = useState(false);

  const fetchApplicants = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/university-portal/applicants?status=${filterStatus}&course=${searchQuery}`);
      setApplicants(res.data.data || []);
    } catch (err) {
      console.error('Fetch error', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [user, filterStatus]);

  const handleDecision = async (id: string, decision: 'accepted' | 'rejected') => {
    if (!confirm(`Confirm ${decision.toUpperCase()} decision?`)) return;
    try {
      setIsProcessing(id);
      await api.put(`/university-portal/applicants/${id}/decide`, { decision });
      await fetchApplicants();
      setSelectedApp(null);
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setIsProcessing(null);
    }
  };

  const fetchDocs = async (id: string) => {
    try {
      setIsDocsLoading(true);
      const res = await api.get(`/university-portal/applicants/${id}/documents`);
      setDocuments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDocsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedApp) fetchDocs(selectedApp._id);
  }, [selectedApp]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-heading tracking-tight">Admissions Queue</h1>
          <p className="text-sm text-muted font-bold mt-1">Review, verify and finalize student applications</p>
        </div>
        <div className="flex gap-3">
           <button onClick={fetchApplicants} className="p-3 bg-surface border border-border rounded-xl text-muted hover:text-primary transition-colors">
              <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
           </button>
           <button className="h-12 px-6 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
              <ArrowDownTrayIcon className="w-5 h-5" /> Export List
           </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
         <div className="lg:col-span-2 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input 
              type="text" 
              placeholder="Search by candidate name or course..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchApplicants()}
              className="w-full h-14 pl-12 pr-4 bg-surface border border-border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all"
            />
         </div>
         <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-14 px-4 bg-surface border border-border rounded-2xl text-sm font-bold outline-none"
         >
            <option value="">All Statuses</option>
            <option value="submitted">New Submissions</option>
            <option value="under_review">In Review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
         </select>
         <button className="h-14 bg-surface border border-border rounded-2xl flex items-center justify-center gap-2 text-sm font-black text-muted hover:text-primary hover:border-primary/50 transition-all">
            <FunnelIcon className="w-5 h-5" /> Advanced Filters
         </button>
      </div>

      {}
      <div className="bg-surface rounded-[32px] border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg/50 border-b border-border">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Candidate</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Program</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Applied Date</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-6 bg-bg rounded-lg w-full opacity-50"></div></td>
                  </tr>
                ))
              ) : applicants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted font-bold">No candidates found matching your criteria.</td>
                </tr>
              ) : (
                applicants.map((app) => (
                  <tr key={app._id} className="hover:bg-bg/40 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                          {app.student?.firstName?.[0]}{app.student?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-black text-heading group-hover:text-primary transition-colors">{app.student?.firstName} {app.student?.lastName}</p>
                          <p className="text-[11px] text-muted font-bold tracking-tight">{app.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[13px] font-bold text-heading/80">{app.course}</span>
                    </td>
                    <td className="px-6 py-5 text-[12px] font-bold text-muted">
                      {new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        app.status === 'accepted' ? 'bg-success/10 text-success border-success/20' : 
                        app.status === 'rejected' ? 'bg-danger/10 text-danger border-danger/20' : 
                        'bg-warning/10 text-warning border-warning/20'
                      }`}>
                        {app.status}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <button 
                         onClick={() => setSelectedApp(app)}
                         className="px-4 py-2 bg-surface border border-border rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all"
                       >
                          Review Dossier
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {}
        <div className="p-6 border-t border-border bg-bg/20 flex items-center justify-between">
           <p className="text-xs text-muted font-bold tracking-tight">Showing {applicants.length} of {applicants.length} entries</p>
           <div className="flex gap-2">
              <button className="p-2 bg-surface border border-border rounded-lg text-muted hover:text-primary transition-colors disabled:opacity-30" disabled>
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button className="p-2 bg-surface border border-border rounded-lg text-muted hover:text-primary transition-colors disabled:opacity-30" disabled>
                <ChevronRightIcon className="w-5 h-5" />
              </button>
           </div>
        </div>
      </div>

      {}
      <AnimatePresence>
        {selectedApp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setSelectedApp(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface w-full max-w-2xl rounded-[40px] shadow-2xl border border-border overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary font-black text-3xl">
                        {selectedApp.student?.firstName?.[0]}{selectedApp.student?.lastName?.[0]}
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-heading">{selectedApp.student?.firstName} {selectedApp.student?.lastName}</h2>
                        <p className="text-sm text-muted font-bold tracking-widest uppercase mt-1">Application ID: {selectedApp._id.slice(-8).toUpperCase()}</p>
                      </div>
                   </div>
                   <button onClick={() => setSelectedApp(null)} className="p-3 bg-bg rounded-2xl border border-border text-muted hover:text-heading transition-colors">
                      <XMarkIcon className="w-6 h-6" />
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10">
                   <div className="p-6 bg-bg/50 rounded-3xl border border-border/50">
                      <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2">Program Selection</p>
                      <p className="text-sm font-black text-heading leading-tight">{selectedApp.course}</p>
                   </div>
                   <div className="p-6 bg-bg/50 rounded-3xl border border-border/50">
                      <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2">Contact Number</p>
                      <p className="text-sm font-black text-heading">{selectedApp.student?.phone || 'Not Provided'}</p>
                   </div>
                </div>

                {}
                <div className="mb-10">
                   <h4 className="text-[11px] font-black text-muted uppercase tracking-[0.2em] mb-4">Candidate Dossier</h4>
                   {isDocsLoading ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-primary">
                        <ArrowPathIcon className="w-4 h-4 animate-spin" /> Verifying document security...
                      </div>
                   ) : documents.length === 0 ? (
                      <p className="text-sm text-muted italic font-medium">No documents have been uploaded for this candidate.</p>
                   ) : (
                      <div className="space-y-3">
                        {documents.map(doc => (
                          <div key={doc._id} className="p-4 bg-surface border border-border rounded-2xl flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                               <DocumentMagnifyingGlassIcon className="w-6 h-6 text-primary" />
                               <div>
                                 <p className="text-sm font-black text-heading leading-none">{doc.name}</p>
                                 <p className="text-[10px] text-muted font-bold mt-1 uppercase tracking-tight">{doc.category} • {doc.fileSize}</p>
                               </div>
                            </div>
                            <a href={doc.filePath} target="_blank" className="p-2 bg-bg border border-border rounded-xl text-muted hover:text-primary transition-all">
                               <ArrowDownTrayIcon className="w-5 h-5" />
                            </a>
                          </div>
                        ))}
                      </div>
                   )}
                </div>

                {!['accepted', 'rejected'].includes(selectedApp.status) && (
                  <div className="flex gap-4">
                     <button 
                       onClick={() => handleDecision(selectedApp._id, 'rejected')}
                       disabled={isProcessing === selectedApp._id}
                       className="flex-1 h-16 border-2 border-danger/20 text-danger font-black rounded-2xl hover:bg-danger/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                        <XMarkIcon className="w-6 h-6" /> Decline Application
                     </button>
                     <button 
                       onClick={() => handleDecision(selectedApp._id, 'accepted')}
                       disabled={isProcessing === selectedApp._id}
                       className="flex-1 h-16 bg-success text-white font-black rounded-2xl shadow-xl shadow-success/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                        <CheckCircleIcon className="w-6 h-6" /> Issue Offer Letter
                     </button>
                  </div>
                )}
                {selectedApp.status === 'accepted' && (
                  <div className="h-16 bg-success/10 border border-success/20 rounded-2xl flex items-center justify-center gap-2 text-success font-black uppercase tracking-widest">
                     <CheckCircleIcon className="w-6 h-6" /> Application Accepted
                  </div>
                )}
                {selectedApp.status === 'rejected' && (
                  <div className="h-16 bg-danger/10 border border-danger/20 rounded-2xl flex items-center justify-center gap-2 text-danger font-black uppercase tracking-widest">
                     <XMarkIcon className="w-6 h-6" /> Application Rejected
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
