import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Terminal, Database, Server, Cpu, Cloud, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassCard3D } from '../ui/GlassCard3D';

export const Architecture3D = ({ className }) => {
  const [selectedLayer, setSelectedLayer] = useState(1);
  const prefersReducedMotion = useReducedMotion();

  const layers = [
    {
      id: 0,
      title: 'Layer 1: Linux Workstation Kernel',
      tag: 'SYSTEMS / POSIX',
      desc: 'Native Ubuntu environment, file descriptors, socket buffers, thread pools.',
      icon: Terminal,
      color: 'from-amber-500 to-rose-500',
    },
    {
      id: 1,
      title: 'Layer 2: Multi-Service Cluster Mesh',
      tag: 'NODE.JS & BULLMQ',
      desc: 'Distributed messaging, idempotency keys, worker queues, circuit breakers.',
      icon: Cpu,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      id: 2,
      title: 'Layer 3: ACID Relational & Cache Tier',
      tag: 'POSTGRES 16 & REDIS 7',
      desc: 'B-Tree indexing, write-ahead logs, atomic transactions, read replicas.',
      icon: Database,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      id: 3,
      title: 'Layer 4: Ingress Proxy & Security Gateway',
      tag: 'NGINX & JWT COOKIES',
      desc: 'Zero-trust reverse proxying, rate limiting, SSL termination, path filters.',
      icon: Server,
      color: 'from-violet-500 to-indigo-500',
    },
  ];

  return (
    <div className={cn('w-full', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Layer Selectors (Left) */}
        <div className="lg:col-span-6 space-y-3">
          {layers.map((layer) => {
            const Icon = layer.icon;
            const isSelected = selectedLayer === layer.id;

            return (
              <motion.div
                key={layer.id}
                onClick={() => setSelectedLayer(layer.id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  'cursor-pointer p-4 rounded-xl border backdrop-blur-md transition-all duration-200',
                  isSelected
                    ? 'bg-white/[0.08] border-indigo-400 shadow-glass-md shadow-indigo-600/10'
                    : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]'
                )}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg bg-gradient-to-tr flex items-center justify-center text-white shrink-0 shadow-md',
                      layer.color
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-indigo-400">
                        {layer.tag}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white mt-0.5">{layer.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{layer.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 3D Stack Visualization (Right) */}
        <div className="lg:col-span-6 flex items-center justify-center">
          <GlassCard3D intensity={15} depth={30} className="w-full max-w-md p-6 bg-[#080B14]/85">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="ml-2 font-mono">architecture-stack-monitor</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">LIVE LAB</span>
            </div>

            <div className="mt-5 space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between">
                <span className="text-slate-400">INGRESS GATEWAY</span>
                <span className="text-emerald-400">PORT 80 (HEALTHY)</span>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between">
                <span className="text-slate-400">AUTH & USER SERVICES</span>
                <span className="text-indigo-400">PORTS 5001–5002</span>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between">
                <span className="text-slate-400">POSTGRES 16 ACID</span>
                <span className="text-cyan-400">PORT 5432 (SYNCED)</span>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between">
                <span className="text-slate-400">REDIS 7 IN-MEMORY</span>
                <span className="text-amber-400">PORT 6379 (READY)</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>SECURITY AUDITING:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                ENABLED
              </span>
            </div>
          </GlassCard3D>
        </div>
      </div>
    </div>
  );
};

export default Architecture3D;
