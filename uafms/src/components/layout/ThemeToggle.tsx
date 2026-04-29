'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="w-9 h-9 flex items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors opacity-50 cursor-not-allowed">
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative w-9 h-9 flex items-center justify-center rounded-full border border-border bg-surface hover:bg-bg transition-colors overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary/50"
      aria-label="Toggle Dark Mode"
    >
      <span className="sr-only">Toggle theme</span>
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'dark' ? 0 : 1,
          opacity: theme === 'dark' ? 0 : 1,
          rotate: theme === 'dark' ? -90 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center text-muted group-hover:text-primary"
      >
        <SunIcon className="w-5 h-5" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'dark' ? 1 : 0,
          opacity: theme === 'dark' ? 1 : 0,
          rotate: theme === 'dark' ? 0 : 90,
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center text-muted group-hover:text-primary"
      >
        <MoonIcon className="w-5 h-5" />
      </motion.div>
    </button>
  );
}
