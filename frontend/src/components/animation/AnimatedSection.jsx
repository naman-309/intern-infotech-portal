import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

export const AnimatedSection = ({
  children,
  className,
  id,
  delay = 0,
  once = true,
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <section id={id} className={className} {...props}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn('relative', className)}
      {...props}
    >
      {children}
    </motion.section>
  );
};

export default AnimatedSection;
