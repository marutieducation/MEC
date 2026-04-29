'use client';

import React, { useState } from 'react';
import { EnvelopeIcon, LockClosedIcon, UserIcon, ArrowRightIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminRegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('MEC-ADMIN-2024');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        role: 'admin',
        adminCode
      });

      login(response, response.token);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex relative items-center justify-center min-h-screen font-sans bg-bg w-full">
      <div className="flex w-full h-screen bg-bg flex-col lg:flex-row">
        {}
        <div className="hidden lg:flex w-full lg:w-[55%] bg-[#0F172A] text-white flex-col relative justify-center items-start px-12 lg:px-24 py-16 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-20 -mr-24 -mt-24 transform rotate-45 pointer-events-none skew-x-12"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary opacity-10 rounded-full blur-3xl pointer-events-none -mb-32 -ml-32"></div>

          <div className="z-10 mb-4">
            <Link href="/" className="text-[28px] font-bold tracking-tight mb-2 text-surface">MEC <span className="text-primary">CORE</span></Link>
          </div>

          <div className="z-10 mb-8 max-w-lg">
            <h1 className="text-h1 text-white mb-6">Internal Infrastructure Control</h1>
            <p className="text-body text-gray-400">
              Authorized personnel only. Use this portal to create a new administrative identity for global system management, analytics auditing, and partner orchestration.
            </p>
          </div>

          <div className="z-10 flex flex-col gap-4 mt-8 opacity-75">
            <div className="flex items-center text-sm font-medium"><ShieldCheckIcon className="w-5 h-5 text-primary mr-3" /> System Level Permissions</div>
            <div className="flex items-center text-sm font-medium"><ShieldCheckIcon className="w-5 h-5 text-primary mr-3" /> Real-time Global Monitoring</div>
            <div className="flex items-center text-sm font-medium"><ShieldCheckIcon className="w-5 h-5 text-primary mr-3" /> Multi-tenant Management</div>
          </div>
        </div>

        {}
        <div className="w-full lg:w-[45%] bg-surface flex flex-col justify-center items-center px-8 sm:px-16 py-12 relative overflow-y-auto min-h-screen lg:min-h-0">
          <div className="w-full max-w-[400px]">
            <div className="flex lg:hidden mb-8 items-center gap-3">
               <Link href="/" className="w-10 h-10 bg-[#0F172A] rounded flex items-center justify-center text-primary font-bold text-xl">M</Link>
               <h2 className="text-[20px] font-bold tracking-tight text-[#0F172A]">MEC CORE</h2>
            </div>

            <h2 className="text-h2 text-heading mb-2">Admin Registration</h2>
            <p className="text-body text-muted mb-8">Establish your MEC administrative credentials.</p>

            <form onSubmit={handleRegister} className="flex flex-col gap-5 w-full">
              {error && (
                <div className="p-3 bg-danger/10 text-danger rounded-lg text-sm font-medium border border-danger/20">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-h4">First Name</label>
                  <div className="relative">
                    <UserIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      placeholder="Admin"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full h-11 pl-10 pr-4 bg-bg border border-border rounded-lg text-[14px] text-heading placeholder:text-muted focus:outline-none focus:border-primary transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-h4">Last Name</label>
                  <div className="relative">
                    <UserIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      placeholder="Access"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full h-11 pl-10 pr-4 bg-bg border border-border rounded-lg text-[14px] text-heading placeholder:text-muted focus:outline-none focus:border-primary transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-h4">Identity Email</label>
                <div className="relative">
                  <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="email"
                    placeholder="admin@mec.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-11 pl-10 pr-4 bg-bg border border-border rounded-lg text-[14px] text-heading placeholder:text-muted focus:outline-none focus:border-primary transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-h4">Infrastructure Passphrase</label>
                <div className="relative">
                  <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-11 pl-10 pr-4 bg-bg border border-border rounded-lg text-[14px] text-heading placeholder:text-muted focus:outline-none focus:border-primary transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-h4">Verification Code (Required for Admins)</label>
                <div className="relative">
                  <ShieldCheckIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder="MEC-ADMIN-2024"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    required
                    className="w-full h-11 pl-10 pr-4 bg-bg border border-border rounded-lg text-[14px] text-heading placeholder:text-muted focus:outline-none focus:border-primary transition-all shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-4 bg-[#0F172A] hover:bg-black text-white rounded-lg font-bold text-[14px] uppercase tracking-widest flex justify-center items-center gap-3 transition-all shadow-lg active:scale-95 disabled:opacity-70"
              >
                {isLoading ? 'Authorizing...' : 'Create Admin ID'} <ArrowRightIcon className="w-5 h-5" />
              </button>

              <div className="mt-8 text-center text-[13px] font-medium text-muted">
                Already have administrative access? <Link href="/super" className="text-primary font-bold hover:underline pl-1 transition-all">Sign in here</Link>
              </div>
            </form>

            <div className="mt-12 text-center">
              <p className="text-[11px] text-muted leading-tight opacity-60">
                Authorized registration attempts are logged by IP. <br/>
                Unauthorized use is strictly prohibited.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
