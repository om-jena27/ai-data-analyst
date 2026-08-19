'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 rounded-full bg-slate-800/50 animate-pulse border border-white/10" />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle Theme"
      className={`relative inline-flex items-center justify-center p-2.5 rounded-xl text-sm font-medium transition-all duration-300 backdrop-blur-md border ${
        isDark
          ? 'bg-slate-900/60 border-slate-700/60 text-cyan-400 hover:border-cyan-500/50 hover:shadow-glow-cyan'
          : 'bg-white/70 border-slate-200 text-amber-600 hover:border-amber-400 hover:shadow-md'
      }`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 transition-transform duration-300 hover:rotate-45 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-300 hover:-rotate-12 text-slate-800" />
      )}
      <span className="sr-only">Toggle Theme</span>
    </button>
  );
};
