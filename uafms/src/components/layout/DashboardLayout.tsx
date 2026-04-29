'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  FolderIcon, 
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  UsersIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  BanknotesIcon,
  IdentificationIcon,
  PresentationChartLineIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon as SearchIcon,
  HeartIcon,
  QuestionMarkCircleIcon,
  CommandLineIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from './NotificationBell';
import { ThemeToggle } from './ThemeToggle';

const studentNav = [
  { 
    category: 'MAIN',
    items: [
      { name: 'Dashboard', href: '/student', icon: HomeIcon },
      { name: 'Applications', href: '/student/apply', icon: DocumentTextIcon },
      { name: 'AI Document Vault', href: '/student/vault', icon: FolderIcon },
    ]
  },
  {
    category: 'DISCOVERY',
    items: [
      { name: 'Course Search', href: '/student/search', icon: MagnifyingGlassIcon },
      { name: 'Scholarships', href: '/student/scholarships', icon: AcademicCapIcon },
      { name: 'Saved Programs', href: '/student/saved', icon: HeartIcon },
    ]
  },
  {
    category: 'TRACKER',
    items: [
      { name: 'Finance Planner', href: '/student/finance', icon: BanknotesIcon },
      { name: 'Interviews', href: '/student/interviews', icon: CalendarDaysIcon },
    ]
  },
];

const adminNav = [
  {
    category: 'ADMIN',
    items: [
      { name: 'Control Tower', href: '/admin', icon: HomeIcon },
      { name: 'Insights', href: '/admin/analytics', icon: PresentationChartLineIcon },
      { name: 'Counselling', href: '/admin/meetings', icon: CalendarDaysIcon },
      { name: 'Student List', href: '/admin/students', icon: UsersIcon },
      { name: 'Counsellors', href: '/admin/counsellors', icon: IdentificationIcon },
      { name: 'Partner Directory', href: '/admin/partners/list', icon: AcademicCapIcon },
      { name: 'Partner Replies', href: '/admin/partners', icon: ChatBubbleLeftRightIcon },
      { name: 'Student Prefs', href: '/admin/preferences', icon: BriefcaseIcon },
      { name: 'Escalations', href: '/admin/escalations', icon: DocumentTextIcon },
      { name: 'Finance', href: '/admin/finance', icon: BanknotesIcon },
      { name: 'Uni Management', href: '/admin/universities', icon: AcademicCapIcon },
      { name: 'Invite Codes', href: '/admin/invites', icon: ShieldCheckIcon },
      { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
    ]
  }
];

const partnerNav = [
  {
    category: 'PARTNER',
    items: [
      { name: 'University Portal', href: '/university', icon: HomeIcon },
      { name: 'Applicants', href: '/university/applicants', icon: UsersIcon },
      { name: 'Events', href: '/university/events', icon: CalendarDaysIcon },
      { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
    ]
  }
];

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const navCategories = user?.role === 'admin' ? adminNav : 
                    user?.role === 'university_partner' ? partnerNav : 
                    studentNav;

  return (
    <div className="flex bg-surface w-64 flex-col h-full border-r border-border transition-colors duration-300">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border">
        <div className="flex items-center gap-3 group px-1">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-primary to-primary-dark rounded-lg blur opacity-10 group-hover:opacity-30 transition duration-500"></div>
            <img 
              src="/logo.jpeg" 
              alt="MEC Logo" 
              className="relative w-9 h-9 rounded-lg object-contain bg-white p-1 border border-border transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/10" 
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-heading">MEC UAFMS</span>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
        <nav className="flex-1 space-y-8">
          {navCategories.map((group) => (
            <div key={group.category} className="space-y-2">
              <h3 className="px-3 text-[10px] font-black text-muted uppercase tracking-[2px]">
                {group.category}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                        isActive 
                        ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(255,107,0,0.2)]' 
                        : 'text-body hover:text-heading hover:bg-bg'
                      }`}
                    >
                      <item.icon className={`mr-3 h-5 w-5 transition-colors ${
                        isActive ? 'text-primary' : 'text-muted group-hover:text-primary'
                      }`} aria-hidden="true" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        
        
        
        {}
        <div className="mt-8 px-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 relative overflow-hidden group cursor-pointer">
            <div className="relative z-10">
              <p className="text-[12px] font-bold text-heading mb-1">Need help?</p>
              <p className="text-[10px] text-muted mb-3">Chat with our AI guide or a real counsellor.</p>
              <div className="flex items-center text-[11px] font-bold text-primary group-hover:gap-2 transition-all">
                Contact Support <CommandLineIcon className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
            <QuestionMarkCircleIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-primary/5 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center px-3 py-3 rounded-2xl bg-bg border border-border hover:bg-surface transition-colors cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mr-3 text-primary text-xs font-bold border border-primary/20 group-hover:scale-105 transition-transform">
              {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || ''}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-heading font-bold text-sm truncate">{user?.firstName} {user?.lastName}</span>
              <span className="text-muted text-[10px] font-black uppercase tracking-wider">
                {user?.role?.replace('_', ' ') || 'Guest'}
              </span>
            </div>
            <Cog6ToothIcon className="w-4 h-4 text-muted group-hover:text-body" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const { logout } = useAuth();

  return (
    <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-surface border-b border-border shadow-sm">
      <div className="flex flex-1 items-center justify-between px-6">
        <div className="flex flex-1 items-center">
          <form className="flex w-full md:ml-0" action="#" method="GET">
            <label htmlFor="search-field" className="sr-only">Search</label>
            <div className="relative w-full text-muted max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="h-4 w-4" aria-hidden="true" />
              </div>
              <input
                id="search-field"
                className="block h-9 w-full rounded-md border border-border bg-bg py-2 pl-10 pr-3 text-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm transition-all"
                placeholder="Search resources, universities, statuses..."
                type="search"
                name="search"
              />
            </div>
          </form>
        </div>
        <div className="ml-4 flex items-center md:ml-6 gap-4">
          <ThemeToggle />
          <NotificationBell />

          <button 
            onClick={logout}
            className="text-sm font-medium text-danger hover:underline focus:outline-none"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
