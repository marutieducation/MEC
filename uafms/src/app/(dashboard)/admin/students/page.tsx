'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  AcademicCapIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  specialization: string;
  intakeTerm: string;
  universityId?: {
    _id: string;
    name: string;
    location: string;
  };
}

export default function StudentListPage() {
  const router = useRouter();
  const [students, setStudents] = React.useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);


  const [isEditing, setIsEditing] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [editFormData, setEditFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    intakeTerm: ''
  });

  React.useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/users?role=student');
      setStudents(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student);
    setEditFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone || '',
      specialization: student.specialization || '',
      intakeTerm: student.intakeTerm || ''
    });
    setIsEditing(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setIsLoading(true);
    try {
      await api.put(`/admin/users/${selectedStudent._id}`, editFormData);
      setIsEditing(false);
      fetchStudents();
      alert('Student updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update student');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will permanently remove their account.`)) return;

    setIsLoading(true);
    try {
      await api.delete(`/admin/users/${id}`);
      fetchStudents();
      alert('Student deleted successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to delete student');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = (students || []).filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.universityId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-heading tracking-tight">Student Managed Database</h1>
          <p className="text-muted font-medium">Full repository of all students using the MEC platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 bg-bg border border-border rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-border transition-colors">
            <ArrowDownTrayIcon className="w-4 h-4" /> Export CSV
          </button>
        </div>
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
        {isLoading && students.length === 0 ? (
          <div className="p-12 text-center text-muted font-bold animate-pulse">Loading students...</div>
        ) : error ? (
          <div className="p-12 text-center text-danger font-bold">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-bg/20 border-b border-border">
                  <th className="px-8 py-4 text-[11px] font-black text-muted uppercase tracking-widest">Student Details</th>
                  <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-widest">Target Interest</th>
                  <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-widest">Contact Info</th>
                  <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-widest text-center">Intake</th>
                  <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-widest text-right pr-12">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-10 text-center text-muted font-medium italic">No students found matching your search.</td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s._id} className="hover:bg-bg/10 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform text-xs">
                            {s.firstName[0]}{s.lastName[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-heading">{s.firstName} {s.lastName}</span>
                            <span className="text-[10px] text-muted font-black uppercase tracking-tight">ID: MEC-{s._id.slice(-6).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 font-bold text-sm text-heading">
                            <AcademicCapIcon className="w-4 h-4 text-primary" /> {s.universityId?.name || 'Exploring'}
                          </div>
                          <span className="text-xs text-muted font-medium capitalize">{s.specialization || 'Not specified'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted font-bold tracking-tight">
                            <EnvelopeIcon className="w-3.5 h-3.5" /> {s.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted font-bold tracking-tight">
                            <PhoneIcon className="w-3.5 h-3.5" /> {s.phone || 'No phone'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary">
                          {s.intakeTerm || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right pr-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => router.push(`/admin/students/documents?id=${s._id}`)}
                            className="p-2 bg-info/10 text-info hover:bg-info hover:text-white rounded-lg transition-all text-[11px] font-black uppercase tracking-widest flex items-center gap-1"
                          >
                            <DocumentTextIcon className="w-3.5 h-3.5" /> Docs
                          </button>
                          <button
                            onClick={() => handleEditClick(s)}
                            className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all text-[11px] font-black uppercase tracking-widest"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(s._id, `${s.firstName} ${s.lastName}`)}
                            className="p-2 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-lg transition-all text-[11px] font-black uppercase tracking-widest"
                          >
                            Delete
                          </button>
                        </div>
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
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-lg rounded-3xl p-8 space-y-6 shadow-2xl border border-border fade-in">
            <h2 className="text-2xl font-black text-heading tracking-tight">Edit Student Profile</h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">First Name</label>
                  <input
                    required
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                    className="w-full h-11 px-4 bg-bg border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">Last Name</label>
                  <input
                    required
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                    className="w-full h-11 px-4 bg-bg border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Email Address</label>
                <input
                  required
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full h-11 px-4 bg-bg border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">Phone Number</label>
                  <input
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                    className="w-full h-11 px-4 bg-bg border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">Intake Term</label>
                  <input
                    value={editFormData.intakeTerm}
                    onChange={(e) => setEditFormData({...editFormData, intakeTerm: e.target.value})}
                    className="w-full h-11 px-4 bg-bg border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Sept 2024"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Specialization</label>
                <input
                  value={editFormData.specialization}
                  onChange={(e) => setEditFormData({...editFormData, specialization: e.target.value})}
                  className="w-full h-11 px-4 bg-bg border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 h-12 bg-bg border border-border rounded-xl font-bold text-heading hover:bg-border transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-12 bg-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
