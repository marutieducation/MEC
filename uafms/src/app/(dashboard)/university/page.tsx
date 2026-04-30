'use client';

import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon, CheckCircleIcon, XMarkIcon,
  SparklesIcon, EnvelopeIcon, FunnelIcon,
  DocumentMagnifyingGlassIcon, ArrowPathIcon,
  ShieldCheckIcon, ChartBarIcon, UserIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getUniversityLogo } from '@/lib/universityLogos';
import { motion, AnimatePresence } from 'framer-motion';

interface Applicant {
  _id: string;
  course: string;
  status: string;
  aiMatchScore: number;
  updatedAt: string;
  student: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function UniversityPortal() {
  const { user } = useAuth();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const fetchApplicants = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/university-portal/applicants');
      setApplicants(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load applicants');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleDecision = async (id: string, decision: 'accepted' | 'rejected') => {
    try {
      setIsProcessing(id);
      if (decision === 'accepted') {
        await api.post(`/university-portal/applicants/${id}/offer`, {
          status: 'accepted',
          note: 'Offer issued via Partner Portal'
        });
      } else {
        await api.put(`/api/applications/${id}`, { status: 'rejected' });
      }
      await fetchApplicants();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setIsProcessing(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading && applicants.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="rounded-full h-12 w-12 border-b-2 border-primary"
        ></motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-8 h-[calc(100vh-64px)] flex flex-col">
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0 relative overflow-hidden rounded-3xl bg-[#0b1120] text-white p-8 shadow-2xl border border-white/5"
      >
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-primary/20 via-transparent to-transparent pointer-events-none opacity-50" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/30 rounded-full blur-[80px]" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-[80px]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="w-20 h-20 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-2 flex items-center justify-center"
            >
              <img 
                src={getUniversityLogo(user?.universityId?.name || '')} 
                alt="University Logo" 
                className="max-w-full max-h-full object-contain drop-shadow-lg" 
              />
            </motion.div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                {user?.universityId?.name || 'Partner Portal'}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/20 text-[#A6C8FF] border border-primary/20">
                  <ShieldCheckIcon className="w-3.5 h-3.5" /> Verified Partner
                </span>
                <span className="text-xs text-blue-200/60 font-medium">Official Admissions Network</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-inner">
            <div className="text-center px-4">
              <p className="text-[10px] text-blue-200/60 font-black uppercase tracking-[0.2em] mb-1">Queue Size</p>
              <motion.p 
                key={applicants.length}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-black text-white"
              >
                {applicants.length}
              </motion.p>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={fetchApplicants} 
              className="p-3 hover:bg-white/10 rounded-xl transition-colors shadow-sm text-blue-200 hover:text-white"
            >
              <ArrowPathIcon className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-8 min-h-0">
        
        {/* Main Table Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="xl:col-span-3 flex flex-col bg-surface/50 backdrop-blur-xl border border-border/50 rounded-3xl shadow-xl overflow-hidden min-h-0"
        >
          <div className="p-5 border-b border-border/50 flex justify-between items-center bg-bg/40 shrink-0">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-primary/10 rounded-lg text-primary">
                 <DocumentMagnifyingGlassIcon className="w-5 h-5" />
               </div>
               <h3 className="text-base font-bold text-heading">Applicant Verification Queue</h3>
             </div>
             <div className="flex gap-3 items-center">
                {error && <span className="text-xs text-danger font-medium px-3 py-1 bg-danger/10 rounded-full">{error}</span>}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-9 px-4 bg-white dark:bg-gray-800 border border-border text-heading hover:border-primary/50 rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-sm"
                >
                    <FunnelIcon className="w-4 h-4" /> Filter
                </motion.button>
             </div>
          </div>

          <div className="flex-1 overflow-x-auto p-2">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="text-muted border-b border-border/30">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Candidate</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Course</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-center">Match Score</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-right">Decision</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="text-sm"
              >
                {applicants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-muted">
                        <DocumentMagnifyingGlassIcon className="w-12 h-12 mb-3 opacity-20" />
                        <p className="font-semibold">No pending applications</p>
                        <p className="text-xs mt-1 opacity-70">Your queue is currently empty.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {applicants.map((app) => (
                      <motion.tr 
                        variants={itemVariants}
                        layout
                        key={app._id} 
                        className="hover:bg-primary/[0.02] transition-colors group border-b border-border/20 last:border-0"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-primary font-bold shadow-sm">
                              {app.student?.firstName?.[0] || '?'}{app.student?.lastName?.[0] || '?'}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-heading group-hover:text-primary transition-colors">
                                {app.student?.firstName} {app.student?.lastName}
                              </span>
                              <span className="text-[11px] text-muted font-medium mt-0.5">{app.student?.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-semibold text-heading/90 px-3 py-1 bg-bg/50 rounded-lg border border-border/50 text-[13px]">
                            {app.course}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border/50 shadow-sm">
                              <SparklesIcon className={`w-4 h-4 ${app.aiMatchScore >= 90 ? 'text-success' : app.aiMatchScore >= 80 ? 'text-info' : 'text-warning'}`} />
                              <span className={`font-black ${app.aiMatchScore >= 90 ? 'text-success' : app.aiMatchScore >= 80 ? 'text-info' : 'text-warning'}`}>
                                {app.aiMatchScore}%
                              </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider border ${
                            app.status === 'under_review' 
                              ? 'bg-info/10 text-info border-info/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                              : 'bg-warning/10 text-warning border-warning/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                          }`}>
                            {app.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-2 bg-surface border border-border text-heading hover:bg-primary hover:border-primary hover:text-white rounded-xl shadow-sm text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                              >
                                  <DocumentMagnifyingGlassIcon className="w-4 h-4" /> Dossier
                              </motion.button>
                              <div className="w-px h-8 bg-border/50 mx-1"></div>
                              {isProcessing === app._id ? (
                                  <div className="px-4 py-2 bg-bg rounded-xl border border-border flex items-center justify-center">
                                    <ArrowPathIcon className="w-5 h-5 animate-spin text-primary" />
                                  </div>
                              ) : (
                                  <div className="flex gap-1.5">
                                    <motion.button
                                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleDecision(app._id, 'accepted')}
                                      className="p-2 text-success hover:text-green-600 rounded-xl border border-transparent hover:border-success/20 transition-all"
                                      title="Accept & Issue Offer"
                                    >
                                      <CheckCircleIcon className="w-6 h-6" />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleDecision(app._id, 'rejected')}
                                      className="p-2 text-danger hover:text-red-600 rounded-xl border border-transparent hover:border-danger/20 transition-all"
                                      title="Reject Application"
                                    >
                                      <XMarkIcon className="w-6 h-6" />
                                    </motion.button>
                                  </div>
                              )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </motion.tbody>
            </table>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-1 flex flex-col gap-8 min-h-0"
        >
          {/* Account Support Card */}
          <div className="bg-gradient-to-br from-surface to-bg rounded-3xl border border-border/50 shadow-xl p-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
             
             <div className="flex items-center gap-3 mb-6 relative z-10">
               <div className="p-2 bg-primary/10 rounded-lg text-primary">
                 <UserIcon className="w-4 h-4" />
               </div>
               <h3 className="text-[11px] font-black text-muted uppercase tracking-[0.15em]">Account Support</h3>
             </div>

             <div className="flex flex-col items-center text-center mb-6 relative z-10">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-surface shadow-xl relative bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xl font-bold mb-3 transform group-hover:scale-105 transition-transform">
                   SJ
                </div>
                <div>
                   <h4 className="font-bold text-heading text-lg">Sarah Jenkins</h4>
                   <p className="text-xs text-muted font-medium mt-0.5">Director of Partnerships</p>
                </div>
             </div>

             <motion.button 
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               className="w-full h-11 bg-primary hover:bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all"
             >
                <EnvelopeIcon className="w-5 h-5" /> Direct Message
             </motion.button>
          </div>

          {/* Partnership Health */}
          <div className="bg-surface/80 backdrop-blur-md rounded-3xl border border-border/50 shadow-xl p-6 flex-1 overflow-y-auto">
             <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
               <div className="p-2 bg-success/10 rounded-lg text-success">
                 <ChartBarIcon className="w-4 h-4" />
               </div>
               <h3 className="text-[11px] font-black text-heading uppercase tracking-[0.15em]">Partnership Health</h3>
             </div>

             <div className="space-y-6">
                <div>
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-heading">Doc Accuracy</span>
                      <span className="text-xs font-black text-success">99.2%</span>
                   </div>
                   <div className="w-full bg-bg rounded-full h-2 overflow-hidden border border-border/50">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: "99.2%" }}
                       transition={{ duration: 1, ease: "easeOut" }}
                       className="bg-gradient-to-r from-success to-emerald-400 h-full rounded-full"
                     />
                   </div>
                </div>
                <div>
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-heading">Offer Intake</span>
                      <span className="text-xs font-black text-primary">74%</span>
                   </div>
                   <div className="w-full bg-bg rounded-full h-2 overflow-hidden border border-border/50">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: "74%" }}
                       transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                       className="bg-gradient-to-r from-primary to-blue-400 h-full rounded-full"
                     />
                   </div>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
