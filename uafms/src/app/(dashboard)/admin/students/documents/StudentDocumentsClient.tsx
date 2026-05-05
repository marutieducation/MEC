'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

interface Document {
  _id: string;
  name: string;
  category: string;
  status: 'pending' | 'verified' | 'rejected' | 'missing';
  remark?: string;
  aiFlag?: boolean;
  aiFlagReason?: string;
  filePath?: string;
  originalName?: string;
  fileSize?: string;
  createdAt: string;
  verifiedBy?: { firstName: string; lastName: string };
  verifiedAt?: string;
}

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization?: string;
  intakeTerm?: string;
}

const STATUS_BADGE = {
  verified: { label: 'Verified', icon: CheckCircleIcon, cls: 'bg-success/10 text-success border-success/20' },
  pending: { label: 'Pending', icon: ClockIcon, cls: 'bg-warning/10 text-warning border-warning/20' },
  rejected: { label: 'Rejected', icon: XCircleIcon, cls: 'bg-danger/10 text-danger border-danger/20' },
  missing: { label: 'Missing', icon: ClockIcon, cls: 'bg-muted/10 text-muted border-border' },
};

const REJECT_REASONS = [
  'Blurred or unclear image',
  'Mismatch in name',
  'Invalid or expired document',
  'Wrong document uploaded',
  'Incomplete document',
  'Poor scan quality',
];

const CATEGORY_LABELS: Record<string, string> = {
  academic: '📚 Academic',
  entrance: '📝 Entrance Exam',
  identity: '🪪 Identity',
  reservation: '🏠 Reservation / Category',
  financial: '💰 Financial',
  language: '🌐 Language',
  conditional: '📁 Conditional',
  other: '📄 Other',
};

function StudentDocumentsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const [rejectDoc, setRejectDoc] = useState<Document | null>(null);
  const [rejectRemark, setRejectRemark] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);


  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [studentRes, docsRes] = await Promise.all([
        api.get(`/admin/users?role=student`),
        api.get(`/documents/student/${id}`),
      ]);
      const found = (studentRes.data || []).find((s: Student) => s._id === id);
      setStudent(found || null);
      setDocuments(docsRes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (doc: Document) => {
    setIsActioning(true);
    try {
      await api.put(`/documents/${doc._id}/approve`, {});
      setActionMsg({ type: 'success', text: `"${doc.name}" approved successfully.` });
      fetchData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to approve document' });
    } finally {
      setIsActioning(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectDoc || !rejectRemark.trim()) return;
    setIsActioning(true);
    try {
      await api.put(`/documents/${rejectDoc._id}/reject`, { remark: rejectRemark });
      setActionMsg({ type: 'success', text: `"${rejectDoc.name}" rejected.` });
      setRejectDoc(null);
      setRejectRemark('');
      fetchData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to reject document' });
    } finally {
      setIsActioning(false);
    }
  };

  if (!id) {
    return <div className="p-8 text-center text-danger font-bold">No student ID provided.</div>;
  }

  const uploaded = documents.length;
  const verified = documents.filter(d => d.status === 'verified').length;
  const pending = documents.filter(d => d.status === 'pending').length;
  const rejected = documents.filter(d => d.status === 'rejected').length;


  const grouped = documents.reduce((acc: Record<string, Document[]>, doc) => {
    const key = doc.category || 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 pb-20">
      {}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl border border-border hover:bg-bg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-heading" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-heading tracking-tight">
            {student ? `${student.firstName} ${student.lastName}` : 'Student'} — Document Review
          </h1>
          {student && (
            <p className="text-muted font-medium text-sm mt-0.5">
              {student.email} · MEC-{id.slice(-6).toUpperCase()} · {student.specialization || 'No specialization'}
            </p>
          )}
        </div>
      </div>

      {}
      {actionMsg && (
        <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-between ${actionMsg.type === 'success' ? 'bg-success/10 border-success/20 text-success' : 'bg-danger/10 border-danger/20 text-danger'}`}>
          {actionMsg.text}
          <button onClick={() => setActionMsg(null)}><XMarkIcon className="w-4 h-4" /></button>
        </div>
      )}

      {}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Uploaded', value: uploaded, cls: 'text-heading' },
          { label: 'Verified', value: verified, cls: 'text-success' },
          { label: 'Pending', value: pending, cls: 'text-warning' },
          { label: 'Rejected', value: rejected, cls: 'text-danger' },
        ].map(s => (
          <div key={s.label} className="bg-surface border border-border rounded-2xl p-5 text-center">
            <div className={`text-3xl font-black ${s.cls}`}>{s.value}</div>
            <div className="text-xs text-muted font-bold uppercase tracking-widest mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {}
      {isLoading ? (
        <div className="text-center text-muted py-12 font-bold animate-pulse">Loading documents...</div>
      ) : error ? (
        <div className="text-center text-danger py-12 font-bold">{error}</div>
      ) : documents.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center">
          <DocumentTextIcon className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="font-bold text-heading">No documents uploaded yet</p>
          <p className="text-sm text-muted mt-1">This student hasn't uploaded any documents.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, docs]) => (
            <div key={cat}>
              <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-3">
                {CATEGORY_LABELS[cat] || cat}
              </p>
              <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-bg/20 border-b border-border">
                      <th className="px-6 py-3 text-[10px] font-black text-muted uppercase tracking-widest">Document</th>
                      <th className="px-6 py-3 text-[10px] font-black text-muted uppercase tracking-widest">Uploaded</th>
                      <th className="px-6 py-3 text-[10px] font-black text-muted uppercase tracking-widest">Size</th>
                      <th className="px-6 py-3 text-[10px] font-black text-muted uppercase tracking-widest">Status</th>
                      <th className="px-6 py-3 text-[10px] font-black text-muted uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {docs.map(doc => {
                      const badge = STATUS_BADGE[doc.status] || STATUS_BADGE.pending;
                      const BadgeIcon = badge.icon;
                      return (
                        <tr key={doc._id} className="hover:bg-bg/10 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <DocumentTextIcon className="w-5 h-5 text-muted shrink-0" />
                              <div>
                                <p className="font-semibold text-sm text-heading">{doc.name}</p>
                                {doc.originalName && <p className="text-[11px] text-muted">{doc.originalName}</p>}
                                {doc.aiFlag && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <ExclamationTriangleIcon className="w-3.5 h-3.5 text-warning" />
                                    <span className="text-[10px] font-bold text-warning uppercase tracking-wide">AI Flag: {doc.aiFlagReason || 'Issue detected'}</span>
                                  </div>
                                )}
                                {doc.remark && doc.status === 'rejected' && (
                                  <p className="text-[11px] text-danger mt-1 italic">Reason: {doc.remark}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-muted font-medium">
                            {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-xs text-muted font-medium">{doc.fileSize || '—'}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${badge.cls}`}>
                              <BadgeIcon className="w-3 h-3" />
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {doc.filePath && (
                                <button
                                  onClick={() => setPreviewDoc(doc)}
                                  className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                                  title="Preview"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                </button>
                              )}
                              {doc.status !== 'verified' && (
                                <button
                                  onClick={() => handleApprove(doc)}
                                  disabled={isActioning}
                                  className="px-3 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success hover:text-white text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50"
                                >
                                  ✓ Approve
                                </button>
                              )}
                              {doc.status !== 'rejected' && (
                                <button
                                  onClick={() => { setRejectDoc(doc); setRejectRemark(''); }}
                                  disabled={isActioning}
                                  className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50"
                                >
                                  ✗ Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {}
      {rejectDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md rounded-3xl p-8 space-y-5 shadow-2xl border border-border">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-heading">Reject Document</h2>
                <p className="text-sm text-muted mt-1">"{rejectDoc.name}"</p>
              </div>
              <button onClick={() => setRejectDoc(null)} className="p-1 rounded-lg hover:bg-bg transition-colors">
                <XMarkIcon className="w-5 h-5 text-muted" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Select Reason</label>
              <div className="grid grid-cols-1 gap-2">
                {REJECT_REASONS.map(r => (
                  <button
                    key={r}
                    onClick={() => setRejectRemark(r)}
                    className={`text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${rejectRemark === r ? 'border-danger bg-danger/10 text-danger' : 'border-border text-heading hover:border-danger/50'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Custom Remark (optional)</label>
              <textarea
                rows={2}
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                placeholder="Add a specific remark for the student..."
                className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-danger resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRejectDoc(null)}
                className="flex-1 h-12 bg-bg border border-border rounded-xl font-bold text-heading hover:bg-border transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectRemark.trim() || isActioning}
                className="flex-1 h-12 bg-danger text-white rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-danger/80 transition-all disabled:opacity-50"
              >
                {isActioning ? 'Rejecting...' : 'Reject Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="font-black text-heading">{previewDoc.name}</h2>
                <p className="text-xs text-muted">{previewDoc.originalName}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://mec-backend-9uu9.onrender.com'}/${previewDoc.filePath}`}
                  target="_blank"
                  download={previewDoc.originalName}
                  className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                  title="Download"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </a>
                <button onClick={() => setPreviewDoc(null)} className="p-2 rounded-lg hover:bg-bg transition-colors">
                  <XMarkIcon className="w-5 h-5 text-muted" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-bg/50 min-h-[400px] flex items-center justify-center">
              {previewDoc.originalName?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://mec-backend-9uu9.onrender.com'}/${previewDoc.filePath}`}
                  alt={previewDoc.name}
                  className="max-w-full max-h-full rounded-lg object-contain"
                />
              ) : (
                <div className="text-center space-y-4">
                  <DocumentTextIcon className="w-16 h-16 text-muted mx-auto" />
                  <div>
                    <p className="font-bold text-heading">{previewDoc.originalName}</p>
                    <p className="text-sm text-muted mt-1">PDF preview not available in browser.</p>
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://mec-backend-9uu9.onrender.com'}/${previewDoc.filePath}`}
                      target="_blank"
                      download={previewDoc.originalName}
                      className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" /> Download to View
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentDocumentsClient() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted animate-pulse font-bold">Loading...</div>}>
      <StudentDocumentsContent />
    </Suspense>
  );
}
