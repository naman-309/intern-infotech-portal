import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

export const AnimatedBackground = ({ className, showGrid = true }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none select-none -z-10', className)}>
      {/* 1. Subtle Tech Grid Pattern */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #6366f1 1px, transparent 1px),
              linear-gradient(to bottom, #6366f1 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, #000 70%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, #000 70%, transparent 100%)',
          }}
        />
      )}

      {/* 2. Ambient Gradient Orb (Indigo) */}
      <motion.div
        animate={
          prefersReducedMotion
            ? undefined
            : {
                x: [0, 25, -20, 0],
                y: [0, -30, 20, 0],
                scale: [1, 1.12, 0.95, 1],
              }
        }
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
        className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[130px]"
      />

      {/* 3. Ambient Gradient Orb (Sky/Cyan) */}
      <motion.div
        animate={
          prefersReducedMotion
            ? undefined
            : {
                x: [0, -30, 25, 0],
                y: [0, 25, -25, 0],
                scale: [0.95, 1.1, 1, 0.95],
              }
        }
        transition={{
          duration: 22,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute top-1/3 -right-24 w-[450px] h-[450px] rounded-full bg-sky-500/10 blur-[140px]"
      />

      {/* 4. Ambient Gradient Orb (Emerald/Purple Deep Glow) */}
      <motion.div
        animate={
          prefersReducedMotion
            ? undefined
            : {
                x: [0, 20, -15, 0],
                y: [0, -20, 15, 0],
              }
        }
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
          delay: 4,
        }}
        className="absolute -bottom-20 left-1/3 w-[550px] h-[450px] rounded-full bg-purple-600/10 blur-[150px]"
      />
    </div>
  );
};

export default AnimatedBackground;
