'use client';

import React from 'react';
import {
  BriefcaseIcon,
  AcademicCapIcon,
  MapPinIcon,
  LightBulbIcon,
  GlobeAltIcon,
  BuildingLibraryIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

const preferences = [
  { id: 1, student: 'Sneha Gupta', interest: 'Computer Science', country: 'UK', budget: '₹25L - ₹35L', deadline: 'Sep 2026', topUnis: 'Oxford, Imperial College' },
  { id: 2, student: 'Rahul Kumar', interest: 'Artificial Intelligence', country: 'USA', budget: '₹40L - ₹60L', deadline: 'Jan 2027', topUnis: 'MIT, Stanford University' },
  { id: 3, student: 'Priya Sharma', interest: 'Business Management', country: 'Canada', budget: '₹30L - ₹45L', deadline: 'Sep 2026', topUnis: 'Toronto, McGill University' },
];

export default function StudentPrefsPage() {
  const [popularUniversities, setPopularUniversities] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await api.get('/universities');
        // getUniversities returns the array directly
        const unis = Array.isArray(res.data) ? res.data : (res.data?.data || []);

        const topUnis = unis.sort((a: any, b: any) => (b.ytdEnrolled || 0) - (a.ytdEnrolled || 0)).slice(0, 6);
        setPopularUniversities(topUnis);
      } catch (err) {
        console.error('Failed to fetch preferences', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-heading tracking-tight">Intent & Preferences</h1>
          <p className="text-muted font-medium">Analyzing student interests and geographical targets.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-2xl border border-primary/20">
          <LightBulbIcon className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold text-primary">AI Insight: STEM Demand is up 24%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {preferences.map((p, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={p.id}
            className="bg-surface border border-border rounded-3xl p-6 shadow-sm hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">
                <AcademicCapIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-heading group-hover:text-primary transition-colors">{p.interest}</h3>
                <p className="text-[10px] text-muted font-black uppercase tracking-widest">Active Interest</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted font-medium">
                  <BriefcaseIcon className="w-4 h-4 text-primary" /> Budget
                </div>
                <span className="text-sm font-bold text-heading">{p.budget}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted font-medium">
                  <BuildingLibraryIcon className="w-4 h-4 text-primary" /> Top Unis
                </div>
                <span className="text-sm font-bold text-heading text-right max-w-[150px] truncate" title={p.topUnis}>{p.topUnis}</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border flex justify-between items-center">
              <div className="text-[10px] font-black text-muted uppercase tracking-widest">Target Intake</div>
              <div className="text-sm font-black text-primary">{p.deadline}</div>
            </div>
          </motion.div>
        ))}
      </div>



      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-heading tracking-tight">Most Popular Universities</h2>
          <p className="text-muted font-medium text-sm">Based on active student applications and intent volume.</p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted font-bold">Loading insights...</div>
        ) : popularUniversities.length === 0 ? (
          <div className="p-12 text-center text-muted font-medium italic border border-border rounded-3xl bg-surface">No data available yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularUniversities.map((uni, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={uni._id}
                className="bg-surface border border-border rounded-3xl p-6 shadow-sm hover:border-primary/30 hover:shadow-md transition-all group flex items-start gap-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-bg border border-border flex items-center justify-center shrink-0 overflow-hidden relative">
                  {uni.logo ? (
                    <img src={uni.logo} alt={uni.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <BuildingLibraryIcon className="w-8 h-8 text-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-heading text-lg leading-tight truncate group-hover:text-primary transition-colors" title={uni.name}>
                    {uni.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted font-medium mt-1">
                    <MapPinIcon className="w-3.5 h-3.5" />
                    <span className="truncate">{uni.location || 'Unknown'}, {uni.country}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 inline-flex px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-widest">
                    <UsersIcon className="w-3.5 h-3.5" />
                    {uni.ytdEnrolled || 0} {(uni.ytdEnrolled === 1) ? 'Enrollment' : 'Enrollments'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
