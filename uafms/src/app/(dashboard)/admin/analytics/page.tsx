'use client';

import React from 'react';
import {
  ArrowTrendingUpIcon, CloudArrowDownIcon, CalendarDaysIcon,
  GlobeAltIcon, AcademicCapIcon, BanknotesIcon, LightBulbIcon
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';

const funnelData = [
  { name: 'Leads', students: 4000 },
  { name: 'Verified', students: 2400 },
  { name: 'Applied', students: 1800 },
  { name: 'Offers', students: 1200 },
  { name: 'Enrolled', students: 850 },
];

const revenueData = [
  { name: 'North India', value: 45 },
  { name: 'South India', value: 30 },
  { name: 'West India', value: 15 },
  { name: 'East India', value: 10 },
];

const trendData = [
  { name: 'Jan', revenue: 4000000 },
  { name: 'Feb', revenue: 3000000 },
  { name: 'Mar', revenue: 5000000 },
  { name: 'Apr', revenue: 4500000 },
  { name: 'May', revenue: 6000000 },
  { name: 'Jun', revenue: 8000000 },
];

const COLORS = ['#FF6B00', '#2E7D32', '#1976D2', '#9E9E9E'];

export default function IntelligenceHub() {
  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6 fade-in min-h-[calc(100vh-64px)] flex flex-col pb-10">

      {}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-h1 text-heading">Intelligence Hub</h1>
          <p className="text-body text-muted mt-1">Management Business Intelligence (BI) Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 bg-surface border border-border text-heading hover:bg-bg rounded-lg font-medium text-[13px] transition-colors flex items-center gap-2 shadow-sm">
            <CalendarDaysIcon className="w-4 h-4" /> Last 6 Months (Q1-Q2)
          </button>
          <button className="h-10 px-4 bg-primary text-white hover:bg-primary-dark rounded-lg font-medium text-[13px] transition-colors flex items-center gap-2 shadow-sm">
            <CloudArrowDownIcon className="w-4 h-4" /> Export Report (PDF)
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
         <div className="bg-surface border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-success/5 rounded-full group-hover:bg-success/10 transition-colors"></div>
            <div className="flex items-start justify-between relative z-10">
               <div>
                  <p className="text-[12px] font-bold text-muted uppercase tracking-wider mb-1">Total Revenue</p>
                  <h3 className="text-3xl font-extrabold text-heading tracking-tight">₹3.5Cr</h3>
               </div>
               <div className="p-2 bg-success/10 text-success rounded-lg"><BanknotesIcon className="w-6 h-6"/></div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[12px] font-bold text-success relative z-10">
               <ArrowTrendingUpIcon className="w-4 h-4"/> +14.5% <span className="text-muted font-medium ml-1">vs last period</span>
            </div>
         </div>

         <div className="bg-surface border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors"></div>
            <div className="flex items-start justify-between relative z-10">
               <div>
                  <p className="text-[12px] font-bold text-muted uppercase tracking-wider mb-1">Conversion Rate</p>
                  <h3 className="text-3xl font-extrabold text-heading tracking-tight">21.2%</h3>
               </div>
               <div className="p-2 bg-primary/10 text-primary rounded-lg"><ArrowTrendingUpIcon className="w-6 h-6"/></div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[12px] font-bold text-success relative z-10">
               <ArrowTrendingUpIcon className="w-4 h-4"/> +2.1% <span className="text-muted font-medium ml-1">Lead to Offer</span>
            </div>
         </div>

         <div className="bg-surface border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-warning/5 rounded-full group-hover:bg-warning/10 transition-colors"></div>
            <div className="flex items-start justify-between relative z-10">
               <div>
                  <p className="text-[12px] font-bold text-muted uppercase tracking-wider mb-1">Avg Process Time</p>
                  <h3 className="text-3xl font-extrabold text-heading tracking-tight">18 <span className="text-lg font-bold text-muted">Days</span></h3>
               </div>
               <div className="p-2 bg-warning/10 text-warning rounded-lg"><CalendarDaysIcon className="w-6 h-6"/></div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[12px] font-bold text-success relative z-10">
               <ArrowTrendingUpIcon className="w-4 h-4 rotate-180"/> -4 Days <span className="text-muted font-medium ml-1">Faster than Q1</span>
            </div>
         </div>

         <div className="bg-gradient-to-br from-primary to-primary-dark border border-primary-dark rounded-xl p-5 shadow-md relative overflow-hidden text-white">
            <div className="absolute right-0 top-0 w-full h-full bg-[url('https:
            <div className="flex items-start justify-between relative z-10">
               <div>
                  <p className="text-[12px] font-bold text-primary-light uppercase tracking-wider mb-1">Active Partners</p>
                  <h3 className="text-3xl font-extrabold tracking-tight">142</h3>
               </div>
               <div className="p-2 bg-white/20 rounded-lg"><AcademicCapIcon className="w-6 h-6"/></div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[12px] font-bold text-white relative z-10">
               8 New Universities Onboarded This Month
            </div>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {}
        <div className="lg:col-span-2 flex flex-col gap-6">
           {}
           <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col h-[350px]">
              <h3 className="text-[15px] font-bold text-heading mb-4 border-b border-border pb-3">Revenue Growth Trend</h3>
              <div className="flex-1 w-full min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `₹${val/100000}L`} />
                     <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        formatter={(value) => [`₹${(value as number)/100000} Lakhs`, 'Revenue']}
                     />
                     <Area type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                   </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {}
           <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col h-[300px]">
              <h3 className="text-[15px] font-bold text-heading mb-4 border-b border-border pb-3">Student Application Funnel</h3>
              <div className="flex-1 w-full min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#1F2937', fontWeight: 600 }} />
                     <Tooltip
                        cursor={{fill: '#F3F4F6'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                     />
                     <Bar dataKey="students" fill="#2E7D32" radius={[0, 4, 4, 0]} barSize={24}>
                       {funnelData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={index === 0 ? '#1A1A2E' : index === 4 ? '#FF6B00' : '#2E7D32'} />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {}
        <div className="lg:col-span-1 flex flex-col gap-6">

           {}
           <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[350px]">
              <div className="p-5 border-b border-border bg-bg/50">
                 <h3 className="text-[15px] font-bold text-heading flex items-center gap-2">
                   <LightBulbIcon className="w-5 h-5 text-warning" /> AI Insights
                 </h3>
              </div>
              <div className="p-5 flex-1 overflow-y-auto space-y-4">

                 <div className="bg-warning/5 border border-warning/20 p-4 rounded-lg">
                    <p className="text-[13px] font-bold text-heading mb-1">Bottleneck Detected</p>
                    <p className="text-[12px] text-muted">Education loan processing for East India region is taking 24% longer than average. Consider partner bank tie-ups.</p>
                 </div>

                 <div className="bg-success/5 border border-success/20 p-4 rounded-lg">
                    <p className="text-[13px] font-bold text-heading mb-1">Opportunity Spot</p>
                    <p className="text-[12px] text-muted">Data Science programs at IIT Madras have an 82% offer rate. Target more marketing towards CS undergraduates.</p>
                 </div>

                 <div className="bg-info/5 border border-info/20 p-4 rounded-lg">
                    <p className="text-[13px] font-bold text-heading mb-1">Conversion Uptick</p>
                    <p className="text-[12px] text-muted">Applications verified within 24 hours have a 3x higher probability of enrollment.</p>
                 </div>

              </div>
           </div>

           {}
           <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col h-[300px]">
              <h3 className="text-[15px] font-bold text-heading mb-4 pb-3 border-b border-border flex items-center gap-2">
                 <GlobeAltIcon className="w-5 h-5 text-muted" /> Market Share
              </h3>
              <div className="flex-1 flex items-center justify-center relative min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={revenueData}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                     >
                       {revenueData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip />
                     <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}/>
                   </PieChart>
                 </ResponsiveContainer>
                 {}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[-18px] text-center pointer-events-none">
                    <span className="text-[10px] uppercase font-bold text-muted block">Total leads</span>
                    <span className="text-xl font-extrabold text-heading">12k+</span>
                 </div>
              </div>
           </div>

        </div>

      </div>

    </div>
  );
}
