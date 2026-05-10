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
  EnvelopeIcon,
  ArrowPathIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
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

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.universityId) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const [dashboardRes, applicantsRes] = await Promise.all([
          api.get('/university-portal/dashboard'),
          api.get('/university-portal/applicants?limit=5')
        ]);
        
        setStats(dashboardRes.stats);
        setUniversityData(dashboardRes.university);
        setRecentApplicants(applicantsRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

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
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center bg-surface/30 rounded-[40px] border-2 border-dashed border-border">
        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-8">
           <BuildingLibraryIcon className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-black text-heading mb-4 tracking-tight">Institutional Onboarding</h1>
        <p className="text-muted text-lg max-w-lg mb-10 font-medium">
          Your partner account is active, but hasn't been linked to a university profile yet. 
          Please contact <span className="text-primary font-bold">onboarding@mec.com</span> to finalize your setup.
        </p>
        <Link href="/" className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">
          Back to Main Portal
        </Link>
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
             <button className="h-14 px-8 bg-white/5 border border-white/10 rounded-2xl font-black text-sm hover:bg-white/10 transition-all flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5" /> Inbound Support
             </button>
             <button className="h-14 px-8 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
                Post New Event <ArrowUpRightIcon className="w-5 h-5" />
             </button>
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
              <h3 className="text-xl font-black text-heading">Recent Admissions Activity</h3>
              <p className="text-xs text-muted font-bold mt-1">Latest candidate submissions for your programs</p>
            </div>
            <Link href="/university/applicants" className="text-[11px] font-black text-primary uppercase tracking-widest hover:underline">
              View All Queue
            </Link>
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
                      <button className="p-2 bg-surface border border-border rounded-xl text-muted hover:text-primary transition-colors">
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

          {}
          <div className="p-8 bg-surface rounded-[40px] border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
               <CalendarDaysIcon className="w-5 h-5 text-primary" />
               <h3 className="text-[11px] font-black text-heading uppercase tracking-widest">Upcoming Events</h3>
            </div>
            <div className="space-y-6">
               {[
                 { title: 'Global MBA Webinar', date: 'Oct 24, 2026', type: 'WEBINAR' },
                 { title: 'Annual Convocation', date: 'Nov 02, 2026', type: 'CEREMONY' }
               ].map((ev, i) => (
                 <div key={i} className="flex gap-4">
                   <div className="w-12 h-12 bg-bg rounded-2xl flex flex-col items-center justify-center border border-border shrink-0">
                      <span className="text-[10px] font-black text-primary">OCT</span>
                      <span className="text-sm font-black text-heading leading-tight">24</span>
                   </div>
                   <div>
                     <h5 className="text-[13px] font-black text-heading">{ev.title}</h5>
                     <p className="text-[10px] text-muted font-bold mt-0.5 tracking-tight">{ev.type} • {ev.date}</p>
                   </div>
                 </div>
               ))}
               <button className="w-full py-4 text-[11px] font-black text-primary uppercase tracking-widest hover:underline">
                  Manage Events Schedule
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
