import React from 'react';
import { cn } from '../../lib/utils';

export const GlassBadge = ({
  children,
  className,
  variant = 'default', // 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'cyan'
  dot = false,
  ...props
}) => {
  const variants = {
    default: 'bg-white/[0.06] text-slate-300 border-white/15',
    primary: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 shadow-sm shadow-indigo-500/10',
    success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-sm shadow-emerald-500/10',
    warning: 'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-sm shadow-amber-500/10',
    danger: 'bg-rose-500/10 text-rose-300 border-rose-500/30 shadow-sm shadow-rose-500/10',
    cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-sm shadow-cyan-500/10',
  };

  const dotColors = {
    default: 'bg-slate-400',
    primary: 'bg-indigo-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    cyan: 'bg-cyan-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border backdrop-blur-sm',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full animate-pulse', dotColors[variant] || dotColors.default)}
        />
      )}
      {children}
    </span>
  );
};

export default GlassBadge;
