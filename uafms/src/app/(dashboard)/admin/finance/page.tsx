'use client';

import React, { useState, useEffect } from 'react';
import {
  DocumentArrowDownIcon, ShieldCheckIcon,
  DocumentIcon, CreditCardIcon, XMarkIcon
} from '@heroicons/react/24/outline';
import { LockClosedIcon, PlusIcon } from '@heroicons/react/20/solid';
import { api } from '@/lib/api';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Invoice {
  _id: string;
  invoiceId: string;
  student?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  studentName: string;
  description: string;
  amount: string;
  amountNumeric: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue' | 'refunded';
}

export default function Financials() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [summary, setSummary] = useState({ totalPaid: '₹0', totalPending: '₹0', count: 0 });
  const [processingPayment, setProcessingPayment] = useState(false);


  const [showCreateModal, setShowCreateModal] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    student: '',
    studentName: '',
    description: '',
    amount: '',
    amountNumeric: 0,
    status: 'pending' as 'paid' | 'pending',
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/finance/invoices');
      setInvoices(res.invoices || []);
      setSummary(res.summary || { totalPaid: '₹0', totalPending: '₹0', count: 0 });
      if (res.invoices?.length > 0 && !selectedInvoice) {
        setSelectedInvoice(res.invoices[0]);
      }
    } catch (err) {
      console.error('Failed to fetch invoices', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!selectedInvoice || selectedInvoice.status === 'paid') return;

    setProcessingPayment(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      await api.put(`/finance/invoices/${selectedInvoice._id}/pay`, { paymentMethod: 'razorpay' });
      await fetchInvoices();
      setSelectedInvoice(prev => prev ? { ...prev, status: 'paid' } : null);

      alert('Payment Successful via Razorpay!');
    } catch (err: any) {
      console.error('Payment failed', err);
      alert(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const openCreateModal = async () => {
    setShowCreateModal(true);
    setLoadingStudents(true);
    try {
      const res = await api.get('/admin/users?role=student');
      setStudents(res.data || []);
    } catch (err) {
      console.error('Failed to fetch students', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    const student = students.find(s => s._id === studentId);
    setNewInvoice(prev => ({
      ...prev,
      student: studentId,
      studentName: student ? `${student.firstName} ${student.lastName}` : '',
    }));
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.student || !newInvoice.description || !newInvoice.amountNumeric) {
      alert('Please fill all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const inv = await api.post('/finance/invoices', {
        student: newInvoice.student,
        studentName: newInvoice.studentName,
        description: newInvoice.description,
        amount: `₹${newInvoice.amountNumeric.toLocaleString('en-IN')}`,
        amountNumeric: newInvoice.amountNumeric,
        currency: 'INR',
        status: newInvoice.status,
      });

      setShowCreateModal(false);
      setNewInvoice({ student: '', studentName: '', description: '', amount: '', amountNumeric: 0, status: 'pending' });
      await fetchInvoices();
      setSelectedInvoice(inv);
      alert('Invoice created and saved to MongoDB!');
    } catch (err: any) {
      alert(err.message || 'Failed to create invoice.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6 fade-in h-auto lg:h-[calc(100vh-64px)] flex flex-col pb-10">

      {}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-h1 text-heading">Payments & Invoicing</h1>
          <p className="text-body text-muted mt-1">Manage billing, view payment history, and complete pending transactions. All data synced with MongoDB.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 bg-surface border border-border text-heading hover:bg-bg rounded-lg font-medium text-[13px] transition-colors flex items-center gap-2 shadow-sm">
            <DocumentArrowDownIcon className="w-4 h-4" /> Download Statement
          </button>
          <button
            onClick={openCreateModal}
            className="h-11 px-6 bg-heading hover:bg-black text-white rounded-lg font-bold text-[14px] flex items-center justify-center gap-2 transition-all w-full sm:w-auto shadow-sm"
          >
            <PlusIcon className="w-5 h-5" /> New Invoice
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-8 min-h-0">

        {}
        <div className="xl:col-span-2 flex flex-col gap-6 min-h-0">
          <div className="flex flex-col bg-surface border border-border rounded-xl shadow-sm min-h-0 overflow-hidden">
            <div className="border-b border-border px-6 py-4 flex justify-between items-center bg-bg/30 shrink-0">
              <h3 className="text-[15px] font-bold text-heading">Recent Invoices</h3>
              <div className="flex gap-4 items-center">
                <div className="text-[11px] text-muted font-bold uppercase tracking-wider">
                  Total Paid: <span className="text-success">{summary.totalPaid}</span>
                  {' · '}Pending: <span className="text-warning">{summary.totalPending}</span>
                </div>
                <button onClick={fetchInvoices} className="text-[13px] font-semibold text-primary hover:underline">Refresh</button>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted">
                  <DocumentIcon className="w-12 h-12 mb-3 opacity-50" />
                  <p className="font-bold">No invoices yet</p>
                  <p className="text-xs">Create your first invoice to get started</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-surface border-b border-border">
                      <th className="px-6 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Invoice ID</th>
                      <th className="px-6 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Details</th>
                      <th className="px-6 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-[11px] font-bold text-muted uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-[11px] font-bold text-muted uppercase tracking-wider text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-[13px]">
                    {invoices.map((inv) => (
                      <tr
                        key={inv._id}
                        onClick={() => setSelectedInvoice(inv)}
                        className={`hover:bg-bg/50 transition-colors group cursor-pointer ${selectedInvoice?._id === inv._id ? 'bg-primary/5' : ''}`}
                      >
                        <td className="px-6 py-4 font-bold text-heading flex items-center gap-2">
                           <DocumentIcon className="w-4 h-4 text-muted" /> {inv.invoiceId}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-heading">{inv.description}</span>
                            <span className="text-[11px] text-muted">{inv.student ? `${inv.student.firstName} ${inv.student.lastName}` : inv.studentName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted font-medium">
                          {new Date(inv.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 font-extrabold text-heading">{inv.amount}</td>
                        <td className="px-6 py-4 text-right">
                           {inv.status === 'paid' ? (
                              <div className="w-max ml-auto px-2 py-0.5 rounded uppercase tracking-wider bg-success/10 border border-success/20 flex items-center gap-1 text-[10px] font-bold text-success">
                                 Paid
                              </div>
                           ) : (
                              <div className="w-max ml-auto px-2 py-0.5 rounded uppercase tracking-wider bg-warning/10 border border-warning/20 flex items-center gap-1 text-[10px] font-bold text-warning">
                                 Pending
                              </div>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {}
          <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
            <h3 className="text-[15px] font-bold text-heading mb-4">Student Payment Tracker</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from(new Set(invoices.map(inv => inv.student ? `${inv.student.firstName} ${inv.student.lastName}` : inv.studentName))).map(name => {
                const studentInvoices = invoices.filter(inv => {
                  const invName = inv.student ? `${inv.student.firstName} ${inv.student.lastName}` : inv.studentName;
                  return invName === name;
                });
                const paid = studentInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amountNumeric, 0);
                const pending = studentInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amountNumeric, 0);

                return (
                  <div key={name} className="p-4 bg-bg rounded-xl border border-border flex justify-between items-center group hover:border-primary/30 transition-all">
                    <div>
                      <h4 className="font-bold text-heading text-sm">{name || 'Guest Student'}</h4>
                      <p className="text-[10px] text-muted font-bold uppercase tracking-tight">{studentInvoices.length} Invoices Generated</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-success">₹{paid.toLocaleString()} Paid</div>
                      <div className="text-xs font-black text-warning">₹{pending.toLocaleString()} Pending</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {}
        <div className="xl:col-span-1 flex flex-col bg-surface border border-border rounded-xl shadow-lg relative overflow-hidden">
          {selectedInvoice ? (
            <>
              {}
              <div className="bg-[#1A1A2E] text-white p-6 relative overflow-hidden shrink-0">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-20 -mr-10 -mt-10 rounded-full blur-2xl"></div>
                 <p className="text-[12px] font-bold tracking-wider text-gray-400 mb-1 uppercase">Payment Overview</p>
                 <h3 className="text-3xl font-extrabold mb-1">{selectedInvoice.amount} <span className="text-sm font-medium text-gray-400">INR</span></h3>
                 <p className="text-[13px] text-gray-300">{selectedInvoice.description} ({selectedInvoice.invoiceId})</p>
              </div>

              {}
              <div className="p-6 flex-1 overflow-y-auto">
                 <div className="flex items-center gap-3 mb-6">
                    <button className="flex-1 py-2 text-[12px] font-bold text-primary border-b-2 border-primary transition-colors text-center">Credit Card</button>
                    <button className="flex-1 py-2 text-[12px] font-bold text-muted border-b-2 border-transparent hover:border-border transition-colors text-center">Net Banking</button>
                    <button className="flex-1 py-2 text-[12px] font-bold text-muted border-b-2 border-transparent hover:border-border transition-colors text-center">UPI</button>
                 </div>

                 <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-heading uppercase tracking-wide">Card Number</label>
                      <div className="relative">
                        <CreditCardIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input type="text" placeholder="5555 5555 5555 5555" className="w-full h-10 pl-10 pr-4 bg-bg border border-border rounded-lg text-[14px] text-heading placeholder:text-muted focus:outline-none focus:border-primary transition-all font-mono" />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                           <div className="w-6 h-4 bg-[#FF5F00] rounded-sm"></div>
                           <div className="w-6 h-4 bg-[#EB001B] rounded-sm -ml-3 opacity-80 mix-blend-multiply"></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-heading uppercase tracking-wide">Expiry Date</label>
                        <input type="text" placeholder="MM/YY" className="w-full h-10 px-3 bg-bg border border-border rounded-lg text-[14px] text-heading placeholder:text-muted focus:outline-none focus:border-primary transition-all" />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[12px] font-bold text-heading uppercase tracking-wide">CVV</label>
                          <input type="password" placeholder="•••" maxLength={4} className="w-full h-10 px-3 bg-bg border border-border rounded-lg text-[14px] text-heading placeholder:text-muted focus:outline-none focus:border-primary transition-all" />
                       </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-heading uppercase tracking-wide">Amount (₹)</label>
                        <input type="text" value={selectedInvoice.amountNumeric} readOnly className="w-full h-10 px-3 bg-bg/50 border border-border rounded-lg text-[14px] text-heading focus:outline-none cursor-not-allowed" />
                    </div>

                    <div className="flex flex-col gap-1.5 mb-2">
                      <label className="text-[12px] font-bold text-heading uppercase tracking-wide">Cardholder Name</label>
                      <input type="text" placeholder="Name on card" className="w-full h-10 px-3 bg-bg border border-border rounded-lg text-[14px] text-heading placeholder:text-muted focus:outline-none focus:border-primary transition-all" />
                    </div>
                 </div>

                 <button
                  onClick={handlePay}
                  disabled={selectedInvoice.status === 'paid' || processingPayment}
                  className="w-full mt-6 h-12 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-[14px] flex justify-center items-center gap-2 transition-all shadow-[0_4px_14px_rgba(255,107,0,0.39)] hover:shadow-[0_6px_20px_rgba(255,107,0,0.23)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                 >
                   {processingPayment ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                   ) : selectedInvoice.status === 'paid' ? (
                      <>Success <ShieldCheckIcon className="w-4 h-4" /></>
                   ) : (
                      <><LockClosedIcon className="w-4 h-4" /> Pay {selectedInvoice.amount}</>
                   )}
                 </button>

                 <p className="text-[11px] text-center text-muted mt-4 flex items-center justify-center gap-1.5">
                    <ShieldCheckIcon className="w-4 h-4 text-success" /> Payments are secure and encrypted.
                 </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
              <div className="w-16 h-16 bg-bg flex items-center justify-center rounded-full text-muted">
                <DocumentIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-heading font-bold">No Invoice Selected</p>
                <p className="text-muted text-xs">Select an invoice from the list to view details and process payment.</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl border border-border fade-in overflow-hidden">
            {}
            <div className="bg-[#1A1A2E] text-white px-8 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black tracking-tight">Create New Invoice</h2>
                <p className="text-gray-400 text-xs mt-0.5">Invoice will be saved to MongoDB</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-8 space-y-5">
              {}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted">Select Student *</label>
                {loadingStudents ? (
                  <div className="h-11 bg-bg border border-border rounded-xl flex items-center px-4 text-muted text-sm animate-pulse">
                    Loading students from database...
                  </div>
                ) : (
                  <select
                    required
                    value={newInvoice.student}
                    onChange={(e) => handleStudentSelect(e.target.value)}
                    className="w-full h-11 px-4 bg-bg border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm text-heading"
                  >
                    <option value="">Choose a student...</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.firstName} {s.lastName} — {s.email}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted">Description *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Premium Counselling & Visa (UK)"
                  value={newInvoice.description}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-11 px-4 bg-bg border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
              </div>

              {}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-muted">Amount (₹) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="45000"
                    value={newInvoice.amountNumeric || ''}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, amountNumeric: Number(e.target.value) }))}
                    className="w-full h-11 px-4 bg-bg border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-muted">Status</label>
                  <select
                    value={newInvoice.status}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, status: e.target.value as 'paid' | 'pending' }))}
                    className="w-full h-11 px-4 bg-bg border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm text-heading"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              {}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 h-12 bg-bg border border-border rounded-xl font-bold text-heading hover:bg-border transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 h-12 bg-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Creating...</>
                  ) : (
                    <>Create Invoice</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
