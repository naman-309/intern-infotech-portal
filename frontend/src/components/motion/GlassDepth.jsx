import React from 'react';
import { cn } from '../../lib/utils';

/**
 * GlassDepth allows children to reside at different Z-depths (e.g. zIndex/translateZ)
 * creating Apple Vision Pro-style holographic layering.
 */
export const GlassDepth = ({
  children,
  className,
  z = 20, // Z depth in pixels
  style,
  ...props
}) => {
  return (
    <div
      style={{
        transform: `translateZ(${z}px)`,
        transformStyle: 'preserve-3d',
        ...style,
      }}
      className={cn('will-change-transform', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassDepth;
