import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import {
  Code2,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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

  return (
    <nav className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
                INTERN <span className="text-indigo-400">INFOTECH</span>
              </span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                Software Engineering Academy
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/#courses" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Courses
            </a>
            <a href="/#curriculum" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Curriculum
            </a>
            <a href="/#success-stories" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Placements
            </a>
            <a href="/#about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Offline Campus
            </a>
            <a href="/#contact" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Contact
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to={getDashboardPath()}>
                  <Button variant="primary" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Portal Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-slate-400 hover:text-rose-400">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to="/register-student">
                  <Button variant="outline" size="sm" className="border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10">
                    <GraduationCap className="w-4 h-4 mr-1.5" />
                    Request Admission
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="primary" size="sm">
                    Portal Login
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-3">
          <a
            href="/#courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-900"
          >
            Courses
          </a>
          <a
            href="/#curriculum"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-900"
          >
            Curriculum
          </a>
          <a
            href="/#success-stories"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-900"
          >
            Placements
          </a>
          <a
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-900"
          >
            Offline Campus
          </a>
          <a
            href="/#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-900"
          >
            Contact
          </a>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Go to Portal Dashboard
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleLogout} className="w-full text-rose-400">
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/register-student" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-indigo-300 border-indigo-500/40">
                    Request Admission
                  </Button>
                </Link>
                <Link to="/register-teacher" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-slate-400 text-xs">
                    Apply as Instructor
                  </Button>
                </Link>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Portal Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
