import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

export const Tilt3D = ({
  children,
  className,
  intensity = 15,
  perspective = 1200,
  scale = 1.02,
  ...props
}) => {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-intensity, intensity]);

  const handlePointerMove = (e) => {
    if (prefersReducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={prefersReducedMotion ? undefined : handlePointerMove}
      onPointerLeave={prefersReducedMotion ? undefined : handlePointerLeave}
      style={{
        transformStyle: prefersReducedMotion ? undefined : 'preserve-3d',
        transformPerspective: prefersReducedMotion ? undefined : perspective,
        rotateX: prefersReducedMotion ? 0 : rotateX,
        rotateY: prefersReducedMotion ? 0 : rotateY,
      }}
      whileHover={prefersReducedMotion ? undefined : { scale }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(prefersReducedMotion ? undefined : 'will-change-transform', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Tilt3D;
