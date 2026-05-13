'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
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
      { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
    ]
  }
];

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navCategories = (!mounted || !user) ? studentNav : 
                    user.role === 'admin' ? adminNav : 
                    user.role === 'university_partner' ? partnerNav : 
                    studentNav;

  return (
    <motion.div 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col h-full w-64 glass-panel border-r border-border/50 transition-colors duration-300 z-20"
    >
      <div className="flex h-[72px] shrink-0 items-center px-6 border-b border-border/30 bg-bg/20">
        <div className="flex items-center gap-3 group px-1 cursor-pointer">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-br from-primary to-primary-light rounded-xl blur-lg opacity-20 group-hover:opacity-60 transition duration-500 animate-pulse-slow"></div>
            <img 
              src="/logo.jpeg" 
              alt="MEC Logo" 
              className="relative w-10 h-10 rounded-xl object-contain bg-white p-1 border border-white/20 transition-all duration-300 group-hover:scale-105" 
            />
          </div>
          <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-heading to-primary-light">
            MEC UAFMS
          </span>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 scrollbar-hide">
        <nav className="flex-1 space-y-8">
          {navCategories.map((group) => (
            <div key={group.category} className="space-y-3">
              <h3 className="px-3 text-[10px] font-black text-muted uppercase tracking-[0.2em]">
                {group.category}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block relative group"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-nav"
                          className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20 shadow-[inset_0_0_15px_rgba(var(--primary-color),0.1)]"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <div className={`relative flex items-center px-3 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                        isActive 
                        ? 'text-primary' 
                        : 'text-body hover:text-heading hover:bg-surface/50'
                      }`}>
                        <item.icon className={`mr-3 h-5 w-5 transition-transform duration-300 ${
                          isActive ? 'text-primary scale-110' : 'text-muted group-hover:text-primary group-hover:scale-110'
                        }`} aria-hidden="true" />
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        


        {/* User Profile Footer */}
        <div className="mt-8 pt-6 border-t border-border/30">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center px-3 py-3 rounded-2xl bg-surface/40 backdrop-blur-md border border-border/50 hover:bg-surface/80 hover:border-primary/30 transition-all cursor-pointer group shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mr-3 text-white text-sm font-black shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
              {mounted && user ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}` : 'U'}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-heading font-black text-sm truncate">
                {mounted && user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
              </span>
              <span className="text-primary text-[10px] font-black uppercase tracking-wider">
                {mounted && user ? user.role?.replace('_', ' ') : 'Guest'}
              </span>
            </div>
            <Cog6ToothIcon className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export function Header() {
  const { logout } = useAuth();

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      className="sticky top-0 z-10 flex h-[72px] flex-shrink-0 glass-panel border-b border-border/30 shadow-sm"
    >
      <div className="flex flex-1 items-center justify-between px-6">
        <div className="flex flex-1 items-center">
          <form className="flex w-full md:ml-0" action="#" method="GET">
            <label htmlFor="search-field" className="sr-only">Search</label>
            <div className="relative w-full text-muted max-w-lg group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <SearchIcon className="h-5 w-5 text-muted group-focus-within:text-primary transition-colors" aria-hidden="true" />
              </div>
              <input
                id="search-field"
                className="block h-11 w-full rounded-full border border-border/50 bg-surface/50 backdrop-blur-sm py-2 pl-12 pr-4 text-sm font-medium placeholder:text-muted focus:border-primary/50 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                placeholder="Search resources, universities, statuses..."
                type="search"
                name="search"
              />
            </div>
          </form>
        </div>
        <div className="ml-4 flex items-center md:ml-6 gap-5">
          <div className="flex items-center gap-2 bg-surface/50 backdrop-blur-sm p-1.5 rounded-full border border-border/50 shadow-sm">
            <ThemeToggle />
          </div>

          <div className="h-6 w-px bg-border/50 mx-2"></div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="text-sm font-bold text-danger px-4 py-2 rounded-xl hover:bg-danger/10 border border-transparent hover:border-danger/20 transition-all focus:outline-none"
          >
            Sign out
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
