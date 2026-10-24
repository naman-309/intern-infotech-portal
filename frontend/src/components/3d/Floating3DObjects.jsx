import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

export const Floating3DObjects = ({ className }) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden select-none -z-10',
        className
      )}
      style={{ perspective: 1000 }}
    >
      {/* 1. Floating Isometric Tech Octahedron / Cube (Left) */}
      <motion.div
        animate={{
          y: [-15, 15, -15],
          rotateX: [0, 45, 0],
          rotateY: [0, 90, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-24 left-8 sm:left-16 w-16 h-16 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-xs shadow-glow-indigo opacity-60"
        style={{ transformStyle: 'preserve-3d' }}
      />

      {/* 2. Floating Cyan Orbit Ring (Right) */}
      <motion.div
        animate={{
          y: [12, -12, 12],
          rotateZ: [0, 180, 360],
          rotateX: [25, 45, 25],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute top-48 right-12 sm:right-24 w-24 h-24 rounded-full border-2 border-dashed border-cyan-400/20 opacity-50"
        style={{ transformStyle: 'preserve-3d' }}
      />

      {/* 3. Small Floating Tech Node (Bottom-Left) */}
      <motion.div
        animate={{
          y: [-10, 10, -10],
          rotateY: [0, -60, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute bottom-20 left-1/4 w-10 h-10 rounded-xl border border-violet-500/20 bg-violet-500/5 backdrop-blur-xs opacity-50"
      />
    </div>
  );
};

export default Floating3DObjects;
