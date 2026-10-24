import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const GlassButton = React.forwardRef(
  function GlassButton(
    {
      className,
      variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
      size = 'md', // 'sm' | 'md' | 'lg'
      isLoading = false,
      children,
      disabled,
      onClick,
      type = 'button',
      ...props
    },
    ref
  ) {
    const prefersReducedMotion = useReducedMotion();

    const baseStyles =
      'relative inline-flex items-center justify-center font-medium rounded-xl select-none overflow-hidden transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

    const variants = {
      primary:
        'bg-indigo-600/80 hover:bg-indigo-500 text-white border border-indigo-400/30 shadow-glass-sm shadow-indigo-600/30 backdrop-blur-md',
      secondary:
        'bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15 shadow-glass-sm backdrop-blur-md',
      outline:
        'bg-transparent hover:bg-white/[0.06] text-slate-200 hover:text-white border border-white/15 backdrop-blur-sm',
      danger:
        'bg-rose-600/80 hover:bg-rose-500 text-white border border-rose-400/30 shadow-glass-sm shadow-rose-600/25 backdrop-blur-md',
      ghost:
        'bg-transparent hover:bg-white/[0.05] text-slate-400 hover:text-white border border-transparent',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-2.5 text-base gap-2.5',
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        onClick={onClick}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.025, y: -1 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.97, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {/* Specular Inner Top Highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';
export default GlassButton;
