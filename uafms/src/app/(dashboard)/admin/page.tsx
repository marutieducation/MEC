'use client';

import React, { useState, useEffect } from 'react';
import {
  UsersIcon, ChartBarSquareIcon, CurrencyRupeeIcon,
  EllipsisHorizontalIcon, FireIcon, PlusIcon,
  ArrowRightIcon, ExclamationTriangleIcon,
  PresentationChartLineIcon, ViewColumnsIcon,
  BellAlertIcon, MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Column {
  id: string;
  name: string;
  count: number;
  bg?: string;
  color?: string;
}

interface ApplicationCard {
  _id: string;
  pipelineStage: string;
  course: string;
  aiMatchScore?: number;
  student?: {
    firstName: string;
    lastName: string;
  };
  university?: {
    name: string;
  };
  counsellor?: {
    user?: {
      firstName: string;
    };
  };
}

interface PipelineState {
  columns: Column[];
  cards: ApplicationCard[];
  funnelMetrics?: {
    activeApps: number;
    offerRate: number;
    revenue: number;
  };
}

interface CounsellorStats {
  _id: string;
  region?: string;
  user?: {
    firstName: string;
    lastName: string;
  };
  performanceStats?: {
    offersSecured: number;
    conversionRate: string;
  };
}

interface EscalationItem {
  _id: string;
  priority: string;
  type: string;
  createdAt: string;
  description: string;
  relatedApplication?: {
    student?: {
      firstName: string;
      lastName: string;
    };
  };
}

interface AnalyticsData {
  funnelMetrics: {
    activeApps: number;
    offerRate: number;
    revenue: number;
  };
}

export default function ControlTower() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'pipeline' | 'insights'>('pipeline');
  const [pipelineState, setPipelineState] = useState<PipelineState>({ columns: [], cards: [] });
  const [analytics, setAnalytics] = useState<any>(null);
  const [escalations, setEscalations] = useState<EscalationItem[]>([]);
  const [counsellors, setCounsellors] = useState<CounsellorStats[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Gujarat');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [pipelineRes, analyticsRes, escalationsRes, counsellorsRes] = await Promise.all([
          api.get('/admin/pipeline'),
          api.get('/admin/analytics'),
          api.get('/admin/escalations'),
          api.get('/counsellors')
        ]);

        setPipelineState(pipelineRes.data);
        setAnalytics(analyticsRes.data);
        setEscalations(escalationsRes.data);
        setCounsellors(counsellorsRes.data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to load admin data');
        } else {
          setError('Failed to load admin data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto text-center h-screen flex flex-col items-center justify-center">
        <div className="bg-danger/10 text-danger p-6 rounded-2xl border border-danger/20 inline-block shadow-xl">
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-xl font-bold mb-2">Operational Outage</p>
          <p className="opacity-80">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-danger text-white rounded-xl font-bold shadow-lg shadow-danger/20">Restart Systems</button>
        </div>
      </div>
    );
  }

  const funnelData = [
    { name: 'Total Leads', value: 540, fill: '#F8FAFC' },
    { name: 'Applications', value: 320, fill: '#E2E8F0' },
    { name: 'Offer Letters', value: 124, fill: '#3B82F6' },
    { name: 'Enrolled', value: 85, fill: '#10B981' },
  ];

  const fallbackRevData = [
    { month: 'Jan', rev: 450000, revenue: 450000 },
    { month: 'Feb', rev: 820000, revenue: 820000 },
    { month: 'Mar', rev: 670000, revenue: 670000 },
    { month: 'Apr', rev: 1100000, revenue: 1100000 },
    { month: 'May', rev: 1450000, revenue: 1450000 },
    { month: 'Jun', rev: 1900000, revenue: 1900000 },
  ];

  const chartData = analytics?.trendData || fallbackRevData;

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString()}`;
  };

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6 fade-in h-[calc(100vh-64px)] flex flex-col">

      {}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
             <PresentationChartLineIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-h1 text-heading tracking-tight">Control Tower</h1>
            <p className="text-body text-muted mt-0.5 font-medium">Strategic Operations & CRM</p>
          </div>
        </div>

        <div className="flex items-center bg-surface border border-border p-1 rounded-2xl shadow-sm">
           <button
             onClick={() => setActiveTab('pipeline')}
             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'pipeline' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-heading hover:bg-bg/50'}`}
           >
             <ViewColumnsIcon className="w-4 h-4" /> Pipeline
           </button>
           <button
             onClick={() => setActiveTab('insights')}
             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'insights' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-heading hover:bg-bg/50'}`}
           >
             <ChartBarSquareIcon className="w-4 h-4" /> Insights
           </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="hidden sm:flex bg-surface border border-border rounded-xl px-5 py-3 items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <UsersIcon className="w-6 h-6"/>
            </div>
            <div>
              <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-0.5">Active Apps</p>
              <p className="text-[18px] font-black text-heading leading-none">
                {analytics?.funnelMetrics?.activeApps || pipelineState?.funnelMetrics?.activeApps || 0}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex bg-surface border border-border rounded-xl px-5 py-3 items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
             <div className="w-10 h-10 bg-success/10 text-success rounded-xl flex items-center justify-center shrink-0">
               <ChartBarSquareIcon className="w-6 h-6"/>
             </div>
             <div>
               <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-0.5">Offer Rate</p>
               <p className="text-[18px] font-black text-heading leading-none">
                 {analytics?.funnelMetrics?.offerRate || pipelineState?.funnelMetrics?.offerRate || '0'}%
               </p>
             </div>
          </div>
           <div className="bg-surface border border-border rounded-xl px-5 py-3 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow min-w-[170px]">
             <div className="w-10 h-10 bg-info/10 text-info rounded-xl flex items-center justify-center shrink-0">
               <CurrencyRupeeIcon className="w-6 h-6"/>
             </div>
             <div>
               <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-0.5">Revenue</p>
               <p className="text-[18px] font-black text-heading leading-none">
                 {formatCurrency(analytics?.funnelMetrics?.revenue || pipelineState?.funnelMetrics?.revenue || 0)}
               </p>
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'pipeline' ? (
          <motion.div
            key="pipeline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-0 overflow-hidden"
          >

            {}
            <div className="xl:col-span-3 flex flex-col bg-surface border border-border rounded-2xl shadow-sm overflow-hidden min-h-0 relative">

              <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-bg/20 shrink-0">
                <div className="flex items-center gap-4 flex-1">
                   <div className="relative w-64">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        type="text"
                        placeholder="Search candidates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-9 pl-10 pr-4 bg-white border border-border rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                   </div>
                   <select
                     value={selectedRegion}
                     onChange={(e) => setSelectedRegion(e.target.value)}
                     className="h-9 px-3 bg-white border border-border rounded-xl text-xs font-bold text-heading focus:ring-2 focus:ring-primary/20 outline-none"
                   >
                     <option>All Gujarat</option>
                     <option>Ahmedabad</option>
                     <option>Surat</option>
                     <option>Vadodara</option>
                     <option>Rajkot</option>
                     <option>Gandhinagar</option>
                  </select>
                </div>
                <button className="h-9 px-4 bg-primary text-white hover:bg-primary-dark rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
                  <PlusIcon className="w-4 h-4" /> Add Lead
                </button>
              </div>

          <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
             <div className="flex gap-4 h-full w-max min-w-full">
                {pipelineState.columns?.map((col: Column) => (
                   <div key={col.id} className="w-[280px] flex flex-col shrink-0">
                      {}
                      <div className={`mb-3 py-1.5 px-3 rounded-lg flex justify-between items-center border ${col.bg || 'bg-surface/50'} border-border`}>
                        <span className="text-[13px] font-bold text-heading">{col.name}</span>
                        <span className="bg-white text-muted text-[11px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-border/50">{col.count}</span>
                      </div>

                      {}
                      <div className="flex-1 overflow-y-auto space-y-3 pb-8 pr-1 custom-scrollbar">
                         {pipelineState.cards?.filter((c: ApplicationCard) => {
                            const stageMatch = c.pipelineStage === col.id;
                            const searchMatch = !searchQuery ||
                              `${c.student?.firstName} ${c.student?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              c.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              c.university?.name.toLowerCase().includes(searchQuery.toLowerCase());
                            return stageMatch && searchMatch;
                         }).map((card: ApplicationCard) => (
                            <div key={card._id} className="bg-white border text-left border-border rounded-lg shadow-sm p-3 hover:shadow-md hover:border-primary/50 cursor-grab transform transition-all active:scale-95 group">
                               <div className="flex justify-between items-start mb-2">
                                 <div>
                                   <h4 className="text-[13px] font-bold text-heading group-hover:text-primary transition-colors">{card.student?.firstName} {card.student?.lastName}</h4>
                                   <p className="text-[11px] text-muted font-medium truncate max-w-[200px]">{card.course}</p>
                                 </div>
                                 <button className="text-muted hover:text-heading"><EllipsisHorizontalIcon className="w-5 h-5"/></button>
                               </div>

                               <div className="flex items-center gap-1.5 mb-3">
                                  <div className="w-4 h-4 rounded bg-bg text-muted flex items-center justify-center text-[8px] font-bold">U</div>
                                  <span className="text-[11px] font-semibold text-heading truncate max-w-[180px]">{card.university?.name}</span>
                               </div>

                               <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[9px] font-bold">
                                      {card.counsellor?.user?.firstName?.charAt(0) || 'C'}
                                    </div>
                                    <span className="text-[10px] text-muted font-medium">{card.counsellor?.user?.firstName || 'Pending'}</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded tracking-wider">
                                    MATCH: {card.aiMatchScore || 0}%
                                  </span>
                               </div>
                            </div>
                         ))}

                         {}
                         <div className="h-10 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 transition-colors cursor-pointer text-xs font-semibold">
                            + Add Card
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {}
        <div className="flex flex-col gap-6 min-h-0 overflow-y-auto pr-1">

          <div className="bg-[#FFF4F2] border border-[#FDECEC] rounded-xl p-5 shadow-sm">
            <h3 className="text-[14px] font-bold text-danger flex items-center gap-2 mb-4">
              <ExclamationTriangleIcon className="w-5 h-5" /> Urgent Escalations
            </h3>

            <div className="space-y-3">
               {escalations.length === 0 ? (
                 <div className="text-center py-4 text-muted text-xs">No active escalations.</div>
               ) : (
                 escalations.slice(0, 3).map((esc) => (
                   <div key={esc._id} className={`bg-white rounded-lg p-3 shadow-sm border ${esc.priority === 'urgent' ? 'border-danger/20' : 'border-warning/20'}`}>
                      <div className="flex justify-between items-start mb-1">
                         <span className={`font-semibold text-[13px] truncate pr-2 ${esc.priority === 'urgent' ? 'text-danger' : 'text-warning'}`}>{(esc.type || 'General').replace('_', ' ').toUpperCase()}</span>
                         <span className="text-[10px] text-muted font-bold shrink-0">{new Date(esc.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-heading font-medium mb-1 truncate">{esc.relatedApplication?.student?.firstName} {esc.relatedApplication?.student?.lastName}</p>
                      <p className="text-[11px] text-muted mb-2 truncate">{esc.description}</p>
                      <button className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1">
                         Resolve Case <ArrowRightIcon className="w-3 h-3"/>
                      </button>
                   </div>
                 ))
               )}
            </div>

            {escalations.length > 3 && (
              <button className="w-full mt-4 text-[12px] font-semibold text-danger hover:underline text-center">
                View all {escalations.length} escalations
              </button>
            )}
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex-1">
             <h3 className="text-[14px] font-bold text-heading flex items-center gap-2 mb-4">
               <FireIcon className="w-5 h-5 text-primary" /> Top Performers (Counsellors)
             </h3>
             <div className="space-y-4">
                {counsellors.length === 0 ? (
                  <div className="text-center py-4 text-muted text-xs">No counsellors found.</div>
                ) : (
                  counsellors.slice(0, 5).map((counsellor, index) => (
                    <div key={counsellor._id} className="flex items-center justify-between">
                       <div className="flex items-center gap-3 w-40">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] ${
                            index === 0 ? 'bg-success/10 text-success' :
                            index === 1 ? 'bg-primary/10 text-primary' :
                            'bg-surface text-muted border border-border'
                          }`}>
                            {counsellor.user?.firstName?.[0] || 'C'}
                          </div>
                          <div>
                             <h4 className="text-[13px] font-bold text-heading truncate max-w-[100px]">{counsellor.user?.firstName} {counsellor.user?.lastName}</h4>
                             <p className="text-[11px] text-muted capitalize">{counsellor.region || 'General'}</p>
                          </div>
                       </div>

                       <div className="flex-1 text-center">
                          <div className="text-[14px] font-extrabold text-heading">{counsellor.performanceStats?.offersSecured || 0}</div>
                          <p className="text-[10px] uppercase text-muted font-bold tracking-wider">Offers</p>
                       </div>

                       <div className="flex-1 text-right">
                          <div className={`text-[13px] font-bold ${
                             parseFloat(counsellor.performanceStats?.conversionRate || '0') > 80 ? 'text-success' : 'text-heading'
                          }`}>
                            {counsellor.performanceStats?.conversionRate || 0}%
                          </div>
                          <p className="text-[10px] text-muted font-medium">Conv. Rate</p>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
          </motion.div>
        ) : (
          <motion.div
            key="insights"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 overflow-hidden"
          >
            {}
            <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-1 custom-scrollbar">
               {}
               <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <h3 className="text-lg font-bold text-heading">Revenue Momentum</h3>
                        <p className="text-sm text-muted">MEC Commission Realization (LTM)</p>
                     </div>
                     <div className="flex items-center gap-2 bg-bg p-1 rounded-xl shadow-inner">
                        <button className="px-3 py-1 bg-white text-[11px] font-bold rounded-lg shadow-sm border border-border">Current</button>
                        <button className="px-3 py-1 text-[11px] font-bold text-muted hover:text-heading">Forecast</button>
                     </div>
                  </div>
                  <div className="h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                           <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                                 <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                           <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} tickFormatter={(v) => v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${v/1000}k`} />
                           <Tooltip
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', background: '#fff' }}
                              itemStyle={{ fontWeight: 'bold' }}
                           />
                           <Area type="monotone" dataKey={analytics?.trendData ? "revenue" : "rev"} name="Revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {}
                  <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
                     <h3 className="text-lg font-bold text-heading mb-6">Pipeline Velocity</h3>
                     <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={funnelData} layout="vertical" margin={{ left: 20 }}>
                              <XAxis type="number" hide />
                              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700}} width={90} />
                              <Tooltip cursor={{fill: 'rgba(59, 130, 246, 0.05)'}} />
                              <Bar dataKey="value" name="Volume" radius={[0, 10, 10, 0]} barSize={24}>
                                 {funnelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                 ))}
                              </Bar>
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  {}
                  <div className="bg-[#002147] rounded-3xl p-6 shadow-xl text-white relative overflow-hidden group">
                     {}
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <ChartBarSquareIcon className="w-24 h-24" />
                     </div>
                     <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>

                     <h3 className="text-lg font-bold mb-6 text-[#A6C8FF] relative z-10">Regional Intensity</h3>
                     <div className="space-y-5 relative z-10">
                        {[
                           { name: 'Maharashtra', val: 42, color: 'bg-primary' },
                           { name: 'Delhi NCR', val: 38, color: 'bg-success' },
                           { name: 'Karnataka', val: 31, color: 'bg-warning' },
                           { name: 'Telangana', val: 24, color: 'bg-info' }
                        ].map((m) => (
                           <div key={m.name} className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold tracking-wide">
                                 <span>{m.name}</span>
                                 <span>{m.val}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                 <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${m.val}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className={`h-full ${m.color} shadow-[0_0_8px_rgba(255,255,255,0.2)]`}
                                 />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {}
            <div className="flex flex-col gap-6 min-h-0">
               <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                           <BellAlertIcon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-base font-bold text-heading">Global Pulse</h3>
                     </div>
                     <div className="flex items-center gap-1.5 px-2 py-1 bg-success/10 rounded-full">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-success animate-pulse"></span>
                        <span className="text-[10px] font-bold text-success uppercase">Live</span>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-7 pr-2 custom-scrollbar">
                     {[
                        { time: '2m ago', user: 'Aditi S.', action: 'Applied to IIT Bombay', color: 'bg-success', detail: 'M.Tech CSE • GATE 740' },
                        { time: '15m ago', user: 'Rajiv K.', action: 'Case Escalated', color: 'bg-danger', detail: 'OBC Certificate Mismatch' },
                        { time: '1h ago', user: 'Vikram M.', action: 'Deposit Paid', color: 'bg-info', detail: '₹1.2L • BITS Pilani' },
                        { time: '3h ago', user: 'Ananya P.', action: 'New Inquiry', color: 'bg-primary', detail: 'Course: MBA (IIM-A)' },
                        { time: '5h ago', user: 'IIT Delhi', action: 'Offer Issued', color: 'bg-success', detail: 'Student: Amrit S.' },
                        { time: '1d ago', user: 'System', action: 'Cron Jobs Sync', color: 'bg-muted', detail: 'Health Check: 100%' }
                     ].map((p, i) => (
                        <div key={i} className="flex gap-4 group cursor-default">
                           <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full ${p.color} ring-4 ring-bg relative z-10 transition-transform group-hover:scale-125`}></div>
                              {i !== 5 && <div className="flex-1 w-0.5 bg-border -my-1"></div>}
                           </div>
                           <div className="pb-2">
                              <div className="flex items-center gap-2 mb-1">
                                 <p className="text-[10px] font-bold text-muted uppercase tracking-widest leading-none">{p.time}</p>
                                 <span className="w-1 h-1 rounded-full bg-border"></span>
                                 <p className="text-[11px] font-bold text-primary group-hover:underline leading-none">{p.user}</p>
                              </div>
                              <p className="text-[14px] text-heading font-bold mb-0.5">{p.action}</p>
                              <p className="text-[12px] text-muted font-medium line-clamp-1">{p.detail}</p>
                           </div>
                        </div>
                     ))}
                  </div>

                  <button className="mt-6 w-full py-3 bg-bg hover:bg-border text-heading text-xs font-bold rounded-xl transition-colors">
                     View All Activity
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
