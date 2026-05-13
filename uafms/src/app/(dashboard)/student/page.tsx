'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusIcon, CalendarIcon,
  DocumentTextIcon, ExclamationCircleIcon,
  ClockIcon, CheckCircleIcon, ChatBubbleLeftIcon,
  ChevronRightIcon, ShieldCheckIcon, AcademicCapIcon,
  VideoCameraIcon, ArrowUpRightIcon, UserGroupIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon, HeartIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import ChatBox from '@/components/chat/ChatBox';
import { getUniversityLogo } from '@/lib/universityLogos';

interface DashboardData {
  metrics: {
    overallProgress: number;
    activeApplications: number;
    acceptedApplications: number;
    pendingActions: number;
    nextDeadline: Date | null;
  };
  applications: {
    _id: string;
    course: string;
    status: string;
    currentStep: number;
    missingDocuments?: string[];
    university?: {
      name: string;
      logo?: string;
    };
  }[];
  counsellor: {
    user?: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  } | null;
  recommendations: {
    name: string;
    topCourse: string;
    logo?: string;
  }[];
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  const [bookingForm, setBookingForm] = useState({
    preferredDate: '',
    preferredTime: ''
  });

  const handleBookCounseling = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess('');

    try {
      await api.post('/bookings/book', bookingForm);
      setBookingSuccess('Counseling session booked successfully! You will receive a confirmation email shortly.');
      setTimeout(() => {
        setIsBookingModalOpen(false);
        setBookingSuccess('');
      }, 3000);
    } catch (err: any) {
      setBookingError(err.message || 'Failed to book session');
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/students/dashboard');
        setData(res.data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to load dashboard data');
        } else {
          setError('Failed to load dashboard data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'student') {
      fetchDashboard();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-[1400px] mx-auto text-center">
        <div className="bg-danger/10 text-danger p-4 rounded-lg border border-danger/20 inline-block">
          {error}
        </div>
      </div>
    );
  }

  const { metrics, applications, counsellor, recommendations } = data || {
    metrics: { overallProgress: 0, activeApplications: 0, acceptedApplications: 0, pendingActions: 0, nextDeadline: null },
    applications: [], counsellor: null, recommendations: []
  };

  const ProfileStrengthMeter = ({ progress }: { progress: number }) => (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm mb-8 relative overflow-hidden group">
      <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32" cy="32" r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-border"
              />
              <circle
                cx="32" cy="32" r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={175.9}
                strokeDashoffset={175.9 * (1 - progress / 100)}
                className="text-primary transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-heading">
              {progress}%
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-heading">Profile Strength</h3>
            <p className="text-sm text-muted">Complete your profile to unlock high-match university recommendations.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl">
             <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-0.5 whitespace-nowrap">Next Best Action</p>
             <p className="text-xs font-bold text-heading">Add your Standardized Test Scores</p>
          </div>
          <Link href="/student/apply" className="px-5 py-2.5 bg-heading text-surface text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
            Complete Profile
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-8 fade-in transition-colors duration-300">

      {}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1">Welcome Back, {user?.firstName || 'Student'}</h1>
          <p className="text-body mt-1">Here is what is happening with your applications today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="h-10 px-4 bg-surface border border-border text-heading hover:bg-bg rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
          >
            <CalendarIcon className="w-4 h-4" /> Book Counselling
          </button>
          <Link href="/student/apply" className="h-10 px-4 bg-primary text-white hover:bg-primary-dark rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> New Application
          </Link>
        </div>
      </div>

      <ProfileStrengthMeter progress={85} />

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {}
        <div className="bg-surface rounded-xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label text-muted">OVERALL PROGRESS</span>
            <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center text-info">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-heading mb-3">{metrics.overallProgress}%</div>
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div className="bg-info h-full rounded-full" style={{ width: `${metrics.overallProgress}%` }}></div>
          </div>
          <p className="text-xs text-muted mt-3 font-medium">Profile completion and app readiness.</p>
        </div>

        {}
        <div className="bg-surface rounded-xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label text-muted">APPLICATIONS</span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <DocumentTextIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-heading mb-1">{metrics.activeApplications}</div>
          <p className="text-sm text-success flex items-center font-medium mt-2">
            <CheckCircleIcon className="w-4 h-4 mr-1" /> {metrics.acceptedApplications} Accepted
          </p>
        </div>

        {}
        <div className="bg-surface rounded-xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label text-muted">PENDING ACTIONS</span>
            <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center text-warning">
              <ExclamationCircleIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-heading mb-1">{metrics.pendingActions}</div>
          <p className={`text-sm flex items-center font-medium mt-2 ${metrics.pendingActions > 0 ? 'text-warning' : 'text-success'}`}>
            {metrics.pendingActions > 0 ? 'Action Required' : 'All caught up!'}
          </p>
        </div>

        {}
        <div className="bg-surface rounded-xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label text-muted">NEXT DEADLINE</span>
            <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center text-danger">
              <ClockIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-heading mb-1">
             {metrics.nextDeadline ? new Date(metrics.nextDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None'}
          </div>
          <p className="text-sm text-muted flex items-center font-medium mt-2">
            {metrics.nextDeadline ? 'Upcoming Deadline' : 'No deadlines approaching'}
          </p>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center">
              <h3 className="text-h3 text-heading">Active Applications</h3>
              <a href="/student/apply" className="text-sm font-bold text-primary hover:underline">View All</a>
            </div>

            {}


            <div className="divide-y divide-border">
              {applications.length === 0 ? (
                <div className="p-8 text-center text-muted">
                  You don&apos;t have any active applications yet.
                </div>
              ) : (
                applications.map((app: DashboardData['applications'][0]) => (
                  <div key={app._id} className="p-6 hover:bg-bg/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white rounded-lg border border-border flex items-center justify-center shadow-sm p-2 flex-shrink-0">
                          <img src={getUniversityLogo(app.university?.name || '')} alt={app.university?.name || 'Partner University'} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                          <h4 className="text-[16px] font-semibold text-heading">{app.university?.name || 'Partner University'}</h4>
                          <p className="text-sm text-muted">{app.course || 'General Admission'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          app.status === 'accepted' ? 'bg-success/10 text-success border-success/20' :
                          app.status === 'rejected' ? 'bg-danger/10 text-danger border-danger/20' :
                          app.status === 'action_required' ? 'bg-warning/10 text-warning border-warning/20' :
                          'bg-info/10 text-info border-info/20'
                        }`}>
                          {app.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <button className="text-muted hover:text-heading p-1"><ChevronRightIcon className="w-5 h-5" /></button>
                      </div>
                    </div>

                    {app.status === 'action_required' && app.missingDocuments && app.missingDocuments.length > 0 && (
                      <div className="bg-[#FDECEC] rounded-md p-3 mb-4 flex items-start gap-3 border border-danger/20">
                        <ExclamationCircleIcon className="w-5 h-5 text-danger mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <span className="font-semibold text-danger block">Missing Document</span>
                          <span className="text-danger/80">Please upload your {app.missingDocuments[0]} to proceed. <a href="#" className="underline font-medium">Upload now</a></span>
                        </div>
                      </div>
                    )}

                    {}
                    <div className="mt-6 flex items-center justify-between relative px-2">
                      <div className="absolute left-6 right-6 top-3 h-[2px] bg-border -z-10"></div>
                      <div className="absolute left-6 top-3 h-[2px] bg-primary -z-10 transition-all duration-500" style={{ width: `${((app.currentStep - 1) / 3) * 100}%` }}></div>

                      {['Draft', 'Submitted', 'Under Review', 'Decision'].map((step, i) => {
                        const stepNumber = i + 1;
                        const isCompleted = app.currentStep > stepNumber || app.status === 'accepted' || app.status === 'rejected';
                        const isCurrent = app.currentStep === stepNumber && app.status !== 'accepted' && app.status !== 'rejected';

                        return (
                          <div key={i} className="flex flex-col items-center gap-2 bg-surface">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isCompleted ? 'bg-primary text-white border-2 border-primary' :
                              isCurrent ? 'bg-surface border-2 border-primary text-primary shadow-[0_0_0_4px_#FFF0E6]' :
                              'bg-surface border-2 border-border text-muted'
                            }`}>
                              {isCompleted ? <CheckCircleIcon className="w-4 h-4" /> : stepNumber}
                            </div>
                            <span className={`text-[11px] font-semibold ${isCompleted || isCurrent ? 'text-heading' : 'text-muted'}`}>{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {}
        <div className="space-y-6">

          {}

          {}
          <div className="bg-surface rounded-xl border border-border shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-light"></div>
            <h3 className="text-h4 mb-4">Your Counsellor</h3>

            {counsellor ? (
              <>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-surface shadow-md flex-shrink-0 bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    {counsellor.user?.firstName?.[0] || 'C'}
                  </div>
                  <div>
                    <h4 className="font-bold text-heading">{counsellor.user?.firstName} {counsellor.user?.lastName}</h4>
                    <p className="text-xs text-muted mb-1">Admissions Expert (India)</p>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-success bg-success/10 px-2.5 py-0.5 rounded-full w-max">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span> Online
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                     onClick={() => setIsChatOpen(true)}
                     className="flex items-center justify-center gap-2 h-9 bg-bg hover:bg-border text-heading text-sm font-medium rounded-md transition-colors"
                  >
                    <ChatBubbleLeftIcon className="w-4 h-4" /> Message
                  </button>
                  <button className="flex items-center justify-center gap-2 h-9 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium rounded-md transition-colors">
                     Book Call
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center p-8 bg-surface border border-dashed border-border rounded-xl mt-2 relative overflow-hidden group">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
                  <UserGroupIcon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-heading mb-1">Expert Consultation</h4>
                <p className="text-[11px] text-muted mb-4 leading-relaxed">
                  Book a 1-on-1 session with our certified education experts for personalized guidance.
                </p>
                <button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full py-2.5 bg-heading text-white text-[13px] font-bold rounded-lg hover:opacity-90 transition-all"
                >
                  Schedule Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isBookingModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-md rounded-3xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-heading">Book Counseling</h3>
                <button onClick={() => setIsBookingModalOpen(false)} className="text-muted hover:text-heading">
                  <PlusIcon className="w-6 h-6 rotate-45" />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
                    <CheckCircleIcon className="w-10 h-10" />
                  </div>
                  <p className="text-heading font-bold">{bookingSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleBookCounseling} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-muted uppercase tracking-widest">Preferred Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full h-12 px-4 bg-bg border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-heading font-medium"
                      value={bookingForm.preferredDate}
                      onChange={(e) => setBookingForm({...bookingForm, preferredDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-muted uppercase tracking-widest">Preferred Time</label>
                    <input
                      type="time"
                      required
                      className="w-full h-12 px-4 bg-bg border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-heading font-medium"
                      value={bookingForm.preferredTime}
                      onChange={(e) => setBookingForm({...bookingForm, preferredTime: e.target.value})}
                    />
                  </div>

                  {bookingError && (
                    <div className="p-3 bg-danger/10 text-danger text-xs font-bold rounded-lg border border-danger/20">
                      {bookingError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {}
      {counsellor && counsellor.user && (
         <ChatBox
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            recipientId={counsellor.user._id}
            recipientName={`${counsellor.user.firstName} ${counsellor.user.lastName}`}
         />
      )}

    </div>
  );
}
