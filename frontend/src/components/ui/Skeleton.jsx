import React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-slate-800/60',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:animate-[shimmer_2s_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-slate-700/30 before:to-transparent',
        className
      )}
      {...props}
    />
  );
};

export default Skeleton;
