import React from 'react';
import { Terminal, Code2, Layers, Database, Cpu, Sparkles, X, User, Heart, Briefcase } from 'lucide-react';

export const DevBadge = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      type="button"
      title="View Project Developers & Attribution"
      className={`group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium transition-all duration-300 border border-sky-500/30 bg-sky-950/40 text-sky-300 hover:bg-sky-900/60 hover:border-sky-400 hover:text-white hover:shadow-lg hover:shadow-sky-500/20 active:scale-95 ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
      </span>
      <span className="text-slate-400 font-normal">Developers:</span>
      <span className="font-semibold text-sky-300 group-hover:text-sky-200">Dev@nkkR</span>
      <Sparkles className="w-3 h-3 text-amber-400 opacity-80 group-hover:opacity-100 group-hover:rotate-12 transition-transform" />
    </button>
  );
};

export const DevCreditsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const focusAreas = [
    'Full-Stack Development',
    'Backend Architecture',
    'Database Design',
    'System Design',
    'Redis Caching',
    'DevOps Learning',
  ];

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
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white tracking-wide font-mono">Project Credits & Team</h3>
              </div>
              <p className="text-xs text-slate-400">Intern Infotech Portal • Assignment Project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Project Attribution Banner */}
          <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/20 text-slate-300 space-y-1">
            <div className="flex items-center gap-2 text-sky-300 font-semibold font-mono text-[11px]">
              <Briefcase className="w-3.5 h-3.5" />
              <span>PROJECT ATTRIBUTION</span>
            </div>
            <p className="text-slate-300 text-xs">
              Project developed as part of an assignment from <strong>Intern Infotech</strong>.
            </p>
          </div>

          {/* Lead Developer Profile: Dev@nkkR */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white font-mono">Dev@nkkR</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/30">
                    Lead Implementation
                  </span>
                </div>
                <p className="text-sky-400 font-medium text-xs mt-0.5">
                  Full-Stack Developer in Learning | Exploring DevOps
                </p>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed italic border-l-2 border-sky-500/50 pl-3">
              "Building practical solutions with a focus on clean architecture, reliable backend systems, database design, and continuous learning."
            </p>

            <div className="pt-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                Focus Areas:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {focusAreas.map((area) => (
                  <span
                    key={area}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-900 border border-slate-800 text-slate-300"
                  >
                    • {area}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed pt-1">
              Led the major implementation, backend microservices architecture, PostgreSQL schema design, Redis caching integration, and end-to-end system flow for the Intern Infotech Portal assignment.
            </p>
          </div>

          {/* Partner Contribution: K. Money */}
          <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-white font-mono">K. Money</h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30">
                Project Contributor
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Contributed to UI design and selected project features.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">
            Assignment: <strong className="text-sky-400">Intern Infotech Portal</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs shadow-md shadow-sky-500/20 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
