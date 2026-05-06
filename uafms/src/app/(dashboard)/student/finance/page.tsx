'use client';

import React, { useState } from 'react';
import {
  BanknotesIcon,
  CalculatorIcon,
  AcademicCapIcon,
  HomeIcon,
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function FinancePlanner() {
  const [tuition, setTuition] = useState(2500000);
  const [livingMonth, setLivingMonth] = useState(60000);
  const [insurance, setInsurance] = useState(50000);
  const [duration, setDuration] = useState(2);
  const currency = 'INR';

  const [savings, setSavings] = useState(800000);
  const [showModal, setShowModal] = useState(false);


  const totalLiving = livingMonth * 12 * duration;
  const totalTuition = tuition * duration;
  const grandTotal = totalTuition + totalLiving + insurance;
  const savingsPercent = Math.min(Math.round((savings / grandTotal) * 100), 100);

  const format = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };



  const BreakdownItem = ({ label, amount, icon: Icon, color }: any) => (
    <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-2xl transition-all hover:border-primary/30 group">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-black text-muted uppercase tracking-wider">{label}</p>
          <p className="text-lg font-black text-heading">{format(amount)}</p>
        </div>
      </div>
      <p className="text-[11px] font-bold text-muted italic bg-bg px-2 py-0.5 rounded-full">
        {((amount / grandTotal) * 100).toFixed(1)}%
      </p>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 fade-in relative min-h-screen">
      {}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface border border-border w-full max-w-md rounded-[40px] p-10 space-y-8 shadow-2xl scale-in relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6">
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-heading transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <ShieldCheckIcon className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-heading tracking-tight">Status: Eligible</h2>
                <p className="text-sm text-body leading-relaxed px-4">Based on your target universities, you are tentatively eligible for an educational loan.</p>
              </div>
            </div>

            <div className="p-8 bg-bg rounded-[32px] border border-border space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-muted uppercase tracking-[2px]">Maximum Loan Amount</span>
                <p className="text-3xl font-black text-primary">{format(grandTotal * 0.85)}</p>
              </div>
              <div className="h-px bg-border/50"></div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-heading">Estimated Interest</span>
                <span className="text-lg font-black text-heading">8.5% <span className="text-xs font-bold text-muted">p.a.</span></span>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-5 bg-heading text-white font-black text-xs uppercase tracking-[2px] rounded-2xl hover:opacity-95 transition-all shadow-xl active:scale-[0.98]"
            >
              Contact Loan Expert
            </button>
          </div>
        </div>
      )}

      {}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black text-heading tracking-tight">Finance <span className="text-primary italic">Planner.</span></h1>
          <p className="text-lg text-body">Calculate the total cost of your education and check eligibility.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface border border-border rounded-[32px] p-8 space-y-8 shadow-sm">
            <h3 className="text-xs font-black text-heading uppercase tracking-[3px] border-b border-border pb-6 flex items-center justify-between">
              Variable Costs <CalculatorIcon className="w-4 h-4 text-muted" />
            </h3>

            <div className="space-y-8">
              <div className="group">
                <label className="text-[10px] font-black text-muted uppercase tracking-[2px] mb-4 block group-hover:text-primary transition-colors">Yearly Tuition Fee</label>
                <input
                  type="range" min="100000" max="5000000" step="50000"
                  value={tuition} onChange={(e) => setTuition(Number(e.target.value))}
                  className="w-full h-1.5 bg-bg rounded-lg appearance-none cursor-pointer accent-primary border border-border/50"
                />
                <div className="flex justify-between text-sm font-black text-heading mt-3">
                  <span>{format(tuition)}/yr</span>
                  <span className="text-muted text-[10px] font-bold">Max 50L</span>
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-muted uppercase tracking-[2px] mb-4 block group-hover:text-primary transition-colors">Monthly Living</label>
                <input
                  type="range" min="10000" max="200000" step="5000"
                  value={livingMonth} onChange={(e) => setLivingMonth(Number(e.target.value))}
                  className="w-full h-1.5 bg-bg rounded-lg appearance-none cursor-pointer accent-primary border border-border/50"
                />
                <div className="flex justify-between text-sm font-black text-heading mt-3">
                  <span>{format(livingMonth)}/mo</span>
                  <span className="text-muted text-[10px] font-bold">Max 2L</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted uppercase tracking-[2px] block">Course Duration</label>
                <select
                  value={duration} onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-bg border border-border rounded-2xl px-5 py-3.5 text-sm font-black text-heading focus:border-primary focus:outline-none transition-all shadow-sm"
                >
                  {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>{y} {y === 1 ? 'Year' : 'Years'}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="p-8 bg-gradient-to-br from-primary/10 via-bg to-bg rounded-[32px] border border-primary/20 relative overflow-hidden group hover:border-primary/40 transition-all shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-6 group-hover:-rotate-12 transition-all">
                <ShieldCheckIcon className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-black text-heading mb-2 uppercase tracking-tight">Loan Eligibility</h4>
              <p className="text-[12px] text-body mb-6 leading-relaxed font-medium">Based on your target profile, you are eligible for up to **{format(grandTotal * 0.85)}** with deferred payments.</p>
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-3.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[2px] rounded-xl hover:bg-primary hover:text-white transition-all active:scale-[0.98]"
              >
                CHECK PRE-APPROVAL
              </button>
            </div>
          </div>
        </div>

        {}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0B0F19] rounded-[48px] p-10 md:p-12 text-white relative overflow-hidden border border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full -mr-64 -mt-64 blur-[120px]"></div>

            <div className="relative z-10 space-y-10">
              <div className="space-y-2">
                <p className="text-[11px] font-black text-primary uppercase tracking-[4px] opacity-80">Total Estimated Budget</p>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-3">
                  <h2 className="text-6xl md:text-7xl font-black tracking-tight drop-shadow-lg">{format(grandTotal)}</h2>
                  <span className="text-gray-400 font-black text-xs tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/10 uppercase italic">
                    For {duration} {duration === 1 ? 'Year' : 'Years'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <BreakdownItem label="Total Tuition Fees" amount={totalTuition} icon={AcademicCapIcon} color="bg-primary/95 shadow-lg shadow-primary/20" />
                <BreakdownItem label="Living & Food" amount={totalLiving} icon={HomeIcon} color="bg-blue-600/90 shadow-lg shadow-blue-500/20" />
                <BreakdownItem label="Insurance & Misc" amount={insurance} icon={ShieldCheckIcon} color="bg-emerald-600/90 shadow-lg shadow-emerald-500/20" />
                <div className="flex items-center justify-start p-5 bg-white/5 border border-white/10 rounded-3xl group cursor-pointer hover:bg-white/10 transition-all border-dashed">
                  <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                    <ArrowTrendingUpIcon className="w-6 h-6" />
                  </div>
                  <div className="ml-5">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[2px]">Inflation Buffer</p>
                    <p className="text-xs font-bold text-white/70">Incl. 5% annual hike</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-[40px] p-10 shadow-sm space-y-8">
            <h3 className="text-xs font-black text-heading flex items-center gap-3 uppercase tracking-[3px]">
              <CalculatorIcon className="w-6 h-6 text-primary" /> Savings & Grants Tracker
            </h3>

            <div className="space-y-10">
              <div className="relative pb-4">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-[2px] mb-4">
                  <span className="text-muted">Target Coverage</span>
                  <span className="text-primary">{savingsPercent}% Achieved</span>
                </div>
                <div className="h-4 w-full bg-bg rounded-full overflow-hidden border border-border/50 p-1">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                    style={{ width: `${savingsPercent}%` }}
                  ></div>
                </div>

                <div className="mt-8 p-6 bg-bg/50 rounded-[32px] border border-border/50 border-dashed space-y-4">
                  <p className="text-xs text-body font-bold leading-relaxed">
                    Adjust your currently saved amount to see your financial gap.
                  </p>
                  <div className="flex items-center gap-6">
                    <input
                      type="range" min="0" max={grandTotal} step="10000"
                      value={savings} onChange={(e) => setSavings(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-sm font-black text-heading min-w-[100px] text-right">{format(savings)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
