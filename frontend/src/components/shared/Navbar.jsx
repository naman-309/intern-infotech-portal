import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Logo } from './Logo';
import { DevBadge, DevCreditsModal } from './DevCreditsModal';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  GraduationCap,
  MapPin,
  Phone,
} from 'lucide-react';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
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
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group py-1">
              <Logo textClassName="text-lg sm:text-xl" isDark={true} />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <a href="/#courses" className="text-xs font-medium text-slate-300 hover:text-sky-400 transition-colors">
                Courses
              </a>
              <a href="/#instructors" className="text-xs font-medium text-slate-300 hover:text-sky-400 transition-colors">
                Instructors
              </a>
              <a href="/#success-stories" className="text-xs font-medium text-slate-300 hover:text-sky-400 transition-colors">
                Placements
              </a>
              <a href="/#offline-campus" className="text-xs font-medium text-slate-300 hover:text-sky-400 transition-colors">
                Offline Campus
              </a>
              <a href="/#contact" className="text-xs font-medium text-slate-300 hover:text-sky-400 transition-colors">
                Contact
              </a>
            </div>

            {/* Desktop Actions + Dev Credits */}
            <div className="hidden md:flex items-center gap-3">
              <DevBadge onClick={() => setCreditsOpen(true)} />

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link to={getDashboardPath()}>
                    <Button size="sm" className="h-8 text-xs gap-1.5 bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 font-medium">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="h-8 px-2 text-slate-400 hover:text-rose-400 hover:border-rose-500/40"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/register-student">
                    <Button variant="outline" size="sm" className="h-8 text-xs border-sky-500/40 text-sky-400 hover:bg-sky-500/10">
                      <GraduationCap className="w-3.5 h-3.5 mr-1" />
                      Admission
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="sm" className="h-8 text-xs bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 font-medium">
                      Portal Login
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions & Menu Toggle */}
            <div className="flex md:hidden items-center gap-2">
              <DevBadge onClick={() => setCreditsOpen(true)} />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-150">
              <div className="flex flex-col space-y-1.5">
                <a
                  href="/#courses"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900"
                >
                  Courses
                </a>
                <a
                  href="/#instructors"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900"
                >
                  Instructors
                </a>
                <a
                  href="/#success-stories"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900"
                >
                  Placements
                </a>
                <a
                  href="/#offline-campus"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900"
                >
                  Offline Campus
                </a>
                <a
                  href="/#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900"
                >
                  Contact
                </a>
              </div>

              <div className="pt-3 border-t border-slate-900 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full h-8 text-xs justify-center bg-sky-500 hover:bg-sky-600 text-white">
                        <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
                        Portal Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full h-8 text-xs justify-center text-slate-400 hover:text-rose-400"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-1.5" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full h-8 text-xs justify-center bg-sky-500 hover:bg-sky-600 text-white">
                        Portal Login
                      </Button>
                    </Link>
                    <Link to="/register-student" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full h-8 text-xs justify-center border-sky-500/40 text-sky-400">
                        Request Admission
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                  <span className="truncate">Geeta Bhawan, Indore</span>
                </div>
                <a href="tel:+919826064440" className="flex items-center gap-1 font-mono text-sky-400">
                  <Phone className="w-3 h-3" />
                  <span>+91 98260 64440</span>
                </a>
              </div>
            </div>
          )}
        </nav>
      </header>
      <DevCreditsModal isOpen={creditsOpen} onClose={() => setCreditsOpen(false)} />
    </>
  );
};
