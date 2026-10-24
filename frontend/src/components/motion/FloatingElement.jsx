import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

export const FloatingElement = ({
  children,
  className,
  yOffset = 10,
  duration = 4,
  delay = 0,
  rotate = 2,
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      animate={{
        y: [-yOffset, yOffset, -yOffset],
        rotateZ: [-rotate, rotate, -rotate],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
        delay,
      }}
      className={cn('will-change-transform', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default FloatingElement;
