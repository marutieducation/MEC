'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { EnvelopeIcon, LockClosedIcon, UserIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PartnerRegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PartnerRegisterContent />
    </Suspense>
  );
}

function PartnerRegisterContent() {
  const searchParams = useSearchParams();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();


  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setAdminCode(codeFromUrl);
    }
  }, [searchParams]);

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
        role: 'university_partner',
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
        <div className="hidden lg:flex w-full lg:w-[55%] bg-[#1A1A2E] text-white flex-col relative justify-center items-start px-12 lg:px-24 py-16 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-20 -mr-24 -mt-24 transform rotate-45 pointer-events-none skew-x-12"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary opacity-10 rounded-full blur-3xl pointer-events-none -mb-32 -ml-32"></div>
          <div className="z-10 mb-4">
            <Link href="/" className="text-[28px] font-bold tracking-tight mb-2 text-surface">MEC</Link>
          </div>
          <div className="z-10 mb-8 max-w-lg">
            <h1 className="text-h1 text-white mb-6">University Partner Portal</h1>
            <p className="text-body text-gray-400">
              Join the MEC Global Network to seamlessly review applicants, issue offer letters directly, and manage international enrolments via our control plane.
            </p>
          </div>
        </div>

        {}
        <div className="w-full lg:w-[45%] bg-surface flex flex-col justify-center items-center px-8 sm:px-16 py-12 relative overflow-y-auto min-h-screen lg:min-h-0">
          <div className="w-full max-w-[400px]">
            <div className="flex lg:hidden mb-8 items-center gap-3">
               <div className="w-11 h-11 bg-white rounded-xl shadow-sm border border-border p-1.5 flex items-center justify-center">
                 <img src="/logo.jpeg" alt="MEC Logo" className="max-w-full max-h-full object-contain" />
               </div>
               <h2 className="text-[20px] font-bold tracking-tight text-[#1A1A2E]">MEC UAFMS</h2>
            </div>
            <h2 className="text-h2 text-heading mb-2">Partner Registration</h2>
            <p className="text-body text-muted mb-8">Create your institution representative account.</p>

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
                    <input type="text" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full h-10 pl-10 pr-4 bg-bg border border-border rounded-lg text-[14px] text-heading placeholder:text-muted focus:outline-none focus:border-primary transition-all" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-h4">Last Name</label>
                  <div className="relative">
                    <UserIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full h-10 pl-10 pr-4 bg-bg border border-border rounded-lg text-[14px] text-heading placeholder:text-muted focus:outline-none focus:border-primary transition-all" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-h4">Work Email</label>
                <div className="relative">
                  <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-10 pl-10 pr-4 bg-bg border border-border rounded-lg text-[14px] text-heading placeholder:text-muted focus:outline-none focus:border-primary transition-all" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-h4">Password</label>
                <div className="relative">
                  <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full h-10 pl-10 pr-4 bg-bg border border-border rounded-lg text-[14px] text-heading placeholder:text-muted focus:outline-none focus:border-primary transition-all" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-h4">Partner Invitation Code</label>
                <div className="relative">
                  <ShieldCheckIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder="MEC-PARTNER-XXXX"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    required
                    className="w-full h-10 pl-10 pr-4 bg-bg border border-border rounded-lg text-[14px] text-heading placeholder:text-muted focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full h-10 mt-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-[14px] flex justify-center items-center gap-2 transition-all disabled:opacity-70">
                {isLoading ? 'Registering...' : 'Create Account'} <ArrowRightIcon className="w-4 h-4" />
              </button>

              <div className="mt-5 text-center text-[13px] font-medium text-muted">
                Already have a partner account? <Link href="/partner/login" className="text-primary hover:underline hover:text-primary-dark pl-1">Sign in</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
