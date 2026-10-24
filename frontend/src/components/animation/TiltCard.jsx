import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

/**
 * TiltCard creates a 3D interactive card with perspective tilt,
 * cursor-following specular glow, and hover lift physics.
 */
export const TiltCard = ({
  children,
  className,
  intensity = 15,
  glow = true,
  depth = 20,
  onClick,
  ...props
}) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Mouse coordinate values (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for rotation
  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Transform coordinates to 3D rotation angles
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-intensity, intensity]);

  // Specular glow position in percentages
  const glowX = useTransform(smoothMouseX, [-0.5, 0.5], ['0%', '100%']);
  const glowY = useTransform(smoothMouseY, [-0.5, 0.5], ['0%', '100%']);

  const glowBackground = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(circle 280px at ${x} ${y}, rgba(99, 102, 241, 0.18), transparent 70%)`
  );

  const handlePointerMove = (e) => {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (width === 0 || height === 0) return;

    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handlePointerEnter = () => {
    if (!prefersReducedMotion) setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onClick={onClick}
      onPointerMove={prefersReducedMotion ? undefined : handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={{
        transformStyle: prefersReducedMotion ? undefined : 'preserve-3d',
        transformPerspective: prefersReducedMotion ? undefined : 1200,
        rotateX: prefersReducedMotion ? 0 : rotateX,
        rotateY: prefersReducedMotion ? 0 : rotateY,
      }}
      whileHover={prefersReducedMotion ? undefined : { y: -6, scale: 1.015 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 transition-colors duration-300 hover:border-indigo-500/40 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer overflow-hidden',
        className
      )}
      {...props}
    >
      {/* Dynamic Specular Glow overlay */}
      {glow && !prefersReducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            background: glowBackground,
            opacity: isHovered ? 1 : 0,
          }}
        />
      )}

      {/* Content wrapper with simulated 3D depth */}
      <div
        className="relative z-20 h-full w-full"
        style={{
          transform: isHovered && !prefersReducedMotion ? `translateZ(${depth}px)` : 'translateZ(0px)',
          transition: 'transform 0.25s ease-out',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};

export default TiltCard;
