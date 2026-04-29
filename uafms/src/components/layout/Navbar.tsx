'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bars3Icon, XMarkIcon, 
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-surface shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6B00] to-orange-400 rounded-lg blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
            <img 
              src="/logo.jpeg" 
              alt="MEC Logo" 
              className="relative w-10 h-10 rounded-lg object-contain bg-white p-1 border border-border/50 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md" 
            />
          </div>
          <div className="flex flex-col">
            <div className="font-black text-[16px] text-[#1A1A2E] dark:text-white leading-tight">MEC</div>
            <div className="text-[10px] text-gray-500 leading-tight font-medium">UAFMS</div>
          </div>
        </Link>

        {}
        <div className="hidden lg:flex items-center gap-6 text-[14px] font-medium text-body h-full">
          <div className="relative group h-full flex items-center">
            <Link href="/#colleges" className="hover:text-[#FF6B00] transition-colors py-5">Colleges</Link>
            <div className="absolute top-16 left-0 w-[600px] bg-surface shadow-xl border border-border rounded-xl p-5 hidden group-hover:block transition-all z-50">
              <div className="text-[14px] font-bold text-heading mb-3 pb-2 border-b border-border">Top Partner Colleges</div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-2.5">
                {[
                  'Alliance School of Business', 'Alliance School of Law', 'Alliance College of Engg & Design', 'Alliance School of Liberal Arts',
                  'Alliance School of Sciences', 'Alliance School of Design', 'Alliance School of Economics', 'Alliance Ascent College'
                ].map(college => (
                  <Link key={college} href="/#colleges" className="text-[12px] text-muted hover:text-[#FF6B00] hover:font-semibold transition-all truncate">
                    {college}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link href="/#exams" className="hover:text-[#FF6B00] transition-colors py-5">Exams</Link>
          <Link href="/#courses" className="hover:text-[#FF6B00] transition-colors py-5">Courses</Link>
          <Link href="/#counselling" className="hover:text-[#FF6B00] transition-colors py-5">Counselling</Link>
          <Link href="/#scholarships" className="hover:text-[#FF6B00] transition-colors py-5">Scholarships</Link>
        </div>

        {}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="text-[13px] font-semibold text-body hover:text-primary transition-colors px-3 py-2">
            Sign In
          </Link>
          <Link href="/signup" className="h-9 px-5 bg-[#FF6B00] hover:bg-orange-600 text-white rounded-lg font-semibold text-[13px] flex items-center gap-1.5 transition-colors shadow-sm">
            Get Started <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {}
        <button className="lg:hidden p-2 text-body" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface border-t border-border px-4 py-4 flex flex-col gap-3">
          {['Colleges', 'Exams', 'Courses', 'Counselling', 'Scholarships'].map(item => (
            <Link key={item} href={`/#${item.toLowerCase()}`} className="text-[14px] font-medium text-body py-2">{item}</Link>
          ))}
          <div className="flex gap-2 pt-2">
            <ThemeToggle />
            <Link href="/login" className="flex-1 text-center py-2 border border-border rounded-lg font-semibold text-[13px] text-body">Sign In</Link>
            <Link href="/signup" className="flex-1 text-center py-2 bg-[#FF6B00] text-white rounded-lg font-semibold text-[13px]">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
};
