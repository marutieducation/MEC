'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ArrowRightIcon, 
  SparklesIcon,
  PhoneIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function LeadCapturePage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    universityId: '',
    course: '',
    source: 'Public Short-Link (/l)'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [universities, setUniversities] = useState<any[]>([]);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const res = await api.get('/universities');
        setUniversities(Array.isArray(res) ? res : (res.data || []));
      } catch (err) {
        console.error('Failed to fetch universities', err);
      }
    };
    fetchUniversities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/leads/submit', formData);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface max-w-md w-full rounded-[32px] p-10 border border-border text-center shadow-2xl shadow-primary/10"
        >
          <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-heading mb-4">Application Received!</h2>
          <p className="text-muted mb-8 leading-relaxed">
            Thank you for your interest. One of our senior academic counsellors will contact you within 24 hours to guide you further.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            Back to Home <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col lg:flex-row overflow-hidden font-sans">
      {}
      <div className="hidden lg:flex lg:w-[45%] bg-[#1A1A2E] relative flex-col justify-center px-16 xl:px-24 py-20 text-white overflow-hidden">
        {}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary opacity-10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500 opacity-10 rounded-full blur-[100px] -ml-24 -mb-24"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2 shadow-lg group-hover:scale-110 transition-transform">
              <img src="/logo.jpeg" alt="MEC Logo" className="max-w-full max-h-full object-contain" />
            </div>
            <span className="text-2xl font-black tracking-tight">MEC UAFMS</span>
          </Link>

          <h1 className="text-5xl xl:text-6xl font-black leading-[1.1] mb-8">
            Your Future <br/>
            <span className="text-primary italic">Starts Here.</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-lg leading-relaxed">
            Join 50,000+ students who found their dream college with MEC's expert guidance and unified application platform.
          </p>

          <div className="space-y-6">
            {[
              { icon: AcademicCapIcon, text: 'Access to 500+ Top Institutions' },
              { icon: SparklesIcon, text: 'AI-Powered Course Matching' },
              { icon: BuildingLibraryIcon, text: 'Direct Admission Assistance' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-4 text-lg font-bold"
              >
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-primary">
                  <item.icon className="w-6 h-6" />
                </div>
                {item.text}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-12 relative">
        <div className="absolute top-0 right-0 p-8 lg:hidden">
          <Link href="/" className="w-12 h-12 bg-white rounded-xl shadow-md border border-border flex items-center justify-center p-2">
            <img src="/logo.jpeg" alt="MEC Logo" className="max-w-full max-h-full object-contain" />
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-lg"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-black text-heading mb-2">Get Started Today</h2>
            <p className="text-muted font-medium">Fill in your details and let our experts handle the rest.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-danger/10 text-danger rounded-2xl text-sm font-bold border border-danger/20">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-muted uppercase tracking-widest ml-1">First Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Rahul"
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full h-14 pl-12 pr-4 bg-surface border border-border rounded-2xl text-[15px] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-muted uppercase tracking-widest ml-1">Last Name</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. Sharma"
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="w-full h-14 px-4 bg-surface border border-border rounded-2xl text-[15px] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-muted uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input 
                  required 
                  type="email" 
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full h-14 pl-12 pr-4 bg-surface border border-border rounded-2xl text-[15px] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-muted uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative">
                <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input 
                  required 
                  type="tel" 
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full h-14 pl-12 pr-4 bg-surface border border-border rounded-2xl text-[15px] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-muted uppercase tracking-widest ml-1">Target University (Optional)</label>
              <select 
                value={formData.universityId}
                onChange={e => setFormData({...formData, universityId: e.target.value})}
                className="w-full h-14 px-4 bg-surface border border-border rounded-2xl text-[15px] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium appearance-none"
              >
                <option value="">I'm not sure yet</option>
                {universities.map(uni => (
                  <option key={uni._id} value={uni._id}>{uni.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-muted uppercase tracking-widest ml-1">Preferred Course</label>
              <input 
                type="text" 
                placeholder="e.g. MBA, B.Tech CSE, etc."
                value={formData.course}
                onChange={e => setFormData({...formData, course: e.target.value})}
                className="w-full h-14 px-4 bg-surface border border-border rounded-2xl text-[15px] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-16 bg-primary text-white text-lg font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Submit Interest <ArrowRightIcon className="w-6 h-6" /></>
              )}
            </button>
            
            <p className="text-center text-[12px] text-muted font-medium pt-4">
              By submitting, you agree to our <Link href="/terms" className="text-primary hover:underline">Terms</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
