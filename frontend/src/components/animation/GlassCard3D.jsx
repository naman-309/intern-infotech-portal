import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

export const GlassCard3D = ({
  children,
  className,
  hoverLift = true,
  glowColor = 'rgba(99, 102, 241, 0.15)',
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();

  const hoverAnimation = !prefersReducedMotion && hoverLift
    ? {
        y: -4,
        scale: 1.01,
        transition: { duration: 0.25, ease: 'easeOut' },
      }
    : undefined;

  return (
    <motion.div
      whileHover={hoverAnimation}
      whileTap={!prefersReducedMotion && hoverLift ? { scale: 0.99 } : undefined}
      className={cn(
        'relative rounded-2xl bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-950/80',
        'backdrop-blur-xl border border-slate-800/80 shadow-xl shadow-slate-950/50',
        'hover:border-indigo-500/30 transition-colors duration-300 overflow-hidden',
        className
      )}
      {...props}
    >
      {/* Top subtle highlight border for 3D bevel look */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-600/40 to-transparent" />

      {/* Ambient subtle glow inside */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-30 transition-opacity group-hover:opacity-60"
        style={{ backgroundColor: glowColor }}
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default GlassCard3D;
