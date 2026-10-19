import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/shared/Navbar';
import { Footer } from './components/shared/Footer';
import { DashboardLayout } from './components/shared/DashboardLayout';

// Public Pages
import { HomePage } from './features/public/HomePage';

// Auth Pages
import { LoginPage } from './features/auth/LoginPage';
import { StudentRegisterPage } from './features/auth/StudentRegisterPage';
import { TeacherRegisterPage } from './features/auth/TeacherRegisterPage';
import { VerifyEmailPage } from './features/auth/VerifyEmailPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';

// Student Pages
import { StudentDashboard } from './features/student/StudentDashboard';
import { StudentCourses } from './features/student/StudentCourses';
import { StudentResults } from './features/student/StudentResults';
import { StudentAnnouncements } from './features/student/StudentAnnouncements';
import { StudentFees } from './features/student/StudentFees';
import { StudentProfile } from './features/student/StudentProfile';

// Teacher Pages
import { TeacherDashboard } from './features/teacher/TeacherDashboard';
import { TeacherBatches } from './features/teacher/TeacherBatches';
import { TeacherExams } from './features/teacher/TeacherExams';
import { TeacherAnnouncements } from './features/teacher/TeacherAnnouncements';
import { TeacherPendingRequests } from './features/teacher/TeacherPendingRequests';
import { TeacherProfile } from './features/teacher/TeacherProfile';

// Admin Pages
import { AdminDashboard } from './features/admin/AdminDashboard';
import { AdminRegistrations } from './features/admin/AdminRegistrations';
import { AdminEligibleEmails } from './features/admin/AdminEligibleEmails';
import { AdminStudents } from './features/admin/AdminStudents';
import { AdminTeachers } from './features/admin/AdminTeachers';
import { AdminCourses } from './features/admin/AdminCourses';
import { AdminBatches } from './features/admin/AdminBatches';
import { AdminExams } from './features/admin/AdminExams';
import { AdminAnnouncements } from './features/admin/AdminAnnouncements';
import { AdminSuccessStories } from './features/admin/AdminSuccessStories';
import { AdminFees } from './features/admin/AdminFees';
import { AdminAuditLogs } from './features/admin/AdminAuditLogs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 20, // 20 mins high-performance client cache
    },
  },
});

// Role-Protected Route Guard
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // If wrong role, redirect to appropriate role portal
    if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user?.role === 'TEACHER') return <Navigate to="/teacher" replace />;
    return <Navigate to="/student" replace />;
  }

  return <Outlet />;
};

// Public Website Layout Wrapper
const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster richColors position="top-right" theme="dark" />
          <Routes>
            {/* Public Website */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
            </Route>

            {/* Authentication Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register-student" element={<StudentRegisterPage />} />
            <Route path="/register-teacher" element={<TeacherRegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Student Protected Portal */}
            <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
              <Route element={<DashboardLayout role="STUDENT" />}>
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/student/courses" element={<StudentCourses />} />
                <Route path="/student/results" element={<StudentResults />} />
                <Route path="/student/announcements" element={<StudentAnnouncements />} />
                <Route path="/student/fees" element={<StudentFees />} />
                <Route path="/student/profile" element={<StudentProfile />} />
              </Route>
            </Route>

            {/* Teacher Protected Dashboard */}
            <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
              <Route element={<DashboardLayout role="TEACHER" />}>
                <Route path="/teacher" element={<TeacherDashboard />} />
                <Route path="/teacher/batches" element={<TeacherBatches />} />
                <Route path="/teacher/exams" element={<TeacherExams />} />
                <Route path="/teacher/announcements" element={<TeacherAnnouncements />} />
                <Route path="/teacher/requests" element={<TeacherPendingRequests />} />
                <Route path="/teacher/profile" element={<TeacherProfile />} />
              </Route>
            </Route>

            {/* Admin Protected Dashboard */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route element={<DashboardLayout role="ADMIN" />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/registrations" element={<AdminRegistrations />} />
                <Route path="/admin/eligible-emails" element={<AdminEligibleEmails />} />
                <Route path="/admin/students" element={<AdminStudents />} />
                <Route path="/admin/teachers" element={<AdminTeachers />} />
                <Route path="/admin/courses" element={<AdminCourses />} />
                <Route path="/admin/batches" element={<AdminBatches />} />
                <Route path="/admin/exams" element={<AdminExams />} />
                <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                <Route path="/admin/success-stories" element={<AdminSuccessStories />} />
                <Route path="/admin/fees" element={<AdminFees />} />
                <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
              </Route>
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
