import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

/**
 * MagneticButton creates a subtle physics-based magnetic pull
 * that draws the button toward the cursor on hover.
 */
export const MagneticButton = ({
  children,
  className,
  distance = 0.25,
  springConfig = { damping: 15, stiffness: 150, mass: 0.2 },
  onClick,
  ...props
}) => {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handlePointerMove = (e) => {
    if (prefersReducedMotion || !ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const deltaX = (clientX - centerX) * distance;
    const deltaY = (clientY - centerY) * distance;

    x.set(deltaX);
    y.set(deltaY);
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
      onClick={onClick}
      style={{ x: prefersReducedMotion ? 0 : springX, y: prefersReducedMotion ? 0 : springY }}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
      className={cn('inline-block cursor-pointer select-none', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default MagneticButton;
