import React from 'react';
import { cn } from '../../lib/utils';

export const GlassCard = ({ children, className, hover = true, ...props }) => {
  return (
    <div
      className={cn(
        'relative rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-glass-md overflow-hidden',
        hover && 'transition-all duration-300 hover:bg-white/[0.07] hover:border-indigo-500/40 hover:shadow-glass-lg hover:-translate-y-1',
        className
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {children}
    </div>
  );
};

export const GlassCardHeader = ({ children, className, ...props }) => {
  return (
    <div className={cn('p-5 sm:p-6 border-b border-white/[0.07]', className)} {...props}>
      {children}
    </div>
  );
};

export const GlassCardTitle = ({ children, className, ...props }) => {
  return (
    <h3 className={cn('text-lg font-semibold text-white tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
};

export const GlassCardDescription = ({ children, className, ...props }) => {
  return (
    <p className={cn('text-xs sm:text-sm text-slate-400 mt-1', className)} {...props}>
      {children}
    </p>
  );
};

export const GlassCardContent = ({ children, className, ...props }) => {
  return (
    <div className={cn('p-5 sm:p-6', className)} {...props}>
      {children}
    </div>
  );
};

export const GlassCardFooter = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'px-5 py-4 sm:px-6 bg-black/20 border-t border-white/[0.07] flex items-center justify-between',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
