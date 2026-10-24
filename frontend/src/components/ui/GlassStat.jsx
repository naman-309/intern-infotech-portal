import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';
import { GlassCard3D } from './GlassCard3D';

export const GlassStat = ({
  icon: Icon,
  value,
  label,
  sublabel,
  trend,
  color = 'indigo', // 'indigo' | 'cyan' | 'emerald' | 'amber' | 'rose'
  className,
  ...props
}) => {
  const colorStyles = {
    indigo: {
      iconBg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      valueColor: 'text-white',
      glow: 'rgba(99, 102, 241, 0.2)',
    },
    cyan: {
      iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      valueColor: 'text-cyan-300',
      glow: 'rgba(6, 182, 212, 0.2)',
    },
    emerald: {
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      valueColor: 'text-emerald-300',
      glow: 'rgba(16, 185, 129, 0.2)',
    },
    amber: {
      iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      valueColor: 'text-amber-300',
      glow: 'rgba(245, 158, 11, 0.2)',
    },
    rose: {
      iconBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      valueColor: 'text-rose-300',
      glow: 'rgba(244, 63, 94, 0.2)',
    },
  };

  const style = colorStyles[color] || colorStyles.indigo;
  const prefersReducedMotion = useReducedMotion();

  return (
    <GlassCard3D intensity={10} depth={20} className={cn('p-5 sm:p-6', className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 font-mono">
            {label}
          </p>
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn('text-2xl sm:text-3xl font-extrabold font-mono tracking-tight', style.valueColor)}
          >
            {value}
          </motion.div>
        </div>

        {Icon && (
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner shrink-0',
              style.iconBg
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(sublabel || trend) && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
          <span>{sublabel}</span>
          {trend && <span className="font-mono text-emerald-400 font-semibold">{trend}</span>}
        </div>
      )}
    </GlassCard3D>
  );
};

export default GlassStat;
