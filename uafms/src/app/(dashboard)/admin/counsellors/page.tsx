'use client';

import React, { useState, useEffect } from 'react';
import {
  UserPlusIcon, FunnelIcon, MagnifyingGlassIcon,
  SparklesIcon, ArrowPathIcon, EllipsisVerticalIcon,
  TrashIcon, PencilSquareIcon, XMarkIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid';
import { api } from '@/lib/api';

interface Counsellor {
  _id: string;
  name: string;
  role: string;
  region: string;
  languages: string[];
  activeStudents: number;
  capacity: number;
  utilizationRate: number;
  acceptingLeads: boolean;
  avatar?: string;
}

export default function CounsellorManagement() {
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCounsellor, setSelectedCounsellor] = useState<Counsellor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'General Counsellor',
    region: 'North India',
    languages: 'English, Hindi',
    capacity: 50,
    acceptingLeads: true
  });

  useEffect(() => {
    fetchCounsellors();
  }, []);

  const fetchCounsellors = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/counsellors');
      setCounsellors(res.data.data || []);
      setStats(res.data.stats || null);
    } catch (err) {
      console.error('Failed to fetch counsellors', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedCounsellor(null);
    setFormData({
      name: '',
      role: 'General Counsellor',
      region: 'North India',
      languages: 'English, Hindi',
      capacity: 50,
      acceptingLeads: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Counsellor) => {
    setModalMode('edit');
    setSelectedCounsellor(c);
    setFormData({
      name: c.name,
      role: c.role,
      region: c.region,
      languages: Array.isArray(c.languages) ? c.languages.join(', ') : (c.languages || ''),
      capacity: c.capacity,
      acceptingLeads: c.acceptingLeads
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        languages: formData.languages.split(',').map(l => l.trim()),
      };

      if (modalMode === 'edit' && selectedCounsellor) {
        await api.put(`/counsellors/${selectedCounsellor._id}`, payload);
      } else {
        await api.post('/counsellors', payload);
      }

      setIsModalOpen(false);
      fetchCounsellors();
      alert(`Counsellor ${modalMode === 'edit' ? 'updated' : 'added'} successfully!`);
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.delete(`/counsellors/${id}`);
      fetchCounsellors();
    } catch (err) {
      alert('Failed to delete counsellor');
    }
  };

  const handleAutoAssign = async () => {
    if (!confirm('Run smart assignment engine for all unassigned leads?')) return;
    setIsLoading(true);
    try {
      const res = await api.post('/counsellors/auto-assign', {});
      alert(res.message);
      fetchCounsellors();
    } catch (err: any) {
      alert(err.message || 'Auto-assignment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCounsellors = counsellors.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6 fade-in h-auto lg:h-[calc(100vh-64px)] flex flex-col pb-10">

      {}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-h1 text-heading">Counsellor Directory</h1>
          <p className="text-body text-muted mt-1">Manage staff allocation, regional utilization, and auto-assignment.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="h-10 px-4 bg-primary text-white hover:bg-primary-dark rounded-lg font-medium text-[13px] transition-colors flex items-center gap-2 shadow-sm"
          >
            <UserPlusIcon className="w-4 h-4" /> Add Counsellor
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">

        {}
        <div className="flex flex-col bg-surface border border-border rounded-xl shadow-sm overflow-hidden min-h-0">

          <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-bg/50 shrink-0">
            <div className="relative w-full max-w-sm">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search staff by name or region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 bg-white border border-border rounded-md text-[13px] focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 text-[12px] font-semibold text-muted bg-white px-3 py-1.5 border border-border rounded-md shadow-sm">
               Target KPI: <span className="text-success font-bold">{stats?.targetKPI || '85% Utilization'}</span>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg/50 border-b border-border">
                  <th className="px-6 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Counsellor</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Region & Languages</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Active Students</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Utilization</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-muted uppercase tracking-wider text-center">Accepting Leads</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface text-[13px]">
                {isLoading && filteredCounsellors.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-muted italic">Loading directory...</td></tr>
                ) : filteredCounsellors.map((c) => (
                  <tr key={c._id} className="hover:bg-bg/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[12px]">
                          {(c.avatar || c.name[0]).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="text-[13px] font-bold text-heading">{c.name}</h5>
                          <p className="text-[11px] text-muted">{c.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-heading">{c.region}</span>
                        <div className="flex gap-1 flex-wrap">
                          {c.languages?.map(l => (
                             <span key={l} className="text-[10px] bg-bg border border-border text-muted px-1.5 py-0.5 rounded whitespace-nowrap">{l}</span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-heading">{c.activeStudents}</span> <span className="text-muted">/ {c.capacity}</span>
                    </td>
                    <td className="px-6 py-4 w-48">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                           <div
                             className={`h-full rounded-full ${c.utilizationRate >= 90 ? 'bg-danger' : c.utilizationRate >= 75 ? 'bg-success' : 'bg-warning'}`}
                             style={{ width: `${c.utilizationRate}%` }}
                           ></div>
                        </div>
                        <span className={`font-bold text-[11px] ${c.utilizationRate >= 90 ? 'text-danger' : c.utilizationRate >= 75 ? 'text-success' : 'text-warning'}`}>{c.utilizationRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       {c.acceptingLeads ? (
                          <div className="w-max mx-auto px-2 py-0.5 rounded-full bg-success/10 border border-success/20 flex items-center gap-1 text-[11px] font-bold text-success">
                             <CheckCircleIcon className="w-3.5 h-3.5" /> Yes
                          </div>
                       ) : (
                          <div className="w-max mx-auto px-2 py-0.5 rounded-full bg-danger/10 border border-danger/20 flex items-center gap-1 text-[11px] font-bold text-danger">
                             <XCircleIcon className="w-3.5 h-3.5" /> Maxed
                          </div>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenEdit(c)} className="p-1.5 text-muted hover:text-primary transition-colors"><PencilSquareIcon className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(c._id, c.name)} className="p-1.5 text-muted hover:text-danger transition-colors"><TrashIcon className="w-4 h-4" /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl border border-border p-6 space-y-6 fade-in">
             <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-heading tracking-tight">
                  {modalMode === 'add' ? 'Add New Counsellor' : 'Edit Counsellor'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-heading"><XMarkIcon className="w-5 h-5" /></button>
             </div>

             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                   <label className="text-[11px] font-bold text-muted uppercase">Full Name</label>
                   <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full h-11 px-4 bg-bg border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted uppercase">Role</label>
                    <input
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full h-11 px-4 bg-bg border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted uppercase">Region</label>
                    <input
                      required
                      value={formData.region}
                      onChange={(e) => setFormData({...formData, region: e.target.value})}
                      className="w-full h-11 px-4 bg-bg border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                   <label className="text-[11px] font-bold text-muted uppercase">Languages (comma separated)</label>
                   <input
                    required
                    value={formData.languages}
                    onChange={(e) => setFormData({...formData, languages: e.target.value})}
                    className="w-full h-11 px-4 bg-bg border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="English, Hindi, Telugu"
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted uppercase">Student Capacity</label>
                    <input
                      type="number"
                      required
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                      className="w-full h-11 px-4 bg-bg border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                     <label className="text-[11px] font-bold text-muted uppercase cursor-pointer flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.acceptingLeads}
                          onChange={(e) => setFormData({...formData, acceptingLeads: e.target.checked})}
                        />
                        Accepting Leads
                     </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-11 bg-bg border border-border rounded-xl font-bold">Cancel</button>
                   <button type="submit" disabled={isLoading} className="flex-1 h-11 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
                      {isLoading ? 'Processing...' : modalMode === 'add' ? 'Add Staff' : 'Save Changes'}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
