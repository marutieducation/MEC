'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderIcon,
  DocumentIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

const CATEGORY_MAP: Record<string, string> = {
  academic: 'Academic Records',
  entrance: 'Entrance Exam',
  identity: 'Identity & Visa',
  reservation: 'Reservation',
  financial: 'Financials',
  language: 'Language',
  conditional: 'Conditional',
  other: 'Other',
};

const CATEGORY_ICONS: Record<string, any> = {
  academic: FolderIcon,
  entrance: DocumentIcon,
  identity: ShieldCheckIcon,
  reservation: FolderIcon,
  financial: FolderIcon,
  language: FolderIcon,
  conditional: FolderIcon,
  other: FolderIcon,
};

export default function DocumentVault() {
  const [selectedCategory, setSelectedCategory] = useState('All Documents');
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get('/documents');
        setDocuments(res.data || []);
      } catch (err) {
        console.error('Failed to fetch documents', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('academic');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('document', uploadFile);
    formData.append('name', uploadName || uploadFile.name);
    formData.append('category', uploadCategory);

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const res = await api.get('/documents');
      setDocuments(res.data || []);
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadName('');
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const categories = [
    { name: 'All Documents', count: documents.length, icon: FolderIcon },
    ...Object.entries(CATEGORY_MAP).map(([key, label]) => ({
      name: label,
      count: documents.filter(d => d.category === key).length,
      icon: CATEGORY_ICONS[key] || FolderIcon
    })).filter(c => c.count > 0)
  ];

  const filteredDocs = documents.filter(doc => {
    const mappedCategory = CATEGORY_MAP[doc.category] || 'Other';
    const matchesCategory = selectedCategory === 'All Documents' || mappedCategory === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1">AI Document Vault</h1>
          <p className="text-body mt-1">Manage and verify your documents with AI-powered readiness scans.</p>
        </div>
        <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
          <ArrowUpTrayIcon className="w-5 h-5" /> Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {}
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                selectedCategory === cat.name
                ? 'bg-primary text-white shadow-md'
                : 'text-body hover:bg-surface border border-transparent hover:border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <cat.icon className="w-5 h-5" />
                <span className="text-sm font-semibold">{cat.name}</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                selectedCategory === cat.name ? 'bg-white/20' : 'bg-bg text-muted'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface p-2 rounded-2xl border border-border">
            <div className="relative flex-1 w-full">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-11 pr-4 py-2 text-sm focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 px-2 border-l border-border h-8">
              <button className="p-1.5 text-primary bg-primary/10 rounded-lg"><Squares2X2Icon className="w-4 h-4" /></button>
              <button className="p-1.5 text-muted hover:text-body rounded-lg"><ListBulletIcon className="w-4 h-4" /></button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-muted font-bold animate-pulse bg-surface rounded-2xl border border-border">
              Loading your vault...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredDocs.length === 0 ? (
                 <div className="col-span-full p-8 border border-dashed border-border rounded-2xl text-center text-muted bg-surface mt-4">
                    <DocumentIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-bold text-heading">No documents found</p>
                    <p className="text-[13px] mt-1">Upload relevant documents to this category.</p>
                 </div>
              ) : filteredDocs.map((doc) => (
                <div key={doc._id} className="bg-surface border border-border rounded-2xl p-5 hover:border-primary transition-all group cursor-pointer relative overflow-hidden flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-bg border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform flex-shrink-0">
                      <DocumentIcon className="w-6 h-6" />
                    </div>
                    {doc.status === 'verified' ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-[10px] font-black uppercase tracking-wider border border-success/20">
                        <CheckCircleIcon className="w-3 h-3" /> Verified
                      </div>
                    ) : doc.status === 'rejected' ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger/10 text-danger text-[10px] font-black uppercase tracking-wider border border-danger/20">
                        <ExclamationTriangleIcon className="w-3 h-3" /> Rejected
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/10 text-warning text-[10px] font-black uppercase tracking-wider border border-warning/20">
                        <ClockIcon className="w-3 h-3" /> Pending
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-heading truncate mb-1" title={doc.name}>{doc.name}</h3>
                  <p className="text-[11px] text-muted mb-4 truncate">{doc.fileSize || 'Unknown Size'} • Uploaded {new Date(doc.createdAt).toLocaleDateString()}</p>

                  <div className="flex-1"></div>

                  {(doc.aiFlag || doc.status === 'rejected') && (
                    <div className={`p-3 rounded-xl border mb-4 mt-auto ${doc.status === 'rejected' ? 'bg-danger/5 border-danger/20' : 'bg-warning/5 border-warning/10'}`}>
                      <p className={`text-[11px] font-medium ${doc.status === 'rejected' ? 'text-danger' : 'text-warning'}`}>
                        {doc.status === 'rejected' ? `Rejected: ${doc.remark}` : `AI Note: ${doc.aiFlagReason || 'Issue detected'}`}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-auto">
                    <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://mec-backend-9uu9.onrender.com'}/${doc.filePath}`} target="_blank" className="flex-1 px-4 py-2 bg-bg hover:bg-surface border border-border rounded-xl text-[11px] font-bold text-center transition-colors">
                      View Document
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-border bg-bg/50">
              <h2 className="text-xl font-bold text-heading">Upload Document</h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-muted hover:text-heading transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-heading mb-2">Select File <span className="text-danger">*</span></label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-body file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-heading mb-2">Document Name (Optional)</label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder={uploadFile ? uploadFile.name : 'E.g. High School Transcript'}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-heading mb-2">Category <span className="text-danger">*</span></label>
                <select
                  required
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
                >
                  {Object.entries(CATEGORY_MAP).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="flex-1 px-4 py-2.5 bg-bg text-heading font-bold rounded-xl border border-border hover:bg-surface transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isUploading || !uploadFile} className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isUploading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <><ArrowUpTrayIcon className="w-5 h-5" /> Upload</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
