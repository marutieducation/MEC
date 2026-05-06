'use client';

import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon, CheckCircleIcon, XMarkIcon,
  SparklesIcon, EnvelopeIcon, FunnelIcon,
  DocumentMagnifyingGlassIcon, ArrowPathIcon,
  ShieldCheckIcon, ChartBarIcon, UserIcon, MagnifyingGlassIcon
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
  createdAt: string;
  pipelineStage: string;
  student: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

export default function UniversityPortal() {
  const { user, updateUser } = useAuth();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [uniSearchQuery, setUniSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState<Applicant | null>(null);
  const [dossierDocs, setDossierDocs] = useState<any[]>([]);
  const [isDocsLoading, setIsDocsLoading] = useState(false);

  const fetchApplicants = async () => {
    if (!user?.universityId) return;
    try {
      setIsLoading(true);
      const res = await api.get('/university-portal/applicants');
      // Backend returns { success, count, data: [...] }
      const list = res?.data?.data || res?.data || [];
      setApplicants(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load applicants');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch when user becomes available
    if (user?.universityId) {
      fetchApplicants();
    } else if (!isLoading && !user?.universityId) {
      // If loading is done and no uniId, stop loading
      setIsLoading(false);
    }
  }, [user, user?.universityId]);

  const fetchDossierDocs = async (appId: string) => {
    try {
      setIsDocsLoading(true);
      const res = await api.get(`/university-portal/applicants/${appId}/documents`);
      setDossierDocs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setIsDocsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDossier) {
      fetchDossierDocs(selectedDossier._id);
    } else {
      setDossierDocs([]);
    }
  }, [selectedDossier]);

  const searchUniversities = async (query: string) => {
    setUniSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const res = await api.get(`/universities/search?q=${query}`);
      // Deduplicate by university name
      const results = res.data?.results || [];
      const uniqueUnis = Array.from(new Map(results.map((item: any) => 
        [item.universityId, item]
      )).values());
      setSearchResults(uniqueUnis);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLinkUniversity = async (universityId: string, universityName?: string) => {
    try {
      setIsProcessing('linking');
      const res = await api.post('/auth/link-university', { universityId });
      // Update user in context so portal refreshes immediately without reload
      if (res?.data) {
        updateUser({ universityId: res.data.universityId });
      } else {
        // Fallback: reload to get fresh data from /auth/me
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || 'Linking failed');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDecision = async (id: string, decision: 'accepted' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${decision === 'accepted' ? 'ACCEPT' : 'REJECT'} this application?`)) return;
    try {
      setIsProcessing(id);
      // Use the correct university portal decide endpoint
      await api.put(`/university-portal/applicants/${id}/decide`, { decision });
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

  if (isLoading && applicants.length === 0 && user?.universityId) {
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

  // Unlinked State UI
  if (!user?.universityId) {
    return (
      <div className="p-6 md:p-12 max-w-4xl mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <BuildingOfficeIcon className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-black text-heading tracking-tight">Welcome to the Partner Portal</h1>
          <p className="text-xl text-muted font-medium max-w-2xl mx-auto">
            Your account is ready, but it's not linked to a university yet. Search for your institution below to get started.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full relative"
        >
          <div className="relative group">
            <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search by university name..."
              value={uniSearchQuery}
              onChange={(e) => searchUniversities(e.target.value)}
              className="w-full h-20 pl-16 pr-6 bg-surface border-2 border-border rounded-[2rem] text-xl font-bold shadow-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted/50"
            />
            {isSearching && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <ArrowPathIcon className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
          </div>

          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-4 bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden z-50 text-left p-2 max-h-[400px] overflow-y-auto"
              >
                {searchResults.map((uni) => (
                  <button
                    key={uni.universityId}
                    onClick={() => handleLinkUniversity(uni.universityId)}
                    disabled={isProcessing === 'linking'}
                    className="w-full p-4 flex items-center gap-4 hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10 group text-left"
                  >
                    <div className="w-14 h-14 bg-bg rounded-xl border border-border flex items-center justify-center p-2 shrink-0 overflow-hidden">
                       <img src={getUniversityLogo(uni.universityName)} alt="" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-heading group-hover:text-primary transition-colors">{uni.universityName}</h4>
                      <p className="text-sm text-muted">{uni.location}</p>
                    </div>
                    <div className="px-4 py-2 bg-primary/10 text-primary text-xs font-black rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      LINK ACCOUNT
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-12">
           {[
             { icon: ShieldCheckIcon, title: "Verified Access", desc: "Secure admissions control" },
             { icon: ChartBarIcon, title: "Real-time Analytics", desc: "Track applicant performance" },
             { icon: SparklesIcon, title: "AI Matching", desc: "Optimized student selection" }
           ].map((item, i) => (
             <div key={i} className="p-6 bg-surface/50 border border-border rounded-2xl text-left space-y-2">
                <item.icon className="w-6 h-6 text-primary" />
                <h4 className="font-bold text-heading text-sm">{item.title}</h4>
                <p className="text-xs text-muted font-medium leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </div>

        <p className="text-xs text-muted font-bold tracking-widest uppercase opacity-50">
           Institution missing? Contact MEC Support at <span className="text-primary underline">support@mec.com</span>
        </p>
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
                          {(() => {
                            const stage = app.pipelineStage || '';
                            const status = app.status || '';
                            const label = status === 'under_review' ? 'Under Review'
                              : status === 'submitted' ? 'New Application'
                              : status === 'accepted' ? 'Accepted'
                              : status === 'rejected' ? 'Rejected'
                              : stage === 'shortlist' ? 'Shortlisted'
                              : stage === 'review' ? 'In Review'
                              : stage === 'decision' ? 'Final Decision'
                              : status.replace(/_/g, ' ').toUpperCase();
                            const cls = status === 'accepted'
                              ? 'bg-success/10 text-success border-success/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
                              : status === 'rejected'
                              ? 'bg-danger/10 text-danger border-danger/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                              : status === 'under_review' || stage === 'review'
                              ? 'bg-info/10 text-info border-info/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                              : stage === 'shortlist'
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : 'bg-warning/10 text-warning border-warning/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]';
                            return (
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider border ${cls}`}>
                                {label}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedDossier(app)}
                                className="px-3 py-2 bg-surface border border-border text-heading hover:bg-primary hover:border-primary hover:text-white rounded-xl shadow-sm text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                              >
                                  <DocumentMagnifyingGlassIcon className="w-4 h-4" /> Dossier
                              </motion.button>
                              <div className="w-px h-8 bg-border/50 mx-1"></div>
                              {isProcessing === app._id ? (
                                  <div className="px-4 py-2 bg-bg rounded-xl border border-border flex items-center justify-center">
                                    <ArrowPathIcon className="w-5 h-5 animate-spin text-primary" />
                                  </div>
                              ) : ['accepted', 'rejected'].includes(app.status) ? (
                                  <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted/50 flex items-center gap-1.5">
                                    <ShieldCheckIcon className="w-4 h-4" /> Finalized
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

      {/* Dossier Modal */}
      <AnimatePresence>
        {selectedDossier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedDossier(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl border border-border overflow-hidden"
            >
              {/* Header */}
              <div className="px-8 py-6 bg-gradient-to-r from-primary/10 to-blue-500/5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xl font-black shadow-lg">
                    {selectedDossier.student?.firstName?.[0] || '?'}{selectedDossier.student?.lastName?.[0] || ''}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-heading">
                      {selectedDossier.student?.firstName} {selectedDossier.student?.lastName}
                    </h2>
                    <p className="text-sm text-muted font-medium">{selectedDossier.student?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDossier(null)}
                  className="p-2 hover:bg-border/50 rounded-full transition-colors text-muted hover:text-heading"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 space-y-6">
                {/* AI Match */}
                <div className="flex items-center justify-between p-4 bg-bg/60 rounded-2xl border border-border/50">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">AI Match Score</p>
                    <p className={`text-3xl font-black ${selectedDossier.aiMatchScore >= 90 ? 'text-success' : selectedDossier.aiMatchScore >= 80 ? 'text-info' : 'text-warning'}`}>
                      {selectedDossier.aiMatchScore}%
                    </p>
                  </div>
                  <SparklesIcon className={`w-10 h-10 ${selectedDossier.aiMatchScore >= 90 ? 'text-success/30' : selectedDossier.aiMatchScore >= 80 ? 'text-info/30' : 'text-warning/30'}`} />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-bg/40 rounded-2xl border border-border/30">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Applied Course</p>
                    <p className="text-sm font-bold text-heading">{selectedDossier.course}</p>
                  </div>
                  <div className="p-4 bg-bg/40 rounded-2xl border border-border/30">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Current Status</p>
                    <p className="text-sm font-bold text-heading capitalize">{(selectedDossier.status || '').replace(/_/g, ' ')}</p>
                  </div>
                  <div className="p-4 bg-bg/40 rounded-2xl border border-border/30">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Pipeline Stage</p>
                    <p className="text-sm font-bold text-heading capitalize">{selectedDossier.pipelineStage || 'leads'}</p>
                  </div>
                  <div className="p-4 bg-bg/40 rounded-2xl border border-border/30">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Applied On</p>
                    <p className="text-sm font-bold text-heading">
                      {new Date(selectedDossier.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="p-4 bg-bg/40 rounded-2xl border border-border/30 col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Contact Phone</p>
                    <p className="text-sm font-bold text-heading">{selectedDossier.student?.phone || 'Not Provided'}</p>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted">Application Documents</p>
                  {isDocsLoading ? (
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <ArrowPathIcon className="w-4 h-4 animate-spin" /> Loading documents...
                    </div>
                  ) : dossierDocs.length === 0 ? (
                    <p className="text-xs text-muted italic">No documents uploaded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {dossierDocs.map((doc: any) => (
                        <a
                          key={doc._id}
                          href={doc.filePath.startsWith('http') ? doc.filePath : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${doc.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-bg/50 border border-border/50 rounded-xl hover:border-primary/50 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <DocumentMagnifyingGlassIcon className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-xs font-bold text-heading group-hover:text-primary transition-colors">{doc.name}</p>
                              <p className="text-[10px] text-muted">{doc.fileSize} • {doc.status}</p>
                            </div>
                          </div>
                          <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            VIEW
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {!['accepted', 'rejected'].includes(selectedDossier.status) && (
                  <div className="flex gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        await handleDecision(selectedDossier._id, 'accepted');
                        setSelectedDossier(null);
                      }}
                      disabled={isProcessing === selectedDossier._id}
                      className="flex-1 h-12 bg-success text-white font-black rounded-2xl shadow-lg shadow-success/20 hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="w-5 h-5" /> Accept
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        await handleDecision(selectedDossier._id, 'rejected');
                        setSelectedDossier(null);
                      }}
                      disabled={isProcessing === selectedDossier._id}
                      className="flex-1 h-12 bg-danger text-white font-black rounded-2xl shadow-lg shadow-danger/20 hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <XMarkIcon className="w-5 h-5" /> Reject
                    </motion.button>
                  </div>
                )}
                {selectedDossier.status === 'accepted' && (
                  <div className="p-4 bg-success/10 border border-success/20 rounded-2xl text-center">
                    <CheckCircleIcon className="w-8 h-8 text-success mx-auto mb-2" />
                    <p className="font-bold text-success">Application Accepted</p>
                  </div>
                )}
                {selectedDossier.status === 'rejected' && (
                  <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl text-center">
                    <XMarkIcon className="w-8 h-8 text-danger mx-auto mb-2" />
                    <p className="font-bold text-danger">Application Rejected</p>
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
