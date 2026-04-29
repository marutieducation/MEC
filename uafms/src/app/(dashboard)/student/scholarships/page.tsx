'use client';

import React, { useEffect, useState } from 'react';
import { AcademicCapIcon, SparklesIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

interface Scholarship {
  _id: string;
  name: string;
  provider: string;
  amount: string;
  deadline: string;
  match: number;
  applyUrl: string;
  description: string;
}

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        const data = await api.get('/scholarships');
        setScholarships(data);
      } catch (error) {
        console.error('Failed to fetch scholarships:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchScholarships();
  }, []);

  const handleApply = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 fade-in">
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h1 className="text-h1">Scholarships & Grants</h1>
          <p className="text-body mt-1">Personalized funding opportunities fetched from live institution portals.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-bold text-sm">
          <SparklesIcon className="w-4 h-4" /> Live Sync Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm space-y-2 transition-colors">
          <p className="text-label">Potential Aid</p>
          <p className="text-3xl font-black text-heading">₹12.5L+</p>
          <div className="text-[11px] text-primary font-bold flex items-center gap-1">
            Verified for 2024-25
          </div>
        </div>
        <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm space-y-2 transition-colors">
          <p className="text-label">Eligible Matches</p>
          <p className="text-3xl font-black text-heading">{scholarships.length}</p>
          <div className="text-[11px] text-muted font-bold">IIT & National Portals</div>
        </div>
        <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm space-y-2 transition-colors">
          <p className="text-label">Active Applications</p>
          <p className="text-3xl font-black text-heading">00</p>
          <div className="text-[11px] text-muted font-bold tracking-tight">External forms linked</div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-h3">Recommended for You</h2>
        <div className="grid grid-cols-1 gap-4">
          {scholarships.map((s) => (
            <div key={s._id} className="p-6 bg-surface border border-border rounded-2xl hover:border-primary transition-all flex flex-col md:flex-row justify-between items-center gap-6 group">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <TrophyIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-heading group-hover:text-primary transition-colors">{s.name}</h3>
                  <p className="text-sm font-medium text-muted">{s.provider}</p>
                  <p className="text-[11px] text-muted mt-1 max-w-sm line-clamp-1">{s.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-8 items-center text-center">
                <div>
                  <p className="text-label mb-1">Value</p>
                  <p className="text-sm font-bold text-heading">{s.amount}</p>
                </div>
                <div>
                  <p className="text-label mb-1">Deadline</p>
                  <p className="text-sm font-bold text-muted">{s.deadline}</p>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[12px] font-bold border border-primary/20">
                  {s.match}% Match
                </div>
                <button
                  onClick={() => handleApply(s.applyUrl)}
                  className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
