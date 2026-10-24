import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

export const ScrollReveal = ({
  children,
  className,
  threshold = 0.2,
  duration = 0.5,
  delay = 0,
  once = true,
  ...props
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
      animate={prefersReducedMotion || isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.98 }}
      transition={{
        duration: prefersReducedMotion ? 0 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(prefersReducedMotion ? undefined : 'will-change-[transform,opacity]', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
