import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';
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
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export const DashboardLayout = ({ role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Nav configurations based on role
  const studentNavItems = [
    { label: 'Overview', path: '/student', icon: LayoutDashboard, exact: true },
    { label: 'Courses & Batches', path: '/student/courses', icon: BookOpen },
    { label: 'Progress Report', path: '/student/results', icon: Award },
    { label: 'Announcements', path: '/student/announcements', icon: Bell },
    { label: 'Fee Information', path: '/student/fees', icon: CreditCard },
    { label: 'My Profile', path: '/student/profile', icon: User },
  ];

  const teacherNavItems = [
    { label: 'Overview', path: '/teacher', icon: LayoutDashboard, exact: true },
    { label: 'Assigned Batches', path: '/teacher/batches', icon: Calendar },
    { label: 'Mock Interviews', path: '/teacher/exams', icon: ClipboardList },
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
    { label: 'Mock Interviews', path: '/admin/exams', icon: ClipboardList },
    { label: 'Announcements', path: '/admin/announcements', icon: Bell },
    { label: 'Fee Tracking', path: '/admin/fees', icon: CreditCard },
    { label: 'Success Stories CMS', path: '/admin/success-stories', icon: Award },
    { label: 'Security & Audit Logs', path: '/admin/audit-logs', icon: History },
  ];

  let navItems = studentNavItems;
  let roleBadge = <Badge variant="primary">Student Portal</Badge>;

  if (role === 'TEACHER') {
    navItems = teacherNavItems;
    roleBadge = <Badge variant="warning">Faculty Dashboard</Badge>;
  } else if (role === 'ADMIN') {
    navItems = adminNavItems;
    roleBadge = <Badge variant="danger">Administration</Badge>;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <Link to="/" className="flex items-center gap-2">
          <Logo textClassName="text-base" isDark={true} />
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900/95 backdrop-blur-md border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="p-5 border-b border-slate-800/80">
          <Link to="/" className="block">
            <Logo textClassName="text-lg" isDark={true} />
          </Link>
        </div>

        {/* Current User Summary */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-3">
          <img
            src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'User')}&background=4f46e5&color=fff`}
            alt={user?.firstName}
            className="w-10 h-10 rounded-lg object-cover border border-slate-700"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-200 truncate">
              {user?.firstName} {user?.lastName}
            </h4>
            <div className="mt-1">{roleBadge}</div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            <span>Public Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-20 h-14 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Portal</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-200 font-medium capitalize">{role.toLowerCase()} Area</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 hidden sm:inline-block font-mono">
              Offline Center: Geeta Bhawan, Indore
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-500" title="Connected to Academic Gateway"></div>
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
