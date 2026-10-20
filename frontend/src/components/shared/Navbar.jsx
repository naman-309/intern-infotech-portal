import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Logo } from './Logo';
import { DevBadge, DevCreditsModal } from './DevCreditsModal';
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  GraduationCap,
  MapPin,
  Phone,
  Clock,
  Sparkles,
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
      <header className="sticky top-0 z-40 w-full">
        {/* Top Contact Bar with Operating Hours */}
        <div className="hidden sm:block bg-slate-950/95 border-b border-slate-900 text-[11px] text-slate-400 py-1.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4 truncate">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">404, 4th Floor, Vibrant Business Tower, Geeta Bhawan, Indore</span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Institute Hours: <strong>7:00 AM – 7:00 PM</strong></span>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0 pl-4 font-mono">
              <a href="tel:+919826064440" className="flex items-center gap-1.5 text-slate-300 hover:text-sky-400 transition-colors">
                <Phone className="w-3.5 h-3.5 text-sky-400" />
                <span>+91 98260 64440</span>
              </a>
              <span className="text-slate-700">|</span>
              <DevBadge onClick={() => setCreditsOpen(true)} />
            </div>
          </div>
        </div>

        <nav className="w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo prominently displayed */}
              <Link to="/" className="flex items-center gap-2 group py-1">
                <Logo textClassName="text-xl sm:text-2xl" isDark={true} />
              </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-7">
              <a href="/#courses" className="text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors">
                Courses
              </a>
              <a href="/#instructors" className="text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors">
                Instructors
              </a>
              <a href="/#success-stories" className="text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors">
                Placements
              </a>
              <a href="/#offline-campus" className="text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors">
                Offline Campus
              </a>
              <a href="/#contact" className="text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors">
                Contact
              </a>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link to={getDashboardPath()}>
                    <Button size="sm" className="gap-2 bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20 font-medium">
                      <LayoutDashboard className="w-4 h-4" />
                      Portal Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-slate-400 hover:text-rose-400 hover:border-rose-500/40">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Link to="/register-student">
                    <Button variant="outline" size="sm" className="border-sky-500/40 text-sky-400 hover:bg-sky-500/10">
                      <GraduationCap className="w-4 h-4 mr-1.5" />
                      Request Admission
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20 font-medium">
                      Portal Login
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <DevBadge onClick={() => setCreditsOpen(true)} />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-2.5">
            <a
              href="/#courses"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900"
            >
              Courses
            </a>
            <a
              href="/#success-stories"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900"
            >
              Placements
            </a>
            <a
              href="/#offline-campus"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900"
            >
              Offline Campus
            </a>
            <a
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900"
            >
              Contact
            </a>
          </div>

          <div className="pt-4 border-t border-slate-900 space-y-2">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-center bg-sky-500 hover:bg-sky-600 text-white">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Portal Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-center text-slate-400 hover:text-rose-400"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-center bg-sky-500 hover:bg-sky-600 text-white">Portal Login</Button>
                </Link>
                <Link to="/register-student" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center border-sky-500/40 text-sky-400">
                    Request Admission
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="pt-3 border-t border-slate-900 space-y-1.5 text-xs text-slate-400">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
              <span>404 Vibrant Business Tower, Geeta Bhawan, Indore</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <a href="tel:+919826064440" className="text-sky-400 hover:text-white transition-colors">
                +91 98260 64440
              </a>
            </div>
          </div>
        </div>
      )}
      </nav>
    </header>
    <DevCreditsModal isOpen={creditsOpen} onClose={() => setCreditsOpen(false)} />
    </>
  );
};
