import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

export const SlideIn = ({
  children,
  className,
  direction = 'left',
  delay = 0,
  distance = 60,
  once = true,
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

  const offsets = {
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
  };

  const offset = offsets[direction] || offsets.left;

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: '-40px' }}
      transition={{
        type: 'spring',
        damping: 24,
        stiffness: 180,
        delay,
      }}
      className={cn('will-change-[transform,opacity]', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default SlideIn;
