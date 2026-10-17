import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

    const variants = {
      primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 focus:ring-indigo-500 active:scale-[0.98]',
      secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 focus:ring-slate-500 active:scale-[0.98]',
      outline: 'border border-slate-700 hover:border-slate-600 bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/50 focus:ring-slate-500',
      danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 focus:ring-rose-500 active:scale-[0.98]',
      success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 focus:ring-emerald-500 active:scale-[0.98]',
      ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-100 focus:ring-slate-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
