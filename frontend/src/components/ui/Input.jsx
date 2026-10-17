import React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(({ className, type = 'text', error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          error && 'border-rose-500 focus:ring-rose-500/50 focus:border-rose-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
