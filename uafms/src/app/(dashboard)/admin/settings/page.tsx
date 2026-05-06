'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BuildingOfficeIcon,
  ShieldCheckIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';


const groupIcons: Record<string, React.ElementType> = {
  'Platform Configuration': BuildingOfficeIcon,
  'Security & Access': ShieldCheckIcon,
  'Notifications': BellIcon,
};

interface SettingItem {
  key: string;
  label: string;
  value: string | boolean | number;
  description: string;
  type: 'text' | 'toggle' | 'number';
}

export default function AdminSettingsPage() {
  const [settingsGroups, setSettingsGroups] = useState<Record<string, SettingItem[]>>({});
  const [activeGroup, setActiveGroup] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [pendingChanges, setPendingChanges] = useState<Record<string, string | boolean | number>>({});

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/settings/platform');
      if (res.success && res.data) {
        setSettingsGroups(res.data);
        const groups = Object.keys(res.data);
        if (groups.length > 0) {
          setActiveGroup(prev => prev || groups[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load settings from MongoDB', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggle = (key: string, currentValue: boolean) => {
    const newValue = !currentValue;
    setPendingChanges((prev) => ({ ...prev, [key]: newValue }));

    setSettingsGroups((prev) => {
      const updated = { ...prev };
      for (const group in updated) {
        updated[group] = updated[group].map((s) => s.key === key ? { ...s, value: newValue } : s);
      }
      return updated;
    });
  };

  const handleTextChange = (key: string, value: string) => {
    setPendingChanges((prev) => ({ ...prev, [key]: value }));
    setSettingsGroups((prev) => {
      const updated = { ...prev };
      for (const group in updated) {
        updated[group] = updated[group].map((s) => s.key === key ? { ...s, value } : s);
      }
      return updated;
    });
  };

  const handleSave = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      setSaveMessage('No changes to save');
      setTimeout(() => setSaveMessage(null), 2000);
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await api.put('/settings/platform', { settings: pendingChanges });
      if (res.success) {
        setSettingsGroups(res.data);
        setPendingChanges({});
        setSaveMessage('✅ Settings saved to MongoDB');
      }
    } catch (err: any) {
      setSaveMessage(`❌ ${err.message || 'Failed to save settings'}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const groupNames = Object.keys(settingsGroups);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-heading tracking-tight">System Control Panel</h1>
          <p className="text-muted font-medium">Manage global configurations, security protocols, and integration hooks. All changes persist to MongoDB.</p>
        </div>
        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className="text-xs font-bold text-heading bg-bg px-3 py-2 rounded-lg border border-border animate-pulse">
              {saveMessage}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || Object.keys(pendingChanges).length === 0}
            className="h-11 px-6 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Saving...</>
            ) : (
              <>Save All Changes {Object.keys(pendingChanges).length > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{Object.keys(pendingChanges).length}</span>}</>
            )}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted font-bold text-sm">Loading settings from MongoDB...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {}
          <div className="lg:col-span-1 space-y-2">
            {groupNames.map((groupName) => {
              const Icon = groupIcons[groupName] || BuildingOfficeIcon;
              return (
                <button
                  key={groupName}
                  onClick={() => setActiveGroup(groupName)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    activeGroup === groupName
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-surface text-muted hover:bg-bg border border-transparent hover:border-border'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {groupName}
                </button>
              );
            })}
            <div className="pt-4 mt-4 border-t border-border">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-danger hover:bg-danger/5 transition-all">
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                Logout from All Devices
              </button>
            </div>
          </div>

          {}
          <div className="lg:col-span-3">
            <motion.div
              key={activeGroup}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface border border-border rounded-3xl p-8 shadow-sm space-y-8"
            >
              <div className="flex items-center gap-4 mb-2">
                 <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                   {React.createElement(groupIcons[activeGroup] || BuildingOfficeIcon, { className: "w-6 h-6 text-primary" })}
                 </div>
                 <h2 className="text-xl font-black text-heading uppercase tracking-tight">{activeGroup}</h2>
              </div>

              <div className="divide-y divide-border">
                {(settingsGroups[activeGroup] || []).map((setting) => (
                  <div key={setting.key} className="py-6 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="max-w-md">
                      <h4 className="text-sm font-bold text-heading mb-1">{setting.label}</h4>
                      <p className="text-xs text-muted font-medium leading-relaxed">{setting.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {setting.type === 'toggle' ? (
                        <button
                          onClick={() => handleToggle(setting.key, setting.value as boolean)}
                          className={`w-12 h-6 rounded-full relative transition-colors ${setting.value ? 'bg-success' : 'bg-muted/30'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${setting.value ? 'left-7' : 'left-1'}`}></div>
                        </button>
                      ) : (
                        <input
                          type="text"
                          value={setting.value as string}
                          onChange={(e) => handleTextChange(setting.key, e.target.value)}
                          className="h-10 px-4 bg-bg border border-border rounded-xl text-sm font-bold text-heading focus:ring-2 focus:ring-primary/20 outline-none min-w-[200px]"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-border flex justify-between items-center">
                 <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest bg-bg px-3 py-1.5 rounded-lg border border-border">
                   <ShieldCheckIcon className="w-3 h-3 text-success" /> Synced with MongoDB
                 </div>
                 {Object.keys(pendingChanges).length > 0 && (
                   <div className="text-[10px] font-black text-warning uppercase tracking-widest">
                     {Object.keys(pendingChanges).length} unsaved change(s)
                   </div>
                 )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
