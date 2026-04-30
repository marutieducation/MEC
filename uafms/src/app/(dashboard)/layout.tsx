import React from 'react';
import { Sidebar, Header } from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/layout/PageTransition';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg/50 relative">
      {/* Decorative global background glowing orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-light/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        <Header />
        <main className="flex-1 overflow-y-auto w-full">
          <div className="h-full p-4 md:p-6">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
