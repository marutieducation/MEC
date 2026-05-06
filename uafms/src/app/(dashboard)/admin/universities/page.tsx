'use client';

import React, { useState, useEffect } from 'react';
import {
  BuildingLibraryIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  MapPinIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { getUniversityLogo } from '@/lib/universityLogos';

interface Course {
  name: string;
  fee: string;
  duration: string;
  intake: string;
  degreeLevel: 'bachelors' | 'masters' | 'mba' | 'phd';
}

interface University {
  _id: string;
  name: string;
  location: string;
  country: string;
  logo: string;
  description: string;
  courses: Course[];
}

export default function UniversityManagement() {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);


  const [formData, setFormData] = useState({
    name: '',
    location: '',
    country: 'India',
    logo: '',
    description: '',
  });

  const [courses, setCourses] = useState<Course[]>([
    { name: '', fee: '', duration: '', intake: '', degreeLevel: 'masters' }
  ]);

  useEffect(() => {
    if (view === 'list') {
      fetchUniversities();
    }
  }, [view]);

  const fetchUniversities = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/universities');
      setUniversities(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error('Failed to fetch universities', err);
      setUniversities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (uni: University) => {
    setEditingId(uni._id);
    setFormData({
      name: uni.name,
      location: uni.location,
      country: uni.country,
      logo: uni.logo || '',
      description: uni.description || '',
    });
    setCourses(uni.courses.length > 0 ? uni.courses : [{ name: '', fee: '', duration: '', intake: '', degreeLevel: 'masters' }]);
    setView('edit');
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;

    setIsLoading(true);
    try {
      await api.delete(`/universities/${id}`);
      fetchUniversities();
    } catch (err) {
      console.error('Failed to delete university', err);
      alert('Failed to delete university');
    } finally {
      setIsLoading(false);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCourseChange = (index: number, field: keyof Course, value: string) => {
    const updatedCourses = [...courses];
    updatedCourses[index] = { ...updatedCourses[index], [field]: value };
    setCourses(updatedCourses);
  };

  const addCourse = () => {
    setCourses([...courses, { name: '', fee: '', duration: '', intake: '', degreeLevel: 'masters' }]);
  };

  const removeCourse = (index: number) => {
    if (courses.length > 1) {
      setCourses(courses.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    try {
      const payload = {
        ...formData,
        courses: courses.filter(c => c.name.trim() !== '')
      };

      if (view === 'edit' && editingId) {
        await api.put(`/universities/${editingId}`, payload);
        setStatus({ type: 'success', message: 'University updated successfully!' });
      } else {
        await api.post('/universities', payload);
        setStatus({ type: 'success', message: 'University added successfully!' });
      }


      setTimeout(() => {
        setView('list');
        setEditingId(null);
        setFormData({ name: '', location: '', country: 'India', logo: '', description: '' });
        setCourses([{ name: '', fee: '', duration: '', intake: '', degreeLevel: 'masters' }]);
        setStatus(null);
      }, 1500);
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err.message || `Failed to ${view === 'edit' ? 'update' : 'add'} university`
      });
      setIsLoading(false);
    }
  };

  const filteredUnis = (universities || []).filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 fade-in h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            {view === 'list' ? <BuildingLibraryIcon className="w-7 h-7 text-primary" /> : <PlusIcon className="w-7 h-7 text-primary" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-heading">
              {view === 'list' ? 'University Directory' : view === 'add' ? 'Add New Institution' : 'Edit Institution'}
            </h1>
            <p className="text-muted text-sm font-medium">
              {view === 'list' ? `Managing ${universities.length} institutions globally` : 'Expand the global academic catalog'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {view === 'list' ? (
            <>
              <div className="relative w-64">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search directory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                />
              </div>
              <button
                onClick={() => setView('add')}
                className="h-11 px-6 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" /> Add College
              </button>
            </>
          ) : (
            <button
              onClick={() => { setView('list'); setStatus(null); setEditingId(null); }}
              className="h-11 px-6 bg-surface border border-border text-heading text-sm font-bold rounded-xl hover:bg-bg transition-all flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" /> Back to Directory
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12"
            >
              {isLoading && universities.length === 0 ? (
                Array(8).fill(0).map((_, i) => (
                  <div key={i} className="bg-surface h-48 border border-border rounded-3xl animate-pulse" />
                ))
              ) : filteredUnis.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                   <div className="w-20 h-20 bg-bg rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-border">
                      <BuildingLibraryIcon className="w-10 h-10 text-muted/30" />
                   </div>
                   <h3 className="text-lg font-bold text-heading">No match found</h3>
                   <p className="text-muted text-sm">Try searching for a different name or location</p>
                </div>
              ) : (
                filteredUnis.map((uni) => (
                  <motion.div
                    key={uni._id}
                    layout
                    whileHover={{ y: -5 }}
                    className="bg-surface border border-border rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all group flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-bg rounded-xl flex items-center justify-center border border-border overflow-hidden shrink-0">
                        <img src={getUniversityLogo(uni.name)} alt={uni.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(uni); }}
                          className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all"
                         >
                           <PlusIcon className="w-4 h-4" /> {}
                         </button>
                         <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(uni._id, uni.name); }}
                          className="p-2 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-lg transition-all"
                         >
                           <TrashIcon className="w-4 h-4" />
                         </button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-heading group-hover:text-primary transition-colors line-clamp-1 mb-1">
                      {uni.name}
                    </h3>

                    <div className="flex items-center gap-1 text-muted text-xs font-medium mb-4">
                      <MapPinIcon className="w-3.5 h-3.5" />
                      {uni.location}, {uni.country}
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-border">
                       <div className="bg-bg rounded-xl p-2 text-center">
                          <p className="text-[10px] font-black text-muted uppercase tracking-wider mb-0.5">Courses</p>
                          <p className="text-sm font-bold text-heading">{uni.courses?.length || 0}</p>
                       </div>
                       <div className="bg-bg rounded-xl p-2 text-center" onClick={() => handleEdit(uni)}>
                          <p className="text-[10px] font-black text-muted uppercase tracking-wider mb-0.5 italic cursor-pointer hover:text-primary">Edit Details</p>
                          <p className="text-sm font-bold text-heading">
                            {Array.from(new Set(uni.courses?.map(c => c.degreeLevel) || [])).length || '-'}
                          </p>
                       </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.form
              key="add"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit}
              className="max-w-4xl mx-auto space-y-8 pb-12"
            >
              <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-heading flex items-center gap-2">
                   <BuildingLibraryIcon className="w-5 h-5 text-primary" /> Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted">University Name</label>
                    <div className="flex gap-3">
                      <input
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="flex-1 h-12 px-4 bg-bg border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="e.g. IIT Delhi"
                      />
                      <div className="w-12 h-12 bg-white rounded-xl border border-border flex items-center justify-center p-1.5 shadow-sm shrink-0 overflow-hidden">
                        <img src={getUniversityLogo(formData.name)} alt="Logo Preview" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted">Location</label>
                    <input
                      required
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 bg-bg border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="e.g. New Delhi, Delhi"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted">Country</label>
                    <input
                      required
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 bg-bg border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted">Logo URL (optional override)</label>
                    <input
                      name="logo"
                      value={formData.logo}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 bg-bg border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Leave blank to use static logo map"
                    />
                    <p className="text-[11px] text-muted">Logos are automatically resolved from the built-in university map. Only set this if you need a manual override.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted">Brief Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-4 bg-bg border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    placeholder="Brief overview..."
                  />
                </div>
              </div>

              <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-heading flex items-center gap-2">
                    <AcademicCapIcon className="w-5 h-5 text-primary" /> Course Catalog
                  </h3>
                  <button
                    type="button"
                    onClick={addCourse}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 transition-all"
                  >
                    <PlusIcon className="w-4 h-4" /> Add Course
                  </button>
                </div>

                <div className="space-y-4">
                  {courses.map((course, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-bg border border-border rounded-2xl relative group"
                    >
                      <button
                        type="button"
                        onClick={() => removeCourse(index)}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-danger text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted">Course Name</label>
                          <input
                            value={course.name}
                            onChange={(e) => handleCourseChange(index, 'name', e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="e.g. B.Tech"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted">Degree Level</label>
                          <select
                            value={course.degreeLevel}
                            onChange={(e) => handleCourseChange(index, 'degreeLevel', e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                          >
                            <option value="bachelors">Bachelors</option>
                            <option value="masters">Masters</option>
                            <option value="mba">MBA</option>
                            <option value="phd">Ph.D</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted">Fee (₹ Lakhs)</label>
                          <input
                            value={course.fee}
                            onChange={(e) => handleCourseChange(index, 'fee', e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="₹2.5L"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {status && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${
                  status.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'
                }`}>
                  {status.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <ExclamationCircleIcon className="w-5 h-5" />}
                  {status.message}
                </div>
              )}

              <button
                disabled={isLoading}
                className="w-full h-14 bg-primary text-white text-base font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <BuildingLibraryIcon className="w-5 h-5" />
                    {view === 'edit' ? 'Update Institution Details' : 'Publish Institution Account'}
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
