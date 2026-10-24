import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export const GlassTooltip = ({ children, text, className, side = 'top' }) => {
  const [open, setOpen] = useState(false);

  const sidePositions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <AnimatePresence>
        {open && text && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 pointer-events-none px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-200',
              'bg-[#080B14]/90 backdrop-blur-md border border-white/15 shadow-glass-md whitespace-nowrap',
              sidePositions[side] || sidePositions.top,
              className
            )}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlassTooltip;
