import React from 'react';
import { cn } from '../../lib/utils';

export const GlassInput = React.forwardRef(
  ({ className, error, label, helperText, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-medium text-slate-300 tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={type}
            ref={ref}
            className={cn(
              'w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-500',
              'bg-[#080B14]/70 backdrop-blur-md border border-white/10 shadow-inner',
              'transition-all duration-200 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 focus:bg-[#0B1020]/90',
              error && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
        {helperText && !error && <p className="text-[11px] text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
export default GlassInput;
