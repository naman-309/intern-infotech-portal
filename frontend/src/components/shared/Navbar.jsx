import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { GlassButton } from '../ui/GlassButton';
import {
  Code2,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { MagneticButton } from '../motion/MagneticButton';
import { DevCreditsModal } from './DevCreditsModal';
import { cn } from '../../lib/utils';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  // Scroll detection for transparent -> glass transition & compaction
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'TEACHER') return '/teacher';
    return '/student';
  };

  const navLinks = [
    { label: 'Courses', href: '/courses' },
    { label: 'Instructors', href: '/about#instructors' },
    { label: 'Placements', href: '/success-stories' },
    { label: 'Offline Campus', href: '/about#campus' },
    { label: 'Contact', href: '/contact' },
  ];

  const isLinkActive = (href) => {
    const [path, hash] = href.split('#');
    if (hash) {
      return location.pathname === path && location.hash === `#${hash}`;
    }
    return location.pathname === path && !location.hash;
  };

  return (
    <motion.nav
      initial={false}
      animate={
        prefersReducedMotion
          ? undefined
          : {
              backgroundColor: isScrolled
                ? 'rgba(5, 7, 13, 0.88)'
                : 'rgba(5, 7, 13, 0.45)',
              backdropFilter: isScrolled ? 'blur(24px)' : 'blur(12px)',
              borderBottomColor: isScrolled
                ? 'rgba(255, 255, 255, 0.12)'
                : 'rgba(255, 255, 255, 0.05)',
              boxShadow: isScrolled
                ? '0 12px 36px -4px rgba(0, 0, 0, 0.7), 0 0 20px rgba(6, 182, 212, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
                : 'none',
            }
      }
      transition={{ duration: 0.25 }}
      className="sticky top-0 z-40 w-full border-b transition-colors select-none"
    >
      {/* Specular Inner Top Highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/25 via-white/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            'flex items-center justify-between transition-all duration-300',
            isScrolled ? 'h-16' : 'h-18 sm:h-20'
          )}
        >
          {/* LEFT: Intern Infotech Logo with Micro-Animation */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <motion.div
              whileHover={{ scale: 1.06, rotate: [0, -2, 2, 0] }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 border border-white/20"
            >
              <Code2 className="w-5 h-5" />
              <div className="absolute inset-0 rounded-xl bg-indigo-400/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
            <div>
              <span className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                INTERN{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                  INFOTECH
                </span>
              </span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                Software Engineering Academy
              </span>
            </div>
          </Link>

          {/* CENTER: Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);

              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={cn(
                    'relative px-3 py-1.5 rounded-xl text-xs xl:text-sm font-medium transition-all duration-200',
                    active
                      ? 'text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  )}
                >
                  <span className="relative z-10">{link.label}</span>
                  {active && (
                    <motion.div
                      layoutId="navbar-active-pill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/[0.08] to-cyan-500/[0.08] border border-cyan-400/20 shadow-glass-sm"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* RIGHT: Developers Chip + Admission + Portal Login */}
          <div className="hidden md:flex items-center gap-2.5 sm:gap-3">
            {/* 1. DEVELOPERS CHIP */}
            <motion.div
              onClick={() => setCreditsOpen(true)}
              whileHover={prefersReducedMotion ? undefined : { scale: 1.05, y: -1 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              title="Project Lead & Developer: Mayank Patidar (Dev@nkKR)"
              className="relative hidden xl:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-cyan-500/25 hover:border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.12)] backdrop-blur-md cursor-pointer transition-all duration-300 group"
            >
              {/* Cyan Glow Layer */}
              <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-sky-500/10 opacity-60 group-hover:opacity-100 transition-opacity" />

              {/* Status Dot with Glow Pulse */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              </span>

              {/* Chip Label */}
              <span className="relative z-10 text-[11px] font-mono tracking-tight text-slate-300 flex items-center gap-1 select-none">
                <span className="text-slate-400">Developers:</span>
                <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-200 bg-clip-text text-transparent font-semibold">
                  Dev@nkKR ✨
                </span>
              </span>
            </motion.div>

            {/* 2. ADMISSION BUTTON */}
            <Link to="/register-student">
              <MagneticButton>
                <motion.button
                  type="button"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.03, y: -1 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="relative inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium select-none overflow-hidden transition-all duration-200 bg-cyan-950/30 hover:bg-cyan-500/15 text-cyan-200 hover:text-white border border-cyan-400/35 hover:border-cyan-400/70 shadow-[0_0_15px_rgba(6,182,212,0.18)] backdrop-blur-md cursor-pointer"
                >
                  {/* Top Inner Specular Highlight */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
                  <GraduationCap className="w-4 h-4 text-cyan-300" />
                  <span>Admission</span>
                </motion.button>
              </MagneticButton>
            </Link>

            {/* 3. PORTAL LOGIN BUTTON */}
            <Link to={isAuthenticated ? getDashboardPath() : '/login'}>
              <MagneticButton>
                <motion.button
                  type="button"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.03, y: -1 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="relative inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold select-none overflow-hidden transition-all duration-200 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:via-indigo-400 hover:to-cyan-400 text-white border border-white/25 shadow-lg shadow-indigo-600/30 hover:shadow-[0_0_24px_rgba(99,102,241,0.5)] backdrop-blur-md cursor-pointer"
                >
                  {/* Top Specular Highlight */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
                  <span>{isAuthenticated ? 'Portal Dashboard' : 'Portal Login'}</span>
                </motion.button>
              </MagneticButton>
            </Link>

            {/* If Authenticated: Sign Out Option */}
            {isAuthenticated && (
              <MagneticButton>
                <GlassButton
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 px-2.5"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </GlassButton>
              </MagneticButton>
            )}
          </div>

          {/* MOBILE / TABLET MENU TOGGLE BUTTON */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Compact Admission link on tablet */}
            <Link to="/register-student" className="hidden sm:inline-flex md:hidden">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-cyan-950/40 text-cyan-200 border border-cyan-400/30"
              >
                Admission
              </motion.button>
            </Link>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DRAWER WITH ANIMATE PRESENCE */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden border-b border-white/10 bg-[#05070D]/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 overflow-hidden shadow-2xl"
          >
            {/* Developers Chip for Mobile */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-cyan-500/20 shadow-glass-sm"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                </span>
                <span className="text-xs font-mono text-slate-300">
                  Developers: <span className="text-sky-300 font-semibold">Dev@nkKR ✨</span>
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Mayank Patidar</span>
            </motion.div>

            {/* Navigation Links */}
            <div className="space-y-1">
              {navLinks.map((link, idx) => {
                const active = isLinkActive(link.href);
                return (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                        active
                          ? 'bg-gradient-to-r from-indigo-600/20 to-cyan-500/20 text-cyan-200 border border-cyan-500/30 font-semibold'
                          : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                      )}
                    >
                      <span>{link.label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Mobile Actions: Admission + Portal Login */}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
              <Link to="/register-student" onClick={() => setMobileMenuOpen(false)}>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium bg-cyan-950/35 hover:bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                >
                  <GraduationCap className="w-4 h-4 text-cyan-300" />
                  <span>Admission</span>
                </motion.button>
              </Link>

              <Link
                to={isAuthenticated ? getDashboardPath() : '/login'}
                onClick={() => setMobileMenuOpen(false)}
              >
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-600/30 border border-white/20"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
                  <span>{isAuthenticated ? 'Portal Dashboard' : 'Portal Login'}</span>
                </motion.button>
              </Link>

              {isAuthenticated && (
                <GlassButton
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full text-rose-400 hover:border-rose-500/30"
                >
                  Sign Out
                </GlassButton>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Developers & Team Attribution Modal */}
      <DevCreditsModal isOpen={creditsOpen} onClose={() => setCreditsOpen(false)} />
    </motion.nav>
  );
};

export default Navbar;
