import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  ClipboardList,
  Send,
  Edit3,
  Trash2,
  Calendar,
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminExams = () => {
  const queryClient = useQueryClient();

  // Selected date defaults to today (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [studentMarks, setStudentMarks] = useState({});
  const [editingSessionId, setEditingSessionId] = useState(null);

  // 1. Fetch all published courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['adminCoursesList'],
    queryFn: () => api.get('/courses'),
  });

  const courses = coursesData?.data || [];

  // Auto-select first course when courses load if none selected
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  // 2. Fetch session roster (students & any existing marks) for selected Date & Course
  const {
    data: sessionData,
    isLoading: sessionLoading,
    isFetching: sessionFetching,
  } = useQuery({
    queryKey: ['mockInterviewSession', selectedCourseId, selectedDate],
    queryFn: () =>
      api.get(`/mock-interviews/session?courseId=${selectedCourseId}&date=${selectedDate}`),
    enabled: !!selectedCourseId && !!selectedDate,
  });

  const session = sessionData?.data;
  const enrolledStudents = session?.students || [];

  // Sync state when session data changes
  useEffect(() => {
    if (session) {
      const marksMap = {};
      enrolledStudents.forEach((st) => {
        marksMap[st.studentId] = {
          marks: st.marksObtained !== null && st.marksObtained !== undefined ? st.marksObtained : '',
          feedback: st.feedback || '',
        };
      });
      setStudentMarks(marksMap);

      if (session.mockInterview) {
        setEditingSessionId(session.mockInterview.id);
        setSessionTitle(session.mockInterview.title);
      } else {
        setEditingSessionId(null);
        const course = courses.find((c) => c.id === selectedCourseId);
        setSessionTitle(course ? `${course.title} Mock Interview` : 'Weekly Mock Interview');
      }
    }
  }, [session, selectedCourseId, courses]);

  // 3. Fetch past mock interview sessions for audit / editing
  const { data: pastInterviewsData, isLoading: pastLoading } = useQuery({
    queryKey: ['pastMockInterviews'],
    queryFn: () => api.get('/mock-interviews'),
  });

  const pastInterviews = pastInterviewsData?.data || [];

  // Handle Mark Change
  const handleMarkChange = (studentId, value) => {
    if (value === '') {
      setStudentMarks((prev) => ({
        ...prev,
        [studentId]: { ...prev[studentId], marks: '' },
      }));
      return;
    }

    const num = parseFloat(value);
    if (isNaN(num)) return;

    // Enforce 0 to 35 bounds
    const bounded = Math.max(0, Math.min(35, num));

    setStudentMarks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], marks: bounded },
    }));
  };

  const handleFeedbackChange = (studentId, value) => {
    setStudentMarks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], feedback: value },
    }));
  };

  // Submit & Publish Mutation
  const saveSessionMutation = useMutation({
    mutationFn: async () => {
      // Build results payload for students who have marks entered
      const results = [];
      Object.entries(studentMarks).forEach(([studentId, data]) => {
        if (data.marks !== '' && data.marks !== null && data.marks !== undefined) {
          results.push({
            studentId,
            marksObtained: parseFloat(data.marks),
            feedback: data.feedback || '',
          });
        }
      });

      if (results.length === 0) {
        throw new Error('Please enter marks for at least one student before publishing.');
      }

      return api.post('/mock-interviews/save', {
        id: editingSessionId || undefined,
        courseId: selectedCourseId,
        date: selectedDate,
        title: sessionTitle || 'Mock Interview Session',
        totalMarks: 35.0,
        results,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockInterviewSession'] });
      queryClient.invalidateQueries({ queryKey: ['pastMockInterviews'] });
      toast.success(
        editingSessionId
          ? 'Mock Interview marks updated and re-published!'
          : 'Mock Interview marks submitted and published successfully!'
      );
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to save mock interview marks');
    },
  });

  // Delete Session Mutation
  const deleteSessionMutation = useMutation({
    mutationFn: (id) => api.delete(`/mock-interviews/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pastMockInterviews'] });
      queryClient.invalidateQueries({ queryKey: ['mockInterviewSession'] });
      toast.success('Mock Interview session deleted');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete session');
    },
  });

  // Edit from history click
  const handleEditPastSession = (item) => {
    const formattedDate = new Date(item.date).toISOString().split('T')[0];
    setSelectedDate(formattedDate);
    setSelectedCourseId(item.courseId);
    setSessionTitle(item.title);
    setEditingSessionId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info(`Loaded session: ${item.title} (${formattedDate})`);
  };

  // Calculate quick stats
  const gradedCount = Object.values(studentMarks).filter(
    (m) => m.marks !== '' && m.marks !== null && m.marks !== undefined
  ).length;

  const totalScoreEntered = Object.values(studentMarks).reduce((acc, curr) => {
    const n = parseFloat(curr.marks);
    return !isNaN(n) ? acc + n : acc;
  }, 0);

  const averageEntered = gradedCount > 0 ? (totalScoreEntered / gradedCount).toFixed(1) : 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-brand-500/10 text-brand-400 text-xs font-mono mb-2">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Simplified Mock Interview System (Total Marks: 35)</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Offline Mock Interviews</h2>
          <p className="text-xs text-slate-400 mt-1">
            Pick a date and course to load enrolled students, enter scores out of 35, and publish instant progress reports.
          </p>
        </div>
      </div>

      {/* STEP 1: Date & Course Selector Card */}
      <Card className="border-brand-500/30 bg-slate-900/80 shadow-xl">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Date Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                Select Date
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="font-mono text-xs bg-slate-950 border-slate-800 text-white"
              />
            </div>

            {/* Course Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                Select Course
              </label>
              <Select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="text-xs bg-slate-950 border-slate-800 text-white"
                disabled={coursesLoading}
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </Select>
            </div>

            {/* Session Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-brand-400" />
                Session Title
              </label>
              <Input
                type="text"
                placeholder="e.g. JavaScript & React Mock"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="text-xs bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </div>

          {/* Existing Session Alert Banner */}
          {editingSessionId && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
              <span className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                Existing Mock Interview session found for this Date & Course. Modifying marks will update published results.
              </span>
              <span className="font-mono text-[11px] bg-amber-500/20 px-2 py-0.5 rounded">
                Editing Mode
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* STEP 2: Enrolled Students Grading Table */}
      <Card className="border-slate-800 bg-slate-900/60 shadow-xl overflow-hidden">
        <CardHeader className="bg-slate-950/80 border-b border-slate-800 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-brand-400" />
            <div>
              <CardTitle className="text-base text-white">
                Enrolled Students ({enrolledStudents.length})
              </CardTitle>
              <p className="text-xs text-slate-400">
                Score each candidate out of 35 marks. Changes are auto-calculated in real time.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Graded:{' '}
              <span className="font-bold text-brand-400">
                {gradedCount} / {enrolledStudents.length}
              </span>
            </div>
            {gradedCount > 0 && (
              <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                Avg Score:{' '}
                <span className="font-bold text-emerald-400">{averageEntered} / 35</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {sessionLoading || sessionFetching ? (
            <div className="p-12 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : enrolledStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No active students are currently enrolled in this course. Enroll students via Student Management or Batches.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">#</th>
                    <th className="p-4">Student</th>
                    <th className="p-4">Enrollment ID</th>
                    <th className="p-4">Batch</th>
                    <th className="p-4 w-44">Marks Obtained (Out of 35)</th>
                    <th className="p-4 w-28 text-center">Score %</th>
                    <th className="p-4">Mentor Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {enrolledStudents.map((st, idx) => {
                    const currentData = studentMarks[st.studentId] || { marks: '', feedback: '' };
                    const markNum = parseFloat(currentData.marks);
                    const hasMark = !isNaN(markNum);
                    const percentage = hasMark
                      ? Math.round((markNum / 35.0) * 100 * 10) / 10
                      : null;

                    return (
                      <tr key={st.studentId} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="p-4">
                          <div className="font-bold text-white font-sans">
                            {st.user?.firstName} {st.user?.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{st.user?.email}</div>
                        </td>
                        <td className="p-4 font-mono text-brand-400 font-semibold">
                          {st.enrollmentNumber}
                        </td>
                        <td className="p-4 font-mono text-slate-300">
                          {st.batch?.name || 'General'}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="35"
                              step="0.5"
                              placeholder="0 - 35"
                              value={currentData.marks}
                              onChange={(e) => handleMarkChange(st.studentId, e.target.value)}
                              className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 font-mono text-center"
                            />
                            <span className="text-slate-400 text-xs font-mono font-semibold">/ 35</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          {hasMark ? (
                            <Badge
                              variant={
                                percentage >= 75
                                  ? 'success'
                                  : percentage >= 50
                                  ? 'primary'
                                  : 'warning'
                              }
                              className="font-mono text-xs px-2.5 py-0.5"
                            >
                              {percentage}%
                            </Badge>
                          ) : (
                            <span className="text-slate-600 text-xs">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          <input
                            type="text"
                            placeholder="Optional mentor remarks or areas of improvement..."
                            value={currentData.feedback}
                            onChange={(e) => handleFeedbackChange(st.studentId, e.target.value)}
                            className="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 font-sans"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Bottom Action Bar */}
          {enrolledStudents.length > 0 && (
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Ready to publish scores for{' '}
                <span className="font-bold text-white">{gradedCount}</span> of{' '}
                <span className="font-bold text-white">{enrolledStudents.length}</span> students.
              </div>

              <Button
                variant="primary"
                size="md"
                isLoading={saveSessionMutation.isPending}
                onClick={() => saveSessionMutation.mutate()}
                className="gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 shadow-lg shadow-brand-500/20"
                disabled={gradedCount === 0}
              >
                <Send className="w-4 h-4" />
                {editingSessionId ? 'Update & Re-Publish Marks' : 'Submit & Publish'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* STEP 3: Past Mock Interviews Archive & Quick Edit */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-brand-400" />
            Past Mock Interview Sessions ({pastInterviews.length})
          </h3>
          <p className="text-xs text-slate-400">
            Click "Edit" on any session to adjust marks and re-publish.
          </p>
        </div>

        {pastLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : pastInterviews.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-xs">
            No mock interview sessions recorded yet.
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Course Program</th>
                  <th className="p-4">Session Title</th>
                  <th className="p-4">Scale</th>
                  <th className="p-4">Students Graded</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {pastInterviews.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 whitespace-nowrap text-white font-semibold">
                      {formatDate(item.date)}
                    </td>
                    <td className="p-4 text-brand-400 font-sans font-medium">
                      {item.course?.title || 'Course'}
                    </td>
                    <td className="p-4 text-slate-200 font-sans">{item.title}</td>
                    <td className="p-4 font-bold text-slate-400">35 Marks</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-emerald-400">
                        {item._count?.results || 0} Graded
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPastSession(item)}
                          className="text-xs gap-1.5 border-brand-500/30 text-brand-400 hover:bg-brand-500/10 font-sans"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit Marks
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this session?')) {
                              deleteSessionMutation.mutate(item.id);
                            }
                          }}
                          className="text-xs text-red-400 hover:bg-red-500/10 p-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
