import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

export const GlassCard3D = ({
  children,
  className,
  intensity = 12,
  depth = 24,
  glow = true,
  onClick,
  ...props
}) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 220, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-intensity, intensity]);

  const glowX = useTransform(smoothX, [-0.5, 0.5], ['10%', '90%']);
  const glowY = useTransform(smoothY, [-0.5, 0.5], ['10%', '90%']);

  const glowBackground = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(circle 260px at ${x} ${y}, rgba(99, 102, 241, 0.2), transparent 70%)`
  );

  const handlePointerMove = (e) => {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
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
      whileHover={prefersReducedMotion ? undefined : { y: -6, scale: 1.012 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative rounded-2xl bg-gradient-to-b from-white/[0.06] via-white/[0.03] to-black/40',
        'backdrop-blur-xl border border-white/10 shadow-glass-md hover:border-indigo-500/40',
        'hover:shadow-glass-lg hover:shadow-indigo-500/10 cursor-pointer overflow-hidden transition-colors duration-300',
        className
      )}
      {...props}
    >
      {/* Specular Edge Highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      {/* Dynamic Pointer-Following Glow */}
      {glow && !prefersReducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            background: glowBackground,
            opacity: isHovered ? 1 : 0,
          }}
        />
      )}

      {/* Content Layer with Z-Depth Separation */}
      <div
        className="relative z-20 h-full w-full"
        style={{
          transform: isHovered && !prefersReducedMotion ? `translateZ(${depth}px)` : 'translateZ(0px)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard3D;
