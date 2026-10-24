import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GlassButton } from './GlassButton';

export const GlassSidebar = ({
  isOpen,
  onClose,
  items = [],
  roleBadge,
  user,
  onLogout,
  brand,
  className,
}) => {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const renderNavList = () => (
    <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-1 scrollbar-thin">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path);

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            onClick={() => onClose?.()}
            className={cn(
              'relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all select-none group',
              isActive
                ? 'text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="glass-sidebar-active-pill"
                className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-sky-500/10 border border-indigo-500/30 rounded-xl shadow-glass-sm"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <Icon
              className={cn(
                'relative z-10 w-4 h-4 shrink-0 transition-colors',
                isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
              )}
            />
            <span className="relative z-10 truncate">{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  );

  return (
    <>
      {/* 1. Desktop Glass Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex lg:flex-col lg:w-64 fixed inset-y-0 left-0 z-30',
          'bg-[#080B14]/75 backdrop-blur-2xl border-r border-white/10 shadow-glass-lg',
          className
        )}
      >
        {/* Top Highlight line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Brand & Role Header */}
        <div className="p-5 border-b border-white/10 space-y-3">
          {brand}
          {roleBadge && <div className="pt-1">{roleBadge}</div>}
        </div>

        {/* Navigation list */}
        {renderNavList()}

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02]">
          {user && (
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/20">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-medium text-white truncate">{user.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
              </div>
            </div>
          )}
          <GlassButton
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="w-full text-slate-300 hover:text-rose-400 hover:border-rose-500/30 justify-start"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Sign Out
          </GlassButton>
        </div>
      </aside>

      {/* 2. Mobile Drawer with Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { x: '-100%' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative flex-1 flex flex-col max-w-xs w-full bg-[#080B14]/95 backdrop-blur-2xl border-r border-white/15 shadow-2xl"
            >
              {/* Close Button */}
              <div className="p-4 flex items-center justify-between border-b border-white/10">
                <div className="flex-1">{brand}</div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {roleBadge && <div className="px-4 py-2 border-b border-white/5">{roleBadge}</div>}

              {renderNavList()}

              {/* Mobile Footer */}
              <div className="p-4 border-t border-white/10 bg-white/[0.02]">
                {user && (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-medium text-white truncate">{user.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                    </div>
                  </div>
                )}
                <GlassButton
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
                  className="w-full text-slate-300 hover:text-rose-400"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Sign Out
                </GlassButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlassSidebar;
