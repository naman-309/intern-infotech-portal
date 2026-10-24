import React from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

export const ParallaxLayer = ({
  children,
  className,
  speed = 0.2, // Factor of scroll speed
  offset = 40,
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, offset * speed]);

  if (prefersReducedMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div style={{ y }} className={cn('will-change-transform', className)} {...props}>
      {children}
    </motion.div>
  );
};

export default ParallaxLayer;
