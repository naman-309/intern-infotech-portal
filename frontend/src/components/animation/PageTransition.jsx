import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

export const PageTransition = ({ children, className, ...props }) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className} {...props}>{children}</div>;
  }

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 12,
      filter: 'blur(4px)',
    },
    animate: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.35,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -12,
      filter: 'blur(4px)',
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn('w-full min-h-screen', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
