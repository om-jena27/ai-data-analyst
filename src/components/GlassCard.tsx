import React from 'react';
import { clsx } from 'clsx';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'purple' | 'emerald' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', glow = 'none', ...props }) => {
  const glowStyles = {
    cyan: 'hover:shadow-glow-cyan hover:border-cyan-500/40',
    purple: 'hover:shadow-glow-purple hover:border-violet-500/40',
    emerald: 'hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.4)] hover:border-emerald-500/40',
    none: '',
  };

  return (
    <div
      className={clsx(
        'backdrop-blur-md transition-all duration-300 rounded-2xl border',
        'bg-white/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-white/10 shadow-glass-sm dark:shadow-glass-lg',
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
