import React, { useState } from 'react';
import { Terminal, Cpu, ShieldCheck, Sparkles, X, ExternalLink, Code2, Layers, Zap } from 'lucide-react';

export const DevBadge = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      type="button"
      title="System Architecture & Engineering Lead: dev@nkkr"
      className={`group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium transition-all duration-300 border border-sky-500/30 bg-sky-950/40 text-sky-300 hover:bg-sky-900/60 hover:border-sky-400 hover:text-white hover:shadow-lg hover:shadow-sky-500/20 active:scale-95 ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
      </span>
      <span className="text-slate-400 font-normal">Lead:</span>
      <span className="font-semibold text-sky-300 group-hover:text-sky-200">dev@nkkr</span>
      <Sparkles className="w-3 h-3 text-amber-400 opacity-80 group-hover:opacity-100 group-hover:rotate-12 transition-transform" />
    </button>
  );
};

export const DevCreditsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-sky-500/30 shadow-2xl shadow-sky-500/10 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-indigo-500"></div>

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-inner">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white tracking-wide font-mono">dev@nkkr</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  SYSTEM ARCHITECT
                </span>
              </div>
              <p className="text-xs text-slate-400">Intern Infotech Portal • Engineering Signature</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Terminal Body */}
        <div className="p-6 space-y-4">
          <div className="rounded-xl bg-slate-950 border border-slate-800/80 p-4 font-mono text-xs text-slate-300 space-y-2">
            <div className="text-slate-500 flex items-center justify-between border-b border-slate-800/60 pb-2 mb-2">
              <span>nkkr-core-v2.6 :: production runtime</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            </div>
            <p className="text-sky-400 font-semibold">&gt; whoami</p>
            <p className="text-slate-300 pl-2">
              Senior Full-Stack & Systems Engineer | Architect behind the Intern Infotech Portal.
            </p>
            <p className="text-sky-400 font-semibold mt-2">&gt; inspect-architecture</p>
            <div className="grid grid-cols-2 gap-2 pl-2 text-[11px] text-slate-400">
              <div>• Gateway: Express API Gateway</div>
              <div>• Cache: Upstash Redis (30m TTL)</div>
              <div>• DB: PostgreSQL + Prisma ORM</div>
              <div>• Auth: Dual JWT + HTTP-Only Cookies</div>
              <div>• UI: Vite + React 18 + Tailwind</div>
              <div>• Monitoring: Sub-15ms cached latency</div>
            </div>
            <p className="text-sky-400 font-semibold mt-2">&gt; message</p>
            <p className="text-slate-300 italic pl-2 border-l-2 border-sky-500/50">
              "Engineered with clean abstractions, zero-bloat state management, and strict microservice boundaries."
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-xs font-semibold text-white font-mono">&lt; 15ms</div>
              <div className="text-[10px] text-slate-400">Redis Cache Hit</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <Layers className="w-4 h-4 text-sky-400 mx-auto mb-1" />
              <div className="text-xs font-semibold text-white font-mono">4 Services</div>
              <div className="text-[10px] text-slate-400">Distributed Arch</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-xs font-semibold text-white font-mono">Zero Leaks</div>
              <div className="text-[10px] text-slate-400">Audit & RBAC</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">Signature: <strong className="text-sky-400">dev@nkkr</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs shadow-md shadow-sky-500/20 transition-all"
          >
            Close Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
