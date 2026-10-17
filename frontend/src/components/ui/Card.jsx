import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-xl overflow-hidden shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }) => {
  return (
    <div className={cn('p-5 border-b border-slate-800/80', className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3 className={cn('text-lg font-semibold text-slate-100 tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className, ...props }) => {
  return (
    <p className={cn('text-sm text-slate-400 mt-1', className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className, ...props }) => {
  return (
    <div className={cn('p-5 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  );
};
