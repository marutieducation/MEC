'use client';

import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ArrowUpRightIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  DocumentMagnifyingGlassIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowPathIcon,
  BuildingLibraryIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  ArrowDownTrayIcon as DownloadIcon
} from '@heroicons/react/24/outline';
import { api, baseUrl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getUniversityLogo } from '@/lib/universityLogos';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function UniversityDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentApplicants, setRecentApplicants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [universityData, setUniversityData] = useState<any>(null);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isDocsLoading, setIsDocsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // Onboarding state moved to top level to comply with React Hook rules
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    universityName: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    contactEmail: user?.email || '',
    contactPhone: '',
    description: '',
    establishedYear: '',
    accreditation: '',
    type: 'Private'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [dashboardRes, applicantsRes] = await Promise.all([
          api.get('/university-portal/dashboard'),
          api.get('/university-portal/applicants?limit=100')
        ]);
        
        setStats(dashboardRes.stats);
        setUniversityData(dashboardRes.university);
        setRecentApplicants(applicantsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

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

  const handleDecision = async (id: string, status: string) => {
    try {
      setIsProcessing(id);
      await api.put(`/university-portal/applicants/${id}/decide`, { decision: status });
      
      // Update local state
      setRecentApplicants(prev => prev.map(app => 
        app._id === id ? { ...app, status } : app
      ));
      
      if (selectedApp?._id === id) {
        setSelectedApp({ ...selectedApp, status });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user?.universityId) {

    const handleOnboardingSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError('');

      try {
        await api.post('/university-portal/onboarding', onboardingData);
        setSuccess(true);
        // Refresh user data after successful onboarding
        window.location.reload();
      } catch (err: any) {
        setError(err.message || 'Failed to submit onboarding information');
      } finally {
        setIsSubmitting(false);
      }
    };

    if (success) {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center bg-surface/30 rounded-[40px] border-2 border-dashed border-border">
          <div className="w-24 h-24 bg-green-500/10 rounded-3xl flex items-center justify-center mb-8">
             <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-black text-heading mb-4 tracking-tight">Onboarding Submitted!</h1>
          <p className="text-muted text-lg max-w-lg mb-10 font-medium">
            Your university profile has been submitted for review. We'll process your application within 24-48 hours.
          </p>
          <Link href="/university" className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">
            Continue to Dashboard
          </Link>
        </div>
      );
    }

    if (showOnboarding) {
      return (
        <div className="min-h-[80vh] flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-surface rounded-2xl border border-border shadow-xl p-8">
            <h2 className="text-3xl font-bold text-heading mb-6">University Onboarding</h2>
            <p className="text-muted mb-8">Please provide your institution details to complete the setup.</p>

            {error && (
              <div className="p-3 bg-danger/10 text-danger rounded-lg text-sm font-medium border border-danger/20 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleOnboardingSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">University Name *</label>
                  <input
                    type="text"
                    required
                    value={onboardingData.universityName}
                    onChange={(e) => setOnboardingData({...onboardingData, universityName: e.target.value})}
                    className="w-full h-11 px-3 bg-bg border border-border rounded-lg text-body focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">Website</label>
                  <input
                    type="url"
                    value={onboardingData.website}
                    onChange={(e) => setOnboardingData({...onboardingData, website: e.target.value})}
                    className="w-full h-11 px-3 bg-bg border border-border rounded-lg text-body focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">Type</label>
                  <select
                    value={onboardingData.type}
                    onChange={(e) => setOnboardingData({...onboardingData, type: e.target.value})}
                    className="w-full h-11 px-3 bg-bg border border-border rounded-lg text-body focus:outline-none focus:border-primary"
                  >
                    <option value="Private">Private</option>
                    <option value="Public">Public</option>
                    <option value="Autonomous">Autonomous</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">Established Year</label>
                  <input
                    type="number"
                    value={onboardingData.establishedYear}
                    onChange={(e) => setOnboardingData({...onboardingData, establishedYear: e.target.value})}
                    className="w-full h-11 px-3 bg-bg border border-border rounded-lg text-body focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-heading mb-2">Address</label>
                <textarea
                  value={onboardingData.address}
                  onChange={(e) => setOnboardingData({...onboardingData, address: e.target.value})}
                  rows={3}
                  className="w-full px-3 bg-bg border border-border rounded-lg text-body focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">City</label>
                  <input
                    type="text"
                    value={onboardingData.city}
                    onChange={(e) => setOnboardingData({...onboardingData, city: e.target.value})}
                    className="w-full h-11 px-3 bg-bg border border-border rounded-lg text-body focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">State</label>
                  <input
                    type="text"
                    value={onboardingData.state}
                    onChange={(e) => setOnboardingData({...onboardingData, state: e.target.value})}
                    className="w-full h-11 px-3 bg-bg border border-border rounded-lg text-body focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">Country</label>
                  <input
                    type="text"
                    value={onboardingData.country}
                    onChange={(e) => setOnboardingData({...onboardingData, country: e.target.value})}
                    className="w-full h-11 px-3 bg-bg border border-border rounded-lg text-body focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-heading mb-2">Description</label>
                <textarea
                  value={onboardingData.description}
                  onChange={(e) => setOnboardingData({...onboardingData, description: e.target.value})}
                  rows={4}
                  placeholder="Brief description of your university..."
                  className="w-full px-3 bg-bg border border-border rounded-lg text-body focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowOnboarding(false)}
                  className="px-6 py-3 border border-border text-heading rounded-lg hover:bg-bg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Onboarding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center bg-surface/30 rounded-[40px] border-2 border-dashed border-border">
        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-8">
           <BuildingLibraryIcon className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-black text-heading mb-4 tracking-tight">Institutional Onboarding</h1>
        <p className="text-muted text-lg max-w-lg mb-10 font-medium">
          Your partner account is active. Complete the onboarding process to link your university profile and access the partner dashboard.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => setShowOnboarding(true)}
            className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all"
          >
            Start Onboarding
          </button>
          <Link href="/" className="px-8 py-4 border border-border text-heading font-black rounded-2xl hover:bg-bg transition-all">
            Back to Main Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[40px] bg-[#0F172A] p-8 lg:p-12 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-white rounded-3xl p-3 flex items-center justify-center shadow-2xl transform hover:rotate-3 transition-transform cursor-pointer">
              <img src={getUniversityLogo(universityData?.name || '')} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-3">
                {universityData?.name || 'Partner Portal'}
              </h1>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-success/20 text-success text-[11px] font-black uppercase tracking-widest rounded-full border border-success/20 flex items-center gap-1.5">
                  <ShieldCheckIcon className="w-3.5 h-3.5" /> Verified Institution
                </span>
                <span className="text-blue-200/60 text-xs font-bold">Academic Year 2026/27</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
             {/* Support and Event buttons removed as per request */}
          </div>
        </div>
      </motion.div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Applicants', val: stats?.totalApps || 0, icon: UsersIcon, color: 'primary' },
          { label: 'New This Week', val: stats?.newApps || 0, icon: ClockIcon, color: 'info' },
          { label: 'Under Review', val: stats?.reviewing || 0, icon: ChartBarIcon, color: 'warning' },
          { label: 'Offers Accepted', val: stats?.accepted || 0, icon: CheckCircleIcon, color: 'success' },
        ].map((s, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-surface rounded-[32px] border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group cursor-pointer"
          >
            <div className={`w-12 h-12 bg-${s.color}/10 rounded-2xl flex items-center justify-center text-${s.color} mb-6 group-hover:scale-110 transition-transform`}>
              <s.icon className="w-6 h-6" />
            </div>
            <p className="text-[11px] font-black text-muted uppercase tracking-widest mb-1">{s.label}</p>
            <h3 className="text-4xl font-black text-heading tracking-tight">{s.val}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-2 bg-surface rounded-[40px] border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-border flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-heading">Student Admissions Queue</h3>
              <p className="text-xs text-muted font-bold mt-1">Full list of candidate submissions for your programs</p>
            </div>
          </div>
          <div className="flex-1 p-4">
            <div className="space-y-4">
              {recentApplicants.length === 0 ? (
                <div className="py-20 text-center text-muted font-medium">No recent applications found.</div>
              ) : (
                recentApplicants.map((app) => (
                  <div key={app._id} className="p-5 hover:bg-bg rounded-3xl border border-transparent hover:border-border transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-light/10 flex items-center justify-center text-primary font-black text-lg">
                        {app.student?.firstName?.[0]}{app.student?.lastName?.[0]}
                      </div>
                      <div>
                        <h4 className="font-black text-heading group-hover:text-primary transition-colors">{app.student?.firstName} {app.student?.lastName}</h4>
                        <p className="text-xs text-muted font-bold mt-1 uppercase tracking-tight">{app.course}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="hidden md:block text-right">
                        <p className="text-[10px] font-black text-muted uppercase mb-1">Applied On</p>
                        <p className="text-xs font-bold text-heading">{new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        app.status === 'accepted' ? 'bg-success/10 text-success border-success/20' : 
                        app.status === 'rejected' ? 'bg-danger/10 text-danger border-danger/20' : 
                        'bg-warning/10 text-warning border-warning/20'
                      }`}>
                        {app.status}
                      </div>
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="p-2 bg-surface border border-border rounded-xl text-muted hover:text-primary transition-colors"
                      >
                         <ArrowUpRightIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {}
        <div className="space-y-8">
          {}
          <div className="p-8 bg-gradient-to-br from-primary to-primary-dark rounded-[40px] text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 opacity-70">Program Health</h3>
            <div className="space-y-8 relative z-10">
               <div>
                 <div className="flex justify-between items-center mb-3">
                   <span className="text-xs font-black">Offer Conversion</span>
                   <span className="text-xl font-black">84%</span>
                 </div>
                 <div className="w-full bg-white/10 rounded-full h-2">
                   <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} className="bg-white h-full rounded-full shadow-[0_0_10px_white]" />
                 </div>
               </div>
               <div>
                 <div className="flex justify-between items-center mb-3">
                   <span className="text-xs font-black">Response Time</span>
                   <span className="text-xl font-black">1.2d</span>
                 </div>
                 <div className="w-full bg-white/10 rounded-full h-2">
                   <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="bg-white h-full rounded-full shadow-[0_0_10px_white]" />
                 </div>
               </div>
            </div>
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
              className="bg-surface w-full max-w-2xl rounded-[40px] shadow-2xl border border-border overflow-hidden max-h-[90vh] overflow-y-auto"
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

                <div className="grid grid-cols-2 gap-6 mb-6">
                   <div className="p-6 bg-bg/50 rounded-3xl border border-border/50">
                      <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2">Program Selection</p>
                      <p className="text-sm font-black text-heading leading-tight">{selectedApp.course}</p>
                   </div>
                   <div className="p-6 bg-bg/50 rounded-3xl border border-border/50">
                      <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2">Contact Number</p>
                      <p className="text-sm font-black text-heading">{selectedApp.student?.phone || 'Not Provided'}</p>
                   </div>
                </div>

                <div className="mb-6">
                   <h4 className="text-[11px] font-black text-muted uppercase tracking-[0.2em] mb-4">Academic Background</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-surface border border-border rounded-2xl">
                         <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Institution</p>
                         <p className="text-sm font-bold text-heading">{selectedApp.academics?.institution || 'Not Provided'}</p>
                      </div>
                      <div className="p-4 bg-surface border border-border rounded-2xl">
                         <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Degree</p>
                         <p className="text-sm font-bold text-heading">{selectedApp.academics?.degree || 'Not Provided'}</p>
                      </div>
                   </div>
                </div>

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
                            <a 
                              href={`${baseUrl}/documents/${doc._id}/download?token=${localStorage.getItem('uafms_token')}`} 
                              target="_blank" 
                              download
                              className="p-2 bg-bg border border-border rounded-xl text-muted hover:text-primary transition-all"
                            >
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
                        {isProcessing === selectedApp._id ? 'Processing...' : 'Decline'}
                     </button>
                     <button 
                       onClick={() => handleDecision(selectedApp._id, 'accepted')}
                       disabled={isProcessing === selectedApp._id}
                       className="flex-1 h-16 bg-success text-white font-black rounded-2xl shadow-xl shadow-success/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                        {isProcessing === selectedApp._id ? 'Processing...' : 'Issue Offer'}
                     </button>
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
