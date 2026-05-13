'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getUniversityLogo } from '@/lib/universityLogos';
import {
  AdjustmentsHorizontalIcon, MapPinIcon, CurrencyRupeeIcon,
  CalendarDaysIcon, MagnifyingGlassIcon,
  ChevronDownIcon, AcademicCapIcon, ChartBarIcon,
  CheckCircleIcon, PlusIcon, SparklesIcon,
  ChevronRightIcon, ArrowRightIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const INDIAN_STATES_AND_UTS = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const ugDegrees = ['B.Tech', 'B.E', 'B.Sc', 'B.Com', 'B.A', 'BBA', 'BCA', 'LLB', 'B.Pharm', 'B.Ed', 'MBBS', 'BDS', 'B.Arch'];
const pgDegrees = ['M.Tech', 'M.E', 'M.Sc', 'M.Com', 'M.A', 'MBA', 'MCA', 'LLM', 'M.Pharm', 'M.Ed', 'MD', 'MS', 'PGDM'];
const otherDegrees = ['PhD', 'Diploma'];

export default function SearchComparison({ isDashboard = false }: { isDashboard?: boolean }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState('Moderate');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
  const [sortBy, setSortBy] = useState('match');
  const [filterState, setFilterState] = useState('Any State');
  const [filterDegree, setFilterDegree] = useState('All Levels');
  const [isComparing, setIsComparing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [appliedPrograms, setAppliedPrograms] = useState<any[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDegreeDropdownOpen, setIsDegreeDropdownOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const degreeDropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {

        let programs: any[] = [];
        try {
          const [apps] = await Promise.all([
            api.get('/applications'),
            api.get('/auth/me')
          ]);
          programs = apps.map((a: any) => ({
            universityId: a.university?._id || a.university,
            course: a.course
          })).filter((p: any) => p.universityId);
          setAppliedPrograms(programs);
        } catch (authErr) {
          console.log('Guest user or auth failed, skipping profile pre-sets');
        }

        const res = await api.get('/universities/search?limit=50');
        const mapped = res.results.map((r: any) => ({
          id: r.courseId,
          universityId: r.universityId,
          name: r.universityName,
          location: r.location,
          course: r.courseName,
          match: r.matchScore,
          fee: r.fee,
          duration: r.duration,
          intake: r.intake,
          degreeLevel: r.degreeLevel,
          logo: getUniversityLogo(r.universityName)
        }));
        setResults(mapped);


        const appliedCourseIds = mapped.filter((m: any) => 
          programs.some((p: any) => p.universityId === m.universityId && p.course === m.course)
        ).map((m: any) => m.id);
        setSelectedIds(prev => Array.from(new Set([...prev, ...appliedCourseIds])));

      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    if (searchParams.get('submitted') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  // Auto-sync selection with the Unified Application Form cart
  useEffect(() => {
    if (isLoading || results.length === 0) return;
    
    const cart = results
      .filter(r => selectedIds.includes(r.id))
      .map(r => ({
        universityId: r.universityId,
        universityName: r.name,
        course: r.course,
        fee: r.fee
      }));
    
    if (cart.length > 0 || selectedIds.length > 0) {
      localStorage.setItem('mec_application_cart', JSON.stringify(cart));
    }
  }, [selectedIds, results, isLoading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (degreeDropdownRef.current && !degreeDropdownRef.current.contains(event.target as Node)) {
        setIsDegreeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onCourseSelect = (id: string) => {
    const course = results.find(r => r.id === id);
    if (!course) return;

    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      // Filter out any other programs from the same university
      const filteredIds = selectedIds.filter(selectedId => {
        const selectedCourse = results.find(r => r.id === selectedId);
        return selectedCourse?.universityId !== course.universityId;
      });

      if (filteredIds.length < 4) {
        setSelectedIds([...filteredIds, id]);
      } else {
        alert('You can select up to 4 programs for comparison.');
      }
    }
  };

  const clearAll = () => {
    setSelectedIds([]);
    setSearchTerm('');
    setFilterState('Any State');
    setFilterDegree('All Levels');
    // Stay on current page but clear query params (prevents kicking student out of dashboard)
    router.push(window.location.pathname);
  };

  const compareSelected = () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one program to compare.');
      return;
    }
    setIsComparing(true);
  };

  const handleApply = async (univId: string, universityName: string, courseName: string, courseId: string) => {

    const token = localStorage.getItem('uafms_token');
    if (!token) {
      router.push(`/login?redirect=${window.location.pathname}&query=${searchTerm}`);
      return;
    }

    if (appliedPrograms.some(p => p.universityId === univId && p.course === courseName)) return;

    setIsApplying(true);
    try {
      await api.post('/applications', {
        university: univId,
        course: courseName,
        source: 'Web'
      });
      setAppliedPrograms([...appliedPrograms, { universityId: univId, course: courseName }]);
      if (!selectedIds.includes(courseId)) {
        setSelectedIds(prev => [...prev, courseId]);
      }
      alert(`Successfully applied to ${universityName}!`);
    } catch (err: any) {
      alert(err.message || 'Failed to apply');
    } finally {
      setIsApplying(false);
    }
  };

  const selectedResults = results.filter(r => selectedIds.includes(r.id));

  const handleApplyBulk = async () => {
    const token = localStorage.getItem('uafms_token');
    if (!token) {
      router.push(`/login?redirect=${window.location.pathname}&query=${searchTerm}`);
      return;
    }

    setIsApplying(true);
    try {
      const apps = selectedResults
        .filter(r => !appliedPrograms.some(p => p.universityId === r.universityId && p.course === r.course))
        .map(r => ({
          universityId: r.universityId,
          course: r.course,
          source: 'Web'
        }));

      if (apps.length === 0) {
        alert('All selected programs are already applied to.');
        return;
      }

      await api.post('/applications/bulk', { applications: apps });
      const newApps = apps.map(a => ({ universityId: a.universityId, course: a.course }));
      setAppliedPrograms([...appliedPrograms, ...newApps]);
      alert(`Successfully applied to ${apps.length} programs!`);
    } catch (err: any) {
      alert(err.message || 'Failed to submit bulk applications');
    } finally {
      setIsApplying(false);
    }
  };

  const normalize = (str: string) => str.toLowerCase().replace(/[\.\s-]/g, '');

  const filteredResults = results.filter(course => {
    const term = normalize(searchTerm);
    const matchesSearch =
      normalize(course.name).includes(term) ||
      normalize(course.course).includes(term) ||
      normalize(course.location).includes(term);

    const matchesState = filterState === 'Any State' || course.location.includes(filterState);

    let matchesDegree = filterDegree === 'All Levels';
    if (!matchesDegree) {
      if (filterDegree === 'Undergraduate (UG)') {
        matchesDegree = course.degreeLevel === 'bachelors';
      } else if (filterDegree === 'Postgraduate (PG)') {
        matchesDegree = course.degreeLevel === 'masters' || course.degreeLevel === 'mba';
      } else if (filterDegree === 'Doctoral & Others') {
        matchesDegree = course.degreeLevel === 'phd' || course.course.toLowerCase().includes('diploma');
      } else {
        matchesDegree = course.course.includes(filterDegree);
      }
    }

    return matchesSearch && matchesState && matchesDegree;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'match') return b.match - a.match;
    if (sortBy === 'fee') {
      const getFee = (f: string) => parseInt(f.replace(/[^\d]/g, '')) || 0;
      return getFee(a.fee) - getFee(b.fee);
    }
    if (sortBy === 'duration') return a.duration.localeCompare(b.duration);
    return 0;
  });

  const appliedIds = (appliedPrograms || []).map((p: any) => p.universityId);

  const lifestyleCosts: Record<string, string> = {
    'Frugal': '20,000',
    'Moderate': '40,000',
    'Premium': '60,000+'
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6 fade-in h-auto flex flex-col pb-24">

      {}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-success/10 border border-success/20 p-4 rounded-xl flex items-center gap-4 shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-heading text-[15px]">Application Submitted Successfully!</h4>
              <p className="text-[13px] text-muted">Your profile has been sent to the selected universities.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Search by course, university, or skill"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-bg border border-border rounded-lg text-heading placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all text-[15px] font-medium"
            />
          </div>
          <div className="flex gap-3">
             <div className="relative group text-heading">
               <select
                 value={filterState}
                 onChange={(e) => setFilterState(e.target.value)}
                 className="h-12 px-4 pl-10 bg-bg border border-border text-heading hover:bg-border/50 rounded-lg font-medium text-[14px] transition-colors appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none min-w-[160px]"
               >
                 <option>Any State</option>
                 {INDIAN_STATES_AND_UTS.map(state => (
                   <option key={state} value={state} className="bg-surface text-heading">{state}</option>
                 ))}
               </select>
               <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
               <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
             </div>

             <div className="relative group" ref={degreeDropdownRef}>
               <button
                 onClick={() => setIsDegreeDropdownOpen(!isDegreeDropdownOpen)}
                 className="h-12 px-4 pl-10 pr-10 bg-bg border border-border text-heading hover:bg-border/50 rounded-lg font-medium text-[14px] transition-colors flex items-center gap-2 min-w-[180px] w-full lg:w-auto relative"
               >
                 <AcademicCapIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                 <span className="truncate">{filterDegree}</span>
                 <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted transition-transform duration-200 ${isDegreeDropdownOpen ? 'rotate-180' : ''}`} />
               </button>

               <AnimatePresence>
                 {isDegreeDropdownOpen && (
                   <motion.div
                     initial={{ opacity: 0, y: 8, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 8, scale: 0.95 }}
                     transition={{ duration: 0.2 }}
                     className="absolute top-full left-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden py-2"
                   >
                     <div
                       className="px-4 py-2 hover:bg-bg cursor-pointer transition-colors text-heading font-semibold text-[13px] border-b border-border/50"
                       onClick={() => {
                         setFilterDegree('All Levels');
                         setIsDegreeDropdownOpen(false);
                       }}
                     >
                       All Levels
                     </div>

                     {[
                       { id: 'UG', label: 'Undergraduate (UG)', degrees: ugDegrees },
                       { id: 'PG', label: 'Postgraduate (PG)', degrees: pgDegrees },
                       { id: 'PHD', label: 'Doctoral & Others', degrees: otherDegrees }
                     ].map((category) => (
                       <div key={category.id} className="border-b last:border-none border-border/30">
                         <button
                           onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                           className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-bg transition-colors group"
                         >
                           <span
                             className="text-[13px] font-bold text-muted group-hover:text-primary transition-colors flex-1 text-left"
                             onClick={(e) => {
                               e.stopPropagation();
                               setFilterDegree(category.label);
                               setIsDegreeDropdownOpen(false);
                             }}
                           >
                             {category.label}
                           </span>
                           <ChevronRightIcon className={`w-3.5 h-3.5 text-muted transition-transform duration-300 ${expandedCategory === category.id ? 'rotate-90 text-primary' : ''}`} />
                         </button>
                         <AnimatePresence initial={false}>
                           {expandedCategory === category.id && (
                             <motion.div
                               initial={{ height: 0, opacity: 0 }}
                               animate={{ height: 'auto', opacity: 1 }}
                               exit={{ height: 0, opacity: 0 }}
                               transition={{ duration: 0.3, ease: 'easeInOut' }}
                               className="overflow-hidden bg-bg/50"
                             >
                               <div className="py-1 grid grid-cols-2 gap-1 px-2 mb-2">
                                 {category.degrees.map((deg) => (
                                   <button
                                     key={deg}
                                     onClick={() => {
                                       setFilterDegree(deg);
                                       setIsDegreeDropdownOpen(false);
                                     }}
                                     className="px-3 py-1.5 text-left text-[12px] text-body hover:bg-primary/10 hover:text-primary rounded-md transition-all font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                                   >
                                     {deg}
                                   </button>
                                 ))}
                               </div>
                             </motion.div>
                           )}
                         </AnimatePresence>
                       </div>
                     ))}
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>

             <button
               onClick={() => alert('Advanced filters coming soon...')}
               className="h-12 px-4 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-lg font-semibold text-[14px] transition-colors flex items-center gap-2 whitespace-nowrap hidden sm:flex"
             >
               <AdjustmentsHorizontalIcon className="w-5 h-5" /> Filters (3)
             </button>
          </div>
        </div>
      </div>


      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">

        {}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <div className="flex justify-between items-center px-1">
             <h2 className="text-[16px] font-bold text-heading">{filteredResults.length} Programs Found</h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-[13px] text-primary bg-transparent border-none font-bold cursor-pointer focus:ring-0 p-0"
              >
                <option value="match">Best Match</option>
                <option value="fee">Lowest Fee</option>
                <option value="duration">Duration</option>
              </select>
          </div>

          <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-2 pb-4">
            <AnimatePresence mode="popLayout">
            {isLoading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="loading" className="bg-surface border border-border rounded-xl p-12 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted">Searching the best programs for you...</p>
              </motion.div>
            ) : sortedResults.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="empty" className="bg-surface border border-dashed border-border rounded-xl p-12 text-center">
                <h3 className="text-h4 text-heading mb-1 mt-4">No programs found</h3>
                <p className="text-sm text-muted">Try adjusting your search terms or filters.</p>
              </motion.div>
            ) : sortedResults.map((course) => {
              const isSelected = selectedIds.includes(course.id);
              const isApplied = appliedPrograms.some(p => p.universityId === course.universityId && p.course === course.course);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={course.id}
                  onClick={() => onCourseSelect(course.id)}
                  className={`bg-surface border rounded-xl p-5 transition-all flex flex-col sm:flex-row gap-5 cursor-pointer ${
                    isSelected ? 'border-primary shadow-[0_0_0_1px_#FF6B00] shadow-primary/10' : 'border-border hover:border-muted hover:shadow-sm'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3 shrink-0 sm:w-24">
                    <div className="w-16 h-16 rounded-lg bg-[#f8f9fa] border border-border shadow-sm flex items-center justify-center p-2">
                        <img 
                          src={getUniversityLogo(course.name)} 
                          alt={course.name} 
                          className="max-w-full max-h-full object-contain" 
                        />
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] uppercase font-bold text-success tracking-wider leading-none">Match</span>
                      <div className="text-[16px] font-extrabold text-heading">{course.match}%</div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2 gap-4">
                      <div>
                        <h3 className="text-[18px] font-bold text-heading hover:text-primary transition-colors">{course.course}</h3>
                        <p className="text-[14px] text-muted font-medium flex items-center gap-1.5 mt-0.5">
                          {course.name}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                          isSelected ? 'bg-primary border-primary text-white' : 'border-border bg-surface'
                        } ${isApplied ? 'bg-success/20 border-success/30' : ''}`}>
                          {isSelected && <span className="text-white text-[10px]">✓</span>}
                          {!isSelected && isApplied && <CheckCircleIcon className="w-3 h-3 text-success" />}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-border/50">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg text-[12px] font-medium text-heading border border-border">
                          {course.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg text-[12px] font-medium text-heading border border-border">
                          {course.fee}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg text-[12px] font-medium text-heading border border-border">
                          {course.duration}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg text-[12px] font-medium text-heading border border-border">
                          {course.intake}
                        </span>
                      </div>

                      <button
                         onClick={(e) => {
                           e.stopPropagation();
                           handleApply(course.universityId, course.name, course.course, course.id);
                         }}
                         disabled={isApplied || isApplying}
                         className={`px-5 py-2 rounded-lg text-[13px] font-bold transition-all flex items-center gap-2 ${
                           isApplied
                           ? 'bg-success/10 text-success border border-success/20 cursor-default'
                           : 'bg-primary text-white hover:bg-primary-dark shadow-sm'
                         }`}
                      >
                         {isApplied ? 'Applied' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </div>
        </div>

        {}
        <div className="lg:col-span-1 flex flex-col gap-6">

          {}
          <div className="bg-surface rounded-xl border border-border shadow-sm p-6 flex flex-col h-fit sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-heading">My Selection</h3>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">
                {selectedIds.length}/4
              </span>
            </div>

            {selectedIds.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border rounded-lg bg-bg/50">
                <PlusIcon className="w-8 h-8 text-muted/30 mx-auto mb-2" />
                <p className="text-[12px] text-muted px-4">Select up to 4 programs to compare and apply</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {selectedResults.map(res => {
                  const isApplied = appliedPrograms.some(p => p.universityId === res.universityId && p.course === res.course);
                  return (
                    <div key={res.id} className="flex items-center gap-3 p-2 rounded-lg bg-bg/50 border border-border/50">
                      <div className="w-10 h-10 rounded bg-white border border-border flex items-center justify-center p-1 shrink-0">
                        <img src={getUniversityLogo(res.name)} alt={res.name} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-heading line-clamp-1 leading-tight">{res.course}</p>
                        <p className="text-[11px] text-muted line-clamp-1">{res.name}</p>
                      </div>
                      <button
                        onClick={() => onCourseSelect(res.id)}
                        className={`p-1.5 rounded-md transition-colors ${
                          isApplied ? 'text-success cursor-default' : 'text-muted hover:text-error hover:bg-error/10'
                        }`}
                      >
                        {isApplied ? <CheckCircleIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4 rotate-45" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={compareSelected}
                disabled={selectedIds.length === 0}
                className="w-full h-11 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 text-[13px]"
              >
                <ChartBarIcon className="w-4 h-4" /> Compare Programs
              </button>
              <button
                onClick={clearAll}
                disabled={selectedIds.length === 0}
                className="w-full h-10 text-muted font-semibold hover:text-heading transition-colors text-[12px]"
              >
                Clear Selection
              </button>
            </div>
          </div>

          {}
          <div className="bg-surface rounded-xl border border-border shadow-sm p-6 flex flex-col h-fit">
            <h3 className="text-[16px] font-bold text-heading mb-1">Cost Estimator</h3>
            <p className="text-[12px] text-muted mb-6">Estimate monthly living expenses.</p>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[13px] font-semibold text-heading flex justify-between">
                  Lifestyle <span className="text-primary">{lifestyle}</span>
                </label>
                <div className="flex bg-bg rounded p-1 w-full border border-border">
                  {['Frugal', 'Moderate', 'Premium'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setLifestyle(type)}
                      className={`flex-1 text-[11px] font-semibold py-1.5 rounded transition-all ${lifestyle === type ? 'bg-surface shadow-sm text-primary' : 'text-muted hover:text-body'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
                <span className="text-[11px] font-bold text-primary uppercase block mb-1">Monthly Cost</span>
                <span className="text-2xl font-extrabold text-heading tracking-tight">₹{lifestyleCosts[lifestyle]}</span>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-muted">Rent (50%)</span>
                  <span className="font-semibold text-heading">₹{(parseInt(lifestyleCosts[lifestyle].replace(/[^\d]/g, '')) * 0.5).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-muted">Food (25%)</span>
                  <span className="font-semibold text-heading">₹{(parseInt(lifestyleCosts[lifestyle].replace(/[^\d]/g, '')) * 0.25).toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-bg">
                   <div className="bg-blue-500 h-full" style={{ width: '50%' }}></div>
                   <div className="bg-green-500 h-full" style={{ width: '25%' }}></div>
                   <div className="bg-yellow-500 h-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ translateY: 100 }}
            animate={{ translateY: 0 }}
            exit={{ translateY: 100 }}
            className={`fixed bottom-0 ${isDashboard ? 'lg:left-64' : 'lg:left-0'} right-0 h-20 bg-[#1A1A2E] border-t border-gray-800 shadow-[0_-10px_30px_rgba(0,0,0,0.15)] px-6 lg:px-8 flex items-center justify-between z-20`}
          >
            <div className="flex items-center gap-4 text-white">
              <div className="hidden sm:flex -space-x-2">
                {selectedResults.map((res, idx) => (
                  <div key={res.id} style={{ zIndex: 40 - idx }} className="w-10 h-10 rounded-full bg-surface border-2 border-[#1A1A2E] flex items-center justify-center p-1 shadow-sm overflow-hidden text-heading">
                    <img 
                      src={getUniversityLogo(res.name)} 
                      className="w-full h-full object-contain" 
                      alt={res.name} 
                    />
                  </div>
                ))}
              </div>
              <div>
                <span className="font-bold block text-sm">{selectedIds.length} Programs Selected</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={clearAll} className="px-4 h-10 text-sm font-semibold text-gray-300 hover:text-white">Clear All</button>
              <button
                onClick={compareSelected}
                className="px-6 h-10 rounded-lg bg-primary hover:bg-primary-dark text-white text-[14px] font-bold transition-colors shadow-sm flex items-center gap-2"
              >
                Compare Selected <PlusIcon className="w-4 h-4 rotate-45" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {isComparing && (() => {

          const getFeeNum = (f: string) => parseFloat(f.replace(/[^0-9.]/g, '')) || 0;
          const fees = selectedResults.map(r => getFeeNum(r.fee));
          const matches = selectedResults.map(r => r.match);
          const lowestFee = Math.min(...fees);
          const highestMatch = Math.max(...matches);

          const degreeLabelMap: Record<string, { label: string; color: string }> = {
            bachelors: { label: 'UG', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
            masters: { label: 'PG', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
            mba: { label: 'MBA', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
            phd: { label: 'Ph.D.', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
            diploma: { label: 'Diploma', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
          };

          const getDurationYears = (d: string) => parseFloat(d.replace(/[^0-9.]/g, '')) || 0;


          const CompRow = ({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) => (
            <div className="grid border-b border-border/50" style={{ gridTemplateColumns: `200px repeat(${selectedResults.length}, 1fr)` }}>
              <div className="p-4 text-[13px] font-semibold text-muted border-r border-border flex items-center gap-2">
                {icon} {label}
              </div>
              {children}
            </div>
          );

          const Cell = ({ children, idx }: { children: React.ReactNode; idx: number }) => (
            <div className={`p-4 text-center ${idx < selectedResults.length - 1 ? 'border-r border-border/50' : ''}`}>
              {children}
            </div>
          );

          return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-surface w-full max-w-6xl h-full max-h-[90vh] rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
            >
              {}
              <div className="px-8 py-5 border-b border-border flex items-center justify-between bg-bg/50 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <ChartBarIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-heading">Program Comparison</h2>
                    <p className="text-[12px] text-muted">Detailed side-by-side analysis of {selectedResults.length} programs</p>
                  </div>
                </div>
                <button onClick={() => setIsComparing(false)} className="p-2 hover:bg-border/50 rounded-full transition-colors">
                  <PlusIcon className="w-6 h-6 rotate-45 text-muted" />
                </button>
              </div>

              {}
              <div className="flex-1 overflow-auto">
                <div className="min-w-[800px]">

                  {}
                  <div className="sticky top-0 z-10 bg-surface border-b border-border">
                    <div className="grid" style={{ gridTemplateColumns: `200px repeat(${selectedResults.length}, 1fr)` }}>
                      <div className="p-4 border-r border-border"></div>
                      {selectedResults.map((res, idx) => (
                        <div key={res.id} className={`p-4 text-center ${idx < selectedResults.length - 1 ? 'border-r border-border' : ''}`}>
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 bg-[#f8f9fa] border border-border rounded-xl flex items-center justify-center p-1.5 shadow-sm">
                              <img 
                                src={getUniversityLogo(res.name)} 
                                alt={res.name} 
                                className="max-w-full max-h-full object-contain" 
                              />
                            </div>
                            <span className="text-[13px] font-bold text-heading line-clamp-2 leading-tight">{res.name}</span>
                            <span className="text-[11px] text-muted line-clamp-1">{res.course}</span>
                            {degreeLabelMap[res.degreeLevel] && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${degreeLabelMap[res.degreeLevel].color}`}>
                                {degreeLabelMap[res.degreeLevel].label}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {}
                  <div className="border-b border-border">
                    <div className="px-6 py-3 bg-primary/5 border-b border-border">
                      <h3 className="text-[11px] font-black text-primary uppercase tracking-[2px]">Match & Compatibility</h3>
                    </div>
                    <CompRow label="Match Score" icon={<SparklesIcon className="w-4 h-4 text-primary" />}>
                      {selectedResults.map((res, idx) => (
                        <Cell key={res.id} idx={idx}>
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="relative w-16 h-16">
                              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0-31.831" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
                                <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0-31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${res.match}, 100`} className={res.match === highestMatch ? 'text-success' : 'text-primary'} />
                              </svg>
                              <span className={`absolute inset-0 flex items-center justify-center text-[14px] font-extrabold ${res.match === highestMatch ? 'text-success' : 'text-heading'}`}>
                                {res.match}%
                              </span>
                            </div>
                            {res.match === highestMatch && selectedResults.length > 1 && (
                              <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">★ Best Match</span>
                            )}
                          </div>
                        </Cell>
                      ))}
                    </CompRow>
                  </div>

                  {}
                  <div className="border-b border-border">
                    <div className="px-6 py-3 bg-green-500/5 border-b border-border">
                      <h3 className="text-[11px] font-black text-green-600 uppercase tracking-[2px]">Financial Overview</h3>
                    </div>
                    <CompRow label="Annual Tuition" icon={<CurrencyRupeeIcon className="w-4 h-4 text-muted" />}>
                      {selectedResults.map((res, idx) => {
                        const isCheapest = getFeeNum(res.fee) === lowestFee;
                        return (
                          <Cell key={res.id} idx={idx}>
                            <span className={`text-[15px] font-bold ${isCheapest ? 'text-success' : 'text-primary'}`}>{res.fee}</span>
                            {isCheapest && selectedResults.length > 1 && (
                              <div className="mt-1"><span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">💰 Lowest</span></div>
                            )}
                          </Cell>
                        );
                      })}
                    </CompRow>
                    <CompRow label="Est. Total Tuition" icon={<CurrencyRupeeIcon className="w-4 h-4 text-muted" />}>
                      {selectedResults.map((res, idx) => {
                        const years = getDurationYears(res.duration);
                        const total = (getFeeNum(res.fee) * years).toFixed(1);
                        return (
                          <Cell key={res.id} idx={idx}>
                            <span className="text-[15px] font-bold text-heading">₹{total}L</span>
                            <div className="text-[11px] text-muted mt-0.5">{res.fee} × {years} yrs</div>
                          </Cell>
                        );
                      })}
                    </CompRow>
                    <CompRow label="Est. Living Cost" icon={<CurrencyRupeeIcon className="w-4 h-4 text-muted" />}>
                      {selectedResults.map((res, idx) => {
                        const loc = res.location.toLowerCase();
                        let cost = '₹10K-15K';
                        if (loc.includes('ahmedabad') || loc.includes('surat') || loc.includes('vadodara')) cost = '₹15K-25K';
                        else if (loc.includes('gandhinagar')) cost = '₹12K-18K';
                        return (
                          <Cell key={res.id} idx={idx}>
                            <span className="text-[14px] font-semibold text-heading">{cost}</span>
                            <div className="text-[11px] text-muted mt-0.5">per month (approx)</div>
                          </Cell>
                        );
                      })}
                    </CompRow>
                  </div>

                  {}
                  <div className="border-b border-border">
                    <div className="px-6 py-3 bg-blue-500/5 border-b border-border">
                      <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[2px]">Academic Details</h3>
                    </div>
                    <CompRow label="Course Name" icon={<AcademicCapIcon className="w-4 h-4 text-muted" />}>
                      {selectedResults.map((res, idx) => (
                        <Cell key={res.id} idx={idx}>
                          <span className="text-[13px] font-bold text-heading">{res.course}</span>
                        </Cell>
                      ))}
                    </CompRow>
                    <CompRow label="Degree Level" icon={<AcademicCapIcon className="w-4 h-4 text-muted" />}>
                      {selectedResults.map((res, idx) => {
                        const dl = degreeLabelMap[res.degreeLevel] || { label: res.degreeLevel, color: 'bg-gray-100 text-gray-600 border-gray-200' };
                        return (
                          <Cell key={res.id} idx={idx}>
                            <span className={`text-[12px] font-bold px-3 py-1 rounded-full border ${dl.color} inline-block`}>{dl.label}</span>
                          </Cell>
                        );
                      })}
                    </CompRow>
                    <CompRow label="Duration" icon={<CalendarDaysIcon className="w-4 h-4 text-muted" />}>
                      {selectedResults.map((res, idx) => {
                        const shortest = Math.min(...selectedResults.map(r => getDurationYears(r.duration)));
                        const isShortest = getDurationYears(res.duration) === shortest;
                        return (
                          <Cell key={res.id} idx={idx}>
                            <span className={`text-[14px] font-bold ${isShortest ? 'text-info' : 'text-heading'}`}>{res.duration}</span>
                            {isShortest && selectedResults.length > 1 && (
                              <div className="mt-1"><span className="text-[10px] font-bold text-info bg-info/10 px-2 py-0.5 rounded-full">⚡ Shortest</span></div>
                            )}
                          </Cell>
                        );
                      })}
                    </CompRow>
                    <CompRow label="Next Intake" icon={<CalendarDaysIcon className="w-4 h-4 text-muted" />}>
                      {selectedResults.map((res, idx) => (
                        <Cell key={res.id} idx={idx}>
                          <span className="text-[13px] font-semibold text-heading">{res.intake}</span>
                        </Cell>
                      ))}
                    </CompRow>
                  </div>

                  {}
                  <div className="border-b border-border">
                    <div className="px-6 py-3 bg-purple-500/5 border-b border-border">
                      <h3 className="text-[11px] font-black text-purple-600 uppercase tracking-[2px]">Location & Logistics</h3>
                    </div>
                    <CompRow label="City / Region" icon={<MapPinIcon className="w-4 h-4 text-muted" />}>
                      {selectedResults.map((res, idx) => (
                        <Cell key={res.id} idx={idx}>
                          <div className="flex items-center justify-center gap-1.5">
                            <MapPinIcon className="w-4 h-4 text-primary" />
                            <span className="text-[13px] font-semibold text-heading">{res.location}</span>
                          </div>
                        </Cell>
                      ))}
                    </CompRow>
                    <CompRow label="State" icon={<MapPinIcon className="w-4 h-4 text-muted" />}>
                      {selectedResults.map((res, idx) => (
                        <Cell key={res.id} idx={idx}>
                          <span className="text-[13px] font-medium text-body">Gujarat, India</span>
                        </Cell>
                      ))}
                    </CompRow>
                  </div>

                  {}
                  <div>
                    <div className="px-6 py-3 bg-amber-500/5 border-b border-border">
                      <h3 className="text-[11px] font-black text-amber-600 uppercase tracking-[2px]">Quick Actions</h3>
                    </div>
                    <CompRow label="Apply" icon={<SparklesIcon className="w-4 h-4 text-muted" />}>
                      {selectedResults.map((res, idx) => {
                        const isApplied = appliedIds.includes(res.universityId);
                        return (
                          <Cell key={res.id} idx={idx}>
                            {isApplied ? (
                              <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-success bg-success/10 px-3 py-1.5 rounded-lg">
                                <CheckCircleIcon className="w-4 h-4" /> Applied
                              </span>
                            ) : (
                              <button
                                onClick={() => handleApply(res.universityId, res.name, res.course, res.id)}
                                disabled={isApplying}
                                className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white bg-primary hover:bg-primary-dark px-4 py-1.5 rounded-lg transition-colors shadow-sm"
                              >
                                Apply Now
                              </button>
                            )}
                          </Cell>
                        );
                      })}
                    </CompRow>
                  </div>

                </div>
              </div>

              {}
              <div className="px-8 py-5 border-t border-border flex items-center justify-between bg-bg/50 shrink-0">
                <div className="text-[12px] text-muted">
                  <span className="font-semibold text-heading">{selectedResults.length}</span> programs compared
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setIsComparing(false)} className="px-5 h-10 border border-border text-heading font-bold rounded-xl hover:bg-border/50 transition-colors text-[13px]">
                    Close
                  </button>
                  {isDashboard ? (
                    <button 
                      onClick={() => router.push('/student/apply')}
                      className="px-6 h-10 bg-success text-white font-bold rounded-xl hover:bg-success-dark transition-colors shadow-lg shadow-success/20 flex items-center gap-2 text-[13px]"
                    >
                      Proceed to Application <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={handleApplyBulk} disabled={isApplying} className="px-6 h-10 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 flex items-center gap-2 text-[13px]">
                      {isApplying ? 'Applying...' : 'Apply to All'} <SparklesIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
