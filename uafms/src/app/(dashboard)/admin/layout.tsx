'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== 'admin') {
      
      if (user.role === 'university_partner') {
        router.push('/university');
      } else {
        router.push('/student');
      }
    } else if (!isLoading && !user) {
       router.push('/super'); 
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="p-8 max-w-[1600px] mx-auto text-center h-[calc(100vh-64px)] flex flex-col items-center justify-center">
        <div className="bg-danger/10 text-danger p-6 rounded-2xl border border-danger/20 inline-block shadow-xl">
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-xl font-bold mb-2">403 Forbidden</p>
          <p className="opacity-80">You do not have administrative privileges to view this page.</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
