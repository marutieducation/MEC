'use client';

import React from 'react';
import {
  MagnifyingGlassIcon,
  BuildingLibraryIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

interface Partner {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  universityId?: {
    name: string;
    location: string;
    logo: string;
  };
  createdAt: string;
}

export default function PartnerListPage() {
  const [partners, setPartners] = React.useState<Partner[]>([]);
  const [universities, setUniversities] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const OFFICIAL_PARTNERS = [
    'Sinhgad Institutes', 'Mahindra University', 'Karnavati University', 'ICFAI University Jaipur',
    'Swarrnim Startup & Innovation', 'Amity University', 'Symbiosis Institute of Tech', 'ICFAI Foundation',
    'Jaipur National University', 'Ramaiah University', 'Sri Balaji University', 'Asia Pacific Institute',
    'Pandit Deendayal Energy Univ', 'Symbiosis International Dubai', 'Indus University', 'SRM University',
    'Sinhgad Management', 'SKIPS University', 'GLS University', 'Alliance University', 'Manipal Academy',
    'MIT World Peace University', 'Parul University', 'Broadway Overseas Education', 'Symbiosis School for Liberal Arts',
    'Ahmedabad Institute of Management', 'Sikkim University'
  ];


  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [newPartner, setNewPartner] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    universityId: ''
  });

  React.useEffect(() => {
    fetchPartners();
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const res = await api.get('/universities');
      const allUnis = Array.isArray(res) ? res : (res.data || []);
      // Filter for official 27
      const official = allUnis.filter((uni: any) => OFFICIAL_PARTNERS.includes(uni.name));
      setUniversities(official.length > 0 ? official : allUnis);
    } catch (err) {
      console.error('Failed to fetch universities', err);
    }
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/admin/users', { ...newPartner, role: 'university_partner' });
      setIsAddModalOpen(false);
      setNewPartner({ firstName: '', lastName: '', email: '', password: '', phone: '', universityId: '' });
      fetchPartners();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to add partner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/users?role=university_partner');
      setPartners(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch partners');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPartners = (partners || []).filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.universityId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-heading tracking-tight">Partner Directory</h1>
          <p className="text-muted font-medium">Verified representatives from our global university network.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-content font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
        >
          <PlusIcon className="w-5 h-5" />
          Add Partner
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by name, email, or university..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-surface border border-border rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-muted font-bold">Loading partners...</div>
        ) : error ? (
          <div className="p-12 text-center text-danger font-bold">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-bg/20 border-b border-border">
                  <th className="px-8 py-4 text-[11px] font-black text-muted uppercase tracking-widest">Representative</th>
                  <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-widest">Institution</th>
                  <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-widest text-center">Joined</th>
                  <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-10 text-center text-muted font-medium italic">No partners found.</td>
                  </tr>
                ) : (
                  filteredPartners.map((p) => (
                    <tr key={p._id} className="hover:bg-bg/10 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform text-xs">
                            {p.firstName[0]}{p.lastName[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-heading">{p.firstName} {p.lastName}</span>
                            <span className="text-[10px] text-muted font-black uppercase tracking-tight italic">Partner ID: {p._id.slice(-6).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 font-bold text-sm text-heading">
                            <BuildingLibraryIcon className="w-4 h-4 text-primary" /> {typeof p.universityId === 'object' ? p.universityId?.name : 'Unassigned Institution'}
                          </div>
                          <span className="text-xs text-muted font-medium">{typeof p.universityId === 'object' ? p.universityId?.location || 'Partner Location' : 'No Location Data'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted font-bold tracking-tight">
                            <EnvelopeIcon className="w-3.5 h-3.5" /> {p.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted font-bold tracking-tight">
                            <PhoneIcon className="w-3.5 h-3.5" /> {p.phone || 'No phone'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-heading">
                            {new Date(p.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="text-[11px] font-black text-primary hover:underline uppercase tracking-widest flex items-center gap-1 justify-end">
                           Verified <ShieldCheckIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-lg rounded-3xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-black text-heading">Add New Partner</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-muted hover:bg-bg rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPartner} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">First Name</label>
                  <input required type="text" value={newPartner.firstName} onChange={e => setNewPartner({...newPartner, firstName: e.target.value})} className="w-full h-11 px-4 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">Last Name</label>
                  <input required type="text" value={newPartner.lastName} onChange={e => setNewPartner({...newPartner, lastName: e.target.value})} className="w-full h-11 px-4 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted uppercase tracking-widest">Email Address</label>
                <input required type="email" value={newPartner.email} onChange={e => setNewPartner({...newPartner, email: e.target.value})} className="w-full h-11 px-4 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">Password</label>
                  <input required type="text" minLength={6} value={newPartner.password} onChange={e => setNewPartner({...newPartner, password: e.target.value})} className="w-full h-11 px-4 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase tracking-widest">Phone Number</label>
                  <input type="tel" value={newPartner.phone} onChange={e => setNewPartner({...newPartner, phone: e.target.value})} className="w-full h-11 px-4 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted uppercase tracking-widest">Assigned University</label>
                <select
                  required
                  value={newPartner.universityId}
                  onChange={e => setNewPartner({...newPartner, universityId: e.target.value})}
                  className="w-full h-11 px-4 bg-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="">Select a university...</option>
                  {universities.map(uni => (
                    <option key={uni._id} value={uni._id}>{uni.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2.5 text-sm font-bold text-heading hover:bg-bg rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-primary text-primary-content text-sm font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
