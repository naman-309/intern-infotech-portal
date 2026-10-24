import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import {
  Code2,
  LayoutDashboard,
  BookOpen,
  Award,
  Bell,
  CreditCard,
  User,
  Users,
  GraduationCap,
  Calendar,
  ClipboardList,
  CheckSquare,
  FileCheck2,
  History,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { GlassBadge } from '../ui/GlassBadge';
import { GlassButton } from '../ui/GlassButton';
import { PageTransition } from '../motion/PageTransition';
import { AnimatedBackground } from '../motion/AnimatedBackground';
import { DevBadge, DevCreditsModal } from './DevCreditsModal';
import { cn } from '../../lib/utils';

export const DashboardLayout = ({ role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  // Close sidebar on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  // Close sidebar on path change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Nav configurations based on role
  const studentNavItems = [
    { label: 'Overview', path: '/student', icon: LayoutDashboard, exact: true },
    { label: 'Courses & Batches', path: '/student/courses', icon: BookOpen },
    { label: 'Offline Exam Results', path: '/student/results', icon: Award },
    { label: 'Announcements', path: '/student/announcements', icon: Bell },
    { label: 'Fee Information', path: '/student/fees', icon: CreditCard },
    { label: 'My Profile', path: '/student/profile', icon: User },
  ];

  const teacherNavItems = [
    { label: 'Overview', path: '/teacher', icon: LayoutDashboard, exact: true },
    { label: 'Assigned Batches', path: '/teacher/batches', icon: Calendar },
    { label: 'Offline Examinations', path: '/teacher/exams', icon: ClipboardList },
    { label: 'Announcements', path: '/teacher/announcements', icon: Bell },
    { label: 'Pending Student Requests', path: '/teacher/requests', icon: FileCheck2 },
    { label: 'Teacher Profile', path: '/teacher/profile', icon: User },
  ];

  const adminNavItems = [
    { label: 'Executive Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Registration Requests', path: '/admin/registrations', icon: FileCheck2 },
    { label: 'Eligible Students List', path: '/admin/eligible-emails', icon: CheckSquare },
    { label: 'Student Management', path: '/admin/students', icon: GraduationCap },
    { label: 'Teacher Management', path: '/admin/teachers', icon: Users },
    { label: 'Courses & Curriculum', path: '/admin/courses', icon: BookOpen },
    { label: 'Batches & Rosters', path: '/admin/batches', icon: Calendar },
    { label: 'Offline Exams & Results', path: '/admin/exams', icon: ClipboardList },
    { label: 'Announcements', path: '/admin/announcements', icon: Bell },
    { label: 'Fee Tracking', path: '/admin/fees', icon: CreditCard },
    { label: 'Success Stories CMS', path: '/admin/success-stories', icon: Award },
    { label: 'Security & Audit Logs', path: '/admin/audit-logs', icon: History },
  ];

  let navItems = studentNavItems;
  let roleBadge = <GlassBadge variant="primary">Student Portal</GlassBadge>;

  if (role === 'TEACHER') {
    navItems = teacherNavItems;
    roleBadge = <GlassBadge variant="warning">Faculty Dashboard</GlassBadge>;
  } else if (role === 'ADMIN') {
    navItems = adminNavItems;
    roleBadge = <GlassBadge variant="danger">Administration</GlassBadge>;
  }

  const renderNavList = () => (
    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path);

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all select-none group',
              isActive
                ? 'text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="dashboard-active-pill"
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
    <div className="min-h-screen bg-[#05070D] text-slate-100 flex flex-col md:flex-row relative overflow-x-hidden">
      {/* Background Ambience */}
      <AnimatedBackground />

      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#080B14]/85 backdrop-blur-xl border-b border-white/10 z-30">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">INTERN INFOTECH</span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/[0.04] border border-white/10"
          aria-label="Toggle navigation drawer"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Floating Glass Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#080B14]/75 backdrop-blur-2xl border-r border-white/10 flex-col shrink-0 relative z-30 shadow-glass-lg">
        {/* Specular line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Brand / Logo */}
        <div className="p-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 border border-white/20"
            >
              <Code2 className="w-5 h-5" />
            </motion.div>
            <div>
              <span className="font-bold text-white tracking-tight text-sm flex items-center gap-1">
                INTERN <span className="bg-gradient-to-r from-indigo-400 to-sky-300 bg-clip-text text-transparent">INFOTECH</span>
              </span>
              <span className="block text-[9px] text-slate-400 font-mono tracking-widest uppercase">
                Engineering Academy
              </span>
            </div>
          </Link>
        </div>

        {/* Current User Summary Card */}
        <div className="p-3.5 mx-3 my-3 rounded-xl bg-white/[0.03] border border-white/10 shadow-glass-sm flex items-center gap-3">
          <img
            src={
              user?.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || user?.firstName || 'User'
              )}&background=4f46e5&color=fff`
            }
            alt={user?.name || user?.firstName}
            className="w-10 h-10 rounded-lg object-cover border border-white/15 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-white truncate">
              {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Portal User'}
            </h4>
            <div className="mt-1">{roleBadge}</div>
          </div>
        </div>

        {/* Nav Links */}
        {renderNavList()}

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2 bg-white/[0.01]">
          <div className="pb-1">
            <DevBadge onClick={() => setCreditsOpen(true)} className="w-full justify-center" />
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            <span>Public Website</span>
          </Link>
          <GlassButton
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full text-slate-300 hover:text-rose-400 hover:border-rose-500/30 justify-start"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Sign Out
          </GlassButton>
        </div>
      </aside>

      {/* Mobile Drawer with AnimatePresence */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.aside
              initial={prefersReducedMotion ? { opacity: 0 } : { x: '-100%' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-64 max-w-xs bg-[#080B14]/95 backdrop-blur-2xl border-r border-white/15 flex flex-col shadow-2xl z-50"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white text-sm">INTERN INFOTECH</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  aria-label="Close navigation drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 mx-3 my-2 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5">
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-white truncate">
                    {user?.name || user?.firstName || 'User'}
                  </h4>
                  <div className="mt-1">{roleBadge}</div>
                </div>
              </div>

              {renderNavList()}

              <div className="p-4 border-t border-white/10 space-y-2 bg-white/[0.02]">
                <Link
                  to="/"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>Public Website</span>
                </Link>
                <GlassButton
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full text-slate-300 hover:text-rose-400"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Sign Out
                </GlassButton>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        {/* Glass Topbar */}
        <header className="sticky top-0 z-20 h-14 bg-[#05070D]/80 backdrop-blur-xl border-b border-white/10 px-6 flex items-center justify-between shadow-glass-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Portal</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-medium capitalize">{role.toLowerCase()} Area</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 hidden sm:inline-block font-mono">
              Offline Campus: Electronic City, Bengaluru
            </span>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-mono font-semibold tracking-wider">SECURE LINK</span>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </main>

      <DevCreditsModal isOpen={creditsOpen} onClose={() => setCreditsOpen(false)} />
    </div>
  );
};

export default DashboardLayout;
