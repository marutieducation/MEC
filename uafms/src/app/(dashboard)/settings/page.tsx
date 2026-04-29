'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  UserCircleIcon, ShieldCheckIcon, DocumentCheckIcon,
  CodeBracketIcon, BellAlertIcon, ComputerDesktopIcon,
  ArrowDownTrayIcon, LockClosedIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function SettingsAndCompliance() {
  const [activeTab, setActiveTab] = useState('dpdp');
  const [isExporting, setIsExporting] = useState(false);
  const { logout } = useAuth();

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await api.post('/settings/data-export', {});
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MEC_User_Data_Export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert('Failed to export data: ' + e.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you absolutely sure you want to permanently delete your account? This action cannot be undone.')) {
      try {
        await api.delete('/settings/account');
        alert('Account deleted successfully.');
        logout();
      } catch (e: any) {
        alert('Failed to delete account: ' + e.message);
      }
    }
  };

  const tabs = [
    { id: 'profile', name: 'My Profile', icon: UserCircleIcon },
    { id: 'security', name: 'Security & 2FA', icon: ShieldCheckIcon },
    { id: 'dpdp', name: 'GDPR & DPDP Compliance', icon: DocumentCheckIcon },
    { id: 'api', name: 'API & Webhooks', icon: CodeBracketIcon },
    { id: 'notifications', name: 'Notifications', icon: BellAlertIcon },
    { id: 'devices', name: 'Active Devices', icon: ComputerDesktopIcon },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6 fade-in min-h-[calc(100vh-64px)] flex flex-col pb-10">

      {}
      <div className="shrink-0 mb-2">
         <h1 className="text-h1 text-heading">Settings & Compliance</h1>
         <p className="text-body text-muted mt-1">Manage your account preferences, security settings, and data privacy.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">

        {}
        <div className="lg:w-64 shrink-0 overflow-y-auto pr-2 pb-4">
           <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-[14px] font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                      : 'text-muted hover:text-heading hover:bg-bg/80 border border-transparent'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary' : 'text-muted'}`} />
                  {tab.name}
                </button>
              ))}
           </nav>
        </div>

        {}
        <div className="flex-1 bg-surface border border-border rounded-xl shadow-sm min-h-0 overflow-y-auto">

          {activeTab === 'dpdp' && (
            <div className="p-6 md:p-8 space-y-8 fade-in">

              <div className="flex justify-between items-start border-b border-border pb-6">
                 <div>
                    <h2 className="text-h2">GDPR &amp; DPDP Act Compliance</h2>
                     <p className="text-[13px] text-muted max-w-2xl mt-1">MEC UAFMS adheres to the strict privacy guidelines set forth by the EU GDPR and India&apos;s DPDP Act 2023. You have full control over your data residency, consent logs, and the Right to be Forgotten.</p>
                 </div>
                 <div className="bg-success/10 border border-success/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-success" />
                    <span className="text-[12px] font-bold text-success tracking-wide uppercase">Fully Compliant</span>
                 </div>
              </div>

              {}
              <div className="space-y-3">
                 <h3 className="text-h3 flex items-center gap-2">
                   <LockClosedIcon className="w-5 h-5 text-muted" /> Data Residency & Localization
                 </h3>
                 <div className="bg-bg border border-border rounded-xl p-5 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-full md:w-1/2 aspect-[16/9] bg-surface rounded-lg border border-border flex items-center justify-center shadow-inner relative overflow-hidden group">
                       <Image width={800} height={400} alt="World Map" src="https:

                       {}
                       <div className="absolute top-[48%] left-[68%] flex flex-col items-center group-hover:scale-110 transition-transform">
                          <div className="w-4 h-4 rounded-full bg-primary/30 flex items-center justify-center animate-pulse">
                             <div className="w-2 h-2 rounded-full bg-primary"></div>
                          </div>
                       </div>

                       <div className="absolute bottom-3 right-3 bg-bg/90 backdrop-blur-sm border border-border px-2 py-1 rounded text-[10px] font-bold text-heading shadow-sm uppercase tracking-wide">
                          Server Region: ap-south-1
                       </div>
                    </div>

                    <div className="flex-1 space-y-4">
                       <p className="text-[13px] text-muted">Your application data, documents, and PII are physically stored in the <strong>AWS Mumbai (India)</strong> region to comply with Section 17 of the DPDP Act.</p>

                       <div className="bg-surface border border-border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                             <CheckCircleIcon className="w-4 h-4 text-success" />
                             <span className="text-[13px] font-bold text-heading">GSTIN (India)</span>
                          </div>
                          <p className="text-[11px] text-muted pl-6">Data is encrypted at rest (AES-256) and in transit (TLS 1.3).</p>
                       </div>
                    </div>
                 </div>
              </div>

              {}
              <div className="space-y-3">
                 <div className="flex justify-between items-end">
                    <h3 className="text-h3">Consent Audit Trail</h3>
                    <button className="text-[12px] font-bold text-primary hover:underline">Update GSTIN</button>
                 </div>

                 <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-left text-[13px]">
                       <thead className="bg-bg/50 border-b border-border">
                          <tr>
                             <th className="px-4 py-2 font-bold text-muted uppercase tracking-wider text-[11px]">Date & Time</th>
                             <th className="px-4 py-2 font-bold text-muted uppercase tracking-wider text-[11px]">Action</th>
                             <th className="px-4 py-2 font-bold text-muted uppercase tracking-wider text-[11px]">IP Address</th>
                             <th className="px-4 py-2 font-bold text-muted uppercase tracking-wider text-[11px] text-right">Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-border bg-surface">
                          <tr>
                             <td colSpan={4} className="px-4 py-16 text-center text-muted font-medium bg-bg/20 border-b-transparent">
                                <div className="max-w-xs mx-auto">
                                  <DocumentCheckIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                  <p>No consent history available.</p>
                                </div>
                             </td>
                          </tr>
                       </tbody>
                    </table>
                 </div>
              </div>
              {}
              <div className="pt-6 border-t border-border flex gap-4">
                 <button onClick={handleExportData} disabled={isExporting} className="flex-1 py-3 bg-surface border-2 border-primary text-primary hover:bg-primary/5 rounded-lg text-[14px] font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                    <ArrowDownTrayIcon className="w-5 h-5" /> {isExporting ? 'Exporting...' : 'Request Data Export (.JSON)'}
                 </button>
                 <button onClick={handleDeleteAccount} className="flex-1 py-3 bg-danger/10 border-2 border-transparent hover:border-danger hover:bg-danger/20 text-danger rounded-lg text-[14px] font-bold transition-all">
                    Initiate Account Deletion (RTBF)
                 </button>
              </div>

              </div>
           )}

          {activeTab !== 'dpdp' && (
             <div className="p-8 h-full flex flex-col items-center justify-center text-center fade-in">
                <div className="w-16 h-16 rounded-full bg-bg border border-border flex items-center justify-center mb-4 text-muted">
                  <UserCircleIcon className="w-8 h-8" />
                </div>
                <h3 className="text-h3 mb-2">{tabs.find(t => t.id === activeTab)?.name} Config</h3>
                <p className="text-sm text-muted max-w-sm">This settings panel is currently functional as a UI mockup, populated with local state.</p>
             </div>
          )}

        </div>

      </div>

    </div>
  );
}
