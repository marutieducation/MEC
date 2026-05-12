'use client';

import React, { useState, useEffect } from 'react';
import { HeartIcon, BuildingLibraryIcon, AcademicCapIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { api } from '@/lib/api';
import { getUniversityLogo } from '@/lib/universityLogos';
import Link from 'next/link';

export default function SavedProgramsPage() {
  const [saved, setSaved] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await api.get('/students/saved-programs');
        setSaved(res || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load saved programs');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSaved();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 fade-in">
      <div>
        <h1 className="text-h1 text-heading">Saved Programs</h1>
        <p className="text-body text-muted mt-1">Shortlisted courses you are considering for your next application.</p>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger p-4 rounded-xl border border-danger/20">
          {error}
        </div>
      )}

      {saved.length === 0 ? (
        <div className="bg-surface border border-dashed border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-bg rounded-full flex items-center justify-center text-muted mb-4">
            <HeartIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-heading">No saved programs yet</h2>
          <p className="text-sm text-muted mt-2 max-w-md">
            You haven't shortlisted any colleges or courses. Explore programs and click the heart icon to save them here for later.
          </p>
          <Link href="/student/search" className="mt-6 px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
            Explore Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {saved.map((item) => (
            <div key={item._id} className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:border-primary transition-all group relative">
              <button className="absolute top-4 right-4 text-primary p-2 bg-primary/5 rounded-full hover:bg-primary/10">
                <HeartSolidIcon className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-3 mb-6">
                 <div className="w-16 h-16 rounded-2xl bg-bg border border-border flex items-center justify-center text-primary group-hover:scale-105 transition-transform overflow-hidden p-2">
                   <img 
                    src={getUniversityLogo(item.universityId?.name || '')} 
                    alt={item.universityId?.name} 
                    className="w-full h-full object-contain" 
                   />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-heading group-hover:text-primary transition-colors line-clamp-1">{item.courseName}</h3>
                   <p className="text-sm font-medium text-muted">{item.universityId?.name || 'Partner University'}</p>
                 </div>
              </div>

              <div className="space-y-3 mb-6">
                 <div className="flex items-center gap-2 text-xs text-muted">
                   <MapPinIcon className="w-4 h-4" /> {item.universityId?.location || 'India'}
                 </div>
                 <div className="flex items-center gap-2 text-xs text-muted">
                   <AcademicCapIcon className="w-4 h-4" /> Professional Course
                 </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-between items-center">
                 <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Saved On</p>
                   <p className="text-xs font-bold text-heading">{new Date(item.savedAt).toLocaleDateString()}</p>
                 </div>
                 <Link 
                  href={`/student/search?query=${encodeURIComponent(item.courseName)}`}
                  className="px-4 py-2 bg-primary text-white text-[12px] font-bold rounded-lg shadow-md shadow-primary/10"
                 >
                   View Details
                 </Link>
              </div>
            </div>
          ))}

          <Link href="/student/search" className="border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 hover:border-primary/50 transition-all cursor-pointer group">
             <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center text-muted group-hover:text-primary transition-colors">
                <BuildingLibraryIcon className="w-6 h-6" />
             </div>
             <p className="text-sm font-bold text-muted group-hover:text-primary">Find more courses</p>
          </Link>
        </div>
      )}
    </div>
  );
}
