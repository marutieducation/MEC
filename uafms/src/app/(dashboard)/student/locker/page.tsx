'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  DocumentArrowUpIcon, ShareIcon, ShieldCheckIcon,
  DocumentIcon, DocumentTextIcon, EllipsisVerticalIcon,
  ArrowDownTrayIcon, ClockIcon, LockClosedIcon,
  ExclamationCircleIcon, TrashIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface DocumentLog {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  status: string;
  fileSize: string;
  _id: string;
}

export default function DigitalLocker() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'student') {
      fetchDocuments();
    }
  }, [user]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    formData.append('category', 'academic');

    setIsUploading(true);
    try {
      await api.post('/documents/upload', formData);
      await fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments(docs => docs.filter(d => d._id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document.');
    }
  };

  const downloadFile = async (id: string, name: string) => {
    try {
      const token = localStorage.getItem('uafms_token');
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http:
      const response = await fetch(`${apiBase}/documents/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6 fade-in h-auto lg:h-[calc(100vh-64px)] flex flex-col pb-10">

      {}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />

      {}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 text-heading flex items-center gap-2">
            Secure Digital Locker
            <span className="bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheckIcon className="w-3 h-3" /> AES-256 Encrypted
            </span>
          </h1>
          <p className="text-body text-muted mt-1">Upload, verify, and share your application documents securely.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 bg-surface border border-border text-heading hover:bg-bg rounded-lg font-medium text-[13px] transition-colors flex items-center gap-2">
            <ShareIcon className="w-4 h-4" /> Share Dossier
          </button>
          <button onClick={handleUploadClick} disabled={isUploading} className={`h-10 px-4 text-white rounded-lg font-medium text-[13px] transition-colors flex items-center gap-2 shadow-sm ${isUploading ? 'bg-primary/50' : 'bg-primary hover:bg-primary-dark'}`}>
            <DocumentArrowUpIcon className="w-4 h-4" /> {isUploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">

        {}
        <div className="lg:col-span-3 flex flex-col space-y-4">

          {}
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-6">
              {['All Documents', 'Academic', 'Identity', 'Financial', 'Language Tests'].map((tab, idx) => (
                <a
                  key={tab}
                  href="#"
                  className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${idx === 0
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted hover:text-heading hover:border-border'
                    }`}
                >
                  {tab}
                </a>
              ))}
            </nav>
          </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4 pt-2">

            {documents.length === 0 && !isUploading && (
              <div className="col-span-full py-10 text-center text-muted border border-dashed rounded-xl">
                No documents found manually jumpstart your locker by uploading above!
              </div>
            )}

            {documents.map((doc) => (
              <div key={doc._id} className="bg-surface border border-border rounded-xl p-4 hover:shadow-md transition-shadow group flex flex-col relative">
                <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                  <button onClick={() => downloadFile(doc._id, doc.name)} className="p-1 hover:bg-bg rounded-md text-primary" title="Download"><ArrowDownTrayIcon className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(doc._id)} className="p-1 hover:bg-danger/10 rounded-md text-danger" title="Delete"><TrashIcon className="w-4 h-4" /></button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${doc.status === 'missing' ? 'bg-bg text-muted border border-border border-dashed' :
                      'bg-primary/10 text-primary'
                    }`}>
                    {doc.category === 'identity' ? <ShieldCheckIcon className="w-5 h-5" /> : <DocumentTextIcon className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0 pr-12">
                    <h4 className="text-[14px] font-semibold text-heading truncate" title={doc.name}>{doc.name}</h4>
                    <p className="text-[12px] text-muted capitalize">{doc.fileSize || 'Unknown Size'} • {doc.category}</p>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                  {doc.status === 'verified' && (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-success bg-success/10 px-2.5 py-1 rounded w-max border border-success/20">
                      <ShieldCheckIcon className="w-3.5 h-3.5" /> Verified
                    </div>
                  )}
                  {doc.status === 'pending' && (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-warning bg-warning/10 px-2.5 py-1 rounded w-max border border-warning/20">
                      <ClockIcon className="w-3.5 h-3.5" /> Verification Pending
                    </div>
                  )}
                  {doc.status === 'missing' && (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-danger bg-danger/10 px-2.5 py-1 rounded w-max border border-danger/20">
                      <ExclamationCircleIcon className="w-3.5 h-3.5" /> Action Required
                    </div>
                  )}

                  {doc.status !== 'missing' ? (
                    <p className="text-[11px] text-muted">{new Date(doc.createdAt).toLocaleDateString()}</p>
                  ) : (
                    <button onClick={handleUploadClick} className="text-[11px] font-semibold text-primary hover:underline">Upload Now</button>
                  )}
                </div>
              </div>
            ))}

            {}
            <div onClick={handleUploadClick} className="bg-bg/50 border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface hover:border-primary transition-all group min-h-[160px]">
              <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                <DocumentArrowUpIcon className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
              </div>
              <span className="text-[13px] font-semibold text-heading mb-1">{isUploading ? 'Uploading...' : 'Upload New Document'}</span>
              <span className="text-[11px] text-muted">Drag & drop or click to browse</span>
            </div>

          </div>
        </div>

        {}
        <div className="bg-surface rounded-xl border border-border shadow-sm p-5 flex flex-col h-[500px] lg:h-full">
          <div className="flex items-center gap-2 mb-6 tracking-tight">
            <LockClosedIcon className="w-4 h-4 text-muted" />
            <h3 className="text-[14px] font-semibold text-heading uppercase">Version History</h3>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto pr-2 relative">
            <div className="absolute left-[11px] top-2 bottom-4 w-px bg-border -z-10"></div>

            {}
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-surface border-2 border-success flex items-center justify-center shrink-0 mt-0.5 z-10">
                <ShieldCheckIcon className="w-3 h-3 text-success" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-heading">Document Verified</p>
                <p className="text-[11px] text-muted mb-1">B.Tech Transcript - Sem 1 to 6</p>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted bg-bg px-2 py-0.5 rounded w-max border border-border">
                  <span>Verified by Admin (Rahul S.)</span>
                  <span className="text-gray-300">•</span>
                  <span>Oct 17, 10:42 AM</span>
                </div>
              </div>
            </div>

            {}
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-surface border-2 border-primary flex items-center justify-center shrink-0 mt-0.5 z-10">
                <DocumentArrowUpIcon className="w-3 h-3 text-primary" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-heading">New Version Uploaded</p>
                <p className="text-[11px] text-muted mb-1">IELTS Scorecard 2024</p>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted">
                  <span>Uploaded by You</span>
                  <span>•</span>
                  <span>Oct 18, 09:12 AM</span>
                </div>
              </div>
            </div>

            {}
            <div className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-surface border-2 border-border flex items-center justify-center shrink-0 mt-0.5 z-10">
                <ShareIcon className="w-3 h-3 text-muted" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-heading">Dossier Shared</p>
                <p className="text-[11px] text-muted mb-1">Shared with CMU Admissions</p>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted">
                  <span>System Auto-share</span>
                  <span>•</span>
                  <span>Oct 10, 02:30 PM</span>
                </div>
              </div>
            </div>

          </div>

          <button className="w-full mt-auto py-2 flex items-center justify-center gap-2 text-[12px] font-semibold text-primary hover:bg-primary/5 rounded border border-transparent hover:border-primary/20 transition-all">
            <ArrowDownTrayIcon className="w-3.5 h-3.5" /> Download Full Audit Log (.csv)
          </button>
        </div>

      </div>

    </div>
  );
}
