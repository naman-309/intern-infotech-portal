import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

export const AnimatedBackground = ({ className, showGrid = true, intensity = 'normal' }) => {
  const prefersReducedMotion = useReducedMotion();
  const isSubtle = intensity === 'subtle';

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none select-none -z-10', className)}>
      {/* Animated dot grid — subtle spatial depth */}
      {showGrid && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(rgba(99,102,241,0.18) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse 90% 70% at 50% 0%, #000 50%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 0%, #000 50%, transparent 100%)',
            opacity: 0.35,
          }}
        />
      )}

      {/* Scan line — holographic effect */}
      {!prefersReducedMotion && !isSubtle && (
        <motion.div
          animate={{ y: ['-5%', '105%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none"
          style={{ top: 0 }}
        />
      )}

      {/* Primary ambient beam — top center */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: '900px',
          height: '420px',
          background: 'radial-gradient(ellipse at top, rgba(99,102,241,0.32) 0%, rgba(34,211,238,0.12) 45%, transparent 72%)',
          filter: 'blur(80px)',
          opacity: isSubtle ? 0.4 : 0.7,
        }}
      />

      {/* Orb 1 — Indigo/Violet — upper left drift */}
      <motion.div
        animate={prefersReducedMotion ? undefined : {
          x: [0, 40, -30, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.15, 0.92, 1],
        }}
        transition={{ duration: 28, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        className="absolute -top-32 left-1/4 rounded-full pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          filter: 'blur(100px)',
          opacity: isSubtle ? 0.5 : 1,
        }}
      />

      {/* Orb 2 — Cyan/Sky — right side drift */}
      <motion.div
        animate={prefersReducedMotion ? undefined : {
          x: [0, -50, 40, 0],
          y: [0, 40, -40, 0],
          scale: [0.9, 1.12, 1, 0.9],
        }}
        transition={{ duration: 32, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/3 -right-32 rounded-full pointer-events-none"
        style={{
          width: '560px',
          height: '560px',
          background: 'radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 70%)',
          filter: 'blur(120px)',
          opacity: isSubtle ? 0.5 : 1,
        }}
      />

      {/* Orb 3 — Violet/Magenta — bottom left */}
      <motion.div
        animate={prefersReducedMotion ? undefined : {
          x: [0, 35, -25, 0],
          y: [0, -30, 25, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 4 }}
        className="absolute -bottom-40 left-1/3 rounded-full pointer-events-none"
        style={{
          width: '640px',
          height: '520px',
          background: 'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)',
          filter: 'blur(140px)',
          opacity: isSubtle ? 0.5 : 1,
        }}
      />

      {/* Orb 4 — Deep blue subtle — center depth */}
      <motion.div
        animate={prefersReducedMotion ? undefined : {
          scale: [1, 1.1, 0.95, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 18, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 1 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: '800px',
          height: '600px',
          background: 'radial-gradient(ellipse, rgba(56,189,248,0.06) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />
    </div>
  );
};

export default AnimatedBackground;


