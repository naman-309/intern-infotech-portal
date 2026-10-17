import React from 'react';
import { cn } from '../../lib/utils';

export const Select = React.forwardRef(({ className, children, error, ...props }, ref) => {
  return (
    <div className="w-full">
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          error && 'border-rose-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
});
Select.displayName = 'Select';
