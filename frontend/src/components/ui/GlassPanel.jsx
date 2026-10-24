import React from 'react';
import { cn } from '../../lib/utils';

/**
 * GlassPanel: High-end frosted glass container with specular top border
 * and soft ambient shadow for structural framing.
 */
export const GlassPanel = ({
  children,
  className,
  variant = 'default', // 'default' | 'deep' | 'subtle'
  glow = false,
  as: Component = 'div',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-glass-md',
    deep: 'bg-[#080B14]/80 backdrop-blur-2xl border border-white/[0.14] shadow-glass-lg',
    subtle: 'bg-white/[0.02] backdrop-blur-md border border-white/[0.06] shadow-glass-sm',
  };

  return (
    <Component
      className={cn(
        'relative rounded-2xl overflow-hidden transition-all',
        variantStyles[variant] || variantStyles.default,
        glow && 'shadow-glow-indigo',
        className
      )}
      {...props}
    >
      {/* Specular Inner Top Highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </Component>
  );
};

export default GlassPanel;
