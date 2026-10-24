import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';
import {
  Cpu,
  Database,
  Server,
  Cloud,
  Terminal,
  Zap,
  Activity,
  Shield,
  Layers,
  GitBranch,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const HolographicCore = ({ className }) => {
  const containerRef = useRef(null);
  const [activeNode, setActiveNode] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  // All hooks called unconditionally at top level
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 22, stiffness: 100, mass: 0.7 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [18, -18]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-22, 22]);

  const handlePointerMove = (e) => {
    if (prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const nodes = [
    {
      id: 0,
      title: 'React 18 + Vite',
      desc: 'Reactive UI Architecture',
      icon: Terminal,
      color: 'from-cyan-500 to-blue-500',
      glowColor: 'rgba(34,211,238,0.4)',
      pos: { top: '6%', left: '2%' },
      depth: 55,
    },
    {
      id: 1,
      title: 'Node Microservices',
      desc: 'Event-driven Clusters',
      icon: Cpu,
      color: 'from-emerald-500 to-teal-500',
      glowColor: 'rgba(52,211,153,0.4)',
      pos: { top: '6%', right: '2%' },
      depth: 65,
    },
    {
      id: 2,
      title: 'PostgreSQL 16',
      desc: 'Prisma ORM + ACID',
      icon: Database,
      color: 'from-indigo-500 to-violet-500',
      glowColor: 'rgba(99,102,241,0.4)',
      pos: { bottom: '22%', left: '0%' },
      depth: 50,
    },
    {
      id: 3,
      title: 'Redis + BullMQ',
      desc: 'Sub-ms Cache & Queues',
      icon: Zap,
      color: 'from-rose-500 to-amber-500',
      glowColor: 'rgba(251,191,36,0.4)',
      pos: { bottom: '22%', right: '0%' },
      depth: 70,
    },
    {
      id: 4,
      title: 'Docker + Nginx',
      desc: 'Container Orchestration',
      icon: Cloud,
      color: 'from-sky-500 to-indigo-500',
      glowColor: 'rgba(56,189,248,0.4)',
      pos: { bottom: '2%', left: '28%' },
      depth: 45,
    },
  ];

  // Data stream labels for cinematic telemetry effect
  const streamItems = [
    'BATCH_SYNC', 'AUTH_TOKEN', 'EXAM_RESULT', 'FEE_CALC',
    'REDIS_HIT', 'QUEUE_JOB', 'DB_QUERY', 'API_RESP',
  ];

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        'relative w-full h-[420px] sm:h-[500px] lg:h-[560px] flex items-center justify-center select-none overflow-hidden',
        className
      )}
      style={{ perspective: 1600 }}
    >
      {/* Deep background glow layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(99,102,241,0.12) 0%, rgba(34,211,238,0.05) 50%, transparent 100%)',
        }}
      />

      {/* Outer circuit grid */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, #000 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, #000 40%, transparent 80%)',
        }}
      />

      <motion.div
        style={{
          transformStyle: 'preserve-3d',
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
        }}
        className="relative w-full max-w-[500px] h-[420px] flex items-center justify-center"
      >
        {/* Deep ambient glow — behind everything */}
        <div
          className="absolute w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, rgba(34,211,238,0.08) 50%, transparent 75%)',
            filter: 'blur(60px)',
            transform: 'translateZ(-80px)',
          }}
        />

        {/* Outer Telemetry Ring 1 — slow clockwise */}
        <motion.div
          animate={prefersReducedMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '340px',
            height: '340px',
            border: '1px dashed rgba(99,102,241,0.25)',
            transform: 'translateZ(-50px)',
          }}
        >
          {/* Ring dot accents */}
          {[0, 90, 180, 270].map((deg) => (
            <div
              key={deg}
              className="absolute w-1.5 h-1.5 rounded-full bg-indigo-400/60"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${deg}deg) translateX(169px) translateY(-50%)`,
              }}
            />
          ))}
        </motion.div>

        {/* Outer Telemetry Ring 2 — faster counter-clockwise */}
        <motion.div
          animate={prefersReducedMotion ? undefined : { rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '240px',
            height: '240px',
            border: '1px solid rgba(34,211,238,0.18)',
            transform: 'translateZ(-25px)',
          }}
        >
          {[0, 120, 240].map((deg) => (
            <div
              key={deg}
              className="absolute w-2 h-0.5 rounded-full bg-cyan-400/50"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${deg}deg) translateX(119px) translateY(-50%)`,
              }}
            />
          ))}
        </motion.div>

        {/* Inner Ring — static glow ring */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '160px',
            height: '160px',
            border: '1px solid rgba(167,139,250,0.2)',
            transform: 'translateZ(-10px)',
            boxShadow: '0 0 40px -10px rgba(99,102,241,0.3)',
          }}
        />

        {/* ─── CENTRAL SERVER CORE ─── */}
        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [-8, 8, -8] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-20 flex flex-col items-center justify-center"
          style={{ transform: 'translateZ(40px)' }}
        >
          {/* Core outer glow ring */}
          <motion.div
            animate={prefersReducedMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-44 h-44 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />

          {/* Core card */}
          <div
            className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-3xl flex flex-col items-center justify-center p-4"
            style={{
              background: 'linear-gradient(145deg, rgba(11,16,32,0.95) 0%, rgba(8,11,20,0.98) 100%)',
              border: '1px solid rgba(99,102,241,0.45)',
              boxShadow: '0 0 40px -10px rgba(99,102,241,0.5), 0 20px 60px -15px rgba(0,0,0,0.7), inset 0 1px 0 0 rgba(255,255,255,0.14)',
            }}
          >
            {/* Inner specular highlight */}
            <div
              className="absolute inset-x-0 top-0 h-px rounded-t-3xl pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%)',
              }}
            />

            {/* Server icon with pulse */}
            <div
              className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(34,211,238,0.12) 100%)',
                border: '1px solid rgba(99,102,241,0.4)',
              }}
            >
              <motion.div
                animate={prefersReducedMotion ? undefined : { scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Server className="w-8 h-8 text-indigo-300" />
              </motion.div>

              {/* Corner accent dots */}
              <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-cyan-400/80" />
              <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-indigo-400/80" />
            </div>

            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-indigo-300 font-bold">
              SYS-CORE v2.6
            </span>

            <div className="flex items-center gap-1.5 mt-1.5">
              <motion.span
                animate={prefersReducedMotion ? undefined : { scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"
              />
              <span className="text-[8px] font-mono text-emerald-400 font-semibold tracking-widest">
                ONLINE
              </span>
            </div>
          </div>
        </motion.div>

        {/* ─── ORBITING TECH NODES ─── */}
        {nodes.map((node) => {
          const Icon = node.icon;
          const isActive = activeNode === node.id;

          return (
            <motion.div
              key={node.id}
              onClick={() => setActiveNode(node.id)}
              whileHover={{ scale: 1.1, zIndex: 40 }}
              whileTap={{ scale: 0.94 }}
              className="absolute z-30 cursor-pointer"
              style={{
                ...node.pos,
                transform: `translateZ(${node.depth}px)`,
              }}
            >
              <div
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-300"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(11,16,32,0.95) 0%, rgba(8,11,20,0.98) 100%)'
                    : 'linear-gradient(135deg, rgba(7,9,18,0.88) 0%, rgba(5,7,13,0.92) 100%)',
                  border: isActive
                    ? `1px solid ${node.glowColor}`
                    : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: isActive
                    ? `0 0 20px -5px ${node.glowColor}, 0 8px 24px -8px rgba(0,0,0,0.5)`
                    : '0 4px 12px -4px rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg bg-gradient-to-tr flex items-center justify-center text-white shadow-md shrink-0',
                    node.color
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-white whitespace-nowrap leading-tight">
                    {node.title}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-mono whitespace-nowrap mt-0.5">
                    {node.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* ─── Data Stream Telemetry (bottom) ─── */}
        <div
          className="absolute -bottom-6 z-30 flex items-center gap-2 px-4 py-1.5 rounded-full"
          style={{
            transform: 'translateZ(30px)',
            background: 'linear-gradient(135deg, rgba(5,7,13,0.92) 0%, rgba(7,9,18,0.96) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px -4px rgba(0,0,0,0.5)',
          }}
        >
          <Activity className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap">
            OFFLINE LAB CLUSTER:
          </span>
          <motion.span
            animate={prefersReducedMotion ? undefined : { opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[9px] text-emerald-400 font-mono font-bold whitespace-nowrap"
          >
            100% IN-PERSON
          </motion.span>
          <div className="w-px h-3 bg-white/10" />
          <motion.span
            animate={prefersReducedMotion ? undefined : { opacity: [1, 0, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="text-[8px] font-mono text-indigo-400"
          >
            {streamItems[Math.floor(Date.now() / 1000) % streamItems.length]}
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
};

export const Interactive3DTechCore = HolographicCore;
export default HolographicCore;
