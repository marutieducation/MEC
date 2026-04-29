'use client';

import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon, CheckCircleIcon, XMarkIcon,
  SparklesIcon, UserIcon, EnvelopeIcon, FunnelIcon,
  DocumentMagnifyingGlassIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getUniversityLogo } from '@/lib/universityLogos';

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

  if (isLoading && applicants.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6 fade-in h-[calc(100vh-64px)] flex flex-col">

      {}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-[#002147] text-white p-6 rounded-xl border border-[#001730] shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#ffffff15] to-transparent pointer-events-none"></div>

        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-full bg-white border-2 border-white flex items-center justify-center shadow-lg p-1 shrink-0">
             <img 
               src={getUniversityLogo(user?.universityId?.name || '')} 
               alt="University Logo" 
               className="max-w-full max-h-full object-contain" 
             />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif tracking-tight">{user?.universityId?.name || 'Partner Portal'}</h1>
            <p className="text-[13px] text-[#A6C8FF] mt-1 flex items-center gap-1.5 font-medium">
               <BuildingOfficeIcon className="w-4 h-4" /> Official Admissions Network
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="text-center">
            <p className="text-[11px] text-[#A6C8FF] font-bold uppercase tracking-widest mb-0.5">Queue Size</p>
            <p className="text-2xl font-extrabold tracking-tight">{applicants.length}</p>
          </div>
          <div className="w-px h-10 bg-[#ffffff30]"></div>
          <button onClick={fetchApplicants} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowPathIcon className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-0">

        {}
        <div className="xl:col-span-3 flex flex-col bg-surface border border-border rounded-xl shadow-sm min-h-0 overflow-hidden">

          <div className="p-4 border-b border-border flex justify-between items-center bg-bg/50 shrink-0">
             <h3 className="text-[15px] font-bold text-heading">Applicant Verification Queue</h3>
             <div className="flex gap-2">
                {error && <span className="text-xs text-danger flex items-center mr-4">{error}</span>}
                <button className="h-8 px-3 bg-white border border-border text-heading hover:bg-bg rounded flex items-center gap-1.5 text-[12px] font-semibold transition-colors shadow-sm">
                    <FunnelIcon className="w-3.5 h-3.5" /> Filter
                </button>
             </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface border-b border-border text-muted">
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-center">Match Score</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[13px]">
                {applicants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted">
                      No pending applications in your queue.
                    </td>
                  </tr>
                ) : (
                  applicants.map((app) => (
                    <tr key={app._id} className="hover:bg-bg/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-heading">{app.student?.firstName} {app.student?.lastName}</span>
                          <span className="text-[11px] text-muted">{app.student?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-heading">
                        {app.course}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                            <SparklesIcon className="w-4 h-4 text-warning" />
                            <span className={`font-extrabold ${app.aiMatchScore >= 90 ? 'text-success' : app.aiMatchScore >= 80 ? 'text-info' : 'text-warning'}`}>
                              {app.aiMatchScore}%
                            </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${
                          app.status === 'under_review' ? 'bg-info/10 text-info border-info/20' :
                          'bg-warning/10 text-warning border-warning/20'
                        }`}>
                          {app.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 bg-bg border border-border text-heading hover:bg-surface hover:border-primary hover:text-primary rounded shadow-sm w-[90px] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors">
                                <DocumentMagnifyingGlassIcon className="w-3.5 h-3.5" /> Dossier
                            </button>
                            <div className="w-px h-6 bg-border mx-1"></div>
                            {isProcessing === app._id ? (
                                <ArrowPathIcon className="w-6 h-6 animate-spin text-muted" />
                            ) : (
                                <>
                                  <button
                                    onClick={() => handleDecision(app._id, 'accepted')}
                                    className="p-1.5 text-success hover:bg-success/10 rounded transition-colors"
                                    title="Accept & Issue Offer"
                                  >
                                    <CheckCircleIcon className="w-6 h-6" />
                                  </button>
                                  <button
                                    onClick={() => handleDecision(app._id, 'rejected')}
                                    className="p-1.5 text-danger hover:bg-danger/10 rounded transition-colors"
                                    title="Reject Application"
                                  >
                                    <XMarkIcon className="w-6 h-6" />
                                  </button>
                                </>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {}
        <div className="xl:col-span-1 flex flex-col gap-6 min-h-0">
          <div className="bg-surface rounded-xl border border-border shadow-sm p-6">
             <h3 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-4">MEC Account Support</h3>
             <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary shadow-sm flex-shrink-0 relative bg-primary/10 flex items-center justify-center text-primary font-bold">
                   SJ
                </div>
                <div>
                   <h4 className="font-bold text-heading">Sarah Jenkins</h4>
                   <p className="text-[12px] text-muted">Director of Partnerships</p>
                </div>
             </div>

             <div className="space-y-2">
                <button className="w-full h-9 bg-bg hover:bg-border text-heading border border-border rounded-lg text-[12px] font-semibold flex items-center justify-center gap-2 transition-colors">
                   <EnvelopeIcon className="w-4 h-4" /> Message
                </button>
             </div>
          </div>

          {}
          <div className="bg-bg rounded-xl border border-border shadow-sm p-5 flex-1 overflow-y-auto">
             <h3 className="text-[12px] font-bold text-heading uppercase tracking-wider mb-4 border-b border-border pb-2">Partnership Health</h3>
             <div className="space-y-5 text-[13px]">
                <div>
                   <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-heading">Doc Accuracy</span>
                      <span className="font-bold text-success">99.2%</span>
                   </div>
                   <div className="w-full bg-border rounded-full h-1.5"><div className="bg-success h-full rounded-full w-[99%]"></div></div>
                </div>
                <div>
                   <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-heading">Offer Intake</span>
                      <span className="font-bold text-primary">74%</span>
                   </div>
                   <div className="w-full bg-border rounded-full h-1.5"><div className="bg-primary h-full rounded-full w-[74%]"></div></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
