import React from 'react';
import { cn } from '../../lib/utils';

export const GlassTable = ({ children, className, ...props }) => {
  return (
    <table
      className={cn('w-full text-left text-xs', className)}
      {...props}
    >
      {children}
    </table>
  );
};

export const GlassTableHeader = ({ children, className, ...props }) => {
  return (
    <thead
      className={cn(
        'bg-white/[0.04] border-b border-white/10 text-xs font-mono uppercase tracking-wider text-slate-400',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
};

export const GlassTableBody = ({ children, className, ...props }) => {
  return (
    <tbody className={cn('divide-y divide-white/[0.05] text-sm text-slate-200', className)} {...props}>
      {children}
    </tbody>
  );
};

export const GlassTableRow = ({ children, className, isHeader = false, ...props }) => {
  return (
    <tr
      className={cn(
        'transition-colors duration-150',
        !isHeader && 'hover:bg-white/[0.04]',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
};

export const GlassTableHead = ({ children, className, ...props }) => {
  return (
    <th className={cn('px-4 py-3.5 text-left font-semibold', className)} {...props}>
      {children}
    </th>
  );
};

export const GlassTableCell = ({ children, className, ...props }) => {
  return (
    <td className={cn('px-4 py-3.5 align-middle', className)} {...props}>
      {children}
    </td>
  );
};

/**
 * GlassTableLoading - renders skeleton rows inside a tbody.
 * When used inside a GlassPanel (outside a table), pass standalone={true}.
 * Accepts colSpan or columns (alias).
 */
export const GlassTableLoading = ({ colSpan, columns, rows = 4, standalone = false }) => {
  const cols = colSpan || columns || 5;

  if (standalone) {
    return (
      <div className="space-y-3 p-6">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4">
            {Array.from({ length: Math.min(cols, 5) }).map((_, c) => (
              <div key={c} className="h-4 flex-1 rounded-md bg-white/[0.06] animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3.5 align-middle">
              <div className="h-4 w-full max-w-[120px] rounded-md bg-white/[0.06] animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export const GlassTableEmpty = ({ message = 'No data found.', colSpan = 5 }) => {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-16 text-center text-xs text-slate-500 font-mono">
        {message}
      </td>
    </tr>
  );
};

export default GlassTable;
