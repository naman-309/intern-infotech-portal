import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export const GlassNavbar = ({
  logo,
  links = [],
  actions,
  mobileActions,
  className,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <motion.header
      initial={false}
      animate={
        prefersReducedMotion
          ? undefined
          : {
              backgroundColor: isScrolled
                ? 'rgba(5, 7, 13, 0.82)'
                : 'rgba(5, 7, 13, 0.45)',
              backdropFilter: isScrolled ? 'blur(20px)' : 'blur(10px)',
              borderBottomColor: isScrolled
                ? 'rgba(255, 255, 255, 0.12)'
                : 'rgba(255, 255, 255, 0.05)',
              boxShadow: isScrolled
                ? '0 12px 36px -4px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
                : 'none',
            }
      }
      transition={{ duration: 0.25 }}
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-colors select-none',
        className
      )}
    >
      {/* Specular Inner Highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <div className="flex-shrink-0">{logo}</div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {links.map((link) => {
              const isActive = location.pathname === link.href;

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'relative px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  )}
                >
                  <span className="relative z-10">{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="glass-nav-active-pill"
                      className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/15 shadow-glass-sm"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">{actions}</div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-b border-white/10 bg-[#05070D]/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-2 overflow-hidden shadow-2xl"
          >
            {links.map((link, idx) => {
              const isActive = location.pathname === link.href;
              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Link
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                    )}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </Link>
                </motion.div>
              );
            })}

            {mobileActions && (
              <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
                {typeof mobileActions === 'function'
                  ? mobileActions(() => setMobileMenuOpen(false))
                  : mobileActions}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default GlassNavbar;
