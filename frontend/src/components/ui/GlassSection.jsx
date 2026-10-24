import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

export const GlassSection = ({
  children,
  className,
  id,
  delay = 0,
  glow = false,
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <section id={id} className={cn('relative py-16 sm:py-24', className)} {...props}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn('relative py-16 sm:py-24', className)}
      {...props}
    >
      {glow && (
        <div className="pointer-events-none absolute inset-x-0 -top-40 h-80 bg-gradient-to-b from-indigo-500/10 to-transparent blur-3xl" />
      )}
      {children}
    </motion.section>
  );
};

export default GlassSection;
