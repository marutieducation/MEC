'use client';

import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

interface InviteCode {
  _id: string;
  code: string;
  type: 'admin_registration' | 'university_partner';
  used: boolean;
  expiresAt: string;
  createdAt: string;
}

export default function AdminInvitesPage() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/invite-codes');
      setCodes(res.data || []);
    } catch (err) {
      console.error('Failed to fetch codes', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCode = async (type: 'admin_registration' | 'university_partner') => {
    setIsGenerating(true);
    try {
      await api.post('/admin/invite-codes', { type });
      fetchCodes();
    } catch (err) {
      console.error('Failed to generate code', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopySuccess(code);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-heading tracking-tight">Security & Onboarding</h1>
          <p className="text-muted font-medium">Generate and manage secure invitation codes for Admins and Partners.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => generateCode('university_partner')}
            disabled={isGenerating}
            className="h-10 px-4 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" /> Partner Invite
          </button>
          <button
            onClick={() => generateCode('admin_registration')}
            disabled={isGenerating}
            className="h-10 px-4 bg-[#1A1A2E] text-white rounded-xl text-xs font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" /> Admin Invite
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="px-8 py-5 border-b border-border flex justify-between items-center">
            <h2 className="text-sm font-black text-muted uppercase tracking-widest">Active Invite Repository</h2>
            <button onClick={fetchCodes} className="text-primary hover:rotate-180 transition-transform duration-500">
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-muted font-bold">Accessing secure repository...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-bg/20">
                    <th className="px-8 py-4 text-[11px] font-black text-muted uppercase tracking-widest">Secure Code</th>
                    <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-widest">Access Level</th>
                    <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-widest">Expires</th>
                    <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-widest"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {codes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-10 text-center text-muted font-medium italic">No active invite codes found.</td>
                    </tr>
                  ) : (
                    codes.map((c) => (
                      <tr key={c._id} className="hover:bg-bg/10 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <code className="px-3 py-1.5 bg-bg border border-border rounded-lg font-mono text-sm font-bold text-primary">
                              {c.code}
                            </code>
                            <button
                              onClick={() => copyToClipboard(c.code)}
                              className="text-muted hover:text-primary transition-colors"
                              title="Copy to clipboard"
                            >
                              {copySuccess === c.code ? <CheckCircleIcon className="w-5 h-5 text-success" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${c.type === 'admin_registration' ? 'bg-[#1A1A2E]' : 'bg-primary'}`}></div>
                             <span className="text-xs font-bold text-heading">
                               {c.type === 'admin_registration' ? 'Super Admin' : 'University Partner'}
                             </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            c.used ? 'bg-muted/10 text-muted' :
                            new Date(c.expiresAt) < new Date() ? 'bg-danger/10 text-danger' :
                            'bg-success/10 text-success'
                          }`}>
                            {c.used ? 'Redeemed' : new Date(c.expiresAt) < new Date() ? 'Expired' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1.5 text-xs text-muted font-bold tracking-tight">
                            <ClockIcon className="w-4 h-4" />
                            {new Date(c.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          {c.used ? (
                            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Audit Only</span>
                          ) : (
                            <button
                              onClick={async () => {
                                const registerPath = c.type === 'university_partner' ? '/partner/register' : '/super/register';
                                const registerUrl = `${window.location.origin}${registerPath}?code=${c.code}`;
                                const inviteText = c.type === 'university_partner'
                                  ? `You're invited to join MEC UAFMS as a University Partner! Register here: ${registerUrl}`
                                  : `You're invited to join MEC UAFMS as an Admin! Register here: ${registerUrl}`;

                                if (navigator.share) {
                                  try {
                                    await navigator.share({
                                      title: c.type === 'university_partner' ? 'MEC Partner Registration' : 'MEC Admin Registration',
                                      text: inviteText,
                                      url: registerUrl
                                    });
                                  } catch (err) {
                                    navigator.clipboard.writeText(registerUrl);
                                    setCopySuccess(c.code);
                                    setTimeout(() => setCopySuccess(null), 2000);
                                  }
                                } else {
                                  navigator.clipboard.writeText(registerUrl);
                                  setCopySuccess(c.code);
                                  setTimeout(() => setCopySuccess(null), 2000);
                                }
                              }}
                              className="text-[11px] font-black text-primary hover:underline uppercase tracking-widest"
                            >
                              Share Invite
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
